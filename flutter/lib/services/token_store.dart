import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_client.dart';

/// Hardware-backed persistence for refresh + access tokens.
///
///   iOS      → Keychain with `first_unlock_this_device`
///   Android  → EncryptedSharedPreferences (AES-256 via the Android Keystore)
///   web      → IndexedDB (browser-isolated, the only practical option)
///   desktop  → libsecret / wincred / equivalent
///
/// We intentionally do *not* fall back to SharedPreferences when secure
/// storage fails: tokens belong in a keystore or nowhere. On a failed
/// write we surface the error so the caller can decide (re-login or
/// retry) — a silent fallback to plain-text would be worse than logging
/// the user out.
///
/// Token JSON is stored under a single key; that avoids an inconsistent
/// half-written state where access and refresh tokens disagree.
class TokenStore {
  TokenStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              // flutter_secure_storage v10: EncryptedSharedPreferences is
              // deprecated (the Jetpack Security lib is EOL); data is
              // auto-migrated to custom AES ciphers on first access, so the
              // explicit flag is no longer set.
              aOptions: AndroidOptions(),
              iOptions: IOSOptions(
                accessibility: KeychainAccessibility.first_unlock_this_device,
              ),
            );

  static const String _key = 'bewerbi.auth.tokens.v1';

  final FlutterSecureStorage _storage;

  Future<AuthTokens?> read() async {
    final raw = await _storage.read(key: _key);
    if (raw == null) return null;
    try {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      return AuthTokens.fromJson(json);
    } catch (_) {
      // Corrupt entry — drop it so a fresh login replaces it cleanly.
      await _storage.delete(key: _key);
      return null;
    }
  }

  Future<void> write(AuthTokens tokens) async {
    final payload = jsonEncode({
      'accessToken': tokens.accessToken,
      'accessTokenExpiresAt': tokens.accessExpiresAt.toIso8601String(),
      'refreshToken': tokens.refreshToken,
      'refreshTokenExpiresAt': tokens.refreshExpiresAt.toIso8601String(),
    });
    await _storage.write(key: _key, value: payload);
  }

  Future<void> clear() => _storage.delete(key: _key);
}
