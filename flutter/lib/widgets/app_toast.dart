import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

enum AppToastVariant { success, error, warning, info }

/// Branded snackbar wrapper. Use {@link AppToast.show(context, …)} instead of
/// `ScaffoldMessenger.of(context).showSnackBar(...)` so every toast looks the same and the
/// auto-icon + tone-border are applied for you.
///
/// ```dart
/// AppToast.show(
///   context,
///   message: 'Bewerbung gesendet',
///   variant: AppToastVariant.success,
/// );
/// ```
class AppToast {
  AppToast._();

  static void show(
    BuildContext context, {
    required String message,
    AppToastVariant variant = AppToastVariant.info,
    String? actionLabel,
    VoidCallback? onAction,
    Duration duration = const Duration(seconds: 4),
  }) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;

    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;
    final palette = _palette(variant, isDark);

    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        duration: duration,
        backgroundColor: isDark ? AppColors.darkCard : AppColors.white,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.lg),
          side: BorderSide(color: palette.border, width: 1),
        ),
        content: Row(
          children: [
            Container(
              width: 4,
              height: 36,
              decoration: BoxDecoration(
                color: palette.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(width: 12),
            Icon(palette.icon, color: palette.iconColor, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
            ),
          ],
        ),
        action: actionLabel != null && onAction != null
            ? SnackBarAction(
                label: actionLabel,
                textColor: palette.iconColor,
                onPressed: onAction,
              )
            : null,
      ),
    );
  }

  static ({IconData icon, Color iconColor, Color border}) _palette(
    AppToastVariant variant,
    bool isDark,
  ) {
    switch (variant) {
      case AppToastVariant.success:
        return (icon: LucideIcons.checkCircle2, iconColor: AppColors.success, border: AppColors.success);
      case AppToastVariant.error:
        return (icon: LucideIcons.xCircle, iconColor: AppColors.error, border: AppColors.error);
      case AppToastVariant.warning:
        return (icon: LucideIcons.alertTriangle, iconColor: AppColors.warning, border: AppColors.warning);
      case AppToastVariant.info:
        return (icon: LucideIcons.info, iconColor: AppColors.info, border: AppColors.info);
    }
  }
}
