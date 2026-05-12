import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/models/application.dart';
import 'package:bewerbi_tn_flutter/models/education.dart';
import 'package:bewerbi_tn_flutter/models/experience.dart';
import 'package:bewerbi_tn_flutter/models/language_skill.dart';
import 'package:bewerbi_tn_flutter/models/document.dart';

// ---------------------------------------------------------------------------
// Mock Profiles (10 Bewerber + 5 Arbeitgeber + 1 Admin = 16)
// ---------------------------------------------------------------------------

final List<Profile> mockProfiles = [
  // Bewerber
  Profile(
    id: 'profile-1',
    userId: 'user-1',
    role: UserRole.applicant,
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    photoUrl: null,
    phone: '+216 50 123 456',
    city: 'Tunis',
    country: 'Tunesien',
    bio: 'Full-Stack Entwickler mit 3 Jahren Erfahrung. Suche eine Stelle in Deutschland um meine Karriere voranzutreiben.',
    createdAt: DateTime(2024, 1, 15),
  ),
  Profile(
    id: 'profile-5',
    userId: 'user-5',
    role: UserRole.applicant,
    firstName: 'Fatma',
    lastName: 'Trabelsi',
    photoUrl: null,
    phone: '+216 55 987 321',
    city: 'Sfax',
    country: 'Tunesien',
    bio: 'Examinierte Krankenschwester mit 5 Jahren Erfahrung in der Intensivpflege. Deutsch B2 zertifiziert.',
    createdAt: DateTime(2024, 2, 10),
  ),
  Profile(
    id: 'profile-6',
    userId: 'user-6',
    role: UserRole.applicant,
    firstName: 'Mohamed',
    lastName: 'Chaari',
    photoUrl: null,
    phone: '+216 98 456 789',
    city: 'Sousse',
    country: 'Tunesien',
    bio: 'LKW-Fahrer mit CE-Führerschein und 8 Jahren Erfahrung im internationalen Fernverkehr.',
    createdAt: DateTime(2024, 2, 20),
  ),
  Profile(
    id: 'profile-7',
    userId: 'user-7',
    role: UserRole.applicant,
    firstName: 'Amira',
    lastName: 'Bouazizi',
    photoUrl: null,
    phone: '+216 52 111 222',
    city: 'Tunis',
    country: 'Tunesien',
    bio: 'Data Scientist mit Master in Statistik. Erfahrung mit Python, TensorFlow und SQL.',
    createdAt: DateTime(2024, 3, 1),
  ),
  Profile(
    id: 'profile-8',
    userId: 'user-8',
    role: UserRole.applicant,
    firstName: 'Youssef',
    lastName: 'Meddeb',
    photoUrl: null,
    phone: '+216 54 333 444',
    city: 'Bizerte',
    country: 'Tunesien',
    bio: 'Busfahrer mit D-Führerschein und Personenbeförderungsschein. 4 Jahre Erfahrung im ÖPNV.',
    createdAt: DateTime(2024, 3, 5),
  ),
  Profile(
    id: 'profile-9',
    userId: 'user-9',
    role: UserRole.applicant,
    firstName: 'Sarra',
    lastName: 'Jlassi',
    photoUrl: null,
    phone: '+216 56 555 666',
    city: 'Monastir',
    country: 'Tunesien',
    bio: 'Altenpflegerin mit 3 Jahren Erfahrung. Goethe B1 Zertifikat vorhanden. Suche Stelle in NRW.',
    createdAt: DateTime(2024, 3, 10),
  ),
  Profile(
    id: 'profile-10',
    userId: 'user-10',
    role: UserRole.applicant,
    firstName: 'Khalil',
    lastName: 'Sassi',
    photoUrl: null,
    phone: '+216 53 777 888',
    city: 'Gabès',
    country: 'Tunesien',
    bio: 'Mechatronik-Ingenieur, frisch diplomiert. Suche Ausbildung oder Einstiegsstelle in der Automobilindustrie.',
    createdAt: DateTime(2024, 3, 15),
  ),
  Profile(
    id: 'profile-11',
    userId: 'user-11',
    role: UserRole.applicant,
    firstName: 'Nour',
    lastName: 'Hamdi',
    photoUrl: null,
    phone: '+216 58 999 000',
    city: 'Nabeul',
    country: 'Tunesien',
    bio: 'UI/UX Designerin mit 4 Jahren Erfahrung. Portfolio mit 20+ Projekten. Suche Remote oder vor Ort in Deutschland.',
    createdAt: DateTime(2024, 3, 20),
  ),
  Profile(
    id: 'profile-12',
    userId: 'user-12',
    role: UserRole.applicant,
    firstName: 'Rami',
    lastName: 'Guesmi',
    photoUrl: null,
    phone: '+216 50 222 333',
    city: 'Kairouan',
    country: 'Tunesien',
    bio: 'Elektriker mit Meisterbrief. 6 Jahre Erfahrung in der Gebäudetechnik. Deutsch A2.',
    createdAt: DateTime(2024, 3, 25),
  ),
  Profile(
    id: 'profile-13',
    userId: 'user-13',
    role: UserRole.applicant,
    firstName: 'Ines',
    lastName: 'Khelifi',
    photoUrl: null,
    phone: '+216 57 444 555',
    city: 'Tunis',
    country: 'Tunesien',
    bio: 'Zahnmedizin-Studentin im letzten Jahr. Suche Studienplatz oder Assistenzstelle in Deutschland.',
    createdAt: DateTime(2024, 4, 1),
  ),

  // Arbeitgeber
  Profile(
    id: 'profile-2',
    userId: 'user-2',
    role: UserRole.employer,
    firstName: 'Deutsche',
    lastName: 'Pflegedienst GmbH',
    photoUrl: null,
    phone: '+49 30 123 456 78',
    city: 'Berlin',
    country: 'Deutschland',
    bio: 'Einer der führenden Pflegedienste in Berlin. Wir suchen motivierte Pflegekräfte aus dem Ausland.',
    createdAt: DateTime(2024, 1, 10),
  ),
  Profile(
    id: 'profile-3',
    userId: 'user-3',
    role: UserRole.employer,
    firstName: 'TechStart',
    lastName: 'GmbH',
    photoUrl: null,
    phone: '+49 89 987 654 32',
    city: 'München',
    country: 'Deutschland',
    bio: 'Innovatives Tech-Startup in München. Wir entwickeln Cloud-Lösungen und suchen internationale Talente.',
    createdAt: DateTime(2024, 2, 1),
  ),
  Profile(
    id: 'profile-14',
    userId: 'user-14',
    role: UserRole.employer,
    firstName: 'Klinikum',
    lastName: 'Stuttgart',
    photoUrl: null,
    phone: '+49 711 222 333',
    city: 'Stuttgart',
    country: 'Deutschland',
    bio: 'Universitätsklinikum mit 2.000 Betten. Wir bieten Ausbildungs- und Arbeitsplätze für internationale Fachkräfte.',
    createdAt: DateTime(2024, 2, 15),
  ),
  Profile(
    id: 'profile-15',
    userId: 'user-15',
    role: UserRole.employer,
    firstName: 'LogiTrans',
    lastName: 'Spedition GmbH',
    photoUrl: null,
    phone: '+49 40 555 666',
    city: 'Hamburg',
    country: 'Deutschland',
    bio: 'Internationale Spedition mit 500+ LKW. Wir suchen Fahrer für den europäischen Fernverkehr.',
    createdAt: DateTime(2024, 3, 1),
  ),
  Profile(
    id: 'profile-16',
    userId: 'user-16',
    role: UserRole.employer,
    firstName: 'DataVision',
    lastName: 'AG',
    photoUrl: null,
    phone: '+49 69 777 888',
    city: 'Frankfurt',
    country: 'Deutschland',
    bio: 'Data-Analytics Unternehmen. Wir helfen Unternehmen, datengetriebene Entscheidungen zu treffen.',
    createdAt: DateTime(2024, 3, 10),
  ),

  // Admin
  Profile(
    id: 'profile-4',
    userId: 'user-4',
    role: UserRole.admin,
    firstName: 'Admin',
    lastName: 'bewerbi.tn',
    photoUrl: null,
    phone: '+216 70 000 000',
    city: 'Tunis',
    country: 'Tunesien',
    bio: 'Plattform-Administrator',
    createdAt: DateTime(2024, 1, 1),
  ),
];

