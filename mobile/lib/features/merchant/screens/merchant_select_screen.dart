import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/merchant_provider.dart';
import '../../../core/theme/app_theme.dart';
import 'merchant_dashboard_screen.dart';

class MerchantSelectScreen extends StatefulWidget {
  const MerchantSelectScreen({super.key});

  @override
  State<MerchantSelectScreen> createState() => _MerchantSelectScreenState();
}

class _MerchantSelectScreenState extends State<MerchantSelectScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MerchantProvider>().fetchMyBusinesses();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MerchantProvider>();
    final businesses = provider.myBusinesses;

    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'SELECT BUSINESS',
                style: TextStyle(
                  fontSize: 42,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  fontStyle: FontStyle.italic,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'CHOOSE THE ENTITY YOU WISH TO MANAGE',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: AppColors.labelGrey.withOpacity(0.5),
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 48),
              if (provider.isLoading)
                const Center(child: CircularProgressIndicator(color: AppColors.green))
              else
                Expanded(
                  child: GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.85,
                    ),
                    itemCount: businesses.length + 1,
                    itemBuilder: (context, index) {
                      if (index == businesses.length) {
                        return _AddBusinessCard();
                      }
                      final business = businesses[index];
                      return _BusinessCard(business: business);
                    },
                  ),
                ),
              const SizedBox(height: 32),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'RETURN TO PERSONAL DASHBOARD',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: AppColors.labelGrey.withOpacity(0.3),
                      letterSpacing: 2,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BusinessCard extends StatelessWidget {
  final Map<String, dynamic> business;

  const _BusinessCard({required this.business});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.read<MerchantProvider>().setActiveBusiness(business);
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MerchantDashboardScreen()),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.storefront, color: AppColors.green, size: 24),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    business['userRole'] ?? 'OWNER',
                    style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.green),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              business['business_name'] ?? 'UNKNOWN',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white),
            ),
            const SizedBox(height: 4),
            Text(
              'ID: ${business['gencom_merchant_id'] ?? ''}',
              style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppColors.labelGrey.withOpacity(0.5)),
            ),
            const Spacer(),
            const Align(
              alignment: Alignment.bottomRight,
              child: Icon(Icons.arrow_forward, color: AppColors.green, size: 16),
            ),
          ],
        ),
      ),
    );
  }
}

class _AddBusinessCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05), width: 2, style: BorderStyle.solid),
      ),
      child: const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add, color: AppColors.labelGrey, size: 32),
          SizedBox(height: 12),
          Text(
            'REGISTER NEW',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.labelGrey),
          ),
        ],
      ),
    );
  }
}
