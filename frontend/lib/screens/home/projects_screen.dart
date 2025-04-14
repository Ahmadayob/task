import 'package:flutter/material.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/project_service.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/screens/auth/login_screen.dart';
import 'package:frontend/screens/projects/create_project_screen.dart';
import 'package:frontend/screens/projects/project_detail_screen.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';
import 'package:frontend/widgets/project_card.dart';
import 'package:frontend/widgets/project_grid_card.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  Future<List<Project>>? _projectsFuture;
  final ProjectService _projectService = ProjectService();
  bool _isGridView = false; // Default to list view

  @override
  void initState() {
    super.initState();
    _loadViewPreference();
    _checkAuthAndLoadProjects();
  }

  Future<void> _loadViewPreference() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _isGridView = prefs.getBool('projectsGridView') ?? false;
    });
  }

  Future<void> _saveViewPreference(bool isGrid) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('projectsGridView', isGrid);
  }

  void _toggleView(bool isGrid) {
    setState(() {
      _isGridView = isGrid;
    });
    _saveViewPreference(isGrid);
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
      body: Column(
        children: [
          // View toggle buttons
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _toggleView(false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color:
                              !_isGridView
                                  ? AppColors.primary
                                  : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.view_list,
                              color:
                                  !_isGridView
                                      ? Colors.white
                                      : Colors.grey.shade700,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'List',
                              style: TextStyle(
                                color:
                                    !_isGridView
                                        ? Colors.white
                                        : Colors.grey.shade700,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => _toggleView(true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color:
                              _isGridView
                                  ? AppColors.primary
                                  : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.grid_view,
                              color:
                                  _isGridView
                                      ? Colors.white
                                      : Colors.grey.shade700,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Grid',
                              style: TextStyle(
                                color:
                                    _isGridView
                                        ? Colors.white
                                        : Colors.grey.shade700,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Projects list/grid
          Expanded(
            child: RefreshIndicator(
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
                          if (snapshot.connectionState ==
                              ConnectionState.waiting) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
                          } else if (snapshot.hasError) {
                            return ErrorState(
                              message:
                                  'Failed to load projects: ${snapshot.error}',
                              onRetry: () {
                                setState(() {
                                  _loadProjects();
                                });
                              },
                            );
                          } else if (!snapshot.hasData ||
                              snapshot.data!.isEmpty) {
                            return const EmptyState(
                              icon: Icons.folder_outlined,
                              title: 'No Projects Yet',
                              message:
                                  'Create your first project to get started',
                            );
                          } else {
                            final projects = snapshot.data!;

                            // Return either list view or grid view based on selection
                            return _isGridView
                                ? _buildGridView(projects)
                                : _buildListView(projects);
                          }
                        },
                      ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListView(List<Project> projects) {
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
                builder: (_) => ProjectDetailScreen(project: project),
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

  Widget _buildGridView(List<Project> projects) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 1,
        childAspectRatio: 1.3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: projects.length,
      itemBuilder: (context, index) {
        final project = projects[index];
        return RecentProjectCard(
          project: project,
          onTap: () async {
            final result = await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ProjectDetailScreen(project: project),
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
}
