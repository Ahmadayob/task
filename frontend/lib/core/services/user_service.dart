import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frontend/core/constants/api_constants.dart';
import 'package:frontend/core/models/user.dart';
import 'package:frontend/core/utils/api_exception.dart';

class UserService {
  Future<User> getUserById(String token, String userId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return User.fromJson(responseData['data']['user']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to get user',
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

  Future<User> updateUser(
    String token,
    String userId,
    Map<String, dynamic> userData,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}/api/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(userData),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return User.fromJson(responseData['data']['user']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to update user',
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

  Future<bool> changeUserRole(String token, String userId, String role) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConstants.baseUrl}/api/users/$userId/role'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'role': role}),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        final responseData = jsonDecode(response.body);
        throw ApiException(
          message: responseData['message'] ?? 'Failed to change user role',
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
