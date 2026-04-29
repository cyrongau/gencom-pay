import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';
import '../providers/wallet_provider.dart';
import '../providers/merchant_provider.dart';
import '../providers/transaction_provider.dart';
import '../config/app_config.dart';

class SocketService {
  IO.Socket? _socket;
  final String _baseUrl = AppConfig.socketUrl;
  final _storage = const FlutterSecureStorage();

  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  WalletProvider? _walletProvider;
  MerchantProvider? _merchantProvider;
  TransactionProvider? _transactionProvider;

  void initialize({
    required WalletProvider walletProvider,
    required MerchantProvider merchantProvider,
    required TransactionProvider transactionProvider,
  }) {
    _walletProvider = walletProvider;
    _merchantProvider = merchantProvider;
    _transactionProvider = transactionProvider;
    _connect();
  }

  Future<void> _connect() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token == null) return;

    _socket = IO.io(_baseUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'token': token})
      .enableAutoConnect()
      .build());

    _socket!.onConnect((_) {
      debugPrint('Socket Connected');
    });

    _socket!.on('balance_update', (data) {
      debugPrint('Real-time balance update: $data');
      if (_walletProvider != null) {
        _walletProvider!.fetchWallets(); // Simplified: refresh all wallets
      }
    });

    _socket!.on('new_transaction', (data) {
      debugPrint('Real-time transaction alert: $data');
      if (_transactionProvider != null) {
        _transactionProvider!.fetchRecentTransactions();
      }
    });

    _socket!.on('merchant_update', (data) {
      debugPrint('Real-time merchant update: $data');
      if (_merchantProvider != null) {
        _merchantProvider!.fetchMyBusinesses();
      }
    });

    _socket!.onDisconnect((_) => debugPrint('Socket Disconnected'));
  }

  void disconnect() {
    _socket?.disconnect();
  }
}
