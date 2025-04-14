import 'package:flutter/material.dart';
import 'package:frontend/core/models/board.dart';
import 'package:frontend/core/models/board_column.dart';
import 'package:frontend/widgets/kanban_board.dart';

class KanbanBoardView extends StatefulWidget {
  final List<Board> boards;
  final Function(Board) onBoardTap;
  final Function(Board, String) onBoardStatusChanged;

  const KanbanBoardView({
    super.key,
    required this.boards,
    required this.onBoardTap,
    required this.onBoardStatusChanged,
  });

  @override
  State<KanbanBoardView> createState() => _KanbanBoardViewState();
}

class _KanbanBoardViewState extends State<KanbanBoardView> {
  late List<BoardColumn> _columns;

  @override
  void initState() {
    super.initState();
    _initializeColumns();
  }

  @override
  void didUpdateWidget(KanbanBoardView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.boards != widget.boards) {
      _initializeColumns();
    }
  }

  void _initializeColumns() {
    // Define default columns
    _columns = [
      BoardColumn(
        id: 'todo',
        title: 'To Do',
        color: Colors.blue.value.toString(),
        boardIds: [],
      ),
      BoardColumn(
        id: 'in_progress',
        title: 'In Progress',
        color: Colors.orange.value.toString(),
        boardIds: [],
      ),
      BoardColumn(
        id: 'review',
        title: 'Review',
        color: Colors.purple.value.toString(),
        boardIds: [],
      ),
      BoardColumn(
        id: 'done',
        title: 'Done',
        color: Colors.green.value.toString(),
        boardIds: [],
      ),
    ];

    // Clear any existing board IDs
    for (var column in _columns) {
      column.boardIds.clear();
    }

    // Distribute boards to columns based on their status
    for (var board in widget.boards) {
      // Find the column that matches the board's status
      final columnIndex = _columns.indexWhere(
        (column) => column.id == board.status,
      );
      if (columnIndex >= 0) {
        _columns[columnIndex].boardIds.add(board.id);
      } else {
        // If no matching column, default to 'todo'
        _columns[0].boardIds.add(board.id);
      }
    }

    // Debug: Print board distribution
    for (var column in _columns) {
      print('Column ${column.title} has ${column.boardIds.length} boards');
    }
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: SizedBox(
            width:
                constraints.maxWidth < 800
                    ? _columns.length * 280.0
                    : constraints.maxWidth,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: _columns.map((column) => _buildColumn(column)).toList(),
            ),
          ),
        );
      },
    );
  }

  Widget _buildColumn(BoardColumn column) {
    // Get boards that belong to this column based on their ID
    final columnBoards =
        widget.boards
            .where((board) => column.boardIds.contains(board.id))
            .toList();

    // Debug: Print boards in this column
    print('Column ${column.title} displaying ${columnBoards.length} boards');
    for (var board in columnBoards) {
      print('Board ${board.title} with status ${board.status}');
    }

    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            _buildColumnHeader(column),
            Expanded(
              child: DragTarget<Board>(
                builder: (context, candidateData, rejectedData) {
                  return Container(
                    padding: const EdgeInsets.all(8.0),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child:
                        columnBoards.isEmpty
                            ? _buildEmptyColumn()
                            : ListView.builder(
                              itemCount: columnBoards.length,
                              itemBuilder: (context, index) {
                                return _buildDraggableBoard(
                                  columnBoards[index],
                                  column.id,
                                );
                              },
                            ),
                  );
                },
                onAcceptWithDetails: (details) {
                  // Handle board being dropped into this column
                  final updatedBoard = details.data.copyWith(status: column.id);
                  widget.onBoardStatusChanged(updatedBoard, column.id);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColumnHeader(BoardColumn column) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      decoration: BoxDecoration(
        color: Color(int.parse(column.color)),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Center(
        child: Text(
          column.title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyColumn() {
    return Center(
      child: Text(
        'No boards',
        style: TextStyle(
          color: Colors.grey.shade600,
          fontStyle: FontStyle.italic,
        ),
      ),
    );
  }

  Widget _buildDraggableBoard(Board board, String columnId) {
    return Draggable<Board>(
      data: board,
      feedback: SizedBox(
        width: 250,
        child: KanbanBoardCard(
          board: board,
          onTap: () {}, // Empty function for the dragged preview
        ),
      ),
      childWhenDragging: Container(
        height: 100,
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.grey.shade300,
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      child: KanbanBoardCard(
        board: board,
        onTap: () => widget.onBoardTap(board),
      ),
    );
  }

  KanbanBoardCard({required Board board, required Function() onTap}) {}
}
