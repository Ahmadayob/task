import 'package:flutter/material.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/services/project_service.dart';
import 'package:frontend/core/services/task_service.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:frontend/screens/projects/create_project_screen.dart';
import 'package:frontend/screens/projects/project_detail_screen.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';
import 'package:frontend/widgets/recent_project_card.dart';
import 'package:frontend/widgets/task_item.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/screens/auth/login_screen.dart';
import 'package:frontend/screens/home/projects_screen.dart';
import 'package:frontend/screens/home/notifications_screen.dart';
import 'package:frontend/screens/profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeContent(),
    const ProjectsScreen(),
    const SizedBox(), // Placeholder for the create button
    const NotificationsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    // If auth is still initializing, show loading
    if (!authProvider.isInitialized) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    // If user is not authenticated, redirect to login
    if (!authProvider.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CreateProjectScreen()),
          );
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomAppBar(
        shape: const CircularNotchedRectangle(),
        notchMargin: 8.0,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_outlined, Icons.home, 'Home'),
              _buildNavItem(1, Icons.folder_outlined, Icons.folder, 'Project'),
              const SizedBox(width: 40), // Space for FAB
              _buildNavItem(
                3,
                Icons.chat_bubble_outline,
                Icons.chat_bubble,
                'Inbox',
              ),
              _buildNavItem(4, Icons.person_outline, Icons.person, 'Profile'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData icon,
    IconData activeIcon,
    String label,
  ) {
    final isSelected = _currentIndex == index;
    return InkWell(
      onTap: () {
        if (index == 1) {
          // Navigate to ProjectsScreen instead of switching tabs
          Navigator.of(
            context,
          ).push(MaterialPageRoute(builder: (_) => const ProjectsScreen()));
        } else {
          setState(() {
            _currentIndex = index;
          });
        }
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isSelected ? activeIcon : icon,
            color: isSelected ? AppColors.primary : Colors.grey,
            size: 24,
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isSelected ? AppColors.primary : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}

class HomeContent extends StatefulWidget {
  const HomeContent({Key? key}) : super(key: key);

  @override
  State<HomeContent> createState() => _HomeContentState();
}

class _HomeContentState extends State<HomeContent> {
  late Future<List<Project>> _projectsFuture;
  late Future<List<Task>> _tasksFuture;
  final ProjectService _projectService = ProjectService();
  final TaskService _taskService = TaskService();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.token != null) {
      _projectsFuture = _projectService.getAllProjects(authProvider.token);
      // For tasks, we'll need to implement a method to get today's tasks
      _tasksFuture = _getTodayTasks(authProvider.token!);
    }
  }

  Future<List<Task>> _getTodayTasks(String token) async {
    // This is a placeholder. You'll need to implement a method in your TaskService
    // to fetch tasks for today. For now, we'll just get all tasks and filter them.
    try {
      // Assuming you have a method to get all tasks for the user
      final allTasks = await _taskService.getAllTasks(token);

      // Filter tasks for today
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);

      return allTasks.where((task) {
        if (task.deadline == null) return false;
        final taskDate = DateTime(
          task.deadline!.year,
          task.deadline!.month,
          task.deadline!.day,
        );
        return taskDate.isAtSameMomentAs(today);
      }).toList();
    } catch (e) {
      // Return empty list on error
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Management'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () {
            // Open drawer or menu
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _loadData();
          });
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: Colors.grey),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search',
                          hintStyle: TextStyle(color: Colors.grey[400]),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.tune, color: Colors.blue),
                      onPressed: () {
                        // Show filter options
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Recent Projects
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Project',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const ProjectsScreen(),
                        ),
                      );
                    },
                    child: const Text(
                      'See All',
                      style: TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Recent Projects List
              SizedBox(
                height: 300, // Fixed height for the horizontal list
                child: FutureBuilder<List<Project>>(
                  future: _projectsFuture,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    } else if (snapshot.hasError) {
                      return ErrorState(
                        message: 'Failed to load projects',
                        onRetry: () {
                          setState(() {
                            _loadData();
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
                      // Sort projects by creation date (newest first)
                      projects.sort(
                        (a, b) => b.createdAt.compareTo(a.createdAt),
                      );
                      // Take only the 3 most recent projects
                      final recentProjects = projects.take(3).toList();

                      return ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: recentProjects.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 16),
                            child: SizedBox(
                              width:
                                  MediaQuery.of(context).size.width -
                                  64, // Full width minus padding
                              child: RecentProjectCard(
                                project: recentProjects[index],
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder:
                                          (_) => ProjectDetailScreen(
                                            project: recentProjects[index],
                                          ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          );
                        },
                      );
                    }
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Today's Tasks
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Today Task',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () {
                      // Navigate to all tasks
                    },
                    child: const Text(
                      'See All',
                      style: TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Task List
              FutureBuilder<List<Task>>(
                future: _tasksFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return ErrorState(
                      message: 'Failed to load tasks',
                      onRetry: () {
                        setState(() {
                          _loadData();
                        });
                      },
                    );
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const EmptyState(
                      icon: Icons.task_outlined,
                      title: 'No Tasks Today',
                      message: 'You have no tasks scheduled for today',
                    );
                  } else {
                    final tasks = snapshot.data!;
                    // Sort tasks by time
                    tasks.sort((a, b) {
                      if (a.deadline == null) return 1;
                      if (b.deadline == null) return -1;
                      return a.deadline!.compareTo(b.deadline!);
                    });

                    return ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: tasks.length,
                      separatorBuilder: (context, index) => const Divider(),
                      itemBuilder: (context, index) {
                        final task = tasks[index];
                        final timeString =
                            task.deadline != null
                                ? 'Today - ${task.deadline!.hour.toString().padLeft(2, '0')}:${task.deadline!.minute.toString().padLeft(2, '0')}'
                                : 'Today';

                        return TaskItem(
                          title: task.title,
                          time: timeString,
                          isCompleted: task.status == 'Done',
                          onTap: () {
                            // Navigate to task detail
                          },
                        );
                      },
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
