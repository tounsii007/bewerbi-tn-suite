import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';

// Screens
import 'package:bewerbi_tn_flutter/screens/splash_screen.dart';
import 'package:bewerbi_tn_flutter/screens/auth/login_screen.dart';
import 'package:bewerbi_tn_flutter/screens/auth/register_screen.dart';
import 'package:bewerbi_tn_flutter/screens/auth/forgot_password_screen.dart';
import 'package:bewerbi_tn_flutter/screens/auth/reset_password_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/home_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/search_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/applications_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/profile_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/settings_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/job_detail_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/edit_profile_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/education_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/experience_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/languages_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/documents_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/favorites_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/notifications_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/chat_list_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/chat_detail_screen.dart';
import 'package:bewerbi_tn_flutter/screens/employer/employer_dashboard.dart';
import 'package:bewerbi_tn_flutter/screens/employer/listings_screen.dart';
import 'package:bewerbi_tn_flutter/screens/employer/create_listing_screen.dart';
import 'package:bewerbi_tn_flutter/screens/employer/edit_listing_screen.dart';
import 'package:bewerbi_tn_flutter/screens/employer/listing_detail_screen.dart';
import 'package:bewerbi_tn_flutter/screens/employer/employer_profile_screen.dart';
import 'package:bewerbi_tn_flutter/screens/onboarding_screen.dart';
import 'package:bewerbi_tn_flutter/screens/admin/admin_users_screen.dart';
import 'package:bewerbi_tn_flutter/screens/admin/admin_listings_screen.dart';
import 'package:bewerbi_tn_flutter/screens/admin/admin_reports_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/account_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/change_password_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/sessions_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/onboarding_quiz_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/saved_searches_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/anerkennung_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/visa_screen.dart';
import 'package:bewerbi_tn_flutter/screens/applicant/cv_upload_screen.dart';
import 'package:bewerbi_tn_flutter/screens/legal/privacy_policy_screen.dart';
import 'package:bewerbi_tn_flutter/screens/legal/terms_screen.dart';
import 'package:bewerbi_tn_flutter/screens/legal/impressum_screen.dart';
import 'package:bewerbi_tn_flutter/screens/legal/support_screen.dart';

// ---------------------------------------------------------------------------
// Shell scaffold for bottom navigation
// ---------------------------------------------------------------------------

class _ScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const _ScaffoldWithNavBar({required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.home),
            selectedIcon: Icon(LucideIcons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.search),
            selectedIcon: Icon(LucideIcons.search),
            label: 'Suchen',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.fileText),
            selectedIcon: Icon(LucideIcons.fileText),
            label: 'Bewerbungen',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.heart),
            selectedIcon: Icon(LucideIcons.heart),
            label: 'Favoriten',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.user),
            selectedIcon: Icon(LucideIcons.user),
            label: 'Profil',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.settings),
            selectedIcon: Icon(LucideIcons.settings),
            label: 'Einstellungen',
          ),
        ],
      ),
    );
  }
}

class _EmployerScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const _EmployerScaffoldWithNavBar({required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.layoutDashboard),
            selectedIcon: Icon(LucideIcons.layoutDashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.briefcase),
            selectedIcon: Icon(LucideIcons.briefcase),
            label: 'Anzeigen',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.building),
            selectedIcon: Icon(LucideIcons.building),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}

class _AdminScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const _AdminScaffoldWithNavBar({required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.users),
            selectedIcon: Icon(LucideIcons.users),
            label: 'Benutzer',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.listChecks),
            selectedIcon: Icon(LucideIcons.listChecks),
            label: 'Anzeigen',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.barChart3),
            selectedIcon: Icon(LucideIcons.barChart3),
            label: 'Berichte',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Navigator keys for each branch
// ---------------------------------------------------------------------------

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final _applicantHomeKey = GlobalKey<NavigatorState>(
  debugLabel: 'applicantHome',
);
final _applicantSearchKey = GlobalKey<NavigatorState>(
  debugLabel: 'applicantSearch',
);
final _applicantApplicationsKey = GlobalKey<NavigatorState>(
  debugLabel: 'applicantApplications',
);
final _applicantFavoritesKey = GlobalKey<NavigatorState>(
  debugLabel: 'applicantFavorites',
);
final _applicantProfileKey = GlobalKey<NavigatorState>(
  debugLabel: 'applicantProfile',
);
final _applicantSettingsKey = GlobalKey<NavigatorState>(
  debugLabel: 'applicantSettings',
);

