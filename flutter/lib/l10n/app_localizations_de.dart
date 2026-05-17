// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for German (`de`).
class AppLocalizationsDe extends AppLocalizations {
  AppLocalizationsDe([String locale = 'de']) : super(locale);

  @override
  String get appName => 'bewerbi.tn';

  @override
  String get appSlogan => 'Deine Brücke nach Deutschland';

  @override
  String get commonLoading => 'Laden...';

  @override
  String get commonSave => 'Speichern';

  @override
  String get commonCancel => 'Abbrechen';

  @override
  String get commonDelete => 'Löschen';

  @override
  String get commonEdit => 'Bearbeiten';

  @override
  String get commonBack => 'Zurück';

  @override
  String get commonNext => 'Weiter';

  @override
  String get commonSearch => 'Suchen';

  @override
  String get commonFilter => 'Filtern';

  @override
  String get commonApply => 'Bewerben';

  @override
  String get commonSubmit => 'Absenden';

  @override
  String get commonClose => 'Schließen';

  @override
  String get commonYes => 'Ja';

  @override
  String get commonNo => 'Nein';

  @override
  String get commonError => 'Fehler';

  @override
  String get commonSuccess => 'Erfolg';

  @override
  String get commonRetry => 'Erneut versuchen';

  @override
  String get commonNoResults => 'Keine Ergebnisse';

  @override
  String get commonSeeAll => 'Alle anzeigen';

  @override
  String get commonRequired => 'Pflichtfeld';

  @override
  String get commonOptional => 'Optional';

  @override
  String get commonAdd => 'Hinzufügen';

  @override
  String get commonRemove => 'Entfernen';

  @override
  String get commonRestore => 'Wiederherstellen';

  @override
  String get commonShare => 'Teilen';

  @override
  String get commonSend => 'Senden';

  @override
  String get commonNow => 'Jetzt';

  @override
  String get commonEnabled => 'Aktiviert';

  @override
  String get commonDisabled => 'Deaktiviert';

  @override
  String get commonUnknown => 'Unbekannt';

  @override
  String get authLogin => 'Anmelden';

  @override
  String get authRegister => 'Registrieren';

  @override
  String get authLogout => 'Abmelden';

  @override
  String get authEmail => 'E-Mail-Adresse';

  @override
  String get authPassword => 'Passwort';

  @override
  String get authConfirmPassword => 'Passwort bestätigen';

  @override
  String get authForgotPassword => 'Passwort vergessen?';

  @override
  String get authResetPassword => 'Passwort zurücksetzen';

  @override
  String get authFirstName => 'Vorname';

  @override
  String get authLastName => 'Nachname';

  @override
  String get authIAmA => 'Ich bin ein...';

  @override
  String get authApplicant => 'Bewerber';

  @override
  String get authEmployer => 'Arbeitgeber';

  @override
  String get authNoAccount => 'Noch kein Konto?';

  @override
  String get authHasAccount => 'Bereits ein Konto?';

  @override
  String get authWelcome => 'Willkommen';

  @override
  String get authSubtitle => 'Deine Brücke nach Deutschland';

  @override
  String get authOrLoginWith => 'oder';

  @override
  String get authGoogleLogin => 'Mit Google anmelden';

  @override
  String get authFacebookLogin => 'Mit Facebook anmelden';

  @override
  String get authDemoMode => 'DEMO-MODUS';

  @override
  String get authAdmin => 'Admin';

  @override
  String get authPasswordMinLength => 'Mindestens 8 Zeichen';

  @override
  String get authPasswordsNoMatch => 'Die Passwörter stimmen nicht überein.';

  @override
  String get authResetSent => 'E-Mail gesendet!';

  @override
  String get authResetInstructions =>
      'Wir haben einen Link zum Zurücksetzen Ihres Passworts gesendet.';

  @override
  String get authResetSendLink => 'Link senden';

  @override
  String get authResetEmailPlaceholder => 'E-Mail-Adresse';

