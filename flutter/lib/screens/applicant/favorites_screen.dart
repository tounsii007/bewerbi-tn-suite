import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/widgets/job_card.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final jobState = ref.watch(jobProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final favoriteJobs = jobState.jobs.where((j) => jobState.favorites.contains(j.id)).toList();

    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 4),
              child: Text('Favoriten', style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: isDark ? AppColors.white : AppColors.gray900)),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: Text('${favoriteJobs.length} Stellen gemerkt', style: GoogleFonts.inter(fontSize: 13, color: AppColors.gray500)),
            ),
            Expanded(
              child: favoriteJobs.isEmpty
                  ? const Center(child: EmptyState(
                      icon: LucideIcons.heart,
                      title: 'Noch keine Favoriten',
                      subtitle: 'Merke dir Stellen um sie hier zu sehen',
                    ))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      itemCount: favoriteJobs.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final job = favoriteJobs[index];
                        return JobCard(
                          job: job,
                          onTap: () => context.go('/applicant/home/${job.id}'),
                          isFavorite: true,
                          onFavorite: () => ref.read(jobProvider.notifier).toggleFavorite(job.id),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
