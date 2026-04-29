import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/providers/merchant_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';

class MerchantTerminalsScreen extends StatefulWidget {
  const MerchantTerminalsScreen({super.key});

  @override
  State<MerchantTerminalsScreen> createState() => _MerchantTerminalsScreenState();
}

class _MerchantTerminalsScreenState extends State<MerchantTerminalsScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _terminals = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchTerminals();
  }

  Future<void> _fetchTerminals() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/merchant/terminals');
      setState(() => _terminals = res.data);
    } catch (e) {
      debugPrint('Failed to fetch terminals: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to sync terminals: $e'), backgroundColor: Colors.redAccent)
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showAddTerminalDialog() {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 32, right: 32, top: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('NEW TERMINAL', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 16),
            const Text('Provision a new payment point', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic)),
            const SizedBox(height: 32),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white),
              decoration: AppTheme.inputDecoration('Terminal Name').copyWith(
                hintText: 'e.g. Front Desk, Staff A',
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (controller.text.isEmpty) return;
                  try {
                    await _api.post('/merchant/terminals', data: {'name': controller.text});
                    if (mounted) {
                      Navigator.pop(context);
                      _fetchTerminals();
                    }
                  } catch (e) {
                    debugPrint('Failed to create terminal: $e');
                  }
                },
                child: const Text('CONFIRM PROVISIONING'),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  void _launchTerminalPOS(dynamic terminal) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      isScrollControlled: true,
      enableDrag: false,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
      builder: (context) => _TerminalPOS(terminal: terminal),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('TERMINAL FLEET', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppColors.green),
            onPressed: _showAddTerminalDialog,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchTerminals,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _terminals.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.sensors_off_rounded, size: 64, color: AppColors.softGrey.withOpacity(0.3)),
                          const SizedBox(height: 16),
                          const Text('No terminals provisioned', style: TextStyle(color: AppColors.softGrey, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(24),
                      itemCount: _terminals.length,
                      itemBuilder: (context, index) {
                        final terminal = _terminals[index];
                        return _TerminalCard(
                          terminal: terminal,
                          onTap: () => _launchTerminalPOS(terminal),
                        );
                      },
                    ),
        ),
      ),
    );
  }
}

class _TerminalCard extends StatelessWidget {
  final dynamic terminal;
  final VoidCallback onTap;

  const _TerminalCard({required this.terminal, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isActive = terminal['status'] == 'ACTIVE';
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.navy,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.point_of_sale_rounded, color: AppColors.green, size: 24),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: (isActive ? AppColors.green : Colors.redAccent).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  terminal['status'],
                  style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: isActive ? AppColors.green : Colors.redAccent, letterSpacing: 1),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(terminal['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic)),
                  const SizedBox(height: 4),
                  Text('ID: ${terminal['terminal_id']}', style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
                ],
              ),
              ElevatedButton(
                onPressed: onTap,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.green,
                  foregroundColor: AppColors.navy,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('LAUNCH', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TerminalPOS extends StatefulWidget {
  final dynamic terminal;
  const _TerminalPOS({required this.terminal});

  @override
  State<_TerminalPOS> createState() => _TerminalPOSState();
}

class _TerminalPOSState extends State<_TerminalPOS> {
  final ApiService _api = ApiService();
  final TextEditingController _amountController = TextEditingController();
  String _selectedCurrency = 'USD';
  dynamic _qrData;
  bool _isGenerating = false;

  Future<void> _generateQR() async {
    if (_amountController.text.isEmpty) return;
    setState(() => _isGenerating = true);
    try {
      final res = await _api.post('/merchant/terminals/${widget.terminal['id']}/collect', data: {
        'amount': _amountController.text,
        'currency': _selectedCurrency,
      });
      setState(() => _qrData = res.data);
    } catch (e) {
      debugPrint('Failed to generate QR: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to initiate protocol: $e'), backgroundColor: Colors.redAccent)
        );
      }
    } finally {
      setState(() => _isGenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 32, right: 32, top: 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.terminal['name'].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, fontStyle: FontStyle.italic)),
                  Text('ID: ${widget.terminal['terminal_id']}', style: const TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, color: AppColors.labelGrey)),
            ],
          ),
          const SizedBox(height: 48),
          if (_qrData == null) ...[
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                hintText: '0.00',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.1)),
                border: InputBorder.none,
                prefixText: _selectedCurrency == 'USD' ? '\$ ' : '',
                prefixStyle: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.green),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              children: ['USD', 'KSH', 'SLS'].map((c) => ChoiceChip(
                label: Text(c),
                selected: _selectedCurrency == c,
                onSelected: (val) => setState(() => _selectedCurrency = c),
                backgroundColor: AppColors.cardBg,
                selectedColor: AppColors.green.withOpacity(0.2),
                labelStyle: TextStyle(color: _selectedCurrency == c ? AppColors.green : Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
              )).toList(),
            ),
            const SizedBox(height: 48),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isGenerating ? null : _generateQR,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 20)),
                child: _isGenerating 
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('GENERATE PAYMENT INTENT'),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(40),
              ),
              child: QrImageView(
                data: _qrData['qr_data'],
                version: QrVersions.auto,
                size: 200.0,
                eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: AppColors.navy),
                dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: AppColors.navy),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'AWAITING AUTHORIZATION',
              style: TextStyle(color: AppColors.green, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2),
            ),
            const SizedBox(height: 8),
            Text(
              '${_amountController.text} $_selectedCurrency',
              style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic),
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: () => setState(() => _qrData = null),
              child: const Text('CANCEL INTENT', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 11)),
            ),
          ],
          const SizedBox(height: 48),
        ],
      ),
    );
  }
}