// Helper to find profiles by id
Profile? _profile(String id) => mockProfiles.where((p) => p.id == id).firstOrNull;

// ---------------------------------------------------------------------------
// Mock Jobs (20 Stellen)
// ---------------------------------------------------------------------------

final List<Job> mockJobs = [
  // IT Jobs
  Job(
    id: 'job-1',
    employerId: 'profile-3',
    title: 'Full-Stack Entwickler (m/w/d)',
    description:
        'Wir suchen einen erfahrenen Full-Stack Entwickler für unser wachsendes Team in München.\n\n'
        'Ihre Aufgaben:\n'
        '- Entwicklung von Web-Applikationen mit React und Node.js\n'
        '- Gestaltung und Implementierung von REST-APIs\n'
        '- Code-Reviews und Mentoring von Junior-Entwicklern\n'
        '- Zusammenarbeit mit dem Design-Team',
    category: JobCategory.it,
    type: JobType.job,
    location: 'München',
    requirements:
        '- 3+ Jahre Erfahrung in React/TypeScript\n- Node.js und REST APIs\n- Deutsch B1 oder höher\n- Abgeschlossenes Studium in Informatik',
    salaryRange: '55.000 - 70.000 €',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
    status: 'active',
    employer: _profile('profile-3'),
    customQuestions: [
      'Haben Sie Erfahrung mit agilen Methoden (Scrum/Kanban)?',
      'Wann ist Ihr frühestmöglicher Eintrittstermin?',
    ],
  ),
  Job(
    id: 'job-7',
    employerId: 'profile-3',
    title: 'DevOps Engineer (m/w/d)',
    description:
        'Zur Verstärkung unseres Infrastructure-Teams suchen wir einen DevOps Engineer.\n\n'
        'Ihre Aufgaben:\n'
        '- CI/CD-Pipelines aufbauen und warten\n'
        '- Kubernetes-Cluster Management\n'
        '- Monitoring und Alerting\n'
        '- Infrastructure as Code mit Terraform',
    category: JobCategory.it,
    type: JobType.job,
    location: 'Frankfurt',
    requirements:
        '- Docker und Kubernetes\n- Terraform oder Pulumi\n- Linux-Administration\n- Deutsch B1',
    salaryRange: '60.000 - 80.000 €',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    status: 'active',
    employer: _profile('profile-3'),
    customQuestions: [
      'Welche CI/CD-Tools haben Sie bereits produktiv eingesetzt?',
      'Haben Sie Erfahrung mit On-Call-Rotation?',
    ],
  ),
  Job(
    id: 'job-9',
    employerId: 'profile-16',
    title: 'Data Engineer (m/w/d)',
    description:
        'Wir suchen einen Data Engineer für unser Analytics-Team in Frankfurt.\n\n'
        'Aufgaben:\n'
        '- Aufbau und Wartung von Datenpipelines\n'
        '- ETL-Prozesse mit Apache Spark und Airflow\n'
        '- Data Warehouse Design\n'
        '- Zusammenarbeit mit Data Scientists',
    category: JobCategory.it,
    type: JobType.job,
    location: 'Frankfurt',
    requirements:
        '- Python und SQL\n- Apache Spark/Airflow\n- Cloud (AWS/GCP)\n- Deutsch B1',
    salaryRange: '58.000 - 75.000 €',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    status: 'active',
    employer: _profile('profile-16'),
  ),
  Job(
    id: 'job-10',
    employerId: 'profile-3',
    title: 'Mobile App Entwickler - Flutter (m/w/d)',
    description:
        'Entwickle mit uns moderne Mobile Apps mit Flutter!\n\n'
        'Aufgaben:\n'
        '- Entwicklung von iOS/Android Apps mit Flutter\n'
        '- Integration von REST-APIs und Firebase\n'
        '- UI/UX Umsetzung nach Figma-Designs\n'
        '- App Store Deployment',
    category: JobCategory.it,
    type: JobType.job,
    location: 'München',
    requirements:
        '- 2+ Jahre Flutter/Dart\n- REST APIs und Firebase\n- Git und CI/CD\n- Deutsch A2',
    salaryRange: '50.000 - 65.000 €',
    germanLevel: LanguageLevel.a2,
    createdAt: DateTime.now().subtract(const Duration(days: 4)),
    status: 'active',
    employer: _profile('profile-3'),
  ),
  Job(
    id: 'job-11',
    employerId: 'profile-16',
    title: 'IT-Systemadministrator (m/w/d)',
    description:
        'Administration unserer IT-Infrastruktur in Frankfurt.\n\n'
        'Aufgaben:\n'
        '- Windows/Linux Server Administration\n'
        '- Netzwerk-Management (Cisco, Fortinet)\n'
        '- User Support und Helpdesk\n'
        '- IT-Sicherheit und Backup',
    category: JobCategory.it,
    type: JobType.job,
    location: 'Frankfurt',
    requirements:
        '- Windows Server und Active Directory\n- Linux (Ubuntu/RHEL)\n- Netzwerkkenntnisse\n- Deutsch B2',
    salaryRange: '45.000 - 55.000 €',
    germanLevel: LanguageLevel.b2,
    createdAt: DateTime.now().subtract(const Duration(days: 6)),
    status: 'active',
    employer: _profile('profile-16'),
  ),

  // Pflege Jobs
  Job(
    id: 'job-2',
    employerId: 'profile-2',
    title: 'Pflegefachkraft (m/w/d)',
    description:
        'Für unsere Einrichtungen in Berlin suchen wir engagierte Pflegefachkräfte.\n\n'
        'Wir bieten:\n'
        '- Unterstützung bei Visa und Anerkennung\n'
        '- Sprachkurs-Förderung\n'
        '- Willkommenspaket\n'
        '- Unbefristeter Vertrag',
    category: JobCategory.pflege,
    type: JobType.job,
    location: 'Berlin',
    requirements:
        '- Abgeschlossene Pflegeausbildung\n- Deutsch B1\n- Bereitschaft zum Schichtdienst\n- Empathie und Teamfähigkeit',
    salaryRange: '38.000 - 48.000 €',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
    status: 'active',
    employer: _profile('profile-2'),
    customQuestions: [
      'Ist Ihr Pflegeabschluss bereits in Deutschland anerkannt?',
      'Haben Sie Erfahrung in der ambulanten Pflege?',
      'Sind Sie bereit, im Schichtdienst zu arbeiten?',
    ],
  ),
  Job(
    id: 'job-3',
    employerId: 'profile-2',
    title: 'Ausbildung zur Pflegefachkraft',
    description:
        'Starte deine Karriere in der Pflege mit einer 3-jährigen Ausbildung.\n\n'
        'Was wir bieten:\n'
        '- Vergütete Ausbildung ab Tag 1\n'
        '- Begleiteter Deutschkurs\n'
        '- Wohnheim während der Ausbildung\n'
        '- Übernahmegarantie',
    category: JobCategory.pflege,
    type: JobType.ausbildung,
    location: 'Berlin',
    requirements:
        '- Mittlerer Schulabschluss\n- Deutsch A2 (B1 wird erreicht)\n- Motivation und Empathie\n- Alter 18-35',
    salaryRange: '1.200 - 1.500 €/Monat',
    germanLevel: LanguageLevel.a2,
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    status: 'active',
    employer: _profile('profile-2'),
  ),
  Job(
    id: 'job-12',
    employerId: 'profile-14',
    title: 'Intensivpfleger/in (m/w/d)',
    description:
        'Für unsere Intensivstation suchen wir erfahrene Pflegekräfte.\n\n'
        'Aufgaben:\n'
        '- Überwachung von Intensivpatienten\n'
        '- Beatmungsmanagement\n'
        '- Medikamentengabe nach Arztanordnung\n'
        '- Dokumentation',
    category: JobCategory.pflege,
    type: JobType.job,
    location: 'Stuttgart',
    requirements:
        '- Intensivpflege-Erfahrung\n- Deutsch B2\n- Teamfähigkeit\n- Schichtbereitschaft',
    salaryRange: '42.000 - 52.000 €',
    germanLevel: LanguageLevel.b2,
    createdAt: DateTime.now().subtract(const Duration(days: 5)),
    status: 'active',
    employer: _profile('profile-14'),
  ),
  Job(
    id: 'job-13',
    employerId: 'profile-14',
    title: 'Ausbildung Operationstechnische Assistenz',
    description:
        'Werde OTA am Klinikum Stuttgart!\n\n'
        'Die Ausbildung:\n'
        '- 3 Jahre dual (Theorie + Praxis)\n'
        '- Einsatz in verschiedenen OP-Bereichen\n'
        '- Stipendium für internationale Bewerber\n'
        '- Mentoring-Programm',
    category: JobCategory.pflege,
    type: JobType.ausbildung,
    location: 'Stuttgart',
    requirements:
        '- Mittlere Reife oder höher\n- Deutsch B1\n- Interesse an Medizin\n- Belastbarkeit',
    salaryRange: '1.300 - 1.600 €/Monat',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 8)),
    status: 'active',
    employer: _profile('profile-14'),
  ),

  // Transport Jobs
  Job(
    id: 'job-4',
    employerId: 'profile-15',
    title: 'LKW-Fahrer CE (m/w/d)',
    description:
        'Wir suchen erfahrene LKW-Fahrer für den europäischen Fernverkehr.\n\n'
        'Benefits:\n'
        '- Moderner Fuhrpark (Mercedes, Volvo)\n'
        '- Faire Spesen\n'
        '- Regelmäßige Heimfahrten\n'
        '- Tankkarte',
    category: JobCategory.transport,
    type: JobType.job,
    location: 'Hamburg',
    requirements:
        '- Führerschein CE + Module\n- 2+ Jahre Berufserfahrung\n- Deutsch A2\n- ADR-Schein von Vorteil',
    salaryRange: '35.000 - 45.000 €',
    germanLevel: LanguageLevel.a2,
    createdAt: DateTime.now().subtract(const Duration(days: 5)),
    status: 'active',
    employer: _profile('profile-15'),
  ),
  Job(
    id: 'job-8',
    employerId: 'profile-15',
    title: 'Busfahrer (m/w/d) - ÖPNV',
    description:
        'Für den öffentlichen Nahverkehr in Köln suchen wir zuverlässige Busfahrer.\n\n'
        'Wir bieten:\n'
        '- Tarifvertrag ÖPNV\n'
        '- 30 Tage Urlaub\n'
        '- Jobticket\n'
        '- Unterstützung beim Umzug',
    category: JobCategory.transport,
    type: JobType.job,
    location: 'Köln',
    requirements:
        '- Führerschein D + P-Schein\n- Deutsch B1\n- Kundenorientierung\n- Zuverlässigkeit',
    salaryRange: '32.000 - 40.000 €',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 7)),
    status: 'active',
    employer: _profile('profile-15'),
  ),
  Job(
    id: 'job-14',
    employerId: 'profile-15',
    title: 'Berufskraftfahrer-Ausbildung (IHK)',
    description:
        'Werde Berufskraftfahrer mit IHK-Abschluss!\n\n'
        'Ausbildungsinhalte:\n'
        '- Führerschein CE inklusive\n'
        '- Fahrzeugtechnik und Ladungssicherung\n'
        '- Tourenplanung und Logistik\n'
        '- Gefahrguttransport',
    category: JobCategory.transport,
    type: JobType.ausbildung,
    location: 'Hamburg',
    requirements:
        '- Hauptschulabschluss\n- Deutsch A2\n- Mindestalter 17\n- Gesundheitliche Eignung',
    salaryRange: '1.000 - 1.200 €/Monat',
    germanLevel: LanguageLevel.a2,
    createdAt: DateTime.now().subtract(const Duration(days: 10)),
    status: 'active',
    employer: _profile('profile-15'),
  ),

  // Sprachkurse
  Job(
    id: 'job-5',
    employerId: 'profile-4',
    title: 'Intensiv-Deutschkurs B1 in Berlin',
    description:
        '12-wöchiger Intensiv-Deutschkurs für Fachkräfte.\n\n'
        'Kursinhalt:\n'
        '- 20 Stunden/Woche\n'
        '- Prüfungsvorbereitung Goethe B1\n'
        '- Berufsbezogenes Deutsch\n'
        '- Kulturelle Orientierung',
    category: JobCategory.sonstige,
    type: JobType.sprachkurs,
    location: 'Online + Berlin',
    requirements: '- Deutsch A2 Vorkenntnisse\n- Internetzugang für Online-Sessions',
    salaryRange: '1.800 € (Kurs)',
    germanLevel: LanguageLevel.a2,
    createdAt: DateTime.now().subtract(const Duration(days: 4)),
    status: 'active',
    employer: _profile('profile-4'),
  ),
  Job(
    id: 'job-15',
    employerId: 'profile-4',
    title: 'Deutschkurs B2 für Pflegekräfte',
    description:
        'Spezialisierter Deutschkurs für Pflegefachkräfte.\n\n'
        'Schwerpunkte:\n'
        '- Medizinische Fachterminologie\n'
        '- Patientenkommunikation\n'
        '- Pflegedokumentation auf Deutsch\n'
        '- telc Deutsch B2 Pflege Prüfung',
    category: JobCategory.sonstige,
    type: JobType.sprachkurs,
    location: 'Online',
    requirements: '- Deutsch B1\n- Pflegeausbildung\n- Stabile Internetverbindung',
    salaryRange: '2.200 € (Kurs)',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 9)),
    status: 'active',
    employer: _profile('profile-4'),
  ),
  Job(
    id: 'job-16',
    employerId: 'profile-4',
    title: 'Deutsch A1-A2 Anfängerkurs',
    description:
        'Starte deine Deutsch-Reise von Null!\n\n'
        'Kursdetails:\n'
        '- 16 Wochen, 15 Std/Woche\n'
        '- Kleine Gruppen (max. 12 Teilnehmer)\n'
        '- Muttersprachliche Lehrer\n'
        '- Goethe A2 Prüfung am Ende',
    category: JobCategory.sonstige,
    type: JobType.sprachkurs,
    location: 'Tunis + Online',
    requirements: '- Keine Vorkenntnisse nötig\n- Motivation\n- Computer/Tablet',
    salaryRange: '900 € (Kurs)',
    germanLevel: null,
    createdAt: DateTime.now().subtract(const Duration(days: 12)),
    status: 'active',
    employer: _profile('profile-4'),
  ),

  // Studiengänge
  Job(
    id: 'job-6',
    employerId: 'profile-3',
    title: 'Informatik Studium - TU München',
    description:
        'Bachelor-Studiengang Informatik an der TU München.\n\n'
        'Highlights:\n'
        '- Englischsprachige Module verfügbar\n'
        '- Stipendien-Programm\n'
        '- Studentenwohnheim\n'
        '- Praxissemester bei Partnerunternehmen',
    category: JobCategory.it,
    type: JobType.studium,
    location: 'München',
    requirements:
        '- Abitur oder äquivalent\n- Deutsch B2 oder Englisch C1\n- Mathematik-Grundkenntnisse\n- Motivationsschreiben',
    salaryRange: null,
    germanLevel: LanguageLevel.b2,
    createdAt: DateTime.now().subtract(const Duration(days: 6)),
    status: 'active',
    employer: _profile('profile-3'),
  ),
  Job(
    id: 'job-17',
    employerId: 'profile-14',
    title: 'Pflegewissenschaft Studium (B.Sc.)',
    description:
        'Dualer Studiengang Pflegewissenschaft am Klinikum Stuttgart.\n\n'
        'Besonderheiten:\n'
        '- Dual: Studium + Praxis im Klinikum\n'
        '- Vergütung während des Studiums\n'
        '- Internationale Kohorte\n'
        '- Karrierechancen nach Abschluss',
    category: JobCategory.pflege,
    type: JobType.studium,
    location: 'Stuttgart',
    requirements:
        '- Fachabitur oder höher\n- Deutsch B2\n- Interesse an Pflegewissenschaft\n- Gesundheitliche Eignung',
    salaryRange: '1.400 €/Monat',
    germanLevel: LanguageLevel.b2,
    createdAt: DateTime.now().subtract(const Duration(days: 11)),
    status: 'active',
    employer: _profile('profile-14'),
  ),

  // Sonstige
  Job(
    id: 'job-18',
    employerId: 'profile-16',
    title: 'Werkstudent Data Analytics (m/w/d)',
    description:
        'Unterstütze unser Analytics-Team als Werkstudent.\n\n'
        'Aufgaben:\n'
        '- Datenanalyse mit Python/R\n'
        '- Dashboard-Erstellung (Tableau/Power BI)\n'
        '- Datenaufbereitung und Qualitätssicherung\n'
        '- Unterstützung bei Kundenprojekten',
    category: JobCategory.it,
    type: JobType.job,
    location: 'Frankfurt (Hybrid)',
    requirements:
        '- Eingeschriebener Student\n- Python oder R Kenntnisse\n- SQL Grundlagen\n- Deutsch B1',
    salaryRange: '15 - 18 €/Stunde',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
    status: 'active',
    employer: _profile('profile-16'),
  ),
  Job(
    id: 'job-19',
    employerId: 'profile-2',
    title: 'Altenpfleger/in (m/w/d) - Nachtdienst',
    description:
        'Für unsere Seniorenresidenz suchen wir eine Nachtwache.\n\n'
        'Aufgaben:\n'
        '- Pflege und Betreuung der Bewohner\n'
        '- Medikamentengabe\n'
        '- Rufbereitschaft und Notfallmanagement\n'
        '- Übergabe an den Frühdienst',
    category: JobCategory.pflege,
    type: JobType.job,
    location: 'Berlin-Spandau',
    requirements:
        '- Pflegeausbildung\n- Erfahrung in der Altenpflege\n- Deutsch B1\n- Nachtwachentauglichkeit',
    salaryRange: '40.000 - 46.000 €',
    germanLevel: LanguageLevel.b1,
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    status: 'active',
    employer: _profile('profile-2'),
  ),
];

