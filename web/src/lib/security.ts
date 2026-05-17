/**
 * Client-safe security helpers. Anything that pulls in `next/headers`
 * (server-only) lives in {@link ./security-server.ts} so client
 * components can import from here without webpack rejecting the
 * server-only module.
 */

/**
 * Escape every HTML metacharacter so the result is safe to inject into
 * an HTML attribute or text node. Use *only* when you cannot avoid
 * `dangerouslySetInnerHTML` — for normal React rendering, React already
 * escapes interpolated values.
 *
 * Not a markup sanitiser: it strips zero structure. If the input is meant
 * to contain markup, run it through DOMPurify (client) or a similar
 * allow-list sanitiser before calling this.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Coarse URL guard for user-supplied "redirect" parameters. Accepts only
 * relative paths beginning with `/` and explicitly rejects scheme-relative
 * URLs (`//evil.example`), which otherwise let an attacker bounce the user
 * off-site through the login redirect.
 */
export function safeRedirectPath(input: string | null | undefined, fallback = "/"): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//") || input.startsWith("/\\")) return fallback;
  return input;
}
