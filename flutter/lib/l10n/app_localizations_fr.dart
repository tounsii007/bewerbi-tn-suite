// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for French (`fr`).
class AppLocalizationsFr extends AppLocalizations {
  AppLocalizationsFr([String locale = 'fr']) : super(locale);

  @override
  String get appName => 'bewerbi.tn';

  @override
  String get appSlogan => 'Votre pont vers l\'Allemagne';

  @override
  String get commonLoading => 'Chargement...';

  @override
  String get commonSave => 'Enregistrer';

  @override
  String get commonCancel => 'Annuler';

  @override
  String get commonDelete => 'Supprimer';

  @override
  String get commonEdit => 'Modifier';

  @override
  String get commonBack => 'Retour';

  @override
  String get commonNext => 'Suivant';

  @override
  String get commonSearch => 'Rechercher';

  @override
  String get commonFilter => 'Filtrer';

  @override
  String get commonApply => 'Postuler';

  @override
  String get commonSubmit => 'Envoyer';

  @override
  String get commonClose => 'Fermer';

  @override
  String get commonYes => 'Oui';

  @override
  String get commonNo => 'Non';

  @override
  String get commonError => 'Erreur';

  @override
  String get commonSuccess => 'Succès';

  @override
  String get commonRetry => 'Réessayer';

  @override
  String get commonNoResults => 'Aucun résultat';

  @override
  String get commonSeeAll => 'Tout afficher';

  @override
  String get commonRequired => 'Champ obligatoire';

  @override
  String get commonOptional => 'Facultatif';

  @override
  String get commonAdd => 'Ajouter';

  @override
  String get commonRemove => 'Retirer';

  @override
  String get commonRestore => 'Restaurer';

  @override
  String get commonShare => 'Partager';

  @override
  String get commonSend => 'Envoyer';

  @override
  String get commonNow => 'Maintenant';

  @override
  String get commonEnabled => 'Activé';

  @override
  String get commonDisabled => 'Désactivé';

  @override
  String get commonUnknown => 'Inconnu';

  @override
  String get authLogin => 'Se connecter';

  @override
  String get authRegister => 'S\'inscrire';

  @override
  String get authLogout => 'Se déconnecter';

  @override
  String get authEmail => 'Adresse e-mail';

  @override
  String get authPassword => 'Mot de passe';

  @override
  String get authConfirmPassword => 'Confirmer le mot de passe';

  @override
  String get authForgotPassword => 'Mot de passe oublié ?';

  @override
  String get authResetPassword => 'Réinitialiser le mot de passe';

  @override
  String get authFirstName => 'Prénom';

  @override
  String get authLastName => 'Nom de famille';

  @override
  String get authIAmA => 'Je suis...';

  @override
  String get authApplicant => 'Candidat';

  @override
  String get authEmployer => 'Employeur';

  @override
  String get authNoAccount => 'Pas encore de compte ?';

  @override
  String get authHasAccount => 'Vous avez déjà un compte ?';

  @override
  String get authWelcome => 'Bienvenue';

  @override
  String get authSubtitle => 'Votre pont vers l\'Allemagne';

  @override
  String get authOrLoginWith => 'ou';

  @override
  String get authGoogleLogin => 'Se connecter avec Google';

  @override
  String get authFacebookLogin => 'Se connecter avec Facebook';

  @override
  String get authDemoMode => 'MODE DÉMO';

  @override
  String get authAdmin => 'Admin';

  @override
  String get authPasswordMinLength => '8 caractères minimum';

  @override
  String get authPasswordsNoMatch => 'Les mots de passe ne correspondent pas.';

  @override
  String get authResetSent => 'E-mail envoyé !';

  @override
  String get authResetInstructions =>
      'Nous avons envoyé un lien de réinitialisation de mot de passe.';

  @override
  String get authResetSendLink => 'Envoyer le lien';

  @override
  String get authResetEmailPlaceholder => 'Adresse e-mail';

  @override
  String get authResetDescription =>
      'Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.';

  @override
  String get authBackToLogin => 'Retour à la connexion';

  @override
  String get authCreateAccount => 'Créez votre compte bewerbi.tn';

  @override
  String get authRegisterSuccess =>
      'Inscription réussie ! Veuillez vous connecter.';

  @override
  String get authFillAllFields => 'Veuillez remplir tous les champs.';

  @override
  String get authPasswordMinLengthError =>
      'Le mot de passe doit contenir au moins 6 caractères.';

