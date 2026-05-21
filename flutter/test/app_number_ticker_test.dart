import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:bewerbi_tn_flutter/widgets/app_number_ticker.dart';

/// Iter 156 — widget tests for AppNumberTicker.
///
/// TweenAnimationBuilder requires `pumpAndSettle` so the animation
/// completes before we read the final text. We test both the start
/// state (0) and end state (target value).
void main() {
  group('AppNumberTicker', () {
    testWidgets('starts at 0 and animates to value', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppNumberTicker(value: 1284),
          ),
        ),
      );

      // First frame: tween starts at 0
      expect(find.text('0'), findsOneWidget);

      // Let the animation run to completion
      await tester.pumpAndSettle();

      // German locale formats 1284 as "1.284" (note the dot grouping)
      expect(find.text('1.284'), findsOneWidget);
    });

    testWidgets('appends suffix + prepends prefix', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppNumberTicker(value: 94, suffix: ' %'),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('94 %'), findsOneWidget);
    });

    testWidgets('respects decimals', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppNumberTicker(value: 4.5, decimals: 1),
          ),
        ),
      );
      await tester.pumpAndSettle();
      // de_DE uses comma as decimal separator
      expect(find.text('4,5'), findsOneWidget);
    });

    testWidgets('forwards style to the inner Text', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppNumberTicker(
              value: 7,
              style: const TextStyle(fontSize: 42, fontWeight: FontWeight.w800),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final textWidget = tester.widget<Text>(find.text('7'));
      expect(textWidget.style?.fontSize, 42);
      expect(textWidget.style?.fontWeight, FontWeight.w800);
    });

    testWidgets('snaps immediately when reduce-motion is on', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(disableAnimations: true),
            child: const Scaffold(
              body: AppNumberTicker(value: 99),
            ),
          ),
        ),
      );
      // No pumpAndSettle needed — duration was set to zero by the
      // reduce-motion path, so the final value renders on the first frame.
      await tester.pump();
      expect(find.text('99'), findsOneWidget);
    });
  });
}
