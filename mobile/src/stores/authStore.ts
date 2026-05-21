import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "../lib/secureStorage";
import { supabase, IS_MOCK_MODE } from "../lib/supabase";
import { mockProfiles } from "../lib/mockData";
import {
  authApi,
  configureApi,
  IS_API_MODE,
  setTokens as apiSetTokens,
  type AuthResponse,
} from "../lib/apiClient";
import type { Profile, UserRole } from "../types";

interface SessionUser {
  id: string;
  // Optional in mock/legacy paths — API mode always populates them so
  // the "verify your email" banner can decide whether to show.
  email?: string;
  emailVerified?: boolean;
  /** Iter 169 — true when the account has a bcrypt hash on file.
   *  Drives "Passwort ändern" vs "Passwort setzen" in settings. */
  hasPassword?: boolean;
  /** Iter 169 — true when a Google identity is linked. Drives the
   *  "Mit Google verknüpfen" / "Verknüpfung entfernen" button. */
  hasGoogleLinked?: boolean;
}

interface AuthSession {
  user: SessionUser;
}

interface TokenPair {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface AuthState {
  session: AuthSession | null;
  profile: Profile | null;
  tokens: TokenPair | null;
  loading: boolean;
  setSession: (session: AuthSession | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  /**
   * Iter 166 — exchange a Google ID token (from expo-auth-session) for
   * our JWT pair. `role` is only honoured server-side on first signup.
   * IS_API_MODE-only; throws in mock + supabase modes.
   */
  signInWithGoogle: (idToken: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  /** Iter 169 — re-fetch /me/account so the linking flags refresh. */
  refreshAccount: () => Promise<void>;
  mockLoginAs: (role: UserRole) => void;
  /** Called by the apiClient after a silent refresh so the new tokens
      are persisted to disk. */
  onTokensRefreshed: (resp: AuthResponse) => void;
}

function mockSessionFor(profile: Profile | undefined): AuthSession | null {
  if (!profile) return null;
  return { user: { id: profile.user_id } };
}

function toTokenPair(resp: AuthResponse): TokenPair {
  return {
    accessToken: resp.accessToken,
    accessTokenExpiresAt: resp.accessTokenExpiresAt,
    refreshToken: resp.refreshToken,
    refreshTokenExpiresAt: resp.refreshTokenExpiresAt,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Wire the apiClient once; apiClient will call back here on refresh or 401.
      configureApi({
        onUnauthorized: () => {
          set({ session: null, profile: null, tokens: null });
          apiSetTokens(null);
        },
        onTokensRefreshed: (resp) => {
          set({ tokens: toTokenPair(resp) });
        },
      });

      return {
        session: IS_MOCK_MODE ? mockSessionFor(mockProfiles[0]) : null,
        profile: IS_MOCK_MODE ? mockProfiles[0] : null,
        tokens: null,
        loading: false,

        setSession: (session) => set({ session }),
        setProfile: (profile) => set({ profile }),
        setLoading: (loading) => set({ loading }),

        signIn: async (email, password) => {
          if (IS_API_MODE) {
            const resp = await authApi.login({ email, password });
            apiSetTokens(resp);
            set({
              tokens: toTokenPair(resp),
              session: {
                user: {
                  id: resp.user.id,
                  email: resp.user.email,
                  emailVerified: resp.user.emailVerified,
                  hasPassword: resp.user.hasPassword,
                  hasGoogleLinked: resp.user.hasGoogleLinked,
                },
              },
            });
            await get().fetchProfile();
            return;
          }
          if (IS_MOCK_MODE) {
            let profile = mockProfiles[0];
            if (email.includes("employer") || email.includes("arbeitgeber")) {
              profile = mockProfiles[1];
            } else if (email.includes("admin")) {
              profile = mockProfiles[3];
            }
            set({ session: mockSessionFor(profile), profile });
            return;
          }
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        },

        signUp: async (email, password, role, firstName, lastName) => {
          if (IS_API_MODE) {
            const resp = await authApi.register({
              email,
              password,
              firstName,
              lastName,
              role: role === "applicant" ? "APPLICANT" : "EMPLOYER",
            });
            apiSetTokens(resp);
            set({
              tokens: toTokenPair(resp),
              session: {
                user: {
                  id: resp.user.id,
                  email: resp.user.email,
                  emailVerified: resp.user.emailVerified,
                  hasPassword: resp.user.hasPassword,
                  hasGoogleLinked: resp.user.hasGoogleLinked,
                },
              },
            });
            await get().fetchProfile();
            return;
          }
          if (IS_MOCK_MODE) return;
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (data.user) {
            const { error: profileError } = await supabase.from("profiles").insert({
              user_id: data.user.id,
              role,
              first_name: firstName,
              last_name: lastName,
              phone: "",
              city: "",
              country: "Tunesien",
              bio: "",
            });
            if (profileError) throw profileError;
          }
        },

        signInWithGoogle: async (idToken, role) => {
          if (!IS_API_MODE) {
            throw new Error("Google sign-in is only available in API mode.");
          }
          const apiRole = role
            ? role === "applicant" ? "APPLICANT" : "EMPLOYER"
            : undefined;
          const resp = await authApi.google({ idToken, role: apiRole });
          apiSetTokens(resp);
          set({
            tokens: toTokenPair(resp),
            session: {
              user: {
                id: resp.user.id,
                email: resp.user.email,
                emailVerified: resp.user.emailVerified,
                hasPassword: resp.user.hasPassword,
                hasGoogleLinked: resp.user.hasGoogleLinked,
              },
            },
          });
          await get().fetchProfile();
        },

        signOut: async () => {
          const tokens = get().tokens;
          if (IS_API_MODE && tokens?.refreshToken) {
            try {
              await authApi.logout(tokens.refreshToken);
            } catch {
              // logout shouldn't block even if the server rejects the call
            }
          } else if (!IS_MOCK_MODE) {
            await supabase.auth.signOut();
          }
          apiSetTokens(null);
          set({ session: null, profile: null, tokens: null });
        },

        fetchProfile: async () => {
          if (IS_API_MODE) {
            // Fetched lazily via profileApi.me() in the home screen.
            return;
          }
          if (IS_MOCK_MODE) return;
          const { session } = get();
          if (!session?.user) return;
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          if (!error) set({ profile: data as Profile });
        },

        refreshAccount: async () => {
          if (!IS_API_MODE) return;
          try {
            const account = await authApi.account();
            set((s) => ({
              session: s.session
                ? {
                    user: {
                      ...s.session.user,
                      email: account.email,
                      emailVerified: account.emailVerified,
                      hasPassword: account.hasPassword,
                      hasGoogleLinked: account.hasGoogleLinked,
                    },
                  }
                : s.session,
            }));
          } catch {
            // Best-effort — keep cached flags on failure.
          }
        },

        mockLoginAs: (role) => {
          const profileIndex: Record<UserRole, number> = {
            applicant: 0,
            employer: 1,
            admin: 3,
          };
          const profile = mockProfiles[profileIndex[role]];
          set({ session: mockSessionFor(profile), profile });
        },

        onTokensRefreshed: (resp) => {
          set({ tokens: toTokenPair(resp) });
        },
      };
    },
    {
      // Bumped name when the storage backend changed so the old AsyncStorage
      // entry is orphaned (and effectively ignored) on the first run with
      // SecureStore. Avoids hydrating possibly-stale or plain-text tokens
      // from the previous backend.
      name: "bewerbi.auth.v2",
      storage: createJSONStorage(() => secureStorage),
      // Only persist tokens + user id; everything else is derived or stale.
      partialize: (state) => ({
        tokens: state.tokens,
        session: state.session,
      }),
      // Re-hydrate the apiClient with the persisted tokens on app restart,
      // and best-effort delete any leftover plaintext copy from the legacy
      // AsyncStorage backend (bewerbi.auth) so it can't be exfiltrated by
      // a future backup of unencrypted preferences.
      onRehydrateStorage: () => (state) => {
        void (async () => {
          try {
            const legacy = await import("@react-native-async-storage/async-storage");
            await legacy.default.removeItem("bewerbi.auth");
          } catch {
            // Non-fatal: the legacy slot may already be gone.
          }
        })();
        if (state?.tokens) {
          apiSetTokens({
            accessToken: state.tokens.accessToken,
            accessTokenExpiresAt: state.tokens.accessTokenExpiresAt,
            accessTokenExpiresIn: 0,
            refreshToken: state.tokens.refreshToken,
            refreshTokenExpiresAt: state.tokens.refreshTokenExpiresAt,
            user: { id: state.session?.user.id ?? "", email: "", role: "", emailVerified: false },
          });
        }
      },
    },
  ),
);
