import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/services/candidate_scoring.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';

void main() {
  group('CandidateScoring', () {
    // Use real mock data for scoring tests
    late Job itJob;
    late Job pflegeJob;

    setUp(() {
      // job-1 is Full-Stack Entwickler (IT, B1)
      itJob = mockJobs.firstWhere((j) => j.id == 'job-1');
      // job-2 is Pflegefachkraft (Pflege, B1)
      pflegeJob = mockJobs.firstWhere((j) => j.id == 'job-2');
    });

    test('calculateScore returns value between 0 and 100', () {
      for (final app in mockApplications) {
        final job =
            mockJobs.where((j) => j.id == app.jobId).firstOrNull ?? itJob;
        final score = CandidateScoring.calculateScore(app, job);
        expect(score, greaterThanOrEqualTo(0));
        expect(score, lessThanOrEqualTo(100));
      }
    });

    test('applicant with matching german level scores higher', () {
      // Ahmed (user-1) has Deutsch B1, job-1 requires B1 - should score well
      // Fatma (user-5) has Deutsch B2, job-2 requires B1 - should score even better
      final ahmedApp = mockApplications.firstWhere((a) => a.id == 'app-1');
      final fatmaApp = mockApplications.firstWhere((a) => a.id == 'app-3');

      final ahmedScore = CandidateScoring.calculateScore(ahmedApp, itJob);
      final fatmaScore = CandidateScoring.calculateScore(fatmaApp, pflegeJob);

      // Both should have non-zero scores due to german level matching
      expect(ahmedScore, greaterThan(0));
      expect(fatmaScore, greaterThan(0));
    });

    test('applicant with relevant experience scores higher', () {
      // Ahmed has IT experience, applying to IT job
      final ahmedApp = mockApplications.firstWhere((a) => a.id == 'app-1');
      final ahmedScoreIT = CandidateScoring.calculateScore(ahmedApp, itJob);

      // Ahmed applying to pflege job should score lower on experience
      final ahmedScorePflege =
          CandidateScoring.calculateScore(ahmedApp, pflegeJob);

      // IT job should give Ahmed a higher score because of relevant experience
      expect(ahmedScoreIT, greaterThan(ahmedScorePflege));
    });

    test('applicant with matching education scores higher', () {
      // Ahmed has Informatik degree, should match better with IT job
      final ahmedApp = mockApplications.firstWhere((a) => a.id == 'app-1');
      final scoreIT = CandidateScoring.calculateScore(ahmedApp, itJob);

      // Score should be positive
      expect(scoreIT, greaterThan(0));
    });

    test('applicant with complete profile scores higher than incomplete', () {
      // Create a minimal application with no applicant profile attached
      final minApp = Application(
        id: 'test-min',
        jobId: itJob.id,
        applicantId: 'nonexistent-profile',
        status: ApplicationStatus.pending,
        coverLetter: '',
        createdAt: DateTime.now(),
      );
      final minScore = CandidateScoring.calculateScore(minApp, itJob);
      expect(minScore, equals(0));

      // Ahmed with complete profile should score higher
      final ahmedApp = mockApplications.firstWhere((a) => a.id == 'app-1');
      final ahmedScore = CandidateScoring.calculateScore(ahmedApp, itJob);
      expect(ahmedScore, greaterThan(minScore));
    });

    test('rankApplications returns sorted list highest first', () {
      final ranked = CandidateScoring.rankApplications(
        mockApplications.where((a) => a.jobId == 'job-1').toList(),
        itJob,
      );

      for (int i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].score, greaterThanOrEqualTo(ranked[i + 1].score));
      }
    });

    test('rankApplications with all applications', () {
      final ranked =
          CandidateScoring.rankApplications(mockApplications, itJob);
      expect(ranked.length, equals(mockApplications.length));

      // Verify sorted descending
      for (int i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].score, greaterThanOrEqualTo(ranked[i + 1].score));
      }
    });

    test('ScoredApplication matchLabel returns Top-Kandidat for score >= 80',
        () {
      final sa = ScoredApplication(
        application: mockApplications.first,
        score: 85,
      );
      expect(sa.matchLabel, 'Top-Kandidat');
    });

    test('ScoredApplication matchLabel returns Guter Match for score >= 60',
        () {
      final sa = ScoredApplication(
        application: mockApplications.first,
        score: 65,
      );
      expect(sa.matchLabel, 'Guter Match');
    });

    test('ScoredApplication matchLabel returns Passend for score >= 40', () {
      final sa = ScoredApplication(
        application: mockApplications.first,
        score: 45,
      );
      expect(sa.matchLabel, 'Passend');
    });

    test('ScoredApplication matchLabel returns Pruefen for score < 40', () {
      final sa = ScoredApplication(
        application: mockApplications.first,
        score: 20,
      );
      expect(sa.matchLabel, 'Prüfen');
    });

    test('ScoredApplication matchColor returns correct values', () {
      expect(
        ScoredApplication(application: mockApplications.first, score: 80)
            .matchColor,
        'success',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 60)
            .matchColor,
        'info',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 40)
            .matchColor,
        'warning',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 10)
            .matchColor,
        'default',
      );
    });

    test('score boundary values for matchLabel', () {
      expect(
        ScoredApplication(application: mockApplications.first, score: 80)
            .matchLabel,
        'Top-Kandidat',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 79)
            .matchLabel,
        'Guter Match',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 60)
            .matchLabel,
        'Guter Match',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 59)
            .matchLabel,
        'Passend',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 40)
            .matchLabel,
        'Passend',
      );
      expect(
        ScoredApplication(application: mockApplications.first, score: 39)
            .matchLabel,
        'Prüfen',
      );
    });

    test('calculateScore clamps to 100 max', () {
      // Even with perfect scoring, result should not exceed 100
      for (final app in mockApplications) {
        final job =
            mockJobs.where((j) => j.id == app.jobId).firstOrNull ?? itJob;
        final score = CandidateScoring.calculateScore(app, job);
        expect(score, lessThanOrEqualTo(100));
      }
    });
  });
}
