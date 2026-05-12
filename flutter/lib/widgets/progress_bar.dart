import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

class ProgressBar extends StatelessWidget {
  final double progress;
  final double height;
  final Color? color;
  final Color? backgroundColor;

  const ProgressBar({
    super.key,
    required this.progress,
    this.height = 6,
    this.color,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveProgress = progress.clamp(0.0, 1.0);
    final barColor = color ?? AppColors.primary;
    final bgColor = backgroundColor ?? AppColors.gray200;
    final radius = BorderRadius.circular(height / 2);

    return Container(
      height: height,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: radius,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          return Stack(
            children: [
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: effectiveProgress),
                duration: const Duration(milliseconds: 600),
                curve: Curves.easeInOut,
                builder: (context, value, child) {
                  return Container(
                    width: constraints.maxWidth * value,
                    height: height,
                    decoration: BoxDecoration(
                      color: barColor,
                      borderRadius: radius,
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
