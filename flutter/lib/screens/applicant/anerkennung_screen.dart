import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

enum RegulationType {
  regulated('Reglementierter Beruf', 'z. B. Pflege, Ärzte, Lehrer'),
  nonRegulated('Nicht reglementierter Beruf', 'z. B. IT, kaufmännisch'),
  unknown('Weiß nicht', '');

  final String labelDe;
  final String hintDe;
  const RegulationType(this.labelDe, this.hintDe);
}

class AnerkennungStep {
  final String id;
  final String title;
  final String description;
  bool completed;

  AnerkennungStep({
    required this.id,
    required this.title,
    required this.description,
    this.completed = false,
  });
}

class AnerkennungCase {
  final String profession;
  final RegulationType regulationType;
  final String competentAuthority;
  final List<AnerkennungStep> steps;

  const AnerkennungCase({
    required this.profession,
    required this.regulationType,
    required this.competentAuthority,
    required this.steps,
  });

  int get progressPercent {
    if (steps.isEmpty) return 0;
    final done = steps.where((s) => s.completed).length;
    return ((100 * done) / steps.length).round();
  }
}

class AnerkennungScreen extends StatefulWidget {
  const AnerkennungScreen({super.key});

  @override
  State<AnerkennungScreen> createState() => _AnerkennungScreenState();
}

class _AnerkennungScreenState extends State<AnerkennungScreen> {
  AnerkennungCase? _case;
  final _professionCtrl = TextEditingController();
  RegulationType _regulation = RegulationType.unknown;

  @override
  void dispose() {
    _professionCtrl.dispose();
    super.dispose();
  }

  String _inferAuthority(String profession, RegulationType r) {
    final p = profession.toLowerCase();
    if (p.contains('pfleg') || p.contains('kranken') || p.contains('arzt') || p.contains('ärzt')) {
      return 'Zuständige Landesbehörde (Gesundheit)';
    }
    if (p.contains('elektr') || p.contains('schreiner') || p.contains('maurer') || p.contains('schlosser')) {
      return 'Handwerkskammer';
    }
    if (r == RegulationType.nonRegulated) return 'IHK FOSA (Foreign Skills Approval)';
    return 'Zentralstelle für ausländisches Bildungswesen (ZAB)';
  }

  void _start() {
    final p = _professionCtrl.text.trim();
    if (p.isEmpty) return;
    setState(() {
      _case = AnerkennungCase(
        profession: p,
        regulationType: _regulation,
        competentAuthority: _inferAuthority(p, _regulation),
        steps: [
          AnerkennungStep(
            id: '1',
            title: 'Informationsgespräch ZAB / IHK FOSA',
            description: 'Kostenlose Erstberatung zur Anerkennung Ihres ausländischen Berufsabschlusses.',
          ),
          AnerkennungStep(
            id: '2',
            title: 'Unterlagen zusammenstellen',
            description: 'Zeugnisse, beglaubigte Übersetzungen, Lebenslauf, Identitätsnachweis.',
          ),
          AnerkennungStep(
            id: '3',
            title: 'Antrag auf Anerkennung stellen',
            description: 'Antrag bei der zuständigen Stelle einreichen.',
          ),
          AnerkennungStep(
            id: '4',
            title: 'Gleichwertigkeitsprüfung abwarten',
            description: 'Bearbeitungsdauer ca. 3 Monate.',
          ),
          AnerkennungStep(
            id: '5',
            title: 'Ausgleichsmaßnahme (falls nötig)',
            description: 'Anpassungslehrgang, Kenntnisprüfung oder Eignungstest.',
          ),
          AnerkennungStep(
            id: '6',
            title: 'Anerkennungsbescheid erhalten',
            description: 'Volle, teilweise oder keine Gleichwertigkeit.',
          ),
        ],
      );
    });
  }

