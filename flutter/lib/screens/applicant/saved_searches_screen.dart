import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/saved_search.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/providers/saved_search_provider.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';

class SavedSearchesScreen extends ConsumerWidget {
  const SavedSearchesScreen({super.key});

  String _summarize(SavedSearch s) {
    final parts = <String>[];
    if (s.query != null && s.query!.isNotEmpty) parts.add('"${s.query}"');
    if (s.category != null) parts.add(s.category!.name);
    if (s.type != null) parts.add(s.type!.name);
    if (s.location != null && s.location!.isNotEmpty) parts.add(s.location!);
    if (s.minGermanLevel != null) parts.add('Deutsch ${s.minGermanLevel!.name.toUpperCase()}+');
    if (s.salaryMin != null) parts.add('ab ${(s.salaryMin! / 1000).round()}k €');
    return parts.isEmpty ? 'Alle Stellen' : parts.join(' · ');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(savedSearchProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: Text('Gespeicherte Suchen', style: GoogleFonts.inter(fontWeight: FontWeight.w700))),
      body: state.searches.isEmpty
          ? const EmptyState(
              icon: LucideIcons.bookmark,
              title: 'Noch keine gespeicherten Suchen',
              subtitle: 'Speichere deine Filterkombinationen, um sie später wieder aufzurufen.',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppSpacing.lg),
              itemCount: state.searches.length,
              separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                final s = state.searches[index];
                return _SavedSearchCard(
                  search: s,
                  subtitle: _summarize(s),
                  isDark: isDark,
                  onTap: () {
                    ref.read(jobProvider.notifier).setFilters(JobFilters(
                          search: s.query,
                          category: s.category,
                          type: s.type,
                          location: s.location,
                          germanLevel: s.minGermanLevel,
                          minSalary: s.salaryMin,
                        ));
                    context.go('/applicant/search');
                  },
                  onToggleAlerts: () => ref.read(savedSearchProvider.notifier).toggleAlerts(s.id),
                  onDelete: () => ref.read(savedSearchProvider.notifier).remove(s.id),
                );
              },
            ),
    );
  }
}

class _SavedSearchCard extends StatelessWidget {
  final SavedSearch search;
  final String subtitle;
  final bool isDark;
  final VoidCallback onTap;
  final VoidCallback onToggleAlerts;
  final VoidCallback onDelete;

  const _SavedSearchCard({
    required this.search,
    required this.subtitle,
    required this.isDark,
    required this.onTap,
    required this.onToggleAlerts,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: AppRadii.lgRadius,
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: onTap,
            borderRadius: AppRadii.lgRadius,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(search.name,
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.white : AppColors.gray900,
                            )),
                        const SizedBox(height: 4),
                        Text(subtitle,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: isDark ? AppColors.gray400 : AppColors.gray500,
                            )),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, size: 20, color: AppColors.gray400),
                ],
              ),
            ),
          ),
          Container(
            height: 1,
            color: isDark ? AppColors.darkBorder : AppColors.gray100,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 8),
            child: Row(
              children: [
                TextButton.icon(
                  onPressed: onToggleAlerts,
                  icon: Icon(
                    search.alertsEnabled ? LucideIcons.bell : LucideIcons.bellOff,
                    size: 14,
                    color: search.alertsEnabled ? AppColors.primary : AppColors.gray400,
                  ),
                  label: Text(
                    search.alertsEnabled ? 'Benachrichtigung an' : 'Benachrichtigung aus',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: search.alertsEnabled ? AppColors.primary : AppColors.gray500,
                    ),
                  ),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: onDelete,
                  icon: const Icon(LucideIcons.trash2, size: 14, color: AppColors.error),
                  label: Text('Löschen',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.error,
                      )),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
