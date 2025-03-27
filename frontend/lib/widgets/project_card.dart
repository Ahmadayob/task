import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/theme/app_colors.dart';

class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback onTap;

  const ProjectCard({Key? key, required this.project, required this.onTap})
    : super(key: key);

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Planning':
        return AppColors.todoColor;
      case 'In Progress':
        return AppColors.inProgressColor;
      case 'On Hold':
        return AppColors.warning;
      case 'Completed':
        return AppColors.doneColor;
      case 'Cancelled':
        return AppColors.error;
      default:
        return AppColors.todoColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      project.title,
                      style: Theme.of(context).textTheme.titleLarge,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(project.status),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      project.status,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              if (project.description != null &&
                  project.description!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  project.description!,
                  style: Theme.of(context).textTheme.bodyMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.person, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        project.manager.name,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  if (project.deadline != null)
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          DateFormat('MMM dd, yyyy').format(project.deadline!),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  ...project.members
                      .take(3)
                      .map(
                        (member) => _buildMemberAvatar(
                          member.name,
                          member.profilePicture,
                        ),
                      ),
                  if (project.members.length > 3) ...[
                    const SizedBox(width: 4),
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: Theme.of(
                        context,
                      ).colorScheme.primary.withOpacity(0.2),
                      child: Text(
                        '+${project.members.length - 3}',
                        style: TextStyle(
                          fontSize: 10,
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMemberAvatar(String name, String? profilePicture) {
    return Padding(
      padding: const EdgeInsets.only(right: 4),
      child: CircleAvatar(
        radius: 14,
        backgroundImage:
            profilePicture != null ? NetworkImage(profilePicture) : null,
        child:
            profilePicture == null
                ? Text(
                  name.isNotEmpty ? name[0].toUpperCase() : '?',
                  style: const TextStyle(fontSize: 12),
                )
                : null,
      ),
    );
  }
}
