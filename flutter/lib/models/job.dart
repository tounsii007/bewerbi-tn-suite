import 'profile.dart';

enum JobCategory { it, pflege, transport, sonstige }

enum JobType { job, ausbildung, studium, sprachkurs }

enum LanguageLevel { a1, a2, b1, b2, c1, c2 }

class Job {
  final String id;
  final String employerId;
  final String title;
  final String description;
  final JobCategory category;
  final JobType type;
  final String location;
  final String requirements;
  final String? salaryRange;
  final LanguageLevel? germanLevel;
  final DateTime createdAt;
  final String status;
  final Profile? employer;
  final List<String> customQuestions; // Arbeitgeber-definierte Zusatzfragen

  const Job({
    required this.id,
    required this.employerId,
    required this.title,
    required this.description,
    required this.category,
    required this.type,
    required this.location,
    this.requirements = '',
    this.salaryRange,
    this.germanLevel,
    required this.createdAt,
    this.status = 'active',
    this.employer,
    this.customQuestions = const [],
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] as String,
      employerId: json['employer_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      category: JobCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => JobCategory.sonstige,
      ),
      type: JobType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => JobType.job,
      ),
      location: json['location'] as String? ?? '',
      requirements: json['requirements'] as String? ?? '',
      salaryRange: json['salary_range'] as String?,
      germanLevel: json['german_level'] != null
          ? LanguageLevel.values.firstWhere(
              (e) => e.name == json['german_level'],
              orElse: () => LanguageLevel.a1,
            )
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      status: json['status'] as String? ?? 'active',
      employer: json['employer'] != null
          ? Profile.fromJson(json['employer'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'employer_id': employerId,
      'title': title,
      'description': description,
      'category': category.name,
      'type': type.name,
      'location': location,
      'requirements': requirements,
      'salary_range': salaryRange,
      'german_level': germanLevel?.name,
      'created_at': createdAt.toIso8601String(),
      'status': status,
    };
  }

  Job copyWith({
    String? id,
    String? employerId,
    String? title,
    String? description,
    JobCategory? category,
    JobType? type,
    String? location,
    String? requirements,
    String? salaryRange,
    LanguageLevel? germanLevel,
    DateTime? createdAt,
    String? status,
    Profile? employer,
    List<String>? customQuestions,
  }) {
    return Job(
      id: id ?? this.id,
      employerId: employerId ?? this.employerId,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      type: type ?? this.type,
      location: location ?? this.location,
      requirements: requirements ?? this.requirements,
      salaryRange: salaryRange ?? this.salaryRange,
      germanLevel: germanLevel ?? this.germanLevel,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      employer: employer ?? this.employer,
      customQuestions: customQuestions ?? this.customQuestions,
    );
  }
}
