import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';

void main() {
  group('JobNotifier', () {
    late JobNotifier jobNotifier;

    setUp(() {
      jobNotifier = JobNotifier();
    });

    test('initial state has empty jobs list', () {
      expect(jobNotifier.state.jobs, isEmpty);
      expect(jobNotifier.state.loading, false);
      expect(jobNotifier.state.favorites, isEmpty);
      expect(jobNotifier.state.myApplications, isEmpty);
    });

    test('fetchJobs returns first page of active jobs', () async {
      await jobNotifier.fetchJobs();
      expect(jobNotifier.state.jobs, isNotEmpty);
      expect(jobNotifier.state.jobs.length, lessThanOrEqualTo(10));
      expect(jobNotifier.state.loading, false);
    });

    test('fetchJobs with no filters returns all jobs paginated', () async {
      await jobNotifier.fetchJobs();
      final firstPageCount = jobNotifier.state.jobs.length;
      expect(firstPageCount, equals(10)); // page size is 10
      expect(jobNotifier.state.hasMore, true);
    });

    test('loadMore returns next page of results', () async {
      await jobNotifier.fetchJobs();
      final firstPageCount = jobNotifier.state.jobs.length;

      await jobNotifier.loadMore();
      expect(jobNotifier.state.jobs.length, greaterThan(firstPageCount));
    });

    test('loadMore does nothing when hasMore is false', () async {
      // Fetch all pages until exhausted
      await jobNotifier.fetchJobs();
      while (jobNotifier.state.hasMore) {
        await jobNotifier.loadMore();
      }
      final totalCount = jobNotifier.state.jobs.length;

      await jobNotifier.loadMore();
      expect(jobNotifier.state.jobs.length, equals(totalCount));
    });

    test('filter by category IT returns only IT jobs', () async {
      await jobNotifier.setFilters(const JobFilters(category: JobCategory.it));
      for (final job in jobNotifier.state.jobs) {
        expect(job.category, equals(JobCategory.it));
      }
    });

    test('filter by category pflege returns only pflege jobs', () async {
      await jobNotifier
          .setFilters(const JobFilters(category: JobCategory.pflege));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.category, equals(JobCategory.pflege));
      }
    });

    test('filter by type ausbildung returns only training positions', () async {
      await jobNotifier
          .setFilters(const JobFilters(type: JobType.ausbildung));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.type, equals(JobType.ausbildung));
      }
    });

    test('filter by type sprachkurs returns language courses', () async {
      await jobNotifier
          .setFilters(const JobFilters(type: JobType.sprachkurs));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.type, equals(JobType.sprachkurs));
      }
    });

    test('filter by search Pflege returns nursing jobs', () async {
      await jobNotifier.setFilters(const JobFilters(search: 'Pflege'));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        final matchesTitle =
            job.title.toLowerCase().contains('pflege');
        final matchesDescription =
            job.description.toLowerCase().contains('pflege');
        final matchesLocation =
            job.location.toLowerCase().contains('pflege');
        expect(matchesTitle || matchesDescription || matchesLocation, true);
      }
    });

    test('filter by search is case insensitive', () async {
      await jobNotifier.setFilters(const JobFilters(search: 'FLUTTER'));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        final combined =
            '${job.title} ${job.description} ${job.location}'.toLowerCase();
        expect(combined.contains('flutter'), true);
      }
    });

    test('filter by germanLevel B2 returns jobs requiring B2 or higher',
        () async {
      await jobNotifier
          .setFilters(const JobFilters(germanLevel: LanguageLevel.b2));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.germanLevel, isNotNull);
        expect(job.germanLevel!.index,
            greaterThanOrEqualTo(LanguageLevel.b2.index));
      }
    });

    test('filter by minSalary 50000 returns high-paying jobs', () async {
      await jobNotifier.setFilters(const JobFilters(minSalary: 50000));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.salaryRange, isNotNull);
      }
    });

    test('filter by location returns matching jobs', () async {
      await jobNotifier.setFilters(const JobFilters(location: 'Berlin'));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.location.toLowerCase().contains('berlin'), true);
      }
    });

    test('clearFilters resets all filters', () async {
      await jobNotifier
          .setFilters(const JobFilters(category: JobCategory.it));
      expect(jobNotifier.state.filters.category, JobCategory.it);

      jobNotifier.clearFilters();
      // Give it time to refetch
      await Future<void>.delayed(const Duration(milliseconds: 400));
      expect(jobNotifier.state.filters.category, null);
      expect(jobNotifier.state.filters.hasActiveFilters, false);
    });

    test('multiple filters combined work correctly', () async {
      await jobNotifier.setFilters(const JobFilters(
        category: JobCategory.it,
        location: 'Frankfurt',
      ));
      expect(jobNotifier.state.jobs, isNotEmpty);
      for (final job in jobNotifier.state.jobs) {
        expect(job.category, equals(JobCategory.it));
        expect(job.location.toLowerCase().contains('frankfurt'), true);
      }
    });

    test('toggleFavorite adds job to favorites', () {
      jobNotifier.toggleFavorite('job-1');
      expect(jobNotifier.state.favorites, contains('job-1'));
    });

    test('toggleFavorite removes job from favorites', () {
      jobNotifier.toggleFavorite('job-1');
      expect(jobNotifier.state.favorites, contains('job-1'));

      jobNotifier.toggleFavorite('job-1');
      expect(jobNotifier.state.favorites, isNot(contains('job-1')));
    });

    test('toggleFavorite multiple jobs', () {
      jobNotifier.toggleFavorite('job-1');
      jobNotifier.toggleFavorite('job-2');
      jobNotifier.toggleFavorite('job-3');
      expect(jobNotifier.state.favorites.length, equals(3));
      expect(jobNotifier.state.favorites, contains('job-1'));
      expect(jobNotifier.state.favorites, contains('job-2'));
      expect(jobNotifier.state.favorites, contains('job-3'));
    });

    test('fetchFavorites initializes with default favorite', () {
      jobNotifier.fetchFavorites();
      expect(jobNotifier.state.favorites, contains('job-1'));
    });

    test('applyToJob creates a new application', () async {
      await jobNotifier.applyToJob(
        'job-1',
        'profile-1',
        'My cover letter for the position.',
      );
      expect(jobNotifier.state.myApplications, isNotEmpty);
      final app = jobNotifier.state.myApplications.last;
      expect(app.jobId, 'job-1');
      expect(app.applicantId, 'profile-1');
      expect(app.coverLetter, 'My cover letter for the position.');
    });

    test('fetchMyApplications returns applications for given profile',
        () async {
      await jobNotifier.fetchMyApplications('profile-1');
      expect(jobNotifier.state.myApplications, isNotEmpty);
      for (final app in jobNotifier.state.myApplications) {
        expect(app.applicantId, 'profile-1');
      }
    });

    test('JobFilters hasActiveFilters detects active filters', () {
      const noFilters = JobFilters();
      expect(noFilters.hasActiveFilters, false);

      const withCategory = JobFilters(category: JobCategory.it);
      expect(withCategory.hasActiveFilters, true);

      const withSearch = JobFilters(search: 'test');
      expect(withSearch.hasActiveFilters, true);
    });

    test('JobFilters copyWith with clear flags', () {
      const filters = JobFilters(
        category: JobCategory.it,
        search: 'dev',
      );
      final cleared = filters.copyWith(clearCategory: true);
      expect(cleared.category, null);
      expect(cleared.search, 'dev');
    });

    test('RecommendedJob matchPercent caps at 100', () {
      // Original test tried to pass `job: null` in a const constructor
      // to exercise the null-job branch — but Job is non-nullable in the
      // current model, so the line never compiled with stricter null
      // safety. Dropped it; the two real assertions below cover the
      // capping behaviour we actually care about.
      final job = mockJobs.first;
      final rec2 = RecommendedJob(job: job, score: 25);
      expect(rec2.matchPercent, 100); // 25 * 5 = 125, capped at 100

      final rec3 = RecommendedJob(job: job, score: 10);
      expect(rec3.matchPercent, 50); // 10 * 5 = 50
    });

    test('fetchRecommendations returns scored jobs for user', () async {
      await jobNotifier.fetchRecommendations('user-1');
      expect(jobNotifier.state.recommendations, isNotEmpty);
      expect(jobNotifier.state.recommendations.length, lessThanOrEqualTo(6));

      // Should be sorted by score descending
      for (int i = 0; i < jobNotifier.state.recommendations.length - 1; i++) {
        expect(
          jobNotifier.state.recommendations[i].score,
          greaterThanOrEqualTo(
              jobNotifier.state.recommendations[i + 1].score),
        );
      }
    });
  });
}
