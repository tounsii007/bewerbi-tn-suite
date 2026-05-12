import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_avatar.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';

class AdminUsersScreen extends ConsumerStatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  ConsumerState<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends ConsumerState<AdminUsersScreen> {
  String _filter = 'Alle';

  List<Profile> get _filteredProfiles {
    switch (_filter) {
      case 'Bewerber':
        return mockProfiles
            .where((p) => p.role == UserRole.applicant)
            .toList();
      case 'Arbeitgeber':
        return mockProfiles
            .where((p) => p.role == UserRole.employer)
            .toList();
      case 'Admins':
        return mockProfiles
            .where((p) => p.role == UserRole.admin)
            .toList();
      default:
        return List.from(mockProfiles);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profiles = _filteredProfiles;

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 4),
              child: Text(
                'Benutzerverwaltung',
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
                '${profiles.length} Benutzer',
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
                children: ['Alle', 'Bewerber', 'Arbeitgeber', 'Admins']
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

            // User list
            Expanded(
              child: profiles.isEmpty
                  ? const EmptyState(
                      icon: LucideIcons.users,
                      title: 'Keine Benutzer gefunden',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      itemCount: profiles.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final profile = profiles[index];
                        return _UserCard(
                          profile: profile,
                          onDelete: () => _confirmDelete(profile),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(Profile profile) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Benutzer l\u00f6schen'),
        content: Text(
          'M\u00f6chten Sie den Benutzer "${profile.fullName}" wirklich l\u00f6schen?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () {
              mockProfiles.removeWhere((p) => p.id == profile.id);
              Navigator.of(ctx).pop();
              setState(() {});
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content:
                      Text('${profile.fullName} wurde gel\u00f6scht.'),
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

class _UserCard extends StatelessWidget {
  final Profile profile;
  final VoidCallback onDelete;

  const _UserCard({
    required this.profile,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppCard(
      child: Row(
        children: [
          AppAvatar(
            name: profile.fullName,
            imageUrl: profile.photoUrl,
            size: AvatarSize.sm,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        profile.fullName,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppColors.white
                              : AppColors.gray900,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _roleBadge(profile.role),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${profile.city}${profile.country.isNotEmpty ? ', ${profile.country}' : ''}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.gray500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Erstellt: ${_formatDate(profile.createdAt)}',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AppColors.gray400,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.trash2, size: 18),
            color: AppColors.error,
            onPressed: onDelete,
          ),
        ],
      ),
    );
  }

  static Widget _roleBadge(UserRole role) {
    switch (role) {
      case UserRole.applicant:
        return const AppBadge(
            label: 'Bewerber', variant: BadgeVariant.info, size: BadgeSize.sm);
      case UserRole.employer:
        return const AppBadge(
            label: 'Arbeitgeber',
            variant: BadgeVariant.success,
            size: BadgeSize.sm);
      case UserRole.admin:
        return const AppBadge(
            label: 'Admin',
            variant: BadgeVariant.warning,
            size: BadgeSize.sm);
    }
  }

  static String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}';
  }
}
