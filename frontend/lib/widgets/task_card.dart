import 'package:flutter/material.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/models/user.dart';
import 'package:frontend/widgets/user_avatar.dart';
import 'package:intl/intl.dart';
import 'package:frontend/screens/tasks/task_detail_screen.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/providers/auth_provider.dart';

class TaskCard extends StatelessWidget {
  final Task task;
  final VoidCallback onTap;
  final VoidCallback? onMorePressed;
  final Function(bool)? onStatusChanged;

  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
    this.onMorePressed,
    this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          Navigator.of(context)
              .push(
                MaterialPageRoute(builder: (_) => TaskDetailScreen(task: task)),
              )
              .then((result) {
                if (result == true) {
                  onTap();
                }
              });
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      task.title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      _buildCheckButton(context),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.more_horiz),
                        onPressed: onMorePressed ?? () {},
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (task.deadline != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  'Due date: ${DateFormat('MMM d, yyyy').format(task.deadline!)}',
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
              ),
            if (task.description != null && task.description!.isNotEmpty)
              Container(
                margin: const EdgeInsets.all(16),
                height: 120,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.red.shade300,
                      Colors.purple.shade300,
                      Colors.blue.shade300,
                    ],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildTaskMemberAvatars(task.assignees),
                  Row(
                    children: [
                      const Icon(Icons.flag, color: Colors.blue, size: 20),
                      const SizedBox(width: 12),
                      const Icon(
                        Icons.chat_bubble_outline,
                        color: Colors.grey,
                        size: 20,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '0',
                        style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      ),
                      const SizedBox(width: 12),
                      const Icon(
                        Icons.attach_file,
                        color: Colors.grey,
                        size: 20,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${task.attachments.length}',
                        style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckButton(BuildContext context) {
    return StatefulBuilder(
      builder: (context, setState) {
        final isCompleted = task.status == 'Done';
        return InkWell(
          onTap: () async {
            final authProvider = Provider.of<AuthProvider>(
              context,
              listen: false,
            );
            if (authProvider.token == null) return;

            final taskService = TaskService();
            try {
              await taskService.updateTask(authProvider.token!, task.id, {
                'status': isCompleted ? 'To Do' : 'Done',
              });
              onStatusChanged?.call(!isCompleted);
            } catch (e) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error updating task: $e')),
              );
            }
          },
          child: Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: isCompleted ? Colors.blue : Colors.grey[300]!,
                width: 2,
              ),
              color: isCompleted ? Colors.blue : Colors.transparent,
            ),
            child:
                isCompleted
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : null,
          ),
        );
      },
    );
  }

  Widget _buildTaskMemberAvatars(List<User> assignees) {
    const maxDisplayed = 3;

    return Row(
      children: [
        ...assignees.take(maxDisplayed).map((member) {
          return Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: UserAvatar(user: member, size: 28),
          );
        }),
        if (assignees.length > maxDisplayed)
          Container(
            margin: const EdgeInsets.only(left: 0),
            decoration: BoxDecoration(
              color: Colors.black54,
              border: Border.all(color: Colors.white, width: 2),
              shape: BoxShape.circle,
            ),
            width: 28,
            height: 28,
            child: Center(
              child: Text(
                '+${assignees.length - maxDisplayed}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
