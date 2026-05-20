import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/services/profile_completeness.dart';
import 'package:bewerbi_tn_flutter/widgets/job_card.dart';
import 'package:bewerbi_tn_flutter/widgets/skeleton_loader.dart';
import 'package:bewerbi_tn_flutter/widgets/verify_email_banner.dart';
import 'package:bewerbi_tn_flutter/widgets/app_aurora_background.dart';
import 'package:bewerbi_tn_flutter/widgets/app_gradient_text.dart';
import 'package:bewerbi_tn_flutter/widgets/app_number_ticker.dart';
import 'package:bewerbi_tn_flutter/widgets/app_reveal.dart';

part 'home/home_screen_constants.dart';
part 'home/home_screen_painter.dart';
part 'home/home_screen_widgets.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(jobProvider.notifier).fetchJobs();
      ref.read(jobProvider.notifier).fetchFavorites();
      final profile = ref.read(authProvider).profile;
      if (profile != null) {
        ref.read(jobProvider.notifier).fetchMyApplications(profile.id);
        ref.read(jobProvider.notifier).fetchRecommendations(profile.userId);
      }
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(jobProvider.notifier).fetchJobs();
    final profile = ref.read(authProvider).profile;
    if (profile != null) {
      await ref.read(jobProvider.notifier).fetchMyApplications(profile.id);
    }
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final jobState = ref.watch(jobProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final profile = authState.profile;
    final firstName = profile?.firstName ?? 'Benutzer';

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.surfaceAlt,
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        color: AppColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const VerifyEmailBanner(),
              // Hero card
              _buildHeroCard(
                context,
                firstName: firstName,
                applicationsCount: jobState.myApplications.length,
                favoritesCount: jobState.favorites.length,
                openJobsCount: jobState.jobs.length,
                isDark: isDark,
              ),

              const SizedBox(height: AppSpacing.xxl),

              // Profile completeness
              _buildProfileCompleteness(context, isDark),

              const SizedBox(height: AppSpacing.section),

              // Categories
              _buildCategoriesSection(context, isDark),

              const SizedBox(height: AppSpacing.section),

              // Recommendations
              if (jobState.recommendations.isNotEmpty)
                _buildRecommendationsSection(context, jobState, isDark),

              // Latest jobs
              _buildLatestJobsSection(context, jobState, isDark),

              // Bottom padding for tab bar
              const SizedBox(height: AppSpacing.bottomNavClearance),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroCard(
    BuildContext context, {
    required String firstName,
    required int applicationsCount,
    required int favoritesCount,
    required int openJobsCount,
    required bool isDark,
  }) {
    // Iter 139 — refactored from a solid-gradient container with custom-
    // painted dot pattern to a multi-blob AppAuroraBackground. Inner
    // content stays the same; just the chrome changes.
    return AppReveal(
      direction: AppRevealDirection.up,
      child: Container(
        margin: _HomeScreenUi.heroMargin,
        decoration: BoxDecoration(
          borderRadius: AppRadii.pillRadius,
          boxShadow: AppShadows.primaryGlow(_HomeScreenUi.heroGlowOpacity),
        ),
        child: AppAuroraBackground(
          variant: AuroraVariant.vivid,
          borderRadius: AppRadii.pillRadius,
          child: Padding(
            padding: AppSpacing.cardPadding,
            child: SafeArea(
              bottom: false,
              child: Column(
                children: [
                  // Top row: avatar + greeting + bell
                  Row(
                    children: [
                      // Avatar — small white frame on aurora
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.darkCard.withValues(alpha: 0.7)
                              : AppColors.white.withValues(alpha: 0.8),
                          borderRadius: BorderRadius.circular(15),
                          border: Border.all(
                            color: isDark
                                ? AppColors.darkBorder
                                : AppColors.white,
                            width: 1.5,
                          ),
                        ),
                        child: Center(
                          child: Icon(
                            Icons.person,
                            color: AppColors.primary,
                            size: 26,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${_greeting()}, $firstName!',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.0,
                                color: isDark
                                    ? AppColors.gray300
                                    : AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            AppGradientText(
                              'bewerbi.tn',
                              variant: GradientVariant.brand,
                              style: GoogleFonts.inter(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Notification bell with badge
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.darkCard.withValues(alpha: 0.6)
                                  : AppColors.white.withValues(alpha: 0.75),
                              borderRadius: BorderRadius.circular(13),
                            ),
                            child: IconButton(
                              onPressed: () => context.push(
                                '/applicant/home/notifications',
                              ),
                              padding: EdgeInsets.zero,
                              icon: Icon(
                                LucideIcons.bell,
                                color: isDark
                                    ? AppColors.gray300
                                    : AppColors.primary,
                                size: 20,
                              ),
                            ),
                          ),
                          Positioned(
                            top: -2,
                            right: -2,
                            child: Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: AppColors.errorAccent,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isDark
                                      ? AppColors.darkCard
                                      : AppColors.white,
                                  width: 2,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),

                  // Stats row — re-themed for aurora background
                  Row(
                    children: [
                      _AuroraStatBox(
                        count: applicationsCount,
                        label: 'Bewerbungen',
                        isDark: isDark,
                      ),
                      const SizedBox(width: 10),
                      _AuroraStatBox(
                        count: favoritesCount,
                        label: 'Favoriten',
                        isDark: isDark,
                      ),
                      const SizedBox(width: 10),
                      _AuroraStatBox(
                        count: openJobsCount,
                        label: 'Offene Stellen',
                        isDark: isDark,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCompleteness(BuildContext context, bool isDark) {
    final profile = ref.watch(authProvider).profile;
    final result = ProfileCompleteness.compute(profile);
    final completeness = result.percent / 100.0;
    final percentText = '${result.percent}%';

    return GestureDetector(
      onTap: () => context.go('/applicant/profile'),
      child: Container(
        margin: _HomeScreenUi.horizontalSectionMargin,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: isDark
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    _HomeScreenUi.darkProfileGradientStart.withValues(
                      alpha: 0.7,
                    ),
                    AppColors.darkCard,
                  ],
                )
              : const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    _HomeScreenUi.profileGradientStart,
                    AppColors.white,
                  ],
                ),
          borderRadius: AppRadii.xlRadius,
          boxShadow: AppShadows.sm,
          border: Border.all(
            color: isDark
                ? AppColors.darkBorder
                : AppColors.primary.withValues(alpha: AppAlphas.soft),
          ),
        ),
        child: Row(
          children: [
            // Progress circle
            SizedBox(
              width: 44,
              height: 44,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: CircularProgressIndicator(
                      value: completeness,
                      strokeWidth: 4,
                      strokeCap: StrokeCap.round,
                      backgroundColor: isDark
                          ? AppColors.darkBorder
                          : AppColors.gray200,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        AppColors.primary,
                      ),
                    ),
                  ),
                  Text(
                    percentText,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.white : AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Profil-Vollst\u00e4ndigkeit',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.white : AppColors.gray800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Progress bar with embedded percentage
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: SizedBox(
                          height: 20,
                          child: LinearProgressIndicator(
                            value: completeness,
                            backgroundColor: isDark
                                ? AppColors.darkBorder
                                : AppColors.gray200,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              AppColors.primary,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 20,
                        child: Center(
                          child: Text(
                            '$percentText vollst\u00e4ndig',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.white.withValues(alpha: AppAlphas.faint)
                    : AppColors.primary.withValues(alpha: AppAlphas.faint),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.chevron_right,
                size: 20,
                color: isDark ? AppColors.gray400 : AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoriesSection(BuildContext context, bool isDark) {
    final categories = [
      _CategoryItem('IT', LucideIcons.monitor, AppColors.primary),
      _CategoryItem('Pflege', LucideIcons.heartPulse, AppColors.error),
      _CategoryItem('Transport', LucideIcons.truck, AppColors.warning),
      _CategoryItem('Ausbildung', LucideIcons.graduationCap, AppColors.success),
      _CategoryItem('Sprachkurs', LucideIcons.languages, AppColors.info),
      _CategoryItem('Sonstige', LucideIcons.layoutGrid, AppColors.gray500),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: _HomeScreenUi.horizontalSectionPadding,
          child: Text(
            'Kategorien',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            ),
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: _HomeScreenUi.categoryCardHeight,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: _HomeScreenUi.horizontalSectionPadding,
            itemCount: categories.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final cat = categories[index];
              return _CategoryCard(
                label: cat.label,
                icon: cat.icon,
                color: cat.color,
                isDark: isDark,
                onTap: () {
                  context.go('/applicant/search');
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendationsSection(
    BuildContext context,
    JobState jobState,
    bool isDark,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: _HomeScreenUi.horizontalSectionPadding,
          child: Row(
            children: [
              Icon(
                LucideIcons.sparkles,
                size: 20,
                color: isDark ? AppColors.primaryLight : AppColors.primary,
              ),
              const SizedBox(width: 8),
              Text(
                'Empfohlen f\u00fcr dich',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: _HomeScreenUi.recommendationCardHeight,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: _HomeScreenUi.horizontalSectionPadding,
            itemCount: jobState.recommendations.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final rec = jobState.recommendations[index];
              return _RecommendationCard(
                rec: rec,
                isDark: isDark,
                onTap: () => context.go('/applicant/home/${rec.job.id}'),
              );
            },
          ),
        ),
        const SizedBox(height: AppSpacing.section),
      ],
    );
  }

  Widget _buildLatestJobsSection(
    BuildContext context,
    JobState jobState,
    bool isDark,
  ) {
    final jobs = jobState.jobs.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section divider
        Padding(
          padding: _HomeScreenUi.horizontalSectionPadding,
          child: Container(
            height: 1,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  isDark ? AppColors.darkBorder : AppColors.gray200,
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        Padding(
          padding: _HomeScreenUi.horizontalSectionPadding,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Neueste Angebote',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
              GestureDetector(
                onTap: () => context.go('/applicant/search'),
                child: Container(
                  padding: _HomeScreenUi.seeAllPadding,
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppColors.primary.withValues(alpha: AppAlphas.muted)
                        : AppColors.primary.withValues(alpha: AppAlphas.faint),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Alle anzeigen \u2192',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        if (jobState.loading)
          Padding(
            padding: _HomeScreenUi.horizontalSectionPadding,
            child: Column(
              children: List.generate(3, (_) => const JobCardSkeleton()),
            ),
          )
        else if (jobState.error != null)
          Padding(
            padding: _HomeScreenUi.horizontalSectionPadding,
            child: _HomeErrorBanner(
              message: jobState.error!,
              onRetry: _onRefresh,
              isDark: isDark,
            ),
          )
        else if (jobs.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Text(
                'Keine Angebote verf\u00fcgbar',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppColors.gray500,
                ),
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: _HomeScreenUi.horizontalSectionPadding,
            itemCount: jobs.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final job = jobs[index];
              return JobCard(
                job: job,
                onTap: () => context.go('/applicant/home/${job.id}'),
                isFavorite: jobState.favorites.contains(job.id),
                onFavorite: () =>
                    ref.read(jobProvider.notifier).toggleFavorite(job.id),
              );
            },
          ),
      ],
    );
  }
}
