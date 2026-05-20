import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/widgets/app_gradient_text.dart';
import 'package:bewerbi_tn_flutter/widgets/app_reveal.dart';

class ApplicationsScreen extends ConsumerStatefulWidget {
  const ApplicationsScreen({super.key});

  @override
  ConsumerState<ApplicationsScreen> createState() =>
      _ApplicationsScreenState();
}

class _ApplicationsScreenState extends ConsumerState<ApplicationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profile = ref.read(authProvider).profile;
      if (profile != null) {
        ref.read(jobProvider.notifier).fetchMyApplications(profile.id);
      }
    });
  }

  Future<void> _onRefresh() async {
    final profile = ref.read(authProvider).profile;
    if (profile != null) {
      await ref.read(jobProvider.notifier).fetchMyApplications(profile.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final jobState = ref.watch(jobProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final applications = jobState.myApplications;

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with gradient icon + GradientText
            AppReveal(
              direction: AppRevealDirection.up,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 4),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [AppColors.primary, Color(0xFF6D4CF7)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            offset: const Offset(0, 6),
                            blurRadius: 12,
                          ),
                        ],
                      ),
                      child: const Icon(LucideIcons.fileText, size: 24, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AppGradientText(
                            'Meine Bewerbungen',
                            variant: GradientVariant.brand,
                            style: GoogleFonts.inter(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${applications.length} Bewerbung${applications.length != 1 ? 'en' : ''}',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: AppColors.gray500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),

            // List
            Expanded(
              child: jobState.loading
                  ? const Center(child: CircularProgressIndicator())
                  : applications.isEmpty
                      ? _buildEmptyState(isDark)
                      : RefreshIndicator(
                          onRefresh: _onRefresh,
                          color: AppColors.primary,
                          child: ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding:
                                const EdgeInsets.symmetric(horizontal: 20),
                            itemCount: applications.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(height: 12),
                            itemBuilder: (context, index) {
                              return _ApplicationCard(
                                application: applications[index],
                                isDark: isDark,
                              );
                            },
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.fileText,
            size: 48,
            color: isDark ? AppColors.gray600 : AppColors.gray300,
          ),
          const SizedBox(height: 16),
          Text(
            'Noch keine Bewerbungen',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.gray400 : AppColors.gray500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Entdecken Sie Stellenangebote und bewerben Sie sich!',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.gray400,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ApplicationCard extends StatelessWidget {
  final Application application;
  final bool isDark;

  const _ApplicationCard({
    required this.application,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final statusInfo = _getStatusInfo(application.status);
    final dateStr = DateFormat('d. MMMM yyyy', 'de_DE')
        .format(application.createdAt);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.sm,
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            // Left colored border
            Container(
              width: 4,
              decoration: BoxDecoration(
                color: statusInfo.color,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    // Status icon
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: statusInfo.color.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        statusInfo.icon,
                        size: 18,
                        color: statusInfo.color,
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            application.job?.title ?? 'Unbekannte Stelle',
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? AppColors.white
                                  : AppColors.gray900,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            application.job?.employer?.fullName ?? '',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: AppColors.gray500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Beworben am $dateStr',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.gray400,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Status badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusInfo.color.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        statusInfo.label,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: statusInfo.color,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  _StatusInfo _getStatusInfo(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return _StatusInfo(
          color: AppColors.warning,
          icon: LucideIcons.clock,
          label: 'Ausstehend',
        );
      case ApplicationStatus.reviewed:
        return _StatusInfo(
          color: AppColors.primary,
          icon: LucideIcons.eye,
          label: 'Geprüft',
        );
      case ApplicationStatus.accepted:
        return _StatusInfo(
          color: AppColors.success,
          icon: LucideIcons.checkCircle,
          label: 'Angenommen',
        );
      case ApplicationStatus.rejected:
        return _StatusInfo(
          color: AppColors.error,
          icon: LucideIcons.xCircle,
          label: 'Abgelehnt',
        );
    }
  }
}

class _StatusInfo {
  final Color color;
  final IconData icon;
  final String label;

  const _StatusInfo({
    required this.color,
    required this.icon,
    required this.label,
  });
}
