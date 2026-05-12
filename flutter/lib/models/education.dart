class Education {
  final String id;
  final String userId;
  final String institution;
  final String degree;
  final String fieldOfStudy;
  final DateTime startDate;
  final DateTime? endDate;
  final bool current;
  final String? description;

  const Education({
    required this.id,
    required this.userId,
    required this.institution,
    required this.degree,
    this.fieldOfStudy = '',
    required this.startDate,
    this.endDate,
    this.current = false,
    this.description,
  });

  Education copyWith({
    String? id,
    String? userId,
    String? institution,
    String? degree,
    String? fieldOfStudy,
    DateTime? startDate,
    DateTime? endDate,
    bool? current,
    String? description,
  }) {
    return Education(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      institution: institution ?? this.institution,
      degree: degree ?? this.degree,
      fieldOfStudy: fieldOfStudy ?? this.fieldOfStudy,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      current: current ?? this.current,
      description: description ?? this.description,
    );
  }
}
