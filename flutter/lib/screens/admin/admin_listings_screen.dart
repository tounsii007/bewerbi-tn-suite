import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';

class AdminListingsScreen extends ConsumerStatefulWidget {
  const AdminListingsScreen({super.key});

  @override
  ConsumerState<AdminListingsScreen> createState() =>
      _AdminListingsScreenState();
}

class _AdminListingsScreenState extends ConsumerState<AdminListingsScreen> {
  String _filter = 'Alle';

  List<Job> get _filteredJobs {
    switch (_filter) {
      case 'Aktiv':
        return mockJobs.where((j) => j.status == 'active').toList();
      case 'Geschlossen':
        return mockJobs.where((j) => j.status != 'active').toList();
      default:
        return List.from(mockJobs);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final jobs = _filteredJobs;

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 4),
              child: Text(
                'Stellenverwaltung',
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
              child: Text(
                '${jobs.length} Stellen',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.gray500,
                ),
              ),
            ),

            // Filter chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: ['Alle', 'Aktiv', 'Geschlossen']
                    .map((label) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: FilterChip(
                            label: Text(label),
                            selected: _filter == label,
                            onSelected: (_) =>
                                setState(() => _filter = label),
                            selectedColor: AppColors.primaryBg,
                            checkmarkColor: AppColors.primary,
                            labelStyle: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: _filter == label
                                  ? AppColors.primary
                                  : (isDark
                                      ? AppColors.gray300
                                      : AppColors.gray600),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 12),

            // Jobs list
            Expanded(
              child: jobs.isEmpty
                  ? const EmptyState(
                      icon: LucideIcons.briefcase,
                      title: 'Keine Stellen gefunden',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      itemCount: jobs.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final job = jobs[index];
                        return _AdminJobCard(
                          job: job,
                          onToggleStatus: () => _toggleStatus(job),
                          onDelete: () => _confirmDelete(job),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _toggleStatus(Job job) {
    final index = mockJobs.indexWhere((j) => j.id == job.id);
    if (index != -1) {
      final newStatus = job.status == 'active' ? 'closed' : 'active';
      mockJobs[index] = mockJobs[index].copyWith(status: newStatus);
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            newStatus == 'active'
                ? 'Stelle aktiviert'
                : 'Stelle geschlossen',
          ),
        ),
      );
    }
  }

  void _confirmDelete(Job job) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Stelle l\u00f6schen'),
        content: Text(
          'M\u00f6chten Sie die Stelle "${job.title}" wirklich l\u00f6schen?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () {
              mockJobs.removeWhere((j) => j.id == job.id);
              Navigator.of(ctx).pop();
              setState(() {});
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('"${job.title}" wurde gel\u00f6scht.'),
                ),
              );
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('L\u00f6schen'),
          ),
        ],
      ),
    );
  }
}

class _AdminJobCard extends StatelessWidget {
  final Job job;
  final VoidCallback onToggleStatus;
  final VoidCallback onDelete;

  const _AdminJobCard({
    required this.job,
    required this.onToggleStatus,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isActive = job.status == 'active';

    final employer = job.employer ??
        mockProfiles.where((p) => p.id == job.employerId).firstOrNull;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  job.title,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
              ),
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
          const SizedBox(height: 6),
          Text(
            employer?.fullName ?? 'Unbekannt',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.gray500,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(LucideIcons.mapPin, size: 14, color: AppColors.gray400),
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
              InkWell(
                onTap: onToggleStatus,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.warningLight
                        : AppColors.successLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isActive
                            ? LucideIcons.pause
                            : LucideIcons.play,
                        size: 14,
                        color: isActive
                            ? AppColors.warning
                            : AppColors.success,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isActive ? 'Schlie\u00dfen' : 'Aktivieren',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: isActive
                              ? AppColors.warning
                              : AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(LucideIcons.trash2, size: 18),
                color: AppColors.error,
                onPressed: onDelete,
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
