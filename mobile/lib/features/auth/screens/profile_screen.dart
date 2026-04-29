import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../shared/widgets/generex_button.dart';
import '../../dashboard/screens/notification_screen.dart';
import '../../dashboard/widgets/wallet_card.dart';
import '../../wallet/screens/transaction_history_screen.dart';
import 'security_settings_screen.dart';
import 'language_settings_screen.dart';
import 'edit_profile_screen.dart';
import '../../../core/utils/url_util.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().fetchWallets();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final walletProvider = context.watch<WalletProvider>();

    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('MY PROFILE', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 32),
              
              Row(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                      image: DecorationImage(
                        image: CachedNetworkImageProvider(
                          UrlUtil.getImageUrl(user?['avatar_url'], fallbackName: user?['full_name'] ?? 'User')
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(width: 24),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?['full_name']?.toUpperCase() ?? 'GENCOM USER', 
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic, letterSpacing: -1),
                        ),
                        const SizedBox(height: 4),
                        Text(user?['email'] ?? '', style: const TextStyle(color: AppColors.labelGrey, fontSize: 13, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        GestureDetector(
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen())),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'EDIT IDENTITY',
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.green, letterSpacing: 1),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 56),

              // Consolidated Wallets section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('CONSOLIDATED WALLETS', style: Theme.of(context).textTheme.labelSmall),
                  Text('${walletProvider.wallets.length} ACCOUNTS', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.green)),
                ],
              ),
              const SizedBox(height: 24),
              if (walletProvider.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (walletProvider.wallets.isEmpty)
                const Text('No wallets found', style: TextStyle(color: AppColors.labelGrey))
              else
                SizedBox(
                  height: 240,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: walletProvider.wallets.length,
                    itemBuilder: (context, index) {
                      final wallet = walletProvider.wallets[index];
                      return WalletCard(
                        id: wallet['id'],
                        balance: wallet['balance'],
                        currency: wallet['currency'],
                        isPrimary: index == 0,
                        showId: true, // Show ID on profile page as per requirements
                        onCopy: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text('WALLET ID COPIED', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 10)),
                              backgroundColor: AppColors.green,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              margin: const EdgeInsets.all(24),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),

              const SizedBox(height: 56),
              
              Text('APP SETTINGS', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 24),
              _ProfileItem(
                icon: Icons.security_rounded, 
                title: 'Security & Privacy', 
                subtitle: 'Fingerprint & Password Settings',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SecuritySettingsScreen())),
              ),
              _ProfileItem(
                icon: Icons.history_rounded, 
                title: 'Recent Activity', 
                subtitle: 'View your transaction logs',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TransactionHistoryScreen())),
              ),
              _ProfileItem(
                icon: Icons.notifications_active_rounded, 
                title: 'Notifications', 
                subtitle: 'Alert and message settings',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => NotificationScreen())),
              ),
              _ProfileItem(
                icon: Icons.language_rounded, 
                title: 'Language & Currency', 
                subtitle: 'Regional and display preferences',
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LanguageSettingsScreen())),
              ),

              const SizedBox(height: 56),
              
              GenerexButton(
                text: 'LOGOUT',
                backgroundColor: Colors.redAccent,
                onPressed: () => context.read<AuthProvider>().logout(),
              ),
              const SizedBox(height: 24),
              Center(
                child: Text(
                  'Gencom Pay • v1.2.0',
                  style: TextStyle(color: AppColors.labelGrey.withOpacity(0.3), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  const _ProfileItem({required this.icon, required this.title, required this.subtitle, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.labelGrey, size: 24),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.labelGrey, size: 20),
          ],
        ),
      ),
    );
  }
}
