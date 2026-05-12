import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

enum AppButtonVariant { primary, secondary, outline, ghost }

enum AppButtonSize { sm, md, lg }

class AppButton extends StatefulWidget {
  final String title;
  final VoidCallback onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool loading;
  final bool disabled;
  final Widget? icon;
  final bool fullWidth;

  const AppButton({
    super.key,
    required this.title,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.md,
    this.loading = false,
    this.disabled = false,
    this.icon,
    this.fullWidth = false,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  double _scale = 1.0;

  double get _height {
    switch (widget.size) {
      case AppButtonSize.sm:
        return 36;
      case AppButtonSize.md:
        return 48;
      case AppButtonSize.lg:
        return 52;
    }
  }

  double get _fontSize {
    switch (widget.size) {
      case AppButtonSize.sm:
        return 13;
      case AppButtonSize.md:
        return 15;
      case AppButtonSize.lg:
        return 16;
    }
  }

  EdgeInsets get _padding {
    switch (widget.size) {
      case AppButtonSize.sm:
        return const EdgeInsets.symmetric(horizontal: 12);
      case AppButtonSize.md:
        return const EdgeInsets.symmetric(horizontal: 20);
      case AppButtonSize.lg:
        return const EdgeInsets.symmetric(horizontal: 24);
    }
  }

  Color get _backgroundColor {
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return AppColors.primary;
      case AppButtonVariant.secondary:
        return AppColors.error;
      case AppButtonVariant.outline:
      case AppButtonVariant.ghost:
        return Colors.transparent;
    }
  }

  Color get _foregroundColor {
    switch (widget.variant) {
      case AppButtonVariant.primary:
      case AppButtonVariant.secondary:
        return AppColors.white;
      case AppButtonVariant.outline:
        return AppColors.primary;
      case AppButtonVariant.ghost:
        return AppColors.primary;
    }
  }

  BorderSide? get _border {
    if (widget.variant == AppButtonVariant.outline) {
      return const BorderSide(color: AppColors.primary, width: 1.5);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = widget.disabled || widget.loading;

    return GestureDetector(
      onTapDown: isDisabled ? null : (_) => setState(() => _scale = 0.96),
      onTapUp: isDisabled ? null : (_) => setState(() => _scale = 1.0),
      onTapCancel: isDisabled ? null : () => setState(() => _scale = 1.0),
      onTap: isDisabled ? null : widget.onPressed,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 100),
        child: AnimatedOpacity(
          opacity: isDisabled ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 200),
          child: Container(
            height: _height,
            width: widget.fullWidth ? double.infinity : null,
            padding: _padding,
            decoration: BoxDecoration(
              color: _backgroundColor,
              borderRadius: BorderRadius.circular(12),
              border: _border != null
                  ? Border.fromBorderSide(_border!)
                  : null,
            ),
            child: Row(
              mainAxisSize:
                  widget.fullWidth ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (widget.loading)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: SizedBox(
                      width: _fontSize,
                      height: _fontSize,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: _foregroundColor,
                      ),
                    ),
                  )
                else if (widget.icon != null)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: IconTheme(
                      data: IconThemeData(
                        color: _foregroundColor,
                        size: _fontSize + 2,
                      ),
                      child: widget.icon!,
                    ),
                  ),
                Text(
                  widget.title,
                  style: GoogleFonts.inter(
                    fontSize: _fontSize,
                    fontWeight: FontWeight.w600,
                    color: _foregroundColor,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
