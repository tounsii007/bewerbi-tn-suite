import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Iter 128 — gradient-clipped text for Flutter, mirroring the web/mobile
/// `GradientText` variants.
///
/// Uses `ShaderMask` with a `LinearGradient` painted across the text's
/// bounding box. No external dependency needed.
///
///   AppGradientText('Deutschland',
///     style: TextStyle(fontSize: 36, fontWeight: FontWeight.w800))
enum GradientVariant { brand, aurora, sunrise, flame }

class AppGradientText extends StatelessWidget {
  final String text;
  final GradientVariant variant;
  final TextStyle? style;
  final TextAlign? textAlign;

  const AppGradientText(
    this.text, {
    super.key,
    this.variant = GradientVariant.brand,
    this.style,
    this.textAlign,
  });

  List<Color> get _colors {
    switch (variant) {
      case GradientVariant.brand:
        return const [
          AppColors.primary,
          Color(0xFF6D4CF7),
          AppColors.primary,
        ];
      case GradientVariant.aurora:
        return const [
          AppColors.primary,
          AppColors.error,
          AppColors.warningAccent,
          AppColors.success,
          AppColors.info,
        ];
      case GradientVariant.sunrise:
        return const [
          AppColors.error,
          AppColors.warningAccent,
          AppColors.error,
        ];
      case GradientVariant.flame:
        return const [
          AppColors.error,
          Color(0xFF9C39E8),
          AppColors.primary,
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: _colors,
      ).createShader(Rect.fromLTWH(0, 0, bounds.width, bounds.height)),
      child: Text(
        text,
        style: style,
        textAlign: textAlign,
      ),
    );
  }
}
