import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  String _feedbackText = '';

  void _showFeedbackSheet() {
    setState(() => _feedbackText = '');
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        final isDark = Theme.of(sheetContext).brightness == Brightness.dark;
        return Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            20 + MediaQuery.of(sheetContext).viewInsets.bottom,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.gray600 : AppColors.gray300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Feedback senden',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Wir freuen uns ueber Ihr Feedback und Ihre '
                'Verbesserungsvorschlaege.',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: isDark ? AppColors.gray300 : AppColors.gray600,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                maxLines: 5,
                onChanged: (v) => _feedbackText = v,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
                decoration: InputDecoration(
                  hintText: 'Ihr Feedback...',
                  hintStyle: GoogleFonts.inter(
                    fontSize: 14,
                    color: isDark ? AppColors.gray500 : AppColors.gray400,
                  ),
                  filled: true,
                  fillColor:
                      isDark ? AppColors.darkSurface : AppColors.gray50,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: isDark
                          ? AppColors.darkBorder
                          : AppColors.gray200,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: isDark
                          ? AppColors.darkBorder
                          : AppColors.gray200,
                    ),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                      color: AppColors.primary,
                      width: 1.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(sheetContext).pop();
                    if (_feedbackText.isNotEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            'Vielen Dank fuer Ihr Feedback! (Demo)',
                            style: GoogleFonts.inter(),
                          ),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: AppColors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Absenden',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

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
          'Hilfe & Support',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // FAQ section header
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    LucideIcons.helpCircle,
                    size: 20,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  'Haeufig gestellte Fragen',
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // FAQ tiles
            _buildFaqCard(isDark: isDark, items: [
              _FaqItem(
                question: 'Wie bewerbe ich mich?',
                answer:
                    'Oeffne eine Stellenanzeige und klicke auf '
                    '"Jetzt bewerben". Fuelle das Bewerbungsformular aus '
                    'und lade deinen Lebenslauf hoch. Nach dem Absenden '
                    'wird deine Bewerbung direkt an den Arbeitgeber '
                    'weitergeleitet.',
              ),
              _FaqItem(
                question: 'Wie lade ich meinen Lebenslauf hoch?',
                answer:
                    'Gehe zu Profil > Dokumente und klicke auf '
                    '"Dokument hinzufuegen". Du kannst PDF- und '
                    'Word-Dateien hochladen. Dein Lebenslauf wird '
                    'automatisch bei Bewerbungen angehoengt.',
              ),
              _FaqItem(
                question: 'Wie funktioniert die Anerkennung?',
                answer:
                    'Die Anerkennung Ihres Abschlusses ist ein wichtiger '
                    'Schritt fuer die Arbeit in Deutschland. bewerbi.tn '
                    'unterstuetzt Sie bei der Zusammenstellung der '
                    'benoetigten Unterlagen und vermittelt Sie an '
                    'zustaendige Anerkennungsstellen.',
              ),
              _FaqItem(
                question: 'Welche Deutschkenntnisse brauche ich?',
                answer:
                    'Die meisten Stellen erfordern mindestens '
                    'Deutschkenntnisse auf dem Niveau B1. Fuer '
                    'medizinische Berufe wird haeufig B2 verlangt. '
                    'Technische Berufe koennen teilweise auch mit A2 '
                    'und Englischkenntnissen beginnen.',
              ),
              _FaqItem(
                question: 'Wie kontaktiere ich einen Arbeitgeber?',
                answer:
                    'Ueber die Nachrichtenfunktion in der App kannst du '
                    'direkt mit Arbeitgebern kommunizieren. Nachdem du '
                    'dich beworben hast, wird ein Nachrichtenkanal '
                    'eroeffnet.',
              ),
            ]),

            const SizedBox(height: 24),

            // Contact section
            Text(
              'Kontakt',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 12),

            _buildContactCard(
              isDark: isDark,
              icon: LucideIcons.mail,
              iconColor: AppColors.primary,
              title: 'E-Mail',
              value: 'support@bewerbi.tn',
            ),
            const SizedBox(height: 8),
            _buildContactCard(
              isDark: isDark,
              icon: LucideIcons.phone,
              iconColor: AppColors.success,
              title: 'Telefon',
              value: '+216 70 000 000',
            ),
            const SizedBox(height: 8),
            _buildContactCard(
              isDark: isDark,
              icon: LucideIcons.messageCircle,
              iconColor: const Color(0xFF25D366),
              title: 'WhatsApp',
              value: '+216 70 000 000',
            ),

            const SizedBox(height: 24),

            // Feedback button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _showFeedbackSheet,
                icon: Icon(LucideIcons.messageSquare, size: 20),
                label: Text(
                  'Feedback senden',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqCard({
    required bool isDark,
    required List<_FaqItem> items,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppShadows.sm,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          children: items.map((item) {
            return Theme(
              data: Theme.of(context).copyWith(
                dividerColor: Colors.transparent,
              ),
              child: ExpansionTile(
                tilePadding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                childrenPadding:
                    const EdgeInsets.fromLTRB(20, 0, 20, 16),
                leading: Icon(
                  LucideIcons.helpCircle,
                  size: 18,
                  color: AppColors.primary,
                ),
                title: Text(
                  item.question,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray800,
                  ),
                ),
                iconColor:
                    isDark ? AppColors.gray400 : AppColors.gray500,
                collapsedIconColor:
                    isDark ? AppColors.gray400 : AppColors.gray500,
                children: [
                  Text(
                    item.answer,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      height: 1.6,
                      color:
                          isDark ? AppColors.gray300 : AppColors.gray600,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildContactCard({
    required bool isDark,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: AppShadows.sm,
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.gray400,
                  ),
                ),
                Text(
                  value,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray800,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            LucideIcons.externalLink,
            size: 16,
            color: isDark ? AppColors.gray500 : AppColors.gray400,
          ),
        ],
      ),
    );
  }
}

class _FaqItem {
  final String question;
  final String answer;

  const _FaqItem({required this.question, required this.answer});
}
