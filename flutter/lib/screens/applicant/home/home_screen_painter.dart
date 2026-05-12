part of '../home_screen.dart';

/// Paints a subtle dot pattern overlay on the hero card.
class _DotPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.06)
      ..style = PaintingStyle.fill;

    const spacing = 28.0;
    const radius = 3.0;

    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }

    final arcPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(size.width - 20, 20),
        width: 120,
        height: 120,
      ),
      0,
      math.pi * 1.5,
      false,
      arcPaint,
    );
    canvas.drawArc(
      Rect.fromCenter(
        center: Offset(size.width - 20, 20),
        width: 80,
        height: 80,
      ),
      0,
      math.pi * 1.5,
      false,
      arcPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
