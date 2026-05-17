import "server-only";
import { headers } from "next/headers";

/**
 * Read the per-request CSP nonce that middleware.ts attaches to every
 * request. Use it on any inline `<Script>` or `<style>` tag in a server
 * component:
 *
 * ```tsx
 * const nonce = await getCspNonce();
 * return <Script nonce={nonce}>{ ... }</Script>;
 * ```
 *
 * Server-only — the `"server-only"` import above makes webpack reject
 * any client component that pulls this in by mistake. Client-safe
 * helpers (escapeHtml, safeRedirectPath) live in {@link ./security}.
 *
 * Returns an empty string when called outside a request scope (build-time,
 * tests) so server-side rendering does not throw.
 */
export async function getCspNonce(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-nonce") ?? "";
  } catch {
    return "";
  }
}
