import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/job_presentation.dart';
import 'app_card.dart';
import 'app_badge.dart';

class JobCard extends StatelessWidget {
  final Job job;
  final VoidCallback onTap;
  final VoidCallback? onFavorite;
  final bool isFavorite;

  const JobCard({
    super.key,
    required this.job,
    required this.onTap,
    this.onFavorite,
    this.isFavorite = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final mutedColor = isDark ? AppColors.gray400 : AppColors.gray500;
    final titleColor = isDark ? AppColors.white : AppColors.gray900;

    return AppCard(
      onTap: onTap,
      elevation: 1,
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 4,
            decoration: BoxDecoration(
              color: job.type.accentColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(AppRadii.lg),
                topRight: Radius.circular(AppRadii.lg),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Wrap(
                        spacing: AppSpacing.xs + 2,
                        runSpacing: AppSpacing.xs + 2,
                        children: [
                          AppBadge(
                            label: job.type.labelDe,
                            variant: job.type.badgeVariant,
                          ),
                          AppBadge(label: job.category.labelDe),
                          if (job.germanLevel != null)
                            AppBadge(
                              label: job.germanLevel!.labelDe,
                              variant: BadgeVariant.info,
                            ),
                        ],
                      ),
                    ),
                    if (onFavorite != null)
                      _FavoriteButton(
                        isFavorite: isFavorite,
                        onTap: onFavorite!,
                        isDark: isDark,
                      ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  job.title,
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: titleColor,
                    height: 1.3,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (job.employer != null) ...[
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    job.employer!.fullName,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: mutedColor,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
                Wrap(
                  spacing: AppSpacing.lg,
                  runSpacing: AppSpacing.sm,
                  children: [
                    if (job.location.isNotEmpty)
                      _MetaItem(
                        icon: LucideIcons.mapPin,
                        text: job.location,
                        color: mutedColor,
                      ),
                    if (job.salaryRange != null &&
                        job.salaryRange!.isNotEmpty)
                      _MetaItem(
                        text: job.salaryRange!,
                        color: titleColor,
                        bold: true,
                      ),
                    _MetaItem(
                      icon: LucideIcons.clock,
                      text: timeAgoDe(job.createdAt),
                      color: mutedColor,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FavoriteButton extends StatelessWidget {
  final bool isFavorite;
  final VoidCallback onTap;
  final bool isDark;

  const _FavoriteButton({
    required this.isFavorite,
    required this.onTap,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final bg = isFavorite
        ? AppColors.errorLight
        : (isDark ? AppColors.darkCard : AppColors.gray50);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
        alignment: Alignment.center,
        child: Icon(
          isFavorite ? Icons.favorite : Icons.favorite_border,
          color: isFavorite ? AppColors.error : AppColors.gray400,
          size: 20,
        ),
      ),
    );
  }
}

class _MetaItem extends StatelessWidget {
  final IconData? icon;
  final String text;
  final Color color;
  final bool bold;

  const _MetaItem({
    this.icon,
    required this.text,
    required this.color,
    this.bold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[
          Icon(icon, size: 14, color: color),
          const SizedBox(width: AppSpacing.xs),
        ],
        Text(
          text,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: bold ? FontWeight.w600 : FontWeight.w400,
            color: color,
          ),
        ),
      ],
    );
  }
}
