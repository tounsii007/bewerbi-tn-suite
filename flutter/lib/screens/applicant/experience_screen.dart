import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/experience.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/app_input.dart';

class ExperienceScreen extends ConsumerStatefulWidget {
  const ExperienceScreen({super.key});

  @override
  ConsumerState<ExperienceScreen> createState() => _ExperienceScreenState();
}

class _ExperienceScreenState extends ConsumerState<ExperienceScreen> {
  late List<Experience> _entries;
  bool _initialized = false;

  String _formatDate(DateTime date) {
    return DateFormat('MMM yyyy', 'de_DE').format(date);
  }

  String _dateRange(Experience exp) {
    final start = _formatDate(exp.startDate);
    if (exp.current || exp.endDate == null) {
      return '$start - Aktuell';
    }
    return '$start - ${_formatDate(exp.endDate!)}';
  }

  void _initEntries() {
    if (_initialized) return;
    final userId = ref.read(authProvider).profile?.userId;
    if (userId == null) return;
    _entries = mockExperience.where((e) => e.userId == userId).toList();
    _initialized = true;
  }

  void _showAddDialog({Experience? existing}) {
    String position = existing?.position ?? '';
    String company = existing?.company ?? '';
    String location = existing?.location ?? '';
    String startDateStr = existing != null
        ? DateFormat('yyyy-MM').format(existing.startDate)
        : '';
    String endDateStr = existing != null && existing.endDate != null
        ? DateFormat('yyyy-MM').format(existing.endDate!)
        : '';
    String description = existing?.description ?? '';
    bool current = existing?.current ?? false;

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
              child: SingleChildScrollView(
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
                      existing != null
                          ? 'Erfahrung bearbeiten'
                          : 'Erfahrung hinzufügen',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.white : AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 20),
                    AppInput(
                      label: 'Position',
                      value: position,
                      onChanged: (v) =>
                          setSheetState(() => position = v),
                      placeholder: 'z.B. Software Entwickler',
                    ),
                    const SizedBox(height: 12),
                    AppInput(
                      label: 'Unternehmen',
                      value: company,
                      onChanged: (v) =>
                          setSheetState(() => company = v),
                      placeholder: 'Name des Unternehmens',
                    ),
                    const SizedBox(height: 12),
                    AppInput(
                      label: 'Standort',
                      value: location,
                      onChanged: (v) =>
                          setSheetState(() => location = v),
                      placeholder: 'z.B. Berlin, Deutschland',
                      prefixIcon: const Icon(LucideIcons.mapPin, size: 18),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: AppInput(
                            label: 'Beginn (JJJJ-MM)',
                            value: startDateStr,
                            onChanged: (v) =>
                                setSheetState(() => startDateStr = v),
                            placeholder: '2020-09',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: AppInput(
                            label: 'Ende (JJJJ-MM)',
                            value: current ? '' : endDateStr,
                            onChanged: (v) =>
                                setSheetState(() => endDateStr = v),
                            placeholder: current ? 'Aktuell' : '2023-06',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: current,
                            onChanged: (v) =>
                                setSheetState(() => current = v ?? false),
                            activeColor: AppColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Aktuell hier beschäftigt',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: isDark
                                ? AppColors.gray300
                                : AppColors.gray700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    AppInput(
                      label: 'Beschreibung',
                      value: description,
                      onChanged: (v) =>
                          setSheetState(() => description = v),
                      placeholder: 'Aufgaben und Verantwortungen',
                      multiline: true,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 24),
                    AppButton(
                      title: 'Speichern',
                      fullWidth: true,
                      icon: const Icon(LucideIcons.check, size: 18),
                      onPressed: () {
                        if (position.isEmpty || company.isEmpty) return;

                        DateTime? start;
                        DateTime? end;
                        try {
                          final sp = startDateStr.split('-');
                          start = DateTime(
                            int.parse(sp[0]),
                            int.parse(sp[1]),
                          );
                        } catch (_) {
                          return;
                        }
                        if (!current && endDateStr.isNotEmpty) {
                          try {
                            final ep = endDateStr.split('-');
                            end = DateTime(
                              int.parse(ep[0]),
                              int.parse(ep[1]),
                            );
                          } catch (_) {}
                        }

                        final userId =
                            ref.read(authProvider).profile?.userId ?? '';
                        final entry = Experience(
                          id: existing?.id ??
                              'exp-${DateTime.now().millisecondsSinceEpoch}',
                          userId: userId,
                          company: company,
                          position: position,
                          location: location.isNotEmpty ? location : null,
                          startDate: start,
                          endDate: current ? null : end,
                          current: current,
                          description:
                              description.isNotEmpty ? description : null,
                        );

                        setState(() {
                          if (existing != null) {
                            final idx = _entries.indexWhere(
                              (e) => e.id == existing.id,
                            );
                            if (idx >= 0) _entries[idx] = entry;
                            final mIdx = mockExperience.indexWhere(
                              (e) => e.id == existing.id,
                            );
                            if (mIdx >= 0) mockExperience[mIdx] = entry;
                          } else {
                            _entries.add(entry);
                            mockExperience.add(entry);
                          }
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

  void _deleteEntry(Experience exp) {
    setState(() {
      _entries.removeWhere((e) => e.id == exp.id);
      mockExperience.removeWhere((e) => e.id == exp.id);
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
        title: const Text('Berufserfahrung'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(),
        backgroundColor: AppColors.primary,
        child: const Icon(LucideIcons.plus, color: AppColors.white),
      ),
      body: _entries.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.briefcase,
                    size: 48,
                    color: isDark ? AppColors.gray600 : AppColors.gray300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Noch keine Einträge',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.gray400 : AppColors.gray500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tippe auf +, um einen Eintrag hinzuzufügen',
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
              separatorBuilder: (_, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final exp = _entries[index];
                return AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${exp.position} - ${exp.company}',
                                  style: GoogleFonts.inter(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.white
                                        : AppColors.gray900,
                                  ),
                                ),
                                if (exp.location != null &&
                                    exp.location!.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Icon(
                                        LucideIcons.mapPin,
                                        size: 13,
                                        color: AppColors.gray400,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        exp.location!,
                                        style: GoogleFonts.inter(
                                          fontSize: 13,
                                          color: isDark
                                              ? AppColors.gray300
                                              : AppColors.gray600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              LucideIcons.trash2,
                              size: 18,
                              color: AppColors.error.withValues(alpha: 0.7),
                            ),
                            onPressed: () => _deleteEntry(exp),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            LucideIcons.calendar,
                            size: 14,
                            color: AppColors.gray400,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _dateRange(exp),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.gray500,
                            ),
                          ),
                          if (exp.current) ...[
                            const SizedBox(width: 8),
                            const AppBadge(
                              label: 'Aktuell',
                              variant: BadgeVariant.success,
                            ),
                          ],
                        ],
                      ),
                      if (exp.description != null &&
                          exp.description!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          exp.description!,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: isDark
                                ? AppColors.gray400
                                : AppColors.gray500,
                            height: 1.4,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
    );
  }
}
