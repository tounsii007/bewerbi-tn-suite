import 'package:flutter/animation.dart';

/// Animation tokens shared across widgets. Keep durations short — anything past 350ms feels
/// laggy on a phone; under 120ms reads as snap rather than animation. The cubic easings here
/// mirror the web's `--ease-*` set so cross-platform motion looks coherent.
class AppMotion {
  AppMotion._();

  static const Duration fast = Duration(milliseconds: 140);
  static const Duration normal = Duration(milliseconds: 220);
  static const Duration slow = Duration(milliseconds: 420);

  /// Linear "spring" approximation. Use [Curves.elasticOut] for true spring overshoot.
  static const Curve outQuad = Cubic(0.25, 0.46, 0.45, 0.94);
  static const Curve outExpo = Cubic(0.16, 1.0, 0.3, 1.0);
  static const Curve spring = Cubic(0.34, 1.56, 0.64, 1.0);
}
