import 'package:flutter/material.dart';
import '../services/api_service.dart';

class BillProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<dynamic> _history = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get history => _history;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get('/bills/history');
      _history = response.data;
    } catch (e) {
      _error = 'Failed to fetch bill history';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> payBill({
    required String provider,
    required String billType,
    required String merchantId,
    String? accountNumber,
    required String amount,
    required String currency,
    required String walletId,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (provider == 'GENCOM') {
        await _api.post('/merchant/pay-by-id', data: {
          'merchantId': merchantId,
          'amount': amount,
          'currency': currency,
        });
      } else {
        await _api.post('/bills/pay', data: {
          'provider': provider,
          'billType': billType,
          'merchantId': merchantId,
          'accountNumber': accountNumber,
          'amount': amount,
          'currency': currency,
          'walletId': walletId,
        });
      }
      await fetchHistory();
      return true;
    } catch (e) {
      _error = 'Payment failed. Please check your balance.';
      return false;
    } finally {
      notifyListeners();
    }
  }

  Future<List<dynamic>> searchMerchants(String query) async {
    try {
      final response = await _api.get('/merchant/search', queryParameters: {'q': query});
      return response.data;
    } catch (e) {
      return [];
    }
  }
}
