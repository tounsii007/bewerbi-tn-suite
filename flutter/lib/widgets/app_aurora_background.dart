import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Iter 128 — animated multi-blob backdrop for Flutter heroes.
///
/// Three radial-gradient blobs drift independently. Uses two
/// [AnimationController]s running on the vsync to avoid stutter; respects
/// the `static` flag for `MediaQuery.disableAnimationsOf(context)` users.
///
/// Variants mirror the web/mobile primitives:
///   - subtle (dashboards)
///   - defaultStrength (auth, marketing)
///   - vivid (landing hero)
enum AuroraVariant { subtle, defaultStrength, vivid }

class AppAuroraBackground extends StatefulWidget {
  final Widget child;
  final AuroraVariant variant;
  final bool static;
  final BorderRadius? borderRadius;

  const AppAuroraBackground({
    super.key,
    required this.child,
    this.variant = AuroraVariant.defaultStrength,
    this.static = false,
    this.borderRadius,
  });

  @override
  State<AppAuroraBackground> createState() => _AppAuroraBackgroundState();
}

class _AppAuroraBackgroundState extends State<AppAuroraBackground>
    with TickerProviderStateMixin {
  late final AnimationController _c1;
  late final AnimationController _c2;

  @override
  void initState() {
    super.initState();
    _c1 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    );
    _c2 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 28),
    );
    // Iter 142 — animations start in didChangeDependencies once we can
    // read MediaQuery.disableAnimationsOf(context).
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final disableAnimations = MediaQuery.disableAnimationsOf(context);
    final shouldAnimate = !widget.static && !disableAnimations;
    if (shouldAnimate) {
      if (!_c1.isAnimating) _c1.repeat(reverse: true);
      if (!_c2.isAnimating) _c2.repeat(reverse: true);
    } else {
      _c1.stop();
      _c2.stop();
    }
  }

  @override
  void dispose() {
    _c1.dispose();
    _c2.dispose();
    super.dispose();
  }

  double get _opacity {
    switch (widget.variant) {
      case AuroraVariant.subtle:
        return 0.4;
      case AuroraVariant.defaultStrength:
        return 0.6;
      case AuroraVariant.vivid:
        return 0.85;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final base = isDark ? AppColors.darkBackground : AppColors.surfaceAlt;
    final radius = widget.borderRadius ?? BorderRadius.zero;

    return ClipRRect(
      borderRadius: radius,
      child: Container(
        color: base,
        child: Stack(
          children: [
            // Blob A — primary
            AnimatedBuilder(
              animation: _c1,
              builder: (_, _) {
                final t = _c1.value;
                return Positioned(
                  left: -120 + t * 40,
                  top: -80 + t * 30,
                  child: _Blob(
                    color: AppColors.primary.withValues(
                      alpha: (isDark ? 0.35 : 0.55) * _opacity,
                    ),
                    size: 360 * (1 + t * 0.08),
                  ),
                );
              },
            ),
            // Blob B — accent
            AnimatedBuilder(
              animation: _c2,
              builder: (_, _) {
                final t = _c2.value;
                return Positioned(
                  right: -100 + (1 - t) * 30,
                  top: 60 + t * 30,
                  child: _Blob(
                    color: AppColors.error.withValues(
                      alpha: (isDark ? 0.25 : 0.45) * _opacity,
                    ),
                    size: 320 * (1 + (1 - t) * 0.06),
                  ),
                );
              },
            ),
            // Blob C — success
            AnimatedBuilder(
              animation: _c1,
              builder: (_, _) {
                final t = _c1.value;
                return Positioned(
                  left: 80 + t * 20,
                  bottom: -120 - t * 30,
                  child: _Blob(
                    color: AppColors.success.withValues(
                      alpha: (isDark ? 0.25 : 0.4) * _opacity,
                    ),
                    size: 380,
                  ),
                );
              },
            ),
            widget.child,
          ],
        ),
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
        gradient: RadialGradient(colors: [color, Colors.transparent]),
      ),
    );
  }
}