  void _toggle(AnerkennungStep step) {
    setState(() => step.completed = !step.completed);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: Text('Anerkennung', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
      ),
      body: _case == null ? _buildSetup(isDark) : _buildCase(_case!, isDark),
    );
  }

  Widget _buildSetup(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.graduationCap, color: AppColors.primary, size: 22),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'Schritt für Schritt zum Anerkennungsbescheid',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: isDark ? AppColors.gray400 : AppColors.gray600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xxl),
          Text('Welchen Beruf möchtest du anerkennen lassen?',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.white : AppColors.gray900,
              )),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: _professionCtrl,
            decoration: InputDecoration(
              hintText: 'z. B. Gesundheits- und Krankenpfleger/in',
              filled: true,
              fillColor: isDark ? AppColors.darkCard : AppColors.white,
              border: OutlineInputBorder(
                borderRadius: AppRadii.lgRadius,
                borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          Text('Reglementiert?',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.white : AppColors.gray900,
              )),
          const SizedBox(height: AppSpacing.sm),
          for (final r in RegulationType.values) ...[
            GestureDetector(
              onTap: () => setState(() => _regulation = r),
              child: Container(
                margin: const EdgeInsets.only(bottom: AppSpacing.sm),
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: _regulation == r
                      ? AppColors.primaryBg
                      : (isDark ? AppColors.darkCard : AppColors.white),
                  borderRadius: AppRadii.lgRadius,
                  border: Border.all(
                    color: _regulation == r
                        ? AppColors.primary
                        : (isDark ? AppColors.darkBorder : AppColors.gray200),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(r.labelDe,
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: _regulation == r
                              ? AppColors.primaryDark
                              : (isDark ? AppColors.white : AppColors.gray900),
                        )),
                    if (r.hintDe.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(r.hintDe,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: isDark ? AppColors.gray400 : AppColors.gray500,
                          )),
                    ],
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _start,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: AppRadii.lgRadius),
              ),
              child: Text('Jetzt starten',
                  style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCase(AnerkennungCase c, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.white,
            borderRadius: AppRadii.lgRadius,
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.building2, color: AppColors.primary, size: 16),
                  const SizedBox(width: 6),
                  Text('ZUSTÄNDIGE STELLE',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.gray400 : AppColors.gray500,
                        letterSpacing: 0.8,
                      )),
                ],
              ),
              const SizedBox(height: 6),
              Text(c.competentAuthority,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  )),
              const SizedBox(height: 4),
              Text(c.profession,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: isDark ? AppColors.gray400 : AppColors.gray500,
                  )),
              const SizedBox(height: AppSpacing.md),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: c.progressPercent / 100,
                  minHeight: 8,
                  backgroundColor: isDark ? AppColors.darkBorder : AppColors.gray200,
                  valueColor: const AlwaysStoppedAnimation(AppColors.success),
                ),
              ),
              const SizedBox(height: 4),
              Text('${c.progressPercent}% abgeschlossen',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.successDark,
                  )),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        for (int i = 0; i < c.steps.length; i++) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.md),
            child: _StepCard(
              number: i + 1,
              step: c.steps[i],
              isDark: isDark,
              onToggle: () => _toggle(c.steps[i]),
            ),
          ),
        ],
      ],
    );
  }
}

class _StepCard extends StatelessWidget {
  final int number;
  final AnerkennungStep step;
  final bool isDark;
  final VoidCallback onToggle;

  const _StepCard({
    required this.number,
    required this.step,
    required this.isDark,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final done = step.completed;
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: done
              ? AppColors.successSoft
              : (isDark ? AppColors.darkCard : AppColors.white),
          borderRadius: AppRadii.lgRadius,
          border: Border.all(
            color: done
                ? AppColors.success
                : (isDark ? AppColors.darkBorder : AppColors.gray200),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: done
                    ? AppColors.success
                    : (isDark ? AppColors.darkBorder : AppColors.gray100),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: done
                  ? const Icon(Icons.check, size: 16, color: AppColors.white)
                  : Text('$number',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.gray400 : AppColors.gray500,
                      )),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(step.title,
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: done
                            ? AppColors.successDark
                            : (isDark ? AppColors.white : AppColors.gray900),
                      )),
                  const SizedBox(height: 4),
                  Text(step.description,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        height: 1.45,
                        color: isDark ? AppColors.gray400 : AppColors.gray500,
                      )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
