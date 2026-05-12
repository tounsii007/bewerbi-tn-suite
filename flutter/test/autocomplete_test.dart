import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/data/cities.dart';
import 'package:bewerbi_tn_flutter/data/countries.dart';

void main() {
  group('Cities Autocomplete', () {
    test('worldCities is not empty', () {
      expect(worldCities.isNotEmpty, true);
    });

    test('worldCities contains Tunisian cities', () {
      expect(worldCities.contains('Tunis'), true);
      expect(worldCities.contains('Sfax'), true);
      expect(worldCities.contains('Sousse'), true);
      expect(worldCities.contains('Kairouan'), true);
      expect(worldCities.contains('Bizerte'), true);
      expect(worldCities.contains('Gabès'), true);
      expect(worldCities.contains('Monastir'), true);
      expect(worldCities.contains('Nabeul'), true);
    });

    test('worldCities contains German cities', () {
      expect(worldCities.contains('Berlin'), true);
      expect(worldCities.contains('München'), true);
      expect(worldCities.contains('Hamburg'), true);
      expect(worldCities.contains('Frankfurt'), true);
      expect(worldCities.contains('Köln'), true);
      expect(worldCities.contains('Stuttgart'), true);
      expect(worldCities.contains('Düsseldorf'), true);
      expect(worldCities.contains('Nürnberg'), true);
    });

    test('worldCities contains major world cities', () {
      expect(worldCities.contains('Paris'), true);
      expect(worldCities.contains('London'), true);
      expect(worldCities.contains('New York'), true);
      expect(worldCities.contains('Tokyo'), true);
      expect(worldCities.contains('Dubai'), true);
      expect(worldCities.contains('Istanbul'), true);
    });

    test('search "Sou" returns Sousse', () {
      final query = 'sou';
      final results = worldCities.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('Sousse'), true);
    });

    test('search "Mün" returns München', () {
      final query = 'mün';
      final results = worldCities.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('München'), true);
    });

    test('search "ber" returns Berlin', () {
      final query = 'ber';
      final results = worldCities.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('Berlin'), true);
    });

    test('search "par" returns Paris', () {
      final query = 'par';
      final results = worldCities.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('Paris'), true);
    });

    test('search with uppercase works', () {
      final query = 'BER';
      final results = worldCities.where((c) => c.toLowerCase().contains(query.toLowerCase())).toList();
      expect(results.contains('Berlin'), true);
    });

    test('search empty returns empty', () {
      final query = '';
      final results = query.isEmpty ? <String>[] : worldCities.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.isEmpty, true);
    });

    test('search nonsense returns empty', () {
      final query = 'xyzzzz';
      final results = worldCities.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.isEmpty, true);
    });

    test('worldCities has no duplicates', () {
      final uniqueCities = worldCities.toSet();
      expect(uniqueCities.length, worldCities.length);
    });

    test('worldCities has at least 300 entries', () {
      expect(worldCities.length >= 300, true);
    });
  });

  group('Countries Autocomplete', () {
    test('worldCountries is not empty', () {
      expect(worldCountries.isNotEmpty, true);
    });

    test('worldCountries contains Tunesien', () {
      expect(worldCountries.contains('Tunesien'), true);
    });

    test('worldCountries contains Deutschland', () {
      expect(worldCountries.contains('Deutschland'), true);
    });

    test('worldCountries uses German names', () {
      expect(worldCountries.contains('Frankreich'), true);
      expect(worldCountries.contains('Großbritannien'), true);
      expect(worldCountries.contains('Österreich'), true);
      expect(worldCountries.contains('Schweiz'), true);
      expect(worldCountries.contains('Ägypten'), true);
      expect(worldCountries.contains('Türkei'), true);
    });

    test('search "Deu" returns Deutschland', () {
      final query = 'deu';
      final results = worldCountries.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('Deutschland'), true);
    });

    test('search "tun" returns Tunesien', () {
      final query = 'tun';
      final results = worldCountries.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('Tunesien'), true);
    });

    test('search "fra" returns Frankreich', () {
      final query = 'fra';
      final results = worldCountries.where((c) => c.toLowerCase().contains(query)).toList();
      expect(results.contains('Frankreich'), true);
    });

    test('worldCountries has no duplicates', () {
      final unique = worldCountries.toSet();
      expect(unique.length, worldCountries.length);
    });

    test('worldCountries has at least 190 entries', () {
      expect(worldCountries.length >= 190, true);
    });

    test('worldCountries is sorted alphabetically', () {
      final sorted = List<String>.from(worldCountries)..sort();
      expect(worldCountries, sorted);
    });
  });
}
