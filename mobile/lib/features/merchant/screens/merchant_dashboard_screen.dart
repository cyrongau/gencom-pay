import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/providers/merchant_provider.dart';
import '../../../core/theme/app_theme.dart';
import 'merchant_settlements_screen.dart';
import 'merchant_branding_screen.dart';
import 'merchant_team_screen.dart';
import 'merchant_settings_screen.dart';
import 'merchant_terminals_screen.dart';
import 'merchant_analytics_screen.dart';
import 'merchant_transactions_screen.dart';
import 'merchant_select_screen.dart';
import '../../../core/utils/url_util.dart';

class MerchantDashboardScreen extends StatefulWidget {
  const MerchantDashboardScreen({super.key});

  @override
  State<MerchantDashboardScreen> createState() => _MerchantDashboardScreenState();
}

class _MerchantDashboardScreenState extends State<MerchantDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MerchantProvider>().fetchMyBusinesses();
      context.read<MerchantProvider>().fetchMerchantTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    final merchantProvider = context.watch<MerchantProvider>();
    final merchant = merchantProvider.activeBusiness;

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        title: const Text('BUSINESS CENTER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded, color: AppColors.green),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantSelectScreen())),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                        image: DecorationImage(
                          image: CachedNetworkImageProvider(
                            UrlUtil.getImageUrl(merchant?['logo_url'], fallbackName: merchant?['business_name'] ?? 'Merchant')
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            merchant?['business_name']?.toUpperCase() ?? 'BUSINESS ACCOUNT', 
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            merchant?['status'] ?? 'ACCOUNT STATUS',
                            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.green, letterSpacing: 1),
                          ),
                          const SizedBox(height: 12),
                          GestureDetector(
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantBrandingScreen())),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.blue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'MANAGE BRANDING',
                                style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.blue, letterSpacing: 1),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 48),
              
              Row(
                children: [
                  _MerchantActionCard(
                    icon: Icons.point_of_sale_rounded,
                    label: 'TERMINALS',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantTerminalsScreen())),
                  ),
                  const SizedBox(width: 16),
                  _MerchantActionCard(
                    icon: Icons.receipt_long_rounded,
                    label: 'SETTLEMENTS',
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantSettlementsScreen())),
                  ),
                ],
              ),

              const SizedBox(height: 56),
              
              Text('BUSINESS PAYMENT QR', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 24),
              Center(
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(40),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 40, offset: const Offset(0, 20)),
                    ],
                  ),
                  child: QrImageView(
                    data: jsonEncode({
                      'type': 'MERCHANT_STATIC',
                      'merchantId': merchant?['id'],
                      'gencomMerchantId': merchant?['gencom_merchant_id'],
                      'businessName': merchant?['business_name'],
                    }),
                    version: QrVersions.auto,
                    size: 180.0,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppColors.navy),
                    dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: AppColors.navy),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  'BUSINESS ID: ${merchant?['gencom_merchant_id'] ?? 'UPDATING...'}',
                  style: TextStyle(color: AppColors.labelGrey.withOpacity(0.5), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1),
                ),
              ),

              const SizedBox(height: 56),
              
              Text('MERCHANT TEAMS', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 24),
              
              Row(
                children: [
                  Expanded(
                    child: _ActionCard(
                      icon: Icons.group_outlined, 
                      title: 'TEAM', 
                      subtitle: 'Manage protocols',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantTeamScreen())),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _ActionCard(
                      icon: Icons.settings_input_component_outlined, 
                      title: 'CONFIG', 
                      subtitle: 'Keys & Webhooks',
                      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantSettingsScreen())),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _ActionCard(
                icon: Icons.analytics_outlined, 
                title: 'BUSINESS ANALYTICS', 
                subtitle: 'View detailed performance metrics and node logs',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantAnalyticsScreen())),
              ),
              
              const SizedBox(height: 56),
              
              Text('RECENT BUSINESS ACTIVITY', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 24),
              
              if (merchantProvider.merchantTransactions.isEmpty)
                const Center(child: Text('No recent business activity', style: TextStyle(color: AppColors.labelGrey, fontSize: 12)))
              else
                ...merchantProvider.merchantTransactions.take(10).map((tx) => _SettlementItem(
                  amount: tx['amount'].toString(),
                  currency: tx['currency'] ?? 'USD',
                  date: tx['created_at'].toString().split('T')[0],
                  status: tx['status'] ?? 'COMPLETED',
                )).toList(),
              
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => MerchantTransactionsScreen())),
                    child: const Text('VIEW ALL PAYMENTS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.green, letterSpacing: 1)),
                  ),
                  const SizedBox(width: 24),
                  TextButton(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantSettlementsScreen())),
                    child: const Text('VIEW ALL SETTLEMENTS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.blue, letterSpacing: 1)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettlementItem extends StatelessWidget {
  final String amount;
  final String currency;
  final String date;
  final String status;

  const _SettlementItem({required this.amount, required this.currency, required this.date, required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(24),
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
                  Text(amount, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
                  const SizedBox(width: 8),
                  Text(currency, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.labelGrey)),
                ],
              ),
              const SizedBox(height: 4),
              Text(date, style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.green.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(status, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.green)),
          ),
        ],
      ),
    );
  }
}

class _MerchantActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MerchantActionCard({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 32),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Column(
            children: [
              Icon(icon, color: AppColors.green, size: 32),
              const SizedBox(height: 12),
              Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.labelGrey, size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w900)),
                  Text(subtitle, style: const TextStyle(color: AppColors.labelGrey, fontSize: 9, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
