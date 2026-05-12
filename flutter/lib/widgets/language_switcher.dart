import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/locale_provider.dart';

class _LangOption {
  final String code;
  final String flag;
  final String nativeLabel;
  final String englishLabel;
  final bool rtl;

  const _LangOption(this.code, this.flag, this.nativeLabel, this.englishLabel, this.rtl);
}

const List<_LangOption> _languages = [
  _LangOption('de', '🇩🇪', 'Deutsch', 'German', false),
  _LangOption('fr', '🇫🇷', 'Français', 'French', false),
  _LangOption('ar', '🇹🇳', 'العربية', 'Arabic', true),
];

enum LanguageSwitcherVariant { button, inline }

class LanguageSwitcher extends ConsumerWidget {
  final LanguageSwitcherVariant variant;

  const LanguageSwitcher({super.key, this.variant = LanguageSwitcherVariant.button});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocale = ref.watch(localeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final current =
        _languages.firstWhere((l) => l.code == (currentLocale?.languageCode ?? 'de'),
            orElse: () => _languages.first);

    if (variant == LanguageSwitcherVariant.inline) {
      return Wrap(
        spacing: 8,
        runSpacing: 8,
        children: _languages.map((opt) {
          final active = opt.code == (currentLocale?.languageCode ?? 'de');
          return GestureDetector(
            onTap: () => ref.read(localeProvider.notifier).setLocale(Locale(opt.code)),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(opt.flag, style: const TextStyle(fontSize: 14)),
                  const SizedBox(width: 6),
                  Text(
                    opt.nativeLabel,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: active
                          ? AppColors.white
                          : (isDark ? AppColors.white : AppColors.gray800),
                    ),
                  ),
                  if (active) ...[
                    const SizedBox(width: 4),
                    const Icon(Icons.check, size: 14, color: AppColors.white),
                  ],
                ],
              ),
            ),
          );
        }).toList(),
      );
    }

    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: () => _showPicker(context, ref),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.globe, size: 14, color: AppColors.gray500),
            const SizedBox(width: 6),
            Text(current.flag, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 6),
            Text(current.nativeLabel,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.white : AppColors.gray800,
                )),
          ],
        ),
      ),
    );
  }

  void _showPicker(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final currentLocale = ref.watch(localeProvider);
        return SafeArea(
          child: Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : AppColors.white,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Sprache / Langue / اللغة',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.white : AppColors.gray900,
                    )),
                const SizedBox(height: 12),
                ..._languages.map((opt) {
                  final active = opt.code == (currentLocale?.languageCode ?? 'de');
                  return InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () async {
                      await ref.read(localeProvider.notifier).setLocale(Locale(opt.code));
                      if (ctx.mounted) Navigator.of(ctx).pop();
                    },
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 6),
                      decoration: BoxDecoration(
                        color: active
                            ? AppColors.primaryBg
                            : (isDark ? AppColors.darkBackground : AppColors.gray50),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Text(opt.flag, style: const TextStyle(fontSize: 24)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(opt.nativeLabel,
                                    style: GoogleFonts.inter(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: active
                                          ? AppColors.primaryDark
                                          : (isDark ? AppColors.white : AppColors.gray900),
                                    )),
                                Text(
                                    '${opt.englishLabel}${opt.rtl ? ' · RTL' : ''}',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      color: isDark ? AppColors.gray400 : AppColors.gray500,
                                    )),
                              ],
                            ),
                          ),
                          if (active)
                            const Icon(Icons.check_circle, color: AppColors.primary),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }
}
