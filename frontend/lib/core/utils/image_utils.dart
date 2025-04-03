import 'package:flutter/material.dart';

class ImageUtils {
  /// Returns a valid network image if the URL is valid, otherwise returns null
  static ImageProvider? getProfileImageProvider(String? url) {
    if (url == null ||
        url.isEmpty ||
        url == 'file:///' ||
        !url.startsWith('http')) {
      return null;
    }

    try {
      return NetworkImage(url);
    } catch (e) {
      print('Error loading image from URL: $url - $e');
      return null;
    }
  }

  /// Creates a fallback avatar with the first letter of the name
  static Widget createUserAvatar({
    required String name,
    String? imageUrl,
    double size = 40,
    Color? backgroundColor,
  }) {
    final hasValidImage =
        imageUrl != null &&
        imageUrl.isNotEmpty &&
        imageUrl != 'file:///' &&
        imageUrl.startsWith('http');

    return CircleAvatar(
      radius: size / 2,
      backgroundColor: backgroundColor ?? Colors.grey[300],
      backgroundImage: hasValidImage ? NetworkImage(imageUrl!) : null,
      child:
          !hasValidImage
              ? Text(
                name.isNotEmpty ? name[0].toUpperCase() : '?',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: size / 2.5,
                  color: Colors.black54,
                ),
              )
              : null,
    );
  }
}
