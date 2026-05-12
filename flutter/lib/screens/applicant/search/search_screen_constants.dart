part of '../search_screen.dart';

class _SearchScreenUi {
  const _SearchScreenUi._();

  static const EdgeInsets horizontalPadding = EdgeInsets.symmetric(
    horizontal: AppSpacing.xl,
  );
  static const EdgeInsets filterBarPadding = EdgeInsets.fromLTRB(
    AppSpacing.xl,
    AppSpacing.md,
    AppSpacing.xl,
    0,
  );
  static const EdgeInsets resultsPadding = EdgeInsets.symmetric(
    horizontal: AppSpacing.xl,
    vertical: AppSpacing.sm,
  );
  static const EdgeInsets filterSectionMargin = EdgeInsets.fromLTRB(
    AppSpacing.xl,
    AppSpacing.md,
    AppSpacing.xl,
    0,
  );
  static const EdgeInsets filterSectionPadding = EdgeInsets.all(AppSpacing.lg);
  static const EdgeInsets searchFieldPadding = EdgeInsets.symmetric(
    horizontal: AppSpacing.md,
    vertical: 14,
  );
  static const EdgeInsets locationInputPadding = EdgeInsets.symmetric(
    horizontal: 14,
    vertical: 10,
  );

  static const double maxFilterHeight = 400;
  static const List<int> salaryThresholds = [30000, 40000, 50000, 60000];
}
