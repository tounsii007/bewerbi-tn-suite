import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

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
          'Datenschutzerklaerung',
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
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      LucideIcons.shield,
                      size: 22,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Datenschutzerklaerung',
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
                title: 'Verantwortliche Stelle',
                body:
                    'Verantwortlich fuer die Datenverarbeitung ist:\n\n'
                    'bewerbi.tn SARL\n'
                    'Rue du Lac Biwa\n'
                    'Les Berges du Lac\n'
                    '1053 Tunis, Tunesien\n'
                    'E-Mail: datenschutz@bewerbi.tn',
              ),

              _buildSection(
                isDark: isDark,
                number: '2',
                title: 'Erhobene Daten',
                body:
                    'Im Rahmen der Nutzung unserer Plattform erheben und '
                    'verarbeiten wir folgende personenbezogene Daten:\n\n'
                    '- Vor- und Nachname\n'
                    '- E-Mail-Adresse\n'
                    '- Telefonnummer\n'
                    '- Lebenslauf und Bewerbungsunterlagen\n'
                    '- Bewerbungsdaten (Stellenanzeigen, Status, Verlauf)',
              ),

              _buildSection(
                isDark: isDark,
                number: '3',
                title: 'Zweck der Datenverarbeitung',
                body:
                    'Ihre Daten werden ausschliesslich fuer folgende Zwecke '
                    'verwendet:\n\n'
                    '- Vermittlung von Stellenangeboten zwischen Bewerbern '
                    'und Arbeitgebern\n'
                    '- Herstellung des Kontakts zwischen Bewerbern und '
                    'potenziellen Arbeitgebern in Deutschland\n'
                    '- Verwaltung Ihres Benutzerkontos\n'
                    '- Verbesserung unserer Dienstleistungen',
              ),

              _buildSection(
                isDark: isDark,
                number: '4',
                title: 'Datenweitergabe',
                body:
                    'Ihre personenbezogenen Daten werden nur an Arbeitgeber '
                    'weitergegeben, bei denen Sie sich aktiv beworben haben. '
                    'Eine Weitergabe an Dritte ohne Ihre ausdrueckliche '
                    'Zustimmung findet nicht statt.',
              ),

              _buildSection(
                isDark: isDark,
                number: '5',
                title: 'Speicherdauer',
                body:
                    'Ihre Daten werden so lange gespeichert, wie Ihr '
                    'Benutzerkonto aktiv ist. Nach Loeschung Ihres Kontos '
                    'werden alle personenbezogenen Daten innerhalb von '
                    '30 Tagen unwiderruflich geloescht.',
              ),

              _buildSection(
                isDark: isDark,
                number: '6',
                title: 'Ihre Rechte',
                body:
                    'Sie haben folgende Rechte bezueglich Ihrer '
                    'personenbezogenen Daten:\n\n'
                    '- Auskunft: Sie koennen jederzeit Auskunft ueber Ihre '
                    'gespeicherten Daten verlangen.\n'
                    '- Loeschung: Sie koennen die Loeschung Ihrer Daten '
                    'beantragen.\n'
                    '- Berichtigung: Sie koennen die Korrektur falscher '
                    'Daten verlangen.\n'
                    '- Datenuebertragbarkeit: Sie haben das Recht, Ihre '
                    'Daten in einem gaengigen Format zu erhalten.',
              ),

              _buildSection(
                isDark: isDark,
                number: '7',
                title: 'Kontakt',
                body:
                    'Bei Fragen zum Datenschutz wenden Sie sich bitte an:\n\n'
                    'datenschutz@bewerbi.tn',
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
