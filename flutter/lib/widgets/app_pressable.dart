import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';

/// Adds the project's signature scale + opacity feedback to any tappable. The same micro-
/// interaction sits behind [AppButton]; use this when wrapping a card or a custom hit-target
/// without the button chrome.
class AppPressable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;

  /// Target scale on press-down. 0.97 is the project default; cards usually want 0.985.
  final double scaleTo;

  /// Target opacity on press-down.
  final double opacityTo;

  /// Disables the feedback animation (e.g. when nested inside a [Hero] flight).
  final bool flat;

  const AppPressable({
    super.key,
    required this.child,
    this.onTap,
    this.onLongPress,
    this.scaleTo = 0.97,
    this.opacityTo = 0.9,
    this.flat = false,
  });

  @override
  State<AppPressable> createState() => _AppPressableState();
}

class _AppPressableState extends State<AppPressable> {
  double _scale = 1.0;
  double _opacity = 1.0;

  void _down() {
    if (widget.flat) return;
    setState(() {
      _scale = widget.scaleTo;
      _opacity = widget.opacityTo;
    });
  }

  void _up() {
    if (widget.flat) return;
    setState(() {
      _scale = 1.0;
      _opacity = 1.0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onLongPress: widget.onLongPress,
      onTapDown: widget.onTap == null ? null : (_) => _down(),
      onTapUp: widget.onTap == null ? null : (_) => _up(),
      onTapCancel: widget.onTap == null ? null : _up,
      child: AnimatedScale(
        scale: _scale,
        duration: AppMotion.fast,
        curve: AppMotion.outQuad,
        child: AnimatedOpacity(
          opacity: _opacity,
          duration: AppMotion.fast,
          curve: AppMotion.outQuad,
          child: widget.child,
        ),
      ),
    );
  }
}
