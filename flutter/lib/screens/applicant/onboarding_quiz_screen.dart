import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';

enum RecognitionStatus {
  notStarted('Noch nicht gestartet'),
  inProgress('Antrag läuft'),
  partiallyRecognized('Teilweise anerkannt'),
  fullyRecognized('Voll anerkannt'),
  notRequired('Nicht erforderlich');

  final String labelDe;
  const RecognitionStatus(this.labelDe);
}

class OnboardingResult {
  final String desiredProfession;
  final LanguageLevel? germanLevel;
  final RecognitionStatus? recognitionStatus;
  final List<String> skills;

  const OnboardingResult({
    required this.desiredProfession,
    this.germanLevel,
    this.recognitionStatus,
    this.skills = const [],
  });
}

class OnboardingQuizScreen extends ConsumerStatefulWidget {
  const OnboardingQuizScreen({super.key});

  @override
  ConsumerState<OnboardingQuizScreen> createState() => _OnboardingQuizScreenState();
}

class _OnboardingQuizScreenState extends ConsumerState<OnboardingQuizScreen> {
  int _step = 0;
  final _professionCtrl = TextEditingController();
  final _skillCtrl = TextEditingController();
  LanguageLevel? _level;
  RecognitionStatus? _status;
  final List<String> _skills = [];

  static const int _totalSteps = 4;

  @override
  void dispose() {
    _professionCtrl.dispose();
    _skillCtrl.dispose();
    super.dispose();
  }

  bool get _canContinue {
    switch (_step) {
      case 0:
        return _professionCtrl.text.trim().length > 1;
      case 1:
        return _level != null;
      case 2:
        return _status != null;
      case 3:
        return true;
    }
    return false;
  }

  void _next() {
    if (_step < _totalSteps - 1) {
      setState(() => _step += 1);
    } else {
      _finish();
    }
  }

  void _finish() {
    // TODO: post to backend via ApiClient when wired
    if (mounted) context.go('/applicant/home');
  }

  void _skip() => context.go('/applicant/home');

