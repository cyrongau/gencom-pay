import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/card_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/virtual_card_widget.dart';

class CardsScreen extends StatefulWidget {
  const CardsScreen({super.key});

  @override
  State<CardsScreen> createState() => _CardsScreenState();
}

class _CardsScreenState extends State<CardsScreen> {
  bool _isRevealed = false;
  Map<String, dynamic>? _revealedDetails;
  final _dailyController = TextEditingController();
  final _monthlyController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CardProvider>().fetchCards();
    });
  }

  Future<void> _handleReveal(String cardId) async {
    if (_isRevealed) {
      setState(() {
        _isRevealed = false;
        _revealedDetails = null;
      });
      return;
    }

    final details = await context.read<CardProvider>().revealDetails(cardId);
    if (details != null) {
      setState(() {
        _revealedDetails = details;
        _isRevealed = true;
      });
    }
  }

  void _showLimitModal(dynamic card) {
    _dailyController.text = card['daily_limit'].toString();
    _monthlyController.text = card['monthly_limit'].toString();

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 32, right: 32, top: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('LIMIT CONTROL', style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 8),
            Text('Protocol Configuration', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 40),
            Text('DAILY LIMIT (USD)', style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 12),
            TextField(controller: _dailyController, keyboardType: TextInputType.number, decoration: AppTheme.inputDecoration('0.00')),
            const SizedBox(height: 24),
            Text('MONTHLY ALLOWANCE (USD)', style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 12),
            TextField(controller: _monthlyController, keyboardType: TextInputType.number, decoration: AppTheme.inputDecoration('0.00')),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  final success = await context.read<CardProvider>().updateLimits(card['id'], _dailyController.text, _monthlyController.text);
                  if (success && mounted) Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.blue,
                  foregroundColor: Colors.white,
                ),
                child: const Text('COMMIT PROTOCOL'),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cardProvider = context.watch<CardProvider>();
    final user = context.watch<AuthProvider>().user;
    final activeCard = cardProvider.cards.isNotEmpty ? cardProvider.cards[0] : null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('VIRTUAL CARDS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (activeCard != null) ...[
              VirtualCardWidget(
                brand: activeCard['brand'],
                holderName: activeCard['card_holder_name'],
                lastFour: activeCard['last_four'],
                expiry: '${activeCard['expiry_month']}/${activeCard['expiry_year']}',
                isFrozen: activeCard['status'] == 'FROZEN',
                isRevealed: _isRevealed,
                cardNumber: _revealedDetails?['card_number'],
                cvv: _revealedDetails?['cvv'],
              ),
              const SizedBox(height: 56),
              Text('CARD CONTROLS', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 24),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                childAspectRatio: 1.4,
                children: [
                  _SecurityButton(
                    icon: activeCard['status'] == 'FROZEN' ? Icons.lock_open : Icons.ac_unit,
                    label: activeCard['status'] == 'FROZEN' ? 'Unfreeze' : 'Freeze',
                    color: activeCard['status'] == 'FROZEN' ? AppColors.green : Colors.redAccent,
                    onTap: () => cardProvider.toggleFreeze(activeCard['id']),
                  ),
                  _SecurityButton(
                    icon: _isRevealed ? Icons.visibility_off : Icons.visibility,
                    label: _isRevealed ? 'Hide Data' : 'Reveal',
                    color: AppColors.blue,
                    onTap: () => _handleReveal(activeCard['id']),
                  ),
                  _SecurityButton(
                    icon: Icons.tune,
                    label: 'Limits',
                    color: AppColors.gold,
                    onTap: () => _showLimitModal(activeCard),
                  ),
                  _SecurityButton(
                    icon: Icons.refresh,
                    label: 'New CVV',
                    color: Colors.purpleAccent,
                    onTap: () => cardProvider.regenerateCVV(activeCard['id']),
                  ),
                ],
              ),
              const SizedBox(height: 56),
              Text('RECENT TRANSACTIONS', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 24),
              if (cardProvider.transactions.isEmpty)
                const Center(child: Text('No recent activity', style: TextStyle(color: AppColors.labelGrey, fontSize: 12)))
              else
                ...cardProvider.transactions.map((tx) => _TransactionItem(tx: tx)).toList(),
            ] else if (cardProvider.isLoading)
              const Center(child: CircularProgressIndicator())
            else
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 100),
                    Icon(Icons.credit_card_off_outlined, size: 64, color: AppColors.labelGrey.withOpacity(0.3)),
                    const SizedBox(height: 24),
                    Text('No Active Cards Found', style: TextStyle(color: AppColors.labelGrey.withOpacity(0.5), fontWeight: FontWeight.bold)),
                    const SizedBox(height: 48),
                    SizedBox(
                      width: 200,
                      child: ElevatedButton(
                        onPressed: () => cardProvider.issueCard(user?['full_name'] ?? 'GENEREX USER'),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.green, foregroundColor: AppColors.navy),
                        child: const Text('CREATE NEW CARD'),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _SecurityButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _SecurityButton({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 12),
            Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1, color: Colors.white)),
          ],
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
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.shopping_bag_outlined, color: AppColors.labelGrey, size: 20),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tx['transaction']?['description'] ?? 'Card Purchase', 
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(tx['created_at'].toString().split('T')[0], style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const SizedBox(width: 20),
          Text(
            '-\$${tx['amount']}', 
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic, letterSpacing: -0.5),
          ),
        ],
      ),
    );
  }
}
