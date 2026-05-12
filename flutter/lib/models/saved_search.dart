import 'package:bewerbi_tn_flutter/models/job.dart';

class SavedSearch {
  final String id;
  final String name;
  final String? query;
  final JobCategory? category;
  final JobType? type;
  final String? location;
  final LanguageLevel? minGermanLevel;
  final int? salaryMin;
  final bool alertsEnabled;
  final DateTime createdAt;

  const SavedSearch({
    required this.id,
    required this.name,
    this.query,
    this.category,
    this.type,
    this.location,
    this.minGermanLevel,
    this.salaryMin,
    this.alertsEnabled = true,
    required this.createdAt,
  });

  SavedSearch copyWith({
    String? name,
    String? query,
    JobCategory? category,
    JobType? type,
    String? location,
    LanguageLevel? minGermanLevel,
    int? salaryMin,
    bool? alertsEnabled,
  }) {
    return SavedSearch(
      id: id,
      name: name ?? this.name,
      query: query ?? this.query,
      category: category ?? this.category,
      type: type ?? this.type,
      location: location ?? this.location,
      minGermanLevel: minGermanLevel ?? this.minGermanLevel,
      salaryMin: salaryMin ?? this.salaryMin,
      alertsEnabled: alertsEnabled ?? this.alertsEnabled,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'query': query,
        'category': category?.name,
        'type': type?.name,
        'location': location,
        'minGermanLevel': minGermanLevel?.name,
        'salaryMin': salaryMin,
        'alertsEnabled': alertsEnabled,
        'createdAt': createdAt.toIso8601String(),
      };

  factory SavedSearch.fromJson(Map<String, dynamic> json) {
    return SavedSearch(
      id: json['id'] as String,
      name: json['name'] as String,
      query: json['query'] as String?,
      category: json['category'] != null
          ? JobCategory.values.firstWhere(
              (e) => e.name == json['category'],
              orElse: () => JobCategory.sonstige,
            )
          : null,
      type: json['type'] != null
          ? JobType.values.firstWhere(
              (e) => e.name == json['type'],
              orElse: () => JobType.job,
            )
          : null,
      location: json['location'] as String?,
      minGermanLevel: json['minGermanLevel'] != null
          ? LanguageLevel.values.firstWhere(
              (e) => e.name == json['minGermanLevel'],
              orElse: () => LanguageLevel.a1,
            )
          : null,
      salaryMin: json['salaryMin'] as int?,
      alertsEnabled: json['alertsEnabled'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}
