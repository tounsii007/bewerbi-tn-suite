import 'package:flutter/material.dart';

/// Iter 128 — fade-in + slight translate on mount, mirroring the web/mobile
/// `Reveal` component.
///
/// Wraps any widget; on first build it animates from
/// (translated by [offset], opacity 0) to (translated by 0, opacity 1) over
/// [duration] after [delay].
///
///   AppReveal(direction: AppRevealDirection.up, child: Text('...'))
///   AppReveal(delay: Duration(milliseconds: 120), child: ...)
enum AppRevealDirection { up, down, left, right, none }

class AppReveal extends StatefulWidget {
  final Widget child;
  final AppRevealDirection direction;
  final Duration duration;
  final Duration delay;
  final double offset;

  const AppReveal({
    super.key,
    required this.child,
    this.direction = AppRevealDirection.up,
    this.duration = const Duration(milliseconds: 600),
    this.delay = Duration.zero,
    this.offset = 16,
  });

  @override
  State<AppReveal> createState() => _AppRevealState();
}

class _AppRevealState extends State<AppReveal>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _curve;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: widget.duration);
    _curve = CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    // Iter 142 — respect the user's reduce-motion preference. We still
    // run the animation but at near-zero duration so the final visible
    // state matches the animated one (no missing fade-in fallout).
    final disableAnimations = MediaQuery.disableAnimationsOf(context);
    if (disableAnimations) {
      _ctrl.value = 1.0;
      return;
    }
    Future.delayed(widget.delay, () {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Offset _offsetFor(double t) {
    final inv = 1 - t;
    switch (widget.direction) {
      case AppRevealDirection.up:
        return Offset(0, widget.offset * inv);
      case AppRevealDirection.down:
        return Offset(0, -widget.offset * inv);
      case AppRevealDirection.left:
        return Offset(widget.offset * inv, 0);
      case AppRevealDirection.right:
        return Offset(-widget.offset * inv, 0);
      case AppRevealDirection.none:
        return Offset.zero;
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _curve,
      builder: (_, _) {
        return Opacity(
          opacity: _curve.value,
          child: Transform.translate(
            offset: _offsetFor(_curve.value),
            child: widget.child,
          ),
        );
      },
      child: widget.child,
    );
  }
}
