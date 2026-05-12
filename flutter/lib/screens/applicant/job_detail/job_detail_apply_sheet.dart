part of '../job_detail_screen.dart';

class _ApplyBottomSheet extends StatefulWidget {
  const _ApplyBottomSheet({
    required this.job,
    required this.profile,
    required this.ref,
    required this.parentContext,
  });

  final Job job;
  final Profile? profile;
  final WidgetRef ref;
  final BuildContext parentContext;

  @override
  State<_ApplyBottomSheet> createState() => _ApplyBottomSheetState();
}

class _ApplyBottomSheetState extends State<_ApplyBottomSheet> {
  final _coverLetterController = TextEditingController();
  late final List<TextEditingController> _answerControllers;
  String? _uploadedCvName;

  @override
  void initState() {
    super.initState();
    _answerControllers = List.generate(
      widget.job.customQuestions.length,
      (_) => TextEditingController(),
    );
  }

  @override
  void dispose() {
    _coverLetterController.dispose();
    for (final controller in _answerControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _pickCv() {
    setState(() {
      _uploadedCvName = 'Lebenslauf_${widget.profile?.firstName ?? "User"}.pdf';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('CV "$_uploadedCvName" ausgewaehlt (Demo)'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.mdRadius),
      ),
    );
  }

  void _submit() {
    final coverLetter = _coverLetterController.text.isNotEmpty
        ? _coverLetterController.text
        : 'Sehr geehrte Damen und Herren,\n\nich bewerbe mich hiermit auf die Stelle "${widget.job.title}".\n\nMit freundlichen Gruessen,\n${widget.profile?.fullName ?? ""}';

    widget.ref
        .read(jobProvider.notifier)
        .applyToJob(widget.job.id, widget.profile?.id ?? '', coverLetter);

    Navigator.of(context).pop();
    ScaffoldMessenger.of(widget.parentContext).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(LucideIcons.checkCircle, color: AppColors.white, size: 18),
            SizedBox(width: AppSpacing.sm),
            Text('Bewerbung erfolgreich gesendet!'),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.mdRadius),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hasQuestions = widget.job.customQuestions.isNotEmpty;

    return Container(
      constraints: BoxConstraints(
        maxHeight:
            MediaQuery.of(context).size.height *
            _JobDetailUi.bottomSheetMaxHeightFactor,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: _JobDetailUi.sheetHeaderPadding,
            child: Column(
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
                const SizedBox(height: AppSpacing.lg),
                Text(
                  'Bewerbung senden',
                  style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  widget.job.title,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    color: AppColors.primary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (widget.job.employer case final employer?)
                  Text(
                    employer.fullName,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.gray500,
                    ),
                  ),
                const SizedBox(height: AppSpacing.lg),
                Divider(
                  color: isDark ? AppColors.darkBorder : AppColors.gray200,
                  height: 1,
                ),
              ],
            ),
          ),
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(
                AppSpacing.xl,
                AppSpacing.lg,
                AppSpacing.xl,
                MediaQuery.of(context).viewInsets.bottom + AppSpacing.xxl,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Lebenslauf',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.white : AppColors.gray700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  _CvUploadCard(
                    isDark: isDark,
                    uploadedCvName: _uploadedCvName,
                    onPickCv: _pickCv,
                    onClearCv: () => setState(() => _uploadedCvName = null),
                  ),
                  const SizedBox(height: AppSpacing.xl),
                  AppInput(
                    label: 'Anschreiben',
                    value: _coverLetterController.text,
                    onChanged: (value) => _coverLetterController.text = value,
                    placeholder:
                        'Sehr geehrte Damen und Herren,\n\nmit grossem Interesse bewerbe ich mich...',
                    multiline: true,
                    maxLines: 6,
                  ),
                  if (hasQuestions) ...[
                    const SizedBox(height: AppSpacing.sm),
                    _QuestionInfoBanner(
                      isDark: isDark,
                      questionCount: widget.job.customQuestions.length,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    ...List.generate(widget.job.customQuestions.length, (
                      index,
                    ) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                        child: AppInput(
                          label:
                              'Frage ${index + 1}: ${widget.job.customQuestions[index]}',
                          value: _answerControllers[index].text,
                          onChanged: (value) =>
                              _answerControllers[index].text = value,
                          placeholder: 'Ihre Antwort...',
                          multiline: true,
                          maxLines: 3,
                        ),
                      );
                    }),
                  ],
                  const SizedBox(height: AppSpacing.lg),
                  SizedBox(
                    width: double.infinity,
                    height: _JobDetailUi.actionButtonHeight,
                    child: ElevatedButton.icon(
                      onPressed: _submit,
                      icon: const Icon(LucideIcons.send, size: 18),
                      label: Text(
                        'Bewerbung absenden',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CvUploadCard extends StatelessWidget {
  const _CvUploadCard({
    required this.isDark,
    required this.uploadedCvName,
    required this.onPickCv,
    required this.onClearCv,
  });

  final bool isDark;
  final String? uploadedCvName;
  final VoidCallback onPickCv;
  final VoidCallback onClearCv;

  @override
  Widget build(BuildContext context) {
    final isUploaded = uploadedCvName != null;

    return GestureDetector(
      onTap: onPickCv,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(
          vertical: AppSpacing.lg,
          horizontal: AppSpacing.lg,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.surfaceAlt,
          borderRadius: AppRadii.mdRadius,
          border: Border.all(
            color: isUploaded
                ? AppColors.primary
                : (isDark ? AppColors.darkBorder : AppColors.gray200),
            width: isUploaded ? 1.5 : 1,
            strokeAlign: BorderSide.strokeAlignInside,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isUploaded ? LucideIcons.fileCheck : LucideIcons.upload,
              size: 20,
              color: isUploaded ? AppColors.primary : AppColors.gray400,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                uploadedCvName ?? 'PDF oder Word-Datei hochladen',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: isUploaded
                      ? (isDark ? AppColors.white : AppColors.gray800)
                      : AppColors.gray400,
                  fontWeight: isUploaded ? FontWeight.w500 : FontWeight.w400,
                ),
              ),
            ),
            if (isUploaded)
              GestureDetector(
                onTap: onClearCv,
                child: const Icon(
                  LucideIcons.x,
                  size: 16,
                  color: AppColors.gray400,
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _QuestionInfoBanner extends StatelessWidget {
  const _QuestionInfoBanner({
    required this.isDark,
    required this.questionCount,
  });

  final bool isDark;
  final int questionCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.warningSurface,
        borderRadius: AppRadii.mdRadius,
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.warningBorder,
        ),
      ),
      child: Row(
        children: [
          const Icon(
            LucideIcons.messageCircle,
            size: 16,
            color: AppColors.warningAccent,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              'Der Arbeitgeber hat $questionCount Zusatzfrage${questionCount == 1 ? "" : "n"}',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isDark ? AppColors.white : AppColors.warningDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
