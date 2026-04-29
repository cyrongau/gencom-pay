import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';
import '../../../shared/widgets/receipt_modal.dart';

class PaymentAuthorizationScreen extends StatefulWidget {
  final Map<String, dynamic> data;
  const PaymentAuthorizationScreen({super.key, required this.data});

  @override
  State<PaymentAuthorizationScreen> createState() => _PaymentAuthorizationScreenState();
}

class _PaymentAuthorizationScreenState extends State<PaymentAuthorizationScreen> {
  bool _isLoading = false;
  final ApiService _api = ApiService();
  final BiometricService _biometric = BiometricService();
  final TextEditingController _amountController = TextEditingController();
  dynamic _transactionResult; // Add this to store the result
  String _selectedCurrency = 'USD';
  bool _isStatic = false;

  @override
  void initState() {
    super.initState();
    _isStatic = widget.data['type'] == 'MERCHANT_STATIC';
    if (!_isStatic) {
      _amountController.text = widget.data['amount']?.toString() ?? '';
      _selectedCurrency = widget.data['currency'] ?? 'USD';
    }
  }

  Future<void> _handleAuthorization() async {
    final amount = _amountController.text;
    if (amount.isEmpty || double.tryParse(amount) == 0) return;

    // 1. Biometric Authentication Protocol
    final authenticated = await _biometric.authenticate(
      localizedReason: 'Authorize payment of $amount $_selectedCurrency',
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
      final response = await _api.post('/merchant/authorize-payment', data: {
        'intentId': widget.data['intentId'],
        'amount': amount,
        'currency': _selectedCurrency,
        'merchantId': widget.data['merchantId'],
      });
      
      _transactionResult = response.data; // Store the transaction result
      
      if (mounted) {
        context.read<WalletProvider>().fetchWallets();
        showModalBottomSheet(
          context: context,
          backgroundColor: AppColors.navy,
          isDismissible: false,
          enableDrag: false,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
          builder: (context) => _SuccessSheet(transaction: _transactionResult),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Authorization Failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
          child: Column(
            children: [
              const SizedBox(height: 16),
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.green.withOpacity(0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.green.withOpacity(0.2)),
                ),
                child: const Icon(Icons.verified_user, color: AppColors.green, size: 32),
              ),
              const SizedBox(height: 24),
              const Text('PAYMENT AUTHORIZATION', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: AppColors.softGrey)),
              const SizedBox(height: 32),
              
              // Merchant Info
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Column(
                  children: [
                    const Text('TRANSFERRING TO', style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppColors.softGrey)),
                    const SizedBox(height: 8),
                    Text(
                      widget.data['businessName']?.toString().toUpperCase() ?? 'MERCHANT ACCOUNT',
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'ID: ${widget.data['gencomMerchantId'] ?? widget.data['merchantId'].toString().substring(0, 8).toUpperCase()}',
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.softGrey, letterSpacing: 1),
                    ),
                    const SizedBox(height: 24),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 24),
                    if (_isStatic) ...[
                      const Text('ENTER AMOUNT', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.softGrey)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _amountController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: Colors.white),
                        decoration: InputDecoration(
                          hintText: '0.00',
                          hintStyle: TextStyle(color: Colors.white.withOpacity(0.1)),
                          border: InputBorder.none,
                          suffixIcon: Container(
                            padding: const EdgeInsets.only(left: 12),
                            child: DropdownButton<String>(
                              value: _selectedCurrency,
                              dropdownColor: AppColors.cardBg,
                              underline: Container(),
                              items: ['USD', 'KSH', 'SLS'].map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.green)))).toList(),
                              onChanged: (v) => setState(() => _selectedCurrency = v!),
                            ),
                          ),
                        ),
                      ),
                    ] else ...[
                      Text(
                        '${widget.data['amount']} ${widget.data['currency']}',
                        style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: Colors.white),
                      ),
                    ],
                    const SizedBox(height: 8),
                    const Text('Unified Protocol Settlement', style: TextStyle(fontSize: 9, color: AppColors.softGrey, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              const Text(
                'By authorizing, you agree to the instant settlement of this transaction. This action cannot be reversed.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 9, color: AppColors.softGrey, height: 1.5),
              ),
              const SizedBox(height: 24),
              
              GenerexButton(
                text: 'Confirm & Authorize',
                isLoading: _isLoading,
                onPressed: _handleAuthorization,
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('CANCEL PROTOCOL', style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SuccessSheet extends StatelessWidget {
  final dynamic transaction;
  const _SuccessSheet({this.transaction});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: AppColors.green, size: 80),
          const SizedBox(height: 32),
          const Text('PROTOCOL SUCCESS', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
          const SizedBox(height: 16),
          const Text(
            'Your payment has been successfully settled and the merchant has been notified via secure webhook.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.softGrey, fontSize: 13, height: 1.6),
          ),
          const SizedBox(height: 48),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () {
                if (transaction != null) {
                  // Map API Transaction object to ReceiptModal format
                  final receiptData = {
                    'transaction_id': transaction['id'],
                    'amount': transaction['metadata']?['amount'] ?? transaction['amount'],
                    'currency': transaction['metadata']?['currency'] ?? transaction['currency'] ?? 'USD',
                    'created_at': transaction['created_at'],
                    'entry_type': 'DEBIT',
                    'transaction': {
                      'description': transaction['description'] ?? 'Merchant Payment'
                    }
                  };
                  ReceiptModal.show(context, receiptData);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white.withOpacity(0.05),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('VIEW DIGITAL RECEIPT', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 2)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('RETURN TO DASHBOARD'),
            ),
          ),
        ],
      ),
    );
  }
}
