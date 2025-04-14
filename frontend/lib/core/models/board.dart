class Board {
  final String id;
  final String title;
  final String projectId;
  final String? projectTitle;
  final int order;
  final String status; // Added status field
  final DateTime createdAt;
  final DateTime updatedAt;

  Board({
    required this.id,
    required this.title,
    required this.projectId,
    this.projectTitle,
    required this.order,
    this.status = 'todo', // Default status
    required this.createdAt,
    required this.updatedAt,
  });

  factory Board.fromJson(Map<String, dynamic> json) {
    // Handle dates safely
    DateTime createdAtDate;
    try {
      createdAtDate =
          json['createdAt'] != null
              ? DateTime.parse(json['createdAt'])
              : DateTime.now();
    } catch (e) {
      // print('Error parsing createdAt: $e');
      createdAtDate = DateTime.now();
    }

    DateTime updatedAtDate;
    try {
      updatedAtDate =
          json['updatedAt'] != null
              ? DateTime.parse(json['updatedAt'])
              : DateTime.now();
    } catch (e) {
      // print('Error parsing updatedAt: $e');
      updatedAtDate = DateTime.now();
    }

    // Handle project data
    final project = json['project'];
    final String projectId;
    final String? projectTitle;

    if (project is Map<String, dynamic>) {
      projectId = project['_id']?.toString() ?? '';
      projectTitle = project['title'] ?? '';
    } else {
      projectId = project?.toString() ?? '';
      projectTitle = null;
    }

    return Board(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      projectId: projectId,
      projectTitle: projectTitle,
      order: json['order'] ?? 0,
      status: json['status'] ?? 'todo', // Parse status from JSON
      createdAt: createdAtDate,
      updatedAt: updatedAtDate,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'project': projectId,
      'order': order,
      'status': status,
    };
  }

  Board copyWith({
    String? title,
    String? projectId,
    String? projectTitle,
    int? order,
    String? status,
  }) {
    return Board(
      id: id,
      title: title ?? this.title,
      projectId: projectId ?? this.projectId,
      projectTitle: projectTitle ?? this.projectTitle,
      order: order ?? this.order,
      status: status ?? this.status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
