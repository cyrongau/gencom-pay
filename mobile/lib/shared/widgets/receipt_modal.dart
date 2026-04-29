import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:provider/provider.dart';
import 'dart:ui';
import '../../core/theme/app_theme.dart';
import '../../core/providers/system_provider.dart';
import '../../core/services/api_service.dart';

class ReceiptModal extends StatelessWidget {
  final dynamic transaction;

  const ReceiptModal({super.key, required this.transaction});

  static void show(BuildContext context, dynamic transaction) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ReceiptModal(transaction: transaction),
    );
  }

  Future<void> _generateAndShare(BuildContext context) async {
    final branding = context.read<SystemProvider>().branding;
    final appName = branding['APP_NAME'] ?? 'Gencom Pay';
    final logoUrl = branding['LOGO_LANDSCAPE'] != null && branding['LOGO_LANDSCAPE'].toString().isNotEmpty 
        ? '${ApiService.baseUrl}${branding['LOGO_LANDSCAPE']}' 
        : null;

    final doc = pw.Document();
    final isCredit = transaction['entry_type'] == 'CREDIT';
    final amount = double.tryParse(transaction['amount'].toString()) ?? 0.0;
    final currency = transaction['currency'] ?? 'USD';
    final date = transaction['created_at'].toString().split('T')[0];

    pw.ImageProvider? netImage;
    if (logoUrl != null) {
      try {
        netImage = await networkImage(logoUrl);
      } catch (e) {
        debugPrint('Failed to load logo for PDF: $e');
      }
    }

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Container(
                padding: const pw.EdgeInsets.all(24),
                decoration: pw.BoxDecoration(
                  color: PdfColor.fromHex('#0B1225'),
                  borderRadius: const pw.BorderRadius.all(pw.Radius.circular(12)),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        if (netImage != null)
                          pw.Image(netImage, height: 50)
                        else
                          pw.Text(appName.toUpperCase(), style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold, color: PdfColor.fromHex('#16C66E'))),
                        pw.SizedBox(height: 4),
                        pw.Text('UNIFIED PROTOCOL SETTLEMENT', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey)),
                      ],
                    ),
                    pw.Text('OFFICIAL RECEIPT', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold, color: PdfColors.white)),
                  ],
                ),
              ),
              pw.SizedBox(height: 60),
              pw.Center(
                child: pw.Column(
                  children: [
                    pw.Text('TOTAL AMOUNT SETTLED', style: pw.TextStyle(fontSize: 9, color: PdfColors.grey, letterSpacing: 2)),
                    pw.SizedBox(height: 12),
                    pw.Text('${isCredit ? '+' : '-'}${amount.toStringAsFixed(2)} $currency', style: pw.TextStyle(fontSize: 40, fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ),
              pw.SizedBox(height: 80),
              _buildPdfDetail('Transaction ID', transaction['transaction_id'].toString().toUpperCase()),
              _buildPdfDetail('Timestamp', date),
              _buildPdfDetail('Description', transaction['transaction']?['description'] ?? 'Funds Transfer'),
              _buildPdfDetail('Settlement Network', '$appName MAINNET / FINALIZED'),
              _buildPdfDetail('Status', 'SUCCESSFUL / SECURED'),
              pw.Spacer(),
              pw.Divider(),
              pw.SizedBox(height: 12),
              pw.Center(child: pw.Text('This receipt is a cryptographically secured proof of settlement.', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey))),
              pw.Center(child: pw.Text('Verified by $appName Institutional Protocol', style: pw.TextStyle(fontSize: 8, color: PdfColors.grey))),
            ],
          );
        },
      ),
    );

    await Printing.sharePdf(bytes: await doc.save(), filename: '${appName.replaceAll(' ', '_')}_Receipt_${transaction['transaction_id']}.pdf');
  }

  pw.Widget _buildPdfDetail(String label, String value) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(vertical: 12),
      child: pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label.toUpperCase(), style: pw.TextStyle(fontSize: 9, color: PdfColors.grey)),
          pw.Text(value, style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final branding = context.watch<SystemProvider>().branding;
    final appName = branding['APP_NAME'] ?? 'Generex';
    final logoSqUrl = branding['LOGO_SQUARE'] != null && branding['LOGO_SQUARE'].toString().isNotEmpty 
        ? '${ApiService.baseUrl}${branding['LOGO_SQUARE']}' 
        : null;

    final isCredit = transaction['entry_type'] == 'CREDIT';
    final glowColor = isCredit ? AppColors.green : AppColors.blue;
    final amountRaw = double.tryParse(transaction['amount'].toString()) ?? 0.0;
    final amountFormatted = amountRaw.toStringAsFixed(2);
    final currency = transaction['currency'] ?? 'USD';

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: AppColors.navy,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(44)),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(top: Radius.circular(44)),
        child: Stack(
          children: [
            // Background Glow
            Positioned(
              top: -100,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  width: 300,
                  height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        glowColor.withOpacity(0.15),
                        glowColor.withOpacity(0),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (logoSqUrl != null)
                        Image.network(logoSqUrl, height: 24, width: 24, fit: BoxFit.contain)
                      else
                        const Icon(Icons.verified_user_rounded, color: AppColors.green, size: 20),
                      const SizedBox(width: 12),
                      Text(
                        '${appName.toUpperCase()} SECURED',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.green, letterSpacing: 2),
                      ),
                    ],
                  ),
                  const SizedBox(height: 48),

                  // Amount
                  Column(
                    children: [
                      Text(
                        'SETTLED AMOUNT',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withOpacity(0.4), letterSpacing: 3),
                      ),
                      const SizedBox(height: 16),
                      FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '${isCredit ? '+' : '-'}$amountFormatted',
                              style: const TextStyle(fontSize: 56, fontWeight: FontWeight.w900, color: Colors.white, fontStyle: FontStyle.italic, letterSpacing: -2),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              currency,
                              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: glowColor, fontStyle: FontStyle.italic),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 56),

                  // Details
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: Colors.white.withOpacity(0.05)),
                      ),
                      child: Column(
                        children: [
                          _DetailRow(label: 'TRANSACTION ID', value: transaction['transaction_id'].toString().toUpperCase(), isMono: true),
                          const Divider(height: 32, color: Colors.white10),
                          _DetailRow(label: 'TIMESTAMP', value: transaction['created_at'].toString().split('T')[0]),
                          const Divider(height: 32, color: Colors.white10),
                          _DetailRow(label: 'DESCRIPTION', value: transaction['transaction']?['description'] ?? 'P2P Transfer'),
                          const Divider(height: 32, color: Colors.white10),
                          _DetailRow(label: 'NETWORK STATUS', value: 'FINALIZED'),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 48),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _generateAndShare(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.green,
                            foregroundColor: AppColors.navy,
                            padding: const EdgeInsets.symmetric(vertical: 20),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.share_rounded, size: 16),
                              SizedBox(width: 12),
                              Text('SHARE RECEIPT'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'CLOSE',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withOpacity(0.4), letterSpacing: 2),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isMono;

  const _DetailRow({required this.label, required this.value, this.isMono = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white.withOpacity(0.4), letterSpacing: 1),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 10, 
            fontWeight: FontWeight.w900, 
            color: Colors.white,
            fontFamily: isMono ? 'monospace' : null,
          ),
        ),
      ],
    );
  }
}
