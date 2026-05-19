import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Subtle multi-stop radial mesh background — same look as the web `.gradient-mesh` utility.
/// Use behind hero sections and auth screens. Cheap (pure gradient layers, no shader) and
/// adapts to dark mode by lowering opacity.
class AppGradientMesh extends StatelessWidget {
  final Widget child;
  const AppGradientMesh({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? AppColors.darkBackground : AppColors.surfaceAlt;

    Color tint(Color c, double a) => c.withValues(alpha: isDark ? a * 0.4 : a);

    return Container(
      color: baseColor,
      child: Stack(
        children: [
          // Top-left primary glow
          Positioned(
            left: -120,
            top: -80,
            child: _Blob(color: tint(AppColors.primary, 0.30), size: 360),
          ),
          // Top-right accent glow
          Positioned(
            right: -100,
            top: -60,
            child: _Blob(color: tint(AppColors.errorAccent, 0.20), size: 320),
          ),
          // Bottom-left success glow
          Positioned(
            left: -80,
            bottom: -120,
            child: _Blob(color: tint(AppColors.success, 0.20), size: 380),
          ),
          child,
        ],
      ),
    );
  }
}

class _Blob extends StatelessWidget {
  final Color color;
  final double size;
  const _Blob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color, color.withValues(alpha: 0)],
          stops: const [0.0, 1.0],
        ),
      ),
    );
  }
}
