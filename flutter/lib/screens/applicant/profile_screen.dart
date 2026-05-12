import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/models/language_skill.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final profile = authState.profile;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final userId = profile?.userId ?? '';
    final userEducation = mockEducation.where((e) => e.userId == userId).toList();
    final userExperience = mockExperience.where((e) => e.userId == userId).toList();
    final userLanguages = mockLanguages.where((l) => l.userId == userId).toList();
    final userDocuments = mockDocuments.where((d) => d.userId == userId).toList();

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Blue gradient header
            _buildHeader(context, profile, isDark),

            const SizedBox(height: 24),

            // Section cards
            _buildSectionCard(
              context,
              icon: LucideIcons.graduationCap,
              iconColor: AppColors.primary,
              borderColor: AppColors.primary,
              title: 'Bildung & Studium',
              count: userEducation.length,
              isDark: isDark,
              onTap: () => context.go('/applicant/profile/education'),
            ),

            const SizedBox(height: 12),

            _buildSectionCard(
              context,
              icon: LucideIcons.briefcase,
              iconColor: AppColors.success,
              borderColor: AppColors.success,
              title: 'Berufserfahrung',
              count: userExperience.length,
              isDark: isDark,
              onTap: () => context.go('/applicant/profile/experience'),
            ),

            const SizedBox(height: 12),

            _buildSectionCard(
              context,
              icon: LucideIcons.languages,
              iconColor: const Color(0xFF7C3AED), // violet
              borderColor: const Color(0xFF7C3AED),
              title: 'Sprachkenntnisse',
              count: userLanguages.length,
              isDark: isDark,
              onTap: () => context.go('/applicant/profile/languages'),
            ),

            // Languages preview
            _buildLanguagesPreview(isDark, userLanguages),

            const SizedBox(height: 12),

            _buildSectionCard(
              context,
              icon: LucideIcons.fileText,
              iconColor: AppColors.warning,
              borderColor: AppColors.warning,
              title: 'Dokumente',
              count: userDocuments.length,
              isDark: isDark,
              onTap: () => context.go('/applicant/profile/documents'),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    dynamic profile,
    bool isDark,
  ) {
    final name = profile?.fullName ?? 'Benutzer';
    final city = profile?.city ?? '';
    final country = profile?.country ?? '';
    final phone = profile?.phone ?? '';
    final bio = profile?.bio ?? '';
    final location = [city, country].where((s) => s.isNotEmpty).join(', ');

    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 0),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.primary, AppColors.primaryDark],
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
        boxShadow: AppShadows.lg,
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            const SizedBox(height: 8),
            // Avatar with edit button
            Stack(
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.white,
                      width: 3,
                    ),
                    color: AppColors.white.withValues(alpha: 0.2),
                  ),
                  child: const CircleAvatar(
                    radius: 41,
                    backgroundColor: Colors.transparent,
                    child: Icon(
                      Icons.person,
                      size: 40,
                      color: AppColors.white,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: () => context.go('/applicant/profile/edit'),
                    child: Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        shape: BoxShape.circle,
                        boxShadow: AppShadows.sm,
                      ),
                      child: const Icon(
                        LucideIcons.camera,
                        size: 16,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Name
            Text(
              name,
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 8),

            // Location
            if (location.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.mapPin,
                    size: 14,
                    color: AppColors.white.withValues(alpha: 0.7),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    location,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.white.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),

            if (phone.isNotEmpty) ...[
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.phone,
                    size: 14,
                    color: AppColors.white.withValues(alpha: 0.7),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    phone,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.white.withValues(alpha: 0.7),
                    ),
                  ),
                ],
              ),
            ],

            if (bio.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                bio,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.white.withValues(alpha: 0.8),
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required Color borderColor,
    required String title,
    required int count,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: AppShadows.sm,
        ),
        child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 44,
              decoration: BoxDecoration(
                color: borderColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.white : AppColors.gray800,
                    ),
                  ),
                  Text(
                    '$count ${count == 1 ? "Eintrag" : "Einträge"}',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.gray500,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: isDark ? AppColors.gray500 : AppColors.gray400,
            ),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildLanguagesPreview(bool isDark, List<LanguageSkill> languages) {
    if (languages.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: languages.map((lang) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${lang.language} (${lang.level.name.toUpperCase()})',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF7C3AED),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