  @override
  String get authEnterEmail => 'Veuillez entrer votre adresse e-mail.';

  @override
  String get authGoogleDemoMode => 'Connexion Google (mode démo)';

  @override
  String get authFacebookDemoMode => 'Connexion Facebook (mode démo)';

  @override
  String homeGreeting(String name) {
    return 'Bonjour, $name !';
  }

  @override
  String get homeGreetingMorning => 'Bonjour';

  @override
  String get homeGreetingAfternoon => 'Bon après-midi';

  @override
  String get homeGreetingEvening => 'Bonsoir';

  @override
  String get homeApplications => 'Candidatures';

  @override
  String get homeFavorites => 'Favoris';

  @override
  String get homeOpenPositions => 'Postes ouverts';

  @override
  String homeProfileComplete(int percent) {
    return 'Profil $percent% complet';
  }

  @override
  String get homeProfileCompleteness => 'Complétude du profil';

  @override
  String get homeComplete => 'complet';

  @override
  String get homeCategories => 'Catégories';

  @override
  String get homeRecommended => 'Recommandé pour vous';

  @override
  String get homeLatest => 'Dernières offres';

  @override
  String get homeMatch => 'Correspondance';

  @override
  String get homeNoOffers => 'Aucune offre disponible';

  @override
  String get homeUser => 'Utilisateur';

  @override
  String get jobsTitle => 'Emplois';

  @override
  String get jobsSearch => 'Rechercher des emplois...';

  @override
  String jobsResults(int count) {
    return '$count résultats';
  }

  @override
  String get jobsClearAll => 'Tout effacer';

  @override
  String get jobsCategory => 'Catégorie';

  @override
  String get jobsType => 'Type';

  @override
  String get jobsLocation => 'Lieu';

  @override
  String get jobsSalary => 'Salaire';

  @override
  String get jobsGermanLevel => 'Niveau d\'allemand';

  @override
  String get jobsGermanLevelMin => 'COMPÉTENCES EN ALLEMAND (MINIMUM)';

  @override
  String get jobsMinSalary => 'SALAIRE MINIMUM';

  @override
  String get jobsRequirements => 'Exigences';

  @override
  String get jobsDescription => 'Description';

  @override
  String get jobsApplyNow => 'Postuler maintenant';

  @override
  String get jobsApplied => 'Déjà postulé';

  @override
  String get jobsContactEmployer => 'Contacter l\'employeur';

  @override
  String get jobsShareCopied => 'Lien copié ! Partagez-le maintenant.';

  @override
  String get jobsIt => 'IT & Logiciels';

  @override
  String get jobsItShort => 'IT';

  @override
  String get jobsPflege => 'Soins & Santé';

  @override
  String get jobsPflegeShort => 'Soins';

  @override
  String get jobsTransport => 'Transport & Logistique';

  @override
  String get jobsTransportShort => 'Transport';

  @override
  String get jobsSonstige => 'Autres';

  @override
  String get jobsJob => 'Emploi';

  @override
  String get jobsAusbildung => 'Formation';

  @override
  String get jobsStudium => 'Études';

  @override
  String get jobsSprachkurs => 'Cours de langue';

  @override
  String get jobsPostedBy => 'Publié par';

  @override
  String get jobsToday => 'Aujourd\'hui';

  @override
  String get jobsYesterday => 'Hier';

  @override
  String jobsDaysAgo(int days) {
    return 'il y a $days jours';
  }

  @override
  String get jobsLoadMore => 'Charger plus';

  @override
  String get jobsNotFound => 'Emploi non trouvé';

  @override
  String get jobsNoResults => 'Aucun résultat trouvé';

  @override
  String get jobsNoResultsHint =>
      'Essayez d\'autres termes de recherche ou filtres';

  @override
  String get jobsCategoryLabel => 'CATÉGORIE';

  @override
  String get jobsTypeLabel => 'TYPE';

  @override
  String get jobsLocationLabel => 'LIEU';

  @override
  String get jobsSalaryNegotiable => 'Salaire à négocier';

  @override
  String get jobsLocationPlaceholder => 'Berlin, Munich...';

  @override
  String get applyTitle => 'Envoyer la candidature';

  @override
  String get applyCoverLetter => 'Lettre de motivation';

  @override
  String get applyCoverLetterHint =>
      'Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature...';

  @override
  String get applyUploadCv => 'CV';

  @override
  String get applyUploadHint => 'Télécharger un fichier PDF ou Word';

