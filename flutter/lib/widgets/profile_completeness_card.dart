import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/profile_completeness.dart';

class ProfileCompletenessCard extends ConsumerStatefulWidget {
  final bool compact;
  const ProfileCompletenessCard({super.key, this.compact = false});

  @override
  ConsumerState<ProfileCompletenessCard> createState() => _ProfileCompletenessCardState();
}

class _ProfileCompletenessCardState extends ConsumerState<ProfileCompletenessCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _animation;
  int _lastTarget = 0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _animation = Tween<double>(begin: 0, end: 0).animate(_controller);
  }

  void _animateTo(int target) {
    _animation = Tween<double>(begin: _lastTarget.toDouble(), end: target.toDouble())
        .animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _lastTarget = target;
    _controller.forward(from: 0);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  (Color, Color, String, String) _tierStyle(CompletenessTier tier) {
    switch (tier) {
      case CompletenessTier.starter:
        return (AppColors.gray500, AppColors.gray100, 'Starter', '🌱');
      case CompletenessTier.mover:
        return (AppColors.primary, AppColors.primaryBg, 'Aufsteiger', '🚀');
      case CompletenessTier.advanced:
        return (AppColors.accentViolet, const Color(0xFFF3E8FF), 'Fortgeschritten', '⭐');
      case CompletenessTier.complete:
        return (AppColors.successDark, AppColors.successSoft, 'Komplett', '🏆');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profile = ref.watch(authProvider).profile;
    final result = ProfileCompleteness.compute(profile);
    final (tierColor, tierBg, tierLabel, emoji) = _tierStyle(result.tier);

    if (_lastTarget != result.percent) _animateTo(result.percent);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray100),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: tierBg, shape: BoxShape.circle),
                  child: Text(emoji, style: const TextStyle(fontSize: 26)),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AnimatedBuilder(
                        animation: _animation,
                        builder: (context, _) {
                          final shown = _animation.value.round();
                          return RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: '$shown',
                                  style: GoogleFonts.inter(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w800,
                                    color: isDark ? AppColors.white : AppColors.gray900,
                                  ),
                                ),
                                TextSpan(
                                  text: '%',
                                  style: GoogleFonts.inter(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: isDark ? AppColors.white : AppColors.gray900,
                                  ),
                                ),
                                const TextSpan(text: '   '),
                                TextSpan(
                                  text: tierLabel.toUpperCase(),
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    color: tierColor,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      Text('Profil-Vollständigkeit',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: isDark ? AppColors.gray400 : AppColors.gray500,
                          )),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: AnimatedBuilder(
              animation: _animation,
              builder: (context, _) {
                return ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: _animation.value / 100,
                    minHeight: 8,
                    backgroundColor: isDark ? AppColors.darkBorder : AppColors.gray200,
                    valueColor: AlwaysStoppedAnimation(tierColor),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (!widget.compact && result.nextAction != null)
            InkWell(
              onTap: () => context.push(result.nextAction!.route),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.lg),
                color: tierColor.withValues(alpha: AppAlphas.faint),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: tierColor.withValues(alpha: AppAlphas.soft),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(LucideIcons.sparkles, size: 16, color: tierColor),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'NÄCHSTER SCHRITT  ·  +${result.nextAction!.weight}%',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: tierColor,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            result.nextAction!.actionDe,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: isDark ? AppColors.white : AppColors.gray900,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(Icons.chevron_right, color: tierColor),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
