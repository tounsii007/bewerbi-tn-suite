import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthResponse } from "@/lib/types";

/**
 * Iter 163 — auth-store.signInWithGoogle tests.
 *
 * The store wires up:
 *   authApi.google → onLoginSuccess → state transition
 *
 * Happy + error paths:
 *  - on success: state goes authenticating → authenticated, user is set,
 *    onLoginSuccess is called with the response.
 *  - on failure: state goes authenticating → anonymous, error message
 *    is persisted, the error is re-thrown so the caller (page) can
 *    surface a toast.
 *
 * The store calls `setOnUnauthorized()` as a side-effect inside its
 * factory — that's harmless in tests because we mock setOnUnauthorized
 * to a noop. We re-import the module per-test (vi.resetModules) so
 * each test gets a fresh Zustand store instance.
 */

const googleMock = vi.fn();
const onLoginSuccessMock = vi.fn();
const setOnUnauthorizedMock = vi.fn();
const armRefreshTimerMock = vi.fn();
const disarmRefreshTimerMock = vi.fn();
const clearTokensMock = vi.fn();
const readTokensMock = vi.fn(() => null);

vi.mock("@/lib/api", () => ({
  authApi: {
    google: (...args: unknown[]) => googleMock(...args),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("@/lib/api-client", () => ({
  onLoginSuccess: (...args: unknown[]) => onLoginSuccessMock(...args),
  setOnUnauthorized: (...args: unknown[]) => setOnUnauthorizedMock(...args),
  armRefreshTimer: () => armRefreshTimerMock(),
  disarmRefreshTimer: () => disarmRefreshTimerMock(),
}));

vi.mock("@/lib/auth-storage", () => ({
  clearTokens: () => clearTokensMock(),
  readTokens: () => readTokensMock(),
}));

beforeEach(() => {
  vi.resetModules();
  googleMock.mockReset();
  onLoginSuccessMock.mockReset();
  setOnUnauthorizedMock.mockReset();
  armRefreshTimerMock.mockReset();
  disarmRefreshTimerMock.mockReset();
  clearTokensMock.mockReset();
  readTokensMock.mockReset();
  readTokensMock.mockReturnValue(null);
});

const sampleResponse: AuthResponse = {
  accessToken: "acc",
  accessTokenExpiresAt: "2026-05-21T10:00:00Z",
  accessTokenExpiresIn: 3600,
  refreshToken: "ref",
  refreshTokenExpiresAt: "2026-06-20T10:00:00Z",
  user: {
    id: "user-uuid",
    email: "user@example.tn",
    role: "APPLICANT",
    emailVerified: true,
    preferredLocale: "de",
  },
};

describe("useAuthStore.signInWithGoogle", () => {
  it("transitions to 'authenticated' and stores the user on success", async () => {
    googleMock.mockResolvedValue(sampleResponse);
    const { useAuthStore } = await import("./auth-store");

    await useAuthStore.getState().signInWithGoogle("id-token-jwt", "APPLICANT");

    expect(googleMock).toHaveBeenCalledWith({
      idToken: "id-token-jwt",
      role: "APPLICANT",
    });
    expect(onLoginSuccessMock).toHaveBeenCalledWith(sampleResponse);
    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user?.id).toBe("user-uuid");
    expect(state.user?.email).toBe("user@example.tn");
    expect(state.error).toBeNull();
  });

  it("omits the role when not provided (login flow)", async () => {
    googleMock.mockResolvedValue(sampleResponse);
    const { useAuthStore } = await import("./auth-store");

    await useAuthStore.getState().signInWithGoogle("id-token-jwt");

    expect(googleMock).toHaveBeenCalledWith({
      idToken: "id-token-jwt",
      role: undefined,
    });
  });

  it("transitions to 'anonymous' with an error message on failure", async () => {
    const apiError = Object.assign(new Error("Email already registered"), {
      status: 409,
      code: "CONFLICT",
    });
    googleMock.mockRejectedValue(apiError);

    const { useAuthStore } = await import("./auth-store");
    await expect(
      useAuthStore.getState().signInWithGoogle("bad-token", "APPLICANT"),
    ).rejects.toBe(apiError);

    expect(onLoginSuccessMock).not.toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.status).toBe("anonymous");
    expect(state.user).toBeNull();
    expect(state.error).toBe("Email already registered");
  });

  it("falls back to a generic German error when the thrown value has no message", async () => {
    googleMock.mockRejectedValue({});

    const { useAuthStore } = await import("./auth-store");
    await expect(
      useAuthStore.getState().signInWithGoogle("token"),
    ).rejects.toEqual({});
    expect(useAuthStore.getState().error).toBe("Google-Anmeldung fehlgeschlagen");
  });

  it("registers a single 401-handler when the store factory runs", async () => {
    await import("./auth-store");
    expect(setOnUnauthorizedMock).toHaveBeenCalledTimes(1);
  });
});
