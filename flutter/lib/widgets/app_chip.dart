import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

enum AppChipTone { neutral, primary, success, warning, accent }

/// Compact label. Two roles, picked via props:
///   - read-only badge   (no [onTap], no [onRemove])
///   - filter chip       (with [onTap]; tap toggles [selected])
class AppChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;
  final AppChipTone tone;
  final IconData? icon;

  const AppChip({
    super.key,
    required this.label,
    this.selected = false,
    this.onTap,
    this.onRemove,
    this.tone = AppChipTone.neutral,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color bg, fg;
    if (selected) {
      bg = isDark ? AppColors.primary.withValues(alpha: 0.18) : AppColors.primaryBg;
      fg = isDark ? AppColors.primaryLight : AppColors.primaryDark;
    } else {
      switch (tone) {
        case AppChipTone.primary:
          bg = isDark ? AppColors.primary.withValues(alpha: 0.18) : AppColors.primaryBg;
          fg = isDark ? AppColors.primaryLight : AppColors.primaryDark;
          break;
        case AppChipTone.success:
          bg = isDark ? AppColors.success.withValues(alpha: 0.18) : AppColors.successLight;
          fg = isDark ? AppColors.success : AppColors.successDark;
          break;
        case AppChipTone.warning:
          bg = isDark ? AppColors.warning.withValues(alpha: 0.18) : AppColors.warningLight;
          fg = isDark ? AppColors.warningAccent : AppColors.warningDark;
          break;
        case AppChipTone.accent:
          bg = isDark ? AppColors.error.withValues(alpha: 0.18) : AppColors.errorLight;
          fg = isDark ? AppColors.errorAccent : AppColors.error;
          break;
        case AppChipTone.neutral:
          bg = isDark ? AppColors.darkBorder : AppColors.gray100;
          fg = isDark ? AppColors.gray300 : AppColors.gray700;
          break;
      }
    }

    Widget body = Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadii.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (selected)
            Padding(
              padding: const EdgeInsets.only(right: 6),
              child: Icon(LucideIcons.check, size: 12, color: fg),
            )
          else if (icon != null)
            Padding(
              padding: const EdgeInsets.only(right: 6),
              child: Icon(icon, size: 13, color: fg),
            ),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: fg,
            ),
          ),
          if (onRemove != null)
            GestureDetector(
              onTap: onRemove,
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: const EdgeInsets.only(left: 6),
                child: Icon(LucideIcons.x, size: 12, color: fg.withValues(alpha: 0.8)),
              ),
            ),
        ],
      ),
    );

    if (onTap != null) {
      return InkWell(
        borderRadius: BorderRadius.circular(AppRadii.pill),
        onTap: onTap,
        child: body,
      );
    }
    return body;
  }
}
