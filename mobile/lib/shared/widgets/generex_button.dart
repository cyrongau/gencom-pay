import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class GenerexButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isSecondary;
  final Color? backgroundColor;

  const GenerexButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isSecondary = false,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(40),
        gradient: (backgroundColor == null && !isSecondary) ? AppGradients.signature : null,
        color: backgroundColor ?? (isSecondary ? Colors.white.withOpacity(0.05) : null),
        boxShadow: [
          if (!isSecondary)
            BoxShadow(
              color: (backgroundColor ?? AppColors.green).withOpacity(0.2),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
        ],
      ),
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: isSecondary ? Colors.white : AppColors.navy,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(vertical: 22),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
        ),
        child: isLoading
            ? const SizedBox(
                height: 20,
                width: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.navy),
                ),
              )
            : Text(
                text.toUpperCase(),
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                  fontSize: 12,
                ),
              ),
      ),
    );
  }
}
