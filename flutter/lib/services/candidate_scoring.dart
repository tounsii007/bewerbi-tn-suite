import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'mock_data.dart';

/// Berechnet einen Match-Score (0-100) zwischen einem Bewerber und einer Stelle.
/// Wird verwendet um Top-Kandidaten für Arbeitgeber zu sortieren.
class CandidateScoring {
  /// Berechnet den Score für eine Bewerbung basierend auf dem Bewerber-Profil
  static int calculateScore(Application application, Job job) {
    final applicant = application.applicant ??
        mockProfiles.where((p) => p.id == application.applicantId).firstOrNull;
    if (applicant == null) return 0;

    int score = 0;

    // 1. Deutschkenntnisse (max 30 Punkte)
    score += _scoreGermanLevel(applicant.userId, job.germanLevel);

    // 2. Berufserfahrung Relevanz (max 25 Punkte)
    score += _scoreExperience(applicant.userId, job);

    // 3. Bildung Relevanz (max 20 Punkte)
    score += _scoreEducation(applicant.userId, job);

    // 4. Standort-Nähe (max 10 Punkte)
    score += _scoreLocation(applicant, job);

    // 5. Profil-Vollständigkeit (max 10 Punkte)
    score += _scoreProfileCompleteness(applicant);

    // 6. Anschreiben-Qualität (max 5 Punkte)
    score += _scoreCoverLetter(application);

    return score.clamp(0, 100);
  }

  /// Deutschkenntnisse vs. Anforderung
  static int _scoreGermanLevel(String userId, LanguageLevel? requiredLevel) {
    if (requiredLevel == null) return 15; // Kein Deutsch nötig = halbe Punkte

    final userLangs = mockLanguages.where((l) => l.userId == userId).toList();
    final german = userLangs.where((l) => l.language == 'Deutsch').firstOrNull;
    if (german == null) return 0;

    final userLevel = german.level.index;
    final required = requiredLevel.index;

    if (userLevel >= required + 2) return 30; // Deutlich über Anforderung
    if (userLevel >= required + 1) return 25; // Über Anforderung
    if (userLevel >= required) return 20;     // Genau passend
    if (userLevel == required - 1) return 10; // Knapp darunter
    return 0;                                 // Zu niedrig
  }

  /// Berufserfahrung: Kategorie-Match + Jahre
  static int _scoreExperience(String userId, Job job) {
    final experiences = mockExperience.where((e) => e.userId == userId).toList();
    if (experiences.isEmpty) return 0;

    int score = 0;

    // Jahre Erfahrung (max 15)
    int totalMonths = 0;
    for (final exp in experiences) {
      final end = exp.endDate ?? DateTime.now();
      totalMonths += end.difference(exp.startDate).inDays ~/ 30;
    }
    final years = totalMonths / 12;
    if (years >= 5) {
      score += 15;
    } else if (years >= 3) {
      score += 12;
    } else if (years >= 1) {
      score += 8;
    } else {
      score += 3;
    }

    // Relevanz der Erfahrung zum Job (max 10)
    final jobKeywords = _extractKeywords('${job.title} ${job.description}');
    for (final exp in experiences) {
      final expKeywords = _extractKeywords('${exp.position} ${exp.description}');
      final overlap = jobKeywords.intersection(expKeywords).length;
      if (overlap >= 3) {
        score += 10;
        break;
      } else if (overlap >= 1) {
        score += 5;
        break;
      }
    }

    return score.clamp(0, 25);
  }

  /// Bildung: Abschluss + Fachrichtung
  static int _scoreEducation(String userId, Job job) {
    final education = mockEducation.where((e) => e.userId == userId).toList();
    if (education.isEmpty) return 0;

    int score = 0;

    // Höchster Abschluss (max 12)
    final hasMaster = education.any((e) =>
        e.degree.toLowerCase().contains('master') ||
        e.degree.toLowerCase().contains('mastère') ||
        e.degree.toLowerCase().contains('ingénieur'));
    final hasBachelor = education.any((e) =>
        e.degree.toLowerCase().contains('licence') ||
        e.degree.toLowerCase().contains('bachelor'));

    if (hasMaster) {
      score += 12;
    } else if (hasBachelor) {
      score += 8;
    } else {
      score += 4;
    }

    // Fachrichtung passend (max 8)
    final jobKeywords = _extractKeywords('${job.title} ${job.description}');
    for (final edu in education) {
      final eduKeywords = _extractKeywords('${edu.fieldOfStudy} ${edu.description ?? ''}');
      if (jobKeywords.intersection(eduKeywords).isNotEmpty) {
        score += 8;
        break;
      }
    }

    return score.clamp(0, 20);
  }

  /// Standort: Bewerber in der Nähe?
  static int _scoreLocation(Profile applicant, Job job) {
    final jobLoc = job.location.toLowerCase();
    final userCity = applicant.city.toLowerCase();
    final userCountry = applicant.country.toLowerCase();

    // Gleiche Stadt
    if (jobLoc.contains(userCity) || userCity.contains(jobLoc)) return 10;
    // Gleiches Land
    if (userCountry == 'deutschland' && !jobLoc.contains('online')) return 7;
    // Online-Job = alle gleich
    if (jobLoc.contains('online')) return 8;
    // Tunesien → Deutschland = Standard-Fall
    return 3;
  }

  /// Profil-Vollständigkeit
  static int _scoreProfileCompleteness(Profile profile) {
    int score = 0;
    if (profile.firstName.isNotEmpty) score += 1;
    if (profile.lastName.isNotEmpty) score += 1;
    if (profile.phone.isNotEmpty) score += 2;
    if (profile.city.isNotEmpty) score += 1;
    if (profile.bio.isNotEmpty) score += 2;

    final hasCV = mockDocuments.any((d) => d.userId == profile.userId && d.type.name == 'cv');
    if (hasCV) score += 3;

    return score.clamp(0, 10);
  }

  /// Anschreiben-Qualität (Länge als Proxy)
  static int _scoreCoverLetter(Application app) {
    final length = app.coverLetter.length;
    if (length > 300) return 5;
    if (length > 150) return 3;
    if (length > 50) return 1;
    return 0;
  }

  /// Hilfs-Funktion: Keywords extrahieren
  static Set<String> _extractKeywords(String text) {
    final stopWords = {'und', 'oder', 'mit', 'für', 'die', 'der', 'das', 'ein', 'eine', 'in', 'von', 'zu', 'auf', 'ist', 'wir', 'sie', 'ich'};
    return text
        .toLowerCase()
        .replaceAll(RegExp(r'[^\w\säöüß]'), '')
        .split(RegExp(r'\s+'))
        .where((w) => w.length > 2 && !stopWords.contains(w))
        .toSet();
  }

  /// Sortiert Bewerbungen nach Score (höchster zuerst)
  static List<ScoredApplication> rankApplications(List<Application> applications, Job job) {
    final scored = applications.map((app) {
      final score = calculateScore(app, job);
      return ScoredApplication(application: app, score: score);
    }).toList();

    scored.sort((a, b) => b.score.compareTo(a.score));
    return scored;
  }
}

/// Bewerbung mit berechnetem Score
class ScoredApplication {
  final Application application;
  final int score;

  const ScoredApplication({required this.application, required this.score});

  String get matchLabel {
    if (score >= 80) return 'Top-Kandidat';
    if (score >= 60) return 'Guter Match';
    if (score >= 40) return 'Passend';
    return 'Prüfen';
  }

  String get matchColor {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'default';
  }
}
