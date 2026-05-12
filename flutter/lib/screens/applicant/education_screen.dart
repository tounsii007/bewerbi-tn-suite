import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/education.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/app_input.dart';

class EducationScreen extends ConsumerStatefulWidget {
  const EducationScreen({super.key});

  @override
  ConsumerState<EducationScreen> createState() => _EducationScreenState();
}

class _EducationScreenState extends ConsumerState<EducationScreen> {
  late List<Education> _entries;
  bool _initialized = false;

  String _formatDate(DateTime date) {
    return DateFormat('MMM yyyy', 'de_DE').format(date);
  }

  String _dateRange(Education edu) {
    final start = _formatDate(edu.startDate);
    final end = edu.endDate != null ? _formatDate(edu.endDate!) : 'Aktuell';
    return '$start - $end';
  }

  void _initEntries() {
    if (_initialized) return;
    final userId = ref.read(authProvider).profile?.userId;
    if (userId == null) return;
    _entries = mockEducation.where((e) => e.userId == userId).toList();
    _initialized = true;
  }

  void _showAddDialog({Education? existing}) {
    String degree = existing?.degree ?? '';
    String institution = existing?.institution ?? '';
    String fieldOfStudy = existing?.fieldOfStudy ?? '';
    String startDateStr = existing != null
        ? DateFormat('yyyy-MM').format(existing.startDate)
        : '';
    String endDateStr = existing != null && existing.endDate != null
        ? DateFormat('yyyy-MM').format(existing.endDate!)
        : '';
    String description = existing?.description ?? '';

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
                          ? 'Bildung bearbeiten'
                          : 'Bildung hinzufügen',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.white : AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 20),
                    AppInput(
                      label: 'Abschluss',
                      value: degree,
                      onChanged: (v) =>
                          setSheetState(() => degree = v),
                      placeholder: 'z.B. Bachelor, Master',
                    ),
                    const SizedBox(height: 12),
                    AppInput(
                      label: 'Institution',
                      value: institution,
                      onChanged: (v) =>
                          setSheetState(() => institution = v),
                      placeholder: 'Name der Universität/Schule',
                    ),
                    const SizedBox(height: 12),
                    AppInput(
                      label: 'Fachrichtung',
                      value: fieldOfStudy,
                      onChanged: (v) =>
                          setSheetState(() => fieldOfStudy = v),
                      placeholder: 'z.B. Informatik',
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
                            value: endDateStr,
                            onChanged: (v) =>
                                setSheetState(() => endDateStr = v),
                            placeholder: '2023-06',
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
                      placeholder: 'Optional',
                      multiline: true,
                      maxLines: 3,
                    ),
                    const SizedBox(height: 24),
                    AppButton(
                      title: 'Speichern',
                      fullWidth: true,
                      icon: const Icon(LucideIcons.check, size: 18),
                      onPressed: () {
                        if (degree.isEmpty || institution.isEmpty) return;

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
                        if (endDateStr.isNotEmpty) {
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
                        final entry = Education(
                          id: existing?.id ??
                              'edu-${DateTime.now().millisecondsSinceEpoch}',
                          userId: userId,
                          institution: institution,
                          degree: degree,
                          fieldOfStudy: fieldOfStudy,
                          startDate: start,
                          endDate: end,
                          current: end == null,
                          description:
                              description.isNotEmpty ? description : null,
                        );

                        setState(() {
                          if (existing != null) {
                            final idx = _entries.indexWhere(
                              (e) => e.id == existing.id,
                            );
                            if (idx >= 0) _entries[idx] = entry;
                            final mIdx = mockEducation.indexWhere(
                              (e) => e.id == existing.id,
                            );
                            if (mIdx >= 0) mockEducation[mIdx] = entry;
                          } else {
                            _entries.add(entry);
                            mockEducation.add(entry);
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

  void _deleteEntry(Education edu) {
    setState(() {
      _entries.removeWhere((e) => e.id == edu.id);
      mockEducation.removeWhere((e) => e.id == edu.id);
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
        title: const Text('Bildung & Studium'),
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
                    LucideIcons.graduationCap,
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
                final edu = _entries[index];
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
                                  '${edu.degree} - ${edu.institution}',
                                  style: GoogleFonts.inter(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: isDark
                                        ? AppColors.white
                                        : AppColors.gray900,
                                  ),
                                ),
                                if (edu.fieldOfStudy.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    edu.fieldOfStudy,
                                    style: GoogleFonts.inter(
                                      fontSize: 13,
                                      color: isDark
                                          ? AppColors.gray300
                                          : AppColors.gray600,
                                    ),
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
                            onPressed: () => _deleteEntry(edu),
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
                            _dateRange(edu),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.gray500,
                            ),
                          ),
                        ],
                      ),
                      if (edu.description != null &&
                          edu.description!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          edu.description!,
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
