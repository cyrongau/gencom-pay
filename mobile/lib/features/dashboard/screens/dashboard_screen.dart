import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/providers/merchant_provider.dart';
import '../../../core/providers/transaction_provider.dart';
import '../../../core/providers/system_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../cards/screens/cards_screen.dart';
import '../../bills/screens/pay_bill_screen.dart';
import '../../merchant/screens/scan_to_pay_screen.dart';
import '../../merchant/screens/merchant_kyc_screen.dart';
import '../../merchant/screens/merchant_dashboard_screen.dart';
import '../../wallet/screens/transfer_funds_screen.dart';
import '../../wallet/screens/deposit_funds_screen.dart';
import '../../wallet/screens/exchange_screen.dart';
import '../../wallet/screens/escrow_bridge_screen.dart';
import '../../wallet/screens/crypto_screen.dart';
import '../widgets/wallet_card.dart';
import '../../../shared/widgets/receipt_modal.dart';
import 'notification_screen.dart';
import '../../wallet/screens/transaction_history_screen.dart';
import '../../../core/utils/url_util.dart';
import '../widgets/quick_transfer_modal.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().fetchWallets();
      context.read<MerchantProvider>().fetchMyBusinesses();
      context.read<TransactionProvider>().fetchRecentTransactions();
      context.read<TransactionProvider>().fetchFrequentRecipients();
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

  void _showCreateWalletDialog() {
    String selectedCurrency = 'USD';
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('NEW WALLET', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 8),
              Text('Add a New Account', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 32),
              Wrap(
                spacing: 12,
                children: ['USD', 'EUR', 'GBP', 'KSH', 'SLS', 'BTC', 'ETH'].map((c) => ChoiceChip(
                  label: Text(c),
                  selected: selectedCurrency == c,
                  onSelected: (val) => setModalState(() => selectedCurrency = c),
                  backgroundColor: AppColors.cardBg,
                  selectedColor: AppColors.green.withOpacity(0.2),
                  labelStyle: TextStyle(color: selectedCurrency == c ? AppColors.green : Colors.white),
                )).toList(),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final success = await context.read<WalletProvider>().createWallet(selectedCurrency);
                    if (success && mounted) Navigator.pop(context);
                  },
                  child: const Text('ADD WALLET'),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final walletProvider = context.watch<WalletProvider>();
    final merchantProvider = context.watch<MerchantProvider>();
    final txProvider = context.watch<TransactionProvider>();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0B1225), Color(0xFF0B1225), Color(0xFF0F172A)],
          ),
        ),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: () async {
              await context.read<WalletProvider>().fetchWallets();
              await context.read<TransactionProvider>().fetchRecentTransactions();
              await context.read<MerchantProvider>().fetchMyBusinesses();
            },
            child: SingleChildScrollView(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Custom Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ACCOUNT: ${user?['full_name']?.toUpperCase() ?? 'UNSET'}',
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            context.watch<SystemProvider>().branding['APP_NAME'] ?? 'Personal Wallet',
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                        ],
                      ),
                      _NotificationBell(
              hasNotifications: false, // Default to false for now
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationScreen())),
            ),
                    ],
                  ),

                  const SizedBox(height: 48),

                  // Total Balance Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.blue, Color(0xFF1E293B)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(44),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.blue.withOpacity(0.3),
                          blurRadius: 40,
                          offset: const Offset(0, 20),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'TOTAL CONSOLIDATED BALANCE',
                              style: TextStyle(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 2),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.trending_up, color: AppColors.green, size: 10),
                                  SizedBox(width: 4),
                                  Text('LIVE', style: TextStyle(color: AppColors.green, fontSize: 8, fontWeight: FontWeight.w900)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '\$${walletProvider.consolidatedBalance.toStringAsFixed(2)}',
                              style: const TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, letterSpacing: -2),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'USD',
                              style: TextStyle(color: AppColors.green, fontSize: 16, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'Secure network verification active. Assets valued at real-time market rates.',
                          style: TextStyle(color: Colors.white30, fontSize: 8, fontWeight: FontWeight.w500, letterSpacing: 0.5),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Wallet List
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('MY WALLETS', style: Theme.of(context).textTheme.labelSmall),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline, color: AppColors.green, size: 20),
                        onPressed: _showCreateWalletDialog,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (walletProvider.isLoading)
                    const Center(child: CircularProgressIndicator())
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
                            showId: false,
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

                  const SizedBox(height: 48),

                  // Merchant Invitation (Only for non-merchants)
                  Consumer<MerchantProvider>(
                    builder: (context, merchantProv, _) {
                      if (merchantProv.hasBusiness) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 48),
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [AppColors.green.withOpacity(0.15), AppColors.green.withOpacity(0.05)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(32),
                            border: Border.all(color: AppColors.green.withOpacity(0.2)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.business_center_rounded, color: AppColors.green, size: 20),
                                  const SizedBox(width: 12),
                                  const Text('BECOME A MERCHANT', style: TextStyle(color: AppColors.green, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1.5)),
                                ],
                              ),
                              const SizedBox(height: 16),
                              const Text('Scale your business with Gencom Pay. Accept payments globally.', style: TextStyle(fontSize: 14, color: Colors.white70)),
                              const SizedBox(height: 20),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MerchantKYCScreen())),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.green,
                                    foregroundColor: AppColors.navy,
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                  ),
                                  child: const Text('GET STARTED'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

                  // Quick Actions Grid
                  Text('SERVICES', style: Theme.of(context).textTheme.labelSmall),
                  const SizedBox(height: 24),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 4,
                    mainAxisSpacing: 32,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.75,
                    children: [
                      _ActionButton(icon: Icons.send_rounded, label: 'Send', color: AppColors.blue, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TransferFundsScreen()))),
                      _ActionButton(icon: Icons.add_circle_outline_rounded, label: 'Deposit', color: AppColors.green, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => DepositFundsScreen()))),
                      _ActionButton(icon: Icons.swap_horiz_rounded, label: 'Exchange', color: AppColors.blue, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ExchangeScreen()))),
                      _ActionButton(icon: Icons.account_tree_rounded, label: 'Bridge', color: AppColors.gold, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => EscrowBridgeScreen()))),
                      _ActionButton(icon: Icons.qr_code_scanner_rounded, label: 'Scan', color: AppColors.blue, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ScanToPayScreen()))),
                      _ActionButton(icon: Icons.currency_bitcoin_rounded, label: 'Crypto', color: Colors.orange, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CryptoScreen()))),
                      _ActionButton(icon: Icons.receipt_long_rounded, label: 'Bills', color: AppColors.blue, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PayBillScreen()))),
                      _ActionButton(icon: Icons.shopping_cart_outlined, label: 'Store', color: Colors.purple, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PayBillScreen(initialProvider: 'GENCOM', title: 'GENCOM STORE')))),
                      _ActionButton(icon: Icons.credit_card_rounded, label: 'Cards', color: AppColors.blue, onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CardsScreen()))),
                      _ActionButton(
                        icon: Icons.storefront_rounded, 
                        label: 'Merchant', 
                        color: AppColors.green,
                        onTap: () {
                          if (merchantProvider.hasBusiness) {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => MerchantDashboardScreen()));
                          } else {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => MerchantKYCScreen()));
                          }
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 48),

                  // Quick Transfer (Frequent Recipients)
                  if (txProvider.frequentRecipients.isNotEmpty) ...[
                    Text('QUICK TRANSFER', style: Theme.of(context).textTheme.labelSmall),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 80,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: txProvider.frequentRecipients.length,
                        itemBuilder: (context, index) {
                          final recipient = txProvider.frequentRecipients[index];
                          return GestureDetector(
                            onTap: () => QuickTransferModal.show(context, recipient),
                            child: Container(
                              margin: const EdgeInsets.only(right: 16),
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              decoration: BoxDecoration(
                                color: AppColors.cardBg,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.white.withOpacity(0.05)),
                              ),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: AppColors.green.withOpacity(0.1),
                                    backgroundImage: recipient['avatar_url'] != null && recipient['avatar_url'].toString().isNotEmpty
                                      ? CachedNetworkImageProvider(UrlUtil.getImageUrl(recipient['avatar_url'])) 
                                      : CachedNetworkImageProvider(UrlUtil.getImageUrl(null, fallbackName: recipient['name'])),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(recipient['name'].split(' ')[0], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 48),
                  ],

                  // Recent Transactions
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('RECENT ACTIVITY', style: Theme.of(context).textTheme.labelSmall),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TransactionHistoryScreen())),
                        child: Text('VIEW ALL', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.green)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  if (txProvider.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (txProvider.recentTransactions.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(40),
                        border: Border.all(color: Colors.white.withOpacity(0.05)),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.sync_alt_rounded, color: AppColors.labelGrey.withOpacity(0.3), size: 40),
                          const SizedBox(height: 16),
                          Text(
                            'No recent transactions found.',
                            style: TextStyle(color: AppColors.labelGrey.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 1),
                          ),
                        ],
                      ),
                    )
                  else
                    Column(
                      children: [
                        ...txProvider.recentTransactions.take(10).map((tx) => _TransactionItem(tx: tx)).toList(),
                        if (txProvider.isMoreLoading)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 24),
                            child: Center(child: CircularProgressIndicator()),
                          ),
                      ],
                    ),
                ],
              ),
            ),
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
    return GestureDetector(
      onTap: () => ReceiptModal.show(context, tx),
      child: Container(
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
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: (isCredit ? AppColors.green : AppColors.blue).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                isCredit ? Icons.south_west_rounded : Icons.north_east_rounded,
                color: isCredit ? AppColors.green : AppColors.blue,
                size: 16,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tx['transaction']?['description'] ?? 'Funds Transfer',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    tx['created_at'].toString().split('T')[0],
                    style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            Text(
              '${isCredit ? '+' : '-'}${tx['amount']}',
              style: TextStyle(
                fontSize: 14, 
                fontWeight: FontWeight.w900, 
                color: isCredit ? AppColors.green : Colors.white,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationBell extends StatelessWidget {
  final bool hasNotifications;
  final VoidCallback onTap;
  const _NotificationBell({required this.onTap, this.hasNotifications = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 52,
        height: 52,
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 24),
            if (hasNotifications)
              Positioned(
                top: 14,
                right: 14,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.green,
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: AppColors.green, blurRadius: 4)],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _ActionButton({required this.icon, required this.label, required this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: color.withOpacity(0.15)),
            ),
            child: Icon(icon, color: color, size: 30),
          ),
          const SizedBox(height: 12),
          Text(
            label.toUpperCase(),
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
