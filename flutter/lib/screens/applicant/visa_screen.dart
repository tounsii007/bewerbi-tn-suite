import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

enum VisaType {
  blueCard('Blaue Karte EU (§18b)'),
  skilledVocational('Fachkraft Berufsausbildung (§18a)'),
  skilledAcademic('Fachkraft akademisch (§18b)'),
  vocationalTraining('Ausbildungsvisum (§16a)'),
  study('Studienvisum (§16b)'),
  jobSeeker('Jobsuche (§20)'),
  recognition('Anerkennung (§16d)'),
  chancenkarte('Chancenkarte (§20a)');

  final String labelDe;
  const VisaType(this.labelDe);
}

class VisaRequirement {
  final String id;
  final String title;
  final String description;
  final bool required;
  bool completed;

  VisaRequirement({
    required this.id,
    required this.title,
    required this.description,
    this.required = true,
    this.completed = false,
  });
}

class VisaCase {
  final VisaType type;
  final List<VisaRequirement> requirements;

  const VisaCase({required this.type, required this.requirements});

  int get progressPercent {
    final req = requirements.where((r) => r.required).toList();
    if (req.isEmpty) return 0;
    final done = req.where((r) => r.completed).length;
    return ((100 * done) / req.length).round();
  }
}

class VisaScreen extends StatefulWidget {
  const VisaScreen({super.key});

  @override
  State<VisaScreen> createState() => _VisaScreenState();
}

class _VisaScreenState extends State<VisaScreen> {
  VisaCase? _case;