// ---------------------------------------------------------------------------
// Mock Education (für mehrere Bewerber)
// ---------------------------------------------------------------------------

final List<Education> mockEducation = [
  // Ahmed Ben Ali
  Education(
    id: 'edu-1',
    userId: 'user-1',
    institution: 'Université de Tunis El Manar',
    degree: 'Licence (Bachelor)',
    fieldOfStudy: 'Informatik',
    startDate: DateTime(2017, 9),
    endDate: DateTime(2020, 6),
    current: false,
    description: 'Grundstudium der Informatik mit Schwerpunkt Softwareentwicklung.',
  ),
  Education(
    id: 'edu-2',
    userId: 'user-1',
    institution: 'ENIT - École Nationale d\'Ingénieurs de Tunis',
    degree: 'Mastère (Master)',
    fieldOfStudy: 'Software Engineering',
    startDate: DateTime(2020, 9),
    endDate: DateTime(2022, 6),
    current: false,
    description: 'Masterstudium in Software Engineering. Abschlussarbeit über Cloud-native Anwendungen.',
  ),
  // Fatma Trabelsi
  Education(
    id: 'edu-3',
    userId: 'user-5',
    institution: 'Institut Supérieur des Sciences Infirmières de Sfax',
    degree: 'Licence',
    fieldOfStudy: 'Krankenpflege',
    startDate: DateTime(2015, 9),
    endDate: DateTime(2018, 6),
    current: false,
    description: 'Pflegestudium mit Schwerpunkt Intensivpflege.',
  ),
  // Amira Bouazizi
  Education(
    id: 'edu-4',
    userId: 'user-7',
    institution: 'ESSECT - Université de Tunis',
    degree: 'Licence',
    fieldOfStudy: 'Statistik und Datenanalyse',
    startDate: DateTime(2016, 9),
    endDate: DateTime(2019, 6),
    current: false,
    description: 'Statistik mit Anwendungen in Data Science.',
  ),
  Education(
    id: 'edu-5',
    userId: 'user-7',
    institution: 'ENSI - École Nationale des Sciences de l\'Informatique',
    degree: 'Master',
    fieldOfStudy: 'Data Science & AI',
    startDate: DateTime(2019, 9),
    endDate: DateTime(2021, 6),
    current: false,
    description: 'Machine Learning, Deep Learning, NLP. Thesis über Sentiment Analysis.',
  ),
  // Khalil Sassi
  Education(
    id: 'edu-6',
    userId: 'user-10',
    institution: 'ENIS - École Nationale d\'Ingénieurs de Sfax',
    degree: 'Diplôme d\'Ingénieur',
    fieldOfStudy: 'Mechatronik',
    startDate: DateTime(2019, 9),
    endDate: DateTime(2024, 6),
    current: false,
    description: '5-jähriges Ingenieurstudium in Mechatronik mit Praxissemester bei Bosch Tunesien.',
  ),
  // Nour Hamdi
  Education(
    id: 'edu-7',
    userId: 'user-11',
    institution: 'ISAMM - Institut Supérieur des Arts Multimédia de la Manouba',
    degree: 'Licence',
    fieldOfStudy: 'Multimedia Design',
    startDate: DateTime(2017, 9),
    endDate: DateTime(2020, 6),
    current: false,
    description: 'UI/UX Design, Grafikdesign, Motion Design.',
  ),
];

