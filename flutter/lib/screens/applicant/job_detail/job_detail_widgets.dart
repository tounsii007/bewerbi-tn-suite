part of '../job_detail_screen.dart';

class _JobBadge extends StatelessWidget {
  const _JobBadge({
    required this.icon,
    required this.text,
    required this.isDark,
  });

  final IconData icon;
  final String text;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.gray100,
        borderRadius: AppRadii.smRadius,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: isDark ? AppColors.gray400 : AppColors.gray500,
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isDark ? AppColors.gray300 : AppColors.gray700,
            ),
          ),
        ],
      ),
    );
  }
}

class _JobSection extends StatelessWidget {
  const _JobSection({
    required this.title,
    required this.content,
    required this.isDark,
  });

  final String title;
  final String content;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          content,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: isDark ? AppColors.gray300 : AppColors.gray600,
            height: 1.6,
          ),
        ),
      ],
    );
  }
}

class _JobDetailBottomBar extends StatelessWidget {
  const _JobDetailBottomBar({
    required this.isDark,
    required this.onApply,
    required this.onContactEmployer,
  });

  final bool isDark;
  final VoidCallback onApply;
  final VoidCallback onContactEmployer;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: _JobDetailUi.bottomBarPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              height: _JobDetailUi.actionButtonHeight,
              child: ElevatedButton.icon(
                onPressed: onApply,
                icon: const Icon(LucideIcons.send, size: 18),
                label: Text(
                  'Jetzt bewerben',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              width: double.infinity,
              height: _JobDetailUi.secondaryButtonHeight,
              child: OutlinedButton.icon(
                onPressed: onContactEmployer,
                icon: const Icon(LucideIcons.messageSquare, size: 18),
                label: Text(
                  'Arbeitgeber kontaktieren',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary, width: 1.5),
                  shape: const RoundedRectangleBorder(
                    borderRadius: AppRadii.mdRadius,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
