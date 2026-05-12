import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

enum ToastVariant { success, error, info, warning }

/// Small wrapper around Flutter's SnackBar that applies the app colour system
/// and provides shortcut methods for the four common variants.
class Toast {
  Toast._();

  static void show(
    BuildContext context, {
    required String message,
    ToastVariant variant = ToastVariant.info,
    SnackBarAction? action,
    Duration duration = const Duration(seconds: 4),
  }) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;

    final (bg, fg, icon) = switch (variant) {
      ToastVariant.success => (AppColors.successSoft, AppColors.successDark, LucideIcons.checkCircle),
      ToastVariant.error => (AppColors.errorSoft, AppColors.error, LucideIcons.alertCircle),
      ToastVariant.warning => (AppColors.warningSoft, AppColors.warningDark, LucideIcons.alertTriangle),
      ToastVariant.info => (AppColors.primaryBg, AppColors.primaryDark, LucideIcons.info),
    };

    messenger.showSnackBar(
      SnackBar(
        backgroundColor: bg,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(AppSpacing.lg),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
        shape: RoundedRectangleBorder(borderRadius: AppRadii.lgRadius),
        duration: duration,
        elevation: 2,
        action: action,
        content: Row(
          children: [
            Icon(icon, size: 18, color: fg),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: fg,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static void success(BuildContext context, String message, {SnackBarAction? action}) =>
      show(context, message: message, variant: ToastVariant.success, action: action);

  static void error(BuildContext context, String message, {SnackBarAction? action}) =>
      show(context, message: message, variant: ToastVariant.error, action: action);

  static void info(BuildContext context, String message, {SnackBarAction? action}) =>
      show(context, message: message, variant: ToastVariant.info, action: action);

  static void warning(BuildContext context, String message, {SnackBarAction? action}) =>
      show(context, message: message, variant: ToastVariant.warning, action: action);
}
