import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Consistent page/section header — eyebrow + title + description + optional trailing slot.
/// Use one per screen above the primary card stack so every screen has a clear identity.
class AppSectionHeader extends StatelessWidget {
  final String? eyebrow;
  final String title;
  final String? description;
  final Widget? trailing;
  final EdgeInsetsGeometry padding;

  const AppSectionHeader({
    super.key,
    required this.title,
    this.eyebrow,
    this.description,
    this.trailing,
    this.padding = const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
  });

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;
    final titleColor = isDark ? AppColors.white : AppColors.gray900;
    final descColor = isDark ? AppColors.gray400 : AppColors.gray500;

    return Padding(
      padding: padding,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (eyebrow != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      eyebrow!.toUpperCase(),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.4,
                    color: titleColor,
                  ),
                ),
                if (description != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      description!,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        height: 1.45,
                        color: descColor,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (trailing != null)
            Padding(
              padding: const EdgeInsets.only(left: 12),
              child: trailing!,
            ),
        ],
      ),
    );
  }
}