  @override
  String get authResetDescription =>
      'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.';

  @override
  String get authBackToLogin => 'Zurück zur Anmeldung';

  @override
  String get authCreateAccount => 'Erstellen Sie Ihr bewerbi.tn Konto';

  @override
  String get authRegisterSuccess =>
      'Registrierung erfolgreich! Bitte melden Sie sich an.';

  @override
  String get authFillAllFields => 'Bitte füllen Sie alle Felder aus.';

  @override
  String get authPasswordMinLengthError =>
      'Das Passwort muss mindestens 6 Zeichen lang sein.';

  @override
  String get authEnterEmail => 'Bitte geben Sie Ihre E-Mail-Adresse ein.';

  @override
  String get authGoogleDemoMode => 'Google Login (Demo-Modus)';

  @override
  String get authFacebookDemoMode => 'Facebook Login (Demo-Modus)';

  @override
  String homeGreeting(String name) {
    return 'Hallo, $name!';
  }

  @override
  String get homeGreetingMorning => 'Guten Morgen';

  @override
  String get homeGreetingAfternoon => 'Guten Tag';

  @override
  String get homeGreetingEvening => 'Guten Abend';

  @override
  String get homeApplications => 'Bewerbungen';

  @override
  String get homeFavorites => 'Favoriten';

  @override
  String get homeOpenPositions => 'Offene Stellen';

  @override
  String homeProfileComplete(int percent) {
    return 'Profil $percent% vollständig';
  }

  @override
  String get homeProfileCompleteness => 'Profil-Vollständigkeit';

  @override
  String get homeComplete => 'vollständig';

  @override
  String get homeCategories => 'Kategorien';

  @override
  String get homeRecommended => 'Empfohlen für dich';

  @override
  String get homeLatest => 'Neueste Angebote';

  @override
  String get homeMatch => 'Match';

  @override
  String get homeNoOffers => 'Keine Angebote verfügbar';

  @override
  String get homeUser => 'Benutzer';

  @override
  String get jobsTitle => 'Stellen';

  @override
  String get jobsSearch => 'Stellen suchen...';

  @override
  String jobsResults(int count) {
    return '$count Ergebnisse';
  }

  @override
  String get jobsClearAll => 'Alle löschen';

  @override
  String get jobsCategory => 'Kategorie';

  @override
  String get jobsType => 'Art';

  @override
  String get jobsLocation => 'Standort';

  @override
  String get jobsSalary => 'Gehalt';

  @override
  String get jobsGermanLevel => 'Deutsch-Niveau';

  @override
  String get jobsGermanLevelMin => 'DEUTSCHKENNTNISSE (MINDESTENS)';

  @override
  String get jobsMinSalary => 'MINDESTGEHALT';

  @override
  String get jobsRequirements => 'Anforderungen';

  @override
  String get jobsDescription => 'Beschreibung';

  @override
  String get jobsApplyNow => 'Jetzt bewerben';

  @override
  String get jobsApplied => 'Bereits beworben';

  @override
  String get jobsContactEmployer => 'Arbeitgeber kontaktieren';

  @override
  String get jobsShareCopied => 'Link kopiert! Jetzt teilen.';

  @override
  String get jobsIt => 'IT & Software';

  @override
  String get jobsItShort => 'IT';

  @override
  String get jobsPflege => 'Pflege & Gesundheit';

  @override
  String get jobsPflegeShort => 'Pflege';

  @override
  String get jobsTransport => 'Transport & Logistik';

  @override
  String get jobsTransportShort => 'Transport';

  @override
  String get jobsSonstige => 'Sonstige';

  @override
  String get jobsJob => 'Stelle';

  @override
  String get jobsAusbildung => 'Ausbildung';

  @override
  String get jobsStudium => 'Studium';

  @override
  String get jobsSprachkurs => 'Sprachkurs';

  @override
  String get jobsPostedBy => 'Veröffentlicht von';

  @override
  String get jobsToday => 'Heute';

  @override
  String get jobsYesterday => 'Gestern';

