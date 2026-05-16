import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

/**
 * Persisted-storage adapter for zustand that routes sensitive values
 * (auth tokens) through the platform's hardware-backed keystore:
 *
 *   iOS      → Keychain (kSecAttrAccessibleAfterFirstUnlock by default)
 *   Android  → EncryptedSharedPreferences (AES-256 via Keystore)
 *   web      → AsyncStorage fallback (web build runs in-browser, where
 *              localStorage is the only practical option anyway)
 *
 * SecureStore has a 2 KB per-value soft limit on iOS — refresh tokens are
 * ~64 B and access JWTs ~800 B, so a single stringified state slot
 * comfortably fits. If we ever need to persist larger blobs, split them
 * across keys or store a key here that references AsyncStorage.
 *
 * We dynamically import expo-secure-store so the web bundle stays slim
 * and so the module is optional in environments where it can't be linked.
 * Falls back to AsyncStorage when the native module is unavailable.
 */

type SecureStoreModule = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

let cached: SecureStoreModule | null | undefined;

async function loadSecureStore(): Promise<SecureStoreModule | null> {
  if (cached !== undefined) return cached;
  if (Platform.OS === "web") {
    cached = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("expo-secure-store") as SecureStoreModule;
    cached = mod;
    return mod;
  } catch {
    cached = null;
    return null;
  }
}

export const secureStorage: StateStorage = {
  getItem: async (name) => {
    const ss = await loadSecureStore();
    if (ss) return ss.getItemAsync(name);
    return AsyncStorage.getItem(name);
  },
  setItem: async (name, value) => {
    const ss = await loadSecureStore();
    if (ss) {
      await ss.setItemAsync(name, value);
      return;
    }
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    const ss = await loadSecureStore();
    if (ss) {
      await ss.deleteItemAsync(name);
      return;
    }
    await AsyncStorage.removeItem(name);
  },
};
