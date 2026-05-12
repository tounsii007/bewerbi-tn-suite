import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

class SkeletonLoader extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonLoader({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  State<SkeletonLoader> createState() => _SkeletonLoaderState();
}

class _SkeletonLoaderState extends State<SkeletonLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment(-1.0 + 2.0 * _controller.value, 0),
              end: Alignment(1.0 + 2.0 * _controller.value, 0),
              colors: isDark
                  ? [
                      AppColors.darkCard,
                      AppColors.darkBorder,
                      AppColors.darkCard,
                    ]
                  : [
                      AppColors.gray100,
                      AppColors.gray200,
                      AppColors.gray100,
                    ],
            ),
          ),
        );
      },
    );
  }
}

/// Pre-built skeleton that mimics a [JobCard] layout.
class JobCardSkeleton extends StatelessWidget {
  const JobCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.sm,
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              SkeletonLoader(width: 60, height: 24, borderRadius: 6),
              SizedBox(width: 8),
              SkeletonLoader(width: 80, height: 24, borderRadius: 6),
            ],
          ),
          SizedBox(height: 12),
          SkeletonLoader(height: 20, borderRadius: 4),
          SizedBox(height: 8),
          SkeletonLoader(width: 160, height: 16, borderRadius: 4),
          SizedBox(height: 16),
          Row(
            children: [
              SkeletonLoader(width: 100, height: 14, borderRadius: 4),
              SizedBox(width: 16),
              SkeletonLoader(width: 120, height: 14, borderRadius: 4),
            ],
          ),
        ],
      ),
    );
  }
}
