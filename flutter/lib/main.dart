import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'app/theme.dart';
import 'app/router.dart';
import 'providers/theme_provider.dart';
import 'providers/locale_provider.dart';
import 'services/api_client.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  if (kIsWeb) {
    FlutterError.onError = (details) {
      final message = details.toString();
      if (message.contains('mouse_tracker') || message.contains('MouseTracker')) {
        return;
      }
      FlutterError.presentError(details);
    };
  }

  runApp(const ProviderScope(child: BewerbiApp()));
}

class BewerbiApp extends ConsumerWidget {
  const BewerbiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(themeProvider);
    final router = ref.watch(routerProvider);
    final locale = ref.watch(localeProvider);

    // Keep the API client in sync with the active Riverpod locale so every
    // outbound request carries the right Accept-Language header.
    ApiClient.instance.setLocale(locale?.languageCode ?? 'de');

    return MaterialApp.router(
      title: 'bewerbi.tn',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      routerConfig: router,
      locale: locale,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: kSupportedLocales,
      // When Arabic is picked, flip the widget tree to RTL so all stock Flutter
      // widgets align correctly without per-screen Directionality wrappers.
      builder: (context, child) {
        final direction = isRtl(locale) ? TextDirection.rtl : TextDirection.ltr;
        return Directionality(textDirection: direction, child: child ?? const SizedBox());
      },
    );
  }
}
