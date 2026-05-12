import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_avatar.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';

class EmployerDashboard extends ConsumerWidget {
  const EmployerDashboard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profile = ref.watch(authProvider).profile;
    final employerId = profile?.id ?? '';

    final employerJobs =
        mockJobs.where((j) => j.employerId == employerId).toList();
    final activeJobs =
        employerJobs.where((j) => j.status == 'active').toList();

    final employerJobIds = employerJobs.map((j) => j.id).toSet();
    final employerApplications = mockApplications
        .where((a) => employerJobIds.contains(a.jobId))
        .toList();

    final oneWeekAgo = DateTime.now().subtract(const Duration(days: 7));
    final newThisWeek =
        employerApplications.where((a) => a.createdAt.isAfter(oneWeekAgo)).length;

    final recentApplications = List<Application>.from(employerApplications)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final last5 = recentApplications.take(5).toList();

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Dashboard',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
              const SizedBox(height: 24),

              // Stats cards row
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.briefcase,
                      label: 'Aktive Stellen',
                      value: '${activeJobs.length}',
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.fileText,
                      label: 'Bewerbungen',
                      value: '${employerApplications.length}',
                      color: AppColors.success,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.trendingUp,
                      label: 'Neue diese Woche',
                      value: '$newThisWeek',
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Recent applications section
              Text(
                'Letzte Bewerbungen',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
              const SizedBox(height: 16),

              if (last5.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 32),
                  child: Center(
                    child: Text(
                      'Noch keine Bewerbungen',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                  ),
                )
              else
                ...last5.map((app) {
                  final applicant = app.applicant;
                  final job = app.job ??
                      mockJobs
                          .where((j) => j.id == app.jobId)
                          .firstOrNull;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      onTap: () {
                        if (job != null) {
                          context.go('/employer/listings/${job.id}');
                        }
                      },
                      child: Row(
                        children: [
                          AppAvatar(
                            name: applicant?.fullName ?? 'Bewerber',
                            imageUrl: applicant?.photoUrl,
                            size: AvatarSize.sm,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  applicant?.fullName ?? 'Unbekannt',
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.white
                                        : AppColors.gray900,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  job?.title ?? 'Stelle',
                                  style: GoogleFonts.inter(
                                    fontSize: 12,
                                    color: AppColors.gray500,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              _statusBadge(app.status),
                              const SizedBox(height: 4),
                              Text(
                                _formatDate(app.createdAt),
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  color: AppColors.gray400,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }),

              const SizedBox(height: 24),

              // Create new listing button
              AppButton(
                title: 'Neue Stelle erstellen',
                onPressed: () => context.go('/employer/listings/create'),
                icon: const Icon(LucideIcons.plus),
                fullWidth: true,
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Widget _statusBadge(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return const AppBadge(
            label: 'Ausstehend', variant: BadgeVariant.warning);
      case ApplicationStatus.reviewed:
        return const AppBadge(
            label: 'In Pr\u00fcfung', variant: BadgeVariant.info);
      case ApplicationStatus.accepted:
        return const AppBadge(
            label: 'Angenommen', variant: BadgeVariant.success);
      case ApplicationStatus.rejected:
        return const AppBadge(
            label: 'Abgelehnt', variant: BadgeVariant.error);
    }
  }

  static String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Icon(icon, size: 24, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              color: AppColors.gray500,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
