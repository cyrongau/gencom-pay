import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CardProvider with ChangeNotifier {
  final ApiService _api = ApiService();
  
  List<dynamic> _cards = [];
  List<dynamic> _transactions = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get cards => _cards;
  List<dynamic> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchCards() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _api.get('/cards');
      _cards = response.data;
      if (_cards.isNotEmpty) {
        await fetchTransactions(_cards[0]['id']);
      }
    } catch (e) {
      _error = 'Failed to fetch cards';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchTransactions(String cardId) async {
    try {
      final response = await _api.get('/cards/$cardId/transactions');
      _transactions = response.data;
      notifyListeners();
    } catch (e) {
      print('Failed to fetch card transactions: $e');
    }
  }

  Future<bool> issueCard(String cardHolderName) async {
    try {
      await _api.post('/cards', data: {'cardHolderName': cardHolderName});
      await fetchCards();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> toggleFreeze(String cardId) async {
    try {
      final response = await _api.put('/cards/$cardId/freeze');
      final updatedCard = response.data;
      final index = _cards.indexWhere((c) => c['id'] == cardId);
      if (index != -1) {
        _cards[index] = updatedCard;
        notifyListeners();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<Map<String, dynamic>?> revealDetails(String cardId) async {
    try {
      final response = await _api.get('/cards/$cardId/reveal');
      return response.data;
    } catch (e) {
      return null;
    }
  }

  Future<bool> regenerateCVV(String cardId) async {
    try {
      final response = await _api.put('/cards/$cardId/regenerate-cvv');
      final updatedCard = response.data;
      final index = _cards.indexWhere((c) => c['id'] == cardId);
      if (index != -1) {
        _cards[index] = updatedCard;
        notifyListeners();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateLimits(String cardId, String daily, String monthly) async {
    try {
      final response = await _api.put('/cards/$cardId/limits', data: {
        'daily': daily,
        'monthly': monthly,
      });
      final updatedCard = response.data;
      final index = _cards.indexWhere((c) => c['id'] == cardId);
      if (index != -1) {
        _cards[index] = updatedCard;
        notifyListeners();
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
