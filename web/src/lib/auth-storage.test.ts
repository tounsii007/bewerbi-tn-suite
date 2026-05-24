import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readTokens } from "./auth-storage";

/**
 * Iter 186 — tests for the Iter 183 shape-check in readTokens().
 *
 * The defensive validation matters because a partial / hand-edited /
 * older-schema localStorage value used to leak through (blind cast),
 * leaving the app in a half-logged-in state where every API call
 * 401'd. These tests pin the wipe-on-mismatch behaviour.
 */

const KEY = "bewerbi.auth.v1";

const validStored = {
  accessToken: "access-jwt",
  accessTokenExpiresAt: "2026-05-22T12:00:00Z",
  refreshToken: "refresh-jwt",
  refreshTokenExpiresAt: "2026-06-21T12:00:00Z",
  userId: "user-uuid-1",
  role: "APPLICANT",
  email: "u@example.tn",
  emailVerified: true,
  preferredLocale: "de",
  hasPassword: true,
  hasGoogleLinked: false,
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("readTokens", () => {
  it("returns null when nothing is stored", () => {
    expect(readTokens()).toBeNull();
  });

  it("returns a valid payload unchanged", () => {
    localStorage.setItem(KEY, JSON.stringify(validStored));
    expect(readTokens()).toEqual(validStored);
  });

  it("wipes the slot and returns null on JSON parse failure", () => {
    localStorage.setItem(KEY, "{ not valid json");
    expect(readTokens()).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("wipes the slot when accessToken is missing", () => {
    const partial = { ...validStored } as Record<string, unknown>;
    delete partial.accessToken;
    localStorage.setItem(KEY, JSON.stringify(partial));
    expect(readTokens()).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("wipes the slot when refreshToken is an empty string", () => {
    localStorage.setItem(KEY, JSON.stringify({ ...validStored, refreshToken: "" }));
    expect(readTokens()).toBeNull();
  });

  it("wipes the slot when userId is missing", () => {
    const partial = { ...validStored } as Record<string, unknown>;
    delete partial.userId;
    localStorage.setItem(KEY, JSON.stringify(partial));
    expect(readTokens()).toBeNull();
  });

  it("wipes the slot when emailVerified is the wrong type", () => {
    // Older clients wrote `emailVerified: "true"` (string) by mistake.
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...validStored, emailVerified: "true" }),
    );
    expect(readTokens()).toBeNull();
  });

  it("wipes the slot when the value is not an object", () => {
    localStorage.setItem(KEY, JSON.stringify("not-an-object"));
    expect(readTokens()).toBeNull();
  });

  it("wipes the slot when the value is null", () => {
    localStorage.setItem(KEY, JSON.stringify(null));
    expect(readTokens()).toBeNull();
  });

  it("accepts a payload without hasPassword/hasGoogleLinked (back-compat)", () => {
    // Pre-Iter-169 clients didn't write these. We don't want them to
    // get wiped just because the optional flags are missing — the
    // settings page does an auto-refresh on mount that fills them in.
    const legacy = { ...validStored } as Record<string, unknown>;
    delete legacy.hasPassword;
    delete legacy.hasGoogleLinked;
    localStorage.setItem(KEY, JSON.stringify(legacy));

    const result = readTokens();
    expect(result?.accessToken).toBe(validStored.accessToken);
    expect(result?.hasPassword).toBeUndefined();
    expect(result?.hasGoogleLinked).toBeUndefined();
  });

  it("returns null gracefully when window is undefined (SSR)", () => {
    const original = globalThis.window;
    vi.stubGlobal("window", undefined);
    try {
      expect(readTokens()).toBeNull();
    } finally {
      vi.stubGlobal("window", original);
    }
  });
});