  @override
  String jobsDaysAgo(int days) {
    return 'vor $days Tagen';
  }

  @override
  String get jobsLoadMore => 'Mehr laden';

  @override
  String get jobsNotFound => 'Stelle nicht gefunden';

  @override
  String get jobsNoResults => 'Keine Ergebnisse gefunden';

  @override
  String get jobsNoResultsHint =>
      'Versuchen Sie andere Suchbegriffe oder Filter';

  @override
  String get jobsCategoryLabel => 'KATEGORIE';

  @override
  String get jobsTypeLabel => 'ART';

  @override
  String get jobsLocationLabel => 'STANDORT';

  @override
  String get jobsSalaryNegotiable => 'Gehalt nach Vereinbarung';

  @override
  String get jobsLocationPlaceholder => 'Berlin, München...';

  @override
  String get applyTitle => 'Bewerbung senden';

  @override
  String get applyCoverLetter => 'Anschreiben';

  @override
  String get applyCoverLetterHint =>
      'Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich...';

  @override
  String get applyUploadCv => 'Lebenslauf';

  @override
  String get applyUploadHint => 'PDF oder Word-Datei hochladen';

  @override
  String get applyCustomQuestions => 'Zusatzfragen vom Arbeitgeber';

  @override
  String applyQuestionCount(int count) {
    return 'Der Arbeitgeber hat $count Zusatzfrage';
  }

  @override
  String applyQuestionCountPlural(int count) {
    return 'Der Arbeitgeber hat $count Zusatzfragen';
  }

  @override
  String get applyYourAnswer => 'Ihre Antwort...';

  @override
  String get applySubmit => 'Bewerbung absenden';

  @override
  String get applySuccess => 'Bewerbung erfolgreich gesendet!';

  @override
  String get applyAlreadyApplied =>
      'Du hast dich bereits auf diese Stelle beworben.';

  @override
  String applyCvSelected(String name) {
    return 'CV \"$name\" ausgewählt (Demo)';
  }

  @override
  String get applicationsTitle => 'Meine Bewerbungen';

  @override
  String applicationsCount(int count) {
    return '$count Bewerbung';
  }

  @override
  String applicationsCountPlural(int count) {
    return '$count Bewerbungen';
  }

  @override
  String get applicationsPending => 'Ausstehend';

  @override
  String get applicationsReviewed => 'In Prüfung';

  @override
  String get applicationsAccepted => 'Angenommen';

  @override
  String get applicationsRejected => 'Abgelehnt';

  @override
  String applicationsAppliedOn(String date) {
    return 'Beworben am $date';
  }

  @override
  String get applicationsNoApplications => 'Noch keine Bewerbungen';

  @override
  String get applicationsEmptySubtitle =>
      'Entdecken Sie Stellenangebote und bewerben Sie sich!';

  @override
  String get applicationsUnknownJob => 'Unbekannte Stelle';

  @override
  String get favoritesTitle => 'Favoriten';

  @override
  String favoritesCount(int count) {
    return '$count Stellen gemerkt';
  }

  @override
  String get favoritesEmpty => 'Noch keine Favoriten';

  @override
  String get favoritesEmptySubtitle => 'Merke dir Stellen um sie hier zu sehen';

  @override
  String get profileTitle => 'Mein Profil';

  @override
  String get profileEdit => 'Profil bearbeiten';

  @override
  String get profileEducation => 'Bildung & Studium';

  @override
  String get profileExperience => 'Berufserfahrung';

  @override
  String get profileLanguages => 'Sprachkenntnisse';

  @override
  String get profileDocuments => 'Dokumente';

  @override
  String profileEntries(int count) {
    return '$count Einträge';
  }

  @override
  String get profileEntry => '1 Eintrag';

  @override
  String get profileBio => 'Über mich';

  @override
  String get profileSaveChanges => 'Änderungen speichern';

  @override
  String get profileDiscardChanges => 'Verwerfen';

