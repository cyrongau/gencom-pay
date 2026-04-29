import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/providers/transaction_provider.dart';
import '../../../shared/widgets/generex_button.dart';

class DepositFundsScreen extends StatefulWidget {
  const DepositFundsScreen({super.key});

  @override
  State<DepositFundsScreen> createState() => _DepositFundsScreenState();
}

class _DepositFundsScreenState extends State<DepositFundsScreen> {
  final _amountController = TextEditingController();
  final _phoneController = TextEditingController();
  String _selectedMethod = 'MOBILE'; // 'MOBILE', 'BANK', or 'CRYPTO'
  String _selectedProvider = 'ZAAD';
  String _selectedCurrency = 'USD';
  String _selectedCrypto = 'BTC';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('ADD FUNDS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'AMOUNT TO DEPOSIT',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.labelGrey),
                ),
                if (_selectedMethod == 'MOBILE')
                  Row(
                    children: ['USD', 'SLS', 'KSH'].where((c) {
                      if (_selectedProvider == 'M-Pesa') return c == 'KSH' || c == 'USD';
                      return c == 'USD' || c == 'SLS';
                    }).map((c) => Padding(
                      padding: const EdgeInsets.only(left: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedCurrency = c),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _selectedCurrency == c ? AppColors.green : AppColors.cardBg,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: _selectedCurrency == c ? AppColors.green : Colors.white.withOpacity(0.05)),
                          ),
                          child: Text(c, style: TextStyle(color: _selectedCurrency == c ? AppColors.navy : Colors.white, fontSize: 9, fontWeight: FontWeight.w900)),
                        ),
                      ),
                    )).toList(),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
              decoration: AppTheme.inputDecoration('0.00').copyWith(
                prefixText: _selectedCurrency == 'USD' ? r'$ ' : _selectedCurrency == 'KSH' ? 'Ksh ' : 'S ',
                prefixStyle: const TextStyle(color: AppColors.green, fontSize: 24, fontWeight: FontWeight.w900),
              ),
            ),
            
            const SizedBox(height: 48),
            
            const Text(
              'PAYMENT METHOD',
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.labelGrey),
            ),
            const SizedBox(height: 16),
            
            _MethodItem(
              icon: Icons.smartphone_rounded,
              title: 'Mobile Money',
              subtitle: 'Pay with Mobile Money',
              isActive: _selectedMethod == 'MOBILE',
              onTap: () => setState(() => _selectedMethod = 'MOBILE'),
            ),
            _MethodItem(
              icon: Icons.account_balance_rounded,
              title: 'Bank Transfer',
              subtitle: 'Bank Wire Transfer',
              isActive: _selectedMethod == 'BANK',
              onTap: () => setState(() => _selectedMethod = 'BANK'),
            ),
            _MethodItem(
              icon: Icons.currency_bitcoin_rounded,
              title: 'Crypto Deposit',
              subtitle: 'Send Cryptocurrency',
              isActive: _selectedMethod == 'CRYPTO',
              onTap: () => setState(() => _selectedMethod = 'CRYPTO'),
            ),
            
            const SizedBox(height: 32),

            if (_selectedMethod == 'MOBILE') ...[
              const Text('SELECT PROVIDER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.labelGrey)),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                children: ['ZAAD', 'eDahab', 'Sahal', 'M-Pesa'].map((p) => ChoiceChip(
                  label: Text(p),
                  selected: _selectedProvider == p,
                  onSelected: (val) => setState(() {
                    _selectedProvider = p;
                    if (p == 'M-Pesa') _selectedCurrency = 'KSH';
                    else _selectedCurrency = 'USD';
                  }),
                  backgroundColor: AppColors.cardBg,
                  selectedColor: AppColors.green.withOpacity(0.2),
                  labelStyle: TextStyle(color: _selectedProvider == p ? AppColors.green : Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                )).toList(),
              ),
              const SizedBox(height: 32),
              const Text('MOBILE NUMBER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.labelGrey)),
              const SizedBox(height: 12),
              TextField(controller: _phoneController, keyboardType: TextInputType.phone, decoration: AppTheme.inputDecoration('+252 ••• ••• •••')),
            ] else if (_selectedMethod == 'BANK') ...[
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Column(
                  children: [
                    _InstructionLine(label: 'BENEFICIARY', value: 'Generex Financial Ltd'),
                    _InstructionLine(label: 'SWIFT / BIC', value: 'GENX SO 22 XXX'),
                    _InstructionLine(label: 'ACCOUNT', value: '1000 4920 1120 8491'),
                    _InstructionLine(label: 'REFERENCE', value: 'GEN-${user?['id']?.toString().substring(0, 8).toUpperCase() ?? 'REF'}'),
                  ],
                ),
              ),
            ] else if (_selectedMethod == 'CRYPTO') ...[
              const Text('SELECT ASSET', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.labelGrey)),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                children: ['BTC', 'ETH', 'USDT'].map((c) => ChoiceChip(
                  label: Text(c),
                  selected: _selectedCrypto == c,
                  onSelected: (val) => setState(() => _selectedCrypto = c),
                  backgroundColor: AppColors.cardBg,
                  selectedColor: AppColors.blue.withOpacity(0.2),
                  labelStyle: TextStyle(color: _selectedCrypto == c ? AppColors.blue : Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                )).toList(),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Column(
                  children: [
                    const Text('YOUR WALLET ADDRESS', style: TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.w900, letterSpacing: 1)),
                    const SizedBox(height: 16),
                    SelectableText(
                      _selectedCrypto == 'BTC' ? 'bc1qxy2kgdy...z7' : '0x71C765...f4',
                      style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                    const SizedBox(height: 16),
                    const Icon(Icons.qr_code_2_rounded, color: Colors.white, size: 100),
                  ],
                ),
              ),
            ],
            
            const SizedBox(height: 64),
            
            GenerexButton(
              text: _selectedMethod == 'BANK' ? 'I HAVE SENT FUNDS' : 'CONFIRM ${_amountController.text.isNotEmpty ? (_selectedCurrency == 'USD' ? '\$' : _selectedCurrency == 'KSH' ? 'Ksh ' : 'S ') + _amountController.text : ''} DEPOSIT',
              isLoading: _isLoading,
              onPressed: () async {
                if (_amountController.text.isEmpty) return;
                
                setState(() => _isLoading = true);
                
                final success = await context.read<TransactionProvider>().simulateDeposit(
                  amount: _amountController.text,
                  method: _selectedMethod,
                  provider: _selectedMethod == 'MOBILE' ? _selectedProvider : (_selectedMethod == 'BANK' ? 'WIRE' : _selectedCrypto),
                  phone: _phoneController.text,
                  currency: _selectedCurrency,
                );

                if (mounted) {
                  setState(() => _isLoading = false);
                  if (success) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Deposit of ${_amountController.text} $_selectedCurrency initiated'),
                        backgroundColor: AppColors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Deposit failed. Please try again.'),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MethodItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isActive;
  final VoidCallback onTap;

  const _MethodItem({required this.icon, required this.title, required this.subtitle, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isActive ? AppColors.green : Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Icon(icon, color: isActive ? AppColors.green : AppColors.labelGrey),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: isActive ? Colors.white : AppColors.labelGrey, fontWeight: FontWeight.w900, fontSize: 13)),
                Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
              ],
            ),
            const Spacer(),
            if (isActive) const Icon(Icons.check_circle_rounded, color: AppColors.green, size: 20),
          ],
        ),
      ),
    );
  }
}

class _InstructionLine extends StatelessWidget {
  final String label;
  final String value;

  const _InstructionLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.w900, letterSpacing: 1)),
          Text(value, style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        ],
      ),
    );
  }
}
