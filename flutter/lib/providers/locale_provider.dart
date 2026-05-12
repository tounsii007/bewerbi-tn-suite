import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Supported app locales in the order they appear in the picker.
const List<Locale> kSupportedLocales = [
  Locale('de'),
  Locale('fr'),
  Locale('ar'),
];

const List<String> kRtlLanguages = ['ar'];

class LocaleNotifier extends StateNotifier<Locale?> {
  static const _key = 'bewerbi.language';

  LocaleNotifier() : super(null) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_key);
    if (code != null) {
      state = Locale(code);
    }
  }

  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, locale.languageCode);
  }
}

final localeProvider =
    StateNotifierProvider<LocaleNotifier, Locale?>((ref) => LocaleNotifier());

bool isRtl(Locale? locale) =>
    locale != null && kRtlLanguages.contains(locale.languageCode);