  @override
  String get applyCustomQuestions =>
      'Questions supplémentaires de l\'employeur';

  @override
  String applyQuestionCount(int count) {
    return 'L\'employeur a $count question supplémentaire';
  }

  @override
  String applyQuestionCountPlural(int count) {
    return 'L\'employeur a $count questions supplémentaires';
  }

  @override
  String get applyYourAnswer => 'Votre réponse...';

  @override
  String get applySubmit => 'Envoyer la candidature';

  @override
  String get applySuccess => 'Candidature envoyée avec succès !';

  @override
  String get applyAlreadyApplied => 'Vous avez déjà postulé pour ce poste.';

  @override
  String applyCvSelected(String name) {
    return 'CV \"$name\" sélectionné (démo)';
  }

  @override
  String get applicationsTitle => 'Mes candidatures';

  @override
  String applicationsCount(int count) {
    return '$count candidature';
  }

  @override
  String applicationsCountPlural(int count) {
    return '$count candidatures';
  }

  @override
  String get applicationsPending => 'En attente';

  @override
  String get applicationsReviewed => 'En cours d\'examen';

  @override
  String get applicationsAccepted => 'Accepté';

  @override
  String get applicationsRejected => 'Refusé';

  @override
  String applicationsAppliedOn(String date) {
    return 'Postulé le $date';
  }

  @override
  String get applicationsNoApplications => 'Pas encore de candidatures';

  @override
  String get applicationsEmptySubtitle => 'Découvrez les offres et postulez !';

  @override
  String get applicationsUnknownJob => 'Poste inconnu';

  @override
  String get favoritesTitle => 'Favoris';

  @override
  String favoritesCount(int count) {
    return '$count postes enregistrés';
  }

  @override
  String get favoritesEmpty => 'Pas encore de favoris';

  @override
  String get favoritesEmptySubtitle =>
      'Enregistrez des postes pour les retrouver ici';

  @override
  String get profileTitle => 'Mon profil';

  @override
  String get profileEdit => 'Modifier le profil';

  @override
  String get profileEducation => 'Formation et études';

  @override
  String get profileExperience => 'Expérience professionnelle';

  @override
  String get profileLanguages => 'Compétences linguistiques';

  @override
  String get profileDocuments => 'Documents';

  @override
  String profileEntries(int count) {
    return '$count entrées';
  }

  @override
  String get profileEntry => '1 entrée';

  @override
  String get profileBio => 'À propos de moi';

  @override
  String get profileSaveChanges => 'Enregistrer les modifications';

  @override
  String get profileDiscardChanges => 'Annuler';

  @override
  String get profileDiscardConfirm => 'Annuler les modifications ?';

  @override
  String get profileDiscardMessage => 'Vos modifications seront perdues.';

  @override
  String get profileSaved => 'Profil enregistré avec succès';

  @override
  String get profilePhone => 'Numéro de téléphone';

  @override
  String get profileCity => 'Ville';

  @override
  String get profileCountry => 'Pays';

  @override
  String get profileUser => 'Utilisateur';

  @override
  String get educationTitle => 'Formation et études';

  @override
  String get educationAdd => 'Ajouter une formation';

  @override
  String get educationDegree => 'Diplôme';

  @override
  String get educationInstitution => 'Établissement';

  @override
  String get educationFieldOfStudy => 'Domaine d\'études';

  @override
  String get educationStartDate => 'Date de début';

  @override
  String get educationEndDate => 'Date de fin';

  @override
  String get educationCurrent => 'Actuellement inscrit';

  @override
  String get educationEmpty => 'Aucune formation';

  @override
  String get educationEmptySubtitle => 'Ajoutez vos diplômes';

  @override
  String get experienceTitle => 'Expérience professionnelle';

  @override
  String get experienceAdd => 'Ajouter une expérience';

  @override
  String get experiencePosition => 'Poste';

  @override
  String get experienceCompany => 'Entreprise';

  @override
  String get experienceLocation => 'Lieu';

  @override
  String get experienceDescription => 'Description';

  @override
  String get experienceCurrent => 'Actuellement en poste';

  @override
  String get experienceEmpty => 'Aucune expérience professionnelle';

  @override
  String get experienceEmptySubtitle =>
      'Ajoutez vos expériences professionnelles';

  @override
  String get languagesTitle => 'Compétences linguistiques';

  @override
  String get languagesAdd => 'Ajouter une langue';

  @override
  String get languagesLanguage => 'Langue';

