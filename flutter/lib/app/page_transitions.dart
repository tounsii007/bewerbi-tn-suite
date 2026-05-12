import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Material 3 fade-through transition factory. Use as
/// `MaterialApp(theme: …pageTransitionsTheme = AppPageTransitions.theme)`. Same animation
/// vocabulary as the web's `PageTransition` wrapper — content fades and lifts 6px on enter.
class AppPageTransitions {
  AppPageTransitions._();

  static const PageTransitionsTheme theme = PageTransitionsTheme(
    builders: {
      TargetPlatform.android: _FadeUpTransitionBuilder(),
      TargetPlatform.iOS: _FadeUpTransitionBuilder(),
      TargetPlatform.fuchsia: _FadeUpTransitionBuilder(),
      TargetPlatform.linux: _FadeUpTransitionBuilder(),
      TargetPlatform.macOS: _FadeUpTransitionBuilder(),
      TargetPlatform.windows: _FadeUpTransitionBuilder(),
    },
  );
}

class _FadeUpTransitionBuilder extends PageTransitionsBuilder {
  const _FadeUpTransitionBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final fade = CurvedAnimation(parent: animation, curve: AppMotion.outExpo);
    final slide = Tween<Offset>(
      begin: const Offset(0, 0.012),
      end: Offset.zero,
    ).animate(fade);

    return FadeTransition(
      opacity: fade,
      child: SlideTransition(position: slide, child: child),
    );
  }
}