  @override
  String get profileDiscardConfirm => 'Änderungen verwerfen?';

  @override
  String get profileDiscardMessage => 'Deine Änderungen gehen verloren.';

  @override
  String get profileSaved => 'Profil erfolgreich gespeichert';

  @override
  String get profilePhone => 'Telefonnummer';

  @override
  String get profileCity => 'Stadt';

  @override
  String get profileCountry => 'Land';

  @override
  String get profileUser => 'Benutzer';

  @override
  String get educationTitle => 'Bildung & Studium';

  @override
  String get educationAdd => 'Bildung hinzufügen';

  @override
  String get educationDegree => 'Abschluss';

  @override
  String get educationInstitution => 'Institution';

  @override
  String get educationFieldOfStudy => 'Fachrichtung';

  @override
  String get educationStartDate => 'Startdatum';

  @override
  String get educationEndDate => 'Enddatum';

  @override
  String get educationCurrent => 'Aktuell hier eingeschrieben';

  @override
  String get educationEmpty => 'Keine Bildungseinträge';

  @override
  String get educationEmptySubtitle => 'Füge deine Bildungsabschlüsse hinzu';

  @override
  String get experienceTitle => 'Berufserfahrung';

  @override
  String get experienceAdd => 'Erfahrung hinzufügen';

  @override
  String get experiencePosition => 'Position';

  @override
  String get experienceCompany => 'Unternehmen';

  @override
  String get experienceLocation => 'Standort';

  @override
  String get experienceDescription => 'Beschreibung';

  @override
  String get experienceCurrent => 'Aktuell hier beschäftigt';

  @override
  String get experienceEmpty => 'Keine Berufserfahrung';

  @override
  String get experienceEmptySubtitle => 'Füge deine Berufserfahrungen hinzu';

  @override
  String get languagesTitle => 'Sprachkenntnisse';

  @override
  String get languagesAdd => 'Sprache hinzufügen';

  @override
  String get languagesLanguage => 'Sprache';

  @override
  String get languagesLevel => 'Niveau';

  @override
  String get languagesEmpty => 'Keine Sprachkenntnisse';

  @override
  String get languagesEmptySubtitle => 'Füge deine Sprachkenntnisse hinzu';

  @override
  String get documentsTitle => 'Dokumente';

  @override
  String get documentsAdd => 'Dokument hinzufügen';

  @override
  String get documentsName => 'Dokumentname';

  @override
  String get documentsType => 'Dokumenttyp';

  @override
  String get documentsCv => 'CV';

  @override
  String get documentsDiploma => 'Diplom';

  @override
  String get documentsCertificate => 'Zertifikat';

  @override
  String get documentsTranscript => 'Zeugnis';

  @override
  String get documentsOther => 'Sonstiges';

  @override
  String get documentsDeleted => 'GELÖSCHT';

  @override
  String get documentsRestoreConfirm => 'Wiederherstellen';

  @override
  String get documentsPermanentDelete => 'Endgültig löschen';

  @override
  String get documentsPermanentDeleteConfirm => 'Endgültig löschen?';

  @override
  String get documentsPermanentDeleteMessage => 'wird unwiderruflich gelöscht.';

  @override
  String get documentsDeletedSection => 'Gelöschte Dokumente';

  @override
  String get documentsEmpty => 'Noch keine Dokumente';

  @override
  String get documentsEmptySubtitle =>
      'Tippe auf +, um ein Dokument hinzuzufügen';

  @override
  String get documentsAdded => 'Dokument hinzugefügt (Demo-Modus)';

  @override
  String get documentsNamePlaceholder => 'z.B. Lebenslauf_2024.pdf';

  @override
  String get chatTitle => 'Nachrichten';

  @override
  String get chatEmpty => 'Keine Nachrichten';

  @override
  String get chatEmptySubtitle =>
      'Ihre Unterhaltungen werden hier angezeigt, sobald Sie mit Arbeitgebern kommunizieren.';

  @override
  String get chatInputHint => 'Nachricht schreiben...';

