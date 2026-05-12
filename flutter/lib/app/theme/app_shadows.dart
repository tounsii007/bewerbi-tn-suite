import 'package:flutter/material.dart';

import 'package:bewerbi_tn_flutter/app/theme/app_colors.dart';

class AppShadows {
  AppShadows._();

  static const List<BoxShadow> sm = [
    BoxShadow(color: Color(0x0D000000), blurRadius: 4, offset: Offset(0, 1)),
  ];

  static const List<BoxShadow> md = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 8, offset: Offset(0, 4)),
    BoxShadow(color: Color(0x0D000000), blurRadius: 4, offset: Offset(0, 2)),
  ];

  static const List<BoxShadow> lg = [
    BoxShadow(color: Color(0x1A000000), blurRadius: 16, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x0D000000), blurRadius: 8, offset: Offset(0, 4)),
  ];

  static List<BoxShadow> primaryGlow(double opacity) {
    return [
      BoxShadow(
        color: AppColors.primary.withValues(alpha: opacity),
        blurRadius: 24,
        offset: const Offset(0, 12),
      ),
      ...sm,
    ];
  }
}
