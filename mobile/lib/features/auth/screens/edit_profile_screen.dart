import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _api = ApiService();
  final _nameController = TextEditingController();
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _nameController.text = user['full_name'] ?? '';
    }
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image == null) return;

    setState(() => _isLoading = true);
    try {
      await _api.uploadFile('/user/profile/avatar/upload', image.path);
      if (mounted) {
        await context.read<AuthProvider>().fetchProfile();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Avatar updated successfully!'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload image: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleUpdate() async {
    if (_nameController.text.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await _api.patch('/user/profile', data: {'full_name': _nameController.text});
      if (mounted) {
        await context.read<AuthProvider>().fetchProfile();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!'), backgroundColor: AppColors.green),
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
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('EDIT IDENTITY', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        color: AppColors.cardBg,
                        borderRadius: BorderRadius.circular(48),
                        border: Border.all(color: Colors.white.withOpacity(0.1), width: 4),
                        image: DecorationImage(
                          image: NetworkImage(
                            (user?['avatar_url'] != null && user!['avatar_url'].toString().isNotEmpty)
                              ? (user!['avatar_url'].toString().startsWith('/') 
                                  ? '${ApiService.baseUrl}${user!['avatar_url']}' 
                                  : user!['avatar_url'])
                              : "https://ui-avatars.com/api/?name=${user?['full_name'] ?? 'User'}&background=16C66E&color=fff"
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.green,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.navy, width: 4),
                          ),
                          child: const Icon(Icons.camera_alt_rounded, color: AppColors.navy, size: 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 56),
              TextField(
                controller: _nameController,
                style: const TextStyle(color: Colors.white),
                decoration: AppTheme.inputDecoration('Full Name'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: TextEditingController(text: user?['email'] ?? ''),
                enabled: false,
                style: TextStyle(color: Colors.white.withOpacity(0.5)),
                decoration: AppTheme.inputDecoration('Email Address (Read-only)'),
              ),
              const SizedBox(height: 56),
              GenerexButton(
                text: 'UPDATE IDENTITY',
                isLoading: _isLoading,
                onPressed: _handleUpdate,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
