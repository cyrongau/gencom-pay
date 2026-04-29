import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary
  static const Color navy = Color(0xFF0B1225);
  static const Color green = Color(0xFF16C66E);
  static const Color blue = Color(0xFF4A68E7);
  
  // Secondary
  static const Color deepTeal = Color(0xFF0F3D3A);
  static const Color coolSky = Color(0xFFF0F5FF);
  static const Color softGrey = Color(0xFFF3F6F9);
  static const Color labelGrey = Color(0xFF8E9AAF);
  
  // Accent
  static const Color gold = Color(0xFFF5B800);
  
  // UI Structural
  static const Color cardBg = Color(0xFF151C2C);
  static const Color border = Color(0xFF222B3E);
}

class AppGradients {
  static const LinearGradient signature = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.green, AppColors.blue],
  );

  static const LinearGradient dashboardDepth = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [AppColors.navy, AppColors.blue],
  );

  static const LinearGradient successGrowth = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.deepTeal, AppColors.green],
  );
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.navy,
      primaryColor: AppColors.green,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.green,
        secondary: AppColors.blue,
        surface: AppColors.cardBg,
        background: AppColors.navy,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          fontStyle: FontStyle.italic,
          letterSpacing: -1,
          color: Colors.white,
        ),
        titleLarge: GoogleFonts.outfit(
          fontSize: 22,
          fontWeight: FontWeight.w900,
          fontStyle: FontStyle.italic,
          letterSpacing: -0.5,
          color: Colors.white,
        ),
        labelSmall: GoogleFonts.outfit(
          fontSize: 10,
          fontWeight: FontWeight.w900,
          letterSpacing: 2.0,
          color: AppColors.labelGrey,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.05),
        contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: AppColors.blue, width: 2),
        ),
        hintStyle: const TextStyle(color: AppColors.labelGrey, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent, // We'll use Container decoration for gradients
          foregroundColor: AppColors.navy,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
          textStyle: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 12),
        ),
      ),
    );
  }

  static InputDecoration inputDecoration(String hintText) {
    return InputDecoration(
      hintText: hintText,
      filled: true,
      fillColor: Colors.white.withOpacity(0.05),
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: AppColors.blue, width: 2),
      ),
      hintStyle: const TextStyle(color: AppColors.labelGrey, fontSize: 14),
    );
  }
}
