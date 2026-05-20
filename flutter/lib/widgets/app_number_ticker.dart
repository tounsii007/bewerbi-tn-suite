import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Iter 128 — animated number counter for Flutter.
///
/// Uses `TweenAnimationBuilder<double>` to spring from 0 to [value] when
/// the widget mounts. Pass the same [value] later and it'll re-tween to
/// the new target.
///
///   AppNumberTicker(value: 1284, suffix: '+')
///   AppNumberTicker(value: 94, suffix: ' %')
class AppNumberTicker extends StatelessWidget {
  final num value;
  final String prefix;
  final String suffix;
  final int decimals;
  final Duration duration;
  final TextStyle? style;
  final String locale;

  const AppNumberTicker({
    super.key,
    required this.value,
    this.prefix = '',
    this.suffix = '',
    this.decimals = 0,
    this.duration = const Duration(milliseconds: 1200),
    this.style,
    this.locale = 'de_DE',
  });

  @override
  Widget build(BuildContext context) {
    final fmt = NumberFormat.decimalPattern(locale)
      ..minimumFractionDigits = decimals
      ..maximumFractionDigits = decimals;

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: value.toDouble()),
      duration: duration,
      curve: Curves.easeOutCubic,
      builder: (context, val, _) {
        return Text(
          '$prefix${fmt.format(val)}$suffix',
          style: style,
        );
      },
    );
  }
}
