import 'package:flutter/material.dart';
import '../services/api_service.dart';

class WalletProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<dynamic> _wallets = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get wallets => _wallets;
  bool get isLoading => _isLoading;
  String? get error => _error;

  double get consolidatedBalance {
    const rates = {
      'USD': 1.0,
      'KSH': 0.00745,
      'SLS': 0.0000833,
      'BTC': 64231.0,
      'ETH': 2450.12,
      'EUR': 1.08,
      'GBP': 1.25,
    };
    
    return _wallets.fold(0.0, (sum, w) {
      final balanceStr = w['balance']?.toString() ?? '0';
      final balance = double.tryParse(balanceStr) ?? 0.0;
      final rate = rates[w['currency']] ?? 1.0;
      return sum + (balance * rate);
    });
  }

  Future<void> fetchWallets() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get('/wallets');
      _wallets = response.data;
    } catch (e) {
      _error = 'Failed to fetch wallets';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createWallet(String currency) async {
    try {
      await _api.post('/wallets', data: {'currency': currency});
      await fetchWallets();
      return true;
    } catch (e) {
      return false;
    }
  }
}
