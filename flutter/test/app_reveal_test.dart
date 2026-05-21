import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:bewerbi_tn_flutter/widgets/app_reveal.dart';

/// Iter 156 — widget tests for AppReveal.
///
/// AppReveal fades + translates a child in on mount. We test:
///  1. child renders eventually (after pumpAndSettle)
///  2. all 5 directions don't throw
///  3. when MediaQuery.disableAnimations is true, the child is visible
///     on the very first frame (no animation delay)
void main() {
  group('AppReveal', () {
    testWidgets('renders the child after animation completes', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppReveal(child: Text('content')),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('content'), findsOneWidget);
    });

    testWidgets('renders for every direction', (tester) async {
      for (final dir in AppRevealDirection.values) {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: AppReveal(direction: dir, child: Text(dir.name)),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(find.text(dir.name), findsOneWidget);
      }
    });

    testWidgets('with reduced motion, child is fully visible immediately',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: MediaQuery(
            data: MediaQueryData(disableAnimations: true),
            child: Scaffold(
              body: AppReveal(child: Text('snap')),
            ),
          ),
        ),
      );
      // Only one pump — animation should already be at value=1.0.
      await tester.pump();
      expect(find.text('snap'), findsOneWidget);

      // The Opacity wrapper should be at 1.0 (fully opaque).
      final opacityWidget = tester.widget<Opacity>(find.byType(Opacity));
      expect(opacityWidget.opacity, 1.0);
    });

    testWidgets('respects the delay prop without breaking', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppReveal(
              delay: Duration(milliseconds: 100),
              child: Text('delayed'),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('delayed'), findsOneWidget);
    });
  });
}
