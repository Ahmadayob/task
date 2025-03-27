import 'package:frontend/core/models/user.dart';

class Task {
  final String id;
  final String title;
  final String? description;
  final String board;
  final List<User> assignees;
  final DateTime? deadline;
  final String status;
  final String priority;
  final int order;
  final DateTime createdAt;
  final DateTime updatedAt;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.board,
    required this.assignees,
    this.deadline,
    required this.status,
    required this.priority,
    required this.order,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      board: json['board'],
      assignees:
          (json['assignees'] as List<dynamic>)
              .map((assignee) => User.fromJson(assignee))
              .toList(),
      deadline:
          json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
      status: json['status'],
      priority: json['priority'],
      order: json['order'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'board': board,
      'assignees': assignees.map((assignee) => assignee.id).toList(),
      'deadline': deadline?.toIso8601String(),
      'status': status,
      'priority': priority,
    };
  }

  Task copyWith({
    String? title,
    String? description,
    String? board,
    List<User>? assignees,
    DateTime? deadline,
    String? status,
    String? priority,
    int? order,
  }) {
    return Task(
      id: id,
      title: title ?? this.title,
      description: description ?? this.description,
      board: board ?? this.board,
      assignees: assignees ?? this.assignees,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      order: order ?? this.order,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
