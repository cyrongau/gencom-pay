import 'package:flutter/material.dart';
import 'webhook_logs_screen.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class MerchantSettingsScreen extends StatefulWidget {
  const MerchantSettingsScreen({super.key});

  @override
  State<MerchantSettingsScreen> createState() => _MerchantSettingsScreenState();
}

class _MerchantSettingsScreenState extends State<MerchantSettingsScreen> {
  final _api = ApiService();
  List<dynamic> _apiKeys = [];
  Map<String, dynamic>? _webhookConfig;
  List<dynamic> _webhookLogs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final keysRes = await _api.get('/merchant/keys');
      final webRes = await _api.get('/merchant/webhooks');
      final logsRes = await _api.get('/merchant/webhooks/logs');
      setState(() {
        _apiKeys = keysRes.data;
        _webhookConfig = webRes.data;
        _webhookLogs = logsRes.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('API & WEBHOOKS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle('WEBHOOK ENDPOINT'),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _webhookConfig?['url'] ?? 'NO ENDPOINT CONFIGURED',
                        style: TextStyle(
                          color: _webhookConfig?['url'] != null ? Colors.white : AppColors.labelGrey,
                          fontFamily: 'monospace',
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'ACTIVE EVENTS: ${(_webhookConfig?['events'] as List?)?.join(', ') ?? 'NONE'}',
                        style: const TextStyle(color: AppColors.labelGrey, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 48),
                
                _buildSectionTitle('RECENT WEBHOOK DELIVERIES'),
                const SizedBox(height: 24),
                if (_webhookLogs.isEmpty)
                  const Text('No delivery logs found', style: TextStyle(color: AppColors.labelGrey, fontSize: 11, fontStyle: FontStyle.italic))
                else
                  ..._webhookLogs.take(5).map((log) => Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: log['delivery_status'] == 'SUCCESS' ? AppColors.green : Colors.redAccent,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(log['event_type'], style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace')),
                        ),
                        Text(
                          log['created_at'].toString().substring(11, 16),
                          style: const TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  )),
                
                if (_webhookLogs.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: TextButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WebhookLogsScreen())),
                      child: const Text('VIEW ALL TRANSMISSION LOGS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: AppColors.blue, letterSpacing: 1)),
                    ),
                  ),

                const SizedBox(height: 56),
                
                _buildSectionTitle('API KEYS'),
                const SizedBox(height: 24),
                ..._apiKeys.map((key) => Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.vpn_key_outlined, color: AppColors.blue, size: 20),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(key['name'], style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 13)),
                            const SizedBox(height: 4),
                            Text(
                              'CREATED: ${key['created_at'].toString().substring(0, 10)}',
                              style: const TextStyle(fontSize: 9, color: AppColors.labelGrey, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () {}, // Revoke logic
                        icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 20),
                      ),
                    ],
                  ),
                )),
                
                const SizedBox(height: 56),
                
                GenerexButton(
                  text: 'GENERATE NEW KEY',
                  onPressed: () {},
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2));
  }
}
