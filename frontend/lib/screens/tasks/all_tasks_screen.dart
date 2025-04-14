import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:frontend/screens/tasks/task_detail_screen.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';
import 'package:frontend/widgets/task_card.dart';

class AllTasksScreen extends StatefulWidget {
  const AllTasksScreen({super.key});

  @override
  State<AllTasksScreen> createState() => _AllTasksScreenState();
}

class _AllTasksScreenState extends State<AllTasksScreen> {
  late Future<List<Task>> _tasksFuture;
  final TaskService _taskService = TaskService();
  String _filterStatus = 'All';
  String _sortBy = 'Deadline';
  bool _showCompleted = true;

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  void _loadTasks() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.token != null) {
      _tasksFuture = _taskService.getAllTasks(authProvider.token!);
    }
  }

  List<Task> _filterAndSortTasks(List<Task> tasks) {
    // Filter by status
    var filteredTasks = tasks;
    if (_filterStatus != 'All') {
      filteredTasks =
          tasks.where((task) => task.status == _filterStatus).toList();
    }

    // Filter completed tasks
    if (!_showCompleted) {
      filteredTasks =
          filteredTasks.where((task) => task.status != 'Done').toList();
    }

    // Sort tasks
    switch (_sortBy) {
      case 'Deadline':
        filteredTasks.sort((a, b) {
          if (a.deadline == null) return 1;
          if (b.deadline == null) return -1;
          return a.deadline!.compareTo(b.deadline!);
        });
        break;
      case 'Priority':
        final priorityOrder = {'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3};
        filteredTasks.sort((a, b) {
          final aPriority = priorityOrder[a.priority] ?? 4;
          final bPriority = priorityOrder[b.priority] ?? 4;
          return aPriority.compareTo(bPriority);
        });
        break;
      case 'Created':
        filteredTasks.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;
      case 'Updated':
        filteredTasks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
        break;
    }

    return filteredTasks;
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder:
          (context) => StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                title: const Text('Filter Tasks'),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Status',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children:
                          ['All', 'To Do', 'In Progress', 'In Review', 'Done']
                              .map(
                                (status) => ChoiceChip(
                                  label: Text(status),
                                  selected: _filterStatus == status,
                                  onSelected: (selected) {
                                    if (selected) {
                                      setState(() {
                                        _filterStatus = status;
                                      });
                                      this.setState(() {});
                                    }
                                  },
                                ),
                              )
                              .toList(),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Sort By',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children:
                          ['Deadline', 'Priority', 'Created', 'Updated']
                              .map(
                                (sort) => ChoiceChip(
                                  label: Text(sort),
                                  selected: _sortBy == sort,
                                  onSelected: (selected) {
                                    if (selected) {
                                      setState(() {
                                        _sortBy = sort;
                                      });
                                      this.setState(() {});
                                    }
                                  },
                                ),
                              )
                              .toList(),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Checkbox(
                          value: _showCompleted,
                          onChanged: (value) {
                            setState(() {
                              _showCompleted = value ?? true;
                            });
                            this.setState(() {});
                          },
                        ),
                        const Text('Show completed tasks'),
                      ],
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Text('Close'),
                  ),
                ],
              );
            },
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('All Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _loadTasks();
          });
        },
        child: FutureBuilder<List<Task>>(
          future: _tasksFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return ErrorState(
                message: 'Failed to load tasks: ${snapshot.error}',
                onRetry: () {
                  setState(() {
                    _loadTasks();
                  });
                },
              );
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const EmptyState(
                icon: Icons.task_outlined,
                title: 'No Tasks',
                message: 'You have no tasks yet',
              );
            } else {
              final filteredTasks = _filterAndSortTasks(snapshot.data!);

              if (filteredTasks.isEmpty) {
                return const EmptyState(
                  icon: Icons.filter_list,
                  title: 'No Matching Tasks',
                  message: 'Try changing your filters',
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: filteredTasks.length,
                itemBuilder: (context, index) {
                  final task = filteredTasks[index];
                  return TaskCard(
                    task: task,
                    onTap: () async {
                      final result = await Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => TaskDetailScreen(task: task),
                        ),
                      );
                      if (result == true) {
                        setState(() {
                          _loadTasks();
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
    );
  }
}
