import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection matrix + per-request CSP nonce.
 *
 * - Public routes: "/", "/login", "/register", "/verify", "/legal/**",
 *   "/jobs/**" (read-only).
 * - Applicant routes: "/dashboard", "/search", "/applications",
 *   "/favorites", "/profile/**", "/onboarding", "/anerkennung", "/visa",
 *   "/cv-upload", "/saved-searches", "/settings", "/company/**".
 * - Employer routes: "/employer/**" — requires role = EMPLOYER.
 * - Admin routes: "/admin/**" — requires role = ADMIN.
 *
 * The session cookie is set by /api/session (see route.ts) whenever the
 * client logs in or refreshes tokens. The cookie never holds a raw JWT
 * so CSRF / XSS can't leak it.
 *
 * CSP: a fresh 128-bit nonce is generated per-request and injected into
 * the response headers. Layouts read it via {@link headers()} and pass it
 * to Script/Style tags. Replaces the old static `'unsafe-inline'` policy
 * — XSS can no longer execute inline scripts. The legacy header rule in
 * next.config.ts is overridden here because it ran with a static policy.
 */

const COOKIE_NAME = "bewerbi.session";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/favicon.ico",
];
const PUBLIC_PREFIXES = [
  "/_next/",
  "/api/session",
  "/api/v1/auth/",
  "/api/v1/i18n/",
  "/api/v1/professions",
  "/api/v1/reference-data/",
  "/api/v1/companies",    // public read
  "/api/v1/jobs",         // public read
  "/legal/",
  "/assets/",
];
const EMPLOYER_PREFIXES = ["/employer/"];
const ADMIN_PREFIXES = ["/admin/"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

interface SessionPayload {
  u: string;
  r: string;
}

function readSession(req: NextRequest): SessionPayload | null {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Build the per-request CSP. Uses a nonce for inline scripts (Next ships
 * a small inline bootstrap), so we can drop 'unsafe-inline' entirely.
 * 'strict-dynamic' lets nonce-tagged scripts load their own dependencies
 * without us having to enumerate every CDN.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  const self = "'self'";
  const scriptSrc = isDev
    ? // Next dev needs eval for fast refresh. Production never sees this.
      [self, `'nonce-${nonce}'`, "'strict-dynamic'", "'unsafe-eval'"].join(" ")
    : [self, `'nonce-${nonce}'`, "'strict-dynamic'"].join(" ");
  return [
    `default-src ${self}`,
    `script-src ${scriptSrc}`,
    `style-src ${self} 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src ${self} https://fonts.gstatic.com`,
    `img-src ${self} data: https:`,
    `connect-src ${self}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function generateNonce(): string {
  // 16 random bytes → base64 (~22 chars); compatible with Edge runtime.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function attachSecurityHeaders(res: NextResponse, nonce: string): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";
  res.headers.set("Content-Security-Policy", buildCsp(nonce, isDev));
  // Forward the nonce to React Server Components via the response header
  // and the request header (the layout reads it via next/headers).
  res.headers.set("x-nonce", nonce);
  return res;
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const nonce = generateNonce();

  // Forward nonce on the *request* so the server component layout can read it
  // via `headers().get('x-nonce')`.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  if (isPublic(pathname)) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    return attachSecurityHeaders(res, nonce);
  }

  const session = readSession(req);

  if (!session) {
    // Send the user through the login page but remember where they wanted to go.
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return attachSecurityHeaders(NextResponse.redirect(url), nonce);
  }

  // Role-based gates
  if (EMPLOYER_PREFIXES.some((p) => pathname.startsWith(p)) && session.r !== "EMPLOYER" && session.r !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return attachSecurityHeaders(NextResponse.redirect(url), nonce);
  }
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && session.r !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return attachSecurityHeaders(NextResponse.redirect(url), nonce);
  }

  return attachSecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    nonce,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
