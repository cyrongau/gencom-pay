import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('NOTIFICATIONS', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 2)),
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none, size: 80, color: AppColors.softGrey.withOpacity(0.5)),
            const SizedBox(height: 24),
            const Text(
              'No System Alerts',
              style: TextStyle(color: AppColors.softGrey, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'All protocols are running normally.',
              style: TextStyle(color: AppColors.softGrey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
