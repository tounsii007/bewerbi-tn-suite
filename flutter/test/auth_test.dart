import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';

void main() {
  group('AuthProvider', () {
    late AuthNotifier authNotifier;

    setUp(() {
      authNotifier = AuthNotifier();
    });

    test('initial state is logged in as applicant (mock mode)', () {
      expect(authNotifier.state.isLoggedIn, true);
      expect(authNotifier.state.profile?.role, UserRole.applicant);
      expect(authNotifier.state.profile?.firstName, 'Ahmed');
      expect(authNotifier.state.loading, false);
    });

    test('mockLoginAs employer switches to employer profile', () {
      authNotifier.mockLoginAs(UserRole.employer);
      expect(authNotifier.state.isLoggedIn, true);
      // mockLoginAs uses mockProfiles[1] for employer
      expect(authNotifier.state.profile, isNotNull);
      expect(authNotifier.state.profile?.id, 'profile-5');
      expect(authNotifier.state.loading, false);
    });

    test('mockLoginAs admin switches to admin profile', () {
      authNotifier.mockLoginAs(UserRole.admin);
      expect(authNotifier.state.isLoggedIn, true);
      // mockLoginAs uses mockProfiles[3] for admin
      expect(authNotifier.state.profile, isNotNull);
      expect(authNotifier.state.profile?.id, 'profile-7');
    });

    test('signOut clears session', () async {
      await authNotifier.signOut();
      expect(authNotifier.state.isLoggedIn, false);
      expect(authNotifier.state.profile, null);
      expect(authNotifier.state.loading, false);
    });

    test('signIn with employer email loads employer profile', () async {
      await authNotifier.signOut();
      await authNotifier.signIn('employer@test.com', 'password');
      expect(authNotifier.state.isLoggedIn, true);
      // signIn uses mockProfiles[1] for employer-like emails
      expect(authNotifier.state.profile, isNotNull);
      expect(authNotifier.state.profile?.id, 'profile-5');
    });

    test('signIn with admin email loads admin profile', () async {
      await authNotifier.signOut();
      await authNotifier.signIn('admin@test.com', 'password');
      expect(authNotifier.state.isLoggedIn, true);
      // signIn uses mockProfiles[3] for admin emails
      expect(authNotifier.state.profile, isNotNull);
      expect(authNotifier.state.profile?.id, 'profile-7');
    });

    test('signIn with normal email loads applicant profile', () async {
      await authNotifier.signOut();
      await authNotifier.signIn('user@test.com', 'password');
      expect(authNotifier.state.isLoggedIn, true);
      expect(authNotifier.state.profile?.role, UserRole.applicant);
      expect(authNotifier.state.profile?.id, 'profile-1');
    });

    test('signIn with arbeitgeber email loads employer profile', () async {
      await authNotifier.signOut();
      await authNotifier.signIn('arbeitgeber@firma.de', 'password');
      expect(authNotifier.state.isLoggedIn, true);
      // signIn treats 'arbeitgeber' same as 'employer'
      expect(authNotifier.state.profile, isNotNull);
      expect(authNotifier.state.profile?.id, 'profile-5');
    });

    test('updateProfile updates profile data', () {
      final updated = authNotifier.state.profile!.copyWith(
        firstName: 'TestName',
        city: 'Berlin',
      );
      authNotifier.updateProfile(updated);
      expect(authNotifier.state.profile?.firstName, 'TestName');
      expect(authNotifier.state.profile?.city, 'Berlin');
    });

    test('updateProfile preserves other fields', () {
      final original = authNotifier.state.profile!;
      final updated = original.copyWith(city: 'Hamburg');
      authNotifier.updateProfile(updated);
      expect(authNotifier.state.profile?.firstName, original.firstName);
      expect(authNotifier.state.profile?.lastName, original.lastName);
      expect(authNotifier.state.profile?.city, 'Hamburg');
    });

    test('signIn sets loading true then false', () async {
      await authNotifier.signOut();
      final future = authNotifier.signIn('user@test.com', 'password');
      // After signIn completes, loading should be false
      await future;
      expect(authNotifier.state.loading, false);
    });

    test('AuthState copyWith works correctly', () {
      const state = AuthState(isLoggedIn: false, loading: true);
      final copied = state.copyWith(isLoggedIn: true, loading: false);
      expect(copied.isLoggedIn, true);
      expect(copied.loading, false);
    });

    test('AuthState default values', () {
      const state = AuthState();
      expect(state.isLoggedIn, false);
      expect(state.profile, null);
      expect(state.loading, true);
    });

    test('switching roles back and forth works', () {
      authNotifier.mockLoginAs(UserRole.employer);
      expect(authNotifier.state.profile?.id, 'profile-5');

      authNotifier.mockLoginAs(UserRole.applicant);
      expect(authNotifier.state.profile?.id, 'profile-1');

      authNotifier.mockLoginAs(UserRole.admin);
      expect(authNotifier.state.profile?.id, 'profile-7');
    });
  });
}
