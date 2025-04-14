class BoardColumn {
  final String id;
  final String title;
  final String color;
  final List<String> boardIds;

  BoardColumn({
    required this.id,
    required this.title,
    required this.color,
    required this.boardIds,
  });

  BoardColumn copyWith({
    String? id,
    String? title,
    String? color,
    List<String>? boardIds,
  }) {
    return BoardColumn(
      id: id ?? this.id,
      title: title ?? this.title,
      color: color ?? this.color,
      boardIds: boardIds ?? this.boardIds,
    );
  }
}
