import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/board.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/search_service.dart';
import 'package:frontend/screens/boards/board_detail_screen.dart';
import 'package:frontend/screens/projects/project_detail_screen.dart';
import 'package:frontend/screens/tasks/task_detail_screen.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';
import 'package:frontend/widgets/task_card.dart';
import 'package:frontend/widgets/board_card.dart';
import 'package:frontend/widgets/recent_project_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final SearchService _searchService = SearchService();
  bool _isSearching = false;
  Map<String, dynamic>? _searchResults;
  Timer? _debounce;

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _handleSearch(String query) async {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.isEmpty) {
        setState(() {
          _isSearching = false;
          _searchResults = null;
        });
        return;
      }

      setState(() {
        _isSearching = true;
      });

      try {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        if (authProvider.token == null) {
          throw Exception('Authentication token is missing');
        }

        final results = await _searchService.search(authProvider.token!, query);
        setState(() {
          _searchResults = results;
        });
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error searching: $e')));
      } finally {
        setState(() {
          _isSearching = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 16.0),
                    child: Icon(Icons.search, color: Colors.grey),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      decoration: const InputDecoration(
                        hintText: 'Search tasks, boards, and projects',
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16),
                      ),
                      onChanged: _handleSearch,
                      autofocus: true,
                    ),
                  ),
                  if (_isSearching)
                    const Padding(
                      padding: EdgeInsets.only(right: 16.0),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    ),
                ],
              ),
            ),
          ),
          // Search Results
          Expanded(
            child:
                _searchResults == null
                    ? const Center(child: Text('Start typing to search'))
                    : _buildSearchResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    final tasks = _searchResults!['tasks'] as List<Task>;
    final boards = _searchResults!['boards'] as List<Board>;
    final projects = _searchResults!['projects'] as List<Project>;

    if (tasks.isEmpty && boards.isEmpty && projects.isEmpty) {
      return const EmptyState(
        icon: Icons.search_off,
        title: 'No Results Found',
        message: 'Try a different search term',
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (tasks.isNotEmpty) ...[
            const Text(
              'Tasks',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...tasks.map(
              (task) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: TaskCard(
                  task: task,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => TaskDetailScreen(task: task),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
          if (boards.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Text(
              'Boards',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...boards.map(
              (board) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: BoardCard(
                  board: board,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => BoardDetailScreen(board: board),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
          if (projects.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Text(
              'Projects',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...projects.map(
              (project) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: RecentProjectCard(
                  project: project,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => ProjectDetailScreen(project: project),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
