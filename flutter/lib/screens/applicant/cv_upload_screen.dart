import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';

class CvHints {
  final String? email;
  final String? phone;
  final String? germanLevel;
  final List<String> skills;
  final List<String> languages;

  const CvHints({
    this.email,
    this.phone,
    this.germanLevel,
    this.skills = const [],
    this.languages = const [],
  });

  factory CvHints.fromJson(Map<String, dynamic> json) => CvHints(
        email: json['email'] as String?,
        phone: json['phone'] as String?,
        germanLevel: json['germanLevel'] as String?,
        skills: (json['skills'] as List<dynamic>? ?? []).map((e) => e as String).toList(),
        languages: (json['languages'] as List<dynamic>? ?? []).map((e) => e as String).toList(),
      );

  bool get isEmpty =>
      email == null &&
      phone == null &&
      germanLevel == null &&
      skills.isEmpty &&
      languages.isEmpty;
}

class CvUploadScreen extends StatefulWidget {
  const CvUploadScreen({super.key});

  @override
  State<CvUploadScreen> createState() => _CvUploadScreenState();
}

class _CvUploadScreenState extends State<CvUploadScreen> {
  bool _uploading = false;
  CvHints? _hints;
  String? _error;

  Future<void> _pickAndUpload() async {
    setState(() {
      _error = null;
    });
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );
    if (result == null || result.files.isEmpty) return;

    setState(() => _uploading = true);
    try {
      if (ApiClient.isApiMode) {
        final path = result.files.single.path;
        if (path != null) {
          final upload = await ApiClient.instance.uploadFile(
            '/api/v1/documents',
            File(path),
            'file',
            {'type': 'CV'},
          );
          final docId = (upload as Map<String, dynamic>)['id'] as String;
          final hints = await ApiClient.instance.post('/api/v1/cv/$docId/autofill') as Map<String, dynamic>;
          setState(() => _hints = CvHints.fromJson(hints));
        }
      } else {
        // Mock — show sample hints so the UI is demonstrable offline
        setState(() => _hints = const CvHints(
              email: 'kandidat@example.tn',
              phone: '+216 12 345 678',
              germanLevel: 'B2',
              skills: ['React', 'TypeScript', 'Spring Boot'],
              languages: ['Arabisch (Muttersprache)', 'Französisch (C1)', 'Deutsch (B2)'],
            ));
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        title: Text('Lebenslauf hochladen', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_hints == null) _buildDropZone(isDark),
            if (_error != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(_error!, style: GoogleFonts.inter(color: AppColors.error, fontSize: 13)),
            ],
            if (_hints != null) _buildHints(_hints!, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildDropZone(bool isDark) {
    return GestureDetector(
      onTap: _uploading ? null : _pickAndUpload,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 48),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.gray200,
            width: 2,
            style: BorderStyle.solid,
          ),
        ),
        child: Column(
          children: [
            if (_uploading)
              const SizedBox(
                width: 32,
                height: 32,
                child: CircularProgressIndicator(strokeWidth: 3),
              )
            else
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: AppAlphas.faint),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.upload, size: 28, color: AppColors.primary),
              ),
            const SizedBox(height: AppSpacing.md),
            Text(
              _uploading ? 'Analysiere Lebenslauf…' : 'PDF auswählen',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 4),
            Text('Wir extrahieren Text und füllen dein Profil vor',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: isDark ? AppColors.gray400 : AppColors.gray500,
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildHints(CvHints hints, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(LucideIcons.sparkles, size: 18, color: AppColors.primary),
            const SizedBox(width: 8),
            Text('Automatisches Ausfüllen',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppColors.white : AppColors.gray900,
                )),
          ],
        ),
        const SizedBox(height: 6),
        Text('Wir haben folgende Angaben im CV erkannt. Übernehmen?',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: isDark ? AppColors.gray400 : AppColors.gray500,
            )),
        const SizedBox(height: AppSpacing.lg),
        if (hints.isEmpty)
          Text('Keine Daten automatisch erkannt',
              style: GoogleFonts.inter(color: AppColors.gray500))
        else ...[
          if (hints.email != null) _HintRow(icon: LucideIcons.mail, label: 'E-Mail', value: hints.email!, isDark: isDark),
          if (hints.phone != null) _HintRow(icon: LucideIcons.phone, label: 'Telefon', value: hints.phone!, isDark: isDark),
          if (hints.germanLevel != null)
            _HintRow(icon: LucideIcons.languages, label: 'Deutsch-Niveau', value: hints.germanLevel!, isDark: isDark),
          if (hints.skills.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            _ChipRow(title: 'Kompetenzen', items: hints.skills, isDark: isDark),
          ],
          if (hints.languages.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            _ChipRow(title: 'Sprachen', items: hints.languages, isDark: isDark),
          ],
        ],
        const SizedBox(height: AppSpacing.lg),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              // TODO: apply hints to profile provider
              Navigator.of(context).pop();
            },
            icon: const Icon(Icons.check, color: AppColors.white),
            label: Text('Alle übernehmen',
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: AppRadii.lgRadius),
            ),
          ),
        ),
      ],
    );
  }
}

class _HintRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isDark;
  const _HintRow({required this.icon, required this.label, required this.value, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: AppRadii.lgRadius,
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: AppAlphas.faint),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: AppColors.primary, size: 16),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.gray400 : AppColors.gray500,
                      letterSpacing: 0.8,
                    )),
                Text(value,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.white : AppColors.gray900,
                    )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChipRow extends StatelessWidget {
  final String title;
  final List<String> items;
  final bool isDark;

  const _ChipRow({required this.title, required this.items, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title.toUpperCase(),
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.gray400 : AppColors.gray500,
              letterSpacing: 0.8,
            )),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: items
              .map((v) => Chip(
                    label: Text(v),
                    backgroundColor: AppColors.primaryBg,
                    labelStyle: GoogleFonts.inter(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ))
              .toList(),
        ),
      ],
    );
  }
}