  @override
  String get languagesLevel => 'Niveau';

  @override
  String get languagesEmpty => 'Aucune compétence linguistique';

  @override
  String get languagesEmptySubtitle => 'Ajoutez vos compétences linguistiques';

  @override
  String get documentsTitle => 'Documents';

  @override
  String get documentsAdd => 'Ajouter un document';

  @override
  String get documentsName => 'Nom du document';

  @override
  String get documentsType => 'Type de document';

  @override
  String get documentsCv => 'CV';

  @override
  String get documentsDiploma => 'Diplôme';

  @override
  String get documentsCertificate => 'Certificat';

  @override
  String get documentsTranscript => 'Relevé de notes';

  @override
  String get documentsOther => 'Autre';

  @override
  String get documentsDeleted => 'SUPPRIMÉ';

  @override
  String get documentsRestoreConfirm => 'Restaurer';

  @override
  String get documentsPermanentDelete => 'Supprimer définitivement';

  @override
  String get documentsPermanentDeleteConfirm => 'Supprimer définitivement ?';

  @override
  String get documentsPermanentDeleteMessage => 'sera supprimé définitivement.';

  @override
  String get documentsDeletedSection => 'Documents supprimés';

  @override
  String get documentsEmpty => 'Pas encore de documents';

  @override
  String get documentsEmptySubtitle => 'Appuyez sur + pour ajouter un document';

  @override
  String get documentsAdded => 'Document ajouté (mode démo)';

  @override
  String get documentsNamePlaceholder => 'ex. CV_2024.pdf';

  @override
  String get chatTitle => 'Messages';

  @override
  String get chatEmpty => 'Aucun message';

  @override
  String get chatEmptySubtitle =>
      'Vos conversations apparaîtront ici lorsque vous communiquerez avec des employeurs.';

  @override
  String get chatInputHint => 'Écrire un message...';

  @override
  String get chatSend => 'Envoyer';

  @override
  String chatMinutesAgo(int count) {
    return 'il y a $count min';
  }

  @override
  String chatHoursAgo(int count) {
    return 'il y a $count h';
  }

  @override
  String get chatYesterday => 'Hier';

  @override
  String chatDaysAgo(int count) {
    return 'il y a $count jours';
  }

  @override
  String get chatNoMessages =>
      'Pas encore de messages.\nÉcrivez le premier message !';

  @override
  String get chatNewInfo =>
      'Les nouveaux messages sont créés automatiquement lors des candidatures';

  @override
  String get notificationsTitle => 'Notifications';

  @override
  String get notificationsActiveAlerts => 'Alertes emploi actives';

  @override
  String get notificationsNoAlerts => 'Aucune alerte.';

  @override
  String get notificationsCreateAlert => 'Créer une nouvelle alerte';

  @override
  String get notificationsSearchQuery =>
      'Terme de recherche (ex. développeur logiciel)';

  @override
  String get notificationsCategoryOptional => 'Catégorie (facultatif)';

  @override
  String get notificationsLocationOptional => 'Lieu (facultatif)';

  @override
  String get notificationsCreateButton => 'Créer l\'alerte';

  @override
  String notificationsAlertCreated(String query) {
    return 'Alerte créée : \"$query\"';
  }

  @override
  String get notificationsRecentTitle => 'Notifications récentes';

  @override
  String get notificationsViewEmail => 'Voir l\'e-mail';

  @override
  String get notificationsEmailPreview => 'Aperçu de l\'e-mail';

  @override
  String get notificationsNewOffers => 'Nouvelles offres d\'emploi pour vous !';

  @override
  String get notificationsManage => 'Gérer les notifications';

  @override
  String get notificationsViewDetails => 'Voir les détails';

  @override
  String get settingsTitle => 'Paramètres';

  @override
  String get settingsLanguage => 'Langue';

  @override
  String get settingsDarkMode => 'Mode sombre';

  @override
  String get settingsNotifications => 'Notifications';

  @override
  String get settingsAccount => 'Gérer le compte';

  @override
  String get settingsSupport => 'Aide & Support';

  @override
  String get settingsPrivacy => 'Confidentialité';

  @override
  String get settingsTerms => 'Conditions d\'utilisation';

  @override
  String get settingsAbout => 'À propos de bewerbi.tn';

  @override
  String get settingsVersion => 'v1.0.0';

  @override
  String get settingsAccountSection => 'COMPTE';

  @override
  String get settingsAppSection => 'APPLICATION';