final _employerDashboardKey = GlobalKey<NavigatorState>(
  debugLabel: 'employerDashboard',
);
final _employerListingsKey = GlobalKey<NavigatorState>(
  debugLabel: 'employerListings',
);
final _employerProfileKey = GlobalKey<NavigatorState>(
  debugLabel: 'employerProfile',
);

final _adminUsersKey = GlobalKey<NavigatorState>(debugLabel: 'adminUsers');
final _adminListingsKey = GlobalKey<NavigatorState>(
  debugLabel: 'adminListings',
);
final _adminReportsKey = GlobalKey<NavigatorState>(debugLabel: 'adminReports');

// ---------------------------------------------------------------------------
// Router provider
// ---------------------------------------------------------------------------

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, routerState) {
      final loggedIn = authState.isLoggedIn;
      final isLoading = authState.loading;
      final path = routerState.matchedLocation;

      // While loading, stay on splash
      if (isLoading) return '/';

      // Auth routes — public, no session required. Includes the
      // deep-link landing page for password reset so a stale session does
      // not redirect the user away from the reset link.
      final isAuthRoute = path == '/login' ||
          path == '/register' ||
          path == '/forgot-password' ||
          path.startsWith('/reset-password');

      if (!loggedIn && !isAuthRoute && path != '/' && path != '/onboarding') {
        return '/login';
      }

      if (loggedIn && (isAuthRoute || path == '/')) {
        final role = authState.profile?.role ?? UserRole.applicant;
        switch (role) {
          case UserRole.applicant:
            return '/applicant/home';
          case UserRole.employer:
            return '/employer/dashboard';
          case UserRole.admin:
            return '/admin/users';
        }
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(path: '/', builder: (context, state) => const SplashScreen()),

      // Onboarding
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/applicant/onboarding-quiz',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const OnboardingQuizScreen(),
      ),
      GoRoute(
        path: '/applicant/saved-searches',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SavedSearchesScreen(),
      ),
      GoRoute(
        path: '/applicant/anerkennung',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AnerkennungScreen(),
      ),
      GoRoute(
        path: '/applicant/visa',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const VisaScreen(),
      ),
      GoRoute(
        path: '/applicant/cv-upload',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CvUploadScreen(),
      ),

      // Auth routes
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          // Token arrives via `?token=…` deep link from the email.
          final token = state.uri.queryParameters['token'] ?? '';
          return ResetPasswordScreen(token: token);
        },
      ),

      // -----------------------------------------------------------------------
      // Applicant shell
      // -----------------------------------------------------------------------
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            _ScaffoldWithNavBar(navigationShell: navigationShell),
        branches: [
          // Home branch
          StatefulShellBranch(
            navigatorKey: _applicantHomeKey,
            routes: [
              GoRoute(
                path: '/applicant/home',
                builder: (context, state) => const HomeScreen(),
                routes: [
                  GoRoute(
                    path: 'notifications',
                    builder: (context, state) => const NotificationsScreen(),
                  ),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => JobDetailScreen(
                      jobId: state.pathParameters['id'] ?? '',
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Search branch
          StatefulShellBranch(
            navigatorKey: _applicantSearchKey,
            routes: [
              GoRoute(
                path: '/applicant/search',
                builder: (context, state) => const SearchScreen(),
              ),
            ],
          ),

          // Applications branch
          StatefulShellBranch(
            navigatorKey: _applicantApplicationsKey,
            routes: [
              GoRoute(
                path: '/applicant/applications',
                builder: (context, state) => const ApplicationsScreen(),
              ),
            ],
          ),

          // Favorites branch
          StatefulShellBranch(
            navigatorKey: _applicantFavoritesKey,
            routes: [
              GoRoute(
                path: '/applicant/favorites',
                builder: (context, state) => const FavoritesScreen(),
              ),
            ],
          ),

          // Profile branch
          StatefulShellBranch(
            navigatorKey: _applicantProfileKey,
            routes: [
              GoRoute(
                path: '/applicant/profile',
                builder: (context, state) => const ProfileScreen(),
                routes: [
                  GoRoute(
                    path: 'edit',
                    builder: (context, state) => const EditProfileScreen(),
                  ),
                  GoRoute(
                    path: 'education',
                    builder: (context, state) => const EducationScreen(),
                  ),
                  GoRoute(
                    path: 'experience',
                    builder: (context, state) => const ExperienceScreen(),
                  ),
                  GoRoute(
                    path: 'languages',
                    builder: (context, state) => const LanguagesScreen(),
                  ),
                  GoRoute(
                    path: 'documents',
                    builder: (context, state) => const DocumentsScreen(),
                  ),
                ],
              ),
            ],
          ),

          // Settings branch
          StatefulShellBranch(
            navigatorKey: _applicantSettingsKey,
            routes: [
              GoRoute(
                path: '/applicant/settings',
                builder: (context, state) => const SettingsScreen(),
                routes: [
                  GoRoute(
                    path: 'account',
                    builder: (context, state) => const AccountScreen(),
                  ),
                  GoRoute(
                    path: 'change-password',
                    builder: (context, state) => const ChangePasswordScreen(),
                  ),
                  GoRoute(
                    path: 'sessions',
                    builder: (context, state) => const SessionsScreen(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      // -----------------------------------------------------------------------
      // Chat / Messages (accessible from anywhere)
      // -----------------------------------------------------------------------
      GoRoute(
        path: '/applicant/messages',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ChatListScreen(),
      ),
      GoRoute(
        path: '/applicant/messages/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) =>
            ChatDetailScreen(conversationId: state.pathParameters['id'] ?? ''),
      ),

      // -----------------------------------------------------------------------
      // Legal pages (accessible from anywhere)
      // -----------------------------------------------------------------------
      GoRoute(
        path: '/legal/privacy',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/legal/terms',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const TermsScreen(),
      ),
      GoRoute(
        path: '/legal/impressum',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ImpressumScreen(),
      ),
      GoRoute(
        path: '/legal/support',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SupportScreen(),
      ),

      // -----------------------------------------------------------------------
      // Employer shell
      // -----------------------------------------------------------------------
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            _EmployerScaffoldWithNavBar(navigationShell: navigationShell),
        branches: [
          // Dashboard branch
          StatefulShellBranch(
            navigatorKey: _employerDashboardKey,
            routes: [
              GoRoute(
                path: '/employer/dashboard',
                builder: (context, state) => const EmployerDashboard(),
              ),
            ],
          ),

          // Listings branch
          StatefulShellBranch(
            navigatorKey: _employerListingsKey,
            routes: [
              GoRoute(
                path: '/employer/listings',
                builder: (context, state) => const ListingsScreen(),
                routes: [
                  GoRoute(
                    path: 'create',
                    builder: (context, state) => const CreateListingScreen(),
                  ),
                  GoRoute(
                    path: 'edit/:id',
                    builder: (context, state) => EditListingScreen(
                      jobId: state.pathParameters['id'] ?? '',
                    ),
                  ),
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => const ListingDetailScreen(),
                  ),
                ],
              ),
            ],
          ),

          // Employer profile branch
          StatefulShellBranch(
            navigatorKey: _employerProfileKey,
            routes: [
              GoRoute(
                path: '/employer/profile',
                builder: (context, state) => const EmployerProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      // -----------------------------------------------------------------------
      // Admin shell
      // -----------------------------------------------------------------------
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            _AdminScaffoldWithNavBar(navigationShell: navigationShell),
        branches: [
          // Users branch
          StatefulShellBranch(
            navigatorKey: _adminUsersKey,
            routes: [
              GoRoute(
                path: '/admin/users',
                builder: (context, state) => const AdminUsersScreen(),
              ),
            ],
          ),

          // Admin listings branch
          StatefulShellBranch(
            navigatorKey: _adminListingsKey,
            routes: [
              GoRoute(
                path: '/admin/listings',
                builder: (context, state) => const AdminListingsScreen(),
              ),
            ],
          ),

          // Reports branch
          StatefulShellBranch(
            navigatorKey: _adminReportsKey,
            routes: [
              GoRoute(
                path: '/admin/reports',
                builder: (context, state) => const AdminReportsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