  @override
  String get chatSend => 'Senden';

  @override
  String chatMinutesAgo(int count) {
    return 'vor $count Min';
  }

  @override
  String chatHoursAgo(int count) {
    return 'vor $count Std';
  }

  @override
  String get chatYesterday => 'Gestern';

  @override
  String chatDaysAgo(int count) {
    return 'vor $count Tagen';
  }

  @override
  String get chatNoMessages =>
      'Noch keine Nachrichten.\nSchreiben Sie die erste Nachricht!';

  @override
  String get chatNewInfo =>
      'Neue Nachrichten entstehen automatisch bei Bewerbungen';

  @override
  String get notificationsTitle => 'Benachrichtigungen';

  @override
  String get notificationsActiveAlerts => 'Aktive Job-Alerts';

  @override
  String get notificationsNoAlerts => 'Keine Alerts vorhanden.';

  @override
  String get notificationsCreateAlert => 'Neuen Alert erstellen';

  @override
  String get notificationsSearchQuery =>
      'Suchbegriff (z.B. Softwareentwickler)';

  @override
  String get notificationsCategoryOptional => 'Kategorie (optional)';

  @override
  String get notificationsLocationOptional => 'Standort (optional)';

  @override
  String get notificationsCreateButton => 'Alert erstellen';

  @override
  String notificationsAlertCreated(String query) {
    return 'Alert erstellt: \"$query\"';
  }

  @override
  String get notificationsRecentTitle => 'Letzte Benachrichtigungen';

  @override
  String get notificationsViewEmail => 'E-Mail ansehen';

  @override
  String get notificationsEmailPreview => 'E-Mail Vorschau';

  @override
  String get notificationsNewOffers => 'Neue Stellenangebote für dich!';

  @override
  String get notificationsManage => 'Benachrichtigungen verwalten';

  @override
  String get notificationsViewDetails => 'Details ansehen';

  @override
  String get settingsTitle => 'Einstellungen';

  @override
  String get settingsLanguage => 'Sprache';

  @override
  String get settingsDarkMode => 'Dunkelmodus';

  @override
  String get settingsNotifications => 'Benachrichtigungen';

  @override
  String get settingsAccount => 'Konto verwalten';

  @override
  String get settingsSupport => 'Hilfe & Support';

  @override
  String get settingsPrivacy => 'Datenschutz';

  @override
  String get settingsTerms => 'Nutzungsbedingungen';

  @override
  String get settingsAbout => 'Über bewerbi.tn';

  @override
  String get settingsVersion => 'v1.0.0';

  @override
  String get settingsAccountSection => 'KONTO';

  @override
  String get settingsAppSection => 'APP';

  @override
  String get settingsLegalSection => 'RECHTLICHES';

  @override
  String get settingsFooter => 'bewerbi.tn v1.0.0 | Made with love in Tunisia';

  @override
  String get accountTitle => 'Konto verwalten';

  @override
  String get accountChangeEmail => 'E-Mail ändern';

  @override
  String get accountCurrentEmail => 'Aktuelle E-Mail';

  @override
  String get accountNewEmail => 'Neue E-Mail';

  @override
  String get accountNewEmailPlaceholder => 'neue.email@beispiel.de';

  @override
  String get accountChange => 'Ändern';

  @override
  String get accountChangePassword => 'Passwort ändern';

  @override
  String get accountCurrentPassword => 'Aktuelles Passwort';

  @override
  String get accountNewPassword => 'Neues Passwort';

  @override
  String get accountConfirmNewPassword => 'Passwort bestätigen';

  @override
  String get accountNewPasswordPlaceholder => 'Mindestens 8 Zeichen';

  @override
  String get accountConfirmPasswordPlaceholder => 'Passwort wiederholen';

  @override
  String get accountEmailVerification => 'E-Mail-Verifizierung';

  @override
  String get accountVerified => 'Verifiziert';

  @override
  String get accountNotVerified => 'Nicht verifiziert';

