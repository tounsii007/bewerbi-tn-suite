import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/job_presentation.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/services/chat_service.dart';
import 'package:bewerbi_tn_flutter/widgets/app_input.dart';

part 'job_detail/job_detail_constants.dart';
part 'job_detail/job_detail_widgets.dart';
part 'job_detail/job_detail_apply_sheet.dart';

class JobDetailScreen extends ConsumerWidget {
  const JobDetailScreen({super.key, required this.jobId});

  final String jobId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobState = ref.watch(jobProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final matchingJobs = jobState.jobs.where(
      (candidate) => candidate.id == jobId,
    );
    final job = matchingJobs.isNotEmpty ? matchingJobs.first : null;

    if (job == null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Text(
            'Stelle nicht gefunden',
            style: GoogleFonts.inter(fontSize: 16, color: AppColors.gray500),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.share2, size: 20),
            onPressed: () => _shareJob(context, job),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: _JobDetailUi.screenPadding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    job.title,
                    style: GoogleFonts.inter(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: isDark ? AppColors.white : AppColors.gray900,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    job.employer?.fullName ?? '',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: [
                      _JobBadge(
                        icon: LucideIcons.mapPin,
                        text: job.location,
                        isDark: isDark,
                      ),
                      _JobBadge(
                        icon: LucideIcons.briefcase,
                        text: job.type.labelDe,
                        isDark: isDark,
                      ),
                      _JobBadge(
                        icon: LucideIcons.tag,
                        text: job.category.labelDe,
                        isDark: isDark,
                      ),
                      if (job.germanLevel case final level?)
                        _JobBadge(
                          icon: LucideIcons.languages,
                          text: 'Deutsch ${level.labelDe}',
                          isDark: isDark,
                        ),
                      if (job.salaryRange case final salary?)
                        _JobBadge(
                          icon: LucideIcons.banknote,
                          text: salary,
                          isDark: isDark,
                        ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xxl),
                  _JobSection(
                    title: 'Beschreibung',
                    content: job.description,
                    isDark: isDark,
                  ),
                  if (job.requirements.isNotEmpty) ...[
                    const SizedBox(height: AppSpacing.xl),
                    _JobSection(
                      title: 'Anforderungen',
                      content: job.requirements,
                      isDark: isDark,
                    ),
                  ],
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
          _JobDetailBottomBar(
            isDark: isDark,
            onApply: () => _showApplyDialog(context, ref, job),
            onContactEmployer: () => _contactEmployer(context, ref, job),
          ),
        ],
      ),
    );
  }

  void _shareJob(BuildContext context, Job job) {
    final shareText =
        '${job.title} bei ${job.employer?.fullName ?? "bewerbi.tn"}\n'
        '\u{1F4CD} ${job.location}\n'
        '\u{1F4B0} ${job.salaryRange ?? "Gehalt nach Vereinbarung"}\n\n'
        'Jetzt bewerben auf bewerbi.tn!\nhttps://bewerbi.tn/jobs/${job.id}';

    Clipboard.setData(ClipboardData(text: shareText));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(LucideIcons.copy, color: AppColors.white, size: 16),
            const SizedBox(width: AppSpacing.sm),
            Text(
              'Link kopiert! Jetzt teilen.',
              style: GoogleFonts.inter(fontSize: 13),
            ),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.mdRadius),
      ),
    );
  }

  void _contactEmployer(BuildContext context, WidgetRef ref, Job job) {
    final profile = ref.read(authProvider).profile;
    final conversation = ChatService.createConversation(
      profile?.userId ?? '',
      job.employerId,
      job.id,
      job.title,
    );
    context.push('/applicant/messages/${conversation.id}');
  }

  void _showApplyDialog(BuildContext context, WidgetRef ref, Job job) {
    final profile = ref.read(authProvider).profile;
    final alreadyApplied = ref
        .read(jobProvider)
        .myApplications
        .any((entry) => entry.jobId == job.id);
    if (alreadyApplied) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Du hast dich bereits auf diese Stelle beworben.'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return _ApplyBottomSheet(
          job: job,
          profile: profile,
          ref: ref,
          parentContext: context,
        );
      },
    );
  }
}
