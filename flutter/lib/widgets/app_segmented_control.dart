import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

class AppSegmentedOption<T> {
  final T value;
  final String label;
  final IconData? icon;
  const AppSegmentedOption({required this.value, required this.label, this.icon});
}

/// iOS-style segmented control with an animated pill that slides between options. The same
/// pattern ships across the web app and the Expo RN app — keep the behaviour consistent so
/// users feel one product across platforms.
class AppSegmentedControl<T> extends StatelessWidget {
  final List<AppSegmentedOption<T>> options;
  final T value;
  final ValueChanged<T> onChanged;
  final EdgeInsetsGeometry padding;

  const AppSegmentedControl({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
    this.padding = const EdgeInsets.all(4),
  });

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;
    final bgColor = isDark ? AppColors.darkBackground : AppColors.gray100;
    final pillColor = isDark ? AppColors.darkCard : AppColors.white;
    final activeTextColor = isDark ? AppColors.white : AppColors.gray900;
    final inactiveTextColor = isDark ? AppColors.gray400 : AppColors.gray500;

    return LayoutBuilder(builder: (context, constraints) {
      final width = constraints.maxWidth;
      final segmentWidth = options.isEmpty ? 0.0 : (width - 8) / options.length;
      final activeIndex = options.indexWhere((o) => o.value == value);

      return Container(
        padding: padding,
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppRadii.lg),
        ),
        child: Stack(
          children: [
            AnimatedPositioned(
              duration: AppMotion.normal,
              curve: AppMotion.outExpo,
              left: (activeIndex < 0 ? 0 : activeIndex) * segmentWidth,
              top: 0,
              bottom: 0,
              width: segmentWidth,
              child: Container(
                decoration: BoxDecoration(
                  color: pillColor,
                  borderRadius: BorderRadius.circular(AppRadii.md),
                  boxShadow: isDark ? null : AppShadows.sm,
                ),
              ),
            ),
            Row(
              children: [
                for (final o in options)
                  Expanded(
                    child: InkWell(
                      borderRadius: BorderRadius.circular(AppRadii.md),
                      onTap: () => onChanged(o.value),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (o.icon != null) ...[
                              Icon(
                                o.icon,
                                size: 14,
                                color: o.value == value ? activeTextColor : inactiveTextColor,
                              ),
                              const SizedBox(width: 6),
                            ],
                            Text(
                              o.label,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: o.value == value ? activeTextColor : inactiveTextColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      );
    });
  }
}