  void _addSkill() {
    final v = _skillCtrl.text.trim();
    if (v.isNotEmpty && !_skills.contains(v)) {
      setState(() => _skills.add(v));
    }
    _skillCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final progress = (_step + 1) / _totalSteps;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Willkommen bei bewerbi.tn',
                                style: GoogleFonts.inter(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: isDark ? AppColors.white : AppColors.gray900,
                                )),
                            const SizedBox(height: 2),
                            Text('In 4 kurzen Schritten zu passenden Stellen',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: isDark ? AppColors.gray400 : AppColors.gray500,
                                )),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: _skip,
                        child: Text('Überspringen',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            )),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: isDark ? AppColors.darkBorder : AppColors.gray200,
                      valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('SCHRITT ${_step + 1} / $_totalSteps',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.gray400 : AppColors.gray400,
                        letterSpacing: 0.8,
                      )),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: _buildStep(isDark),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _canContinue ? _next : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: AppColors.gray300,
                    shape: RoundedRectangleBorder(borderRadius: AppRadii.lgRadius),
                  ),
                  child: Text(
                    _step < _totalSteps - 1 ? 'Weiter' : 'Abschließen',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep(bool isDark) {
    switch (_step) {
      case 0:
        return _stepProfession(isDark);
      case 1:
        return _stepLevel(isDark);
      case 2:
        return _stepRecognition(isDark);
      case 3:
        return _stepSkills(isDark);
    }
    return const SizedBox.shrink();
  }

  Widget _stepProfession(bool isDark) {
    return Column(
      key: const ValueKey('step0'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Welchen Beruf möchtest du ausüben?',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            )),
        const SizedBox(height: 6),
        Text('Hilft uns, passende Stellen für dich zu finden',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: isDark ? AppColors.gray400 : AppColors.gray500,
            )),
        const SizedBox(height: AppSpacing.lg),
        TextField(
          controller: _professionCtrl,
          onChanged: (_) => setState(() {}),
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'z. B. Krankenpfleger, IT-Entwickler, LKW-Fahrer',
            filled: true,
            fillColor: isDark ? AppColors.darkCard : AppColors.white,
            border: OutlineInputBorder(
              borderRadius: AppRadii.lgRadius,
              borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200),
            ),
          ),
        ),
      ],
    );
  }

  Widget _stepLevel(bool isDark) {
    const levels = LanguageLevel.values;
    return Column(
      key: const ValueKey('step1'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Wie gut ist dein Deutsch?',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            )),
        const SizedBox(height: 6),
        Text('Du kannst das Niveau später jederzeit anpassen',
            style: GoogleFonts.inter(fontSize: 13, color: isDark ? AppColors.gray400 : AppColors.gray500)),
        const SizedBox(height: AppSpacing.lg),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: levels.map((l) {
            final active = l == _level;
            return GestureDetector(
              onTap: () => setState(() => _level = l),
              child: Container(
                width: 104,
                height: 104,
                decoration: BoxDecoration(
                  color: active ? AppColors.primary : (isDark ? AppColors.darkCard : AppColors.white),
                  borderRadius: AppRadii.xlRadius,
                  border: Border.all(
                    color: active ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.gray200),
                    width: 2,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(l.name.toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: active ? AppColors.white : (isDark ? AppColors.white : AppColors.gray900),
                        )),
                    const SizedBox(height: 4),
                    Text(
                      l.name.startsWith('a') ? 'Anfänger' : l.name.startsWith('b') ? 'Fortgeschr.' : 'Fließend',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: active ? AppColors.white.withValues(alpha: AppAlphas.scrim) : (isDark ? AppColors.gray400 : AppColors.gray500),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _stepRecognition(bool isDark) {
    return Column(
      key: const ValueKey('step2'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Wie ist der Stand deiner Anerkennung?',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            )),
        const SizedBox(height: 6),
        Text('Wichtig vor allem für reglementierte Berufe',
            style: GoogleFonts.inter(fontSize: 13, color: isDark ? AppColors.gray400 : AppColors.gray500)),
        const SizedBox(height: AppSpacing.lg),
        for (final opt in RecognitionStatus.values) ...[
          GestureDetector(
            onTap: () => setState(() => _status = opt),
            child: Container(
              margin: const EdgeInsets.only(bottom: AppSpacing.sm),
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: _status == opt
                    ? AppColors.primaryBg
                    : (isDark ? AppColors.darkCard : AppColors.white),
                borderRadius: AppRadii.lgRadius,
                border: Border.all(
                  color: _status == opt
                      ? AppColors.primary
                      : (isDark ? AppColors.darkBorder : AppColors.gray200),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(opt.labelDe,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: _status == opt
                              ? AppColors.primaryDark
                              : (isDark ? AppColors.white : AppColors.gray900),
                        )),
                  ),
                  if (_status == opt) const Icon(Icons.check, color: AppColors.primary, size: 20),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _stepSkills(bool isDark) {
    return Column(
      key: const ValueKey('step3'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Deine wichtigsten Kompetenzen',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            )),
        const SizedBox(height: 6),
        Text('Tippe eine Kompetenz und bestätige',
            style: GoogleFonts.inter(fontSize: 13, color: isDark ? AppColors.gray400 : AppColors.gray500)),
        const SizedBox(height: AppSpacing.lg),
        TextField(
          controller: _skillCtrl,
          onSubmitted: (_) => _addSkill(),
          decoration: InputDecoration(
            hintText: 'React, Altenpflege, LKW-Führerschein…',
            filled: true,
            fillColor: isDark ? AppColors.darkCard : AppColors.white,
            suffixIcon: IconButton(icon: const Icon(Icons.add), onPressed: _addSkill),
            border: OutlineInputBorder(
              borderRadius: AppRadii.lgRadius,
              borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _skills
              .map((s) => Chip(
                    label: Text(s),
                    backgroundColor: AppColors.primaryBg,
                    labelStyle: GoogleFonts.inter(color: AppColors.primary, fontWeight: FontWeight.w600),
                    deleteIcon: const Icon(Icons.close, size: 16, color: AppColors.primary),
                    onDeleted: () => setState(() => _skills.remove(s)),
                  ))
              .toList(),
        ),
      ],
    );
  }
}