// ---------------------------------------------------------------------------
// Mock Experience (für mehrere Bewerber)
// ---------------------------------------------------------------------------

final List<Experience> mockExperience = [
  // Ahmed Ben Ali
  Experience(
    id: 'exp-1',
    userId: 'user-1',
    company: 'Vermeg',
    position: 'Junior Web Developer',
    location: 'Tunis, Tunesien',
    startDate: DateTime(2021, 7),
    endDate: DateTime(2023, 3),
    current: false,
    description: 'Entwicklung von Bankanwendungen mit Angular und Spring Boot.',
  ),
  Experience(
    id: 'exp-2',
    userId: 'user-1',
    company: 'Sofrecom Tunisia',
    position: 'Full-Stack Developer',
    location: 'Tunis, Tunesien',
    startDate: DateTime(2023, 4),
    endDate: null,
    current: true,
    description: 'React/Node.js Entwicklung für Telekommunikationskunden.',
  ),
  // Fatma Trabelsi
  Experience(
    id: 'exp-3',
    userId: 'user-5',
    company: 'Clinique Les Oliviers',
    position: 'Krankenschwester - Intensivstation',
    location: 'Sfax, Tunesien',
    startDate: DateTime(2018, 9),
    endDate: DateTime(2021, 12),
    current: false,
    description: 'Betreuung von Intensivpatienten, Beatmungsmanagement, Notfallversorgung.',
  ),
  Experience(
    id: 'exp-4',
    userId: 'user-5',
    company: 'Hôpital Habib Bourguiba',
    position: 'Pflegefachkraft - Kardiologie',
    location: 'Sfax, Tunesien',
    startDate: DateTime(2022, 1),
    endDate: null,
    current: true,
    description: 'Pflege auf der Kardiologie-Station, EKG-Überwachung, Patientenberatung.',
  ),
  // Mohamed Chaari
  Experience(
    id: 'exp-5',
    userId: 'user-6',
    company: 'Sotrapil',
    position: 'LKW-Fahrer Fernverkehr',
    location: 'Sousse, Tunesien',
    startDate: DateTime(2016, 3),
    endDate: null,
    current: true,
    description: 'Internationaler Fernverkehr Tunesien-Libyen-Algerien. 500.000+ km unfallfrei.',
  ),
  // Amira Bouazizi
  Experience(
    id: 'exp-6',
    userId: 'user-7',
    company: 'Talan Tunisia',
    position: 'Junior Data Analyst',
    location: 'Tunis, Tunesien',
    startDate: DateTime(2021, 9),
    endDate: DateTime(2023, 6),
    current: false,
    description: 'Datenanalyse mit Python und Tableau. Erstellung von KPI-Dashboards.',
  ),
  Experience(
    id: 'exp-7',
    userId: 'user-7',
    company: 'Linedata',
    position: 'Data Scientist',
    location: 'Tunis, Tunesien',
    startDate: DateTime(2023, 7),
    endDate: null,
    current: true,
    description: 'ML-Modelle für Finanzprognosen. TensorFlow, scikit-learn, BigQuery.',
  ),
  // Nour Hamdi
  Experience(
    id: 'exp-8',
    userId: 'user-11',
    company: 'Digitale Agentur Pixelcraft',
    position: 'UI/UX Designer',
    location: 'Tunis, Tunesien',
    startDate: DateTime(2020, 9),
    endDate: null,
    current: true,
    description: 'Design von Mobile Apps und Webseiten. Figma, Adobe XD, Prototyping. 20+ Projekte.',
  ),
];

