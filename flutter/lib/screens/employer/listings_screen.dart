import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';

class ListingsScreen extends ConsumerWidget {
  const ListingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profile = ref.watch(authProvider).profile;
    final employerId = profile?.id ?? '';

    final employerJobs =
        mockJobs.where((j) => j.employerId == employerId).toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Text(
                'Meine Stellenanzeigen',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
            ),
            Expanded(
              child: employerJobs.isEmpty
                  ? const EmptyState(
                      icon: LucideIcons.briefcase,
                      title: 'Keine Stellenanzeigen',
                      subtitle:
                          'Erstellen Sie Ihre erste Stellenanzeige.',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                      itemCount: employerJobs.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final job = employerJobs[index];
                        return _JobListingCard(job: job);
                      },
                    ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/employer/listings/create'),
        backgroundColor: AppColors.primary,
        child: const Icon(LucideIcons.plus, color: AppColors.white),
      ),
    );
  }
}

class _JobListingCard extends StatelessWidget {
  final Job job;

  const _JobListingCard({required this.job});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isActive = job.status == 'active';

    final applicationCount =
        mockApplications.where((a) => a.jobId == job.id).length;

    return AppCard(
      onTap: () => context.go('/employer/listings/${job.id}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  job.title,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
              ),
              IconButton(
                icon: Icon(
                  LucideIcons.pencil,
                  size: 18,
                  color: isDark ? AppColors.gray400 : AppColors.gray500,
                ),
                onPressed: () =>
                    context.go('/employer/listings/edit/${job.id}'),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
                tooltip: 'Bearbeiten',
              ),
              const SizedBox(width: 4),
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                LucideIcons.mapPin,
                size: 14,
                color: AppColors.gray500,
              ),
              const SizedBox(width: 4),
              Text(
                job.location,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.gray500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              AppBadge(
                label: _categoryLabel(job.category),
                variant: BadgeVariant.info,
              ),
              AppBadge(
                label: _typeLabel(job.type),
                variant: BadgeVariant.defaultVariant,
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                LucideIcons.users,
                size: 14,
                color: AppColors.gray500,
              ),
              const SizedBox(width: 4),
              Text(
                '$applicationCount Bewerbung${applicationCount == 1 ? '' : 'en'}',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.gray500,
                ),
              ),
              const Spacer(),
              Text(
                isActive ? 'Aktiv' : 'Geschlossen',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isActive ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  static String _categoryLabel(JobCategory category) {
    switch (category) {
      case JobCategory.it:
        return 'IT';
      case JobCategory.pflege:
        return 'Pflege';
      case JobCategory.transport:
        return 'Transport';
      case JobCategory.sonstige:
        return 'Sonstige';
    }
  }

  static String _typeLabel(JobType type) {
    switch (type) {
      case JobType.job:
        return 'Stelle';
      case JobType.ausbildung:
        return 'Ausbildung';
      case JobType.studium:
        return 'Studium';
      case JobType.sprachkurs:
        return 'Sprachkurs';
    }
  }
}
