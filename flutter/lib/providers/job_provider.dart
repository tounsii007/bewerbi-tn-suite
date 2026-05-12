import 'dart:math' as math;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';

class JobFilters {
  final JobCategory? category;
  final JobType? type;
  final String? location;
  final String? search;
  final LanguageLevel? germanLevel;
  final int? minSalary;

  const JobFilters({
    this.category,
    this.type,
    this.location,
    this.search,
    this.germanLevel,
    this.minSalary,
  });

  JobFilters copyWith({
    JobCategory? category,
    JobType? type,
    String? location,
    String? search,
    LanguageLevel? germanLevel,
    int? minSalary,
    bool clearCategory = false,
    bool clearType = false,
    bool clearLocation = false,
    bool clearSearch = false,
    bool clearGermanLevel = false,
    bool clearMinSalary = false,
  }) {
    return JobFilters(
      category: clearCategory ? null : (category ?? this.category),
      type: clearType ? null : (type ?? this.type),
      location: clearLocation ? null : (location ?? this.location),
      search: clearSearch ? null : (search ?? this.search),
      germanLevel:
          clearGermanLevel ? null : (germanLevel ?? this.germanLevel),
      minSalary: clearMinSalary ? null : (minSalary ?? this.minSalary),
    );
  }

  bool get hasActiveFilters =>
      category != null ||
      type != null ||
      location != null ||
      search != null ||
      germanLevel != null ||
      minSalary != null;
}

/// A recommended job with a match score.
class RecommendedJob {
  final Job job;
  final int score;

  const RecommendedJob({required this.job, required this.score});

  int get matchPercent => math.min(score * 5, 100);
}

class JobState {
  final List<Job> jobs;
  final List<Application> myApplications;
  final List<String> favorites;
  final List<RecommendedJob> recommendations;
  final bool loading;
  final bool hasMore;
  final String? error;
  final JobFilters filters;

  const JobState({
    this.jobs = const [],
    this.myApplications = const [],
    this.favorites = const [],
    this.recommendations = const [],
    this.loading = false,
    this.hasMore = true,
    this.error,
    this.filters = const JobFilters(),
  });

  JobState copyWith({
    List<Job>? jobs,
    List<Application>? myApplications,
    List<String>? favorites,
    List<RecommendedJob>? recommendations,
    bool? loading,
    bool? hasMore,
    String? error,
    JobFilters? filters,
    bool clearError = false,
  }) {
    return JobState(
      jobs: jobs ?? this.jobs,
      myApplications: myApplications ?? this.myApplications,
      favorites: favorites ?? this.favorites,
      recommendations: recommendations ?? this.recommendations,
      loading: loading ?? this.loading,
      hasMore: hasMore ?? this.hasMore,
      error: clearError ? null : (error ?? this.error),
      filters: filters ?? this.filters,
    );
  }
}

/// Parse the first number from a salary range string.
/// E.g. "55.000 - 70.000 \u20ac" -> 55000, "40.000\u20ac" -> 40000.
int? _parseSalaryMin(String? salaryRange) {
  if (salaryRange == null || salaryRange.isEmpty) return null;
  // Match a number like "55.000" or "55000"
  final match = RegExp(r'(\d[\d.]*)').firstMatch(salaryRange);
  if (match == null) return null;
  // Remove dot thousands separators and parse
  final raw = match.group(1)!.replaceAll('.', '');
  return int.tryParse(raw);
}

class JobNotifier extends StateNotifier<JobState> {
  JobNotifier() : super(const JobState());

  static const int _pageSize = 10;
  int _currentPage = 0;

  /// All jobs matching the current filters (before pagination).
  List<Job> _allFiltered = [];

  List<Job> _applyFilters() {
    final filters = state.filters;
    var filtered = List<Job>.from(mockJobs);

    if (filters.category != null) {
      filtered =
          filtered.where((j) => j.category == filters.category).toList();
    }
    if (filters.type != null) {
      filtered = filtered.where((j) => j.type == filters.type).toList();
    }
    if (filters.location != null && filters.location!.isNotEmpty) {
      filtered = filtered
          .where(
            (j) => j.location
                .toLowerCase()
                .contains(filters.location!.toLowerCase()),
          )
          .toList();
    }
    if (filters.search != null && filters.search!.isNotEmpty) {
      final query = filters.search!.toLowerCase();
      filtered = filtered
          .where(
            (j) =>
                j.title.toLowerCase().contains(query) ||
                j.description.toLowerCase().contains(query) ||
                j.location.toLowerCase().contains(query),
          )
          .toList();
    }
    if (filters.germanLevel != null) {
      final minIndex = filters.germanLevel!.index;
      filtered = filtered.where((j) {
        if (j.germanLevel == null) return false;
        return j.germanLevel!.index >= minIndex;
      }).toList();
    }
    if (filters.minSalary != null) {
      filtered = filtered.where((j) {
        final salary = _parseSalaryMin(j.salaryRange);
        if (salary == null) return false;
        return salary >= filters.minSalary!;
      }).toList();
    }

    return filtered;
  }

  Future<void> fetchJobs() async {
    state = state.copyWith(loading: true, clearError: true);
    _currentPage = 0;

    // Simulate network delay
    await Future<void>.delayed(const Duration(milliseconds: 300));

    _allFiltered = _applyFilters();

    final end = math.min(_pageSize, _allFiltered.length);
    final page = _allFiltered.sublist(0, end);

    state = state.copyWith(
      jobs: page,
      loading: false,
      hasMore: end < _allFiltered.length,
    );
  }

