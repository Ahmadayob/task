class Board {
  final String id;
  final String title;
  final String project;
  final int order;
  final DateTime createdAt;
  final DateTime updatedAt;

  Board({
    required this.id,
    required this.title,
    required this.project,
    required this.order,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Board.fromJson(Map<String, dynamic> json) {
    return Board(
      id: json['_id'],
      title: json['title'],
      project: json['project'],
      order: json['order'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {'title': title, 'project': project, 'order': order};
  }

  Board copyWith({String? title, String? project, int? order}) {
    return Board(
      id: id,
      title: title ?? this.title,
      project: project ?? this.project,
      order: order ?? this.order,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
