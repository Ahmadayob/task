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
  final ProjectProgress? progress;

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
    this.progress,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    // Add debug print to see what's coming from the API
    print('Project.fromJson: $json');

    return Project(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      manager: User.fromJson(json['manager'] ?? {}),
      members:
          (json['members'] as List<dynamic>? ?? [])
              .map((member) => User.fromJson(member))
              .toList(),
      deadline:
          json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
      status: json['status'] ?? 'Planning',
      createdAt:
          json['createdAt'] != null
              ? DateTime.parse(json['createdAt'])
              : DateTime.now(),
      updatedAt:
          json['updatedAt'] != null
              ? DateTime.parse(json['updatedAt'] ?? '')
              : DateTime.now(),
      progress:
          json['progress'] != null
              ? ProjectProgress.fromJson(json['progress'])
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'title': title,
      'description': description,
      'deadline': deadline?.toIso8601String(),
      'status': status,
    };

    if (progress != null) {
      data['progress'] = progress!.toJson();
    }

    return data;
  }

  Project copyWith({
    String? title,
    String? description,
    User? manager,
    List<User>? members,
    DateTime? deadline,
    String? status,
    ProjectProgress? progress,
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
      progress: progress ?? this.progress,
    );
  }
}

class ProjectProgress {
  final int totalTasks;
  final int completedTasks;
  final double progressPercentage;

  ProjectProgress({
    required this.totalTasks,
    required this.completedTasks,
    required this.progressPercentage,
  });

  factory ProjectProgress.fromJson(Map<String, dynamic> json) {
    // Debug print to see the progress data
    print('ProjectProgress.fromJson: $json');

    // Handle the case where progressPercentage might be an int
    double parseProgressPercentage(dynamic value) {
      if (value == null) return 0.0;
      if (value is int) return value.toDouble();
      if (value is double) return value;
      if (value is String) {
        try {
          return double.parse(value);
        } catch (_) {
          return 0.0;
        }
      }
      return 0.0;
    }

    return ProjectProgress(
      totalTasks: json['totalTasks'] ?? 0,
      completedTasks: json['completedTasks'] ?? 0,
      progressPercentage: parseProgressPercentage(json['progressPercentage']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalTasks': totalTasks,
      'completedTasks': completedTasks,
      'progressPercentage': progressPercentage,
    };
  }
}
