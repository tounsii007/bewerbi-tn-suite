import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:bewerbi_tn_flutter/models/saved_search.dart';

class SavedSearchState {
  final List<SavedSearch> searches;
  final bool loading;

  const SavedSearchState({this.searches = const [], this.loading = false});

  SavedSearchState copyWith({List<SavedSearch>? searches, bool? loading}) =>
      SavedSearchState(
        searches: searches ?? this.searches,
        loading: loading ?? this.loading,
      );
}

class SavedSearchNotifier extends StateNotifier<SavedSearchState> {
  static const _storageKey = 'bewerbi.saved_searches';

  SavedSearchNotifier() : super(const SavedSearchState()) {
    _load();
  }

  Future<void> _load() async {
    state = state.copyWith(loading: true);
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw != null) {
      final list = (jsonDecode(raw) as List<dynamic>)
          .map((e) => SavedSearch.fromJson(e as Map<String, dynamic>))
          .toList();
      state = state.copyWith(searches: list, loading: false);
    } else {
      state = state.copyWith(loading: false);
    }
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(state.searches.map((s) => s.toJson()).toList());
    await prefs.setString(_storageKey, raw);
  }

  Future<SavedSearch> create(SavedSearch search) async {
    final withId = SavedSearch(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      name: search.name,
      query: search.query,
      category: search.category,
      type: search.type,
      location: search.location,
      minGermanLevel: search.minGermanLevel,
      salaryMin: search.salaryMin,
      alertsEnabled: search.alertsEnabled,
      createdAt: DateTime.now(),
    );
    state = state.copyWith(searches: [withId, ...state.searches]);
    await _persist();
    return withId;
  }

  Future<void> update(String id, SavedSearch update) async {
    state = state.copyWith(
      searches: state.searches
          .map((s) => s.id == id ? update.copyWith() : s)
          .toList(),
    );
    await _persist();
  }

  Future<void> toggleAlerts(String id) async {
    state = state.copyWith(
      searches: state.searches
          .map((s) => s.id == id ? s.copyWith(alertsEnabled: !s.alertsEnabled) : s)
          .toList(),
    );
    await _persist();
  }

  Future<void> remove(String id) async {
    state = state.copyWith(searches: state.searches.where((s) => s.id != id).toList());
    await _persist();
  }
}

final savedSearchProvider = StateNotifierProvider<SavedSearchNotifier, SavedSearchState>(
  (ref) => SavedSearchNotifier(),
);
