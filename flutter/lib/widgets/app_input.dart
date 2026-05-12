import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

class AppInput extends StatefulWidget {
  final String? label;
  final String value;
  final ValueChanged<String> onChanged;
  final String? placeholder;
  final bool obscureText;
  final String? error;
  final bool multiline;
  final int maxLines;
  final TextInputType? keyboardType;
  final Widget? prefixIcon;

  const AppInput({
    super.key,
    this.label,
    required this.value,
    required this.onChanged,
    this.placeholder,
    this.obscureText = false,
    this.error,
    this.multiline = false,
    this.maxLines = 1,
    this.keyboardType,
    this.prefixIcon,
  });

  @override
  State<AppInput> createState() => _AppInputState();
}

class _AppInputState extends State<AppInput> {
  late final TextEditingController _controller;
  late final FocusNode _focusNode;
  bool _isFocused = false;
  bool _obscured = true;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
    _focusNode = FocusNode();
    _focusNode.addListener(_onFocusChanged);
  }

  @override
  void didUpdateWidget(covariant AppInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != _controller.text) {
      _controller.text = widget.value;
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChanged);
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _onFocusChanged() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  Color get _borderColor {
    if (widget.error != null) return AppColors.error;
    if (_isFocused) return AppColors.primary;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark ? AppColors.darkBorder : AppColors.gray200;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor = isDark ? AppColors.darkSurface : AppColors.gray50;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: isDark ? AppColors.gray300 : AppColors.gray700,
            ),
          ),
          const SizedBox(height: 6),
        ],
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: fillColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _borderColor,
              width: 1.5,
            ),
          ),
          child: TextField(
            controller: _controller,
            focusNode: _focusNode,
            onChanged: widget.onChanged,
            obscureText: widget.obscureText && _obscured,
            maxLines: widget.multiline ? widget.maxLines : 1,
            keyboardType: widget.multiline
                ? TextInputType.multiline
                : widget.keyboardType,
            style: GoogleFonts.inter(
              fontSize: 15,
              color: isDark ? AppColors.white : AppColors.gray900,
            ),
            decoration: InputDecoration(
              hintText: widget.placeholder,
              hintStyle: GoogleFonts.inter(
                fontSize: 14,
                color: isDark ? AppColors.gray500 : AppColors.gray400,
              ),
              prefixIcon: widget.prefixIcon,
              suffixIcon: widget.obscureText
                  ? GestureDetector(
                      onTap: () => setState(() => _obscured = !_obscured),
                      child: Icon(
                        _obscured ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.gray400,
                        size: 20,
                      ),
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              errorBorder: InputBorder.none,
              focusedErrorBorder: InputBorder.none,
            ),
          ),
        ),
        if (widget.error != null) ...[
          const SizedBox(height: 4),
          Text(
            widget.error!,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.error,
            ),
          ),
        ],
      ],
    );
  }
}
