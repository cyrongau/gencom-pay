import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';

class MerchantSettlementsScreen extends StatefulWidget {
  const MerchantSettlementsScreen({super.key});

  @override
  State<MerchantSettlementsScreen> createState() => _MerchantSettlementsScreenState();
}

class _MerchantSettlementsScreenState extends State<MerchantSettlementsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _settlements = [];
  Map<String, dynamic>? _balance;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final responses = await Future.wait([
        _api.get('/merchant/settlements'),
        _api.get('/merchant/balance'),
      ]);
      setState(() {
        _settlements = responses[0].data;
        _balance = responses[1].data;
      });
    } catch (e) {
      debugPrint('Failed to fetch settlements: $e');
    } finally {
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
        title: const Text('SETTLEMENT LEDGER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchData,
          child: _isLoading && _settlements.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(32),
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildBalanceCard(),
                      const SizedBox(height: 48),
                      const Text('SETTLEMENT HISTORY', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
                      const SizedBox(height: 24),
                      if (_settlements.isEmpty)
                        Center(
                          child: Padding(
                            padding: const EdgeInsets.all(48),
                            child: Column(
                              children: [
                                Icon(Icons.receipt_long_rounded, size: 48, color: AppColors.softGrey.withOpacity(0.3)),
                                const SizedBox(height: 16),
                                const Text('No records found', style: TextStyle(color: AppColors.softGrey, fontSize: 12)),
                              ],
                            ),
                          ),
                        )
                      else
                        ..._settlements.map((s) => _SettlementCard(settlement: s)).toList(),
                    ],
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildBalanceCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(40),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('PENDING SETTLEMENT', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              Icon(Icons.account_balance_wallet_rounded, color: AppColors.green.withOpacity(0.5), size: 20),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(_balance?['balance']?.toString() ?? '0.00', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
              const SizedBox(width: 8),
              Text(_balance?['currency']?.toString() ?? 'USD', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.green)),
            ],
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.blue.withOpacity(0.05),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              children: [
                Icon(Icons.sync_rounded, color: AppColors.blue, size: 16),
                SizedBox(width: 12),
                Expanded(child: Text('Next batch processing at 00:00 UTC', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettlementCard extends StatelessWidget {
  final dynamic settlement;
  const _SettlementCard({required this.settlement});

  @override
  Widget build(BuildContext context) {
    final status = settlement['status']?.toString().toUpperCase() ?? 'PENDING';
    final isCompleted = status == 'COMPLETED';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(settlement['amount'].toString(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
                  const SizedBox(width: 6),
                  Text(settlement['currency'].toString(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.labelGrey)),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                'ID: ${settlement['id'].toString().substring(0, 8).toUpperCase()}',
                style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (isCompleted ? AppColors.green : AppColors.gold).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: isCompleted ? AppColors.green : AppColors.gold, letterSpacing: 1),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                settlement['created_at'].toString().split('T')[0],
                style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