  Future<void> loadMore() async {
    if (!state.hasMore || state.loading) return;
    state = state.copyWith(loading: true);

    await Future<void>.delayed(const Duration(milliseconds: 300));

    _currentPage++;
    final start = _currentPage * _pageSize;
    final end = math.min(start + _pageSize, _allFiltered.length);

    if (start >= _allFiltered.length) {
      state = state.copyWith(loading: false, hasMore: false);
      return;
    }

    final nextPage = _allFiltered.sublist(start, end);

    state = state.copyWith(
      jobs: [...state.jobs, ...nextPage],
      loading: false,
      hasMore: end < _allFiltered.length,
    );
  }

  Future<void> fetchMyApplications(String profileId) async {
    state = state.copyWith(loading: true);

    await Future<void>.delayed(const Duration(milliseconds: 300));

    final filtered = mockApplications
        .where((a) => a.applicantId == profileId)
        .toList();

    state = state.copyWith(myApplications: filtered, loading: false);
  }

  void toggleFavorite(String jobId) {
    final current = List<String>.from(state.favorites);
    if (current.contains(jobId)) {
      current.remove(jobId);
    } else {
      current.add(jobId);
    }
    state = state.copyWith(favorites: current);
  }

  void fetchFavorites() {
    // Initialize with a default favorite
    state = state.copyWith(favorites: ['job-1']);
  }

  Future<void> applyToJob(
    String jobId,
    String applicantId,
    String coverLetter,
  ) async {
    state = state.copyWith(loading: true);

    await Future<void>.delayed(const Duration(milliseconds: 500));

    final matchingJobs = mockJobs.where((j) => j.id == jobId);
    final matchingProfiles =
        mockProfiles.where((p) => p.id == applicantId);

    final newApplication = Application(
      id: 'app-${DateTime.now().millisecondsSinceEpoch}',
      jobId: jobId,
      applicantId: applicantId,
      status: ApplicationStatus.pending,
      coverLetter: coverLetter,
      createdAt: DateTime.now(),
      job: matchingJobs.isNotEmpty ? matchingJobs.first : null,
      applicant:
          matchingProfiles.isNotEmpty ? matchingProfiles.first : null,
    );

    mockApplications.add(newApplication);

    state = state.copyWith(
      myApplications: [...state.myApplications, newApplication],
      loading: false,
    );
  }

  Future<void> setFilters(JobFilters filters) async {
    state = state.copyWith(filters: filters);
    await fetchJobs();
  }

  void clearFilters() {
    state = state.copyWith(filters: const JobFilters());
    fetchJobs();
  }

  /// Build job recommendations for the given user.
  ///
  /// Scoring:
  ///   +10  matching category (based on user experience keywords)
  ///   +5   matching german level (job level <= user level)
  ///   +3   matching location (user city appears in job location)
  Future<void> fetchRecommendations(String userId) async {
    await Future<void>.delayed(const Duration(milliseconds: 200));

    // Gather user data
    final userLangs = mockLanguages.where((l) => l.userId == userId).toList();
    final userExps = mockExperience.where((e) => e.userId == userId).toList();
    final userProfile = mockProfiles.where((p) => p.userId == userId);
    final userCity =
        userProfile.isNotEmpty ? userProfile.first.city.toLowerCase() : '';

    // Determine user's German level
    LanguageLevel? germanLevel;
    for (final lang in userLangs) {
      if (lang.language.toLowerCase() == 'deutsch') {
        germanLevel = lang.level;
        break;
      }
    }

    // Infer preferred categories from experience keywords
    final inferredCategories = <JobCategory>{};
    for (final exp in userExps) {
      final text =
          '${exp.position} ${exp.description ?? ""} ${exp.company}'.toLowerCase();
      if (text.contains('it') ||
          text.contains('developer') ||
          text.contains('entwickl') ||
          text.contains('software') ||
          text.contains('web') ||
          text.contains('data')) {
        inferredCategories.add(JobCategory.it);
      }
      if (text.contains('pflege') ||
          text.contains('kranken') ||
          text.contains('klinik') ||
          text.contains('pfleger') ||
          text.contains('nurse')) {
        inferredCategories.add(JobCategory.pflege);
      }
      if (text.contains('transport') ||
          text.contains('lkw') ||
          text.contains('fahrer') ||
          text.contains('logistik')) {
        inferredCategories.add(JobCategory.transport);
      }
    }

    final scored = <RecommendedJob>[];

    for (final job in mockJobs) {
      int score = 0;

      // Category match
      if (inferredCategories.contains(job.category)) {
        score += 10;
      }

      // German level match (job level <= user level)
      if (germanLevel != null && job.germanLevel != null) {
        if (job.germanLevel!.index <= germanLevel.index) {
          score += 5;
        }
      }

      // Location match
      if (userCity.isNotEmpty &&
          job.location.toLowerCase().contains(userCity)) {
        score += 3;
      }

      if (score > 0) {
        scored.add(RecommendedJob(job: job, score: score));
      }
    }

    // Sort by score descending, take top 6
    scored.sort((a, b) => b.score.compareTo(a.score));
    final top = scored.take(6).toList();

    state = state.copyWith(recommendations: top);
  }
}

final jobProvider =
    StateNotifierProvider<JobNotifier, JobState>((ref) => JobNotifier());
