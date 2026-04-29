import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import 'dashboard_screen.dart';
import '../../cards/screens/cards_screen.dart';
import '../../merchant/screens/merchant_kyc_screen.dart';
import '../../merchant/screens/merchant_dashboard_screen.dart';
import '../../wallet/screens/exchange_screen.dart';
import 'notification_screen.dart';
import '../../auth/screens/profile_screen.dart';
import '../../../core/providers/merchant_provider.dart';
import 'package:provider/provider.dart';
import '../../../core/services/socket_service.dart';
import '../../../core/services/push_notification_service.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/providers/transaction_provider.dart';

class NavigationContainer extends StatefulWidget {
  const NavigationContainer({super.key});

  @override
  State<NavigationContainer> createState() => _NavigationContainerState();
}

class _NavigationContainerState extends State<NavigationContainer> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      SocketService().initialize(
        walletProvider: context.read<WalletProvider>(),
        merchantProvider: context.read<MerchantProvider>(),
        transactionProvider: context.read<TransactionProvider>(),
      );
      PushNotificationService.initialize();
    });
  }

  @override
  void dispose() {
    SocketService().disconnect();
    super.dispose();
  }

  final List<Widget> _screens = [
    const DashboardScreen(),
    const ExchangeScreen(), // Wallet/Exchange tab
    const CardsScreen(),
    const MerchantTab(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: AppColors.navy,
          selectedItemColor: AppColors.green,
          unselectedItemColor: AppColors.softGrey,
          type: BottomNavigationBarType.fixed,
          selectedFontSize: 10,
          unselectedFontSize: 10,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'HOME'),
            BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet_rounded), label: 'WALLET'),
            BottomNavigationBarItem(icon: Icon(Icons.credit_card_rounded), label: 'CARDS'),
            BottomNavigationBarItem(icon: Icon(Icons.storefront_rounded), label: 'MERCHANT'),
            BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'PROFILE'),
          ],
        ),
      ),
    );
  }
}

class MerchantTab extends StatelessWidget {
  const MerchantTab({super.key});

  @override
  Widget build(BuildContext context) {
    final isMerchant = context.watch<MerchantProvider>().hasBusiness;
    if (isMerchant) {
      return const MerchantDashboardScreen();
    }
    return const MerchantKYCScreen();
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
      ),
    );
  }
}
