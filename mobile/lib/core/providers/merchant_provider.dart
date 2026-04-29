import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class MerchantProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  final _storage = const FlutterSecureStorage();
  
  List<dynamic> _myBusinesses = [];
  Map<String, dynamic>? _activeBusiness;
  bool _isLoading = false;

  List<dynamic> _merchantTransactions = [];
  
  List<dynamic> get myBusinesses => _myBusinesses;
  Map<String, dynamic>? get activeBusiness => _activeBusiness;
  List<dynamic> get merchantTransactions => _merchantTransactions;
  bool get isLoading => _isLoading;
  bool get hasBusiness => _myBusinesses.isNotEmpty;
  bool get isActiveVerified => _activeBusiness?['status'] == 'VERIFIED';

  Future<void> fetchMerchantTransactions() async {
    if (_activeBusiness == null) return;
    try {
      final response = await _api.get('/merchant/transactions');
      _merchantTransactions = response.data;
      notifyListeners();
    } catch (e) {
      debugPrint('Failed to fetch merchant transactions: $e');
    }
  }

  Future<void> fetchMyBusinesses() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _api.get('/merchant/my-businesses');
      _myBusinesses = response.data;
      
      final storedId = await _storage.read(key: 'activeMerchantId');
      if (storedId != null) {
        final active = _myBusinesses.firstWhere((m) => m['id'] == storedId, orElse: () => null);
        if (active != null) _activeBusiness = active;
      }
      
      if (_myBusinesses.isNotEmpty && _activeBusiness == null) {
        _activeBusiness = _myBusinesses[0];
        await _storage.write(key: 'activeMerchantId', value: _activeBusiness!['id']);
      }
    } catch (e) {
      _myBusinesses = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> setActiveBusiness(Map<String, dynamic> business) async {
    _activeBusiness = business;
    await _storage.write(key: 'activeMerchantId', value: business['id']);
    notifyListeners();
  }

  Future<void> clearActiveBusiness() async {
    _activeBusiness = null;
    await _storage.delete(key: 'activeMerchantId');
    notifyListeners();
  }

  Future<bool> submitKYC(Map<String, dynamic> data) async {
    try {
      await _api.post('/merchant/kyc', data: data);
      await fetchMyBusinesses();
      return true;
    } catch (e) {
      return false;
    }
  }
}
