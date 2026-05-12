part of '../job_detail_screen.dart';

class _JobDetailUi {
  const _JobDetailUi._();

  static const EdgeInsets screenPadding = EdgeInsets.symmetric(
    horizontal: AppSpacing.xl,
  );
  static const EdgeInsets bottomBarPadding = EdgeInsets.fromLTRB(
    AppSpacing.xl,
    AppSpacing.md,
    AppSpacing.xl,
    AppSpacing.xxl,
  );
  static const EdgeInsets sheetHeaderPadding = EdgeInsets.fromLTRB(
    AppSpacing.xl,
    AppSpacing.md,
    AppSpacing.xl,
    0,
  );

  static const double actionButtonHeight = 52;
  static const double secondaryButtonHeight = 48;
  static const double bottomSheetMaxHeightFactor = 0.85;
}
