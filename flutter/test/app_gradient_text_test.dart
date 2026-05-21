import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:bewerbi_tn_flutter/widgets/app_gradient_text.dart';

/// Iter 156 — widget tests for AppGradientText.
///
/// We can't directly assert the rendered gradient colours in a unit test
/// (ShaderMask requires a real GPU); we verify the widget tree shape +
/// that the text content is preserved across variants.
void main() {
  group('AppGradientText', () {
    testWidgets('renders the text content', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppGradientText('Deutschland'),
          ),
        ),
      );
      expect(find.text('Deutschland'), findsOneWidget);
    });

    testWidgets('wraps text in a ShaderMask', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppGradientText('x'),
          ),
        ),
      );
      expect(find.byType(ShaderMask), findsOneWidget);
    });

    testWidgets('renders for every variant', (tester) async {
      const variants = [
        GradientVariant.brand,
        GradientVariant.aurora,
        GradientVariant.sunrise,
        GradientVariant.flame,
      ];
      for (final v in variants) {
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: AppGradientText('label-${v.name}', variant: v),
            ),
          ),
        );
        expect(find.text('label-${v.name}'), findsOneWidget);
      }
    });

    testWidgets('forwards style + textAlign', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppGradientText(
              'Headline',
              style: TextStyle(fontSize: 36, fontWeight: FontWeight.w800),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
      final textWidget = tester.widget<Text>(find.text('Headline'));
      expect(textWidget.style?.fontSize, 36);
      expect(textWidget.style?.fontWeight, FontWeight.w800);
      expect(textWidget.textAlign, TextAlign.center);
    });
  });
}
