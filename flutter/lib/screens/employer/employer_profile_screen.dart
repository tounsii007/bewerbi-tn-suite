import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_avatar.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';

class EmployerProfileScreen extends ConsumerWidget {
  const EmployerProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profile = ref.watch(authProvider).profile;

    if (profile == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final employerJobs =
        mockJobs.where((j) => j.employerId == profile.id).toList();
    final employerJobIds = employerJobs.map((j) => j.id).toSet();
    final totalApplications =
        mockApplications.where((a) => employerJobIds.contains(a.jobId)).length;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              const SizedBox(height: 20),

              // Company avatar
              AppAvatar(
                name: profile.fullName,
                imageUrl: profile.photoUrl,
                size: AvatarSize.xl,
              ),
              const SizedBox(height: 16),

              // Company name
              Text(
                profile.fullName,
                style: GoogleFonts.inter(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),

              // City
              if (profile.city.isNotEmpty)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.mapPin,
                        size: 16, color: AppColors.gray500),
                    const SizedBox(width: 4),
                    Text(
                      profile.city,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 4),

              // Phone
              if (profile.phone.isNotEmpty)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(LucideIcons.phone,
                        size: 16, color: AppColors.gray500),
                    const SizedBox(width: 4),
                    Text(
                      profile.phone,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: AppColors.gray500,
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 24),

              // Bio section
              if (profile.bio.isNotEmpty)
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(LucideIcons.info,
                              size: 18, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text(
                            '\u00dcber uns',
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: isDark
                                  ? AppColors.white
                                  : AppColors.gray900,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        profile.bio,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          height: 1.6,
                          color: isDark
                              ? AppColors.gray300
                              : AppColors.gray700,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),

              // Stats
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.briefcase,
                      label: 'Stellenanzeigen',
                      value: '${employerJobs.length}',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      icon: LucideIcons.fileText,
                      label: 'Bewerbungen erhalten',
                      value: '$totalApplications',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Edit profile button
              AppButton(
                title: 'Profil bearbeiten',
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Coming soon'),
                    ),
                  );
                },
                variant: AppButtonVariant.outline,
                icon: const Icon(LucideIcons.edit),
                fullWidth: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Icon(icon, size: 24, color: AppColors.primary),
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
              fontSize: 12,
              color: AppColors.gray500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
