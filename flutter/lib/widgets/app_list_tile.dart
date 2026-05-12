import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'app_pressable.dart';

/// The single most common row pattern in account / settings / overview screens. Keeps spacing,
/// optional divider, and trailing chevron consistent across the app.
class AppListTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool divider;

  /// Red title + no chevron tint — for log out / delete account rows.
  final bool destructive;

  const AppListTile({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.onTap,
    this.divider = false,
    this.destructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;
    final titleColor = destructive
        ? AppColors.error
        : (isDark ? AppColors.white : AppColors.gray900);
    final subColor = isDark ? AppColors.gray400 : AppColors.gray500;
    final dividerColor = isDark ? AppColors.darkBorder : AppColors.gray100;
    final chevronColor = isDark ? AppColors.gray500 : AppColors.gray400;

    final row = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          if (leading != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: leading!,
            ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: titleColor,
                  ),
                ),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      subtitle!,
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        color: subColor,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
          ),
          if (trailing != null)
            trailing!
          else if (onTap != null)
            Icon(LucideIcons.chevronRight, size: 18, color: chevronColor),
        ],
      ),
    );

    return Column(
      children: [
        if (onTap != null)
          AppPressable(
            onTap: onTap,
            scaleTo: 0.99,
            child: row,
          )
        else
          row,
        if (divider)
          Container(
            margin: const EdgeInsets.only(left: 20),
            height: 1,
            color: dividerColor,
          ),
      ],
    );
  }
}
