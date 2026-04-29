import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TransactionProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<dynamic> _recentTransactions = [];
  List<dynamic> _frequentRecipients = [];
  bool _isLoading = false;
  bool _isMoreLoading = false;
  int _currentPage = 1;
  bool _hasMore = true;

  List<dynamic> get recentTransactions => _recentTransactions;
  List<dynamic> get frequentRecipients => _frequentRecipients;
  bool get isLoading => _isLoading;
  bool get isMoreLoading => _isMoreLoading;
  bool get hasMore => _hasMore;

  Future<void> fetchRecentTransactions({bool refresh = true}) async {
    if (refresh) {
      _isLoading = true;
      _currentPage = 1;
      _hasMore = true;
      _recentTransactions = [];
    } else {
      if (!_hasMore || _isMoreLoading) return;
      _isMoreLoading = true;
    }
    
    notifyListeners();

    try {
      final response = await _api.get('/ledger/my-entries', queryParameters: {
        'page': _currentPage,
        'limit': 20,
      });
      
      final List<dynamic> newEntries = response.data;
      
      if (newEntries.length < 20) {
        _hasMore = false;
      }
      
      if (refresh) {
        _recentTransactions = newEntries;
      } else {
        _recentTransactions.addAll(newEntries);
        _currentPage++;
      }
    } catch (e) {
      if (refresh) _recentTransactions = [];
    } finally {
      _isLoading = false;
      _isMoreLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchFrequentRecipients() async {
    try {
      final response = await _api.get('/transactions/frequent-recipients');
      _frequentRecipients = response.data;
      notifyListeners();
    } catch (e) {
      _frequentRecipients = [];
    }
  }
  Future<bool> simulateDeposit({
    required String amount,
    required String method,
    required String provider,
    required String phone,
    String? currency,
  }) async {
    try {
      await _api.post('/transactions/deposit/simulate', data: {
        'amount': amount,
        'method': method,
        'provider': provider,
        'accountInfo': phone,
        'currency': currency ?? 'USD',
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
