import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/models/notification.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/core/services/notification_service.dart';
import 'package:frontend/widgets/notification_item.dart';
import 'package:frontend/widgets/empty_state.dart';
import 'package:frontend/widgets/error_state.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<NotificationModel>> _notificationsFuture;
  final NotificationService _notificationService = NotificationService();

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _notificationsFuture = _notificationService.getUserNotifications(
      authProvider.token!,
    );
  }

  Future<void> _markAllAsRead() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await _notificationService.markAllNotificationsAsRead(
        authProvider.token!,
      );
      setState(() {
        _loadNotifications();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All notifications marked as read')),
      );
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: _markAllAsRead,
            tooltip: 'Mark all as read',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _loadNotifications();
          });
        },
        child: FutureBuilder<List<NotificationModel>>(
          future: _notificationsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return ErrorState(
                message: 'Failed to load notifications',
                onRetry: () {
                  setState(() {
                    _loadNotifications();
                  });
                },
              );
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const EmptyState(
                icon: Icons.notifications_off_outlined,
                title: 'No Notifications',
                message: 'You don\'t have any notifications yet',
              );
            } else {
              final notifications = snapshot.data!;
              return ListView.builder(
                padding: const EdgeInsets.all(8),
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final notification = notifications[index];
                  return NotificationItem(
                    notification: notification,
                    onTap: () async {
                      if (!notification.isRead) {
                        try {
                          final authProvider = Provider.of<AuthProvider>(
                            context,
                            listen: false,
                          );
                          await _notificationService.markNotificationAsRead(
                            authProvider.token!,
                            notification.id,
                          );
                          setState(() {
                            _loadNotifications();
                          });
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Error: ${e.toString()}')),
                          );
                        }
                      }
                      // Navigate to related item based on notification type
                      // This will be implemented later
                    },
                    onDismiss: () async {
                      try {
                        final authProvider = Provider.of<AuthProvider>(
                          context,
                          listen: false,
                        );
                        await _notificationService.deleteNotification(
                          authProvider.token!,
                          notification.id,
                        );
                        setState(() {
                          _loadNotifications();
                        });
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Notification deleted')),
                        );
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Error: ${e.toString()}')),
                        );
                      }
                    },
                  );
                },
              );
            }
          },
        ),
      ),
    );
  }
}