  @override
  String get accountSendVerification => 'Bestätigungsmail senden';

  @override
  String get accountDataExport => 'Datenexport';

  @override
  String get accountDataExportDescription =>
      'Lade eine Kopie aller deiner gespeicherten Daten herunter.';

  @override
  String get accountExportButton => 'Meine Daten herunterladen';

  @override
  String get accountDeleteAccount => 'Konto löschen';

  @override
  String get accountDeleteWarning =>
      'Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht.';

  @override
  String get accountDeleteButton => 'Konto endgültig löschen';

  @override
  String get accountDeleteConfirm => 'Bist du sicher?';

  @override
  String get accountDeleteInstruction =>
      'Gib \"LÖSCHEN\" ein, um zu bestätigen:';

  @override
  String get accountDeletePlaceholder => 'LÖSCHEN';

  @override
  String get accountDeleteIrreversible =>
      'Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden unwiderruflich gelöscht.';

  @override
  String get accountDeleted => 'Konto wurde gelöscht';

  @override
  String accountEmailConfirmSent(String email) {
    return 'Bestätigungsmail an $email gesendet (Demo)';
  }

  @override
  String get accountPasswordChanged => 'Passwort erfolgreich geändert';

  @override
  String get accountVerificationSent => 'Bestätigungsmail gesendet (Demo)';

  @override
  String get accountExportPreparing => 'Datenexport wird vorbereitet... (Demo)';

  @override
  String get accountInvalidEmail => 'Bitte gib eine gültige E-Mail-Adresse ein';

  @override
  String get accountEnterCurrentPassword =>
      'Bitte gib dein aktuelles Passwort ein';

  @override
  String get accountPasswordTooShort =>
      'Das Passwort muss mindestens 8 Zeichen lang sein';

  @override
  String get accountPasswordsMismatch => 'Die Passwörter stimmen nicht überein';

  @override
  String get employerDashboard => 'Dashboard';

  @override
  String get employerActiveJobs => 'Aktive Stellen';

  @override
  String get employerTotalApplications => 'Bewerbungen';

  @override
  String get employerNewThisWeek => 'Neue diese Woche';

  @override
  String get employerRecentApplications => 'Letzte Bewerbungen';

  @override
  String get employerCreateListing => 'Neue Stelle erstellen';

  @override
  String get employerMyListings => 'Meine Stellenanzeigen';

  @override
  String get employerEditListing => 'Stelle bearbeiten';

  @override
  String get employerPublish => 'Veröffentlichen';

  @override
  String get employerSaveChanges => 'Speichern';

  @override
  String get employerCloseListing => 'Stelle schließen';

  @override
  String get employerActivateListing => 'Stelle aktivieren';

  @override
  String get employerApplicants => 'Bewerbungen';

  @override
  String get employerAccept => 'Annehmen';

  @override
  String get employerReject => 'Ablehnen';

  @override
  String get employerTopCandidate => 'Top-Kandidat';

  @override
  String get employerGoodMatch => 'Guter Match';

  @override
  String get employerSuitable => 'Passend';

  @override
  String get employerReview => 'Prüfen';

  @override
  String get employerCandidateScoring => 'Kandidaten nach Match-Score sortiert';

  @override
  String get employerCompanyProfile => 'Firmenprofil';

  @override
  String get employerNoApplications => 'Noch keine Bewerbungen';

  @override
  String get employerNoListings => 'Keine Stellenanzeigen';

  @override
  String get employerNoListingsSubtitle =>
      'Erstellen Sie Ihre erste Stellenanzeige.';

  @override
  String get employerListingPublished => 'Stelle erfolgreich veröffentlicht!';

  @override
  String get employerFillRequired => 'Bitte füllen Sie alle Pflichtfelder aus.';

  @override
  String get employerListingTitle => 'Titel';

  @override
  String get employerListingTitlePlaceholder =>
      'z.B. Full-Stack Entwickler (m/w/d)';

  @override
  String get employerListingCategory => 'Kategorie';