// ---------------------------------------------------------------------------
// Mock Language Skills (für mehrere Bewerber)
// ---------------------------------------------------------------------------

final List<LanguageSkill> mockLanguages = [
  // Ahmed Ben Ali
  LanguageSkill(id: 'lang-1', userId: 'user-1', language: 'Arabisch', level: LanguageLevel.c2, certified: false),
  LanguageSkill(id: 'lang-2', userId: 'user-1', language: 'Französisch', level: LanguageLevel.c1, certified: true),
  LanguageSkill(id: 'lang-3', userId: 'user-1', language: 'Deutsch', level: LanguageLevel.b1, certified: true),
  LanguageSkill(id: 'lang-4', userId: 'user-1', language: 'Englisch', level: LanguageLevel.b2, certified: false),
  // Fatma Trabelsi
  LanguageSkill(id: 'lang-5', userId: 'user-5', language: 'Arabisch', level: LanguageLevel.c2, certified: false),
  LanguageSkill(id: 'lang-6', userId: 'user-5', language: 'Französisch', level: LanguageLevel.c1, certified: false),
  LanguageSkill(id: 'lang-7', userId: 'user-5', language: 'Deutsch', level: LanguageLevel.b2, certified: true),
  // Mohamed Chaari
  LanguageSkill(id: 'lang-8', userId: 'user-6', language: 'Arabisch', level: LanguageLevel.c2, certified: false),
  LanguageSkill(id: 'lang-9', userId: 'user-6', language: 'Französisch', level: LanguageLevel.b2, certified: false),
  LanguageSkill(id: 'lang-10', userId: 'user-6', language: 'Deutsch', level: LanguageLevel.a2, certified: false),
  // Amira Bouazizi
  LanguageSkill(id: 'lang-11', userId: 'user-7', language: 'Arabisch', level: LanguageLevel.c2, certified: false),
  LanguageSkill(id: 'lang-12', userId: 'user-7', language: 'Französisch', level: LanguageLevel.c1, certified: true),
  LanguageSkill(id: 'lang-13', userId: 'user-7', language: 'Englisch', level: LanguageLevel.c1, certified: true),
  LanguageSkill(id: 'lang-14', userId: 'user-7', language: 'Deutsch', level: LanguageLevel.a2, certified: false),
  // Nour Hamdi
  LanguageSkill(id: 'lang-15', userId: 'user-11', language: 'Arabisch', level: LanguageLevel.c2, certified: false),
  LanguageSkill(id: 'lang-16', userId: 'user-11', language: 'Französisch', level: LanguageLevel.c1, certified: false),
  LanguageSkill(id: 'lang-17', userId: 'user-11', language: 'Englisch', level: LanguageLevel.b2, certified: false),
  LanguageSkill(id: 'lang-18', userId: 'user-11', language: 'Deutsch', level: LanguageLevel.b1, certified: true),
];

