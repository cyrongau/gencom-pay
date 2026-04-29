import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';
import '../../../core/services/biometric_service.dart';
import '../../../core/providers/system_provider.dart';
import '../../../core/services/api_service.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final BiometricService _biometricService = BiometricService();
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _isBiometricEnabled = false;

  @override
  void initState() {
    super.initState();
    _checkBiometrics();
  }

  Future<void> _checkBiometrics() async {
    final enabled = await _biometricService.isBiometricEnabled();
    setState(() => _isBiometricEnabled = enabled);
  }

  Future<void> _handleBiometricLogin() async {
    final authenticated = await _biometricService.authenticate(
      localizedReason: 'Login to your Gencom Account'
    );
    if (authenticated) {
      final creds = await _biometricService.getCredentials();
      if (creds != null) {
        if (mounted) {
          setState(() => _isLoading = true);
          final success = await context.read<AuthProvider>().login(creds['email']!, creds['password']!);
          if (success) {
             ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Identity Verified'), backgroundColor: AppColors.green));
          } else {
             ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometric Token Expired'), backgroundColor: Colors.redAccent));
          }
          if (mounted) setState(() => _isLoading = false);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No biometrics registered. Please login with password first.')));
        }
      }
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final auth = context.read<AuthProvider>();
    final success = await auth.login(_emailController.text, _passwordController.text);
    
    if (success && mounted) {
      // Navigation handled by AuthCheck in main.dart
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Login Failed'),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final branding = context.watch<SystemProvider>().branding;
    final appName = branding['APP_NAME'] ?? 'Generex';
    final iconUrl = branding['APP_ICON'] != null && branding['APP_ICON'].toString().isNotEmpty 
        ? '${ApiService.baseUrl}${branding['APP_ICON']}' 
        : null;

    return Scaffold(
      body: Container(
        height: MediaQuery.of(context).size.height,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.navy, Color(0xFF0F172A)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                // Logo
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: iconUrl == null ? AppGradients.signature : null,
                    color: iconUrl != null ? Colors.transparent : null,
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.green.withOpacity(0.3),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: iconUrl != null 
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(22),
                        child: Image.network(iconUrl, fit: BoxFit.cover),
                      )
                    : const Icon(Icons.shield_rounded, color: AppColors.navy, size: 32),
                ),
                const SizedBox(height: 40),
                Text(
                  '${appName.toUpperCase()}\nLOGIN',
                  style: Theme.of(context).textTheme.displayLarge,
                ),
                const SizedBox(height: 12),
                Text(
                  'Securely access your $appName account',
                  style: TextStyle(color: AppColors.labelGrey, fontSize: 13, fontWeight: FontWeight.w500, letterSpacing: 0.2),
                ),
                const SizedBox(height: 64),

                // Form
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('EMAIL ADDRESS', style: Theme.of(context).textTheme.labelSmall),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      decoration: AppTheme.inputDecoration('Enter your email'),
                    ),
                    const SizedBox(height: 32),
                    Text('PASSWORD', style: Theme.of(context).textTheme.labelSmall),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      decoration: AppTheme.inputDecoration('Enter Password').copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                            color: AppColors.labelGrey,
                            size: 20,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: const Text(
                      'FORGOT PASSWORD?',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: AppColors.blue,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 48),
                Consumer<AuthProvider>(
                  builder: (context, auth, _) => GenerexButton(
                    text: 'LOGIN',
                    isLoading: auth.isLoading,
                    onPressed: _handleLogin,
                  ),
                ),
                
                const SizedBox(height: 40),
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.push(
                      context, 
                      MaterialPageRoute(builder: (_) => const RegisterScreen())
                    ),
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 11, color: AppColors.labelGrey, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        children: [
                          const TextSpan(text: "DON'T HAVE AN ACCOUNT? "),
                          TextSpan(
                            text: 'REGISTER',
                            style: TextStyle(color: AppColors.green, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                if (_isBiometricEnabled) ...[
                  const SizedBox(height: 64),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _BiometricButton(
                        icon: Icons.face_rounded,
                        label: 'FaceID',
                        onTap: _handleBiometricLogin,
                      ),
                      const SizedBox(width: 24),
                      _BiometricButton(
                        icon: Icons.fingerprint_rounded,
                        label: 'TouchID',
                        onTap: _handleBiometricLogin,
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _BiometricButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _BiometricButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 100,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.green, size: 32),
            const SizedBox(height: 12),
            Text(
              label.toUpperCase(),
              style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.labelGrey, letterSpacing: 1),
            ),
          ],
        ),
      ),
    );
  }
}