  @override
  String get employerListingType => 'Typ';

  @override
  String get employerListingLocation => 'Standort';

  @override
  String get employerListingLocationPlaceholder => 'z.B. Berlin, München';

  @override
  String get employerListingSalary => 'Gehaltsspanne (optional)';

  @override
  String get employerListingSalaryPlaceholder => 'z.B. 45.000 - 60.000 €';

  @override
  String get employerListingGermanLevel => 'Deutschkenntnisse';

  @override
  String get employerListingDescription => 'Beschreibung';

  @override
  String get employerListingDescriptionPlaceholder =>
      'Beschreiben Sie die Stelle...';

  @override
  String get employerListingRequirements => 'Anforderungen';

  @override
  String get employerListingRequirementsPlaceholder =>
      'Welche Anforderungen müssen erfüllt werden?';

  @override
  String get adminUsers => 'Benutzerverwaltung';

  @override
  String get adminListings => 'Stellenverwaltung';

  @override
  String get adminReports => 'Statistiken';

  @override
  String get adminAll => 'Alle';

  @override
  String get adminApplicants => 'Bewerber';

  @override
  String get adminEmployers => 'Arbeitgeber';

  @override
  String get adminAdmins => 'Admins';

  @override
  String get adminActive => 'Aktiv';

  @override
  String get adminClosed => 'Geschlossen';

  @override
  String get adminTotalUsers => 'Gesamt-Benutzer';

  @override
  String get adminActiveJobs => 'Aktive Stellen';

  @override
  String get adminTotalApplications => 'Bewerbungen';

  @override
  String get adminAcceptedApps => 'Angenommen';

  @override
  String get adminRejectedApps => 'Abgelehnt';

  @override
  String get adminReviewedApps => 'In Prüfung';

  @override
  String get onboardingSkip => 'Überspringen';

  @override
  String get onboardingNext => 'Weiter';

  @override
  String get onboardingGetStarted => 'Los geht\'s';

  @override
  String get onboardingTitle1 => 'Deine Brücke nach Deutschland';

  @override
  String get onboardingSubtitle1 =>
      'Finde Jobs, Ausbildungen und Sprachkurse in Deutschland – speziell für tunesische Fachkräfte.';

  @override
  String get onboardingTitle2 => 'Erstelle dein Profil';

  @override
  String get onboardingSubtitle2 =>
      'Lebenslauf hochladen, Erfahrungen eintragen und von Arbeitgebern gefunden werden.';

  @override
  String get onboardingTitle3 => 'Bewirb dich mit einem Klick';

  @override
  String get onboardingSubtitle3 =>
      'Sende deine Bewerbung direkt an deutsche Arbeitgeber und verfolge den Status in Echtzeit.';

  @override
  String get legalPrivacy => 'Datenschutzerklärung';

  @override
  String get legalTerms => 'Nutzungsbedingungen';

  @override
  String get legalImpressum => 'Impressum';

  @override
  String get legalSupport => 'Hilfe & Support';

  @override
  String get legalFaq => 'Häufig gestellte Fragen';

  @override
  String get legalContact => 'Kontakt';

  @override
  String get legalFeedback => 'Feedback senden';

  @override
  String get legalFeedbackHint =>
      'Dein Feedback hilft uns, die App zu verbessern...';

  @override
  String get legalFeedbackSent => 'Danke für dein Feedback!';

  @override
  String get errorGeneral => 'Etwas ist schiefgelaufen';

  @override
  String get errorNetwork =>
      'Bitte überprüfe deine Internetverbindung und versuche es erneut.';

  @override
  String get errorRetry => 'Erneut versuchen';

  @override
  String get navHome => 'Home';

  @override
  String get navSearch => 'Suche';

  @override
  String get navApplications => 'Bewerbungen';

  @override
  String get navFavorites => 'Favoriten';

  @override
  String get navProfile => 'Profil';

  @override
  String get navSettings => 'Einstellungen';

  @override
  String get navMessages => 'Nachrichten';
}
