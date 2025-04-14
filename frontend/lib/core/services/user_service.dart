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

  Future<User> getUserProfile(String? token) async {
    if (token == null) {
      throw ApiException(message: 'Authentication token is missing');
    }

    try {
      // Changed from /api/users/profile to /api/users/me to match backend route
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/users/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      // Debug print
      print('getUserProfile response status: ${response.statusCode}');
      print('getUserProfile response body: ${response.body}');

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return User.fromJson(responseData['data']['user']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load user profile',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      print('Error in getUserProfile: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<User> updateUserProfile(
    String token,
    Map<String, dynamic> userData,
  ) async {
    try {
      // Validate profile picture URL before sending to server
      if (userData['profilePicture'] != null) {
        String profilePicture = userData['profilePicture'];
        if (profilePicture.isEmpty ||
            profilePicture == 'file:///' ||
            (!profilePicture.startsWith('http') &&
                !profilePicture.startsWith('https'))) {
          // Set to null or empty string based on your backend requirements
          userData['profilePicture'] = null;
        }
      }

      // Changed from /api/users/profile to /api/users/me to match backend route
      final response = await http.put(
        Uri.parse('${ApiConstants.baseUrl}/api/users/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(userData),
      );

      // Debug print
      print('updateUserProfile response status: ${response.statusCode}');
      print('updateUserProfile response body: ${response.body}');

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return User.fromJson(responseData['data']['user']);
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to update user profile',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      print('Error in updateUserProfile: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  // Add this new method to search users by email
  Future<List<User>> searchUsersByEmail(String token, String email) async {
    try {
      if (email.isEmpty) {
        return [];
      }

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/users/search?email=$email'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final usersData = responseData['data']['users'] as List<dynamic>;
        return usersData.map((json) => User.fromJson(json)).toList();
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to search users',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      print('Error in searchUsersByEmail: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }

  Future<List<User>> getAllUsers(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/users'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final usersData = responseData['data']['users'] as List<dynamic>;
        return usersData.map((json) => User.fromJson(json)).toList();
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to get users',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      print('Error in getAllUsers: $e');
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(message: e.toString());
    }
  }
}
