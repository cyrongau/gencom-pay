import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';

class MerchantAnalyticsScreen extends StatefulWidget {
  const MerchantAnalyticsScreen({super.key});

  @override
  State<MerchantAnalyticsScreen> createState() => _MerchantAnalyticsScreenState();
}

class _MerchantAnalyticsScreenState extends State<MerchantAnalyticsScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _analytics;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    try {
      final response = await _api.get('/merchant/analytics');
      setState(() {
        _analytics = response.data;
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
        title: const Text('BUSINESS PERFORMANCE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildStatCard('TOTAL REVENUE', '\$${_analytics?['totalRevenue'] ?? '0.00'}', Icons.payments_outlined),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildStatCard('SUCCESS RATE', '${_analytics?['successRate'] ?? '0'}%', Icons.bolt_rounded)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildStatCard('TX COUNT', '${_analytics?['transactionCount'] ?? '0'}', Icons.receipt_long_outlined)),
                  ],
                ),
                
                const SizedBox(height: 56),
                
                const Text('VOLUME DISTRIBUTION', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
                const SizedBox(height: 24),
                
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: const Center(
                    child: Text(
                      'GRAPHICAL PROTOCOLS INDEXING...',
                      style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                    ),
                  ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.blue, size: 20),
          const SizedBox(height: 24),
          Text(label, style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.w900, letterSpacing: 1)),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }
}
