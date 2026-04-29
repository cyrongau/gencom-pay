import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_nameController.text.isEmpty || _emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields')),
      );
      return;
    }

    final auth = context.read<AuthProvider>();
    final success = await auth.register(
      _nameController.text,
      _emailController.text,
      _passwordController.text,
    );
    
    if (success && mounted) {
      Navigator.pop(context); // Go back to login which will auto-redirect to dashboard
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Account creation failed'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Create\nAccount',
                style: Theme.of(context).textTheme.displayLarge,
              ),
              const SizedBox(height: 8),
              const Text(
                'Sign up for your Gencom Pay account',
                style: TextStyle(color: AppColors.softGrey, letterSpacing: 0.5),
              ),
              const SizedBox(height: 50),

              // Form
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'FULL NAME',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(hintText: 'e.g. Cyrus Clement'),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'EMAIL ADDRESS',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(hintText: 'e.g. user@generex.pay'),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'PASSWORD',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: AppColors.softGrey),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    decoration: InputDecoration(
                      hintText: 'Create Secure Password',
                      suffixIcon: IconButton(
                        icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: AppColors.softGrey, size: 20),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 48),
              Consumer<AuthProvider>(
                builder: (context, auth, _) => GenerexButton(
                  text: 'Create Account',
                  isLoading: auth.isLoading,
                  onPressed: _handleRegister,
                ),
              ),
              
              const SizedBox(height: 32),
              const Center(
                child: Text(
                  'By registering, you agree to our\nPrivacy Policy and Terms of Service',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 10, color: AppColors.softGrey, height: 1.5, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
