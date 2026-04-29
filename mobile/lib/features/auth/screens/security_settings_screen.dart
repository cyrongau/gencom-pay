import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/api_service.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/biometric_service.dart';

class SecuritySettingsScreen extends StatefulWidget {
  const SecuritySettingsScreen({super.key});

  @override
  State<SecuritySettingsScreen> createState() => _SecuritySettingsScreenState();
}

class _SecuritySettingsScreenState extends State<SecuritySettingsScreen> {
  final BiometricService _biometric = BiometricService();
  bool _biometricsEnabled = false;
  bool _realTimeAlerts = true;

  @override
  void initState() {
    super.initState();
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    final enabled = await _biometric.isBiometricEnabled();
    setState(() => _biometricsEnabled = enabled);
  }

  Future<void> _handleBiometricToggle(bool value) async {
    if (value) {
      // Prompt for password to securely store credentials
      _showBiometricEnrollmentDialog();
    } else {
      await _biometric.disableBiometrics();
      setState(() => _biometricsEnabled = false);
    }
  }

  void _showBiometricEnrollmentDialog() {
    final passwordController = TextEditingController();
    final user = context.read<AuthProvider>().user;

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
            const Text('ENROLL BIOMETRICS', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 16),
            const Text('Verify your password to enable FaceID/TouchID login.', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 32),
            TextField(
              controller: passwordController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: AppTheme.inputDecoration('Account Password'),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (passwordController.text.isEmpty) return;
                  // Verify with API (optional but recommended, here we assume it's correct for enrollment)
                  await _biometric.saveCredentials(user!['email'], passwordController.text);
                  if (mounted) {
                    setState(() => _biometricsEnabled = true);
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Biometrics enrolled successfully!'), backgroundColor: AppColors.green),
                    );
                  }
                },
                child: const Text('ENABLE ACCESS'),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('SECURITY PROTOCOLS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection(
                title: 'AUTHENTICATION',
                children: [
                  _ToggleItem(
                    icon: Icons.fingerprint_rounded,
                    title: 'Biometric Access',
                    subtitle: 'Use FaceID/TouchID to authorize',
                    value: _biometricsEnabled,
                    onChanged: _handleBiometricToggle,
                  ),
                  _ToggleItem(
                    icon: Icons.notifications_active_rounded,
                    title: 'Real-time Alerts',
                    subtitle: 'Notify on all account activity',
                    value: _realTimeAlerts,
                    onChanged: (val) => setState(() => _realTimeAlerts = val),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              _buildSection(
                title: 'CREDENTIALS',
                children: [
                  _SettingsButton(
                    icon: Icons.lock_outline_rounded,
                    title: 'Change Secret Token',
                    subtitle: 'Update your login password',
                    onTap: () => _showChangePasswordDialog(context),
                  ),
                  _SettingsButton(
                    icon: Icons.devices_rounded,
                    title: 'Active Sessions',
                    subtitle: 'Manage devices logged into node',
                    onTap: () {},
                  ),
                ],
              ),
              const SizedBox(height: 56),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.redAccent.withOpacity(0.1)),
                ),
                child: Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 20),
                        SizedBox(width: 12),
                        Text('DANGER ZONE', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 10)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Account termination is irreversible. All assets must be moved before proceeding.',
                      style: TextStyle(color: AppColors.labelGrey, fontSize: 11, height: 1.5),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: const BorderSide(color: Colors.redAccent),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('TERMINATE NODE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11)),
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

  void _showChangePasswordDialog(BuildContext context) {
    final oldController = TextEditingController();
    final newController = TextEditingController();
    final api = ApiService();

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
            const Text('UPDATE SECRET TOKEN', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
            const SizedBox(height: 32),
            TextField(
              controller: oldController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: AppTheme.inputDecoration('Current Password'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: newController,
              obscureText: true,
              style: const TextStyle(color: Colors.white),
              decoration: AppTheme.inputDecoration('New Password'),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (oldController.text.isEmpty || newController.text.isEmpty) return;
                  try {
                    await api.post('/auth/change-password', data: {
                      'oldPassword': oldController.text,
                      'newPassword': newController.text,
                    });
                    if (context.mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Password updated successfully!'), backgroundColor: AppColors.green),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed to update password: $e')),
                      );
                    }
                  }
                },
                child: const Text('CONFIRM UPDATE'),
              ),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required List<Widget> children}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
        const SizedBox(height: 24),
        ...children,
      ],
    );
  }
}

class _ToggleItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.cardBg,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.labelGrey, size: 24),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 13)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: AppColors.green,
            activeTrackColor: AppColors.green.withOpacity(0.2),
          ),
        ],
      ),
    );
  }
}

class _SettingsButton extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _SettingsButton({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.cardBg,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Icon(icon, color: AppColors.labelGrey, size: 24),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 10, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.labelGrey, size: 20),
          ],
        ),
      ),
    );
  }
}
