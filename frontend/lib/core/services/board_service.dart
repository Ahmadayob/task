import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:frontend/core/constants/api_constants.dart';
import 'package:frontend/core/models/board.dart';
import 'package:frontend/core/utils/api_exception.dart';

class BoardService {
  Future<List<Board>> getBoardsByProject(String token, String projectId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/boards/project/$projectId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      // Debug print
      debugPrint('getBoardsByProject response status: ${response.statusCode}');

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final boardsData = responseData['data']['boards'] as List<dynamic>;

        // Parse each board individually to catch and handle errors
        List<Board> boards = [];
        for (var boardJson in boardsData) {
          try {
            boards.add(Board.fromJson(boardJson));
          } catch (e) {
            debugPrint('Error parsing individual board: $e');
            // Continue with next board instead of failing the whole list
          }
        }

        return boards;
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load boards',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      debugPrint('Error in getBoardsByProject: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<Board> getBoardById(String token, String boardId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/boards/$boardId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Board.fromJson(responseData['data']['board']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load board',
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

  Future<Board> createBoard(
    String token,
    Map<String, dynamic> boardData,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/api/boards'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(boardData),
      );

      // Debug print
      debugPrint('createBoard response status: ${response.statusCode}');

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        return Board.fromJson(responseData['data']['board']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to create board',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      debugPrint('Error in createBoard: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<Board> updateBoard(
    String token,
    String boardId,
    Map<String, dynamic> boardData,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}/api/boards/$boardId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(boardData),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return Board.fromJson(responseData['data']['board']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to update board',
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

  Future<bool> deleteBoard(String token, String boardId) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/api/boards/$boardId'),
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
          message: responseData['message'] ?? 'Failed to delete board',
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

  Future<bool> reorderBoards(
    String token,
    String projectId,
    List<Map<String, dynamic>> boardOrders,
  ) async {
    try {
      final response = await http.patch(
        Uri.parse(
          '${ApiConstants.baseUrl}/api/boards/project/$projectId/reorder',
        ),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'boards': boardOrders}),
      );

      // Debug print
      debugPrint('reorderBoards response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        return true;
      } else {
        final responseData = jsonDecode(response.body);
        throw ApiException(
          message: responseData['message'] ?? 'Failed to reorder boards',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      debugPrint('Error in reorderBoards: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }
}
