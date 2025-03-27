class NotificationModel {
  final String id;
  final String? senderId;
  final String? senderName;
  final String? senderProfilePicture;
  final String message;
  final RelatedItem? relatedItem;
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    this.senderId,
    this.senderName,
    this.senderProfilePicture,
    required this.message,
    this.relatedItem,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'],
      senderId: json['sender']?['_id'],
      senderName: json['sender']?['name'],
      senderProfilePicture: json['sender']?['profilePicture'],
      message: json['message'],
      relatedItem:
          json['relatedItem'] != null
              ? RelatedItem.fromJson(json['relatedItem'])
              : null,
      isRead: json['isRead'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

class RelatedItem {
  final String itemId;
  final String itemType;

  RelatedItem({required this.itemId, required this.itemType});

  factory RelatedItem.fromJson(Map<String, dynamic> json) {
    return RelatedItem(itemId: json['itemId'], itemType: json['itemType']);
  }
}
