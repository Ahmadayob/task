import 'package:flutter/material.dart';
import 'package:frontend/core/models/user.dart';
import 'package:frontend/core/utils/image_utils.dart';

class UserAvatar extends StatelessWidget {
  final User user;
  final double size;
  final VoidCallback? onTap;

  const UserAvatar({Key? key, required this.user, this.size = 40, this.onTap})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ImageUtils.createUserAvatar(
        name: user.name,
        imageUrl: user.profilePicture,
        size: size,
      ),
    );
  }
}
