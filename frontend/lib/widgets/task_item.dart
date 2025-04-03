import 'package:flutter/material.dart';
import 'package:frontend/core/theme/app_colors.dart';

class TaskItem extends StatefulWidget {
  final String title;
  final String time;
  final bool isCompleted;
  final VoidCallback? onTap;

  const TaskItem({
    Key? key,
    required this.title,
    required this.time,
    this.isCompleted = false,
    this.onTap,
  }) : super(key: key);

  @override
  State<TaskItem> createState() => _TaskItemState();
}

class _TaskItemState extends State<TaskItem> {
  late bool _isCompleted;

  @override
  void initState() {
    super.initState();
    _isCompleted = widget.isCompleted;
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.grey[100], // Slightly darker than background
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
            InkWell(
              onTap: () {
                setState(() {
                  _isCompleted = !_isCompleted;
                });
              },
              child: Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: _isCompleted ? AppColors.primary : Colors.grey[300]!,
                    width: 2,
                  ),
                  color: _isCompleted ? AppColors.primary : Colors.transparent,
                ),
                child:
                    _isCompleted
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
