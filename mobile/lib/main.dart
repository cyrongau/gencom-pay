import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/wallet_provider.dart';
import 'core/providers/card_provider.dart';
import 'core/providers/bill_provider.dart';
import 'core/providers/merchant_provider.dart';
import 'core/providers/transaction_provider.dart';
import 'core/providers/crypto_provider.dart';
import 'core/providers/system_provider.dart';
import 'core/services/api_service.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/dashboard/screens/navigation_container.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
        ChangeNotifierProvider(create: (_) => CardProvider()),
        ChangeNotifierProvider(create: (_) => BillProvider()),
        ChangeNotifierProvider(create: (_) => MerchantProvider()),
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
        ChangeNotifierProvider(create: (_) => CryptoProvider()),
        ChangeNotifierProvider(create: (_) => SystemProvider()),
      ],
      child: const GencomPayApp(),
    ),
  );
}

class GencomPayApp extends StatelessWidget {
  const GencomPayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gencom Pay',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const AuthCheck(),
    );
  }
}

class AuthCheck extends StatefulWidget {
  const AuthCheck({super.key});

  @override
  State<AuthCheck> createState() => _AuthCheckState();
}

class _AuthCheckState extends State<AuthCheck> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SystemProvider>().fetchBranding();
      context.read<AuthProvider>().fetchProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    
    if (auth.isLoading) {
      final branding = context.watch<SystemProvider>().branding;
      final splashUrl = branding['SPLASH_ICON'] != null && branding['SPLASH_ICON'].toString().isNotEmpty 
          ? '${ApiService.baseUrl}${branding['SPLASH_ICON']}' 
          : null;

      return Scaffold(
        backgroundColor: const Color(0xFF0B1225), // Midnight Navy Blue
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (splashUrl != null)
                Image.network(splashUrl, width: 120, height: 120, fit: BoxFit.contain)
              else
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(32),
                  ),
                  child: const Icon(Icons.shield, size: 60, color: Colors.green),
                ),
              const SizedBox(height: 48),
              const CircularProgressIndicator(color: Colors.green, strokeWidth: 2),
            ],
          ),
        ),
      );
    }

    if (auth.isAuthenticated) {
      return const NavigationContainer();
    }

    return const LoginScreen();
  }
}

class PlaceholderScreen extends StatelessWidget {
  final String title;
  const PlaceholderScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 24)),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 80, color: Colors.green),
            const SizedBox(height: 20),
            Text(
              '$title Under Construction',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 40),
            if (title == 'Dashboard')
              ElevatedButton(
                onPressed: () => context.read<AuthProvider>().logout(),
                child: const Text('LOGOUT PROTOCOL'),
              )
            else
              ElevatedButton(
                onPressed: () => context.read<AuthProvider>().login('test@example.com', 'password'),
                child: const Text('INITIATE LOGIN'),
              ),
          ],
        ),
      ),
    );
  }
}
