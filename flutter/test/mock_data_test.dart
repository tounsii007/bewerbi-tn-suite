import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';

void main() {
  group('Mock Data Integrity', () {
    test('mockProfiles has 16 entries', () {
      expect(mockProfiles.length, 16);
    });

    test('mockProfiles has 10 applicants', () {
      final applicants =
          mockProfiles.where((p) => p.role == UserRole.applicant).toList();
      expect(applicants.length, 10);
    });

    test('mockProfiles has 5 employers', () {
      final employers =
          mockProfiles.where((p) => p.role == UserRole.employer).toList();
      expect(employers.length, 5);
    });

    test('mockProfiles has 1 admin', () {
      final admins =
          mockProfiles.where((p) => p.role == UserRole.admin).toList();
      expect(admins.length, 1);
    });

    test('mockJobs has 20 entries', () {
      expect(mockJobs.length, 20);
    });

    test('all jobs have valid employer references', () {
      final profileIds = mockProfiles.map((p) => p.id).toSet();
      for (final job in mockJobs) {
        expect(
          profileIds.contains(job.employerId),
          true,
          reason:
              'Job ${job.id} references employer ${job.employerId} which does not exist',
        );
      }
    });

    test('all applications reference valid jobs', () {
      final jobIds = mockJobs.map((j) => j.id).toSet();
      for (final app in mockApplications) {
        expect(
          jobIds.contains(app.jobId),
          true,
          reason:
              'Application ${app.id} references job ${app.jobId} which does not exist',
        );
      }
    });

    test('all applications reference valid profiles', () {
      final profileIds = mockProfiles.map((p) => p.id).toSet();
      for (final app in mockApplications) {
        expect(
          profileIds.contains(app.applicantId),
          true,
          reason:
              'Application ${app.id} references profile ${app.applicantId} which does not exist',
        );
      }
    });

    test('mockLanguages filtered by user-1 returns 4 entries', () {
      final user1Langs =
          mockLanguages.where((l) => l.userId == 'user-1').toList();
      expect(user1Langs.length, 4);
    });

    test('mockEducation filtered by user-1 returns 2 entries', () {
      final user1Edu =
          mockEducation.where((e) => e.userId == 'user-1').toList();
      expect(user1Edu.length, 2);
    });

    test('no duplicate IDs in mockProfiles', () {
      final ids = mockProfiles.map((p) => p.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('no duplicate IDs in mockJobs', () {
      final ids = mockJobs.map((j) => j.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('no duplicate IDs in mockApplications', () {
      final ids = mockApplications.map((a) => a.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('no duplicate IDs in mockEducation', () {
      final ids = mockEducation.map((e) => e.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('no duplicate IDs in mockExperience', () {
      final ids = mockExperience.map((e) => e.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('no duplicate IDs in mockLanguages', () {
      final ids = mockLanguages.map((l) => l.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('no duplicate IDs in mockDocuments', () {
      final ids = mockDocuments.map((d) => d.id).toList();
      expect(ids.length, equals(ids.toSet().length));
    });

    test('all jobs have active status', () {
      for (final job in mockJobs) {
        expect(job.status, 'active');
      }
    });

    test('mockApplications has 8 entries', () {
      expect(mockApplications.length, greaterThanOrEqualTo(8));
    });

    test('mockExperience has entries for multiple users', () {
      final userIds = mockExperience.map((e) => e.userId).toSet();
      expect(userIds.length, greaterThan(1));
    });

    test('mockDocuments has entries for multiple users', () {
      final userIds = mockDocuments.map((d) => d.userId).toSet();
      expect(userIds.length, greaterThan(1));
    });

    test('all job categories are represented', () {
      final categories = mockJobs.map((j) => j.category).toSet();
      expect(categories, contains(JobCategory.it));
      expect(categories, contains(JobCategory.pflege));
      expect(categories, contains(JobCategory.transport));
      expect(categories, contains(JobCategory.sonstige));
    });

    test('all job types are represented', () {
      final types = mockJobs.map((j) => j.type).toSet();
      expect(types, contains(JobType.job));
      expect(types, contains(JobType.ausbildung));
      expect(types, contains(JobType.studium));
      expect(types, contains(JobType.sprachkurs));
    });

    test('all application statuses are represented', () {
      final statuses = mockApplications.map((a) => a.status).toSet();
      expect(statuses.length, 4); // pending, reviewed, accepted, rejected
    });

    test('user-1 has German language skill at B1', () {
      final germanSkill = mockLanguages.firstWhere(
        (l) => l.userId == 'user-1' && l.language == 'Deutsch',
      );
      expect(germanSkill.level, LanguageLevel.b1);
      expect(germanSkill.certified, true);
    });

    test('user-5 has German language skill at B2', () {
      final germanSkill = mockLanguages.firstWhere(
        (l) => l.userId == 'user-5' && l.language == 'Deutsch',
      );
      expect(germanSkill.level, LanguageLevel.b2);
      expect(germanSkill.certified, true);
    });
  });
}
