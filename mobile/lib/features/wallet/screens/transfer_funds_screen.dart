import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class TransferFundsScreen extends StatefulWidget {
  const TransferFundsScreen({super.key});

  @override
  State<TransferFundsScreen> createState() => _TransferFundsScreenState();
}

class _TransferFundsScreenState extends State<TransferFundsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _api = ApiService();
  final _biometric = BiometricService();
  
  String? _fromWalletId;
  String _transferType = 'WALLET_ID'; // 'EMAIL' or 'WALLET_ID'
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final wallets = context.read<WalletProvider>().wallets;
      if (wallets.isNotEmpty) {
        setState(() => _fromWalletId = wallets[0]['id']);
      }
    });
  }

  Future<void> _handleTransfer() async {
    if (!_formKey.currentState!.validate() || _fromWalletId == null) return;

    final wallets = context.read<WalletProvider>().wallets;
    final sourceWallet = wallets.firstWhere((w) => w['id'] == _fromWalletId);

    // 1. Biometric Authentication
    final authenticated = await _biometric.authenticate(
      localizedReason: 'Confirm transfer of ${_amountController.text} ${sourceWallet['currency']}',
    );

    if (!authenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Identity verification failed. Transfer cancelled.')),
        );
      }
      return;
    }

    setState(() => _isLoading = true);
    try {
      if (_transferType == 'WALLET_ID') {
        await _api.post('/wallets/transfer', data: {
          'fromWalletId': _fromWalletId,
          'toWalletId': _recipientController.text,
          'amount': _amountController.text,
          'description': _descriptionController.text.isEmpty ? 'P2P Transfer' : _descriptionController.text,
        });
      } else {
        await _api.post('/wallets/p2p-transfer', data: {
          'recipientEmail': _recipientController.text,
          'amount': _amountController.text,
          'currency': sourceWallet['currency'],
          'description': _descriptionController.text.isEmpty ? 'P2P Email Transfer' : _descriptionController.text,
        });
      }
      
      if (mounted) {
        context.read<WalletProvider>().fetchWallets();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transfer Successful'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Transfer Failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final wallets = context.watch<WalletProvider>().wallets;

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('SEND FUNDS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Transfer Type Toggle (Pill style)
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Row(
                  children: [
                    _TypeToggle(
                      label: 'WALLET ID', 
                      isActive: _transferType == 'WALLET_ID',
                      onTap: () => setState(() => _transferType = 'WALLET_ID'),
                    ),
                    _TypeToggle(
                      label: 'EMAIL', 
                      isActive: _transferType == 'EMAIL',
                      onTap: () => setState(() => _transferType = 'EMAIL'),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 48),

              Text('SEND FROM', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _fromWalletId,
                    isExpanded: true,
                    dropdownColor: AppColors.cardBg,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
                    items: wallets.map((w) => DropdownMenuItem<String>(
                      value: w['id'],
                      child: Text('${w['currency']} WALLET — ${w['balance']}'),
                    )).toList(),
                    onChanged: (v) => setState(() => _fromWalletId = v),
                  ),
                ),
              ),
              
              const SizedBox(height: 40),
              
              Text(
                _transferType == 'WALLET_ID' ? 'RECIPIENT WALLET ID' : 'RECIPIENT EMAIL',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _recipientController,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontStyle: FontStyle.italic),
                decoration: AppTheme.inputDecoration(_transferType == 'WALLET_ID' ? 'Recipient ID' : 'Recipient Email'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              
              const SizedBox(height: 40),
              
              Text('AMOUNT TO TRANSFER', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 12),
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic, letterSpacing: -1),
                decoration: AppTheme.inputDecoration('0.00'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),

              const SizedBox(height: 40),
              
              Text('MESSAGE (OPTIONAL)', style: Theme.of(context).textTheme.labelSmall),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                decoration: AppTheme.inputDecoration('Add a note'),
              ),
              
              const SizedBox(height: 64),
              
              GenerexButton(
                text: 'SEND FUNDS',
                isLoading: _isLoading,
                onPressed: _handleTransfer,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TypeToggle extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _TypeToggle({required this.label, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            gradient: isActive ? AppGradients.signature : null,
            borderRadius: BorderRadius.circular(40),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 10, 
                fontWeight: FontWeight.w900, 
                color: isActive ? AppColors.navy : AppColors.labelGrey,
                letterSpacing: 1.5,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
