import 'package:flutter/material.dart';

class SocialIcon extends StatelessWidget {
  final String provider;

  const SocialIcon({super.key, required this.provider});

  @override
  Widget build(BuildContext context) {
    switch (provider.toLowerCase()) {
      case 'facebook':
        return Icon(Icons.facebook, color: Colors.blue[700], size: 24);
      case 'google':
        return Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(shape: BoxShape.circle),
          child: Center(
            child: Text(
              'G',
              style: TextStyle(
                color: Colors.red[700],
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        );
      case 'apple':
        return const Icon(Icons.apple, color: Colors.black, size: 24);
      default:
        return const SizedBox(width: 24, height: 24);
    }
  }
}
