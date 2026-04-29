import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/api_service.dart';
import '../../../shared/widgets/generex_button.dart';

class MerchantKYCScreen extends StatefulWidget {
  const MerchantKYCScreen({super.key});

  @override
  State<MerchantKYCScreen> createState() => _MerchantKYCScreenState();
}

class _MerchantKYCScreenState extends State<MerchantKYCScreen> {
  final _api = ApiService();
  final _businessNameController = TextEditingController();
  final _taxIdController = TextEditingController();
  final _registrationNumberController = TextEditingController();
  
  String? _documentUrl;
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickDocument() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (image == null) return;

    setState(() => _isLoading = true);
    try {
      final response = await _api.uploadFile('/merchant/kyc/upload', image.path);
      setState(() {
        _documentUrl = response.data['url'];
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Document uploaded and indexed'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Upload failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSubmit() async {
    if (_businessNameController.text.isEmpty || _documentUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all fields and upload a document')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _api.post('/merchant/kyc', data: {
        'businessName': _businessNameController.text,
        'taxId': _taxIdController.text,
        'registrationNumber': _registrationNumberController.text,
        'documentUrl': _documentUrl,
      });
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('KYC Submitted for Review'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Submission failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('MERCHANT VERIFICATION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('IDENTITY AUDIT', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 32),
            
            GestureDetector(
              onTap: _isLoading ? null : _pickDocument,
              child: Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(
                    color: _documentUrl != null ? AppColors.green : Colors.white.withOpacity(0.05),
                    width: 2,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_isLoading && _documentUrl == null)
                      const CircularProgressIndicator(color: AppColors.green)
                    else if (_documentUrl != null) ...[
                      const Icon(Icons.check_circle_outline_rounded, size: 48, color: AppColors.green),
                      const SizedBox(height: 16),
                      const Text('DOCUMENT INDEXED', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.green, letterSpacing: 1)),
                    ] else ...[
                      const Icon(Icons.cloud_upload_outlined, size: 48, color: AppColors.blue),
                      const SizedBox(height: 16),
                      const Text('UPLOAD REGISTRATION DOCS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.labelGrey, letterSpacing: 1)),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 48),

            TextField(
              controller: _businessNameController,
              style: const TextStyle(color: Colors.white),
              decoration: AppTheme.inputDecoration('Legal Business Name'),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _registrationNumberController,
              style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
              decoration: AppTheme.inputDecoration('Registration Number'),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _taxIdController,
              style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
              decoration: AppTheme.inputDecoration('Tax Identification (PIN)'),
            ),

            const SizedBox(height: 64),

            GenerexButton(
              text: 'SUBMIT FOR COMPLIANCE',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
            ),
            const SizedBox(height: 24),
            const Center(
              child: Text(
                'Approval typically takes 24-48 business hours.',
                style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