// ---------------------------------------------------------------------------
// Mock Documents (für mehrere Bewerber)
// ---------------------------------------------------------------------------

final List<Document> mockDocuments = [
  // Ahmed Ben Ali
  Document(id: 'doc-1', userId: 'user-1', name: 'Lebenslauf_Ahmed_Ben_Ali.pdf', type: DocumentType.cv, fileUrl: 'https://example.com/cv.pdf', fileSize: 245000, uploadedAt: DateTime(2024, 2, 10)),
  Document(id: 'doc-2', userId: 'user-1', name: 'Master_Diplom_ENIT.pdf', type: DocumentType.diploma, fileUrl: 'https://example.com/diploma.pdf', fileSize: 1200000, uploadedAt: DateTime(2024, 2, 15)),
  Document(id: 'doc-3', userId: 'user-1', name: 'Goethe_B1_Zertifikat.pdf', type: DocumentType.certificate, fileUrl: 'https://example.com/goethe.pdf', fileSize: 380000, uploadedAt: DateTime(2024, 3, 1)),
  // Fatma Trabelsi
  Document(id: 'doc-4', userId: 'user-5', name: 'Lebenslauf_Fatma_Trabelsi.pdf', type: DocumentType.cv, fileUrl: 'https://example.com/cv2.pdf', fileSize: 290000, uploadedAt: DateTime(2024, 3, 5)),
  Document(id: 'doc-5', userId: 'user-5', name: 'Pflegediplom_Sfax.pdf', type: DocumentType.diploma, fileUrl: 'https://example.com/diploma2.pdf', fileSize: 950000, uploadedAt: DateTime(2024, 3, 5)),
  Document(id: 'doc-6', userId: 'user-5', name: 'Goethe_B2_Zertifikat.pdf', type: DocumentType.certificate, fileUrl: 'https://example.com/goethe2.pdf', fileSize: 410000, uploadedAt: DateTime(2024, 3, 8)),
  // Mohamed Chaari
  Document(id: 'doc-7', userId: 'user-6', name: 'Fuehrerschein_CE.pdf', type: DocumentType.certificate, fileUrl: 'https://example.com/fs.pdf', fileSize: 520000, uploadedAt: DateTime(2024, 3, 10)),
  // Amira Bouazizi
  Document(id: 'doc-8', userId: 'user-7', name: 'Lebenslauf_Amira_Bouazizi.pdf', type: DocumentType.cv, fileUrl: 'https://example.com/cv3.pdf', fileSize: 310000, uploadedAt: DateTime(2024, 3, 15)),
  Document(id: 'doc-9', userId: 'user-7', name: 'Master_Data_Science.pdf', type: DocumentType.diploma, fileUrl: 'https://example.com/diploma3.pdf', fileSize: 1100000, uploadedAt: DateTime(2024, 3, 15)),
];

