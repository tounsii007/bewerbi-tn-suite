import 'job.dart';

class LanguageSkill {
  final String id;
  final String userId;
  final String language;
  final LanguageLevel level;
  final bool certified;

  const LanguageSkill({
    required this.id,
    required this.userId,
    required this.language,
    required this.level,
    this.certified = false,
  });

  LanguageSkill copyWith({
    String? id,
    String? userId,
    String? language,
    LanguageLevel? level,
    bool? certified,
  }) {
    return LanguageSkill(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      language: language ?? this.language,
      level: level ?? this.level,
      certified: certified ?? this.certified,
    );
  }
}
