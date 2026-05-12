import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextTheme {
  AppTextTheme._();

  static TextTheme build(TextTheme base) {
    return base.copyWith(
      displayLarge: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
      ),
      titleLarge: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
      titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700),
      bodyLarge: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w400),
      bodyMedium: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w400),
      labelSmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400),
    );
  }
}
