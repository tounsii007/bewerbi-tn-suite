import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final int elevation;
  final Color? accentBorderColor;
  final EdgeInsets? padding;

  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.elevation = 1,
    this.accentBorderColor,
    this.padding,
  });

  List<BoxShadow> get _shadow {
    switch (elevation) {
      case 2:
        return AppShadows.md;
      case 3:
        return AppShadows.lg;
      default:
        return AppShadows.sm;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkCard : AppColors.white;

    final decoration = BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(16),
      boxShadow: isDark ? null : _shadow,
      border: isDark ? Border.all(color: AppColors.darkBorder, width: 1) : null,
    );

    Widget cardContent;
    if (accentBorderColor != null) {
      cardContent = IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 4,
              decoration: BoxDecoration(
                color: accentBorderColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: padding ?? const EdgeInsets.all(20),
                child: child,
              ),
            ),
          ],
        ),
      );
    } else {
      cardContent = Padding(
        padding: padding ?? const EdgeInsets.all(20),
        child: child,
      );
    }

    Widget content = Container(
      decoration: decoration,
      clipBehavior: Clip.antiAlias,
      child: cardContent,
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: content,
      );
    }

    return content;
  }
}
