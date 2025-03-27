import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:frontend/core/constants/api_constants.dart';
import 'package:frontend/core/models/notification.dart';
import 'package:frontend/core/utils/api_exception.dart';

class NotificationService {
  Future<List<NotificationModel>> getUserNotifications(String token) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/api/notifications'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final notificationsData =
            responseData['data']['notifications'] as List<dynamic>;
        return notificationsData
            .map((json) => NotificationModel.fromJson(json))
            .toList();
      } else {
        throw ApiException(
          message: responseData['message'] ?? 'Failed to load notifications',
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

  Future<bool> markNotificationAsRead(
    String token,
    String notificationId,
  ) async {
    try {
      final response = await http.patch(
        Uri.parse(
          '${ApiConstants.baseUrl}/api/notifications/$notificationId/read',
        ),
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
          message:
              responseData['message'] ?? 'Failed to mark notification as read',
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

  Future<bool> markAllNotificationsAsRead(String token) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConstants.baseUrl}/api/notifications/read-all'),
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
          message:
              responseData['message'] ??
              'Failed to mark all notifications as read',
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

  Future<bool> deleteNotification(String token, String notificationId) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/api/notifications/$notificationId'),
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
          message: responseData['message'] ?? 'Failed to delete notification',
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

  Future<bool> deleteAllNotifications(String token) async {
    try {
      final response = await http.delete(
        Uri.parse('${ApiConstants.baseUrl}/api/notifications'),
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
          message:
              responseData['message'] ?? 'Failed to delete all notifications',
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
