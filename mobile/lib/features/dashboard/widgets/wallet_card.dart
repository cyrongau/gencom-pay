import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import '../../../core/theme/app_theme.dart';

class WalletCard extends StatelessWidget {
  final String id;
  final String balance;
  final String currency;
  final bool isPrimary;
  final bool showId;
  final VoidCallback? onCopy;

  const WalletCard({
    super.key,
    required this.id,
    required this.balance,
    required this.currency,
    this.isPrimary = false,
    this.showId = true,
    this.onCopy,
  });

  @override
  Widget build(BuildContext context) {
    final isUSD = currency == 'USD';
    final isBTC = currency == 'BTC';
    final isKSH = currency == 'KSH';
    final isSLS = currency == 'SLS';
    
    final watermark = isUSD ? '\$' : isKSH ? 'KSh' : isSLS ? 'SLS' : '₿';
    final glowColor = (isUSD || isBTC) ? AppColors.green : AppColors.blue;

    return Container(
      width: 320,
      margin: const EdgeInsets.only(right: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(44),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
        boxShadow: [
          BoxShadow(
            color: glowColor.withOpacity(0.15),
            blurRadius: 40,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(44),
        child: Stack(
          children: [
            // Glass Base
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
              child: Container(
                color: Colors.white.withOpacity(0.05),
              ),
            ),
            
            // Background Glow
            Positioned(
              top: -80,
              right: -80,
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      glowColor.withOpacity(0.2),
                      glowColor.withOpacity(0),
                    ],
                  ),
                ),
              ),
            ),

            // Watermark
            Positioned(
              bottom: -20,
              right: 20,
              child: Text(
                watermark,
                style: TextStyle(
                  fontSize: 120,
                  fontWeight: FontWeight.w900,
                  color: Colors.white.withOpacity(0.03),
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),

            // Logo Watermark
            Center(
              child: Opacity(
                opacity: 0.02,
                child: Text(
                  'GENCOM PAY',
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    fontStyle: FontStyle.italic,
                    letterSpacing: -2,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Top Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: Image.network(
                                'https://flagcdn.com/w80/${isUSD ? 'us' : isKSH ? 'ke' : isSLS ? 'so' : 'us'}.png',
                                fit: BoxFit.cover,
                                opacity: const AlwaysStoppedAnimation(0.8),
                                errorBuilder: (_, __, ___) => const Icon(Icons.flag, size: 20),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'INSTITUTIONAL VAULT',
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 2,
                                  color: Colors.white.withOpacity(0.4),
                                ),
                              ),
                              Row(
                                children: [
                                  Text(
                                    currency,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w900,
                                      fontStyle: FontStyle.italic,
                                      color: Colors.white,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.verified, color: AppColors.green, size: 10),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          if (onCopy != null)
                            GestureDetector(
                              onTap: () {
                                Clipboard.setData(ClipboardData(text: id));
                                onCopy!();
                                HapticFeedback.lightImpact();
                              },
                              child: Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.05),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                                ),
                                child: const Icon(Icons.copy_rounded, size: 14, color: Colors.white70),
                              ),
                            ),
                          const SizedBox(width: 8),
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.05),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white.withOpacity(0.1)),
                            ),
                            child: const Icon(Icons.account_balance, size: 14, color: Colors.white70),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Middle Section
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AVAILABLE LIQUIDITY',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                          color: Colors.white.withOpacity(0.4),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            balance,
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              fontStyle: FontStyle.italic,
                              color: Colors.white,
                              letterSpacing: -1,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            currency,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: AppColors.green,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Bottom Row
                  Container(
                    padding: const EdgeInsets.only(top: 20),
                    decoration: BoxDecoration(
                      border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if (showId)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'NODE ID',
                                style: TextStyle(
                                  fontSize: 7,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.labelGrey,
                                  letterSpacing: 1,
                                ),
                              ),
                              Text(
                                'GCP-${id.substring(0, 8).toUpperCase()}',
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  color: Colors.white60,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          )
                        else
                          Row(
                            children: [
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  color: AppColors.green,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'PROTOCOL ACTIVE',
                                style: TextStyle(
                                  fontSize: 7,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.green,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: Colors.white.withOpacity(0.05)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.lock, size: 10, color: AppColors.green),
                              const SizedBox(width: 6),
                              Text(
                                'SECURED NODE',
                                style: TextStyle(
                                  fontSize: 7,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.labelGrey,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
