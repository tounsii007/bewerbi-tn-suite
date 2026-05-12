part of '../account_screen.dart';

class _AccountScreenUi {
  const _AccountScreenUi._();

  static const EdgeInsets screenPadding = EdgeInsets.all(AppSpacing.xl);
}

class _AccountScreenText {
  const _AccountScreenText._();

  static const String fallbackEmail = 'benutzer@bewerbi.tn';
  static const String invalidEmail =
      'Bitte gib eine gueltige E-Mail-Adresse ein';
  static const String currentPasswordMissing =
      'Bitte gib dein aktuelles Passwort ein';
  static const String passwordTooShort =
      'Das Passwort muss mindestens 8 Zeichen lang sein';
  static const String passwordMismatch =
      'Die Passwoerter stimmen nicht ueberein';
  static const String passwordChanged = 'Passwort erfolgreich geaendert';
  static const String verificationSent = 'Bestaetigungsmail gesendet (Demo)';
  static const String exportStarted = 'Datenexport wird vorbereitet... (Demo)';
  static const String accountDeleted = 'Konto wurde geloescht';
  static const String deleteDialogTitle = 'Bist du sicher?';
  static const String deleteDialogBody =
      'Diese Aktion kann nicht rueckgaengig gemacht werden. '
      'Alle deine Daten werden unwiderruflich geloescht.';
  static const String deleteDialogInstruction =
      'Gib "LOESCHEN" ein, um zu bestaetigen:';
  static const String deleteConfirmation = 'LOESCHEN';
}
