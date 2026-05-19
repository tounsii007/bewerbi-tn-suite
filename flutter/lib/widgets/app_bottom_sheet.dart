import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Slide-up modal helper. Use [AppBottomSheet.show] instead of [showModalBottomSheet] directly
/// to get the branded grabber, rounded top corners, and consistent close button without copy-
/// pasting that boilerplate on every screen.
///
/// ```dart
/// AppBottomSheet.show(
///   context,
///   title: 'Filter',
///   child: const FilterPanel(),
/// );
/// ```
class AppBottomSheet {
  AppBottomSheet._();

  static Future<T?> show<T>(
    BuildContext context, {
    required Widget child,
    String? title,
    bool fullScreen = false,
    bool dismissible = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: fullScreen,
      isDismissible: dismissible,
      enableDrag: dismissible,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.45),
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: fullScreen ? MainAxisSize.max : MainAxisSize.min,
            children: [
              const SizedBox(height: 10),
              Container(
                width: 40,
                height: 5,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkBorder : AppColors.gray200,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              if (title != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 12, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: GoogleFonts.inter(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.white : AppColors.gray900,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.x, size: 18),
                        onPressed: () => Navigator.of(ctx).maybePop(),
                        color: isDark ? AppColors.gray400 : AppColors.gray500,
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.all(6),
                        style: IconButton.styleFrom(
                          backgroundColor:
                              isDark ? AppColors.darkBorder : AppColors.gray100,
                          shape: const CircleBorder(),
                        ),
                      ),
                    ],
                  ),
                )
              else
                const SizedBox(height: 8),
              Flexible(child: child),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}
