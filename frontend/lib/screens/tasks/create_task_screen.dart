import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:frontend/core/models/user.dart';
import 'package:frontend/widgets/custom_button.dart';
import 'package:frontend/widgets/custom_text_field.dart';
import 'package:frontend/widgets/member_selection.dart';
import 'package:frontend/core/models/attachment.dart';

class CreateTaskScreen extends StatefulWidget {
  final String boardId;
  final String projectId;
  final VoidCallback? onTaskCreated;

  const CreateTaskScreen({
    super.key,
    required this.boardId,
    required this.projectId,
    this.onTaskCreated,
  });

  @override
  State<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends State<CreateTaskScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  DateTime? _deadline;
  String _status = 'To Do';
  String _priority = 'Medium';
  List<User> _selectedMembers = [];
  List<Attachment> _attachments = [];

  bool _isLoading = false;
  String? _error;

  final TaskService _taskService = TaskService();

  final List<String> _statuses = ['To Do', 'In Progress', 'In Review', 'Done'];
  final List<String> _priorities = ['Low', 'Medium', 'High', 'Urgent'];

  @override
  void initState() {
    super.initState();
    // Add current user as a member by default
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.user != null) {
      _selectedMembers = [authProvider.user!];
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _addAttachment() {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Add Attachment'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Name',
                    hintText: 'Enter attachment name',
                  ),
                  onSubmitted: (value) {
                    if (value.trim().isNotEmpty) {
                      setState(() {
                        _attachments.add(
                          Attachment(
                            name: value.trim(),
                            type: 'file', // Default type
                            url: '', // URL will be set after file upload
                            uploadedAt: DateTime.now(),
                          ),
                        );
                      });
                      Navigator.of(context).pop();
                    }
                  },
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Cancel'),
              ),
            ],
          ),
    );
  }

  Future<void> _createTask() async {
    if (_formKey.currentState!.validate()) {
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
          'board': widget.boardId,
          'deadline': _deadline?.toIso8601String(),
          'status': _status,
          'priority': _priority,
          'assignees': _selectedMembers.map((member) => member.id).toList(),
          'attachments':
              _attachments.map((attachment) => attachment.toJson()).toList(),
        };

        await _taskService.createTask(token, taskData);

        if (mounted) {
          Navigator.of(context).pop(true);
        }
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
      appBar: AppBar(title: const Text('Create Task')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CustomTextField(
                controller: _titleController,
                labelText: 'Task Title',
                hintText: 'Enter task title',
                prefixIcon: Icons.title,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a title';
                  }
                  if (value.length < 3) {
                    return 'Title must be at least 3 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _descriptionController,
                labelText: 'Description',
                hintText: 'Enter task description (optional)',
                prefixIcon: Icons.description,
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Deadline',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              _deadline == null
                                  ? 'No deadline set'
                                  : 'Deadline: ${_deadline!.toLocal().toString().split(' ')[0]}',
                            ),
                          ),
                          TextButton.icon(
                            onPressed: () => _selectDate(context),
                            icon: const Icon(Icons.calendar_today),
                            label: Text(
                              _deadline == null ? 'Set Deadline' : 'Change',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Status',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _status,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                        ),
                        items:
                            _statuses.map((status) {
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
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Priority',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _priority,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                        ),
                        items:
                            _priorities.map((priority) {
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
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: MemberSelection(
                    selectedMembers: _selectedMembers,
                    onMembersChanged: (members) {
                      setState(() {
                        _selectedMembers = members;
                      });
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Attachments',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          TextButton.icon(
                            onPressed: _addAttachment,
                            icon: const Icon(Icons.add),
                            label: const Text('Add Attachment'),
                          ),
                        ],
                      ),
                      if (_attachments.isNotEmpty)
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _attachments.length,
                          itemBuilder: (context, index) {
                            return ListTile(
                              leading: const Icon(Icons.attach_file),
                              title: Text(_attachments[index].name),
                              subtitle: Text(_attachments[index].type),
                              trailing: IconButton(
                                icon: const Icon(Icons.delete),
                                onPressed: () {
                                  setState(() {
                                    _attachments.removeAt(index);
                                  });
                                },
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              CustomButton(
                text: 'Create Task',
                isLoading: _isLoading,
                onPressed: _createTask,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
