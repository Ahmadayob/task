import 'package:frontend/core/models/user.dart';

class Project {
  final String id;
  final String title;
  final String? description;
  final User manager;
  final List<User> members;
  final DateTime? deadline;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  Project({
    required this.id,
    required this.title,
    this.description,
    required this.manager,
    required this.members,
    this.deadline,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      manager: User.fromJson(json['manager']),
      members:
          (json['members'] as List<dynamic>)
              .map((member) => User.fromJson(member))
              .toList(),
      deadline:
          json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'deadline': deadline?.toIso8601String(),
      'status': status,
    };
  }

  Project copyWith({
    String? title,
    String? description,
    User? manager,
    List<User>? members,
    DateTime? deadline,
    String? status,
  }) {
    return Project(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      manager: manager ?? this.manager,
      members: members ?? this.members,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
