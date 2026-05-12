enum UserRole { applicant, employer, admin }

class Profile {
  final String id;
  final String userId;
  final UserRole role;
  final String firstName;
  final String lastName;
  final String? photoUrl;
  final String phone;
  final String city;
  final String country;
  final String bio;
  final DateTime createdAt;

  const Profile({
    required this.id,
    required this.userId,
    required this.role,
    required this.firstName,
    required this.lastName,
    this.photoUrl,
    this.phone = '',
    this.city = '',
    this.country = '',
    this.bio = '',
    required this.createdAt,
  });

  String get fullName => '$firstName $lastName';

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      role: UserRole.values.firstWhere(
        (e) => e.name == json['role'],
        orElse: () => UserRole.applicant,
      ),
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      photoUrl: json['photo_url'] as String?,
      phone: json['phone'] as String? ?? '',
      city: json['city'] as String? ?? '',
      country: json['country'] as String? ?? '',
      bio: json['bio'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'role': role.name,
      'first_name': firstName,
      'last_name': lastName,
      'photo_url': photoUrl,
      'phone': phone,
      'city': city,
      'country': country,
      'bio': bio,
      'created_at': createdAt.toIso8601String(),
    };
  }

  Profile copyWith({
    String? id,
    String? userId,
    UserRole? role,
    String? firstName,
    String? lastName,
    String? photoUrl,
    String? phone,
    String? city,
    String? country,
    String? bio,
    DateTime? createdAt,
  }) {
    return Profile(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      role: role ?? this.role,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      photoUrl: photoUrl ?? this.photoUrl,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      country: country ?? this.country,
      bio: bio ?? this.bio,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
