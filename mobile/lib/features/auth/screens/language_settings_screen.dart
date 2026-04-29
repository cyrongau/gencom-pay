import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class LanguageSettingsScreen extends StatefulWidget {
  const LanguageSettingsScreen({super.key});

  @override
  State<LanguageSettingsScreen> createState() => _LanguageSettingsScreenState();
}

class _LanguageSettingsScreenState extends State<LanguageSettingsScreen> {
  String _selectedLanguage = 'English (US)';
  String _selectedCurrency = 'USD';

  final List<String> _languages = ['English (US)', 'English (UK)', 'Swahili', 'French', 'Spanish'];
  final List<String> _currencies = ['USD', 'EUR', 'GBP', 'KSH', 'SLS', 'BTC', 'ETH'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navy,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('REGIONAL SETTINGS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 3)),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSection(
                title: 'DISPLAY LANGUAGE',
                children: _languages.map((lang) => _SelectionItem(
                  title: lang,
                  isSelected: _selectedLanguage == lang,
                  onTap: () => setState(() => _selectedLanguage = lang),
                )).toList(),
              ),
              const SizedBox(height: 48),
              _buildSection(
                title: 'PRIMARY CURRENCY',
                children: _currencies.map((curr) => _SelectionItem(
                  title: curr,
                  isSelected: _selectedCurrency == curr,
                  onTap: () => setState(() => _selectedCurrency = curr),
                )).toList(),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('SAVE PREFERENCES'),
                ),
              ),
            ],
          ),
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
        Container(
          decoration: BoxDecoration(
            color: AppColors.cardBg,
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Column(children: children),
        ),
      ],
    );
  }
}

class _SelectionItem extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _SelectionItem({required this.title, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05), width: 1)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: TextStyle(fontWeight: FontWeight.w900, color: isSelected ? Colors.white : AppColors.labelGrey, fontSize: 13)),
            if (isSelected) const Icon(Icons.check_circle_rounded, color: AppColors.green, size: 20),
          ],
        ),
      ),
    );
  }
}
