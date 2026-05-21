"use client";

import { useEffect } from "react";

/**
 * Iter 151 — global error boundary.
 *
 * Next.js renders this when the root layout itself throws — so it must
 * include its own `<html>` and `<body>` tags. Keep it visually minimal
 * and dependency-free (we cannot rely on Providers / Tailwind tokens /
 * theme store here since the failure may be in any of them).
 *
 * For "normal" route errors (anything below the root layout) use the
 * per-segment `error.tsx` files which can use the full design system.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.879 0.0594 254 / 0.4), transparent 60%), radial-gradient(ellipse at 80% 80%, oklch(0.937 0.0249 25 / 0.3), transparent 60%), oklch(0.984 0.003 247)",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: 40,
            background: "rgba(255,255,255,0.7)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(15,23,42,0.18)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background:
                "linear-gradient(135deg, oklch(0.629 0.2086 25), oklch(0.785 0.1573 75))",
              color: "white",
              fontSize: 30,
              fontWeight: 800,
              boxShadow: "0 8px 24px oklch(0.629 0.2086 25 / 0.35)",
            }}
          >
            !
          </div>
          <h1
            style={{
              marginTop: 24,
              fontSize: 26,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
            }}
          >
            Etwas ist schiefgegangen
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.5,
            }}
          >
            Ein unerwarteter Fehler hat die App unterbrochen. Wir haben das
            Problem geloggt — bitte versuche es erneut.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                color: "#94a3b8",
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, oklch(0.611 0.1733 254), oklch(0.611 0.18 280))",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 8px 24px oklch(0.611 0.1733 254 / 0.3)",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
