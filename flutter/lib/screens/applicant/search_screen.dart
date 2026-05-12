import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/job_presentation.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/widgets/job_card.dart';
import 'package:bewerbi_tn_flutter/widgets/skeleton_loader.dart';

part 'search/search_screen_constants.dart';
part 'search/search_screen_widgets.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  final _locationController = TextEditingController();
  final _scrollController = ScrollController();
  bool _showFilters = false;
  Timer? _searchDebounce;
  Timer? _locationDebounce;
  static const _debounceDelay = Duration(milliseconds: 300);

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(jobProvider.notifier).fetchJobs();
    });
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _locationDebounce?.cancel();
    _searchController.dispose();
    _locationController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(jobProvider.notifier).loadMore();
    }
  }

  Future<void> _onRefresh() async {
    await ref.read(jobProvider.notifier).fetchJobs();
  }

  void _applySearch(String query) {
    final currentFilters = ref.read(jobProvider).filters;
    ref
        .read(jobProvider.notifier)
        .setFilters(
          currentFilters.copyWith(search: query, clearSearch: query.isEmpty),
        );
  }

  void _onSearch(String query) {
    _searchDebounce?.cancel();
    _searchDebounce = Timer(_debounceDelay, () => _applySearch(query));
  }

  void _clearSearch() {
    _searchController.clear();
    _searchDebounce?.cancel();
    _applySearch('');
  }

  void _onLocationChanged(String location) {
    _locationDebounce?.cancel();
    _locationDebounce = Timer(_debounceDelay, () {
      final currentFilters = ref.read(jobProvider).filters;
      ref
          .read(jobProvider.notifier)
          .setFilters(
            currentFilters.copyWith(
              location: location,
              clearLocation: location.isEmpty,
            ),
          );
    });
  }

  void _toggleCategory(JobCategory category) {
    final currentFilters = ref.read(jobProvider).filters;
    final nextFilters = currentFilters.category == category
        ? currentFilters.copyWith(clearCategory: true)
        : currentFilters.copyWith(category: category);
    ref.read(jobProvider.notifier).setFilters(nextFilters);
  }

  void _toggleType(JobType type) {
    final currentFilters = ref.read(jobProvider).filters;
    final nextFilters = currentFilters.type == type
        ? currentFilters.copyWith(clearType: true)
        : currentFilters.copyWith(type: type);
    ref.read(jobProvider.notifier).setFilters(nextFilters);
  }

  void _toggleGermanLevel(LanguageLevel level) {
    final currentFilters = ref.read(jobProvider).filters;
    final nextFilters = currentFilters.germanLevel == level
        ? currentFilters.copyWith(clearGermanLevel: true)
        : currentFilters.copyWith(germanLevel: level);
    ref.read(jobProvider.notifier).setFilters(nextFilters);
  }

  void _toggleMinSalary(int salary) {
    final currentFilters = ref.read(jobProvider).filters;
    final nextFilters = currentFilters.minSalary == salary
        ? currentFilters.copyWith(clearMinSalary: true)
        : currentFilters.copyWith(minSalary: salary);
    ref.read(jobProvider.notifier).setFilters(nextFilters);
  }

  void _clearAllFilters() {
    _searchController.clear();
    _locationController.clear();
    _searchDebounce?.cancel();
    _locationDebounce?.cancel();
    ref.read(jobProvider.notifier).clearFilters();
  }

  @override
  Widget build(BuildContext context) {
    final jobState = ref.watch(jobProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: AppSpacing.lg),
            _SearchBar(
              controller: _searchController,
              showFilters: _showFilters,
              isDark: isDark,
              onSearch: _onSearch,
              onClearSearch: _clearSearch,
              onToggleFilters: () =>
                  setState(() => _showFilters = !_showFilters),
            ),
            if (jobState.filters.hasActiveFilters)
              _ActiveFiltersBar(
                resultCount: jobState.jobs.length,
                isDark: isDark,
                onClearAll: _clearAllFilters,
              ),
            if (_showFilters)
              _FilterSection(
                filters: jobState.filters,
                locationController: _locationController,
                isDark: isDark,
                onLocationChanged: _onLocationChanged,
                onToggleCategory: _toggleCategory,
                onToggleType: _toggleType,
                onToggleGermanLevel: _toggleGermanLevel,
                onToggleMinSalary: _toggleMinSalary,
              ),
            const SizedBox(height: AppSpacing.sm),
            Expanded(
              child: jobState.loading && jobState.jobs.isEmpty
                  ? Padding(
                      padding: _SearchScreenUi.resultsPadding,
                      child: Column(
                        children: List.generate(
                          4,
                          (_) => const JobCardSkeleton(),
                        ),
                      ),
                    )
                  : jobState.jobs.isEmpty
                  ? _SearchEmptyState(isDark: isDark)
                  : RefreshIndicator(
                      onRefresh: _onRefresh,
                      color: AppColors.primary,
                      child: ListView.separated(
                        controller: _scrollController,
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: _SearchScreenUi.resultsPadding,
                        itemCount:
                            jobState.jobs.length + (jobState.hasMore ? 1 : 0),
                        separatorBuilder: (_, _) =>
                            const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          if (index >= jobState.jobs.length) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: AppSpacing.lg,
                              ),
                              child: Center(
                                child: jobState.loading
                                    ? const SizedBox.square(
                                        dimension: 24,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : GestureDetector(
                                        onTap: () => ref
                                            .read(jobProvider.notifier)
                                            .loadMore(),
                                        child: Text(
                                          'Mehr laden',
                                          style: GoogleFonts.inter(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      ),
                              ),
                            );
                          }

                          final job = jobState.jobs[index];
                          return JobCard(
                            job: job,
                            onTap: () =>
                                context.go('/applicant/home/${job.id}'),
                            isFavorite: jobState.favorites.contains(job.id),
                            onFavorite: () => ref
                                .read(jobProvider.notifier)
                                .toggleFavorite(job.id),
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
}
