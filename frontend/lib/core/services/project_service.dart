import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frontend/core/constants/api_constants.dart';
import 'package:frontend/core/models/project.dart';
import 'package:frontend/core/utils/api_exception.dart';

class ProjectService {
  Future<List<Project>> getAllProjects(String? token) async {
    if (token == null) {
      throw ApiException(message: 'Authentication token is missing');
    }

    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/projects'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      // Debug print
      print('getAllProjects response status: ${response.statusCode}');
      print('getAllProjects response body: ${response.body}');

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        try {
          final projectsData =
              responseData['data']['projects'] as List<dynamic>;

          // Process each project individually to catch parsing errors
          List<Project> projects = [];
          for (var projectJson in projectsData) {
            try {
              projects.add(Project.fromJson(projectJson));
            } catch (e) {
              print('Error parsing individual project: $e');
              print('Project JSON: $projectJson');
              // Continue with next project instead of failing the whole list
            }
          }

          return projects;
        } catch (e) {
          print('Error parsing projects list: $e');
          print('Response data: $responseData');
          throw ApiException(message: 'Failed to parse projects data: $e');
        }
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load projects',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      print('Error in getAllProjects: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<Project> getProjectById(String token, String projectId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/projects/$projectId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Project.fromJson(responseData['data']['project']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load project',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<Project> createProject(
    String token,
    Map<String, dynamic> projectData,
  ) async {
    try {
      // Debug print
      print('createProject data: $projectData');

      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/api/projects'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(projectData),
      );

      // Debug print
      print('createProject response status: ${response.statusCode}');
      print('createProject response body: ${response.body}');

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        try {
          return Project.fromJson(responseData['data']['project']);
        } catch (e) {
          print('Error parsing project: $e');
          throw ApiException(message: 'Failed to parse project data: $e');
        }
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to create project',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      print('Error in createProject: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<Project> updateProject(
    String token,
    String projectId,
    Map<String, dynamic> projectData,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}/api/projects/$projectId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(projectData),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Project.fromJson(responseData['data']['project']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to update project',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<bool> deleteProject(String token, String projectId) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/api/projects/$projectId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        final responseData = jsonDecode(response.body);
        throw ApiException(
          message: responseData['message'] ?? 'Failed to delete project',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }
}
