import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection matrix.
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

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const session = readSession(req);

  if (!session) {
    // Send the user through the login page but remember where they wanted to go.
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based gates
  if (EMPLOYER_PREFIXES.some((p) => pathname.startsWith(p)) && session.r !== "EMPLOYER" && session.r !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && session.r !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
