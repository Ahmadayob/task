import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:frontend/core/models/user.dart';
import 'package:frontend/core/services/auth_services.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;
  bool get isInitialized => _isInitialized;

  final AuthService _authService = AuthService();

  // This future will complete when initialization is done
  Future<void>? _initFuture;

  AuthProvider() {
    // Store the future so we can await it elsewhere
    _initFuture = _loadUserData();
  }

  // Public method to await initialization
  Future<void> ensureInitialized() async {
    if (_initFuture != null) {
      await _initFuture;
    }
  }

  Future<void> _loadUserData() async {
    _setLoading(true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token != null && token.isNotEmpty) {
        _token = token;
        try {
          await _fetchUserProfile();
          // If we get here, the token is valid and we have a user
          print('User loaded successfully from stored token');
        } catch (e) {
          // If fetching the user profile fails, the token is likely invalid
          print('Failed to load user profile: $e');
          _token = null;
          await prefs.remove('token');
        }
      } else {
        print('No token found in storage');
      }
    } catch (e) {
      _setError(e.toString());
      print('Error loading user data: $e');
    } finally {
      _setLoading(false);
      _isInitialized = true;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    try {
      final response = await _authService.login(email, password);
      _token = response['token'];
      _user = User.fromJson(response['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _setLoading(true);
    _clearError();
    try {
      final response = await _authService.register(name, email, password);
      _token = response['token'];
      _user = User.fromJson(response['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    try {
      if (_token != null) {
        await _authService.logout(_token!);
      }
      _user = null;
      _token = null;

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');

      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _fetchUserProfile() async {
    if (_token == null) return;

    final userData = await _authService.getCurrentUser(_token!);
    _user = User.fromJson(userData);
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}
