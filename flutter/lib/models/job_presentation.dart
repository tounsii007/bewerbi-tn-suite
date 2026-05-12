import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';

extension JobCategoryPresentation on JobCategory {
  String get labelDe {
    switch (this) {
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
}

extension JobTypePresentation on JobType {
  String get labelDe {
    switch (this) {
      case JobType.job:
        return 'Job';
      case JobType.ausbildung:
        return 'Ausbildung';
      case JobType.studium:
        return 'Studium';
      case JobType.sprachkurs:
        return 'Sprachkurs';
    }
  }

  Color get accentColor {
    switch (this) {
      case JobType.job:
        return AppColors.primary;
      case JobType.ausbildung:
        return AppColors.success;
      case JobType.studium:
        return AppColors.warningAccent;
      case JobType.sprachkurs:
        return AppColors.gray400;
    }
  }

  BadgeVariant get badgeVariant {
    switch (this) {
      case JobType.job:
        return BadgeVariant.info;
      case JobType.ausbildung:
        return BadgeVariant.success;
      case JobType.studium:
        return BadgeVariant.warning;
      case JobType.sprachkurs:
        return BadgeVariant.defaultVariant;
    }
  }
}

extension LanguageLevelPresentation on LanguageLevel {
  String get labelDe {
    switch (this) {
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

String timeAgoDe(DateTime date) {
  final diff = DateTime.now().difference(date);
  if (diff.inDays == 0) return 'Heute';
  if (diff.inDays == 1) return 'Gestern';
  if (diff.inDays < 30) return 'vor ${diff.inDays} Tagen';
  if (diff.inDays < 365) {
    final months = (diff.inDays / 30).floor();
    return 'vor $months ${months == 1 ? 'Monat' : 'Monaten'}';
  }
  final years = (diff.inDays / 365).floor();
  return 'vor $years ${years == 1 ? 'Jahr' : 'Jahren'}';
}