// ---------------------------------------------------------------------------
// Mock Applications (8 Bewerbungen von verschiedenen Bewerbern)
// ---------------------------------------------------------------------------

final List<Application> mockApplications = [
  // Ahmed → Full-Stack Dev (reviewed)
  Application(
    id: 'app-1', jobId: 'job-1', applicantId: 'profile-1',
    status: ApplicationStatus.reviewed,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich als Full-Stack Entwickler. Mit 3 Jahren Erfahrung in React und Node.js bin ich überzeugt, Ihr Team optimal zu verstärken.\n\nMit freundlichen Grüßen,\nAhmed Ben Ali',
    createdAt: DateTime.now().subtract(const Duration(days: 5)),
    job: mockJobs.where((j) => j.id == 'job-1').firstOrNull,
    applicant: _profile('profile-1'),
  ),
  // Ahmed → DevOps (pending)
  Application(
    id: 'app-2', jobId: 'job-7', applicantId: 'profile-1',
    status: ApplicationStatus.pending,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nich bewerbe mich auf die Stelle als DevOps Engineer. Durch meine Erfahrung mit Cloud-Technologien und CI/CD-Pipelines bringe ich die nötigen Kenntnisse mit.\n\nMit freundlichen Grüßen,\nAhmed Ben Ali',
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
    job: mockJobs.where((j) => j.id == 'job-7').firstOrNull,
    applicant: _profile('profile-1'),
  ),
  // Fatma → Pflegefachkraft (accepted)
  Application(
    id: 'app-3', jobId: 'job-2', applicantId: 'profile-5',
    status: ApplicationStatus.accepted,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nals examinierte Krankenschwester mit 5 Jahren Intensivpflege-Erfahrung und Deutsch B2 bewerbe ich mich bei Ihnen.\n\nMit freundlichen Grüßen,\nFatma Trabelsi',
    createdAt: DateTime.now().subtract(const Duration(days: 10)),
    job: mockJobs.where((j) => j.id == 'job-2').firstOrNull,
    applicant: _profile('profile-5'),
  ),
  // Mohamed → LKW-Fahrer (reviewed)
  Application(
    id: 'app-4', jobId: 'job-4', applicantId: 'profile-6',
    status: ApplicationStatus.reviewed,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nmit CE-Führerschein und 8 Jahren Fernverkehr-Erfahrung bewerbe ich mich als LKW-Fahrer.\n\nMohamed Chaari',
    createdAt: DateTime.now().subtract(const Duration(days: 7)),
    job: mockJobs.where((j) => j.id == 'job-4').firstOrNull,
    applicant: _profile('profile-6'),
  ),
  // Amira → Data Engineer (pending)
  Application(
    id: 'app-5', jobId: 'job-9', applicantId: 'profile-7',
    status: ApplicationStatus.pending,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nals Data Scientist mit Erfahrung in Python, Spark und ML-Modellen bewerbe ich mich als Data Engineer.\n\nAmira Bouazizi',
    createdAt: DateTime.now().subtract(const Duration(days: 3)),
    job: mockJobs.where((j) => j.id == 'job-9').firstOrNull,
    applicant: _profile('profile-7'),
  ),
  // Youssef → Busfahrer (rejected)
  Application(
    id: 'app-6', jobId: 'job-8', applicantId: 'profile-8',
    status: ApplicationStatus.rejected,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nich bewerbe mich als Busfahrer in Köln. Ich habe 4 Jahre ÖPNV-Erfahrung.\n\nYoussef Meddeb',
    createdAt: DateTime.now().subtract(const Duration(days: 14)),
    job: mockJobs.where((j) => j.id == 'job-8').firstOrNull,
    applicant: _profile('profile-8'),
  ),
  // Sarra → Ausbildung Pflege (accepted)
  Application(
    id: 'app-7', jobId: 'job-3', applicantId: 'profile-9',
    status: ApplicationStatus.accepted,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nich möchte gerne eine Ausbildung zur Pflegefachkraft in Berlin beginnen. Ich habe B1 und bin sehr motiviert.\n\nSarra Jlassi',
    createdAt: DateTime.now().subtract(const Duration(days: 20)),
    job: mockJobs.where((j) => j.id == 'job-3').firstOrNull,
    applicant: _profile('profile-9'),
  ),
  // Nour → Flutter Dev (reviewed)
  Application(
    id: 'app-8', jobId: 'job-10', applicantId: 'profile-11',
    status: ApplicationStatus.reviewed,
    coverLetter: 'Sehr geehrte Damen und Herren,\n\nals UI/UX Designerin mit Flutter-Kenntnissen bewerbe ich mich auf die Mobile Developer Stelle.\n\nNour Hamdi',
    createdAt: DateTime.now().subtract(const Duration(days: 4)),
    job: mockJobs.where((j) => j.id == 'job-10').firstOrNull,
    applicant: _profile('profile-11'),
  ),
];
