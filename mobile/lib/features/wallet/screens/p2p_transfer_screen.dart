import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class P2PTransferScreen extends StatefulWidget {
  const P2PTransferScreen({super.key});

  @override
  State<P2PTransferScreen> createState() => _P2PTransferScreenState();
}

class _P2PTransferScreenState extends State<P2PTransferScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  bool _isLoading = false;
  String _selectedCurrency = 'USD';
  final ApiService _api = ApiService();
  final BiometricService _biometric = BiometricService();

  Future<void> _handleTransfer() async {
    if (!_formKey.currentState!.validate()) return;

    // 1. Biometric Authentication
    final authenticated = await _biometric.authenticate(
      localizedReason: 'Confirm P2P Transfer of ${_amountController.text} $_selectedCurrency',
    );

    if (!authenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Identity verification failed. Protocol aborted.')),
        );
      }
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.post('/wallets/p2p-transfer', data: {
        'recipientEmail': _emailController.text,
        'amount': _amountController.text,
        'currency': _selectedCurrency,
        'description': _descriptionController.text,
      });

      if (mounted) {
        context.read<WalletProvider>().fetchWallets();
        _showSuccessSheet();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Transfer Failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSuccessSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      isDismissible: false,
      enableDrag: false,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: AppColors.green, size: 80),
            const SizedBox(height: 32),
            const Text('FUNDS DISPERSED', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
            const SizedBox(height: 16),
            Text(
              'Successfully transferred ${_amountController.text} $_selectedCurrency to ${_emailController.text}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.softGrey, fontSize: 13, height: 1.6),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close sheet
                  Navigator.pop(context); // Return to wallet
                },
                child: const Text('RETURN TO WALLET'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        title: const Text('P2P TRANSFER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('RECIPIENT IDENTIFIER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.softGrey, letterSpacing: 2)),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                style: const TextStyle(color: Colors.white),
                decoration: AppTheme.inputDecoration('Email Address').copyWith(
                  prefixIcon: const Icon(Icons.alternate_email, color: AppColors.softGrey, size: 20),
                ),
                validator: (v) => v!.isEmpty ? 'Recipient email required' : null,
              ),
              
              const SizedBox(height: 40),
              const Text('SETTLEMENT AMOUNT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.softGrey, letterSpacing: 2)),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                decoration: AppTheme.inputDecoration('0.00').copyWith(
                  prefixIcon: const Icon(Icons.attach_money, color: AppColors.green, size: 24),
                ),
                validator: (v) => v!.isEmpty ? 'Amount required' : null,
              ),

              const SizedBox(height: 40),
              const Text('DESCRIPTION (OPTIONAL)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.softGrey, letterSpacing: 2)),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                style: const TextStyle(color: Colors.white),
                decoration: AppTheme.inputDecoration('What is this for?'),
              ),

              const SizedBox(height: 80),
              GenerexButton(
                text: 'Confirm & Disperse',
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
