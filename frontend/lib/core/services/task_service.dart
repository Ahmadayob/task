import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frontend/core/constants/api_constants.dart';
import 'package:frontend/core/models/task.dart';
import 'package:frontend/core/utils/api_exception.dart';

class TaskService {
  Future<List<Task>> getTasksByBoard(String token, String boardId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks/board/$boardId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final tasksData = responseData['data']['tasks'] as List<dynamic>;
        return tasksData.map((json) => Task.fromJson(json)).toList();
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load tasks',
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

  Future<Task> getTaskById(String token, String taskId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks/$taskId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Task.fromJson(responseData['data']['task']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load task',
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

  Future<Task> createTask(String token, Map<String, dynamic> taskData) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(taskData),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return Task.fromJson(responseData['data']['task']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to create task',
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

  Future<Task> updateTask(
    String token,
    String taskId,
    Map<String, dynamic> taskData,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks/$taskId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(taskData),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Task.fromJson(responseData['data']['task']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to update task',
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

  Future<bool> deleteTask(String token, String taskId) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks/$taskId'),
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
          message: responseData['message'] ?? 'Failed to delete task',
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

  Future<Task> moveTask(
    String token,
    String taskId,
    String targetBoardId,
  ) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks/$taskId/move'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'targetBoard': targetBoardId}),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Task.fromJson(responseData['data']['task']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to move task',
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

  Future<bool> reorderTasks(
    String token,
    String boardId,
    List<Map<String, dynamic>> taskOrders,
  ) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConstants.baseUrl}/api/tasks/board/$boardId/reorder'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'tasks': taskOrders}),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        final responseData = jsonDecode(response.body);
        throw ApiException(
          message: responseData['message'] ?? 'Failed to reorder tasks',
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
