import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

class AppRadioOption<T> {
  final T value;
  final String label;
  final String? description;
  const AppRadioOption({required this.value, required this.label, this.description});
}

enum AppRadioVariant { compact, card }

/// Vertical radio group. Two variants:
///   - [AppRadioVariant.compact] — inline circle + label (form sections)
///   - [AppRadioVariant.card]    — card row with description (onboarding)
class AppRadioGroup<T> extends StatelessWidget {
  final List<AppRadioOption<T>> options;
  final T? value;
  final ValueChanged<T> onChanged;
  final AppRadioVariant variant;

  const AppRadioGroup({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
    this.variant = AppRadioVariant.compact,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final titleColor = isDark ? AppColors.white : AppColors.gray900;
    final descColor = isDark ? AppColors.gray400 : AppColors.gray500;
    final dividerColor = isDark ? AppColors.darkBorder : AppColors.gray100;
    final bgColor = isDark ? AppColors.darkCard : AppColors.white;

    return Semantics(
      container: true,
      label: 'Radio group',
      child: Column(
        children: [
          for (var i = 0; i < options.length; i++)
            Builder(
              builder: (ctx) {
                final o = options[i];
                final isSelected = o.value == value;
                return Semantics(
                  inMutuallyExclusiveGroup: true,
                  selected: isSelected,
                  label: o.label,
                  child: InkWell(
                    onTap: () => onChanged(o.value),
                    child: Column(
                      children: [
                        Container(
                          padding: variant == AppRadioVariant.card
                              ? const EdgeInsets.symmetric(horizontal: 16, vertical: 14)
                              : const EdgeInsets.symmetric(vertical: 8),
                          color: variant == AppRadioVariant.card ? bgColor : null,
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 20,
                                height: 20,
                                margin: const EdgeInsets.only(right: 12, top: 1),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    width: 2,
                                    color: isSelected
                                        ? AppColors.primary
                                        : (isDark ? AppColors.gray500 : AppColors.gray300),
                                  ),
                                ),
                                child: isSelected
                                    ? Center(
                                        child: Container(
                                          width: 10,
                                          height: 10,
                                          decoration: const BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                      )
                                    : null,
                              ),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      o.label,
                                      style: GoogleFonts.inter(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: titleColor,
                                      ),
                                    ),
                                    if (o.description != null)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 2),
                                        child: Text(
                                          o.description!,
                                          style: GoogleFonts.inter(
                                            fontSize: 12,
                                            color: descColor,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (variant == AppRadioVariant.card && i < options.length - 1)
                          Container(
                            margin: const EdgeInsets.only(left: 48),
                            height: 1,
                            color: dividerColor,
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
