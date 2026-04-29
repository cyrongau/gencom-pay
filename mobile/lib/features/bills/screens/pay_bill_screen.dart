import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/providers/bill_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class PayBillScreen extends StatefulWidget {
  final String? initialProvider;
  final String? title;
  const PayBillScreen({super.key, this.initialProvider, this.title});

  @override
  State<PayBillScreen> createState() => _PayBillScreenState();
}

class _PayBillScreenState extends State<PayBillScreen> {
  String _provider = 'ZAAD';
  String _billType = 'TILL';
  String _targetCurrency = 'USD';
  String? _selectedWalletId;
  
  final _merchantController = TextEditingController();
  final _accountController = TextEditingController();
  final _amountController = TextEditingController();

  final List<Map<String, dynamic>> _providers = [
    {'id': 'ZAAD', 'name': 'ZAAD', 'icon': Icons.smartphone, 'currency': 'USD'},
    {'id': 'EDAHAB', 'name': 'eDahab', 'icon': Icons.payments, 'currency': 'USD'},
    {'id': 'MPESA', 'name': 'M-Pesa', 'icon': Icons.account_balance, 'currency': 'KSH'},
    {'id': 'PREMIER', 'name': 'Premier', 'icon': Icons.wallet, 'currency': 'USD'},
    {'id': 'GENCOM', 'name': 'Gencom', 'icon': Icons.shield_rounded, 'currency': 'USD'},
  ];

  List<dynamic> _searchResults = [];
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialProvider != null) {
      _provider = widget.initialProvider!;
      final p = _providers.firstWhere((p) => p['id'] == _provider, orElse: () => _providers[0]);
      _targetCurrency = p['currency'];
    }
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final wallets = context.read<WalletProvider>().wallets;
      if (wallets.isNotEmpty) {
        setState(() => _selectedWalletId = wallets[0]['id']);
      }
      context.read<BillProvider>().fetchHistory();
    });
  }

  Future<void> _handlePayment() async {
    if (_merchantController.text.isEmpty || _amountController.text.isEmpty || _selectedWalletId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    final success = await context.read<BillProvider>().payBill(
      provider: _provider,
      billType: _billType,
      merchantId: _merchantController.text,
      accountNumber: _billType == 'PAYBILL' ? _accountController.text : null,
      amount: _amountController.text,
      currency: _targetCurrency,
      walletId: _selectedWalletId!,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment Authorized Successfully'), backgroundColor: AppColors.green));
      _merchantController.clear();
      _accountController.clear();
      _amountController.clear();
    }
  }

  Future<void> _searchMerchants(String query) async {
    if (query.length < 2) {
      setState(() => _searchResults = []);
      return;
    }
    setState(() => _isSearching = true);
    final results = await context.read<BillProvider>().searchMerchants(query);
    setState(() {
      _searchResults = results;
      _isSearching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final wallets = context.watch<WalletProvider>().wallets;
    final billProvider = context.watch<BillProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title ?? 'PAY BILLS', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('SELECT PROVIDER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey)),
            const SizedBox(height: 20),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _providers.length,
                itemBuilder: (context, index) {
                  final p = _providers[index];
                  final isSelected = _provider == p['id'];
                  return GestureDetector(
                    onTap: () => setState(() {
                      _provider = p['id'];
                      _targetCurrency = p['currency'];
                    }),
                    child: Container(
                      width: 80,
                      margin: const EdgeInsets.only(right: 16),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.blue.withOpacity(0.2) : AppColors.cardBg,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: isSelected ? AppColors.blue : Colors.white.withOpacity(0.05)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(p['icon'], color: isSelected ? AppColors.blue : AppColors.softGrey, size: 24),
                          const SizedBox(height: 8),
                          Text(p['name'], style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: isSelected ? Colors.white : AppColors.softGrey)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 40),
            const Text('PAYMENT TYPE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey)),
            const SizedBox(height: 16),
            Row(
              children: [
                _TypeChip(label: 'TILL', isSelected: _billType == 'TILL', onTap: () => setState(() => _billType = 'TILL')),
                const SizedBox(width: 12),
                _TypeChip(label: 'PAYBILL', isSelected: _billType == 'PAYBILL', onTap: () => setState(() => _billType = 'PAYBILL')),
              ],
            ),

            const SizedBox(height: 40),
            const Text('MERCHANT DETAILS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey)),
            const SizedBox(height: 20),
            TextField(
              controller: _merchantController,
              onChanged: (val) {
                if (_provider == 'GENCOM') _searchMerchants(val);
              },
              decoration: InputDecoration(
                hintText: _billType == 'TILL' ? 'Enter Till Number' : 'Enter Business Number',
                suffixIcon: _isSearching ? const SizedBox(width: 20, height: 20, child: Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 2))) : null,
              ),
            ),
            if (_provider == 'GENCOM' && _searchResults.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(top: 8),
                constraints: const BoxConstraints(maxHeight: 200),
                decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.05))),
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _searchResults.length,
                  itemBuilder: (context, index) {
                    final m = _searchResults[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundImage: m['logo_url'] != null ? NetworkImage(m['logo_url']) : null,
                        child: m['logo_url'] == null ? Text(m['business_name'][0]) : null,
                      ),
                      title: Text(m['business_name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      subtitle: Text(m['gencom_merchant_id'], style: const TextStyle(fontSize: 10, color: AppColors.green, fontWeight: FontWeight.bold)),
                      onTap: () {
                        setState(() {
                          _merchantController.text = m['gencom_merchant_id'];
                          _searchResults = [];
                        });
                      },
                    );
                  },
                ),
              ),
            if (_billType == 'PAYBILL') ...[
              const SizedBox(height: 20),
              TextField(
                controller: _accountController,
                decoration: const InputDecoration(hintText: 'Enter Account/Ref Number'),
              ),
            ],

            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(hintText: 'Amount', prefixText: _targetCurrency == 'USD' ? '\$ ' : ''),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                    decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.05))),
                    child: Center(child: Text(_targetCurrency, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12))),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            const Text('PAY FROM WALLET', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.softGrey)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.05))),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedWalletId,
                  isExpanded: true,
                  dropdownColor: AppColors.navy,
                  items: wallets.map((w) => DropdownMenuItem<String>(
                    value: w['id'],
                    child: Text('${w['currency']} Account (${w['balance']})', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  )).toList(),
                  onChanged: (val) => setState(() => _selectedWalletId = val),
                ),
              ),
            ),

            const SizedBox(height: 48),
            GenerexButton(
              text: 'Authorize Payment',
              isLoading: billProvider.isLoading,
              onPressed: _handlePayment,
            ),

            const SizedBox(height: 48),
            const Text('RECENT BILLS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey)),
            const SizedBox(height: 20),
            if (billProvider.history.isEmpty)
              const Center(child: Text('No payment history', style: TextStyle(color: AppColors.softGrey, fontSize: 12)))
            else
              ...billProvider.history.map((h) => _HistoryItem(h: h)).toList(),
          ],
        ),
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TypeChip({required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.green.withOpacity(0.1) : AppColors.cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.green : Colors.white.withOpacity(0.05)),
        ),
        child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1, color: isSelected ? AppColors.green : AppColors.softGrey)),
      ),
    );
  }
}

class _HistoryItem extends StatelessWidget {
  final dynamic h;
  const _HistoryItem({required this.h});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.cardBg, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.05))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('${h['provider']} - ${h['merchant_id']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(h['bill_type'], style: const TextStyle(fontSize: 9, color: AppColors.softGrey, fontWeight: FontWeight.bold)),
            ],
          ),
          Text('-${h['amount']} ${h['currency']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }
}
