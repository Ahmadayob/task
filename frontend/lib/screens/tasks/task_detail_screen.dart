import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/widgets/custom_button.dart';

class TaskDetailScreen extends StatefulWidget {
  final Task task;

  const TaskDetailScreen({Key? key, required this.task}) : super(key: key);

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  late Task _task;
  bool _isEditing = false;
  bool _isLoading = false;
  String? _error;

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  late String _status;
  late String _priority;
  late DateTime? _deadline;

  final TaskService _taskService = TaskService();

  @override
  void initState() {
    super.initState();
    _task = widget.task;
    _titleController.text = _task.title;
    _descriptionController.text = _task.description ?? '';
    _status = _task.status;
    _priority = _task.priority;
    _deadline = _task.deadline;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _updateTask() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token!;

      final taskData = {
        'title': _titleController.text.trim(),
        'description': _descriptionController.text.trim(),
        'status': _status,
        'priority': _priority,
        'deadline': _deadline?.toIso8601String(),
      };

      final updatedTask = await _taskService.updateTask(
        token,
        _task.id,
        taskData,
      );
      setState(() {
        _task = updatedTask;
        _isEditing = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteTask() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Delete Task'),
            content: const Text(
              'Are you sure you want to delete this task? This action cannot be undone.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: TextButton.styleFrom(foregroundColor: Colors.red),
                child: const Text('Delete'),
              ),
            ],
          ),
    );

    if (confirmed == true) {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      try {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final token = authProvider.token!;

        await _taskService.deleteTask(token, _task.id);

        if (mounted) {
          Navigator.of(context).pop(true);
        }
      } catch (e) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _deadline ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != _deadline) {
      setState(() {
        _deadline = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Task' : 'Task Details'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                setState(() {
                  _isEditing = true;
                });
              },
            ),
          if (_isEditing)
            IconButton(icon: const Icon(Icons.check), onPressed: _updateTask),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_error != null)
                      Container(
                        padding: const EdgeInsets.all(8),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _error!,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ),
                    _buildTaskTitle(),
                    const SizedBox(height: 16),
                    _buildTaskDescription(),
                    const SizedBox(height: 16),
                    _buildTaskStatus(),
                    const SizedBox(height: 16),
                    _buildTaskPriority(),
                    const SizedBox(height: 16),
                    _buildTaskDeadline(),
                    const SizedBox(height: 16),
                    _buildTaskAssignees(),
                    const SizedBox(height: 24),
                    if (!_isEditing)
                      CustomButton(
                        text: 'Delete Task',
                        isOutlined: true,
                        textColor: Colors.red,
                        onPressed: _deleteTask,
                      ),
                  ],
                ),
              ),
    );
  }

  Widget _buildTaskTitle() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Title', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _isEditing
                ? TextField(
                  controller: _titleController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                )
                : Text(
                  _task.title,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskDescription() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Description', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _isEditing
                ? TextField(
                  controller: _descriptionController,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Enter task description (optional)',
                  ),
                )
                : Text(
                  _task.description ?? 'No description',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskStatus() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Status', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _isEditing
                ? DropdownButtonFormField<String>(
                  value: _status,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                  items:
                      ['To Do', 'In Progress', 'In Review', 'Done'].map((
                        status,
                      ) {
                        return DropdownMenuItem(
                          value: status,
                          child: Text(status),
                        );
                      }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _status = value;
                      });
                    }
                  },
                )
                : Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    _task.status,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskPriority() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Priority', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _isEditing
                ? DropdownButtonFormField<String>(
                  value: _priority,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                  items:
                      ['Low', 'Medium', 'High', 'Urgent'].map((priority) {
                        return DropdownMenuItem(
                          value: priority,
                          child: Text(priority),
                        );
                      }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _priority = value;
                      });
                    }
                  },
                )
                : Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getPriorityColor(_task.priority).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    _task.priority,
                    style: TextStyle(
                      color: _getPriorityColor(_task.priority),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskDeadline() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Deadline', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _isEditing
                ? Row(
                  children: [
                    Expanded(
                      child: Text(
                        _deadline == null
                            ? 'No deadline set'
                            : 'Deadline: ${DateFormat('MMM dd, yyyy').format(_deadline!)}',
                      ),
                    ),
                    TextButton.icon(
                      onPressed: () => _selectDate(context),
                      icon: const Icon(Icons.calendar_today),
                      label: Text(
                        _deadline == null ? 'Set Deadline' : 'Change',
                      ),
                    ),
                    if (_deadline != null)
                      IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _deadline = null;
                          });
                        },
                      ),
                  ],
                )
                : _task.deadline == null
                ? const Text('No deadline set')
                : Text(
                  'Deadline: ${DateFormat('MMM dd, yyyy').format(_task.deadline!)}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskAssignees() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Assignees', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            if (_task.assignees.isEmpty)
              const Text('No assignees')
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _task.assignees.length,
                itemBuilder: (context, index) {
                  final assignee = _task.assignees[index];
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundImage:
                          assignee.profilePicture != null
                              ? NetworkImage(assignee.profilePicture!)
                              : null,
                      child:
                          assignee.profilePicture == null
                              ? Text(
                                assignee.name.isNotEmpty
                                    ? assignee.name[0].toUpperCase()
                                    : '?',
                              )
                              : null,
                    ),
                    title: Text(assignee.name),
                    subtitle: Text(assignee.email),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'low':
        return AppColors.lowPriority;
      case 'medium':
        return AppColors.mediumPriority;
      case 'high':
        return AppColors.highPriority;
      case 'urgent':
        return AppColors.urgentPriority;
      default:
        return AppColors.mediumPriority;
    }
  }
}
