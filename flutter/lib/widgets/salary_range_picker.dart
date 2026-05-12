import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

class SalaryRangePicker extends StatelessWidget {
  final int? min;
  final int? max;
  final ValueChanged<({int? min, int? max})> onChanged;
  final String currency;
  final List<int> buckets;

  const SalaryRangePicker({
    super.key,
    this.min,
    this.max,
    required this.onChanged,
    this.currency = '€',
    this.buckets = const [0, 20000, 30000, 40000, 50000, 60000, 75000, 90000, 120000],
  });

  String _formatK(int v) {
    if (v == 0) return '0';
    if (v >= 1000) return '${(v / 1000).round()}k';
    return '$v';
  }

  String get _label {
    if (min == null && max == null) return 'Alle Gehälter';
    if (max == null) return 'ab ${_formatK(min!)} $currency';
    if (min == null) return 'bis ${_formatK(max!)} $currency';
    return '${_formatK(min!)} – ${_formatK(max!)} $currency';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark ? AppColors.gray400 : AppColors.gray500;
    final titleColor = isDark ? AppColors.white : AppColors.gray900;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'GEHALT ($currency)',
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: labelColor,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          _label,
          style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: titleColor),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text('Minimum', style: GoogleFonts.inter(fontSize: 11, color: labelColor)),
        const SizedBox(height: AppSpacing.xs),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _BucketChip(
              label: 'Alle',
              active: min == null,
              onTap: () => onChanged((min: null, max: max)),
            ),
            ...buckets.skip(1).map((b) => _BucketChip(
                  label: '${_formatK(b)}+',
                  active: min == b,
                  onTap: () {
                    final nextMax = (max != null && max! < b) ? null : max;
                    onChanged((min: b, max: nextMax));
                  },
                )),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        Text('Maximum', style: GoogleFonts.inter(fontSize: 11, color: labelColor)),
        const SizedBox(height: AppSpacing.xs),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _BucketChip(
              label: '∞',
              active: max == null,
              onTap: () => onChanged((min: min, max: null)),
            ),
            ...buckets.skip(1).map((b) {
              final disabled = min != null && b < min!;
              return _BucketChip(
                label: 'bis ${_formatK(b)}',
                active: max == b,
                disabled: disabled,
                onTap: disabled ? null : () => onChanged((min: min, max: b)),
              );
            }),
          ],
        ),
      ],
    );
  }
}

class _BucketChip extends StatelessWidget {
  final String label;
  final bool active;
  final bool disabled;
  final VoidCallback? onTap;

  const _BucketChip({
    required this.label,
    required this.active,
    this.disabled = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Opacity(
      opacity: disabled ? 0.3 : 1,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: active
                ? AppColors.primary
                : (isDark ? AppColors.darkCard : AppColors.white),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: active
                  ? AppColors.primary
                  : (isDark ? AppColors.darkBorder : AppColors.gray200),
            ),
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: active
                  ? AppColors.white
                  : (isDark ? AppColors.white : AppColors.gray700),
            ),
          ),
        ),
      ),
    );
  }
}
