import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/services/supabase_service.dart';

class AuthState {
  final bool isLoggedIn;
  final Profile? profile;
  final bool loading;

  const AuthState({
    this.isLoggedIn = false,
    this.profile,
    this.loading = true,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    Profile? profile,
    bool? loading,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      profile: profile ?? this.profile,
      loading: loading ?? this.loading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _init();
  }

  void _init() {
    if (SupabaseService.isMockMode) {
      // Auto-login as applicant in mock mode
      state = AuthState(
        isLoggedIn: true,
        profile: mockProfiles[0],
        loading: false,
      );
    }
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(loading: true);

    if (SupabaseService.isMockMode) {
      // Simulate network delay
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
    state = const AuthState(isLoggedIn: false, loading: false);
  }
}

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