  @override
  String get settingsLegalSection => 'MENTIONS LÉGALES';

  @override
  String get settingsFooter => 'bewerbi.tn v1.0.0 | Fait avec amour en Tunisie';

  @override
  String get accountTitle => 'Gérer le compte';

  @override
  String get accountChangeEmail => 'Changer l\'e-mail';

  @override
  String get accountCurrentEmail => 'E-mail actuel';

  @override
  String get accountNewEmail => 'Nouvel e-mail';

  @override
  String get accountNewEmailPlaceholder => 'nouveau.email@exemple.com';

  @override
  String get accountChange => 'Modifier';

  @override
  String get accountChangePassword => 'Changer le mot de passe';

  @override
  String get accountCurrentPassword => 'Mot de passe actuel';

  @override
  String get accountNewPassword => 'Nouveau mot de passe';

  @override
  String get accountConfirmNewPassword => 'Confirmer le mot de passe';

  @override
  String get accountNewPasswordPlaceholder => '8 caractères minimum';

  @override
  String get accountConfirmPasswordPlaceholder => 'Répéter le mot de passe';

  @override
  String get accountEmailVerification => 'Vérification de l\'e-mail';

  @override
  String get accountVerified => 'Vérifié';

  @override
  String get accountNotVerified => 'Non vérifié';

  @override
  String get accountSendVerification => 'Envoyer l\'e-mail de confirmation';

  @override
  String get accountDataExport => 'Export des données';

  @override
  String get accountDataExportDescription =>
      'Téléchargez une copie de toutes vos données enregistrées.';

  @override
  String get accountExportButton => 'Télécharger mes données';

  @override
  String get accountDeleteAccount => 'Supprimer le compte';

  @override
  String get accountDeleteWarning =>
      'La suppression de votre compte entraînera la suppression définitive de toutes vos données.';

  @override
  String get accountDeleteButton => 'Supprimer le compte définitivement';

  @override
  String get accountDeleteConfirm => 'Êtes-vous sûr ?';

  @override
  String get accountDeleteInstruction => 'Tapez \"SUPPRIMER\" pour confirmer :';

  @override
  String get accountDeletePlaceholder => 'SUPPRIMER';

  @override
  String get accountDeleteIrreversible =>
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.';

  @override
  String get accountDeleted => 'Compte supprimé';

  @override
  String accountEmailConfirmSent(String email) {
    return 'E-mail de confirmation envoyé à $email (démo)';
  }

  @override
  String get accountPasswordChanged => 'Mot de passe modifié avec succès';

  @override
  String get accountVerificationSent => 'E-mail de confirmation envoyé (démo)';

  @override
  String get accountExportPreparing =>
      'Préparation de l\'export des données... (démo)';

  @override
  String get accountInvalidEmail => 'Veuillez entrer une adresse e-mail valide';

  @override
  String get accountEnterCurrentPassword =>
      'Veuillez entrer votre mot de passe actuel';

  @override
  String get accountPasswordTooShort =>
      'Le mot de passe doit contenir au moins 8 caractères';

  @override
  String get accountPasswordsMismatch =>
      'Les mots de passe ne correspondent pas';

  @override
  String get employerDashboard => 'Tableau de bord';

  @override
  String get employerActiveJobs => 'Postes actifs';

  @override
  String get employerTotalApplications => 'Candidatures';

  @override
  String get employerNewThisWeek => 'Nouveau cette semaine';

  @override
  String get employerRecentApplications => 'Dernières candidatures';

  @override
  String get employerCreateListing => 'Créer un nouveau poste';

  @override
  String get employerMyListings => 'Mes annonces';

  @override
  String get employerEditListing => 'Modifier le poste';

  @override
  String get employerPublish => 'Publier';

  @override
  String get employerSaveChanges => 'Enregistrer';

  @override
  String get employerCloseListing => 'Fermer le poste';

  @override
  String get employerActivateListing => 'Activer le poste';

  @override
  String get employerApplicants => 'Candidatures';

  @override
  String get employerAccept => 'Accepter';

  @override
  String get employerReject => 'Refuser';

  @override
  String get employerTopCandidate => 'Meilleur candidat';

  @override
  String get employerGoodMatch => 'Bonne correspondance';

  @override
  String get employerSuitable => 'Convenable';

  @override
  String get employerReview => 'Examiner';

  @override
  String get employerCandidateScoring =>
      'Candidats classés par score de correspondance';

