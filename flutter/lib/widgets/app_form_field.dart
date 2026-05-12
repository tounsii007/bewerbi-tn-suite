import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Visual wrapper for a form field — label + optional hint/error + required-mark. Compose with
/// any input widget (Material [TextField], [DropdownButtonFormField], custom widgets).
///
/// ```dart
/// AppFormField(
///   label: 'E-Mail',
///   required: true,
///   error: state.errors?.email,
///   child: TextField(controller: emailCtrl, decoration: ...),
/// )
/// ```
class AppFormField extends StatelessWidget {
  final String? label;
  final String? hint;
  final String? error;
  final bool required;
  final Widget child;

  /// Compact pads vertical spacing; comfortable is the default.
  final bool compact;

  const AppFormField({
    super.key,
    required this.child,
    this.label,
    this.hint,
    this.error,
    this.required = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark ? AppColors.gray200 : AppColors.gray700;
    final hintColor  = isDark ? AppColors.gray400 : AppColors.gray500;
    final gap = compact ? 4.0 : 8.0;
    final bottom = compact ? 12.0 : 16.0;

    return Padding(
      padding: EdgeInsets.only(bottom: bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (label != null)
            Padding(
              padding: EdgeInsets.only(bottom: gap),
              child: RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: label!,
                      style: GoogleFonts.inter(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: labelColor,
                      ),
                    ),
                    if (required)
                      TextSpan(
                        text: ' *',
                        style: GoogleFonts.inter(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.error,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          child,
          if (error != null)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                error!,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.error,
                ),
              ),
            )
          else if (hint != null)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                hint!,
                style: GoogleFonts.inter(fontSize: 11.5, color: hintColor),
              ),
            ),
        ],
      ),
    );
  }
}
