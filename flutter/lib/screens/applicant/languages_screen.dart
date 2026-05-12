import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/language_skill.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';

class LanguagesScreen extends ConsumerStatefulWidget {
  const LanguagesScreen({super.key});

  @override
  ConsumerState<LanguagesScreen> createState() => _LanguagesScreenState();
}

class _LanguagesScreenState extends ConsumerState<LanguagesScreen> {
  late List<LanguageSkill> _entries;
  bool _initialized = false;

  static const List<String> _availableLanguages = [
    'Arabisch',
    'Französisch',
    'Deutsch',
    'Englisch',
    'Spanisch',
    'Italienisch',
    'Türkisch',
  ];

  static const List<LanguageLevel> _levels = LanguageLevel.values;

  void _initEntries() {
    if (_initialized) return;
    final userId = ref.read(authProvider).profile?.userId;
    if (userId == null) return;
    _entries = mockLanguages.where((e) => e.userId == userId).toList();
    _initialized = true;
  }

  void _showAddDialog() {
    String selectedLanguage = _availableLanguages.first;
    LanguageLevel selectedLevel = LanguageLevel.a1;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
              ),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.gray300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Sprache hinzufügen',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.white : AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Language selector
                    Text(
                      'Sprache',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isDark ? AppColors.gray300 : AppColors.gray700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppColors.darkSurface
                            : AppColors.gray50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isDark
                              ? AppColors.darkBorder
                              : AppColors.gray200,
                          width: 1.5,
                        ),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: selectedLanguage,
                          isExpanded: true,
                          dropdownColor:
                              isDark ? AppColors.darkCard : AppColors.white,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            color: isDark
                                ? AppColors.white
                                : AppColors.gray900,
                          ),
                          items: _availableLanguages.map((lang) {
                            return DropdownMenuItem(
                              value: lang,
                              child: Text(lang),
                            );
                          }).toList(),
                          onChanged: (v) {
                            if (v != null) {
                              setSheetState(() => selectedLanguage = v);
                            }
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Level selector
                    Text(
                      'Niveau',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isDark ? AppColors.gray300 : AppColors.gray700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: _levels.map((level) {
                        final isSelected = level == selectedLevel;
                        return Expanded(
                          child: Padding(
                            padding: EdgeInsets.only(
                              right:
                                  level != _levels.last ? 6 : 0,
                            ),
                            child: GestureDetector(
                              onTap: () =>
                                  setSheetState(() => selectedLevel = level),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary
                                      : (isDark
                                          ? AppColors.darkSurface
                                          : AppColors.gray100),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppColors.primary
                                        : (isDark
                                            ? AppColors.darkBorder
                                            : AppColors.gray200),
                                    width: 1.5,
                                  ),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  level.name.toUpperCase(),
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected
                                        ? AppColors.white
                                        : (isDark
                                            ? AppColors.gray300
                                            : AppColors.gray600),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),
                    AppButton(
                      title: 'Speichern',
                      fullWidth: true,
                      icon: const Icon(LucideIcons.check, size: 18),
                      onPressed: () {
                        final userId =
                            ref.read(authProvider).profile?.userId ?? '';
                        final entry = LanguageSkill(
                          id:
                              'lang-${DateTime.now().millisecondsSinceEpoch}',
                          userId: userId,
                          language: selectedLanguage,
                          level: selectedLevel,
                        );

                        setState(() {
                          _entries.add(entry);
                          mockLanguages.add(entry);
                        });

                        Navigator.of(ctx).pop();
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _deleteEntry(LanguageSkill lang) {
    setState(() {
      _entries.removeWhere((e) => e.id == lang.id);
      mockLanguages.removeWhere((e) => e.id == lang.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    _initEntries();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        title: const Text('Sprachkenntnisse'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(LucideIcons.plus, color: AppColors.white),
      ),
      body: _entries.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.languages,
                    size: 48,
                    color: isDark ? AppColors.gray600 : AppColors.gray300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Noch keine Sprachen',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.gray400 : AppColors.gray500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tippe auf +, um eine Sprache hinzuzufügen',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.gray400,
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
              itemCount: _entries.length,
              separatorBuilder: (_, index) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final lang = _entries[index];
                return AppCard(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          LucideIcons.languages,
                          size: 20,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          lang.language,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.white
                                : AppColors.gray900,
                          ),
                        ),
                      ),
                      AppBadge(
                        label: lang.level.name.toUpperCase(),
                        variant: BadgeVariant.info,
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Icon(
                          LucideIcons.trash2,
                          size: 18,
                          color: AppColors.error.withValues(alpha: 0.7),
                        ),
                        onPressed: () => _deleteEntry(lang),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
