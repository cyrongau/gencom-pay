import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/generex_button.dart';

class MerchantTeamScreen extends StatefulWidget {
  const MerchantTeamScreen({super.key});

  @override
  State<MerchantTeamScreen> createState() => _MerchantTeamScreenState();
}

class _MerchantTeamScreenState extends State<MerchantTeamScreen> {
  final _api = ApiService();
  List<dynamic> _members = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTeam();
  }

  Future<void> _fetchTeam() async {
    try {
      final response = await _api.get('/merchant/team');
      setState(() {
        _members = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _showInviteDialog() {
    final emailController = TextEditingController();
    String selectedRole = 'MANAGER';

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.navy,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 32, right: 32, top: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('INVITE TEAM MEMBER', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
              const SizedBox(height: 32),
              TextField(
                controller: emailController,
                style: const TextStyle(color: Colors.white),
                decoration: AppTheme.inputDecoration('Member Email Address'),
              ),
              const SizedBox(height: 24),
              const Text('ASSIGN ROLE', style: TextStyle(color: AppColors.labelGrey, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1)),
              const SizedBox(height: 16),
              Row(
                children: ['MANAGER', 'OPERATOR', 'VIEWER'].map((role) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(role, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: selectedRole == role ? AppColors.navy : Colors.white)),
                    selected: selectedRole == role,
                    selectedColor: AppColors.blue,
                    backgroundColor: AppColors.cardBg,
                    onSelected: (selected) {
                      if (selected) setModalState(() => selectedRole = role);
                    },
                  ),
                )).toList(),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    if (emailController.text.isEmpty) return;
                    try {
                      await _api.post('/merchant/team/invite', data: {
                        'email': emailController.text,
                        'role': selectedRole,
                      });
                      if (mounted) {
                        Navigator.pop(context);
                        _fetchTeam();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Invitation sent!'), backgroundColor: AppColors.green),
                        );
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Failed to invite: $e')),
                      );
                    }
                  },
                  child: const Text('SEND INVITATION'),
                ),
              ),
              const SizedBox(height: 48),
            ],
          ),
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
        title: const Text('TEAM MANAGEMENT', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _showInviteDialog,
            icon: const Icon(Icons.add_circle_outline_rounded, color: AppColors.green),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(32),
            itemCount: _members.length,
            itemBuilder: (context, index) {
              final member = _members[index];
              final user = member['user'];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.navy,
                        borderRadius: BorderRadius.circular(16),
                        image: DecorationImage(
                          image: NetworkImage(user['avatar_url'] ?? "https://ui-avatars.com/api/?name=${user['full_name']}&background=16C66E&color=fff"),
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user['full_name'], style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(user['email'], style: const TextStyle(fontSize: 11, color: AppColors.labelGrey, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        member['role'],
                        style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: AppColors.blue),
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
