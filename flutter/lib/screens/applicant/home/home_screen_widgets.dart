part of '../home_screen.dart';

class _HomeErrorBanner extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  final bool isDark;

  const _HomeErrorBanner({
    required this.message,
    required this.onRetry,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.errorSoft,
        borderRadius: AppRadii.lgRadius,
        border: Border.all(
          color: AppColors.error.withValues(alpha: AppAlphas.soft),
        ),
      ),
      child: Row(
        children: [
          const Icon(
            LucideIcons.alertTriangle,
            color: AppColors.error,
            size: 20,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: isDark ? AppColors.gray300 : AppColors.gray700,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          GestureDetector(
            onTap: onRetry,
            child: Text(
              'Erneut versuchen',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.error,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryItem {
  final String label;
  final IconData icon;
  final Color color;

  const _CategoryItem(this.label, this.icon, this.color);
}

// Iter 139 — _GlassStatBox removed; the new home hero uses _AuroraStatBox
// below which is re-themed for the lighter aurora background (dark text on
// translucent white instead of white-on-primary).

/// Iter 139 — re-themed stat tile for the new aurora hero. Uses dark text
/// on translucent-white background instead of white-on-primary like the
/// older _GlassStatBox.
class _AuroraStatBox extends StatelessWidget {
  final int count;
  final String label;
  final bool isDark;

  const _AuroraStatBox({
    required this.count,
    required this.label,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isDark
        ? AppColors.darkCard.withValues(alpha: 0.7)
        : AppColors.white.withValues(alpha: 0.8);
    final border = isDark
        ? AppColors.darkBorder
        : AppColors.white;
    final numberColor = isDark ? AppColors.white : AppColors.gray900;
    final labelColor = isDark ? AppColors.gray400 : AppColors.gray600;

    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: AppRadii.lgRadius,
          border: Border.all(color: border, width: 1.2),
        ),
        child: Column(
          children: [
            AppNumberTicker(
              value: count,
              style: GoogleFonts.inter(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: numberColor,
                height: 1.1,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
                color: labelColor,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryCard extends StatefulWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _CategoryCard({
    required this.label,
    required this.icon,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  State<_CategoryCard> createState() => _CategoryCardState();
}

class _CategoryCardState extends State<_CategoryCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(scale: _scaleAnimation.value, child: child);
        },
        child: Container(
          width: 80,
          height: _HomeScreenUi.categoryCardHeight,
          decoration: BoxDecoration(
            color: widget.isDark
                ? AppColors.darkAccentSurface
                : AppColors.white,
            borderRadius: AppRadii.xlRadius,
            boxShadow: AppShadows.sm,
            border: Border(
              bottom: BorderSide(
                color: widget.color.withValues(alpha: AppAlphas.strong),
                width: 2.5,
              ),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: widget.color.withValues(alpha: AppAlphas.faint),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(widget.icon, color: widget.color, size: 21),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                widget.label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: widget.isDark ? AppColors.gray300 : AppColors.gray700,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RecommendationCard extends StatelessWidget {
  final RecommendedJob rec;
  final bool isDark;
  final VoidCallback onTap;

  const _RecommendationCard({
    required this.rec,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final job = rec.job;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 280,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.white,
          borderRadius: AppRadii.lgRadius,
          boxShadow: AppShadows.sm,
          border: Border.all(
            color: isDark
                ? AppColors.darkBorder
                : AppColors.primary.withValues(alpha: AppAlphas.soft),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: AppAlphas.faint),
                borderRadius: AppRadii.smRadius,
              ),
              child: Text(
                'Match: ${rec.matchPercent}%',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.success,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              job.title,
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.xs),
            if (job.employer != null)
              Text(
                job.employer!.fullName,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: isDark ? AppColors.gray400 : AppColors.gray500,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            const Spacer(),
            Row(
              children: [
                Icon(
                  LucideIcons.mapPin,
                  size: 14,
                  color: isDark ? AppColors.gray400 : AppColors.gray500,
                ),
                const SizedBox(width: AppSpacing.xs),
                Expanded(
                  child: Text(
                    job.location,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: isDark ? AppColors.gray400 : AppColors.gray500,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
