import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';

class WebhookLogsScreen extends StatefulWidget {
  const WebhookLogsScreen({super.key});

  @override
  State<WebhookLogsScreen> createState() => _WebhookLogsScreenState();
}

class _WebhookLogsScreenState extends State<WebhookLogsScreen> {
  final _api = ApiService();
  List<dynamic> _logs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLogs();
  }

  Future<void> _fetchLogs() async {
    try {
      final response = await _api.get('/merchant/webhooks/logs');
      setState(() {
        _logs = response.data;
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
        title: const Text('WEBHOOK TRANSMISSIONS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _logs.isEmpty
          ? const Center(child: Text('No transmissions recorded', style: TextStyle(color: AppColors.labelGrey)))
          : ListView.builder(
              padding: const EdgeInsets.all(32),
              itemCount: _logs.length,
              itemBuilder: (context, index) {
                final log = _logs[index];
                final isSuccess = log['delivery_status'] == 'SUCCESS';
                
                return Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: (isSuccess ? AppColors.green : Colors.redAccent).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              log['event_type'].toString().toUpperCase(),
                              style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: isSuccess ? AppColors.green : Colors.redAccent, letterSpacing: 1),
                            ),
                          ),
                          Text(
                            log['created_at'].toString().substring(11, 16),
                            style: const TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'RESPONSE: ${log['response_status']} ${log['delivery_status']}',
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.navy.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          log['payload']?.toString() ?? 'No payload data',
                          style: const TextStyle(color: AppColors.labelGrey, fontSize: 10, fontFamily: 'monospace', height: 1.5),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
