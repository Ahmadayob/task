import 'package:flutter/material.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/project_service.dart';
import 'package:frontend/screens/auth/login_screen.dart';
import 'package:frontend/screens/projects/create_project_screen.dart';
import 'package:frontend/screens/projects/project_detail_screen.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';
import 'package:frontend/widgets/project_card.dart';
import 'package:provider/provider.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({Key? key}) : super(key: key);

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  Future<List<Project>>? _projectsFuture;
  final ProjectService _projectService = ProjectService();

  @override
  void initState() {
    super.initState();
    _checkAuthAndLoadProjects();
  }

  void _checkAuthAndLoadProjects() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Only load projects if the user is authenticated
    if (authProvider.isAuthenticated) {
      _loadProjects();
    } else if (authProvider.isInitialized) {
      // If auth is initialized but user is not authenticated, redirect to login
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      });
    }
    // If auth is not initialized yet, we'll wait for it to complete
  }

  void _loadProjects() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.token != null) {
      _projectsFuture = _projectService.getAllProjects(authProvider.token);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    // If auth is still initializing, show loading
    if (!authProvider.isInitialized) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // If user is not authenticated, show login screen
    if (!authProvider.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Projects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              final result = await Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CreateProjectScreen()),
              );
              if (result == true) {
                setState(() {
                  _loadProjects();
                });
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _loadProjects();
          });
        },
        child:
            _projectsFuture == null
                ? const Center(child: CircularProgressIndicator())
                : FutureBuilder<List<Project>>(
                  future: _projectsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    } else if (snapshot.hasError) {
                      return ErrorState(
                        message: 'Failed to load projects: ${snapshot.error}',
                        onRetry: () {
                          setState(() {
                            _loadProjects();
                          });
                        },
                      );
                    } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                      return const EmptyState(
                        icon: Icons.folder_outlined,
                        title: 'No Projects Yet',
                        message: 'Create your first project to get started',
                      );
                    } else {
                      final projects = snapshot.data!;
                      return ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: projects.length,
                        itemBuilder: (context, index) {
                          final project = projects[index];
                          return ProjectCard(
                            project: project,
                            onTap: () async {
                              final result = await Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder:
                                      (_) =>
                                          ProjectDetailScreen(project: project),
                                ),
                              );
                              if (result == true) {
                                setState(() {
                                  _loadProjects();
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
