import 'package:bewerbi_tn_flutter/models/profile.dart';

enum CompletenessTier { starter, mover, advanced, complete }

class MissingField {
  final String key;
  final int weight;
  final String labelDe;
  final String actionDe;
  final String route;

  const MissingField({
    required this.key,
    required this.weight,
    required this.labelDe,
    required this.actionDe,
    required this.route,
  });
}

class CompletenessResult {
  final int percent;
  final CompletenessTier tier;
  final List<MissingField> missing;
  final MissingField? nextAction;

  const CompletenessResult({
    required this.percent,
    required this.tier,
    required this.missing,
    required this.nextAction,
  });
}

/// Profile-completeness scoring — mirrors the Java backend implementation.
class ProfileCompleteness {
  ProfileCompleteness._();

  static CompletenessResult compute(
    Profile? profile, {
    String? desiredProfession,
    String? germanLevel,
    String? recognitionStatus,
    List<String> skills = const [],
  }) {
    if (profile == null) {
      return const CompletenessResult(
        percent: 0,
        tier: CompletenessTier.starter,
        missing: [],
        nextAction: null,
      );
    }

    final checks = <_FieldCheck>[
      _FieldCheck('firstName', 10, 'Vorname', 'Vornamen ergänzen',
          '/applicant/profile/edit', profile.firstName.trim().isNotEmpty),
      _FieldCheck('lastName', 10, 'Nachname', 'Nachnamen ergänzen',
          '/applicant/profile/edit', profile.lastName.trim().isNotEmpty),
      _FieldCheck('phone', 8, 'Telefon', 'Telefonnummer hinzufügen',
          '/applicant/profile/edit', profile.phone.trim().isNotEmpty),
      _FieldCheck('city', 6, 'Stadt', 'Stadt angeben',
          '/applicant/profile/edit', profile.city.trim().isNotEmpty),
      _FieldCheck('country', 4, 'Land', 'Land angeben',
          '/applicant/profile/edit', profile.country.trim().isNotEmpty),
      _FieldCheck('bio', 12, 'Über mich', 'Kurze Vorstellung schreiben',
          '/applicant/profile/edit', profile.bio.trim().isNotEmpty),
      _FieldCheck('photo', 10, 'Profilfoto', 'Profilfoto hochladen',
          '/applicant/profile/edit',
          profile.photoUrl != null && profile.photoUrl!.trim().isNotEmpty),
      _FieldCheck('desiredProfession', 10, 'Wunschberuf', 'Wunschberuf angeben',
          '/applicant/onboarding-quiz',
          desiredProfession != null && desiredProfession.trim().isNotEmpty),
      _FieldCheck('germanLevel', 15, 'Deutsch-Niveau', 'Deutsch-Niveau eintragen',
          '/applicant/onboarding-quiz', germanLevel != null),
      _FieldCheck('recognitionStatus', 5, 'Anerkennung', 'Anerkennung starten',
          '/applicant/anerkennung', recognitionStatus != null),
      _FieldCheck('skills', 10, 'Kompetenzen', 'Kompetenzen hinzufügen',
          '/applicant/onboarding-quiz', skills.isNotEmpty),
    ];

    int percent = 0;
    final missing = <MissingField>[];
    for (final c in checks) {
      if (c.hasValue) {
        percent += c.weight;
      } else {
        missing.add(MissingField(
          key: c.key,
          weight: c.weight,
          labelDe: c.label,
          actionDe: c.action,
          route: c.route,
        ));
      }
    }
    if (percent > 100) percent = 100;

    MissingField? next;
    if (missing.isNotEmpty) {
      missing.sort((a, b) => b.weight.compareTo(a.weight));
      next = missing.first;
    }

    return CompletenessResult(
      percent: percent,
      tier: _tierFor(percent),
      missing: missing,
      nextAction: next,
    );
  }

  static CompletenessTier _tierFor(int percent) {
    if (percent >= 100) return CompletenessTier.complete;
    if (percent >= 75) return CompletenessTier.advanced;
    if (percent >= 40) return CompletenessTier.mover;
    return CompletenessTier.starter;
  }
}

class _FieldCheck {
  final String key;
  final int weight;
  final String label;
  final String action;
  final String route;
  final bool hasValue;

  _FieldCheck(this.key, this.weight, this.label, this.action, this.route,
      this.hasValue);
}
