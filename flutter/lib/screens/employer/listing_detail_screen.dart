import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/services/candidate_scoring.dart';
import 'package:bewerbi_tn_flutter/widgets/app_avatar.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';

class ListingDetailScreen extends ConsumerStatefulWidget {
  const ListingDetailScreen({super.key});

  @override
  ConsumerState<ListingDetailScreen> createState() =>
      _ListingDetailScreenState();
}

class _ListingDetailScreenState extends ConsumerState<ListingDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final jobId = GoRouterState.of(context).pathParameters['id'] ?? '';

    final job = mockJobs.where((j) => j.id == jobId).firstOrNull;
    if (job == null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(LucideIcons.arrowLeft),
            onPressed: () => context.pop(),
          ),
          title: const Text('Stellendetails'),
        ),
        body: const EmptyState(
          icon: LucideIcons.alertCircle,
          title: 'Stelle nicht gefunden',
        ),
      );
    }

    final rawApplications = mockApplications.where((a) => a.jobId == jobId).toList();
    final scoredApplications = CandidateScoring.rankApplications(rawApplications, job);
    final applications = scoredApplications.map((s) => s.application).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        title: const Text('Stellendetails'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Job title
            Text(
              job.title,
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 12),

            // Location and salary
            Row(
              children: [
                Icon(LucideIcons.mapPin, size: 16, color: AppColors.gray500),
                const SizedBox(width: 4),
                Text(
                  job.location,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: AppColors.gray500,
                  ),
                ),
                if (job.salaryRange != null) ...[
                  const SizedBox(width: 16),
                  Icon(LucideIcons.banknote, size: 16, color: AppColors.gray500),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      job.salaryRange!,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
            if (job.germanLevel != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(LucideIcons.languages, size: 16, color: AppColors.gray500),
                  const SizedBox(width: 4),
                  Text(
                    'Deutsch ${job.germanLevel!.name.toUpperCase()}',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppColors.gray500,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 20),

            // Description
            Text(
              'Beschreibung',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              job.description,
              style: GoogleFonts.inter(
                fontSize: 14,
                height: 1.6,
                color: isDark ? AppColors.gray300 : AppColors.gray700,
              ),
            ),
            const SizedBox(height: 20),

            // Requirements
            if (job.requirements.isNotEmpty) ...[
              Text(
                'Anforderungen',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                job.requirements,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  height: 1.6,
                  color: isDark ? AppColors.gray300 : AppColors.gray700,
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Applications header
            const Divider(),
            const SizedBox(height: 16),
            Row(
              children: [
                Text(
                  'Bewerbungen',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
                const SizedBox(width: 8),
                AppBadge(
                  label: '${applications.length}',
                  variant: BadgeVariant.info,
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (scoredApplications.isEmpty)
              const EmptyState(
                icon: LucideIcons.inbox,
                title: 'Noch keine Bewerbungen',
                subtitle:
                    'Sobald sich jemand bewirbt, erscheinen die Bewerbungen hier.',
              )
            else
              // Info-Banner
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E2A3A) : const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? AppColors.darkBorder : const Color(0xFFBFDBFE)),
                ),
                child: Row(
                  children: [
                    Icon(LucideIcons.sparkles, size: 18, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Kandidaten nach Match-Score sortiert. Top-Kandidaten werden zuerst angezeigt.',
                        style: GoogleFonts.inter(fontSize: 12, color: isDark ? AppColors.gray300 : AppColors.primary),
                      ),
                    ),
                  ],
                ),
              ),
            if (scoredApplications.isNotEmpty)
              ...scoredApplications.map((scored) => _ApplicationTile(
                    application: scored.application,
                    score: scored.score,
                    matchLabel: scored.matchLabel,
                    matchColor: scored.matchColor,
                    onAccept: () => _updateStatus(scored.application, ApplicationStatus.accepted),
                    onReject: () => _updateStatus(scored.application, ApplicationStatus.rejected),
                  )),
          ],
        ),
      ),
    );
  }

  void _updateStatus(Application app, ApplicationStatus newStatus) {
    final index = mockApplications.indexWhere((a) => a.id == app.id);
    if (index != -1) {
      mockApplications[index] = mockApplications[index].copyWith(
        status: newStatus,
      );
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            newStatus == ApplicationStatus.accepted
                ? 'Bewerbung angenommen'
                : 'Bewerbung abgelehnt',
          ),
          backgroundColor: newStatus == ApplicationStatus.accepted
              ? AppColors.success
              : AppColors.error,
        ),
      );
    }
  }
}

class _ApplicationTile extends StatelessWidget {
  final Application application;
  final int score;
  final String matchLabel;
  final String matchColor;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const _ApplicationTile({
    required this.application,
    this.score = 0,
    this.matchLabel = '',
    this.matchColor = 'default',
    required this.onAccept,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final applicant = application.applicant ??
        mockProfiles
            .where((p) => p.id == application.applicantId)
            .firstOrNull;

    final coverPreview = application.coverLetter.length > 100
        ? '${application.coverLetter.substring(0, 100)}...'
        : application.coverLetter;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
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
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppColors.white : AppColors.gray900,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _formatDate(application.createdAt),
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.gray400,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // Match Score
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: score >= 80
                            ? const Color(0xFF059669).withValues(alpha: 0.1)
                            : score >= 60
                                ? AppColors.primary.withValues(alpha: 0.1)
                                : score >= 40
                                    ? const Color(0xFFF59E0B).withValues(alpha: 0.1)
                                    : AppColors.gray100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            score >= 80 ? LucideIcons.trophy : score >= 60 ? LucideIcons.star : LucideIcons.barChart2,
                            size: 12,
                            color: score >= 80
                                ? const Color(0xFF059669)
                                : score >= 60
                                    ? AppColors.primary
                                    : score >= 40
                                        ? const Color(0xFFF59E0B)
                                        : AppColors.gray500,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '$score%',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: score >= 80
                                  ? const Color(0xFF059669)
                                  : score >= 60
                                      ? AppColors.primary
                                      : score >= 40
                                          ? const Color(0xFFF59E0B)
                                          : AppColors.gray500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    _statusBadge(application.status),
                  ],
                ),
              ],
            ),
            if (coverPreview.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                coverPreview,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  height: 1.5,
                  color: isDark ? AppColors.gray400 : AppColors.gray600,
                ),
              ),
            ],
            if (application.status == ApplicationStatus.pending ||
                application.status == ApplicationStatus.reviewed) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: AppButton(
                      title: 'Annehmen',
                      onPressed: onAccept,
                      variant: AppButtonVariant.primary,
                      size: AppButtonSize.sm,
                      icon: const Icon(LucideIcons.check),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: AppButton(
                      title: 'Ablehnen',
                      onPressed: onReject,
                      variant: AppButtonVariant.secondary,
                      size: AppButtonSize.sm,
                      icon: const Icon(LucideIcons.x),
                    ),
                  ),
                ],
              ),
            ],
          ],
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
