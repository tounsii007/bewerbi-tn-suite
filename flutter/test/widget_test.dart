import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_button.dart';
import 'package:bewerbi_tn_flutter/widgets/app_avatar.dart';
import 'package:bewerbi_tn_flutter/widgets/empty_state.dart';
import 'package:bewerbi_tn_flutter/widgets/progress_bar.dart';

void main() {
  group('AppBadge', () {
    testWidgets('renders with correct text', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppBadge(label: 'IT'),
          ),
        ),
      );
      expect(find.text('IT'), findsOneWidget);
    });

    testWidgets('renders with success variant', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppBadge(
              label: 'Aktiv',
              variant: BadgeVariant.success,
            ),
          ),
        ),
      );
      expect(find.text('Aktiv'), findsOneWidget);
    });

    testWidgets('renders with different sizes', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                AppBadge(label: 'Small', size: BadgeSize.sm),
                AppBadge(label: 'Medium', size: BadgeSize.md),
              ],
            ),
          ),
        ),
      );
      expect(find.text('Small'), findsOneWidget);
      expect(find.text('Medium'), findsOneWidget);
    });

    testWidgets('renders all variant types without error',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                AppBadge(
                    label: 'Default',
                    variant: BadgeVariant.defaultVariant),
                AppBadge(
                    label: 'Success', variant: BadgeVariant.success),
                AppBadge(
                    label: 'Warning', variant: BadgeVariant.warning),
                AppBadge(label: 'Error', variant: BadgeVariant.error),
                AppBadge(label: 'Info', variant: BadgeVariant.info),
              ],
            ),
          ),
        ),
      );
      expect(find.byType(AppBadge), findsNWidgets(5));
    });
  });

  group('AppButton', () {
    testWidgets('renders with title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              title: 'Bewerben',
              onPressed: () {},
            ),
          ),
        ),
      );
      expect(find.text('Bewerben'), findsOneWidget);
    });

    testWidgets('calls onPressed when tapped', (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              title: 'Tap Me',
              onPressed: () => pressed = true,
            ),
          ),
        ),
      );
      await tester.tap(find.text('Tap Me'));
      await tester.pump();
      expect(pressed, true);
    });

    testWidgets('does not call onPressed when disabled',
        (WidgetTester tester) async {
      bool pressed = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              title: 'Disabled',
              onPressed: () => pressed = true,
              disabled: true,
            ),
          ),
        ),
      );
      await tester.tap(find.text('Disabled'));
      await tester.pump();
      expect(pressed, false);
    });

    testWidgets('shows loading indicator when loading',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              title: 'Loading',
              onPressed: () {},
              loading: true,
            ),
          ),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders with icon', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              title: 'With Icon',
              onPressed: () {},
              icon: const Icon(Icons.send),
            ),
          ),
        ),
      );
      expect(find.byIcon(Icons.send), findsOneWidget);
      expect(find.text('With Icon'), findsOneWidget);
    });

    testWidgets('renders all variants without error',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                AppButton(
                  title: 'Primary',
                  onPressed: () {},
                  variant: AppButtonVariant.primary,
                ),
                AppButton(
                  title: 'Secondary',
                  onPressed: () {},
                  variant: AppButtonVariant.secondary,
                ),
                AppButton(
                  title: 'Outline',
                  onPressed: () {},
                  variant: AppButtonVariant.outline,
                ),
                AppButton(
                  title: 'Ghost',
                  onPressed: () {},
                  variant: AppButtonVariant.ghost,
                ),
              ],
            ),
          ),
        ),
      );
      expect(find.byType(AppButton), findsNWidgets(4));
    });
  });

  group('AppAvatar', () {
    testWidgets('shows initials when no image', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppAvatar(name: 'Ahmed Ben Ali'),
          ),
        ),
      );
      // Initials should be 'AB' (first letter of first and last name)
      expect(find.text('AB'), findsOneWidget);
    });

    testWidgets('shows single initial for single name',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppAvatar(name: 'Ahmed'),
          ),
        ),
      );
      expect(find.text('A'), findsOneWidget);
    });

    testWidgets('shows ? for empty name', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppAvatar(name: ''),
          ),
        ),
      );
      expect(find.text('?'), findsOneWidget);
    });

    testWidgets('renders different sizes without error',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                AppAvatar(name: 'Test', size: AvatarSize.sm),
                AppAvatar(name: 'Test', size: AvatarSize.md),
                AppAvatar(name: 'Test', size: AvatarSize.lg),
                AppAvatar(name: 'Test', size: AvatarSize.xl),
              ],
            ),
          ),
        ),
      );
      expect(find.byType(AppAvatar), findsNWidgets(4));
    });

    testWidgets('handles onTap callback', (WidgetTester tester) async {
      bool tapped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppAvatar(
              name: 'Test User',
              onTap: () => tapped = true,
            ),
          ),
        ),
      );
      await tester.tap(find.byType(AppAvatar));
      expect(tapped, true);
    });
  });

  group('EmptyState', () {
    testWidgets('shows title and subtitle', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.work_off,
              title: 'Keine Jobs',
              subtitle: 'Versuche andere Filter',
            ),
          ),
        ),
      );
      expect(find.text('Keine Jobs'), findsOneWidget);
      expect(find.text('Versuche andere Filter'), findsOneWidget);
      expect(find.byIcon(Icons.work_off), findsOneWidget);
    });

    testWidgets('renders without subtitle', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.inbox,
              title: 'Leer',
            ),
          ),
        ),
      );
      expect(find.text('Leer'), findsOneWidget);
    });

    testWidgets('renders with action widget', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyState(
              icon: Icons.search_off,
              title: 'Nichts gefunden',
              action: ElevatedButton(
                onPressed: () {},
                child: const Text('Erneut suchen'),
              ),
            ),
          ),
        ),
      );
      expect(find.text('Nichts gefunden'), findsOneWidget);
      expect(find.text('Erneut suchen'), findsOneWidget);
    });
  });

  group('ProgressBar', () {
    testWidgets('renders without errors', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ProgressBar(progress: 0.5),
          ),
        ),
      );
      expect(find.byType(ProgressBar), findsOneWidget);
    });

    testWidgets('renders at 0% progress', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ProgressBar(progress: 0.0),
          ),
        ),
      );
      expect(find.byType(ProgressBar), findsOneWidget);
    });

    testWidgets('renders at 100% progress', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ProgressBar(progress: 1.0),
          ),
        ),
      );
      expect(find.byType(ProgressBar), findsOneWidget);
    });

    testWidgets('clamps progress above 1.0', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ProgressBar(progress: 1.5),
          ),
        ),
      );
      // Should render without error even with out-of-range value
      expect(find.byType(ProgressBar), findsOneWidget);
    });

    testWidgets('renders with custom height', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ProgressBar(progress: 0.7, height: 12),
          ),
        ),
      );
      expect(find.byType(ProgressBar), findsOneWidget);
    });

    testWidgets('renders with custom colors', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ProgressBar(
              progress: 0.6,
              color: Colors.green,
              backgroundColor: Colors.grey,
            ),
          ),
        ),
      );
      expect(find.byType(ProgressBar), findsOneWidget);
    });
  });
}
