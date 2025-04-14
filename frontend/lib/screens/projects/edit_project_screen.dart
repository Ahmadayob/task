import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/models/user.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/project_service.dart';
import 'package:frontend/core/services/user_service.dart';
import 'package:intl/intl.dart';

class EditProjectScreen extends StatefulWidget {
  final Project project;

  const EditProjectScreen({Key? key, required this.project}) : super(key: key);

  @override
  State<EditProjectScreen> createState() => _EditProjectScreenState();
}

class _EditProjectScreenState extends State<EditProjectScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _descriptionController;
  late TextEditingController _searchController;
  late DateTime? _deadline;
  late User _selectedManager;
  List<User> _availableMembers = [];
  List<User> _selectedMembers = [];
  List<User> _searchResults = [];
  bool _isLoading = false;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.project.title);
    _descriptionController = TextEditingController(
      text: widget.project.description,
    );
    _searchController = TextEditingController();
    _deadline = widget.project.deadline ?? DateTime.now();
    _selectedManager = widget.project.manager;
    _selectedMembers = List.from(widget.project.members);
    _availableMembers = List.from(widget.project.members);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _searchUsers(String query) async {
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.token != null) {
        final userService = UserService();
        final users = await userService.getAllUsers(authProvider.token!);

        // Filter out current members and search by name
        final results =
            users
                .where(
                  (user) =>
                      !_selectedMembers.any((m) => m.id == user.id) &&
                      user.name.toLowerCase().contains(query.toLowerCase()),
                )
                .toList();

        setState(() {
          _searchResults = results;
          _isSearching = false;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error searching users: $e')));
      }
      setState(() {
        _isSearching = false;
      });
    }
  }

  Future<void> _saveProject() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.token != null) {
      try {
        final projectService = ProjectService();
        final projectData = {
          'title': _titleController.text,
          'description': _descriptionController.text,
          'deadline': _deadline?.toIso8601String(),
          'manager': _selectedManager.id,
          'members': _selectedMembers.map((m) => m.id).toList(),
          'status': widget.project.status,
        };

        await projectService.updateProject(
          authProvider.token!,
          widget.project.id,
          projectData,
        );

        if (mounted) {
          Navigator.of(context).pop(true);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('Error updating project: $e')));
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Project'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _isLoading ? null : _saveProject,
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextFormField(
                        controller: _titleController,
                        decoration: const InputDecoration(
                          labelText: 'Title',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter a title';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _descriptionController,
                        decoration: const InputDecoration(
                          labelText: 'Description',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 3,
                      ),
                      const SizedBox(height: 16),
                      ListTile(
                        title: const Text('Deadline'),
                        subtitle: Text(
                          _deadline != null
                              ? DateFormat('MMM dd, yyyy').format(_deadline!)
                              : 'No deadline set',
                        ),
                        trailing: const Icon(Icons.calendar_today),
                        onTap: () => _selectDate(context),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Project Manager',
                        style: TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _selectedManager.id,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                        ),
                        items:
                            _availableMembers.map((user) {
                              return DropdownMenuItem(
                                value: user.id,
                                child: Text(user.name),
                              );
                            }).toList(),
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _selectedManager = _availableMembers.firstWhere(
                                (u) => u.id == value,
                              );
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Project Members',
                        style: TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      // Current members list
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children:
                            _selectedMembers.map((member) {
                              return Chip(
                                label: Text(member.name),
                                deleteIcon: const Icon(
                                  Icons.remove_circle_outline,
                                ),
                                onDeleted: () {
                                  setState(() {
                                    _selectedMembers.remove(member);
                                    if (_selectedManager.id == member.id) {
                                      _selectedManager = _selectedMembers.first;
                                    }
                                  });
                                },
                              );
                            }).toList(),
                      ),
                      const SizedBox(height: 16),
                      // Search bar for new members
                      TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          labelText: 'Search users to add',
                          border: const OutlineInputBorder(),
                          suffixIcon:
                              _isSearching
                                  ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                  : IconButton(
                                    icon: const Icon(Icons.search),
                                    onPressed:
                                        () => _searchUsers(
                                          _searchController.text,
                                        ),
                                  ),
                        ),
                        onChanged: (value) {
                          if (value.isEmpty) {
                            setState(() {
                              _searchResults = [];
                            });
                          }
                        },
                        onSubmitted: _searchUsers,
                      ),
                      const SizedBox(height: 8),
                      // Search results
                      if (_searchResults.isNotEmpty)
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _searchResults.length,
                          itemBuilder: (context, index) {
                            final user = _searchResults[index];
                            return ListTile(
                              title: Text(user.name),
                              subtitle: Text(user.email),
                              trailing: IconButton(
                                icon: const Icon(Icons.add_circle_outline),
                                onPressed: () {
                                  setState(() {
                                    _selectedMembers.add(user);
                                    _searchResults.remove(user);
                                    _searchController.clear();
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
    );
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
}
