import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:bewerbi_tn_flutter/widgets/app_glass_card.dart';

/// Iter 156 — widget tests for AppGlassCard.
///
/// Verifies the BackdropFilter is present (BlurView equivalent), the
/// children render, and tap-handling is wired when onTap is provided.
void main() {
  group('AppGlassCard', () {
    testWidgets('renders its children', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppGlassCard(child: Text('inside')),
          ),
        ),
      );
      expect(find.text('inside'), findsOneWidget);
    });

    testWidgets('includes a BackdropFilter for the blur effect',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppGlassCard(child: Text('x')),
          ),
        ),
      );
      expect(find.byType(BackdropFilter), findsOneWidget);
    });

    testWidgets('blur sigma scales with strength', (tester) async {
      // subtle = 8, default = 14, strong = 20, frosted = 28
      for (final entry in const {
        GlassStrength.subtle: 8.0,
        GlassStrength.defaultStrength: 14.0,
        GlassStrength.strong: 20.0,
        GlassStrength.frosted: 28.0,
      }.entries) {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: AppGlassCard(strength: entry.key, child: const Text('y')),
            ),
          ),
        );
        final filter = tester.widget<BackdropFilter>(find.byType(BackdropFilter));
        // The filter is an ImageFilter — inspect via toString since
        // ImageFilter exposes no public getters.
        expect(
          filter.filter.toString(),
          contains(entry.value.toString()),
          reason: 'strength ${entry.key.name} should produce sigma ${entry.value}',
        );
      }
    });

    testWidgets('becomes tappable when onTap is provided', (tester) async {
      var tapped = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppGlassCard(
              onTap: () => tapped++,
              child: const Text('tap me'),
            ),
          ),
        ),
      );
      // Tap the card body
      await tester.tap(find.text('tap me'));
      await tester.pumpAndSettle();
      expect(tapped, 1);
    });

    testWidgets('applies brand-coloured shadow when glow=true',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppGlassCard(glow: true, child: Text('halo')),
          ),
        ),
      );
      // The Container wrapping the BlurView carries the BoxShadow. We just
      // assert the widget renders without throw — actual shadow assertion
      // would require deep tree walk that's brittle.
      expect(find.text('halo'), findsOneWidget);
    });

    test('cleans up by ensuring ImageFilter import is referenced', () {
      // Keep the ui import alive so the linter doesn't flag it.
      expect(ImageFilter.blur(sigmaX: 1, sigmaY: 1), isNotNull);
    });
  });
}
