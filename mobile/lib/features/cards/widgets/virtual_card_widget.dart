import 'package:flutter/material.dart';
import 'dart:math';
import 'dart:ui';
import '../../../core/theme/app_theme.dart';

class VirtualCardWidget extends StatefulWidget {
  final String brand;
  final String holderName;
  final String lastFour;
  final String expiry;
  final String? cardNumber;
  final String? cvv;
  final bool isFrozen;
  final bool isRevealed;

  const VirtualCardWidget({
    super.key,
    required this.brand,
    required this.holderName,
    required this.lastFour,
    required this.expiry,
    this.cardNumber,
    this.cvv,
    this.isFrozen = false,
    this.isRevealed = false,
  });

  @override
  State<VirtualCardWidget> createState() => _VirtualCardWidgetState();
}

class _VirtualCardWidgetState extends State<VirtualCardWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _isFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutBack),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggleFlip() {
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    setState(() {
      _isFront = !_isFront;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _toggleFlip,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * pi;
          final isBack = angle > pi / 2;

          return Transform(
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001) // perspective
              ..rotateY(angle),
            alignment: Alignment.center,
            child: isBack
                ? Transform(
                    transform: Matrix4.identity()..rotateY(pi),
                    alignment: Alignment.center,
                    child: _buildBackCard(),
                  )
                : _buildFrontCard(),
          );
        },
      ),
    );
  }

  Widget _buildFrontCard() {
    return AspectRatio(
      aspectRatio: 1.6 / 1,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(44),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
          boxShadow: [
            BoxShadow(
              color: AppColors.green.withOpacity(0.2),
              blurRadius: 40,
              offset: const Offset(0, 20),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Glass Base
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.12),
                      Colors.white.withOpacity(0.02),
                    ],
                  ),
                ),
              ),
            ),
            
            // Branding Watermark
            Positioned(
              bottom: -40,
              right: -40,
              child: Opacity(
                opacity: 0.03,
                child: Transform.rotate(
                  angle: -0.2,
                  child: const Text(
                    'GENCOM',
                    style: TextStyle(fontSize: 100, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  color: AppColors.green,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: [BoxShadow(color: AppColors.green.withOpacity(0.3), blurRadius: 10)],
                                ),
                                child: const Center(child: Icon(Icons.security_rounded, color: Colors.white, size: 16)),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'GENCOM PAY',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: Colors.white, letterSpacing: -1),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'CORPORATE VAULT NODE',
                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 3, color: Colors.white.withOpacity(0.4)),
                          ),
                        ],
                      ),
                      Container(
                        width: 48,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        child: const Center(child: Icon(Icons.wifi_tethering, color: Colors.white38, size: 16)),
                      ),
                    ],
                  ),

                  // Card Number
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: _buildCardNumber(),
                    ),
                  ),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ENTITY HOLDER', style: TextStyle(fontSize: 7, fontWeight: FontWeight.w900, letterSpacing: 2, color: Colors.white.withOpacity(0.4))),
                          const SizedBox(height: 4),
                          Text(widget.holderName.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('EXPIRES', style: TextStyle(fontSize: 7, fontWeight: FontWeight.w900, letterSpacing: 2, color: Colors.white.withOpacity(0.4))),
                          const SizedBox(height: 4),
                          Text(widget.expiry, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBackCard() {
    return AspectRatio(
      aspectRatio: 1.6 / 1,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(44),
          color: const Color(0xFF1E293B),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Container(height: 40, color: Colors.black),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Center(
                        child: Text(
                          'AUTHORIZED SIGNATURE',
                          style: TextStyle(fontSize: 7, color: Colors.white.withOpacity(0.4), letterSpacing: 1),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 50,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Center(
                      child: Text(
                        widget.cvv ?? '•••',
                        style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 1),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                'This card is property of Gencom Pay and issued for corporate vault management. Usage is subject to network governance protocols.',
                style: TextStyle(fontSize: 7, color: Colors.white.withOpacity(0.3), height: 1.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildCardNumber() {
    final showReveal = widget.isRevealed && widget.cardNumber != null;
    final number = showReveal ? widget.cardNumber! : '453288000000${widget.lastFour}';
    final chunks = [];
    for (var i = 0; i < 16; i += 4) {
      chunks.add(number.substring(i, i + 4));
    }

    return chunks.asMap().entries.map((entry) {
      final isMasked = !showReveal && entry.key > 0 && entry.key < 3;
      final text = isMasked ? '••••' : entry.value;
      
      return Text(
        text,
        style: const TextStyle(
          fontSize: 20,
          color: Colors.white,
          fontFamily: 'monospace',
          fontWeight: FontWeight.w900,
          letterSpacing: 2,
        ),
      );
    }).toList();
  }
}
