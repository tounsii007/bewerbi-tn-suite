import { NextResponse, type NextRequest } from "next/server";

/**
 * HttpOnly session cookie maintained in lockstep with the localStorage
 * tokens. The middleware reads this cookie to decide whether to let the
 * user into protected routes — it cannot read localStorage.
 *
 * POST body: { userId, role, expiresAt }
 * DELETE   : clears the cookie (called on logout)
 */

const COOKIE_NAME = "bewerbi.session";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as
    | { userId: string; role: string; expiresAt: string }
    | null;
  if (!body || !body.userId || !body.role) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const expires = new Date(body.expiresAt);
  const maxAge = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000));

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: JSON.stringify({ u: body.userId, r: body.role }),
    httpOnly: true,
    // Iter 182 — strict → lax. Reason: with strict, the cookie is
    // not sent on any cross-origin navigation, including a click on
    // an emailed link to /dashboard or a back-button from accounts
    // .google.com after the OAuth handoff. That forces an
    // unnecessary re-login every time the user arrives from outside.
    // lax still blocks the dangerous cross-site POSTs (CSRF), the
    // iframe traffic ('frame-ancestors none' on the CSP catches
    // those anyway), and prefetches — only top-level GET
    // navigations get the cookie.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
