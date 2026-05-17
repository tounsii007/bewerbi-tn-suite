import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_de.dart';
import 'app_localizations_fr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('de'),
    Locale('fr'),
  ];

  /// No description provided for @appName.
  ///
  /// In de, this message translates to:
  /// **'bewerbi.tn'**
  String get appName;

  /// No description provided for @appSlogan.
  ///
  /// In de, this message translates to:
  /// **'Deine Brücke nach Deutschland'**
  String get appSlogan;

  /// No description provided for @commonLoading.
  ///
  /// In de, this message translates to:
  /// **'Laden...'**
  String get commonLoading;

  /// No description provided for @commonSave.
  ///
  /// In de, this message translates to:
  /// **'Speichern'**
  String get commonSave;

  /// No description provided for @commonCancel.
  ///
  /// In de, this message translates to:
  /// **'Abbrechen'**
  String get commonCancel;

  /// No description provided for @commonDelete.
  ///
  /// In de, this message translates to:
  /// **'Löschen'**
  String get commonDelete;

  /// No description provided for @commonEdit.
  ///
  /// In de, this message translates to:
  /// **'Bearbeiten'**
  String get commonEdit;

  /// No description provided for @commonBack.
  ///
  /// In de, this message translates to:
  /// **'Zurück'**
  String get commonBack;

  /// No description provided for @commonNext.
  ///
  /// In de, this message translates to:
  /// **'Weiter'**
  String get commonNext;

  /// No description provided for @commonSearch.
  ///
  /// In de, this message translates to:
  /// **'Suchen'**
  String get commonSearch;

  /// No description provided for @commonFilter.
  ///
  /// In de, this message translates to:
  /// **'Filtern'**
  String get commonFilter;

  /// No description provided for @commonApply.
  ///
  /// In de, this message translates to:
  /// **'Bewerben'**
  String get commonApply;

  /// No description provided for @commonSubmit.
  ///
  /// In de, this message translates to:
  /// **'Absenden'**
  String get commonSubmit;

  /// No description provided for @commonClose.
  ///
  /// In de, this message translates to:
  /// **'Schließen'**
  String get commonClose;

  /// No description provided for @commonYes.
  ///
  /// In de, this message translates to:
  /// **'Ja'**
  String get commonYes;

  /// No description provided for @commonNo.
  ///
  /// In de, this message translates to:
  /// **'Nein'**
  String get commonNo;

  /// No description provided for @commonError.
  ///
  /// In de, this message translates to:
  /// **'Fehler'**
  String get commonError;

  /// No description provided for @commonSuccess.
  ///
  /// In de, this message translates to:
  /// **'Erfolg'**
  String get commonSuccess;

  /// No description provided for @commonRetry.
  ///
  /// In de, this message translates to:
  /// **'Erneut versuchen'**
  String get commonRetry;

  /// No description provided for @commonNoResults.
  ///
  /// In de, this message translates to:
  /// **'Keine Ergebnisse'**
  String get commonNoResults;

  /// No description provided for @commonSeeAll.
  ///
  /// In de, this message translates to:
  /// **'Alle anzeigen'**
  String get commonSeeAll;

  /// No description provided for @commonRequired.
  ///
  /// In de, this message translates to:
  /// **'Pflichtfeld'**
  String get commonRequired;

  /// No description provided for @commonOptional.
  ///
  /// In de, this message translates to:
  /// **'Optional'**
  String get commonOptional;

  /// No description provided for @commonAdd.
  ///
  /// In de, this message translates to:
  /// **'Hinzufügen'**
  String get commonAdd;

  /// No description provided for @commonRemove.
  ///
  /// In de, this message translates to:
  /// **'Entfernen'**
  String get commonRemove;

  /// No description provided for @commonRestore.
  ///
  /// In de, this message translates to:
  /// **'Wiederherstellen'**
  String get commonRestore;

  /// No description provided for @commonShare.
  ///
  /// In de, this message translates to:
  /// **'Teilen'**
  String get commonShare;

  /// No description provided for @commonSend.
  ///
  /// In de, this message translates to:
  /// **'Senden'**
  String get commonSend;

  /// No description provided for @commonNow.
  ///
  /// In de, this message translates to:
  /// **'Jetzt'**
  String get commonNow;

  /// No description provided for @commonEnabled.
  ///
  /// In de, this message translates to:
  /// **'Aktiviert'**
  String get commonEnabled;

  /// No description provided for @commonDisabled.
  ///
  /// In de, this message translates to:
  /// **'Deaktiviert'**
  String get commonDisabled;

  /// No description provided for @commonUnknown.
  ///
  /// In de, this message translates to:
  /// **'Unbekannt'**
  String get commonUnknown;

  /// No description provided for @authLogin.
  ///
  /// In de, this message translates to:
  /// **'Anmelden'**
  String get authLogin;

  /// No description provided for @authRegister.
  ///
  /// In de, this message translates to:
  /// **'Registrieren'**
  String get authRegister;

  /// No description provided for @authLogout.
  ///
  /// In de, this message translates to:
  /// **'Abmelden'**
  String get authLogout;

  /// No description provided for @authEmail.
  ///
  /// In de, this message translates to:
  /// **'E-Mail-Adresse'**
  String get authEmail;

  /// No description provided for @authPassword.
  ///
  /// In de, this message translates to:
  /// **'Passwort'**
  String get authPassword;

  /// No description provided for @authConfirmPassword.
  ///
  /// In de, this message translates to:
  /// **'Passwort bestätigen'**
  String get authConfirmPassword;

  /// No description provided for @authForgotPassword.
  ///
  /// In de, this message translates to:
  /// **'Passwort vergessen?'**
  String get authForgotPassword;

  /// No description provided for @authResetPassword.
  ///
  /// In de, this message translates to:
  /// **'Passwort zurücksetzen'**
  String get authResetPassword;

  /// No description provided for @authFirstName.
  ///
  /// In de, this message translates to:
  /// **'Vorname'**
  String get authFirstName;

  /// No description provided for @authLastName.
  ///
  /// In de, this message translates to:
  /// **'Nachname'**
  String get authLastName;

  /// No description provided for @authIAmA.
  ///
  /// In de, this message translates to:
  /// **'Ich bin ein...'**
  String get authIAmA;

  /// No description provided for @authApplicant.
  ///
  /// In de, this message translates to:
  /// **'Bewerber'**
  String get authApplicant;

  /// No description provided for @authEmployer.
  ///
  /// In de, this message translates to:
  /// **'Arbeitgeber'**
  String get authEmployer;

  /// No description provided for @authNoAccount.
  ///
  /// In de, this message translates to:
  /// **'Noch kein Konto?'**
  String get authNoAccount;

  /// No description provided for @authHasAccount.
  ///
  /// In de, this message translates to:
  /// **'Bereits ein Konto?'**
  String get authHasAccount;

  /// No description provided for @authWelcome.
  ///
  /// In de, this message translates to:
  /// **'Willkommen'**
  String get authWelcome;

  /// No description provided for @authSubtitle.
  ///
  /// In de, this message translates to:
  /// **'Deine Brücke nach Deutschland'**
  String get authSubtitle;

  /// No description provided for @authOrLoginWith.
  ///
  /// In de, this message translates to:
  /// **'oder'**
  String get authOrLoginWith;

  /// No description provided for @authGoogleLogin.
  ///
  /// In de, this message translates to:
  /// **'Mit Google anmelden'**
  String get authGoogleLogin;

  /// No description provided for @authFacebookLogin.
  ///
  /// In de, this message translates to:
  /// **'Mit Facebook anmelden'**
  String get authFacebookLogin;

  /// No description provided for @authDemoMode.
  ///
  /// In de, this message translates to:
  /// **'DEMO-MODUS'**
  String get authDemoMode;

  /// No description provided for @authAdmin.
  ///
  /// In de, this message translates to:
  /// **'Admin'**
  String get authAdmin;

  /// No description provided for @authPasswordMinLength.
  ///
  /// In de, this message translates to:
  /// **'Mindestens 8 Zeichen'**
  String get authPasswordMinLength;

  /// No description provided for @authPasswordsNoMatch.
  ///
  /// In de, this message translates to:
  /// **'Die Passwörter stimmen nicht überein.'**
  String get authPasswordsNoMatch;

  /// No description provided for @authResetSent.
  ///
  /// In de, this message translates to:
  /// **'E-Mail gesendet!'**
  String get authResetSent;

  /// No description provided for @authResetInstructions.
  ///
  /// In de, this message translates to:
  /// **'Wir haben einen Link zum Zurücksetzen Ihres Passworts gesendet.'**
  String get authResetInstructions;

  /// No description provided for @authResetSendLink.
  ///
  /// In de, this message translates to:
  /// **'Link senden'**
  String get authResetSendLink;

  /// No description provided for @authResetEmailPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'E-Mail-Adresse'**
  String get authResetEmailPlaceholder;

  /// No description provided for @authResetDescription.
  ///
  /// In de, this message translates to:
  /// **'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.'**
  String get authResetDescription;

  /// No description provided for @authBackToLogin.
  ///
  /// In de, this message translates to:
  /// **'Zurück zur Anmeldung'**
  String get authBackToLogin;

  /// No description provided for @authCreateAccount.
  ///
  /// In de, this message translates to:
  /// **'Erstellen Sie Ihr bewerbi.tn Konto'**
  String get authCreateAccount;

  /// No description provided for @authRegisterSuccess.
  ///
  /// In de, this message translates to:
  /// **'Registrierung erfolgreich! Bitte melden Sie sich an.'**
  String get authRegisterSuccess;

  /// No description provided for @authFillAllFields.
  ///
  /// In de, this message translates to:
  /// **'Bitte füllen Sie alle Felder aus.'**
  String get authFillAllFields;

  /// No description provided for @authPasswordMinLengthError.
  ///
  /// In de, this message translates to:
  /// **'Das Passwort muss mindestens 6 Zeichen lang sein.'**
  String get authPasswordMinLengthError;

  /// No description provided for @authEnterEmail.
  ///
  /// In de, this message translates to:
  /// **'Bitte geben Sie Ihre E-Mail-Adresse ein.'**
  String get authEnterEmail;

  /// No description provided for @authGoogleDemoMode.
  ///
  /// In de, this message translates to:
  /// **'Google Login (Demo-Modus)'**
  String get authGoogleDemoMode;

  /// No description provided for @authFacebookDemoMode.
  ///
  /// In de, this message translates to:
  /// **'Facebook Login (Demo-Modus)'**
  String get authFacebookDemoMode;

  /// No description provided for @homeGreeting.
  ///
  /// In de, this message translates to:
  /// **'Hallo, {name}!'**
  String homeGreeting(String name);

  /// No description provided for @homeGreetingMorning.
  ///
  /// In de, this message translates to:
  /// **'Guten Morgen'**
  String get homeGreetingMorning;

  /// No description provided for @homeGreetingAfternoon.
  ///
  /// In de, this message translates to:
  /// **'Guten Tag'**
  String get homeGreetingAfternoon;

  /// No description provided for @homeGreetingEvening.
  ///
  /// In de, this message translates to:
  /// **'Guten Abend'**
  String get homeGreetingEvening;

  /// No description provided for @homeApplications.
  ///
  /// In de, this message translates to:
  /// **'Bewerbungen'**
  String get homeApplications;

  /// No description provided for @homeFavorites.
  ///
  /// In de, this message translates to:
  /// **'Favoriten'**
  String get homeFavorites;

  /// No description provided for @homeOpenPositions.
  ///
  /// In de, this message translates to:
  /// **'Offene Stellen'**
  String get homeOpenPositions;

  /// No description provided for @homeProfileComplete.
  ///
  /// In de, this message translates to:
  /// **'Profil {percent}% vollständig'**
  String homeProfileComplete(int percent);

  /// No description provided for @homeProfileCompleteness.
  ///
  /// In de, this message translates to:
  /// **'Profil-Vollständigkeit'**
  String get homeProfileCompleteness;

  /// No description provided for @homeComplete.
  ///
  /// In de, this message translates to:
  /// **'vollständig'**
  String get homeComplete;

  /// No description provided for @homeCategories.
  ///
  /// In de, this message translates to:
  /// **'Kategorien'**
  String get homeCategories;

  /// No description provided for @homeRecommended.
  ///
  /// In de, this message translates to:
  /// **'Empfohlen für dich'**
  String get homeRecommended;

  /// No description provided for @homeLatest.
  ///
  /// In de, this message translates to:
  /// **'Neueste Angebote'**
  String get homeLatest;

  /// No description provided for @homeMatch.
  ///
  /// In de, this message translates to:
  /// **'Match'**
  String get homeMatch;

  /// No description provided for @homeNoOffers.
  ///
  /// In de, this message translates to:
  /// **'Keine Angebote verfügbar'**
  String get homeNoOffers;

  /// No description provided for @homeUser.
  ///
  /// In de, this message translates to:
  /// **'Benutzer'**
  String get homeUser;

  /// No description provided for @jobsTitle.
  ///
  /// In de, this message translates to:
  /// **'Stellen'**
  String get jobsTitle;

  /// No description provided for @jobsSearch.
  ///
  /// In de, this message translates to:
  /// **'Stellen suchen...'**
  String get jobsSearch;

  /// No description provided for @jobsResults.
  ///
  /// In de, this message translates to:
  /// **'{count} Ergebnisse'**
  String jobsResults(int count);

  /// No description provided for @jobsClearAll.
  ///
  /// In de, this message translates to:
  /// **'Alle löschen'**
  String get jobsClearAll;

  /// No description provided for @jobsCategory.
  ///
  /// In de, this message translates to:
  /// **'Kategorie'**
  String get jobsCategory;

  /// No description provided for @jobsType.
  ///
  /// In de, this message translates to:
  /// **'Art'**
  String get jobsType;

  /// No description provided for @jobsLocation.
  ///
  /// In de, this message translates to:
  /// **'Standort'**
  String get jobsLocation;

  /// No description provided for @jobsSalary.
  ///
  /// In de, this message translates to:
  /// **'Gehalt'**
  String get jobsSalary;

  /// No description provided for @jobsGermanLevel.
  ///
  /// In de, this message translates to:
  /// **'Deutsch-Niveau'**
  String get jobsGermanLevel;

  /// No description provided for @jobsGermanLevelMin.
  ///
  /// In de, this message translates to:
  /// **'DEUTSCHKENNTNISSE (MINDESTENS)'**
  String get jobsGermanLevelMin;

  /// No description provided for @jobsMinSalary.
  ///
  /// In de, this message translates to:
  /// **'MINDESTGEHALT'**
  String get jobsMinSalary;

  /// No description provided for @jobsRequirements.
  ///
  /// In de, this message translates to:
  /// **'Anforderungen'**
  String get jobsRequirements;

  /// No description provided for @jobsDescription.
  ///
  /// In de, this message translates to:
  /// **'Beschreibung'**
  String get jobsDescription;

  /// No description provided for @jobsApplyNow.
  ///
  /// In de, this message translates to:
  /// **'Jetzt bewerben'**
  String get jobsApplyNow;

  /// No description provided for @jobsApplied.
  ///
  /// In de, this message translates to:
  /// **'Bereits beworben'**
  String get jobsApplied;

  /// No description provided for @jobsContactEmployer.
  ///
  /// In de, this message translates to:
  /// **'Arbeitgeber kontaktieren'**
  String get jobsContactEmployer;

  /// No description provided for @jobsShareCopied.
  ///
  /// In de, this message translates to:
  /// **'Link kopiert! Jetzt teilen.'**
  String get jobsShareCopied;

  /// No description provided for @jobsIt.
  ///
  /// In de, this message translates to:
  /// **'IT & Software'**
  String get jobsIt;

  /// No description provided for @jobsItShort.
  ///
  /// In de, this message translates to:
  /// **'IT'**
  String get jobsItShort;

  /// No description provided for @jobsPflege.
  ///
  /// In de, this message translates to:
  /// **'Pflege & Gesundheit'**
  String get jobsPflege;

  /// No description provided for @jobsPflegeShort.
  ///
  /// In de, this message translates to:
  /// **'Pflege'**
  String get jobsPflegeShort;

  /// No description provided for @jobsTransport.
  ///
  /// In de, this message translates to:
  /// **'Transport & Logistik'**
  String get jobsTransport;

  /// No description provided for @jobsTransportShort.
  ///
  /// In de, this message translates to:
  /// **'Transport'**
  String get jobsTransportShort;

  /// No description provided for @jobsSonstige.
  ///
  /// In de, this message translates to:
  /// **'Sonstige'**
  String get jobsSonstige;

  /// No description provided for @jobsJob.
  ///
  /// In de, this message translates to:
  /// **'Stelle'**
  String get jobsJob;

  /// No description provided for @jobsAusbildung.
  ///
  /// In de, this message translates to:
  /// **'Ausbildung'**
  String get jobsAusbildung;

  /// No description provided for @jobsStudium.
  ///
  /// In de, this message translates to:
  /// **'Studium'**
  String get jobsStudium;

  /// No description provided for @jobsSprachkurs.
  ///
  /// In de, this message translates to:
  /// **'Sprachkurs'**
  String get jobsSprachkurs;

  /// No description provided for @jobsPostedBy.
  ///
  /// In de, this message translates to:
  /// **'Veröffentlicht von'**
  String get jobsPostedBy;

  /// No description provided for @jobsToday.
  ///
  /// In de, this message translates to:
  /// **'Heute'**
  String get jobsToday;

  /// No description provided for @jobsYesterday.
  ///
  /// In de, this message translates to:
  /// **'Gestern'**
  String get jobsYesterday;

  /// No description provided for @jobsDaysAgo.
  ///
  /// In de, this message translates to:
  /// **'vor {days} Tagen'**
  String jobsDaysAgo(int days);

  /// No description provided for @jobsLoadMore.
  ///
  /// In de, this message translates to:
  /// **'Mehr laden'**
  String get jobsLoadMore;

  /// No description provided for @jobsNotFound.
  ///
  /// In de, this message translates to:
  /// **'Stelle nicht gefunden'**
  String get jobsNotFound;

  /// No description provided for @jobsNoResults.
  ///
  /// In de, this message translates to:
  /// **'Keine Ergebnisse gefunden'**
  String get jobsNoResults;

  /// No description provided for @jobsNoResultsHint.
  ///
  /// In de, this message translates to:
  /// **'Versuchen Sie andere Suchbegriffe oder Filter'**
  String get jobsNoResultsHint;

  /// No description provided for @jobsCategoryLabel.
  ///
  /// In de, this message translates to:
  /// **'KATEGORIE'**
  String get jobsCategoryLabel;

  /// No description provided for @jobsTypeLabel.
  ///
  /// In de, this message translates to:
  /// **'ART'**
  String get jobsTypeLabel;

  /// No description provided for @jobsLocationLabel.
  ///
  /// In de, this message translates to:
  /// **'STANDORT'**
  String get jobsLocationLabel;

  /// No description provided for @jobsSalaryNegotiable.
  ///
  /// In de, this message translates to:
  /// **'Gehalt nach Vereinbarung'**
  String get jobsSalaryNegotiable;

  /// No description provided for @jobsLocationPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'Berlin, München...'**
  String get jobsLocationPlaceholder;

  /// No description provided for @applyTitle.
  ///
  /// In de, this message translates to:
  /// **'Bewerbung senden'**
  String get applyTitle;

  /// No description provided for @applyCoverLetter.
  ///
  /// In de, this message translates to:
  /// **'Anschreiben'**
  String get applyCoverLetter;

  /// No description provided for @applyCoverLetterHint.
  ///
  /// In de, this message translates to:
  /// **'Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich...'**
  String get applyCoverLetterHint;

  /// No description provided for @applyUploadCv.
  ///
  /// In de, this message translates to:
  /// **'Lebenslauf'**
  String get applyUploadCv;

  /// No description provided for @applyUploadHint.
  ///
  /// In de, this message translates to:
  /// **'PDF oder Word-Datei hochladen'**
  String get applyUploadHint;

  /// No description provided for @applyCustomQuestions.
  ///
  /// In de, this message translates to:
  /// **'Zusatzfragen vom Arbeitgeber'**
  String get applyCustomQuestions;

  /// No description provided for @applyQuestionCount.
  ///
  /// In de, this message translates to:
  /// **'Der Arbeitgeber hat {count} Zusatzfrage'**
  String applyQuestionCount(int count);

  /// No description provided for @applyQuestionCountPlural.
  ///
  /// In de, this message translates to:
  /// **'Der Arbeitgeber hat {count} Zusatzfragen'**
  String applyQuestionCountPlural(int count);

  /// No description provided for @applyYourAnswer.
  ///
  /// In de, this message translates to:
  /// **'Ihre Antwort...'**
  String get applyYourAnswer;

  /// No description provided for @applySubmit.
  ///
  /// In de, this message translates to:
  /// **'Bewerbung absenden'**
  String get applySubmit;

  /// No description provided for @applySuccess.
  ///
  /// In de, this message translates to:
  /// **'Bewerbung erfolgreich gesendet!'**
  String get applySuccess;

  /// No description provided for @applyAlreadyApplied.
  ///
  /// In de, this message translates to:
  /// **'Du hast dich bereits auf diese Stelle beworben.'**
  String get applyAlreadyApplied;

  /// No description provided for @applyCvSelected.
  ///
  /// In de, this message translates to:
  /// **'CV \"{name}\" ausgewählt (Demo)'**
  String applyCvSelected(String name);

  /// No description provided for @applicationsTitle.
  ///
  /// In de, this message translates to:
  /// **'Meine Bewerbungen'**
  String get applicationsTitle;

  /// No description provided for @applicationsCount.
  ///
  /// In de, this message translates to:
  /// **'{count} Bewerbung'**
  String applicationsCount(int count);

  /// No description provided for @applicationsCountPlural.
  ///
  /// In de, this message translates to:
  /// **'{count} Bewerbungen'**
  String applicationsCountPlural(int count);

  /// No description provided for @applicationsPending.
  ///
  /// In de, this message translates to:
  /// **'Ausstehend'**
  String get applicationsPending;

  /// No description provided for @applicationsReviewed.
  ///
  /// In de, this message translates to:
  /// **'In Prüfung'**
  String get applicationsReviewed;

  /// No description provided for @applicationsAccepted.
  ///
  /// In de, this message translates to:
  /// **'Angenommen'**
  String get applicationsAccepted;

  /// No description provided for @applicationsRejected.
  ///
  /// In de, this message translates to:
  /// **'Abgelehnt'**
  String get applicationsRejected;

  /// No description provided for @applicationsAppliedOn.
  ///
  /// In de, this message translates to:
  /// **'Beworben am {date}'**
  String applicationsAppliedOn(String date);

  /// No description provided for @applicationsNoApplications.
  ///
  /// In de, this message translates to:
  /// **'Noch keine Bewerbungen'**
  String get applicationsNoApplications;

  /// No description provided for @applicationsEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Entdecken Sie Stellenangebote und bewerben Sie sich!'**
  String get applicationsEmptySubtitle;

  /// No description provided for @applicationsUnknownJob.
  ///
  /// In de, this message translates to:
  /// **'Unbekannte Stelle'**
  String get applicationsUnknownJob;

  /// No description provided for @favoritesTitle.
  ///
  /// In de, this message translates to:
  /// **'Favoriten'**
  String get favoritesTitle;

  /// No description provided for @favoritesCount.
  ///
  /// In de, this message translates to:
  /// **'{count} Stellen gemerkt'**
  String favoritesCount(int count);

  /// No description provided for @favoritesEmpty.
  ///
  /// In de, this message translates to:
  /// **'Noch keine Favoriten'**
  String get favoritesEmpty;

  /// No description provided for @favoritesEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Merke dir Stellen um sie hier zu sehen'**
  String get favoritesEmptySubtitle;

  /// No description provided for @profileTitle.
  ///
  /// In de, this message translates to:
  /// **'Mein Profil'**
  String get profileTitle;

  /// No description provided for @profileEdit.
  ///
  /// In de, this message translates to:
  /// **'Profil bearbeiten'**
  String get profileEdit;

  /// No description provided for @profileEducation.
  ///
  /// In de, this message translates to:
  /// **'Bildung & Studium'**
  String get profileEducation;

  /// No description provided for @profileExperience.
  ///
  /// In de, this message translates to:
  /// **'Berufserfahrung'**
  String get profileExperience;

  /// No description provided for @profileLanguages.
  ///
  /// In de, this message translates to:
  /// **'Sprachkenntnisse'**
  String get profileLanguages;

  /// No description provided for @profileDocuments.
  ///
  /// In de, this message translates to:
  /// **'Dokumente'**
  String get profileDocuments;

  /// No description provided for @profileEntries.
  ///
  /// In de, this message translates to:
  /// **'{count} Einträge'**
  String profileEntries(int count);

  /// No description provided for @profileEntry.
  ///
  /// In de, this message translates to:
  /// **'1 Eintrag'**
  String get profileEntry;

  /// No description provided for @profileBio.
  ///
  /// In de, this message translates to:
  /// **'Über mich'**
  String get profileBio;

  /// No description provided for @profileSaveChanges.
  ///
  /// In de, this message translates to:
  /// **'Änderungen speichern'**
  String get profileSaveChanges;

  /// No description provided for @profileDiscardChanges.
  ///
  /// In de, this message translates to:
  /// **'Verwerfen'**
  String get profileDiscardChanges;

  /// No description provided for @profileDiscardConfirm.
  ///
  /// In de, this message translates to:
  /// **'Änderungen verwerfen?'**
  String get profileDiscardConfirm;

  /// No description provided for @profileDiscardMessage.
  ///
  /// In de, this message translates to:
  /// **'Deine Änderungen gehen verloren.'**
  String get profileDiscardMessage;

  /// No description provided for @profileSaved.
  ///
  /// In de, this message translates to:
  /// **'Profil erfolgreich gespeichert'**
  String get profileSaved;

  /// No description provided for @profilePhone.
  ///
  /// In de, this message translates to:
  /// **'Telefonnummer'**
  String get profilePhone;

  /// No description provided for @profileCity.
  ///
  /// In de, this message translates to:
  /// **'Stadt'**
  String get profileCity;

  /// No description provided for @profileCountry.
  ///
  /// In de, this message translates to:
  /// **'Land'**
  String get profileCountry;

  /// No description provided for @profileUser.
  ///
  /// In de, this message translates to:
  /// **'Benutzer'**
  String get profileUser;

  /// No description provided for @educationTitle.
  ///
  /// In de, this message translates to:
  /// **'Bildung & Studium'**
  String get educationTitle;

  /// No description provided for @educationAdd.
  ///
  /// In de, this message translates to:
  /// **'Bildung hinzufügen'**
  String get educationAdd;

  /// No description provided for @educationDegree.
  ///
  /// In de, this message translates to:
  /// **'Abschluss'**
  String get educationDegree;

  /// No description provided for @educationInstitution.
  ///
  /// In de, this message translates to:
  /// **'Institution'**
  String get educationInstitution;

  /// No description provided for @educationFieldOfStudy.
  ///
  /// In de, this message translates to:
  /// **'Fachrichtung'**
  String get educationFieldOfStudy;

  /// No description provided for @educationStartDate.
  ///
  /// In de, this message translates to:
  /// **'Startdatum'**
  String get educationStartDate;

  /// No description provided for @educationEndDate.
  ///
  /// In de, this message translates to:
  /// **'Enddatum'**
  String get educationEndDate;

  /// No description provided for @educationCurrent.
  ///
  /// In de, this message translates to:
  /// **'Aktuell hier eingeschrieben'**
  String get educationCurrent;

  /// No description provided for @educationEmpty.
  ///
  /// In de, this message translates to:
  /// **'Keine Bildungseinträge'**
  String get educationEmpty;

  /// No description provided for @educationEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Füge deine Bildungsabschlüsse hinzu'**
  String get educationEmptySubtitle;

  /// No description provided for @experienceTitle.
  ///
  /// In de, this message translates to:
  /// **'Berufserfahrung'**
  String get experienceTitle;

  /// No description provided for @experienceAdd.
  ///
  /// In de, this message translates to:
  /// **'Erfahrung hinzufügen'**
  String get experienceAdd;

  /// No description provided for @experiencePosition.
  ///
  /// In de, this message translates to:
  /// **'Position'**
  String get experiencePosition;

  /// No description provided for @experienceCompany.
  ///
  /// In de, this message translates to:
  /// **'Unternehmen'**
  String get experienceCompany;

  /// No description provided for @experienceLocation.
  ///
  /// In de, this message translates to:
  /// **'Standort'**
  String get experienceLocation;

  /// No description provided for @experienceDescription.
  ///
  /// In de, this message translates to:
  /// **'Beschreibung'**
  String get experienceDescription;

  /// No description provided for @experienceCurrent.
  ///
  /// In de, this message translates to:
  /// **'Aktuell hier beschäftigt'**
  String get experienceCurrent;

  /// No description provided for @experienceEmpty.
  ///
  /// In de, this message translates to:
  /// **'Keine Berufserfahrung'**
  String get experienceEmpty;

  /// No description provided for @experienceEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Füge deine Berufserfahrungen hinzu'**
  String get experienceEmptySubtitle;

  /// No description provided for @languagesTitle.
  ///
  /// In de, this message translates to:
  /// **'Sprachkenntnisse'**
  String get languagesTitle;

  /// No description provided for @languagesAdd.
  ///
  /// In de, this message translates to:
  /// **'Sprache hinzufügen'**
  String get languagesAdd;

  /// No description provided for @languagesLanguage.
  ///
  /// In de, this message translates to:
  /// **'Sprache'**
  String get languagesLanguage;

  /// No description provided for @languagesLevel.
  ///
  /// In de, this message translates to:
  /// **'Niveau'**
  String get languagesLevel;

  /// No description provided for @languagesEmpty.
  ///
  /// In de, this message translates to:
  /// **'Keine Sprachkenntnisse'**
  String get languagesEmpty;

  /// No description provided for @languagesEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Füge deine Sprachkenntnisse hinzu'**
  String get languagesEmptySubtitle;

  /// No description provided for @documentsTitle.
  ///
  /// In de, this message translates to:
  /// **'Dokumente'**
  String get documentsTitle;

  /// No description provided for @documentsAdd.
  ///
  /// In de, this message translates to:
  /// **'Dokument hinzufügen'**
  String get documentsAdd;

  /// No description provided for @documentsName.
  ///
  /// In de, this message translates to:
  /// **'Dokumentname'**
  String get documentsName;

  /// No description provided for @documentsType.
  ///
  /// In de, this message translates to:
  /// **'Dokumenttyp'**
  String get documentsType;

  /// No description provided for @documentsCv.
  ///
  /// In de, this message translates to:
  /// **'CV'**
  String get documentsCv;

  /// No description provided for @documentsDiploma.
  ///
  /// In de, this message translates to:
  /// **'Diplom'**
  String get documentsDiploma;

  /// No description provided for @documentsCertificate.
  ///
  /// In de, this message translates to:
  /// **'Zertifikat'**
  String get documentsCertificate;

  /// No description provided for @documentsTranscript.
  ///
  /// In de, this message translates to:
  /// **'Zeugnis'**
  String get documentsTranscript;

  /// No description provided for @documentsOther.
  ///
  /// In de, this message translates to:
  /// **'Sonstiges'**
  String get documentsOther;

  /// No description provided for @documentsDeleted.
  ///
  /// In de, this message translates to:
  /// **'GELÖSCHT'**
  String get documentsDeleted;

  /// No description provided for @documentsRestoreConfirm.
  ///
  /// In de, this message translates to:
  /// **'Wiederherstellen'**
  String get documentsRestoreConfirm;

  /// No description provided for @documentsPermanentDelete.
  ///
  /// In de, this message translates to:
  /// **'Endgültig löschen'**
  String get documentsPermanentDelete;

  /// No description provided for @documentsPermanentDeleteConfirm.
  ///
  /// In de, this message translates to:
  /// **'Endgültig löschen?'**
  String get documentsPermanentDeleteConfirm;

  /// No description provided for @documentsPermanentDeleteMessage.
  ///
  /// In de, this message translates to:
  /// **'wird unwiderruflich gelöscht.'**
  String get documentsPermanentDeleteMessage;

  /// No description provided for @documentsDeletedSection.
  ///
  /// In de, this message translates to:
  /// **'Gelöschte Dokumente'**
  String get documentsDeletedSection;

  /// No description provided for @documentsEmpty.
  ///
  /// In de, this message translates to:
  /// **'Noch keine Dokumente'**
  String get documentsEmpty;

  /// No description provided for @documentsEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Tippe auf +, um ein Dokument hinzuzufügen'**
  String get documentsEmptySubtitle;

  /// No description provided for @documentsAdded.
  ///
  /// In de, this message translates to:
  /// **'Dokument hinzugefügt (Demo-Modus)'**
  String get documentsAdded;

  /// No description provided for @documentsNamePlaceholder.
  ///
  /// In de, this message translates to:
  /// **'z.B. Lebenslauf_2024.pdf'**
  String get documentsNamePlaceholder;

  /// No description provided for @chatTitle.
  ///
  /// In de, this message translates to:
  /// **'Nachrichten'**
  String get chatTitle;

  /// No description provided for @chatEmpty.
  ///
  /// In de, this message translates to:
  /// **'Keine Nachrichten'**
  String get chatEmpty;

  /// No description provided for @chatEmptySubtitle.
  ///
  /// In de, this message translates to:
  /// **'Ihre Unterhaltungen werden hier angezeigt, sobald Sie mit Arbeitgebern kommunizieren.'**
  String get chatEmptySubtitle;

  /// No description provided for @chatInputHint.
  ///
  /// In de, this message translates to:
  /// **'Nachricht schreiben...'**
  String get chatInputHint;

  /// No description provided for @chatSend.
  ///
  /// In de, this message translates to:
  /// **'Senden'**
  String get chatSend;

  /// No description provided for @chatMinutesAgo.
  ///
  /// In de, this message translates to:
  /// **'vor {count} Min'**
  String chatMinutesAgo(int count);

  /// No description provided for @chatHoursAgo.
  ///
  /// In de, this message translates to:
  /// **'vor {count} Std'**
  String chatHoursAgo(int count);

  /// No description provided for @chatYesterday.
  ///
  /// In de, this message translates to:
  /// **'Gestern'**
  String get chatYesterday;

  /// No description provided for @chatDaysAgo.
  ///
  /// In de, this message translates to:
  /// **'vor {count} Tagen'**
  String chatDaysAgo(int count);

  /// No description provided for @chatNoMessages.
  ///
  /// In de, this message translates to:
  /// **'Noch keine Nachrichten.\nSchreiben Sie die erste Nachricht!'**
  String get chatNoMessages;

  /// No description provided for @chatNewInfo.
  ///
  /// In de, this message translates to:
  /// **'Neue Nachrichten entstehen automatisch bei Bewerbungen'**
  String get chatNewInfo;

  /// No description provided for @notificationsTitle.
  ///
  /// In de, this message translates to:
  /// **'Benachrichtigungen'**
  String get notificationsTitle;

  /// No description provided for @notificationsActiveAlerts.
  ///
  /// In de, this message translates to:
  /// **'Aktive Job-Alerts'**
  String get notificationsActiveAlerts;

  /// No description provided for @notificationsNoAlerts.
  ///
  /// In de, this message translates to:
  /// **'Keine Alerts vorhanden.'**
  String get notificationsNoAlerts;

  /// No description provided for @notificationsCreateAlert.
  ///
  /// In de, this message translates to:
  /// **'Neuen Alert erstellen'**
  String get notificationsCreateAlert;

  /// No description provided for @notificationsSearchQuery.
  ///
  /// In de, this message translates to:
  /// **'Suchbegriff (z.B. Softwareentwickler)'**
  String get notificationsSearchQuery;

  /// No description provided for @notificationsCategoryOptional.
  ///
  /// In de, this message translates to:
  /// **'Kategorie (optional)'**
  String get notificationsCategoryOptional;

  /// No description provided for @notificationsLocationOptional.
  ///
  /// In de, this message translates to:
  /// **'Standort (optional)'**
  String get notificationsLocationOptional;

  /// No description provided for @notificationsCreateButton.
  ///
  /// In de, this message translates to:
  /// **'Alert erstellen'**
  String get notificationsCreateButton;

  /// No description provided for @notificationsAlertCreated.
  ///
  /// In de, this message translates to:
  /// **'Alert erstellt: \"{query}\"'**
  String notificationsAlertCreated(String query);

  /// No description provided for @notificationsRecentTitle.
  ///
  /// In de, this message translates to:
  /// **'Letzte Benachrichtigungen'**
  String get notificationsRecentTitle;

  /// No description provided for @notificationsViewEmail.
  ///
  /// In de, this message translates to:
  /// **'E-Mail ansehen'**
  String get notificationsViewEmail;

  /// No description provided for @notificationsEmailPreview.
  ///
  /// In de, this message translates to:
  /// **'E-Mail Vorschau'**
  String get notificationsEmailPreview;

  /// No description provided for @notificationsNewOffers.
  ///
  /// In de, this message translates to:
  /// **'Neue Stellenangebote für dich!'**
  String get notificationsNewOffers;

  /// No description provided for @notificationsManage.
  ///
  /// In de, this message translates to:
  /// **'Benachrichtigungen verwalten'**
  String get notificationsManage;

  /// No description provided for @notificationsViewDetails.
  ///
  /// In de, this message translates to:
  /// **'Details ansehen'**
  String get notificationsViewDetails;

  /// No description provided for @settingsTitle.
  ///
  /// In de, this message translates to:
  /// **'Einstellungen'**
  String get settingsTitle;

  /// No description provided for @settingsLanguage.
  ///
  /// In de, this message translates to:
  /// **'Sprache'**
  String get settingsLanguage;

  /// No description provided for @settingsDarkMode.
  ///
  /// In de, this message translates to:
  /// **'Dunkelmodus'**
  String get settingsDarkMode;

  /// No description provided for @settingsNotifications.
  ///
  /// In de, this message translates to:
  /// **'Benachrichtigungen'**
  String get settingsNotifications;

  /// No description provided for @settingsAccount.
  ///
  /// In de, this message translates to:
  /// **'Konto verwalten'**
  String get settingsAccount;

  /// No description provided for @settingsSupport.
  ///
  /// In de, this message translates to:
  /// **'Hilfe & Support'**
  String get settingsSupport;

  /// No description provided for @settingsPrivacy.
  ///
  /// In de, this message translates to:
  /// **'Datenschutz'**
  String get settingsPrivacy;

  /// No description provided for @settingsTerms.
  ///
  /// In de, this message translates to:
  /// **'Nutzungsbedingungen'**
  String get settingsTerms;

  /// No description provided for @settingsAbout.
  ///
  /// In de, this message translates to:
  /// **'Über bewerbi.tn'**
  String get settingsAbout;

  /// No description provided for @settingsVersion.
  ///
  /// In de, this message translates to:
  /// **'v1.0.0'**
  String get settingsVersion;

  /// No description provided for @settingsAccountSection.
  ///
  /// In de, this message translates to:
  /// **'KONTO'**
  String get settingsAccountSection;

  /// No description provided for @settingsAppSection.
  ///
  /// In de, this message translates to:
  /// **'APP'**
  String get settingsAppSection;

  /// No description provided for @settingsLegalSection.
  ///
  /// In de, this message translates to:
  /// **'RECHTLICHES'**
  String get settingsLegalSection;

  /// No description provided for @settingsFooter.
  ///
  /// In de, this message translates to:
  /// **'bewerbi.tn v1.0.0 | Made with love in Tunisia'**
  String get settingsFooter;

  /// No description provided for @accountTitle.
  ///
  /// In de, this message translates to:
  /// **'Konto verwalten'**
  String get accountTitle;

  /// No description provided for @accountChangeEmail.
  ///
  /// In de, this message translates to:
  /// **'E-Mail ändern'**
  String get accountChangeEmail;

  /// No description provided for @accountCurrentEmail.
  ///
  /// In de, this message translates to:
  /// **'Aktuelle E-Mail'**
  String get accountCurrentEmail;

  /// No description provided for @accountNewEmail.
  ///
  /// In de, this message translates to:
  /// **'Neue E-Mail'**
  String get accountNewEmail;

  /// No description provided for @accountNewEmailPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'neue.email@beispiel.de'**
  String get accountNewEmailPlaceholder;

  /// No description provided for @accountChange.
  ///
  /// In de, this message translates to:
  /// **'Ändern'**
  String get accountChange;

  /// No description provided for @accountChangePassword.
  ///
  /// In de, this message translates to:
  /// **'Passwort ändern'**
  String get accountChangePassword;

  /// No description provided for @accountCurrentPassword.
  ///
  /// In de, this message translates to:
  /// **'Aktuelles Passwort'**
  String get accountCurrentPassword;

  /// No description provided for @accountNewPassword.
  ///
  /// In de, this message translates to:
  /// **'Neues Passwort'**
  String get accountNewPassword;

  /// No description provided for @accountConfirmNewPassword.
  ///
  /// In de, this message translates to:
  /// **'Passwort bestätigen'**
  String get accountConfirmNewPassword;

  /// No description provided for @accountNewPasswordPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'Mindestens 8 Zeichen'**
  String get accountNewPasswordPlaceholder;

  /// No description provided for @accountConfirmPasswordPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'Passwort wiederholen'**
  String get accountConfirmPasswordPlaceholder;

  /// No description provided for @accountEmailVerification.
  ///
  /// In de, this message translates to:
  /// **'E-Mail-Verifizierung'**
  String get accountEmailVerification;

  /// No description provided for @accountVerified.
  ///
  /// In de, this message translates to:
  /// **'Verifiziert'**
  String get accountVerified;

  /// No description provided for @accountNotVerified.
  ///
  /// In de, this message translates to:
  /// **'Nicht verifiziert'**
  String get accountNotVerified;

  /// No description provided for @accountSendVerification.
  ///
  /// In de, this message translates to:
  /// **'Bestätigungsmail senden'**
  String get accountSendVerification;

  /// No description provided for @accountDataExport.
  ///
  /// In de, this message translates to:
  /// **'Datenexport'**
  String get accountDataExport;

  /// No description provided for @accountDataExportDescription.
  ///
  /// In de, this message translates to:
  /// **'Lade eine Kopie aller deiner gespeicherten Daten herunter.'**
  String get accountDataExportDescription;

  /// No description provided for @accountExportButton.
  ///
  /// In de, this message translates to:
  /// **'Meine Daten herunterladen'**
  String get accountExportButton;

  /// No description provided for @accountDeleteAccount.
  ///
  /// In de, this message translates to:
  /// **'Konto löschen'**
  String get accountDeleteAccount;

  /// No description provided for @accountDeleteWarning.
  ///
  /// In de, this message translates to:
  /// **'Wenn du dein Konto löschst, werden alle deine Daten unwiderruflich gelöscht.'**
  String get accountDeleteWarning;

  /// No description provided for @accountDeleteButton.
  ///
  /// In de, this message translates to:
  /// **'Konto endgültig löschen'**
  String get accountDeleteButton;

  /// No description provided for @accountDeleteConfirm.
  ///
  /// In de, this message translates to:
  /// **'Bist du sicher?'**
  String get accountDeleteConfirm;

  /// No description provided for @accountDeleteInstruction.
  ///
  /// In de, this message translates to:
  /// **'Gib \"LÖSCHEN\" ein, um zu bestätigen:'**
  String get accountDeleteInstruction;

  /// No description provided for @accountDeletePlaceholder.
  ///
  /// In de, this message translates to:
  /// **'LÖSCHEN'**
  String get accountDeletePlaceholder;

  /// No description provided for @accountDeleteIrreversible.
  ///
  /// In de, this message translates to:
  /// **'Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden unwiderruflich gelöscht.'**
  String get accountDeleteIrreversible;

  /// No description provided for @accountDeleted.
  ///
  /// In de, this message translates to:
  /// **'Konto wurde gelöscht'**
  String get accountDeleted;

  /// No description provided for @accountEmailConfirmSent.
  ///
  /// In de, this message translates to:
  /// **'Bestätigungsmail an {email} gesendet (Demo)'**
  String accountEmailConfirmSent(String email);

  /// No description provided for @accountPasswordChanged.
  ///
  /// In de, this message translates to:
  /// **'Passwort erfolgreich geändert'**
  String get accountPasswordChanged;

  /// No description provided for @accountVerificationSent.
  ///
  /// In de, this message translates to:
  /// **'Bestätigungsmail gesendet (Demo)'**
  String get accountVerificationSent;

  /// No description provided for @accountExportPreparing.
  ///
  /// In de, this message translates to:
  /// **'Datenexport wird vorbereitet... (Demo)'**
  String get accountExportPreparing;

  /// No description provided for @accountInvalidEmail.
  ///
  /// In de, this message translates to:
  /// **'Bitte gib eine gültige E-Mail-Adresse ein'**
  String get accountInvalidEmail;

  /// No description provided for @accountEnterCurrentPassword.
  ///
  /// In de, this message translates to:
  /// **'Bitte gib dein aktuelles Passwort ein'**
  String get accountEnterCurrentPassword;

  /// No description provided for @accountPasswordTooShort.
  ///
  /// In de, this message translates to:
  /// **'Das Passwort muss mindestens 8 Zeichen lang sein'**
  String get accountPasswordTooShort;

  /// No description provided for @accountPasswordsMismatch.
  ///
  /// In de, this message translates to:
  /// **'Die Passwörter stimmen nicht überein'**
  String get accountPasswordsMismatch;

  /// No description provided for @employerDashboard.
  ///
  /// In de, this message translates to:
  /// **'Dashboard'**
  String get employerDashboard;

  /// No description provided for @employerActiveJobs.
  ///
  /// In de, this message translates to:
  /// **'Aktive Stellen'**
  String get employerActiveJobs;

  /// No description provided for @employerTotalApplications.
  ///
  /// In de, this message translates to:
  /// **'Bewerbungen'**
  String get employerTotalApplications;

  /// No description provided for @employerNewThisWeek.
  ///
  /// In de, this message translates to:
  /// **'Neue diese Woche'**
  String get employerNewThisWeek;

  /// No description provided for @employerRecentApplications.
  ///
  /// In de, this message translates to:
  /// **'Letzte Bewerbungen'**
  String get employerRecentApplications;

  /// No description provided for @employerCreateListing.
  ///
  /// In de, this message translates to:
  /// **'Neue Stelle erstellen'**
  String get employerCreateListing;

  /// No description provided for @employerMyListings.
  ///
  /// In de, this message translates to:
  /// **'Meine Stellenanzeigen'**
  String get employerMyListings;

  /// No description provided for @employerEditListing.
  ///
  /// In de, this message translates to:
  /// **'Stelle bearbeiten'**
  String get employerEditListing;

  /// No description provided for @employerPublish.
  ///
  /// In de, this message translates to:
  /// **'Veröffentlichen'**
  String get employerPublish;

  /// No description provided for @employerSaveChanges.
  ///
  /// In de, this message translates to:
  /// **'Speichern'**
  String get employerSaveChanges;

  /// No description provided for @employerCloseListing.
  ///
  /// In de, this message translates to:
  /// **'Stelle schließen'**
  String get employerCloseListing;

  /// No description provided for @employerActivateListing.
  ///
  /// In de, this message translates to:
  /// **'Stelle aktivieren'**
  String get employerActivateListing;

  /// No description provided for @employerApplicants.
  ///
  /// In de, this message translates to:
  /// **'Bewerbungen'**
  String get employerApplicants;

  /// No description provided for @employerAccept.
  ///
  /// In de, this message translates to:
  /// **'Annehmen'**
  String get employerAccept;

  /// No description provided for @employerReject.
  ///
  /// In de, this message translates to:
  /// **'Ablehnen'**
  String get employerReject;

  /// No description provided for @employerTopCandidate.
  ///
  /// In de, this message translates to:
  /// **'Top-Kandidat'**
  String get employerTopCandidate;

  /// No description provided for @employerGoodMatch.
  ///
  /// In de, this message translates to:
  /// **'Guter Match'**
  String get employerGoodMatch;

  /// No description provided for @employerSuitable.
  ///
  /// In de, this message translates to:
  /// **'Passend'**
  String get employerSuitable;

  /// No description provided for @employerReview.
  ///
  /// In de, this message translates to:
  /// **'Prüfen'**
  String get employerReview;

  /// No description provided for @employerCandidateScoring.
  ///
  /// In de, this message translates to:
  /// **'Kandidaten nach Match-Score sortiert'**
  String get employerCandidateScoring;

  /// No description provided for @employerCompanyProfile.
  ///
  /// In de, this message translates to:
  /// **'Firmenprofil'**
  String get employerCompanyProfile;

  /// No description provided for @employerNoApplications.
  ///
  /// In de, this message translates to:
  /// **'Noch keine Bewerbungen'**
  String get employerNoApplications;

  /// No description provided for @employerNoListings.
  ///
  /// In de, this message translates to:
  /// **'Keine Stellenanzeigen'**
  String get employerNoListings;

  /// No description provided for @employerNoListingsSubtitle.
  ///
  /// In de, this message translates to:
  /// **'Erstellen Sie Ihre erste Stellenanzeige.'**
  String get employerNoListingsSubtitle;

  /// No description provided for @employerListingPublished.
  ///
  /// In de, this message translates to:
  /// **'Stelle erfolgreich veröffentlicht!'**
  String get employerListingPublished;

  /// No description provided for @employerFillRequired.
  ///
  /// In de, this message translates to:
  /// **'Bitte füllen Sie alle Pflichtfelder aus.'**
  String get employerFillRequired;

  /// No description provided for @employerListingTitle.
  ///
  /// In de, this message translates to:
  /// **'Titel'**
  String get employerListingTitle;

  /// No description provided for @employerListingTitlePlaceholder.
  ///
  /// In de, this message translates to:
  /// **'z.B. Full-Stack Entwickler (m/w/d)'**
  String get employerListingTitlePlaceholder;

  /// No description provided for @employerListingCategory.
  ///
  /// In de, this message translates to:
  /// **'Kategorie'**
  String get employerListingCategory;

  /// No description provided for @employerListingType.
  ///
  /// In de, this message translates to:
  /// **'Typ'**
  String get employerListingType;

  /// No description provided for @employerListingLocation.
  ///
  /// In de, this message translates to:
  /// **'Standort'**
  String get employerListingLocation;

  /// No description provided for @employerListingLocationPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'z.B. Berlin, München'**
  String get employerListingLocationPlaceholder;

  /// No description provided for @employerListingSalary.
  ///
  /// In de, this message translates to:
  /// **'Gehaltsspanne (optional)'**
  String get employerListingSalary;

  /// No description provided for @employerListingSalaryPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'z.B. 45.000 - 60.000 €'**
  String get employerListingSalaryPlaceholder;

  /// No description provided for @employerListingGermanLevel.
  ///
  /// In de, this message translates to:
  /// **'Deutschkenntnisse'**
  String get employerListingGermanLevel;

  /// No description provided for @employerListingDescription.
  ///
  /// In de, this message translates to:
  /// **'Beschreibung'**
  String get employerListingDescription;

  /// No description provided for @employerListingDescriptionPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'Beschreiben Sie die Stelle...'**
  String get employerListingDescriptionPlaceholder;

  /// No description provided for @employerListingRequirements.
  ///
  /// In de, this message translates to:
  /// **'Anforderungen'**
  String get employerListingRequirements;

  /// No description provided for @employerListingRequirementsPlaceholder.
  ///
  /// In de, this message translates to:
  /// **'Welche Anforderungen müssen erfüllt werden?'**
  String get employerListingRequirementsPlaceholder;

  /// No description provided for @adminUsers.
  ///
  /// In de, this message translates to:
  /// **'Benutzerverwaltung'**
  String get adminUsers;

  /// No description provided for @adminListings.
  ///
  /// In de, this message translates to:
  /// **'Stellenverwaltung'**
  String get adminListings;

  /// No description provided for @adminReports.
  ///
  /// In de, this message translates to:
  /// **'Statistiken'**
  String get adminReports;

  /// No description provided for @adminAll.
  ///
  /// In de, this message translates to:
  /// **'Alle'**
  String get adminAll;

  /// No description provided for @adminApplicants.
  ///
  /// In de, this message translates to:
  /// **'Bewerber'**
  String get adminApplicants;

  /// No description provided for @adminEmployers.
  ///
  /// In de, this message translates to:
  /// **'Arbeitgeber'**
  String get adminEmployers;

  /// No description provided for @adminAdmins.
  ///
  /// In de, this message translates to:
  /// **'Admins'**
  String get adminAdmins;

  /// No description provided for @adminActive.
  ///
  /// In de, this message translates to:
  /// **'Aktiv'**
  String get adminActive;

  /// No description provided for @adminClosed.
  ///
  /// In de, this message translates to:
  /// **'Geschlossen'**
  String get adminClosed;

  /// No description provided for @adminTotalUsers.
  ///
  /// In de, this message translates to:
  /// **'Gesamt-Benutzer'**
  String get adminTotalUsers;

  /// No description provided for @adminActiveJobs.
  ///
  /// In de, this message translates to:
  /// **'Aktive Stellen'**
  String get adminActiveJobs;

  /// No description provided for @adminTotalApplications.
  ///
  /// In de, this message translates to:
  /// **'Bewerbungen'**
  String get adminTotalApplications;

  /// No description provided for @adminAcceptedApps.
  ///
  /// In de, this message translates to:
  /// **'Angenommen'**
  String get adminAcceptedApps;

  /// No description provided for @adminRejectedApps.
  ///
  /// In de, this message translates to:
  /// **'Abgelehnt'**
  String get adminRejectedApps;

  /// No description provided for @adminReviewedApps.
  ///
  /// In de, this message translates to:
  /// **'In Prüfung'**
  String get adminReviewedApps;

  /// No description provided for @onboardingSkip.
  ///
  /// In de, this message translates to:
  /// **'Überspringen'**
  String get onboardingSkip;

  /// No description provided for @onboardingNext.
  ///
  /// In de, this message translates to:
  /// **'Weiter'**
  String get onboardingNext;

  /// No description provided for @onboardingGetStarted.
  ///
  /// In de, this message translates to:
  /// **'Los geht\'s'**
  String get onboardingGetStarted;

  /// No description provided for @onboardingTitle1.
  ///
  /// In de, this message translates to:
  /// **'Deine Brücke nach Deutschland'**
  String get onboardingTitle1;

  /// No description provided for @onboardingSubtitle1.
  ///
  /// In de, this message translates to:
  /// **'Finde Jobs, Ausbildungen und Sprachkurse in Deutschland – speziell für tunesische Fachkräfte.'**
  String get onboardingSubtitle1;

  /// No description provided for @onboardingTitle2.
  ///
  /// In de, this message translates to:
  /// **'Erstelle dein Profil'**
  String get onboardingTitle2;

  /// No description provided for @onboardingSubtitle2.
  ///
  /// In de, this message translates to:
  /// **'Lebenslauf hochladen, Erfahrungen eintragen und von Arbeitgebern gefunden werden.'**
  String get onboardingSubtitle2;

  /// No description provided for @onboardingTitle3.
  ///
  /// In de, this message translates to:
  /// **'Bewirb dich mit einem Klick'**
  String get onboardingTitle3;

  /// No description provided for @onboardingSubtitle3.
  ///
  /// In de, this message translates to:
  /// **'Sende deine Bewerbung direkt an deutsche Arbeitgeber und verfolge den Status in Echtzeit.'**
  String get onboardingSubtitle3;

  /// No description provided for @legalPrivacy.
  ///
  /// In de, this message translates to:
  /// **'Datenschutzerklärung'**
  String get legalPrivacy;

  /// No description provided for @legalTerms.
  ///
  /// In de, this message translates to:
  /// **'Nutzungsbedingungen'**
  String get legalTerms;

  /// No description provided for @legalImpressum.
  ///
  /// In de, this message translates to:
  /// **'Impressum'**
  String get legalImpressum;

  /// No description provided for @legalSupport.
  ///
  /// In de, this message translates to:
  /// **'Hilfe & Support'**
  String get legalSupport;

  /// No description provided for @legalFaq.
  ///
  /// In de, this message translates to:
  /// **'Häufig gestellte Fragen'**
  String get legalFaq;

  /// No description provided for @legalContact.
  ///
  /// In de, this message translates to:
  /// **'Kontakt'**
  String get legalContact;

  /// No description provided for @legalFeedback.
  ///
  /// In de, this message translates to:
  /// **'Feedback senden'**
  String get legalFeedback;

  /// No description provided for @legalFeedbackHint.
  ///
  /// In de, this message translates to:
  /// **'Dein Feedback hilft uns, die App zu verbessern...'**
  String get legalFeedbackHint;

  /// No description provided for @legalFeedbackSent.
  ///
  /// In de, this message translates to:
  /// **'Danke für dein Feedback!'**
  String get legalFeedbackSent;

  /// No description provided for @errorGeneral.
  ///
  /// In de, this message translates to:
  /// **'Etwas ist schiefgelaufen'**
  String get errorGeneral;

  /// No description provided for @errorNetwork.
  ///
  /// In de, this message translates to:
  /// **'Bitte überprüfe deine Internetverbindung und versuche es erneut.'**
  String get errorNetwork;

  /// No description provided for @errorRetry.
  ///
  /// In de, this message translates to:
  /// **'Erneut versuchen'**
  String get errorRetry;

  /// No description provided for @navHome.
  ///
  /// In de, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navSearch.
  ///
  /// In de, this message translates to:
  /// **'Suche'**
  String get navSearch;

  /// No description provided for @navApplications.
  ///
  /// In de, this message translates to:
  /// **'Bewerbungen'**
  String get navApplications;

  /// No description provided for @navFavorites.
  ///
  /// In de, this message translates to:
  /// **'Favoriten'**
  String get navFavorites;

  /// No description provided for @navProfile.
  ///
  /// In de, this message translates to:
  /// **'Profil'**
  String get navProfile;

  /// No description provided for @navSettings.
  ///
  /// In de, this message translates to:
  /// **'Einstellungen'**
  String get navSettings;

  /// No description provided for @navMessages.
  ///
  /// In de, this message translates to:
  /// **'Nachrichten'**
  String get navMessages;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'de', 'fr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'de':
      return AppLocalizationsDe();
    case 'fr':
      return AppLocalizationsFr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
