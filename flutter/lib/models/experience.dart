class Experience {
  final String id;
  final String userId;
  final String company;
  final String position;
  final String? location;
  final DateTime startDate;
  final DateTime? endDate;
  final bool current;
  final String? description;

  const Experience({
    required this.id,
    required this.userId,
    required this.company,
    required this.position,
    this.location,
    required this.startDate,
    this.endDate,
    this.current = false,
    this.description,
  });

  Experience copyWith({
    String? id,
    String? userId,
    String? company,
    String? position,
    String? location,
    DateTime? startDate,
    DateTime? endDate,
    bool? current,
    String? description,
  }) {
    return Experience(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      company: company ?? this.company,
      position: position ?? this.position,
      location: location ?? this.location,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      current: current ?? this.current,
      description: description ?? this.description,
    );
  }
}
