import { NextResponse } from "next/server";

/**
 * Iter 177 — receiver for browser CSP violation reports.
 *
 * Wired from {@code middleware.ts} via the {@code report-uri}
 * directive on the Report-Only CSP. Browsers POST a single-shot
 * JSON document with the violated directive, the blocked URI, the
 * source file + line that triggered it, etc.
 *
 * We just log the structured payload at WARN so anyone watching
 * Vercel/console logs catches:
 *   - silent breakage when we tighten the enforced CSP
 *   - real XSS attempts (a report from a domain we don't own)
 *
 * No persistence yet — this is meant for low-volume monitoring.
 * If volume grows we can route to a dedicated sink (Loki, Sentry).
 *
 * The route is intentionally unauthenticated: browsers send these
 * reports without credentials, and a CSP report can't carry
 * exploitable input — we just stringify it.
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    // Some browsers send `application/csp-report` instead of JSON.
    // Fall through to a text fallback so we still log something.
    try {
      body = await req.text();
    } catch {
      body = "<unparseable>";
    }
  }

  // Most browsers send `{"csp-report": {...}}`; unwrap if present.
  // Both Chrome (csp-report) and Firefox (csp-report) use that
  // wrapper; Safari uses it too. The Reporting API (newer browsers)
  // sends an array of report objects without the wrapper.
  const payload = typeof body === "object" && body !== null && "csp-report" in body
    ? (body as { "csp-report": unknown })["csp-report"]
    : body;

  console.warn(
    "[csp-violation]",
    typeof payload === "string" ? payload : JSON.stringify(payload),
  );

  // Empty 204 — browsers don't care about the response.
  return new NextResponse(null, { status: 204 });
}

// Browsers may probe with OPTIONS for CORS preflight if the report
// URI is cross-origin. We're same-origin so this rarely fires, but
// it's cheap to handle.
export function OPTIONS(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: "POST, OPTIONS" },
  });
}
