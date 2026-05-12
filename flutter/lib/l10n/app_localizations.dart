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

  /// No description provided for @commonSearch.
  ///
  /// In de, this message translates to:
  /// **'Suchen'**
  String get commonSearch;

  /// No description provided for @commonFilter.
  ///
  /// In de, this message translates to:
  /// **'Filter'**
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
  /// **'E-Mail'**
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
  /// **'Ich bin...'**
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

  /// No description provided for @homeGreeting.
  ///
  /// In de, this message translates to:
  /// **'Hallo, {name}!'**
  String homeGreeting(String name);

  /// No description provided for @homeProfileComplete.
  ///
  /// In de, this message translates to:
  /// **'Profil {percent}% vollständig'**
  String homeProfileComplete(int percent);

  /// No description provided for @homeRecommended.
  ///
  /// In de, this message translates to:
  /// **'Empfohlen'**
  String get homeRecommended;

  /// No description provided for @homeLatest.
  ///
  /// In de, this message translates to:
  /// **'Neueste Angebote'**
  String get homeLatest;

  /// No description provided for @homeCategories.
  ///
  /// In de, this message translates to:
  /// **'Kategorien'**
  String get homeCategories;

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

  /// No description provided for @profileBio.
  ///
  /// In de, this message translates to:
  /// **'Über mich'**
  String get profileBio;

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

  /// No description provided for @jobsRequirements.
  ///
  /// In de, this message translates to:
  /// **'Anforderungen'**
  String get jobsRequirements;

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

  /// No description provided for @jobsCoverLetter.
  ///
  /// In de, this message translates to:
  /// **'Anschreiben'**
  String get jobsCoverLetter;

  /// No description provided for @jobsIt.
  ///
  /// In de, this message translates to:
  /// **'IT & Software'**
  String get jobsIt;

  /// No description provided for @jobsPflege.
  ///
  /// In de, this message translates to:
  /// **'Pflege & Gesundheit'**
  String get jobsPflege;

  /// No description provided for @jobsTransport.
  ///
  /// In de, this message translates to:
  /// **'Transport & Logistik'**
  String get jobsTransport;

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

  /// No description provided for @applicationsTitle.
  ///
  /// In de, this message translates to:
  /// **'Meine Bewerbungen'**
  String get applicationsTitle;

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

  /// No description provided for @applicationsNoApplications.
  ///
  /// In de, this message translates to:
  /// **'Keine Bewerbungen'**
  String get applicationsNoApplications;

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
  /// **'Dunkler Modus'**
  String get settingsDarkMode;

  /// No description provided for @settingsNotifications.
  ///
  /// In de, this message translates to:
  /// **'Benachrichtigungen'**
  String get settingsNotifications;

  /// No description provided for @settingsAbout.
  ///
  /// In de, this message translates to:
  /// **'Über bewerbi.tn'**
  String get settingsAbout;

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
