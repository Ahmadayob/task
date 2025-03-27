import 'package:flutter/material.dart';
import 'package:frontend/core/theme/app_colors.dart';
import 'package:provider/provider.dart';
import 'package:frontend/core/providers/auth_provider.dart';
import 'package:frontend/screens/auth/login_screen.dart';
import 'package:frontend/screens/home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Add a delay to show the splash screen
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Wait for auth to initialize if it hasn't already
    if (!authProvider.isInitialized) {
      // Set up a listener to wait for initialization
      authProvider.addListener(_onAuthInitialized);
    } else {
      _navigateBasedOnAuth();
    }
  }

  void _onAuthInitialized() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.isInitialized) {
      // Remove the listener once initialized
      authProvider.removeListener(_onAuthInitialized);
      _navigateBasedOnAuth();
    }
  }

  void _navigateBasedOnAuth() {
    if (!mounted) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (authProvider.isAuthenticated) {
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
    } else {
      Navigator.of(
        context,
      ).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.task_alt, size: 60, color: AppColors.primary),
            ),
            const SizedBox(height: 24),
            Text(
              'Task Management',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
