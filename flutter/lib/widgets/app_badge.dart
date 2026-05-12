import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

enum BadgeVariant { defaultVariant, success, warning, error, info }

enum BadgeSize { sm, md }

class AppBadge extends StatelessWidget {
  final String label;
  final BadgeVariant variant;
  final BadgeSize size;

  const AppBadge({
    super.key,
    required this.label,
    this.variant = BadgeVariant.defaultVariant,
    this.size = BadgeSize.sm,
  });

  Color get _backgroundColor {
    switch (variant) {
      case BadgeVariant.defaultVariant:
        return AppColors.gray100;
      case BadgeVariant.success:
        return AppColors.successSoft;
      case BadgeVariant.warning:
        return AppColors.warningSoft;
      case BadgeVariant.error:
        return AppColors.errorSoft;
      case BadgeVariant.info:
        return AppColors.primaryBg;
    }
  }

  Color get _textColor {
    switch (variant) {
      case BadgeVariant.defaultVariant:
        return AppColors.gray600;
      case BadgeVariant.success:
        return AppColors.successDark;
      case BadgeVariant.warning:
        return AppColors.warningDark;
      case BadgeVariant.error:
        return AppColors.error;
      case BadgeVariant.info:
        return AppColors.primary;
    }
  }

  EdgeInsets get _padding {
    switch (size) {
      case BadgeSize.sm:
        return const EdgeInsets.symmetric(horizontal: 10, vertical: 4);
      case BadgeSize.md:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
    }
  }

  double get _fontSize {
    switch (size) {
      case BadgeSize.sm:
        return 12;
      case BadgeSize.md:
        return 13;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: _padding,
      decoration: BoxDecoration(
        color: _backgroundColor,
        borderRadius: AppRadii.smRadius,
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: _fontSize,
          fontWeight: FontWeight.w500,
          color: _textColor,
        ),
      ),
    );
  }
}
