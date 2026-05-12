import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_input.dart';

class CreateListingScreen extends ConsumerStatefulWidget {
  const CreateListingScreen({super.key});

  @override
  ConsumerState<CreateListingScreen> createState() =>
      _CreateListingScreenState();
}

class _CreateListingScreenState extends ConsumerState<CreateListingScreen> {
  String _title = '';
  JobCategory _category = JobCategory.it;
  JobType _type = JobType.job;
  String _location = '';
  String _salaryRange = '';
  LanguageLevel _germanLevel = LanguageLevel.b1;
  String _description = '';
  String _requirements = '';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final labelColor = isDark ? AppColors.gray300 : AppColors.gray700;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        title: const Text('Neue Stelle erstellen'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            AppInput(
              label: 'Titel',
              value: _title,
              onChanged: (v) => setState(() => _title = v),
              placeholder: 'z.B. Full-Stack Entwickler (m/w/d)',
            ),
            const SizedBox(height: 20),

            // Category dropdown
            Text(
              'Kategorie',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 6),
            _buildDropdown<JobCategory>(
              value: _category,
              items: JobCategory.values,
              labelBuilder: _categoryLabel,
              onChanged: (v) {
                if (v != null) setState(() => _category = v);
              },
              isDark: isDark,
            ),
            const SizedBox(height: 20),

            // Type dropdown
            Text(
              'Typ',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 6),
            _buildDropdown<JobType>(
              value: _type,
              items: JobType.values,
              labelBuilder: _typeLabel,
              onChanged: (v) {
                if (v != null) setState(() => _type = v);
              },
              isDark: isDark,
            ),
            const SizedBox(height: 20),

            // Location
            AppInput(
              label: 'Standort',
              value: _location,
              onChanged: (v) => setState(() => _location = v),
              placeholder: 'z.B. Berlin, M\u00fcnchen',
              prefixIcon:
                  const Icon(LucideIcons.mapPin, size: 18),
            ),
            const SizedBox(height: 20),

            // Salary range
            AppInput(
              label: 'Gehaltsspanne (optional)',
              value: _salaryRange,
              onChanged: (v) => setState(() => _salaryRange = v),
              placeholder: 'z.B. 45.000 - 60.000 \u20ac',
            ),
            const SizedBox(height: 20),

            // German level dropdown
            Text(
              'Deutschkenntnisse',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: labelColor,
              ),
            ),
            const SizedBox(height: 6),
            _buildDropdown<LanguageLevel>(
              value: _germanLevel,
              items: LanguageLevel.values,
              labelBuilder: _languageLevelLabel,
              onChanged: (v) {
                if (v != null) setState(() => _germanLevel = v);
              },
              isDark: isDark,
            ),
            const SizedBox(height: 20),

            // Description
            AppInput(
              label: 'Beschreibung',
              value: _description,
              onChanged: (v) => setState(() => _description = v),
              placeholder: 'Beschreiben Sie die Stelle...',
              multiline: true,
              maxLines: 5,
            ),
            const SizedBox(height: 20),

            // Requirements
            AppInput(
              label: 'Anforderungen',
              value: _requirements,
              onChanged: (v) => setState(() => _requirements = v),
              placeholder: 'Welche Anforderungen m\u00fcssen erf\u00fcllt werden?',
              multiline: true,
              maxLines: 4,
            ),
            const SizedBox(height: 32),

            // Submit button
            AppButton(
              title: 'Ver\u00f6ffentlichen',
              onPressed: _onSubmit,
              icon: const Icon(LucideIcons.send),
              fullWidth: true,
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown<T>({
    required T value,
    required List<T> items,
    required String Function(T) labelBuilder,
    required ValueChanged<T?> onChanged,
    required bool isDark,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.gray50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.gray200,
          width: 1.5,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: DropdownButtonFormField<T>(
        initialValue: value,
        decoration: const InputDecoration(
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: EdgeInsets.zero,
        ),
        dropdownColor: isDark ? AppColors.darkCard : AppColors.white,
        style: GoogleFonts.inter(
          fontSize: 15,
          color: isDark ? AppColors.white : AppColors.gray900,
        ),
        items: items
            .map((item) => DropdownMenuItem<T>(
                  value: item,
                  child: Text(labelBuilder(item)),
                ))
            .toList(),
        onChanged: onChanged,
      ),
    );
  }

  void _onSubmit() {
    if (_title.isEmpty || _location.isEmpty || _description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bitte f\u00fcllen Sie alle Pflichtfelder aus.'),
        ),
      );
      return;
    }

    final profile = ref.read(authProvider).profile;
    final newJob = Job(
      id: 'job-${DateTime.now().millisecondsSinceEpoch}',
      employerId: profile?.id ?? '',
      title: _title,
      description: _description,
      category: _category,
      type: _type,
      location: _location,
      requirements: _requirements,
      salaryRange: _salaryRange.isNotEmpty ? _salaryRange : null,
      germanLevel: _germanLevel,
      createdAt: DateTime.now(),
      status: 'active',
      employer: profile,
    );

    mockJobs.add(newJob);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Stelle erfolgreich ver\u00f6ffentlicht!'),
        backgroundColor: AppColors.success,
      ),
    );

    context.pop();
  }

  static String _categoryLabel(JobCategory category) {
    switch (category) {
      case JobCategory.it:
        return 'IT';
      case JobCategory.pflege:
        return 'Pflege';
      case JobCategory.transport:
        return 'Transport';
      case JobCategory.sonstige:
        return 'Sonstige';
    }
  }

  static String _typeLabel(JobType type) {
    switch (type) {
      case JobType.job:
        return 'Stelle';
      case JobType.ausbildung:
        return 'Ausbildung';
      case JobType.studium:
        return 'Studium';
      case JobType.sprachkurs:
        return 'Sprachkurs';
    }
  }

  static String _languageLevelLabel(LanguageLevel level) {
    switch (level) {
      case LanguageLevel.a1:
        return 'A1';
      case LanguageLevel.a2:
        return 'A2';
      case LanguageLevel.b1:
        return 'B1';
      case LanguageLevel.b2:
        return 'B2';
      case LanguageLevel.c1:
        return 'C1';
      case LanguageLevel.c2:
        return 'C2';
    }
  }
}
