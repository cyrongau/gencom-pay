import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';
import '../services/biometric_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  final BiometricService _biometric = BiometricService();
  final storage = const FlutterSecureStorage();
  
  Map<String, dynamic>? _user;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final token = response.data['access_token'];
      await storage.write(key: 'token', value: token);
      
      return await fetchProfile();
    } catch (e) {
      if (e is DioException) {
        _error = e.response?.data['message'] ?? 'Network Error: ${e.type}';
      } else {
        _error = 'Login failed. Please check your credentials.';
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> enableBiometrics() async {
    if (_user != null) {
      await _biometric.enableBiometrics('MOCK_SECURE_TOKEN_FROM_BACKEND');
    }
  }

  Future<bool> register(String fullName, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _api.post('/auth/register', data: {
        'full_name': fullName,
        'email': email,
        'password': password,
      });
      return await login(email, password);
    } catch (e) {
      _error = 'Registration failed.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> fetchProfile() async {
    try {
      final response = await _api.get('/user/profile');
      _user = response.data;
      notifyListeners();
      return true;
    } catch (e) {
      _user = null;
      return false;
    }
  }

  Future<void> logout() async {
    await storage.delete(key: 'token');
    _user = null;
    notifyListeners();
  }
}
