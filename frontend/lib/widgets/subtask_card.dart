import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class SubtaskCard extends StatelessWidget {
  final String title;
  final DateTime? deadline;
  final bool isCompleted;
  final VoidCallback? onTap;
  final Function(bool)? onStatusChanged;

  const SubtaskCard({
    super.key,
    required this.title,
    this.deadline,
    required this.isCompleted,
    this.onTap,
    this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Checkbox
              InkWell(
                onTap: () => onStatusChanged?.call(!isCompleted),
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
                          ? const Icon(
                            Icons.check,
                            size: 16,
                            color: Colors.white,
                          )
                          : null,
                ),
              ),
              const SizedBox(width: 12),
              // Title and deadline
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        decoration:
                            isCompleted ? TextDecoration.lineThrough : null,
                        color: isCompleted ? Colors.grey : Colors.black,
                      ),
                    ),
                    if (deadline != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          DateFormat('MMM d, y - HH:mm').format(deadline!),
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