  List<VisaRequirement> _seed(VisaType t) {
    final base = [
      VisaRequirement(id: '1', title: 'Gültiger Reisepass', description: 'Noch mind. 6 Monate gültig nach Einreise.'),
      VisaRequirement(id: '2', title: 'Biometrische Passfotos', description: 'Zwei aktuelle biometrische Fotos.'),
      VisaRequirement(id: '3', title: 'Visumsantrag (Videx)', description: 'Ausgefüllter Antrag über videx.diplo.de.'),
      VisaRequirement(id: '4', title: 'Krankenversicherung', description: 'Auslands- oder dt. Krankenversicherung.'),
    ];
    switch (t) {
      case VisaType.blueCard:
        base.addAll([
          VisaRequirement(id: '5', title: 'Arbeitsvertrag mit Mindestgehalt', description: '≥ 45.300 € Brutto (2024).'),
          VisaRequirement(id: '6', title: 'Hochschulabschluss anerkannt', description: 'anabin H+ oder deutsche Anerkennung.'),
          VisaRequirement(id: '7', title: 'Zustimmung BA', description: 'Bei bestimmten Berufen.', required: false),
        ]);
        break;
      case VisaType.skilledVocational:
        base.addAll([
          VisaRequirement(id: '5', title: 'Anerkennungsbescheid', description: 'Gleichwertigkeit der Ausbildung.'),
          VisaRequirement(id: '6', title: 'Arbeitsvertrag', description: 'Verbindliches Angebot aus Deutschland.'),
          VisaRequirement(id: '7', title: 'Deutsch B1', description: 'Je nach Beruf ggf. B2.'),
        ]);
        break;
      case VisaType.skilledAcademic:
        base.addAll([
          VisaRequirement(id: '5', title: 'Anerkannter Hochschulabschluss', description: 'anabin H+.'),
          VisaRequirement(id: '6', title: 'Passender Arbeitsvertrag', description: 'Stelle passend zur Qualifikation.'),
        ]);
        break;
      case VisaType.vocationalTraining:
        base.addAll([
          VisaRequirement(id: '5', title: 'Ausbildungsvertrag', description: 'Schul-/Betriebsvertrag in DE.'),
          VisaRequirement(id: '6', title: 'Deutsch B1', description: 'Anerkanntes Zertifikat.'),
          VisaRequirement(id: '7', title: 'Finanzierungsnachweis', description: 'Sperrkonto / Verpflichtungserklärung.'),
        ]);
        break;
      case VisaType.study:
        base.addAll([
          VisaRequirement(id: '5', title: 'Zulassung Hochschule', description: 'Uni-Assist oder direkte Zulassung.'),
          VisaRequirement(id: '6', title: 'Sperrkonto 11.904 €', description: 'Finanzierung für 1 Jahr.'),
          VisaRequirement(id: '7', title: 'Sprachnachweis', description: 'TestDaF/DSH oder IELTS je nach Studiengang.'),
        ]);
        break;
      case VisaType.jobSeeker:
        base.addAll([
          VisaRequirement(id: '5', title: 'Hochschulabschluss (H+)', description: 'Oder gleichwertige Qualifikation.'),
          VisaRequirement(id: '6', title: 'Finanzierung ≥ 6 Monate', description: 'Sperrkonto.'),
        ]);
        break;
      case VisaType.recognition:
        base.addAll([
          VisaRequirement(id: '5', title: 'Teilanerkennungsbescheid', description: 'Mit konkreter Ausgleichsmaßnahme.'),
          VisaRequirement(id: '6', title: 'Nachweis Lehrgang/Prüfung', description: 'Träger der Ausgleichsmaßnahme.'),
        ]);
        break;
      case VisaType.chancenkarte:
        base.addAll([
          VisaRequirement(id: '5', title: 'Punktesystem ≥ 6', description: 'Deutsch, Alter, Erfahrung, DE-Bezug.'),
          VisaRequirement(id: '6', title: 'Finanzierung ≥ 12 Monate', description: '~12.324 €.'),
        ]);
        break;
    }
    return base;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: Text('Visum-Tracker', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
      ),
      body: _case == null ? _buildTypeSelector(isDark) : _buildCase(_case!, isDark),
    );
  }

  Widget _buildTypeSelector(bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Row(
          children: [
            const Icon(LucideIcons.plane, color: AppColors.primary, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text('Welches Visum brauchst du?',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: isDark ? AppColors.gray400 : AppColors.gray600,
                  )),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        for (final t in VisaType.values) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: InkWell(
              onTap: () => setState(() => _case = VisaCase(type: t, requirements: _seed(t))),
              borderRadius: AppRadii.lgRadius,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkCard : AppColors.white,
                  borderRadius: AppRadii.lgRadius,
                  border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(t.labelDe,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: isDark ? AppColors.white : AppColors.gray900,
                          )),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.gray400),
                  ],
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildCase(VisaCase c, bool isDark) {
    final required = c.requirements.where((r) => r.required).toList();
    final done = required.where((r) => r.completed).length;
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
              Text(c.type.labelDe,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  )),
              const SizedBox(height: AppSpacing.md),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: c.progressPercent / 100,
                  minHeight: 8,
                  backgroundColor: isDark ? AppColors.darkBorder : AppColors.gray200,
                  valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                ),
              ),
              const SizedBox(height: 4),
              Text('$done / ${required.length} Nachweise erbracht',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  )),
            ],
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        for (final r in c.requirements) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: AppSpacing.sm),
            child: InkWell(
              onTap: () => setState(() => r.completed = !r.completed),
              borderRadius: AppRadii.lgRadius,
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: BoxDecoration(
                  color: r.completed
                      ? AppColors.successSoft
                      : !r.required
                          ? (isDark ? AppColors.darkBackground : AppColors.gray50)
                          : (isDark ? AppColors.darkCard : AppColors.white),
                  borderRadius: AppRadii.lgRadius,
                  border: Border.all(
                    color: r.completed
                        ? AppColors.success
                        : (isDark ? AppColors.darkBorder : AppColors.gray200),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: r.completed
                            ? AppColors.success
                            : (isDark ? AppColors.darkBorder : AppColors.gray100),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: r.completed
                          ? const Icon(Icons.check, size: 14, color: AppColors.white)
                          : const Icon(LucideIcons.fileCheck2, size: 14, color: AppColors.gray400),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(r.title,
                                    style: GoogleFonts.inter(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: r.completed
                                          ? AppColors.successDark
                                          : (isDark ? AppColors.white : AppColors.gray900),
                                    )),
                              ),
                              if (!r.required)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.darkBorder : AppColors.gray200,
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text('optional',
                                      style: GoogleFonts.inter(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: isDark ? AppColors.gray400 : AppColors.gray600,
                                      )),
                                ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(r.description,
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
            ),
          ),
        ],
      ],
    );
  }
}
