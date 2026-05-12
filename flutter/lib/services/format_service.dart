import 'package:intl/intl.dart';

/// Locale-aware formatting helpers. The locale is passed in explicitly
/// (usually from `ref.watch(localeProvider)`) so every formatter reacts
/// when the user switches language.
class Fmt {
  Fmt._();

  static String _tag(String? code) {
    switch (code) {
      case 'fr':
        return 'fr_FR';
      case 'ar':
        return 'ar_TN';
      case 'de':
      default:
        return 'de_DE';
    }
  }

  static String number(num value, {String? localeCode, int fractionDigits = 0}) {
    final f = NumberFormat.decimalPattern(_tag(localeCode))
      ..maximumFractionDigits = fractionDigits;
    return f.format(value);
  }

  static String percent(num value, {String? localeCode, int fractionDigits = 0}) {
    final f = NumberFormat.percentPattern(_tag(localeCode))
      ..maximumFractionDigits = fractionDigits;
    return f.format(value / 100);
  }

  static String currency(num value, {String code = 'EUR', String? localeCode}) {
    final f = NumberFormat.simpleCurrency(locale: _tag(localeCode), name: code);
    return f.format(value);
  }

  static String date(DateTime value, {String? localeCode, String? pattern}) {
    final f = pattern == null
        ? DateFormat.yMMMd(_tag(localeCode))
        : DateFormat(pattern, _tag(localeCode));
    return f.format(value);
  }

  static String relative(DateTime value, {String? localeCode}) {
    final now = DateTime.now();
    final diff = value.difference(now);
    final absMinutes = diff.inMinutes.abs();

    // Simple DE/FR/AR fallback — Flutter's intl doesn't ship RelativeTimeFormat.
    if (absMinutes < 60) {
      if (localeCode == 'fr') return 'il y a ${absMinutes} min';
      if (localeCode == 'ar') return 'منذ ${absMinutes} د';
      return 'vor ${absMinutes} Min';
    }
    final hours = (absMinutes / 60).floor();
    if (hours < 24) {
      if (localeCode == 'fr') return 'il y a ${hours} h';
      if (localeCode == 'ar') return 'منذ ${hours} سا';
      return 'vor ${hours} Std.';
    }
    final days = (hours / 24).floor();
    if (days < 30) {
      if (localeCode == 'fr') return 'il y a ${days} j';
      if (localeCode == 'ar') return 'منذ ${days} يوم';
      return 'vor ${days} Tagen';
    }
    return date(value, localeCode: localeCode);
  }
}