  @override
  String get employerCompanyProfile => 'Profil de l\'entreprise';

  @override
  String get employerNoApplications => 'Pas encore de candidatures';

  @override
  String get employerNoListings => 'Aucune annonce';

  @override
  String get employerNoListingsSubtitle => 'Créez votre première annonce.';

  @override
  String get employerListingPublished => 'Poste publié avec succès !';

  @override
  String get employerFillRequired =>
      'Veuillez remplir tous les champs obligatoires.';

  @override
  String get employerListingTitle => 'Titre';

  @override
  String get employerListingTitlePlaceholder =>
      'ex. Développeur Full-Stack (H/F)';

  @override
  String get employerListingCategory => 'Catégorie';

  @override
  String get employerListingType => 'Type';

  @override
  String get employerListingLocation => 'Lieu';

  @override
  String get employerListingLocationPlaceholder => 'ex. Berlin, Munich';

  @override
  String get employerListingSalary => 'Fourchette salariale (facultatif)';

  @override
  String get employerListingSalaryPlaceholder => 'ex. 45 000 - 60 000 €';

  @override
  String get employerListingGermanLevel => 'Niveau d\'allemand';

  @override
  String get employerListingDescription => 'Description';

  @override
  String get employerListingDescriptionPlaceholder => 'Décrivez le poste...';

  @override
  String get employerListingRequirements => 'Exigences';

  @override
  String get employerListingRequirementsPlaceholder =>
      'Quelles exigences doivent être remplies ?';

  @override
  String get adminUsers => 'Gestion des utilisateurs';

  @override
  String get adminListings => 'Gestion des postes';

  @override
  String get adminReports => 'Statistiques';

  @override
  String get adminAll => 'Tous';

  @override
  String get adminApplicants => 'Candidats';

  @override
  String get adminEmployers => 'Employeurs';

  @override
  String get adminAdmins => 'Admins';

  @override
  String get adminActive => 'Actif';

  @override
  String get adminClosed => 'Fermé';

  @override
  String get adminTotalUsers => 'Total utilisateurs';

  @override
  String get adminActiveJobs => 'Postes actifs';

  @override
  String get adminTotalApplications => 'Candidatures';

  @override
  String get adminAcceptedApps => 'Accepté';

  @override
  String get adminRejectedApps => 'Refusé';

  @override
  String get adminReviewedApps => 'En cours d\'examen';

  @override
  String get onboardingSkip => 'Passer';

  @override
  String get onboardingNext => 'Suivant';

  @override
  String get onboardingGetStarted => 'C\'est parti !';

  @override
  String get onboardingTitle1 => 'Votre pont vers l\'Allemagne';

  @override
  String get onboardingSubtitle1 =>
      'Trouvez des emplois, des formations et des cours de langue en Allemagne – spécialement pour les professionnels tunisiens.';

  @override
  String get onboardingTitle2 => 'Créez votre profil';

  @override
  String get onboardingSubtitle2 =>
      'Téléchargez votre CV, ajoutez vos expériences et laissez les employeurs vous trouver.';

  @override
  String get onboardingTitle3 => 'Postulez en un clic';

  @override
  String get onboardingSubtitle3 =>
      'Envoyez votre candidature directement aux employeurs allemands et suivez le statut en temps réel.';

  @override
  String get legalPrivacy => 'Politique de confidentialité';

  @override
  String get legalTerms => 'Conditions d\'utilisation';

  @override
  String get legalImpressum => 'Mentions légales';

  @override
  String get legalSupport => 'Aide & Support';

  @override
  String get legalFaq => 'Questions fréquentes';

  @override
  String get legalContact => 'Contact';

  @override
  String get legalFeedback => 'Envoyer un commentaire';

  @override
  String get legalFeedbackHint =>
      'Votre retour nous aide à améliorer l\'application...';

  @override
  String get legalFeedbackSent => 'Merci pour votre retour !';

  @override
  String get errorGeneral => 'Une erreur est survenue';

  @override
  String get errorNetwork =>
      'Veuillez vérifier votre connexion internet et réessayer.';

  @override
  String get errorRetry => 'Réessayer';

  @override
  String get navHome => 'Accueil';

  @override
  String get navSearch => 'Recherche';

  @override
  String get navApplications => 'Candidatures';

  @override
  String get navFavorites => 'Favoris';

  @override
  String get navProfile => 'Profil';

  @override
  String get navSettings => 'Paramètres';

  @override
  String get navMessages => 'Messages';
}
