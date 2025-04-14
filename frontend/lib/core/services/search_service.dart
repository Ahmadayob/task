import 'dart:convert';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/models/board.dart';
import 'package:http/http.dart' as http;

class SearchService {
  final String baseUrl = 'http://10.0.2.2:3001/api';

  Future<Map<String, dynamic>> search(String token, String query) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/search?query=$query'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Ensure we have valid data before processing
        if (data == null) {
          return {
            'tasks': <Task>[],
            'boards': <Board>[],
            'projects': <Project>[],
          };
        }

        // Helper function to safely parse items
        List<T> parseItems<T>(
          List<dynamic>? items,
          T Function(Map<String, dynamic>) fromJson,
        ) {
          if (items == null) return <T>[];
          return items
              .map((item) {
                try {
                  if (item is String) {
                    // If item is a string, try to parse it as JSON
                    final Map<String, dynamic> jsonMap = json.decode(item);
                    return fromJson(jsonMap);
                  } else if (item is Map<String, dynamic>) {
                    return fromJson(item);
                  }
                  return fromJson(json.decode(item.toString()));
                } catch (e) {
                  print('Error parsing item: $e');
                  return null;
                }
              })
              .whereType<T>()
              .toList();
        }

        return {
          'tasks': parseItems<Task>(data['tasks'], Task.fromJson),
          'boards': parseItems<Board>(data['boards'], Board.fromJson),
          'projects': parseItems<Project>(data['projects'], Project.fromJson),
        };
      } else {
        throw Exception('Failed to search: ${response.body}');
      }
    } catch (e) {
      print('Search error: $e');
      throw Exception('Error searching: $e');
    }
  }
}
