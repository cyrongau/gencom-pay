import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SystemProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  Map<String, dynamic> _branding = {
    'APP_NAME': 'Generex',
    'LOGO_LANDSCAPE': '',
    'LOGO_SQUARE': '',
    'LOGO_FULL': '',
    'PRIMARY_COLOR': '#16C66E',
  };

  Map<String, dynamic> get branding => _branding;

  Future<void> fetchBranding() async {
    try {
      final response = await _api.get('/public/branding');
      _branding = response.data;
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to fetch branding: $e');
    }
  }
}
