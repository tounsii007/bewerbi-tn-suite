import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Animated placeholder block — pulsing opacity at a 1.2s cadence. Use [AppSkeletonGroup] for
/// multi-line text placeholders.
class AppSkeleton extends StatefulWidget {
  final double? width;
  final double height;
  final double radius;

  const AppSkeleton({
    super.key,
    this.width,
    this.height = 14,
    this.radius = 8,
  });

  @override
  State<AppSkeleton> createState() => _AppSkeletonState();
}

class _AppSkeletonState extends State<AppSkeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? AppColors.darkBorder : AppColors.gray200;

    return AnimatedBuilder(
      animation: _ctrl,
      // Dart 3.7+ flags `(_, __)` as multiple-underscore reuse — use
      // the new shared-`_` wildcard pattern that's idiomatic for
      // "ignored params" since the unnamed-wildcard upgrade.
      builder: (_, _) {
        // Curve smooths the linear controller into a more "breathing" pulse.
        final t = Curves.easeInOut.transform(_ctrl.value);
        final opacity = 0.45 + t * 0.55;
        return Opacity(
          opacity: opacity,
          child: Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              color: baseColor,
              borderRadius: BorderRadius.circular(widget.radius),
            ),
          ),
        );
      },
    );
  }
}

class AppSkeletonGroup extends StatelessWidget {
  final int lines;
  final double lineHeight;
  final double gap;
  final double lastWidthFraction;

  const AppSkeletonGroup({
    super.key,
    this.lines = 3,
    this.lineHeight = 12,
    this.gap = 8,
    this.lastWidthFraction = 0.62,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (ctx, constraints) {
      final fullWidth = constraints.maxWidth;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: List.generate(lines, (i) {
          final isLast = i == lines - 1;
          return Padding(
            padding: EdgeInsets.only(top: i == 0 ? 0 : gap),
            child: AppSkeleton(
              width: isLast ? fullWidth * lastWidthFraction : fullWidth,
              height: lineHeight,
            ),
          );
        }),
      );
    });
  }
}
