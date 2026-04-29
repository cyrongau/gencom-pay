import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/url_util.dart';
import '../../../shared/widgets/generex_button.dart';

class QuickTransferModal extends StatefulWidget {
  final Map<String, dynamic> recipient;
  
  const QuickTransferModal({super.key, required this.recipient});

  static Future<void> show(BuildContext context, Map<String, dynamic> recipient) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
      ),
      builder: (context) => QuickTransferModal(recipient: recipient),
    );
  }

  @override
  State<QuickTransferModal> createState() => _QuickTransferModalState();
}

class _QuickTransferModalState extends State<QuickTransferModal> {
  final _amountController = TextEditingController();
  final _api = ApiService();
  final _biometric = BiometricService();
  bool _isLoading = false;

  Future<void> _handleTransfer() async {
    final amount = _amountController.text;
    if (amount.isEmpty || double.tryParse(amount) == 0) return;

    final wallets = context.read<WalletProvider>().wallets;
    if (wallets.isEmpty) return;
    
    final fromWallet = wallets[0]; // Default to primary

    // 1. Biometric Authentication
    final authenticated = await _biometric.authenticate(
      localizedReason: 'Authorize quick transfer of $amount ${fromWallet['currency']} to ${widget.recipient['name']}',
    );

    if (!authenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Identity verification failed.')),
        );
      }
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.post('/wallets/transfer', data: {
        'fromWalletId': fromWallet['id'],
        'toWalletId': widget.recipient['wallet_id'],
        'amount': amount,
        'description': 'Quick Transfer to ${widget.recipient['name']}',
      });
      
      if (mounted) {
        context.read<WalletProvider>().fetchWallets();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sent $amount ${fromWallet['currency']} to ${widget.recipient['name']}'),
            backgroundColor: AppColors.green,
          ),
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
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 32,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),
          
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Recipient Info (Ultra Compact)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: widget.recipient['avatar_url'] != null && widget.recipient['avatar_url'].toString().isNotEmpty
                            ? CachedNetworkImage(
                                imageUrl: UrlUtil.getImageUrl(widget.recipient['avatar_url']),
                                fit: BoxFit.cover,
                                placeholder: (context, url) => const Center(child: SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 2))),
                                errorWidget: (context, url, error) => Center(child: Text(widget.recipient['name'][0].toUpperCase(), style: const TextStyle(color: AppColors.green, fontWeight: FontWeight.bold, fontSize: 10))),
                              )
                            : Center(child: Text(widget.recipient['name'][0].toUpperCase(), style: const TextStyle(color: AppColors.green, fontWeight: FontWeight.bold, fontSize: 10))),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('TARGET NODE', 
                                style: TextStyle(fontSize: 6, fontWeight: FontWeight.w900, color: AppColors.softGrey, letterSpacing: 1.5)),
                              Text(widget.recipient['name'], 
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Amount Input (Minimal)
                  const Text('SET VOLUME', 
                    style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.softGrey, letterSpacing: 2)),
                  TextField(
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textAlign: TextAlign.center,
                    autofocus: true,
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic),
                    decoration: InputDecoration(
                      hintText: '0.00',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.05)),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      prefixText: '\$ ',
                      prefixStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white24, fontStyle: FontStyle.italic),
                      contentPadding: const EdgeInsets.symmetric(vertical: 4),
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  GenerexButton(
                    text: 'AUTHORIZE SETTLEMENT',
                    isLoading: _isLoading,
                    onPressed: _handleTransfer,
                  ),
                  
                  const SizedBox(height: 8),
                  const Text(
                    'Instant Settlement Protocol',
                    style: TextStyle(fontSize: 7, color: Colors.white24, fontWeight: FontWeight.bold, letterSpacing: 1),
                  ),
                  const SizedBox(height: 16), // Bottom breathing room
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
