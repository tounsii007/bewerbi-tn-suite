import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Settings-row with a title (and optional subtitle) on the left and a Material [Switch] on
/// the right. Tap-anywhere-to-toggle by default. Consistent with the mobile RN
/// `ListItem` + `Switch` combo so cross-platform settings look identical.
class AppSwitchTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final Widget? leading;
  final bool divider;

  const AppSwitchTile({
    super.key,
    required this.title,
    required this.value,
    required this.onChanged,
    this.subtitle,
    this.leading,
    this.divider = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? AppColors.white : AppColors.gray900;
    final subColor = isDark ? AppColors.gray400 : AppColors.gray500;
    final dividerColor = isDark ? AppColors.darkBorder : AppColors.gray100;

    return Column(
      children: [
        InkWell(
          onTap: () => onChanged(!value),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
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
                          ),
                        ),
                    ],
                  ),
                ),
                Switch.adaptive(
                  value: value,
                  onChanged: onChanged,
                  activeColor: AppColors.primary,
                ),
              ],
            ),
          ),
        ),
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
