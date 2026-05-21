import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * Iter 163 — env-gated rendering of GoogleSignInButton.
 *
 * Two interesting branches:
 *  1. NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is empty/missing → button
 *     returns `null` (no GIS script injection, no dead UI in dev).
 *  2. The env var is set → component renders the GoogleLogin host
 *     div that GIS later replaces with its iframe-rendered button.
 *
 * We mock @react-oauth/google entirely so the tests don't depend on
 * GIS being reachable from the test runner (and so we don't need a
 * real Google client ID just to render).
 */

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: (props: { text?: string }) => (
    <div data-testid="mock-google-login" data-text={props.text} />
  ),
}));

// Avoid touching localStorage / sonner / api-client in this layer —
// the click-handler integration is covered by the auth-store tests.
vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (s: { signInWithGoogle: () => void }) => unknown) =>
    selector({ signInWithGoogle: vi.fn() }),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

vi.mock("@/lib/api-errors", () => ({
  apiErrorMessage: (_t: unknown, _e: unknown, fb: string) => fb,
}));

vi.mock("@/i18n/use-translate", () => ({
  useTranslate: () => (k: string) => k,
}));

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("renders nothing when NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is unset", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "";
    const { GoogleSignInButton } = await import("./google-sign-in-button");
    const { container } = render(<GoogleSignInButton />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("mock-google-login")).toBeNull();
  });

  it("renders the GoogleLogin host when the env var is set", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "fake-client-id.apps.googleusercontent.com";
    const { GoogleSignInButton } = await import("./google-sign-in-button");
    render(<GoogleSignInButton />);
    expect(screen.getByTestId("mock-google-login")).toBeInTheDocument();
  });

  it("passes text='signin_with' by default", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "fake";
    const { GoogleSignInButton } = await import("./google-sign-in-button");
    render(<GoogleSignInButton />);
    expect(screen.getByTestId("mock-google-login")).toHaveAttribute(
      "data-text",
      "signin_with",
    );
  });

  it("forwards text='signup_with' for the register page", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "fake";
    const { GoogleSignInButton } = await import("./google-sign-in-button");
    render(<GoogleSignInButton text="signup_with" />);
    expect(screen.getByTestId("mock-google-login")).toHaveAttribute(
      "data-text",
      "signup_with",
    );
  });

  it("ignores whitespace-only client IDs (treats them as unset)", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "   ";
    const { GoogleSignInButton } = await import("./google-sign-in-button");
    const { container } = render(<GoogleSignInButton />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("googleOAuthEnabled helper", () => {
  it("returns false when the env var is missing", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "";
    const { googleOAuthEnabled } = await import("./google-oauth-provider");
    expect(googleOAuthEnabled()).toBe(false);
  });

  it("returns true when the env var has a non-blank value", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID = "real-id";
    const { googleOAuthEnabled } = await import("./google-oauth-provider");
    expect(googleOAuthEnabled()).toBe(true);
  });
});
