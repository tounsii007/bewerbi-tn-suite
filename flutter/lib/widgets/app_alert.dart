import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

enum AppAlertVariant { info, success, warning, error, neutral }

/// Inline page-anchored notice — distinct from snack bars which are transient. Encode severity
/// via [variant]; the leading icon is set automatically but can be overridden via [icon].
class AppAlert extends StatelessWidget {
  final AppAlertVariant variant;
  final String? title;
  final String message;
  final IconData? icon;
  final Widget? action;
  final bool compact;

  const AppAlert({
    super.key,
    required this.message,
    this.variant = AppAlertVariant.info,
    this.title,
    this.icon,
    this.action,
    this.compact = false,
  });

  IconData _defaultIcon() {
    switch (variant) {
      case AppAlertVariant.success:
        return LucideIcons.checkCircle2;
      case AppAlertVariant.warning:
        return LucideIcons.alertTriangle;
      case AppAlertVariant.error:
        return LucideIcons.xCircle;
      case AppAlertVariant.neutral:
        return LucideIcons.alertCircle;
      case AppAlertVariant.info:
        return LucideIcons.info;
    }
  }

  ({Color bg, Color border, Color fg}) _palette(bool isDark) {
    switch (variant) {
      case AppAlertVariant.success:
        return (
          bg: (isDark ? AppColors.success : AppColors.successLight).withOpacity(isDark ? 0.1 : 0.4),
          border: AppColors.success,
          fg: isDark ? AppColors.success : AppColors.successDark,
        );
      case AppAlertVariant.warning:
        return (
          bg: (isDark ? AppColors.warning : AppColors.warningLight).withOpacity(isDark ? 0.12 : 0.4),
          border: AppColors.warning,
          fg: isDark ? AppColors.warningAccent : AppColors.warningDark,
        );
      case AppAlertVariant.error:
        return (
          bg: (isDark ? AppColors.error : AppColors.errorLight).withOpacity(isDark ? 0.12 : 0.5),
          border: AppColors.error,
          fg: isDark ? AppColors.errorAccent : AppColors.error,
        );
      case AppAlertVariant.neutral:
        return (
          bg: isDark ? AppColors.darkCard : AppColors.gray100,
          border: isDark ? AppColors.darkBorder : AppColors.gray300,
          fg: isDark ? AppColors.gray200 : AppColors.gray700,
        );
      case AppAlertVariant.info:
        return (
          bg: (isDark ? AppColors.info : AppColors.infoLight).withOpacity(isDark ? 0.12 : 0.4),
          border: AppColors.info,
          fg: AppColors.info,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final p = _palette(isDark);
    final pad = compact ? 8.0 : 14.0;

    return Container(
      padding: EdgeInsets.all(pad),
      decoration: BoxDecoration(
        color: p.bg,
        border: Border.all(color: p.border.withOpacity(0.4)),
        borderRadius: BorderRadius.circular(AppRadii.md),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon ?? _defaultIcon(), color: p.fg, size: compact ? 14 : 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 2),
                    child: Text(
                      title!,
                      style: GoogleFonts.inter(
                        fontSize: compact ? 12 : 13.5,
                        fontWeight: FontWeight.w700,
                        color: p.fg,
                      ),
                    ),
                  ),
                Text(
                  message,
                  style: GoogleFonts.inter(
                    fontSize: compact ? 11.5 : 13,
                    color: p.fg.withOpacity(0.9),
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          if (action != null) ...[
            const SizedBox(width: 8),
            action!,
          ],
        ],
      ),
    );
  }
}
