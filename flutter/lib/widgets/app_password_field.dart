import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Text field tuned for password entry. Shows a toggle to reveal/hide, masks by default,
/// disables autocorrect/suggestions, and emits a strength indicator when the field is in
/// "register" mode.
class AppPasswordField extends StatefulWidget {
  final TextEditingController controller;
  final String? hintText;
  final String? error;
  final void Function(String)? onChanged;

  /// When true, shows the four-bar strength indicator below the field.
  final bool showStrength;

  /// Submit handler — usually wired to {@code FocusScope.of(context).nextFocus()}.
  final VoidCallback? onSubmitted;

  const AppPasswordField({
    super.key,
    required this.controller,
    this.hintText,
    this.error,
    this.onChanged,
    this.showStrength = false,
    this.onSubmitted,
  });

  @override
  State<AppPasswordField> createState() => _AppPasswordFieldState();
}

class _AppPasswordFieldState extends State<AppPasswordField> {
  bool _obscure = true;
  int _strength = 0;

  void _handleChange(String v) {
    if (widget.showStrength) {
      setState(() => _strength = _scorePassword(v));
    }
    widget.onChanged?.call(v);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: widget.controller,
          obscureText: _obscure,
          autocorrect: false,
          enableSuggestions: false,
          textInputAction: TextInputAction.done,
          onChanged: _handleChange,
          onSubmitted: (_) => widget.onSubmitted?.call(),
          decoration: InputDecoration(
            hintText: widget.hintText,
            errorText: widget.error,
            suffixIcon: IconButton(
              icon: Icon(_obscure ? LucideIcons.eye : LucideIcons.eyeOff, size: 18),
              onPressed: () => setState(() => _obscure = !_obscure),
              splashRadius: 18,
              color: isDark ? AppColors.gray400 : AppColors.gray500,
              tooltip: _obscure ? 'Anzeigen' : 'Verbergen',
            ),
          ),
        ),
        if (widget.showStrength) ...[
          const SizedBox(height: 8),
          Row(
            children: List.generate(4, (i) {
              final filled = i < _strength;
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(right: i < 3 ? 4 : 0),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 4,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: filled
                          ? _strengthColor(_strength)
                          : (isDark ? AppColors.darkBorder : AppColors.gray200),
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  static int _scorePassword(String pw) {
    if (pw.length < 6) return 0;
    int score = 0;
    if (pw.length >= 8) score++;
    if (RegExp(r'[A-Z]').hasMatch(pw) && RegExp(r'[a-z]').hasMatch(pw)) score++;
    if (RegExp(r'[0-9]').hasMatch(pw)) score++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(pw)) score++;
    return score;
  }

  static Color _strengthColor(int score) {
    if (score <= 1) return AppColors.error;
    if (score == 2) return AppColors.warning;
    if (score == 3) return AppColors.info;
    return AppColors.success;
  }
}
