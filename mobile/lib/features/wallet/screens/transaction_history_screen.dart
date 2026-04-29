import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/transaction_provider.dart';
import '../../../core/theme/app_theme.dart';

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() => _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransactionProvider>().fetchRecentTransactions();
    });
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      context.read<TransactionProvider>().fetchRecentTransactions(refresh: false);
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final txProvider = context.watch<TransactionProvider>();

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('TRANSACTION LOG', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => txProvider.fetchRecentTransactions(),
          child: txProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : txProvider.recentTransactions.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.history_rounded, size: 64, color: AppColors.softGrey.withOpacity(0.3)),
                          const SizedBox(height: 16),
                          const Text('No transactions yet', style: TextStyle(color: AppColors.softGrey, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(24),
                      itemCount: txProvider.recentTransactions.length + (txProvider.isMoreLoading ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == txProvider.recentTransactions.length) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 32),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }
                        final tx = txProvider.recentTransactions[index];
                        return _TransactionItem(tx: tx);
                      },
                    ),
        ),
      ),
    );
  }
}

class _TransactionItem extends StatelessWidget {
  final dynamic tx;
  const _TransactionItem({required this.tx});

  @override
  Widget build(BuildContext context) {
    final isCredit = tx['entry_type'] == 'CREDIT';
    final metadata = tx['transaction']?['metadata'];
    String displayDescription = tx['transaction']?['description'] ?? 'Funds Transfer';

    if (metadata != null) {
      if (isCredit && metadata['customer_name'] != null) {
        displayDescription = 'Received from ${metadata['customer_name']}';
      } else if (!isCredit && metadata['merchant_name'] != null) {
        displayDescription = 'Paid to ${metadata['merchant_name']}';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (isCredit ? AppColors.green : AppColors.blue).withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              isCredit ? Icons.south_west_rounded : Icons.north_east_rounded,
              color: isCredit ? AppColors.green : AppColors.blue,
              size: 20,
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  displayDescription,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  tx['created_at'].toString().split('T')[0],
                  style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'}${tx['amount']}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: isCredit ? AppColors.green : Colors.white,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }
}
