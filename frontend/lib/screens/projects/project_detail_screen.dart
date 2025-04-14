import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/board.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/board_service.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:frontend/core/services/project_service.dart';
import 'package:frontend/screens/boards/create_board_screen.dart';
import 'package:frontend/screens/projects/edit_project_screen.dart';
import 'package:frontend/widgets/kanban_board.dart';
import 'package:intl/intl.dart';

class ProjectDetailScreen extends StatefulWidget {
  final Project project;

  const ProjectDetailScreen({super.key, required this.project});

  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  late Project _project;
  late Future<List<Board>> _boardsFuture;
  final BoardService _boardService = BoardService();
  final TaskService _taskService = TaskService();
  bool _isLoading = false;
  final Map<String, List<Task>> _boardTasks = {};
  String? _error;

  @override
  void initState() {
    super.initState();
    _project = widget.project;
    _loadBoards();
  }

  void _loadBoards() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.token == null) {
        if (!mounted) return;
        setState(() {
          _error = "Authentication token is missing";
          _isLoading = false;
        });
        return;
      }

      _boardsFuture = _boardService.getBoardsByProject(
        authProvider.token!,
        _project.id,
      );

      final boards = await _boardsFuture;

      // Load tasks for each board
      for (var board in boards) {
        try {
          final tasks = await _taskService.getTasksByBoard(
            authProvider.token!,
            board.id,
          );

          if (!mounted) return;
          setState(() {
            _boardTasks[board.id] = tasks;
          });
        } catch (e) {
          // Just log the error and continue with other boards
          debugPrint('Error loading tasks for board ${board.id}: $e');
        }
      }
    } catch (e) {
      debugPrint('Error loading boards: $e');
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_project.title),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) async {
              if (value == 'edit') {
                final result = await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => EditProjectScreen(project: _project),
                  ),
                );
                if (result == true && mounted) {
                  // Refresh the project data
                  final authProvider = Provider.of<AuthProvider>(
                    context,
                    listen: false,
                  );
                  if (authProvider.token != null) {
                    final projectService = ProjectService();
                    try {
                      final updatedProject = await projectService
                          .getProjectById(authProvider.token!, _project.id);
                      if (mounted) {
                        setState(() {
                          _project = updatedProject;
                        });
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error updating project: $e')),
                        );
                      }
                    }
                  }
                }
              } else if (value == 'delete') {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder:
                      (context) => AlertDialog(
                        title: const Text('Delete Project'),
                        content: const Text(
                          'Are you sure you want to delete this project? This action cannot be undone.',
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('Cancel'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            style: TextButton.styleFrom(
                              foregroundColor: Colors.red,
                            ),
                            child: const Text('Delete'),
                          ),
                        ],
                      ),
                );

                if (confirmed == true && mounted) {
                  final authProvider = Provider.of<AuthProvider>(
                    context,
                    listen: false,
                  );
                  if (authProvider.token != null) {
                    final projectService = ProjectService();
                    try {
                      await projectService.deleteProject(
                        authProvider.token!,
                        _project.id,
                      );
                      if (mounted) {
                        Navigator.of(context).pop(true);
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error deleting project: $e')),
                        );
                      }
                    }
                  }
                }
              }
            },
            itemBuilder:
                (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit, size: 20),
                        SizedBox(width: 8),
                        Text('Edit Project'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete, size: 20, color: Colors.red),
                        SizedBox(width: 8),
                        Text(
                          'Delete Project',
                          style: TextStyle(color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          _loadBoards();
        },
        child:
            _error != null
                ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: $_error'),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadBoards,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
                : _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _buildContent(),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => CreateBoardScreen(projectId: _project.id),
            ),
          );
          if (result == true && mounted) {
            _loadBoards();
          }
        },
        backgroundColor: Colors.blue,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildContent() {
    // Make the entire content scrollable vertically
    return SingleChildScrollView(
      // Add padding at the bottom to avoid overlay with FAB
      padding: const EdgeInsets.only(bottom: 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildProjectHeader(),
          // Set a fixed height for the Kanban board container
          SizedBox(
            height:
                MediaQuery.of(context).size.height -
                200, // Adjust based on your layout
            child: _buildBoardsView(),
          ),
        ],
      ),
    );
  }

  Widget _buildProjectHeader() {
    final progress = _project.progress;
    final completedTasks = progress?.completedTasks ?? 0;
    final totalTasks = progress?.totalTasks ?? 0;
    final deadline = _project.deadline;

    return Container(
      padding: const EdgeInsets.all(16.0),
      color: Colors.blue.withOpacity(0.1),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_project.description != null && _project.description!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Text(
                _project.description!,
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
            ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$completedTasks/$totalTasks',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              if (deadline != null)
                Text(
                  '${_getRemainingDays(deadline)} Days Left, ${DateFormat('MMM d yyyy').format(deadline)}',
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
            ],
          ),
          const SizedBox(height: 8),
          _buildMemberAvatars(),
        ],
      ),
    );
  }

  Widget _buildMemberAvatars() {
    final members = _project.members;
    const maxDisplayed = 3;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('Team: ', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(width: 8),
        ...members.take(maxDisplayed).map((member) {
          return Padding(
            padding: const EdgeInsets.only(right: 4),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: Colors.grey[300],
              child: Text(
                member.name.isNotEmpty ? member.name[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.black54,
                ),
              ),
            ),
          );
        }),
        if (members.length > maxDisplayed)
          CircleAvatar(
            radius: 16,
            backgroundColor: Colors.grey[400],
            child: Text(
              '+${members.length - maxDisplayed}',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }

  int _getRemainingDays(DateTime deadline) {
    final now = DateTime.now();
    return deadline.difference(now).inDays;
  }

  Widget _buildBoardsView() {
    return FutureBuilder<List<Board>>(
      future: _boardsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting && _isLoading) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Error: ${snapshot.error}'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadBoards,
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(
            child: Text('No boards yet. Create your first board!'),
          );
        }

        final boards = snapshot.data!;

        // Use our updated KanbanBoard widget with projectId
        return KanbanBoard(
          boards: boards,
          boardTasks: _boardTasks,
          onRefresh: _loadBoards,
          projectId: _project.id,
        );
      },
    );
  }
}
