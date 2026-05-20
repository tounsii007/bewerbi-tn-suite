import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Iter 128 — frosted glass card for Flutter, mirroring the web `GlassCard`
/// and the mobile `GlassCard` from Iter 125.
///
/// Uses `BackdropFilter` with `ImageFilter.blur` for the frost, and a
/// tinted overlay for readability on bright/dark backdrops. The blur is
/// GPU-accelerated on iOS and Android via the platform compositor.
///
/// Strength variants mirror the web/mobile counterparts:
///   - subtle (light frost, secondary surfaces)
///   - default (balanced, most common)
///   - strong (nav, command palette)
///   - frosted (modals, drawers)
enum GlassStrength { subtle, defaultStrength, strong, frosted }

class AppGlassCard extends StatelessWidget {
  final Widget child;
  final GlassStrength strength;
  final bool glow;
  final EdgeInsetsGeometry padding;
  final BorderRadius? borderRadius;
  final VoidCallback? onTap;

  const AppGlassCard({
    super.key,
    required this.child,
    this.strength = GlassStrength.defaultStrength,
    this.glow = false,
    this.padding = const EdgeInsets.all(20),
    this.borderRadius,
    this.onTap,
  });

  double get _blurSigma {
    switch (strength) {
      case GlassStrength.subtle:
        return 8;
      case GlassStrength.defaultStrength:
        return 14;
      case GlassStrength.strong:
        return 20;
      case GlassStrength.frosted:
        return 28;
    }
  }

  double _overlayAlpha(bool isDark) {
    switch (strength) {
      case GlassStrength.subtle:
        return isDark ? 0.35 : 0.45;
      case GlassStrength.defaultStrength:
        return isDark ? 0.55 : 0.65;
      case GlassStrength.strong:
        return isDark ? 0.7 : 0.78;
      case GlassStrength.frosted:
        return isDark ? 0.75 : 0.82;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final radius = borderRadius ?? BorderRadius.circular(20);
    final overlayColor = isDark
        ? const Color(0xFF1E293B).withValues(alpha: _overlayAlpha(true))
        : Colors.white.withValues(alpha: _overlayAlpha(false));
    final borderColor = isDark
        ? Colors.white.withValues(alpha: 0.10)
        : Colors.white.withValues(alpha: 0.5);

    final card = ClipRRect(
      borderRadius: radius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: _blurSigma, sigmaY: _blurSigma),
        child: Container(
          decoration: BoxDecoration(
            color: overlayColor,
            borderRadius: radius,
            border: Border.all(color: borderColor, width: 1),
            boxShadow: glow
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.25),
                      offset: const Offset(0, 8),
                      blurRadius: 24,
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
                      offset: const Offset(0, 4),
                      blurRadius: 16,
                    ),
                  ],
          ),
          padding: padding,
          child: child,
        ),
      ),
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        borderRadius: radius,
        child: InkWell(
          onTap: onTap,
          borderRadius: radius,
          child: card,
        ),
      );
    }
    return card;
  }
}
