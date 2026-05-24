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
  "/reset-password",
  "/favicon.ico",
];
const PUBLIC_PREFIXES = [
  "/_next/",
  "/api/session",
  "/api/csp-report",      // Iter 177 — browser CSP violation sink
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
 *
 * Iter 174 — dropped 'strict-dynamic'. Reason: Next.js bakes its
 * <script src="/_next/static/chunks/..."> tags into the static HTML
 * at build time without a nonce attribute (per
 * https://nextjs.org/docs/app/guides/content-security-policy
 * "Routes that consume a nonce should be marked dynamic"). With
 * strict-dynamic those tags would be blocked by the browser →
 * React never hydrates on any prerendered page (~all of them).
 *
 * Without strict-dynamic, scripts are allowed if they match 'self'
 * OR carry the nonce. Same-origin chunks under `_next/static/` are
 * trusted via 'self'; injected inline scripts must carry the nonce
 * (XSS protection preserved); cross-origin script loading is still
 * blocked by default. Net security: better than the previous setup
 * (which was broken in production — every page failed CSP) at the
 * cost of one tier of strict-dynamic's recursive-load protection,
 * which Next's own bundle structure doesn't actually need.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  const self = "'self'";
  // Google Identity Services (used by @react-oauth/google for the
  // Iter 161 sign-in button) loads gsi/client from accounts.google.com
  // and calls back via XHR + iframes hosted there.
  const googleAuthOrigins = "https://accounts.google.com";
  const scriptSrc = isDev
    ? // Next dev needs eval for fast refresh. Production never sees this.
      [self, `'nonce-${nonce}'`, "'unsafe-eval'", googleAuthOrigins].join(" ")
    : [self, `'nonce-${nonce}'`, googleAuthOrigins].join(" ");
  return [
    `default-src ${self}`,
    `script-src ${scriptSrc}`,
    `style-src ${self} 'unsafe-inline' https://fonts.googleapis.com ${googleAuthOrigins}`,
    `font-src ${self} https://fonts.gstatic.com`,
    `img-src ${self} data: https:`,
    `connect-src ${self} ${googleAuthOrigins}`,
    `frame-src ${googleAuthOrigins}`,
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
  // Build the binary string via reduce so noUncheckedIndexedAccess
  // doesn't complain about bytes[i] being `number | undefined`.
  // Uint8Array indexing IS always defined inside [0, length), but
  // the type system doesn't model that constraint.
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary);
}

/**
 * Iter 177 — stricter "what-if" policy emitted as Report-Only.
 *
 * Browsers evaluate this in parallel with the enforced CSP but
 * never block; instead they POST a JSON report to {@code report-uri}
 * (`/api/csp-report`). Lets us:
 *   - tighten in the future (add strict-dynamic back, drop
 *     unsafe-inline on style-src, restrict img-src to specific
 *     CDNs) and see breakage *before* enforcing it
 *   - spot real XSS attempts (a report from a domain we don't
 *     own is a smoke signal)
 *
 * The enforced CSP from {@link buildCsp} is what actually protects
 * the user. This is monitoring, not enforcement.
 */
function buildReportOnlyCsp(nonce: string): string {
  const self = "'self'";
  const googleAuthOrigins = "https://accounts.google.com";
  return [
    `default-src ${self}`,
    // Stricter than the enforced policy: re-add strict-dynamic to
    // catch any path where a non-nonce'd script still works (which
    // would be a hydration regression for our dynamic pages).
    `script-src ${self} 'nonce-${nonce}' 'strict-dynamic' ${googleAuthOrigins}`,
    // Drop unsafe-inline on style-src to surface any inline <style>
    // we might be shipping (Tailwind shouldn't, but framer-motion
    // sometimes does for animations).
    `style-src ${self} https://fonts.googleapis.com ${googleAuthOrigins}`,
    `font-src ${self} https://fonts.gstatic.com`,
    `img-src ${self} data: https:`,
    `connect-src ${self} ${googleAuthOrigins}`,
    `frame-src ${googleAuthOrigins}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "report-uri /api/csp-report",
  ].join("; ");
}

function attachSecurityHeaders(res: NextResponse, nonce: string): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";
  res.headers.set("Content-Security-Policy", buildCsp(nonce, isDev));
  // Iter 177 — sidecar what-if policy. Browsers POST violations to
  // /api/csp-report without blocking; useful for measuring the
  // impact of tightening before we commit.
  if (!isDev) {
    res.headers.set("Content-Security-Policy-Report-Only", buildReportOnlyCsp(nonce));
  }
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
