import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../shared/widgets/generex_button.dart';

class EscrowBridgeScreen extends StatefulWidget {
  const EscrowBridgeScreen({super.key});

  @override
  State<EscrowBridgeScreen> createState() => _EscrowBridgeScreenState();
}

class _EscrowBridgeScreenState extends State<EscrowBridgeScreen> {
  final _api = ApiService();
  List<dynamic> _escrows = [];
  bool _isLoading = false;

  final _amountController = TextEditingController();
  final _recipientController = TextEditingController();
  
  String _sourcePlatform = 'ZAAD';
  String _destPlatform = 'EDAHAB';

  final List<Map<String, dynamic>> _platforms = [
    {'id': 'ZAAD', 'name': 'ZAAD MOBILE', 'icon': Icons.phone_android_rounded, 'color': Colors.green},
    {'id': 'EDAHAB', 'name': 'EDAHAB PAY', 'icon': Icons.account_balance_wallet_rounded, 'color': Colors.orange},
    {'id': 'PREMIER', 'name': 'PREMIER WALLET', 'icon': Icons.account_balance_rounded, 'color': Colors.blue},
    {'id': 'GENCOM', 'name': 'GENCOM NODE', 'icon': Icons.hub_rounded, 'color': AppColors.blue},
    {'id': 'USDT', 'name': 'USDT (TRC20)', 'icon': Icons.currency_bitcoin_rounded, 'color': Colors.teal},
    {'id': 'BANK', 'name': 'BANK TRANSFER', 'icon': Icons.account_balance_rounded, 'color': Colors.grey},
  ];

  @override
  void initState() {
    super.initState();
    _fetchEscrows();
  }

  Future<void> _fetchEscrows() async {
    setState(() => _isLoading = true);
    try {
      final response = await _api.get('/escrows');
      setState(() => _escrows = response.data);
    } catch (e) {
      _escrows = [];
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _initiateBridge() async {
    if (_amountController.text.isEmpty || _recipientController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter amount and recipient details')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.post('/escrows', data: {
        'amount': _amountController.text,
        'currency': 'USD',
        'sourcePlatform': _sourcePlatform,
        'destPlatform': _destPlatform,
        'description': 'Bridge: $_sourcePlatform to $_destPlatform',
        'recipient': _recipientController.text,
      });
      _amountController.clear();
      _recipientController.clear();
      _fetchEscrows();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Bridge Protocol Initiated'), backgroundColor: AppColors.green));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Bridge failed: $e')));
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
        title: const Text('ASSET BRIDGE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('BRIDGE CONFIGURATION', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 32),
            
            _buildPlatformSelector('SOURCE PROVIDER', _sourcePlatform, (val) => setState(() => _sourcePlatform = val!)),
            const Center(child: Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Icon(Icons.keyboard_double_arrow_down_rounded, color: AppColors.blue, size: 24))),
            _buildPlatformSelector('TARGET PROVIDER', _destPlatform, (val) => setState(() => _destPlatform = val!)),

            const SizedBox(height: 40),
            
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
              decoration: AppTheme.inputDecoration('Amount (USD)').copyWith(
                prefixText: '\$ ',
                prefixStyle: const TextStyle(color: AppColors.green, fontSize: 24, fontWeight: FontWeight.w900),
              ),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _recipientController,
              style: const TextStyle(color: Colors.white),
              decoration: AppTheme.inputDecoration('Recipient Account / Mobile / ID'),
            ),

            const SizedBox(height: 48),
            
            GenerexButton(
              text: 'AUTHORIZE BRIDGE TRANSFER',
              isLoading: _isLoading,
              onPressed: _initiateBridge,
            ),

            const SizedBox(height: 64),
            const Text('ACTIVE BRIDGE PROTOCOLS', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 24),

            if (_escrows.isEmpty && !_isLoading)
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(32)),
                child: const Center(child: Text('No active escrow bridges', style: TextStyle(color: AppColors.labelGrey, fontSize: 11))),
              )
            else
              ..._escrows.map((e) => _BridgeCard(escrow: e, onAction: _fetchEscrows)).toList(),
            
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildPlatformSelector(String label, String current, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.labelGrey, letterSpacing: 1)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: current,
              isExpanded: true,
              dropdownColor: AppColors.cardBg,
              icon: const Icon(Icons.arrow_drop_down_rounded, color: AppColors.blue),
              items: _platforms.map((p) => DropdownMenuItem<String>(
                value: p['id'],
                child: Row(
                  children: [
                    Icon(p['icon'], color: p['color'], size: 18),
                    const SizedBox(width: 16),
                    Text(p['name'], style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w900)),
                  ],
                ),
              )).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

class _BridgeCard extends StatelessWidget {
  final dynamic escrow;
  final VoidCallback onAction;
  const _BridgeCard({required this.escrow, required this.onAction});

  @override
  Widget build(BuildContext context) {
    final bool isBuyer = true; // Simplified for demo
    final String status = escrow['status'];

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${escrow['source_platform']} ➔ ${escrow['dest_platform']}',
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.blue, letterSpacing: 1),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (status == 'LOCKED' ? AppColors.gold : AppColors.green).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status == 'LOCKED' ? 'HELD' : status,
                  style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: status == 'LOCKED' ? AppColors.gold : AppColors.green),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text('\$${escrow['amount']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
          const SizedBox(height: 20),
          if (status == 'LOCKED')
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () async {
                      await ApiService().post('/escrows/${escrow['id']}/release');
                      onAction();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.green,
                      foregroundColor: AppColors.navy,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('RELEASE FUNDS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () async {
                      await ApiService().post('/escrows/${escrow['id']}/refund');
                      onAction();
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.redAccent),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('DISPUTE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.redAccent)),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
