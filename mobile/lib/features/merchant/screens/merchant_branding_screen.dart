import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/providers/merchant_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';
import '../../../core/utils/url_util.dart';

class MerchantBrandingScreen extends StatefulWidget {
  const MerchantBrandingScreen({super.key});

  @override
  State<MerchantBrandingScreen> createState() => _MerchantBrandingScreenState();
}

class _MerchantBrandingScreenState extends State<MerchantBrandingScreen> {
  final _api = ApiService();
  final _businessNameController = TextEditingController();
  final _websiteController = TextEditingController();
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final merchant = context.read<MerchantProvider>().activeBusiness;
    if (merchant != null) {
      _businessNameController.text = merchant['business_name'] ?? '';
      _websiteController.text = merchant['website'] ?? '';
    }
  }

  Future<void> _pickLogo() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;

    setState(() => _isLoading = true);
    try {
      await _api.uploadFile('/merchant/branding/logo/upload', image.path);
      if (mounted) {
        await context.read<MerchantProvider>().fetchMyBusinesses();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Business logo updated!'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload logo: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleUpdate() async {
    if (_businessNameController.text.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await _api.patch('/merchant/profile', data: {
        'business_name': _businessNameController.text,
        'website': _websiteController.text,
      });
      if (mounted) {
        await context.read<MerchantProvider>().fetchMyBusinesses();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Branding updated!'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final merchant = context.watch<MerchantProvider>().activeBusiness;

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('MERCHANT BRANDING', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(40),
                        border: Border.all(color: Colors.white.withOpacity(0.1), width: 4),
                        image: DecorationImage(
                          image: NetworkImage(
                            UrlUtil.getImageUrl(merchant?['logo_url'], fallbackName: merchant?['business_name'] ?? 'Merchant')
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _pickLogo,
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.blue,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.navy, width: 4),
                          ),
                          child: const Icon(Icons.upload_file_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 56),
              TextField(
                controller: _businessNameController,
                style: const TextStyle(color: Colors.white),
                decoration: AppTheme.inputDecoration('Business Name'),
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _websiteController,
                style: const TextStyle(color: Colors.white, fontFamily: 'monospace'),
                decoration: AppTheme.inputDecoration('Official Website').copyWith(hintText: 'https://business.com'),
              ),
              const SizedBox(height: 56),
              GenerexButton(
                text: 'SAVE BRANDING PROFILE',
                isLoading: _isLoading,
                onPressed: _handleUpdate,
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.blue.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.blue.withOpacity(0.1)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: AppColors.blue, size: 20),
                    SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        'Your branding will be visible on all payment receipts and terminal sessions.',
                        style: TextStyle(color: AppColors.labelGrey, fontSize: 11, height: 1.5),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
