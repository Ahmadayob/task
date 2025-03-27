class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? profilePicture;
  final ContactInfo? contactInfo;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.profilePicture,
    this.contactInfo,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
      profilePicture: json['profilePicture'],
      contactInfo:
          json['contactInfo'] != null
              ? ContactInfo.fromJson(json['contactInfo'])
              : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'profilePicture': profilePicture,
      'contactInfo': contactInfo?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class ContactInfo {
  final String? phone;
  final String? location;

  ContactInfo({this.phone, this.location});

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(phone: json['phone'], location: json['location']);
  }

  Map<String, dynamic> toJson() {
    return {'phone': phone, 'location': location};
  }
}
