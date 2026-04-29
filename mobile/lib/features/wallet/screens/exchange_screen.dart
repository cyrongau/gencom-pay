import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class ExchangeScreen extends StatefulWidget {
  const ExchangeScreen({super.key});

  @override
  State<ExchangeScreen> createState() => _ExchangeScreenState();
}

class _ExchangeScreenState extends State<ExchangeScreen> {
  final _amountController = TextEditingController();
  final _api = ApiService();
  
  String? _fromWalletId;
  String? _toWalletId;
  double _currentRate = 0.0;
  String _estimatedAmount = '0.00';
  bool _isLoading = false;
  bool _isCalculating = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final wallets = context.read<WalletProvider>().wallets;
      if (wallets.length >= 2) {
        setState(() {
          _fromWalletId = wallets[0]['id'];
          _toWalletId = wallets[1]['id'];
        });
        _updateEstimation();
      } else if (wallets.isNotEmpty) {
        setState(() => _fromWalletId = wallets[0]['id']);
      }
    });

    _amountController.addListener(_updateEstimation);
  }

  Future<void> _updateEstimation() async {
    if (_amountController.text.isEmpty || _fromWalletId == null || _toWalletId == null) {
      setState(() {
        _estimatedAmount = '0.00';
        _currentRate = 0.0;
      });
      return;
    }

    final wallets = context.read<WalletProvider>().wallets;
    final fromCurrency = wallets.firstWhere((w) => w['id'] == _fromWalletId)['currency'];
    final toCurrency = wallets.firstWhere((w) => w['id'] == _toWalletId)['currency'];

    if (fromCurrency == toCurrency) {
      setState(() {
        _estimatedAmount = _amountController.text;
        _currentRate = 1.0;
      });
      return;
    }

    setState(() => _isCalculating = true);
    
    // Pre-emptive local calculation for instant feedback
    if (_currentRate > 0) {
      _estimatedAmount = (double.parse(_amountController.text) * _currentRate).toStringAsFixed(2);
    }

    try {
      final response = await _api.get('/exchange/convert', queryParameters: {
        'amount': _amountController.text,
        'from': fromCurrency,
        'to': toCurrency,
      });
      
      if (mounted) {
        setState(() {
          _estimatedAmount = response.data['amount'].toString();
          _currentRate = double.parse(response.data['rate'].toString());
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          // If API fails, keep the local estimate or use a default spread
          _estimatedAmount = (double.parse(_amountController.text) * (_currentRate > 0 ? _currentRate : 0.98)).toStringAsFixed(2);
        });
      }
    } finally {
      if (mounted) setState(() => _isCalculating = false);
    }
  }

  Future<void> _handleExchange() async {
    if (_amountController.text.isEmpty || _fromWalletId == null || _toWalletId == null) return;
    
    setState(() => _isLoading = true);
    try {
      await _api.post('/transactions/exchange', data: {
        'fromWalletId': _fromWalletId,
        'toWalletId': _toWalletId,
        'amount': _amountController.text,
      });
      
      if (mounted) {
        context.read<WalletProvider>().fetchWallets();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Exchange Successful'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Exchange Failed: $e')),
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
        title: const Text('EXCHANGE', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            // Exchange Card
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(40),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                children: [
                  _WalletSelector(
                    label: 'YOU PAY',
                    selectedId: _fromWalletId,
                    wallets: wallets,
                    controller: _amountController,
                    onChanged: (v) {
                      setState(() => _fromWalletId = v);
                      _updateEstimation();
                    },
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.blue.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.swap_vert_rounded, color: AppColors.blue),
                  ),
                  const SizedBox(height: 24),
                  _WalletSelector(
                    label: 'YOU GET (EST.)',
                    selectedId: _toWalletId,
                    wallets: wallets,
                    isReadOnly: true,
                    controller: TextEditingController(text: _estimatedAmount),
                    onChanged: (v) {
                      setState(() => _toWalletId = v);
                      _updateEstimation();
                    },
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 48),
            
            // Stats
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _StatItem(
                  label: 'EXCHANGE RATE', 
                  value: _currentRate > 0 ? '1 : ${_currentRate.toStringAsFixed(4)}' : 'UPDATING...',
                ),
                const _StatItem(label: 'FEE', value: '0.15%'),
              ],
            ),
            
            const SizedBox(height: 64),
            
            GenerexButton(
              text: 'CONVERT NOW',
              isLoading: _isLoading,
              onPressed: _handleExchange,
            ),
          ],
        ),
      ),
    );
  }
}

class _WalletSelector extends StatelessWidget {
  final String label;
  final String? selectedId;
  final List<dynamic> wallets;
  final TextEditingController controller;
  final bool isReadOnly;
  final ValueChanged<String?> onChanged;

  const _WalletSelector({
    required this.label, 
    required this.selectedId, 
    required this.wallets,
    required this.controller, 
    this.isReadOnly = false,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selectedWallet = wallets.firstWhere((w) => w['id'] == selectedId, orElse: () => null);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelSmall),
            if (selectedWallet != null)
              Text(
                'BAL: ${selectedWallet['balance']} ${selectedWallet['currency']}',
                style: const TextStyle(fontSize: 8, color: AppColors.green, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                readOnly: isReadOnly,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic, letterSpacing: -1),
                decoration: const InputDecoration(
                  border: InputBorder.none, 
                  contentPadding: EdgeInsets.zero, 
                  hintText: '0.00', 
                  hintStyle: TextStyle(color: Colors.white10)
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: selectedId,
                  dropdownColor: AppColors.cardBg,
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.labelGrey, size: 16),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13),
                  items: wallets.map((w) => DropdownMenuItem<String>(
                    value: w['id'],
                    child: Text(w['currency']),
                  )).toList(),
                  onChanged: onChanged,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.w900, letterSpacing: 1)),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
      ],
    );
  }
}
