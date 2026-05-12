import 'job.dart';
import 'profile.dart';

enum ApplicationStatus { pending, reviewed, accepted, rejected }

class Application {
  final String id;
  final String jobId;
  final String applicantId;
  final ApplicationStatus status;
  final String coverLetter;
  final DateTime createdAt;
  final Job? job;
  final Profile? applicant;

  const Application({
    required this.id,
    required this.jobId,
    required this.applicantId,
    required this.status,
    this.coverLetter = '',
    required this.createdAt,
    this.job,
    this.applicant,
  });

  Application copyWith({
    String? id,
    String? jobId,
    String? applicantId,
    ApplicationStatus? status,
    String? coverLetter,
    DateTime? createdAt,
    Job? job,
    Profile? applicant,
  }) {
    return Application(
      id: id ?? this.id,
      jobId: jobId ?? this.jobId,
      applicantId: applicantId ?? this.applicantId,
      status: status ?? this.status,
      coverLetter: coverLetter ?? this.coverLetter,
      createdAt: createdAt ?? this.createdAt,
      job: job ?? this.job,
      applicant: applicant ?? this.applicant,
    );
  }
}
