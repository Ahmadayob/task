import 'package:flutter/material.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/providers/auth_provider.dart';

class TaskItem extends StatefulWidget {
  final String title;
  final String time;
  final bool isCompleted;
  final VoidCallback? onTap;
  final Task task;
  final Function(bool)? onStatusChanged;

  const TaskItem({
    super.key,
    required this.title,
    required this.time,
    this.isCompleted = false,
    this.onTap,
    required this.task,
    this.onStatusChanged,
  });

  @override
  State<TaskItem> createState() => _TaskItemState();
}

class _TaskItemState extends State<TaskItem> {
  late bool _isCompleted;
  final TaskService _taskService = TaskService();
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _isCompleted = widget.isCompleted;
  }

  Future<void> _updateTaskStatus(bool completed) async {
    if (_isUpdating) return;

    setState(() {
      _isUpdating = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.token == null) {
        throw Exception('Authentication token is missing');
      }

      await _taskService.updateTask(authProvider.token!, widget.task.id, {
        'status': completed ? 'Done' : 'To Do',
      });

      setState(() {
        _isCompleted = completed;
      });

      widget.onStatusChanged?.call(completed);
    } catch (e) {
      setState(() {
        _isCompleted = !completed;
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error updating task: $e')));
    } finally {
      setState(() {
        _isUpdating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      decoration:
                          _isCompleted ? TextDecoration.lineThrough : null,
                      color: _isCompleted ? Colors.grey : Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.time,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            if (_isUpdating)
              const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              InkWell(
                onTap: () => _updateTaskStatus(!_isCompleted),
                child: Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color:
                          _isCompleted ? AppColors.primary : Colors.grey[300]!,
                      width: 2,
                    ),
                    color:
                        _isCompleted ? AppColors.primary : Colors.transparent,
                  ),
                  child:
                      _isCompleted
                          ? const Icon(
                            Icons.check,
                            size: 16,
                            color: Colors.white,
                          )
                          : null,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
