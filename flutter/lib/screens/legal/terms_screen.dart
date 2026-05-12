import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Nutzungsbedingungen',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppShadows.sm,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.gray500.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      LucideIcons.fileText,
                      size: 22,
                      color: isDark ? AppColors.gray300 : AppColors.gray500,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Allgemeine Nutzungsbedingungen',
                      style: GoogleFonts.inter(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: isDark ? AppColors.white : AppColors.gray900,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              _buildSection(
                isDark: isDark,
                number: '1',
                title: 'Geltungsbereich',
                body:
                    'Diese Nutzungsbedingungen gelten fuer die Nutzung der '
                    'Plattform bewerbi.tn und aller damit verbundenen '
                    'Dienstleistungen. Mit der Registrierung und Nutzung '
                    'der Plattform erklaeren Sie sich mit diesen '
                    'Bedingungen einverstanden.',
              ),

              _buildSection(
                isDark: isDark,
                number: '2',
                title: 'Registrierung und Konto',
                body:
                    'Fuer die Nutzung der Plattform ist eine Registrierung '
                    'erforderlich. Sie sind verpflichtet, wahrheitsgemuesse '
                    'Angaben zu machen und Ihre Zugangsdaten vertraulich '
                    'zu behandeln. Jeder Nutzer darf nur ein Konto '
                    'erstellen. Die missbräuchliche Nutzung mehrerer Konten '
                    'kann zur Sperrung fuehren.',
              ),

              _buildSection(
                isDark: isDark,
                number: '3',
                title: 'Nutzung der Plattform',
                body:
                    'Die Plattform dient der Vermittlung von '
                    'Arbeitsstellen in Deutschland fuer qualifizierte '
                    'Fachkraefte aus Tunesien. Die Nutzung ist '
                    'ausschliesslich fuer den vorgesehenen Zweck der '
                    'Stellensuche und -vermittlung gestattet.',
              ),

              _buildSection(
                isDark: isDark,
                number: '4',
                title: 'Pflichten der Nutzer',
                body:
                    'Nutzer verpflichten sich:\n\n'
                    '- Keine falschen oder irretuehrenden Angaben zu machen\n'
                    '- Die Plattform nicht fuer illegale Zwecke zu nutzen\n'
                    '- Keine Inhalte hochzuladen, die gegen geltendes Recht '
                    'verstossen\n'
                    '- Die Rechte anderer Nutzer zu respektieren\n'
                    '- Keine automatisierten Zugriffe auf die Plattform '
                    'durchzufuehren',
              ),

              _buildSection(
                isDark: isDark,
                number: '5',
                title: 'Stellenanzeigen und Bewerbungen',
                body:
                    'Arbeitgeber sind fuer die Richtigkeit ihrer '
                    'Stellenanzeigen verantwortlich. bewerbi.tn uebernimmt '
                    'keine Garantie fuer die Richtigkeit der '
                    'veroeffentlichten Stellenangebote. Bewerber sind fuer '
                    'die Richtigkeit ihrer Bewerbungsunterlagen '
                    'eigenverantwortlich.',
              ),

              _buildSection(
                isDark: isDark,
                number: '6',
                title: 'Haftungsausschluss',
                body:
                    'bewerbi.tn haftet nicht fuer:\n\n'
                    '- Die Richtigkeit der von Nutzern bereitgestellten '
                    'Informationen\n'
                    '- Den Erfolg einer Bewerbung oder Vermittlung\n'
                    '- Schaeden, die durch die Nutzung der Plattform '
                    'entstehen\n'
                    '- Voruebergehende Nichtverfuegbarkeit der Plattform\n'
                    '- Handlungen Dritter auf der Plattform',
              ),

              _buildSection(
                isDark: isDark,
                number: '7',
                title: 'Aenderungen der AGB',
                body:
                    'bewerbi.tn behaelt sich das Recht vor, diese '
                    'Nutzungsbedingungen jederzeit zu aendern. '
                    'Nutzer werden ueber wesentliche Aenderungen per '
                    'E-Mail informiert. Die fortgesetzte Nutzung der '
                    'Plattform nach Bekanntgabe der Aenderungen gilt '
                    'als Zustimmung.',
              ),

              _buildSection(
                isDark: isDark,
                number: '8',
                title: 'Anwendbares Recht',
                body:
                    'Es gilt tunesisches Recht. Gerichtsstand ist '
                    'Tunis, Tunesien.',
              ),

              _buildSection(
                isDark: isDark,
                number: '9',
                title: 'Kontakt',
                body:
                    'Bei Fragen zu den Nutzungsbedingungen wenden Sie '
                    'sich bitte an:\n\n'
                    'bewerbi.tn SARL\n'
                    'E-Mail: legal@bewerbi.tn\n'
                    'Telefon: +216 70 000 000',
              ),

              const SizedBox(height: 24),
              Divider(
                color: isDark ? AppColors.darkBorder : AppColors.gray200,
              ),
              const SizedBox(height: 12),
              Text(
                'Zuletzt aktualisiert: 01. April 2026',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AppColors.gray400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection({
    required bool isDark,
    required String number,
    required String title,
    required String body,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$number. $title',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            body,
            style: GoogleFonts.inter(
              fontSize: 14,
              height: 1.6,
              color: isDark ? AppColors.gray300 : AppColors.gray600,
            ),
          ),
        ],
      ),
    );
  }
}
