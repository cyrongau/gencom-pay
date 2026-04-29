import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CryptoProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<dynamic> _addresses = [];
  bool _isLoading = false;
  bool _isGenerating = false;

  List<dynamic> get addresses => _addresses;
  bool get isLoading => _isLoading;
  bool get isGenerating => _isGenerating;

  Future<void> fetchAddresses() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _api.get('/crypto/addresses');
      _addresses = response.data;
    } catch (e) {
      _addresses = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> generateAddress(String currency, String network) async {
    _isGenerating = true;
    notifyListeners();
    try {
      await _api.post('/crypto/addresses', data: {
        'currency': currency,
        'network': network,
      });
      await fetchAddresses();
      return true;
    } catch (e) {
      return false;
    } finally {
      _isGenerating = false;
      notifyListeners();
    }
  }

  Future<bool> simulateDeposit(String currency, String amount) async {
    try {
      await _api.post('/crypto/deposit/mock', data: {
        'currency': currency,
        'amount': amount,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>?> withdraw({
    required String currency,
    required String network,
    required String amount,
    required String toAddress,
  }) async {
    try {
      final response = await _api.post('/crypto/withdraw', data: {
        'currency': currency,
        'amount': amount,
        'toAddress': toAddress,
        'network': network,
      });
      return response.data;
    } catch (e) {
      return null;
    }
  }
}
