import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/theme/app_theme.dart';
import 'payment_authorization_screen.dart';

class ScanToPayScreen extends StatefulWidget {
  const ScanToPayScreen({super.key});

  @override
  State<ScanToPayScreen> createState() => _ScanToPayScreenState();
}

class _ScanToPayScreenState extends State<ScanToPayScreen> {
  bool _isScanned = false;

  void _onDetect(BarcodeCapture capture) {
    if (_isScanned) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        setState(() => _isScanned = true);
        try {
          final data = jsonDecode(barcode.rawValue!);
          if (data['type'] == 'MERCHANT_PAYMENT' || data['type'] == 'MERCHANT_STATIC') {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (_) => PaymentAuthorizationScreen(data: data),
              ),
            );
          }
        } catch (e) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Invalid QR Protocol')),
          );
          setState(() => _isScanned = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SCAN TO PAY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Stack(
        children: [
          MobileScanner(
            onDetect: _onDetect,
          ),
          
          // Overlay UI
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.green, width: 2),
                borderRadius: BorderRadius.circular(32),
              ),
            ),
          ),
          
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Column(
              children: [
                const Icon(Icons.qr_code_scanner, color: Colors.white, size: 48),
                const SizedBox(height: 16),
                const Text(
                  'ALIGINING WITH MERCHANT TERMINAL',
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 2, color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  'Point camera at the terminal QR code',
                  style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.6)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
