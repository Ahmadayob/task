import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/board.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/board_service.dart';
import 'package:frontend/screens/projects/edit_project_screan.dart';
import 'package:frontend/screens/boards/create_board_screen.dart';
import 'package:frontend/screens/boards/board_detail_screen.dart';
import 'package:frontend/widgets/board_card.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';

class ProjectDetailScreen extends StatefulWidget {
  final Project project;

  const ProjectDetailScreen({Key? key, required this.project})
    : super(key: key);

  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  late Future<List<Board>> _boardsFuture;
  final BoardService _boardService = BoardService();

  @override
  void initState() {
    super.initState();
    _loadBoards();
  }

  void _loadBoards() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _boardsFuture = _boardService.getBoardsByProject(
      authProvider.token!,
      widget.project.id,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.project.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final result = await Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => EditProjectScreen(project: widget.project),
                ),
              );
              if (result == true) {
                // Refresh project details
                Navigator.of(context).pop(true);
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildProjectHeader(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                setState(() {
                  _loadBoards();
                });
              },
              child: FutureBuilder<List<Board>>(
                future: _boardsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return ErrorState(
                      message: 'Failed to load boards',
                      onRetry: () {
                        setState(() {
                          _loadBoards();
                        });
                      },
                    );
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const EmptyState(
                      icon: Icons.dashboard_outlined,
                      title: 'No Boards Yet',
                      message: 'Create your first board to get started',
                    );
                  } else {
                    final boards = snapshot.data!;
                    return ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: boards.length,
                      itemBuilder: (context, index) {
                        final board = boards[index];
                        return BoardCard(
                          board: board,
                          onTap: () async {
                            final result = await Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => BoardDetailScreen(board: board),
                              ),
                            );
                            if (result == true) {
                              setState(() {
                                _loadBoards();
                              });
                            }
                          },
                        );
                      },
                    );
                  }
                },
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => CreateBoardScreen(projectId: widget.project.id),
            ),
          );
          if (result == true) {
            setState(() {
              _loadBoards();
            });
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildProjectHeader() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.project.title,
                        style: Theme.of(context).textTheme.headlineSmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Manager: ${widget.project.manager.name}',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(widget.project.status),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    widget.project.status,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            if (widget.project.description != null &&
                widget.project.description!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                widget.project.description!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (widget.project.deadline != null)
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Deadline: ${widget.project.deadline!.toLocal().toString().split(' ')[0]}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  )
                else
                  Text(
                    'No deadline set',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                Text(
                  'Members: ${widget.project.members.length}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Planning':
        return Colors.blue.shade100;
      case 'In Progress':
        return Colors.orange.shade100;
      case 'On Hold':
        return Colors.yellow.shade100;
      case 'Completed':
        return Colors.green.shade100;
      case 'Cancelled':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }
}
