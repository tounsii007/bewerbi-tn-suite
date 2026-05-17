import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/services/supabase_service.dart';
import 'package:bewerbi_tn_flutter/services/token_store.dart';

class AuthState {
  final bool isLoggedIn;
  final Profile? profile;
  final bool loading;

  /// Optional — populated from the API's AuthResponse.user on signIn.
  /// Null in mock-mode and on app-cold-start re-hydration (we don't
  /// persist user details, just tokens), which the banner treats as
  /// "unknown → don't show".
  final String? email;
  final bool? emailVerified;

  const AuthState({
    this.isLoggedIn = false,
    this.profile,
    this.loading = true,
    this.email,
    this.emailVerified,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    Profile? profile,
    bool? loading,
    String? email,
    bool? emailVerified,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      profile: profile ?? this.profile,
      loading: loading ?? this.loading,
      email: email ?? this.email,
      emailVerified: emailVerified ?? this.emailVerified,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier({TokenStore? tokenStore})
      : _tokenStore = tokenStore ?? TokenStore(),
        super(const AuthState()) {
    _init();
  }

  final TokenStore _tokenStore;

  Future<void> _init() async {
    // Mock mode short-circuits: no real backend, no real tokens.
    if (SupabaseService.isMockMode) {
      state = AuthState(
        isLoggedIn: true,
        profile: mockProfiles[0],
        loading: false,
      );
      return;
    }

    if (ApiClient.isApiMode) {
      // Persist *every* refresh so the keystore copy doesn't drift from the
      // in-memory access token after the first proactive refresh.
      ApiClient.instance.setTokensRefreshedHandler((tokens) {
        // Fire-and-forget: a failed write means next launch lands on
        // login, which is a tolerable degradation.
        // ignore: discarded_futures
        _tokenStore.write(tokens);
      });
      ApiClient.instance.setUnauthorizedHandler(() {
        // ignore: discarded_futures
        signOut();
      });

      // Re-arm the ApiClient with whatever was previously persisted. On a
      // clean install this returns null and the user lands on login.
      final tokens = await _tokenStore.read();
      if (tokens != null) {
        ApiClient.instance.setTokens(tokens);
        state = state.copyWith(isLoggedIn: true, loading: false);
        return;
      }
    }
    state = state.copyWith(loading: false);
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(loading: true);

    if (ApiClient.isApiMode) {
      try {
        final data = await ApiClient.instance.post(
          '/api/v1/auth/login',
          body: {'email': email, 'password': password},
        ) as Map<String, dynamic>;
        final tokens = AuthTokens.fromJson(data);
        ApiClient.instance.setTokens(tokens);
        await _tokenStore.write(tokens);
        // Persist email + verification status in memory so the
        // verify-email banner can decide whether to render. Not stored
        // on disk — on next launch we'll re-fetch from /me when needed.
        final user = data['user'] as Map<String, dynamic>?;
        state = state.copyWith(
          isLoggedIn: true,
          loading: false,
          email: user?['email'] as String?,
          emailVerified: user?['emailVerified'] as bool?,
        );
      } catch (_) {
        state = state.copyWith(loading: false);
        rethrow;
      }
      return;
    }

    if (SupabaseService.isMockMode) {
      await Future<void>.delayed(const Duration(milliseconds: 500));

      if (email.contains('employer') || email.contains('arbeitgeber')) {
        state = AuthState(
          isLoggedIn: true,
          profile: mockProfiles[1],
          loading: false,
        );
      } else if (email.contains('admin')) {
        state = AuthState(
          isLoggedIn: true,
          profile: mockProfiles[3],
          loading: false,
        );
      } else {
        state = AuthState(
          isLoggedIn: true,
          profile: mockProfiles[0],
          loading: false,
        );
      }
    }
  }

  void mockLoginAs(UserRole role) {
    final profileMap = {
      UserRole.applicant: mockProfiles[0],
      UserRole.employer: mockProfiles[1],
      UserRole.admin: mockProfiles[3],
    };
    state = AuthState(
      isLoggedIn: true,
      profile: profileMap[role],
      loading: false,
    );
  }

  void updateProfile(Profile updated) {
    state = state.copyWith(profile: updated);
  }

  Future<void> signOut() async {
    if (ApiClient.isApiMode) {
      ApiClient.instance.setTokens(null);
      await _tokenStore.clear();
    }
    state = const AuthState(isLoggedIn: false, loading: false);
  }
}

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
