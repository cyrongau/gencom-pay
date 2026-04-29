import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/providers/crypto_provider.dart';
import '../../../core/providers/wallet_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class CryptoScreen extends StatefulWidget {
  const CryptoScreen({super.key});

  @override
  State<CryptoScreen> createState() => _CryptoScreenState();
}

class _CryptoScreenState extends State<CryptoScreen> {
  String _selectedCurrency = 'BTC';
  String _selectedNetwork = 'MAINNET';
  String _activeTab = 'DEPOSIT'; // 'DEPOSIT' or 'WITHDRAW'
  
  final _withdrawAddressController = TextEditingController();
  final _withdrawAmountController = TextEditingController();
  final _mockAmountController = TextEditingController(text: '0.05');

  final List<Map<String, dynamic>> _assets = [
    {'name': 'Bitcoin', 'code': 'BTC', 'network': 'MAINNET', 'icon': Icons.currency_bitcoin_rounded, 'color': Colors.orange},
    {'name': 'Tether', 'code': 'USDT', 'network': 'ERC20', 'icon': Icons.payments_rounded, 'color': Colors.teal},
    {'name': 'Ethereum', 'code': 'ETH', 'network': 'ERC20', 'icon': Icons.hub_rounded, 'color': Colors.blue},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CryptoProvider>().fetchAddresses();
    });
  }

  void _onAssetSelected(Map<String, dynamic> asset) {
    setState(() {
      _selectedCurrency = asset['code'];
      _selectedNetwork = asset['network'];
    });
  }

  Future<void> _handleGenerate() async {
    final success = await context.read<CryptoProvider>().generateAddress(_selectedCurrency, _selectedNetwork);
    if (!success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to generate address')));
    }
  }

  Future<void> _handleMockDeposit() async {
    final success = await context.read<CryptoProvider>().simulateDeposit(_selectedCurrency, _mockAmountController.text);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mock deposit successful!'), backgroundColor: AppColors.green));
      context.read<WalletProvider>().fetchWallets();
    }
  }

  Future<void> _handleWithdraw() async {
    if (_withdrawAddressController.text.isEmpty || _withdrawAmountController.text.isEmpty) return;
    
    final result = await context.read<CryptoProvider>().withdraw(
      currency: _selectedCurrency,
      network: _selectedNetwork,
      amount: _withdrawAmountController.text,
      toAddress: _withdrawAddressController.text,
    );

    if (result != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Withdrawal initiated: ${result['transaction_id']}'), backgroundColor: AppColors.green));
      _withdrawAddressController.clear();
      _withdrawAmountController.clear();
      context.read<WalletProvider>().fetchWallets();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Withdrawal failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final crypto = context.watch<CryptoProvider>();
    final currentAddress = crypto.addresses.firstWhere(
      (a) => a['currency'] == _selectedCurrency && a['network'] == _selectedNetwork,
      orElse: () => null,
    );

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('CRYPTO ASSETS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Asset selector
            const Text('SELECT PROTOCOL', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 24),
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _assets.length,
                itemBuilder: (context, index) {
                  final asset = _assets[index];
                  final isSelected = _selectedCurrency == asset['code'];
                  return GestureDetector(
                    onTap: () => _onAssetSelected(asset),
                    child: Container(
                      width: 140,
                      margin: const EdgeInsets.only(right: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.blue.withOpacity(0.1) : AppColors.cardBg,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: isSelected ? AppColors.blue.withOpacity(0.3) : Colors.white.withOpacity(0.05)),
                      ),
                      child: Row(
                        children: [
                          Icon(asset['icon'], color: asset['color'], size: 24),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(asset['code'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                              Text(asset['network'], style: const TextStyle(color: AppColors.labelGrey, fontSize: 8, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 48),

            // Tabs
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(40),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Row(
                children: [
                  _TabButton(label: 'DEPOSIT', isActive: _activeTab == 'DEPOSIT', onTap: () => setState(() => _activeTab = 'DEPOSIT')),
                  _TabButton(label: 'WITHDRAW', isActive: _activeTab == 'WITHDRAW', onTap: () => setState(() => _activeTab = 'WITHDRAW')),
                ],
              ),
            ),

            const SizedBox(height: 48),

            if (_activeTab == 'DEPOSIT') ...[
              if (currentAddress != null) ...[
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(40),
                    ),
                    child: QrImageView(
                      data: currentAddress['address'],
                      version: QrVersions.auto,
                      size: 200.0,
                      eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppColors.navy),
                      dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: AppColors.navy),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                const Center(child: Text('YOUR DEPOSIT ADDRESS', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1))),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          currentAddress['address'],
                          style: const TextStyle(color: AppColors.blue, fontFamily: 'monospace', fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.content_copy_rounded, color: AppColors.labelGrey, size: 18),
                    ],
                  ),
                ),
              ] else ...[
                Center(
                  child: Column(
                    children: [
                      const SizedBox(height: 40),
                      Icon(Icons.account_balance_wallet_outlined, size: 64, color: AppColors.labelGrey.withOpacity(0.2)),
                      const SizedBox(height: 24),
                      const Text('NO ADDRESS GENERATED', style: TextStyle(color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 48),
                      GenerexButton(
                        text: 'GENERATE $_selectedCurrency ADDRESS',
                        isLoading: crypto.isGenerating,
                        onPressed: _handleGenerate,
                      ),
                    ],
                  ),
                ),
              ],
              
              const SizedBox(height: 64),
              // Simulation
              Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: AppColors.blue.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: AppColors.blue.withOpacity(0.1)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.science_outlined, color: AppColors.blue, size: 16),
                        SizedBox(width: 8),
                        Text('PROTOCOL SIMULATOR', style: TextStyle(color: AppColors.blue, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
                      ],
                    ),
                    const SizedBox(height: 24),
                    TextField(
                      controller: _mockAmountController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      decoration: AppTheme.inputDecoration('Amount to Simulate'),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _handleMockDeposit,
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.blue, foregroundColor: Colors.white),
                        child: const Text('EXECUTE MOCK DEPOSIT'),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Withdraw UI
              const Text('RECIPIENT ADDRESS', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              const SizedBox(height: 12),
              TextField(
                controller: _withdrawAddressController,
                style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
                decoration: AppTheme.inputDecoration('Enter $_selectedCurrency address'),
              ),
              const SizedBox(height: 32),
              const Text('AMOUNT TO SEND', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              const SizedBox(height: 12),
              TextField(
                controller: _withdrawAmountController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900),
                decoration: AppTheme.inputDecoration('0.00').copyWith(
                  suffixText: _selectedCurrency,
                  suffixStyle: const TextStyle(color: AppColors.labelGrey, fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 48),
              GenerexButton(
                text: 'AUTHORIZE WITHDRAWAL',
                onPressed: _handleWithdraw,
              ),
            ],

            const SizedBox(height: 64),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 14),
                  const SizedBox(width: 8),
                  Text(
                    'Ensure network matches: $_selectedNetwork',
                    style: const TextStyle(color: Colors.orange, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _TabButton({required this.label, required this.isActive, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isActive ? Colors.white.withOpacity(0.05) : Colors.transparent,
            borderRadius: BorderRadius.circular(40),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 10, 
                fontWeight: FontWeight.w900, 
                color: isActive ? Colors.white : AppColors.labelGrey,
                letterSpacing: 2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
