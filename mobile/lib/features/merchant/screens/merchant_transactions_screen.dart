import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';

class MerchantTransactionsScreen extends StatefulWidget {
  const MerchantTransactionsScreen({super.key});

  @override
  State<MerchantTransactionsScreen> createState() => _MerchantTransactionsScreenState();
}

class _MerchantTransactionsScreenState extends State<MerchantTransactionsScreen> {
  final _api = ApiService();
  List<dynamic> _transactions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTransactions();
  }

  Future<void> _fetchTransactions() async {
    try {
      final response = await _api.get('/merchant/transactions');
      setState(() {
        _transactions = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('PAYMENT PROTOCOLS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(32),
            itemCount: _transactions.length,
            itemBuilder: (context, index) {
              final tx = _transactions[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.receipt_long_rounded, color: AppColors.green, size: 20),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TXID #${tx['id'].toString().substring(0, 8).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 13)),
                          const SizedBox(height: 4),
                          Text(tx['created_at'].toString().substring(0, 16).replaceAll('T', ' '), style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('\$${tx['amount']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
                        Text(tx['status'], style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.green)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
    );
  }
}
