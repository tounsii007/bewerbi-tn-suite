import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/models/education.dart';
import 'package:bewerbi_tn_flutter/models/experience.dart';
import 'package:bewerbi_tn_flutter/models/language_skill.dart';
import 'package:bewerbi_tn_flutter/models/document.dart';
import 'package:bewerbi_tn_flutter/models/message.dart';

void main() {
  group('Profile', () {
    test('constructor creates profile with required fields', () {
      final profile = Profile(
        id: 'test-id',
        userId: 'test-user',
        role: UserRole.applicant,
        firstName: 'Max',
        lastName: 'Mustermann',
        createdAt: DateTime(2024, 1, 1),
      );
      expect(profile.id, 'test-id');
      expect(profile.userId, 'test-user');
      expect(profile.role, UserRole.applicant);
      expect(profile.firstName, 'Max');
      expect(profile.lastName, 'Mustermann');
    });

    test('fullName returns combined first and last name', () {
      final profile = Profile(
        id: 'id',
        userId: 'uid',
        role: UserRole.applicant,
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        createdAt: DateTime(2024, 1, 1),
      );
      expect(profile.fullName, 'Ahmed Ben Ali');
    });

    test('copyWith creates new instance with changed fields', () {
      final profile = Profile(
        id: 'id',
        userId: 'uid',
        role: UserRole.applicant,
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        city: 'Tunis',
        createdAt: DateTime(2024, 1, 1),
      );
      final updated = profile.copyWith(city: 'Berlin', phone: '+49 123');
      expect(updated.city, 'Berlin');
      expect(updated.phone, '+49 123');
      expect(updated.firstName, 'Ahmed'); // unchanged
      expect(updated.id, 'id'); // unchanged
    });

    test('fromJson creates profile from map', () {
      final json = {
        'id': 'p1',
        'user_id': 'u1',
        'role': 'employer',
        'first_name': 'Tech',
        'last_name': 'Corp',
        'phone': '+49 123',
        'city': 'Berlin',
        'country': 'Deutschland',
        'bio': 'A company',
        'created_at': '2024-01-15T00:00:00.000',
      };
      final profile = Profile.fromJson(json);
      expect(profile.id, 'p1');
      expect(profile.userId, 'u1');
      expect(profile.role, UserRole.employer);
      expect(profile.firstName, 'Tech');
      expect(profile.city, 'Berlin');
    });

    test('toJson creates map from profile', () {
      final profile = Profile(
        id: 'p1',
        userId: 'u1',
        role: UserRole.applicant,
        firstName: 'Test',
        lastName: 'User',
        phone: '+216 50 123',
        city: 'Tunis',
        country: 'Tunesien',
        bio: 'Bio text',
        createdAt: DateTime(2024, 1, 15),
      );
      final json = profile.toJson();
      expect(json['id'], 'p1');
      expect(json['user_id'], 'u1');
      expect(json['role'], 'applicant');
      expect(json['first_name'], 'Test');
      expect(json['city'], 'Tunis');
    });

    test('fromJson/toJson roundtrip preserves data', () {
      final original = Profile(
        id: 'roundtrip',
        userId: 'rtu',
        role: UserRole.admin,
        firstName: 'Admin',
        lastName: 'User',
        photoUrl: 'https://example.com/photo.jpg',
        phone: '+1 555',
        city: 'NYC',
        country: 'USA',
        bio: 'The admin',
        createdAt: DateTime(2024, 6, 15),
      );
      final json = original.toJson();
      final restored = Profile.fromJson(json);
      expect(restored.id, original.id);
      expect(restored.userId, original.userId);
      expect(restored.role, original.role);
      expect(restored.firstName, original.firstName);
      expect(restored.lastName, original.lastName);
      expect(restored.photoUrl, original.photoUrl);
      expect(restored.phone, original.phone);
      expect(restored.city, original.city);
      expect(restored.country, original.country);
      expect(restored.bio, original.bio);
    });

    test('fromJson with unknown role defaults to applicant', () {
      final json = {
        'id': 'p1',
        'user_id': 'u1',
        'role': 'unknown_role',
        'first_name': 'Test',
        'last_name': 'User',
        'created_at': '2024-01-15T00:00:00.000',
      };
      final profile = Profile.fromJson(json);
      expect(profile.role, UserRole.applicant);
    });

    test('default values for optional fields', () {
      final profile = Profile(
        id: 'id',
        userId: 'uid',
        role: UserRole.applicant,
        firstName: 'Test',
        lastName: 'User',
        createdAt: DateTime(2024, 1, 1),
      );
      expect(profile.phone, '');
      expect(profile.city, '');
      expect(profile.country, '');
      expect(profile.bio, '');
      expect(profile.photoUrl, null);
    });

    test('UserRole enum has correct values', () {
      expect(UserRole.values.length, 3);
      expect(UserRole.values, contains(UserRole.applicant));
      expect(UserRole.values, contains(UserRole.employer));
      expect(UserRole.values, contains(UserRole.admin));
    });
  });

  group('Job', () {
    test('constructor creates job with required fields', () {
      final job = Job(
        id: 'j1',
        employerId: 'e1',
        title: 'Developer',
        description: 'A great job',
        category: JobCategory.it,
        type: JobType.job,
        location: 'Berlin',
        createdAt: DateTime(2024, 1, 1),
      );
      expect(job.id, 'j1');
      expect(job.title, 'Developer');
      expect(job.category, JobCategory.it);
      expect(job.type, JobType.job);
      expect(job.status, 'active'); // default
      expect(job.customQuestions, isEmpty); // default
    });

    test('copyWith creates modified copy', () {
      final job = Job(
        id: 'j1',
        employerId: 'e1',
        title: 'Developer',
        description: 'A job',
        category: JobCategory.it,
        type: JobType.job,
        location: 'Berlin',
        createdAt: DateTime(2024, 1, 1),
      );
      final updated = job.copyWith(
        title: 'Senior Developer',
        salaryRange: '60.000 - 80.000',
        customQuestions: ['Q1', 'Q2'],
      );
      expect(updated.title, 'Senior Developer');
      expect(updated.salaryRange, '60.000 - 80.000');
      expect(updated.customQuestions.length, 2);
      expect(updated.id, 'j1'); // unchanged
    });

    test('fromJson creates job from map', () {
      final json = {
        'id': 'j1',
        'employer_id': 'e1',
        'title': 'Data Engineer',
        'description': 'Build pipelines',
        'category': 'it',
        'type': 'job',
        'location': 'Frankfurt',
        'requirements': 'Python, SQL',
        'salary_range': '55.000 - 70.000',
        'german_level': 'b1',
        'created_at': '2024-03-01T00:00:00.000',
        'status': 'active',
      };
      final job = Job.fromJson(json);
      expect(job.id, 'j1');
      expect(job.category, JobCategory.it);
      expect(job.germanLevel, LanguageLevel.b1);
      expect(job.salaryRange, '55.000 - 70.000');
    });

    test('toJson creates map from job', () {
      final job = Job(
        id: 'j1',
        employerId: 'e1',
        title: 'Test Job',
        description: 'Desc',
        category: JobCategory.pflege,
        type: JobType.ausbildung,
        location: 'Stuttgart',
        germanLevel: LanguageLevel.b2,
        createdAt: DateTime(2024, 5, 1),
      );
      final json = job.toJson();
      expect(json['id'], 'j1');
      expect(json['category'], 'pflege');
      expect(json['type'], 'ausbildung');
      expect(json['german_level'], 'b2');
    });

    test('fromJson/toJson roundtrip preserves data', () {
      final original = Job(
        id: 'roundtrip-j',
        employerId: 'e-rt',
        title: 'Roundtrip Job',
        description: 'Testing roundtrip',
        category: JobCategory.transport,
        type: JobType.job,
        location: 'Hamburg',
        requirements: 'CE license',
        salaryRange: '35.000 - 45.000',
        germanLevel: LanguageLevel.a2,
        createdAt: DateTime(2024, 4, 15),
        status: 'active',
      );
      final json = original.toJson();
      final restored = Job.fromJson(json);
      expect(restored.id, original.id);
      expect(restored.title, original.title);
      expect(restored.category, original.category);
      expect(restored.type, original.type);
      expect(restored.germanLevel, original.germanLevel);
      expect(restored.salaryRange, original.salaryRange);
    });

    test('fromJson with unknown category defaults to sonstige', () {
      final json = {
        'id': 'j1',
        'employer_id': 'e1',
        'title': 'Job',
        'category': 'unknown',
        'type': 'job',
        'created_at': '2024-01-01T00:00:00.000',
      };
      final job = Job.fromJson(json);
      expect(job.category, JobCategory.sonstige);
    });

    test('fromJson with unknown type defaults to job', () {
      final json = {
        'id': 'j1',
        'employer_id': 'e1',
        'title': 'Job',
        'category': 'it',
        'type': 'unknown',
        'created_at': '2024-01-01T00:00:00.000',
      };
      final job = Job.fromJson(json);
      expect(job.type, JobType.job);
    });

    test('customQuestions default is empty list', () {
      final job = Job(
        id: 'j1',
        employerId: 'e1',
        title: 'Job',
        description: '',
        category: JobCategory.it,
        type: JobType.job,
        location: 'Berlin',
        createdAt: DateTime(2024, 1, 1),
      );
      expect(job.customQuestions, isEmpty);
    });

    test('JobCategory enum has 4 values', () {
      expect(JobCategory.values.length, 4);
    });

    test('JobType enum has 4 values', () {
      expect(JobType.values.length, 4);
    });

    test('LanguageLevel enum has 6 values in order', () {
      expect(LanguageLevel.values.length, 6);
      expect(LanguageLevel.a1.index, lessThan(LanguageLevel.a2.index));
      expect(LanguageLevel.a2.index, lessThan(LanguageLevel.b1.index));
      expect(LanguageLevel.b1.index, lessThan(LanguageLevel.b2.index));
      expect(LanguageLevel.b2.index, lessThan(LanguageLevel.c1.index));
      expect(LanguageLevel.c1.index, lessThan(LanguageLevel.c2.index));
    });
  });

  group('Application', () {
    test('constructor creates application', () {
      final app = Application(
        id: 'a1',
        jobId: 'j1',
        applicantId: 'p1',
        status: ApplicationStatus.pending,
        createdAt: DateTime(2024, 3, 1),
      );
      expect(app.id, 'a1');
      expect(app.status, ApplicationStatus.pending);
      expect(app.coverLetter, ''); // default
      expect(app.job, null);
      expect(app.applicant, null);
    });

    test('copyWith creates modified copy', () {
      final app = Application(
        id: 'a1',
        jobId: 'j1',
        applicantId: 'p1',
        status: ApplicationStatus.pending,
        createdAt: DateTime(2024, 3, 1),
      );
      final updated = app.copyWith(
        status: ApplicationStatus.accepted,
        coverLetter: 'Updated letter',
      );
      expect(updated.status, ApplicationStatus.accepted);
      expect(updated.coverLetter, 'Updated letter');
      expect(updated.id, 'a1'); // unchanged
    });

    test('ApplicationStatus has all expected values', () {
      expect(ApplicationStatus.values.length, 4);
      expect(ApplicationStatus.values, contains(ApplicationStatus.pending));
      expect(ApplicationStatus.values, contains(ApplicationStatus.reviewed));
      expect(ApplicationStatus.values, contains(ApplicationStatus.accepted));
      expect(ApplicationStatus.values, contains(ApplicationStatus.rejected));
    });
  });

  group('Education', () {
    test('constructor creates education entry', () {
      final edu = Education(
        id: 'e1',
        userId: 'u1',
        institution: 'TU Berlin',
        degree: 'Master',
        startDate: DateTime(2020, 9),
      );
      expect(edu.id, 'e1');
      expect(edu.institution, 'TU Berlin');
      expect(edu.degree, 'Master');
      expect(edu.current, false); // default
      expect(edu.fieldOfStudy, ''); // default
      expect(edu.endDate, null);
      expect(edu.description, null);
    });

    test('copyWith creates modified copy', () {
      final edu = Education(
        id: 'e1',
        userId: 'u1',
        institution: 'TU Berlin',
        degree: 'Master',
        startDate: DateTime(2020, 9),
      );
      final updated = edu.copyWith(
        current: true,
        fieldOfStudy: 'Computer Science',
        description: 'Great program',
      );
      expect(updated.current, true);
      expect(updated.fieldOfStudy, 'Computer Science');
      expect(updated.description, 'Great program');
      expect(updated.institution, 'TU Berlin'); // unchanged
    });
  });

  group('Experience', () {
    test('constructor creates experience entry', () {
      final exp = Experience(
        id: 'x1',
        userId: 'u1',
        company: 'Google',
        position: 'SWE',
        startDate: DateTime(2022, 1),
      );
      expect(exp.id, 'x1');
      expect(exp.company, 'Google');
      expect(exp.position, 'SWE');
      expect(exp.current, false); // default
      expect(exp.location, null);
      expect(exp.endDate, null);
    });

    test('copyWith creates modified copy', () {
      final exp = Experience(
        id: 'x1',
        userId: 'u1',
        company: 'Google',
        position: 'SWE',
        startDate: DateTime(2022, 1),
      );
      final updated = exp.copyWith(
        current: true,
        location: 'Munich',
      );
      expect(updated.current, true);
      expect(updated.location, 'Munich');
      expect(updated.company, 'Google'); // unchanged
    });

    test('current flag indicates ongoing position', () {
      final exp = Experience(
        id: 'x1',
        userId: 'u1',
        company: 'Meta',
        position: 'Engineer',
        startDate: DateTime(2023, 6),
        current: true,
        endDate: null,
      );
      expect(exp.current, true);
      expect(exp.endDate, null);
    });
  });

  group('LanguageSkill', () {
    test('constructor creates language skill', () {
      final lang = LanguageSkill(
        id: 'l1',
        userId: 'u1',
        language: 'Deutsch',
        level: LanguageLevel.b2,
      );
      expect(lang.id, 'l1');
      expect(lang.language, 'Deutsch');
      expect(lang.level, LanguageLevel.b2);
      expect(lang.certified, false); // default
    });

    test('copyWith creates modified copy', () {
      final lang = LanguageSkill(
        id: 'l1',
        userId: 'u1',
        language: 'Deutsch',
        level: LanguageLevel.b2,
      );
      final updated = lang.copyWith(
        level: LanguageLevel.c1,
        certified: true,
      );
      expect(updated.level, LanguageLevel.c1);
      expect(updated.certified, true);
      expect(updated.language, 'Deutsch'); // unchanged
    });

    test('LanguageLevel enum ordering', () {
      expect(LanguageLevel.a1.index, 0);
      expect(LanguageLevel.c2.index, 5);
    });
  });

  group('Document', () {
    test('constructor creates document', () {
      final doc = Document(
        id: 'd1',
        userId: 'u1',
        name: 'CV.pdf',
        type: DocumentType.cv,
        uploadedAt: DateTime(2024, 3, 1),
      );
      expect(doc.id, 'd1');
      expect(doc.name, 'CV.pdf');
      expect(doc.type, DocumentType.cv);
      expect(doc.fileUrl, ''); // default
      expect(doc.fileSize, null);
    });

    test('copyWith creates modified copy', () {
      final doc = Document(
        id: 'd1',
        userId: 'u1',
        name: 'CV.pdf',
        type: DocumentType.cv,
        uploadedAt: DateTime(2024, 3, 1),
      );
      final updated = doc.copyWith(
        name: 'Updated_CV.pdf',
        fileSize: 500000,
        fileUrl: 'https://example.com/cv.pdf',
      );
      expect(updated.name, 'Updated_CV.pdf');
      expect(updated.fileSize, 500000);
      expect(updated.fileUrl, 'https://example.com/cv.pdf');
      expect(updated.type, DocumentType.cv); // unchanged
    });

    test('DocumentType enum has all expected values', () {
      expect(DocumentType.values.length, 4);
      expect(DocumentType.values, contains(DocumentType.cv));
      expect(DocumentType.values, contains(DocumentType.diploma));
      expect(DocumentType.values, contains(DocumentType.certificate));
      expect(DocumentType.values, contains(DocumentType.other));
    });
  });

  group('Conversation', () {
    test('constructor creates conversation', () {
      final conv = Conversation(
        id: 'c1',
        applicantId: 'u1',
        employerId: 'u2',
        jobId: 'j1',
        jobTitle: 'Developer',
        createdAt: DateTime(2024, 3, 1),
        lastMessage: 'Hello',
        lastMessageAt: DateTime(2024, 3, 2),
      );
      expect(conv.id, 'c1');
      expect(conv.jobTitle, 'Developer');
      expect(conv.unreadCount, 0); // default
    });

    test('copyWith creates modified copy', () {
      final conv = Conversation(
        id: 'c1',
        applicantId: 'u1',
        employerId: 'u2',
        jobId: 'j1',
        jobTitle: 'Developer',
        createdAt: DateTime(2024, 3, 1),
        lastMessage: 'Hello',
        lastMessageAt: DateTime(2024, 3, 2),
      );
      final updated = conv.copyWith(unreadCount: 5, lastMessage: 'Bye');
      expect(updated.unreadCount, 5);
      expect(updated.lastMessage, 'Bye');
      expect(updated.id, 'c1');
    });
  });

  group('Message', () {
    test('constructor creates message', () {
      final msg = Message(
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        text: 'Hello world',
        createdAt: DateTime(2024, 3, 1),
      );
      expect(msg.id, 'm1');
      expect(msg.text, 'Hello world');
      expect(msg.isRead, false); // default
    });

    test('copyWith creates modified copy', () {
      final msg = Message(
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        text: 'Hello',
        createdAt: DateTime(2024, 3, 1),
      );
      final updated = msg.copyWith(isRead: true);
      expect(updated.isRead, true);
      expect(updated.text, 'Hello'); // unchanged
    });
  });
}
