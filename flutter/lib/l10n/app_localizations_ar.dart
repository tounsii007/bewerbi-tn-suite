// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'bewerbi.tn';

  @override
  String get appSlogan => 'جسرك نحو ألمانيا';

  @override
  String get commonLoading => 'جاري التحميل...';

  @override
  String get commonSave => 'حفظ';

  @override
  String get commonCancel => 'إلغاء';

  @override
  String get commonDelete => 'حذف';

  @override
  String get commonEdit => 'تعديل';

  @override
  String get commonBack => 'رجوع';

  @override
  String get commonNext => 'التالي';

  @override
  String get commonSearch => 'بحث';

  @override
  String get commonFilter => 'تصفية';

  @override
  String get commonApply => 'تقديم';

  @override
  String get commonSubmit => 'إرسال';

  @override
  String get commonClose => 'إغلاق';

  @override
  String get commonYes => 'نعم';

  @override
  String get commonNo => 'لا';

  @override
  String get commonError => 'خطأ';

  @override
  String get commonSuccess => 'نجاح';

  @override
  String get commonRetry => 'إعادة المحاولة';

  @override
  String get commonNoResults => 'لا توجد نتائج';

  @override
  String get commonSeeAll => 'عرض الكل';

  @override
  String get commonRequired => 'حقل مطلوب';

  @override
  String get commonOptional => 'اختياري';

  @override
  String get commonAdd => 'إضافة';

  @override
  String get commonRemove => 'إزالة';

  @override
  String get commonRestore => 'استعادة';

  @override
  String get commonShare => 'مشاركة';

  @override
  String get commonSend => 'إرسال';

  @override
  String get commonNow => 'الآن';

  @override
  String get commonEnabled => 'مفعّل';

  @override
  String get commonDisabled => 'معطّل';

  @override
  String get commonUnknown => 'غير معروف';

  @override
  String get authLogin => 'تسجيل الدخول';

  @override
  String get authRegister => 'إنشاء حساب';

  @override
  String get authLogout => 'تسجيل الخروج';

  @override
  String get authEmail => 'البريد الإلكتروني';

  @override
  String get authPassword => 'كلمة المرور';

  @override
  String get authConfirmPassword => 'تأكيد كلمة المرور';

  @override
  String get authForgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get authResetPassword => 'إعادة تعيين كلمة المرور';

  @override
  String get authFirstName => 'الاسم الأول';

  @override
  String get authLastName => 'اسم العائلة';

  @override
  String get authIAmA => 'أنا...';

  @override
  String get authApplicant => 'متقدم';

  @override
  String get authEmployer => 'صاحب عمل';

  @override
  String get authNoAccount => 'ليس لديك حساب؟';

  @override
  String get authHasAccount => 'لديك حساب بالفعل؟';

  @override
  String get authWelcome => 'مرحباً';

  @override
  String get authSubtitle => 'جسرك نحو ألمانيا';

  @override
  String get authOrLoginWith => 'أو';

  @override
  String get authGoogleLogin => 'تسجيل الدخول بحساب Google';

  @override
  String get authFacebookLogin => 'تسجيل الدخول بحساب Facebook';

  @override
  String get authDemoMode => 'الوضع التجريبي';

  @override
  String get authAdmin => 'مدير';

  @override
  String get authPasswordMinLength => '8 أحرف على الأقل';

  @override
  String get authPasswordsNoMatch => 'كلمتا المرور غير متطابقتين.';

  @override
  String get authResetSent => 'تم إرسال البريد الإلكتروني!';

  @override
  String get authResetInstructions =>
      'لقد أرسلنا رابط إعادة تعيين كلمة المرور.';

  @override
  String get authResetSendLink => 'إرسال الرابط';

  @override
  String get authResetEmailPlaceholder => 'البريد الإلكتروني';

  @override
  String get authResetDescription =>
      'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.';

  @override
  String get authBackToLogin => 'العودة إلى تسجيل الدخول';

  @override
  String get authCreateAccount => 'أنشئ حسابك على bewerbi.tn';

  @override
  String get authRegisterSuccess => 'تم التسجيل بنجاح! يرجى تسجيل الدخول.';

  @override
  String get authFillAllFields => 'يرجى ملء جميع الحقول.';

  @override
  String get authPasswordMinLengthError =>
      'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';

  @override
  String get authEnterEmail => 'يرجى إدخال بريدك الإلكتروني.';

  @override
  String get authGoogleDemoMode => 'تسجيل دخول Google (وضع تجريبي)';

  @override
  String get authFacebookDemoMode => 'تسجيل دخول Facebook (وضع تجريبي)';

  @override
  String homeGreeting(String name) {
    return 'مرحباً، $name!';
  }

  @override
  String get homeGreetingMorning => 'صباح الخير';

  @override
  String get homeGreetingAfternoon => 'مساء الخير';

  @override
  String get homeGreetingEvening => 'مساء الخير';

  @override
  String get homeApplications => 'الطلبات';

  @override
  String get homeFavorites => 'المفضلة';

  @override
  String get homeOpenPositions => 'وظائف شاغرة';

  @override
  String homeProfileComplete(int percent) {
    return 'الملف الشخصي مكتمل $percent%';
  }

  @override
  String get homeProfileCompleteness => 'اكتمال الملف الشخصي';

  @override
  String get homeComplete => 'مكتمل';

  @override
  String get homeCategories => 'الفئات';

  @override
  String get homeRecommended => 'موصى به لك';

  @override
  String get homeLatest => 'أحدث العروض';

  @override
  String get homeMatch => 'تطابق';

  @override
  String get homeNoOffers => 'لا توجد عروض متاحة';

  @override
  String get homeUser => 'مستخدم';

  @override
  String get jobsTitle => 'الوظائف';

  @override
  String get jobsSearch => 'البحث عن وظائف...';

  @override
  String jobsResults(int count) {
    return '$count نتيجة';
  }

  @override
  String get jobsClearAll => 'مسح الكل';

  @override
  String get jobsCategory => 'الفئة';

  @override
  String get jobsType => 'النوع';

  @override
  String get jobsLocation => 'الموقع';

  @override
  String get jobsSalary => 'الراتب';

  @override
  String get jobsGermanLevel => 'مستوى اللغة الألمانية';

  @override
  String get jobsGermanLevelMin => 'المعرفة باللغة الألمانية (الحد الأدنى)';

  @override
  String get jobsMinSalary => 'الحد الأدنى للراتب';

  @override
  String get jobsRequirements => 'المتطلبات';

  @override
  String get jobsDescription => 'الوصف';

  @override
  String get jobsApplyNow => 'تقدم الآن';

  @override
  String get jobsApplied => 'تم التقديم مسبقاً';

  @override
  String get jobsContactEmployer => 'التواصل مع صاحب العمل';

  @override
  String get jobsShareCopied => 'تم نسخ الرابط! شاركه الآن.';

  @override
  String get jobsIt => 'تكنولوجيا المعلومات والبرمجيات';

  @override
  String get jobsItShort => 'تكنولوجيا المعلومات';

  @override
  String get jobsPflege => 'التمريض والرعاية الصحية';

  @override
  String get jobsPflegeShort => 'التمريض';

  @override
  String get jobsTransport => 'النقل والخدمات اللوجستية';

  @override
  String get jobsTransportShort => 'النقل';

  @override
  String get jobsSonstige => 'أخرى';

  @override
  String get jobsJob => 'وظيفة';

  @override
  String get jobsAusbildung => 'تدريب مهني';

  @override
  String get jobsStudium => 'دراسة';

  @override
  String get jobsSprachkurs => 'دورة لغوية';

  @override
  String get jobsPostedBy => 'نشرت بواسطة';

  @override
  String get jobsToday => 'اليوم';

  @override
  String get jobsYesterday => 'أمس';

  @override
  String jobsDaysAgo(int days) {
    return 'منذ $days أيام';
  }

  @override
  String get jobsLoadMore => 'تحميل المزيد';

  @override
  String get jobsNotFound => 'لم يتم العثور على الوظيفة';

  @override
  String get jobsNoResults => 'لم يتم العثور على نتائج';

  @override
  String get jobsNoResultsHint => 'جرّب كلمات بحث أو فلاتر مختلفة';

  @override
  String get jobsCategoryLabel => 'الفئة';

  @override
  String get jobsTypeLabel => 'النوع';

  @override
  String get jobsLocationLabel => 'الموقع';

  @override
  String get jobsSalaryNegotiable => 'الراتب قابل للتفاوض';

  @override
  String get jobsLocationPlaceholder => 'برلين، ميونخ...';

  @override
  String get applyTitle => 'إرسال الطلب';

  @override
  String get applyCoverLetter => 'خطاب التقديم';

  @override
  String get applyCoverLetterHint =>
      'السيدات والسادة الأعزاء،\n\nأتقدم بطلبي باهتمام كبير...';

  @override
  String get applyUploadCv => 'السيرة الذاتية';

  @override
  String get applyUploadHint => 'تحميل ملف PDF أو Word';

  @override
  String get applyCustomQuestions => 'أسئلة إضافية من صاحب العمل';

  @override
  String applyQuestionCount(int count) {
    return 'لدى صاحب العمل $count سؤال إضافي';
  }

  @override
  String applyQuestionCountPlural(int count) {
    return 'لدى صاحب العمل $count أسئلة إضافية';
  }

  @override
  String get applyYourAnswer => 'إجابتك...';

  @override
  String get applySubmit => 'إرسال الطلب';

  @override
  String get applySuccess => 'تم إرسال الطلب بنجاح!';

  @override
  String get applyAlreadyApplied => 'لقد تقدمت بالفعل لهذه الوظيفة.';

  @override
  String applyCvSelected(String name) {
    return 'تم اختيار السيرة الذاتية \"$name\" (تجريبي)';
  }

  @override
  String get applicationsTitle => 'طلباتي';

  @override
  String applicationsCount(int count) {
    return '$count طلب';
  }

  @override
  String applicationsCountPlural(int count) {
    return '$count طلبات';
  }

  @override
  String get applicationsPending => 'قيد الانتظار';

  @override
  String get applicationsReviewed => 'قيد المراجعة';

  @override
  String get applicationsAccepted => 'مقبول';

  @override
  String get applicationsRejected => 'مرفوض';

  @override
  String applicationsAppliedOn(String date) {
    return 'تم التقديم في $date';
  }

  @override
  String get applicationsNoApplications => 'لا توجد طلبات بعد';

  @override
  String get applicationsEmptySubtitle => 'اكتشف العروض الوظيفية وتقدم لها!';

  @override
  String get applicationsUnknownJob => 'وظيفة غير معروفة';

  @override
  String get favoritesTitle => 'المفضلة';

  @override
  String favoritesCount(int count) {
    return '$count وظائف محفوظة';
  }

  @override
  String get favoritesEmpty => 'لا توجد مفضلات بعد';

  @override
  String get favoritesEmptySubtitle => 'احفظ الوظائف لتراها هنا';

  @override
  String get profileTitle => 'ملفي الشخصي';

  @override
  String get profileEdit => 'تعديل الملف الشخصي';

  @override
  String get profileEducation => 'التعليم والدراسة';

  @override
  String get profileExperience => 'الخبرة المهنية';

  @override
  String get profileLanguages => 'المهارات اللغوية';

  @override
  String get profileDocuments => 'المستندات';

  @override
  String profileEntries(int count) {
    return '$count إدخالات';
  }

  @override
  String get profileEntry => 'إدخال واحد';

  @override
  String get profileBio => 'نبذة عني';

  @override
  String get profileSaveChanges => 'حفظ التغييرات';

  @override
  String get profileDiscardChanges => 'تجاهل';

  @override
  String get profileDiscardConfirm => 'تجاهل التغييرات؟';

  @override
  String get profileDiscardMessage => 'ستفقد تغييراتك.';

  @override
  String get profileSaved => 'تم حفظ الملف الشخصي بنجاح';

  @override
  String get profilePhone => 'رقم الهاتف';

  @override
  String get profileCity => 'المدينة';

  @override
  String get profileCountry => 'البلد';

  @override
  String get profileUser => 'مستخدم';

  @override
  String get educationTitle => 'التعليم والدراسة';

  @override
  String get educationAdd => 'إضافة تعليم';

  @override
  String get educationDegree => 'الشهادة';

  @override
  String get educationInstitution => 'المؤسسة';

  @override
  String get educationFieldOfStudy => 'التخصص';

  @override
  String get educationStartDate => 'تاريخ البدء';

  @override
  String get educationEndDate => 'تاريخ الانتهاء';

  @override
  String get educationCurrent => 'مسجل حالياً';

  @override
  String get educationEmpty => 'لا توجد إدخالات تعليمية';

  @override
  String get educationEmptySubtitle => 'أضف شهاداتك التعليمية';

  @override
  String get experienceTitle => 'الخبرة المهنية';

  @override
  String get experienceAdd => 'إضافة خبرة';

  @override
  String get experiencePosition => 'المنصب';

  @override
  String get experienceCompany => 'الشركة';

  @override
  String get experienceLocation => 'الموقع';

  @override
  String get experienceDescription => 'الوصف';

  @override
  String get experienceCurrent => 'أعمل هنا حالياً';

  @override
  String get experienceEmpty => 'لا توجد خبرة مهنية';

  @override
  String get experienceEmptySubtitle => 'أضف خبراتك المهنية';

  @override
  String get languagesTitle => 'المهارات اللغوية';

  @override
  String get languagesAdd => 'إضافة لغة';

  @override
  String get languagesLanguage => 'اللغة';

  @override
  String get languagesLevel => 'المستوى';

  @override
  String get languagesEmpty => 'لا توجد مهارات لغوية';

  @override
  String get languagesEmptySubtitle => 'أضف مهاراتك اللغوية';

  @override
  String get documentsTitle => 'المستندات';

  @override
  String get documentsAdd => 'إضافة مستند';

  @override
  String get documentsName => 'اسم المستند';

  @override
  String get documentsType => 'نوع المستند';

  @override
  String get documentsCv => 'السيرة الذاتية';

  @override
  String get documentsDiploma => 'شهادة جامعية';

  @override
  String get documentsCertificate => 'شهادة';

  @override
  String get documentsTranscript => 'كشف الدرجات';

  @override
  String get documentsOther => 'أخرى';

  @override
  String get documentsDeleted => 'محذوف';

  @override
  String get documentsRestoreConfirm => 'استعادة';

  @override
  String get documentsPermanentDelete => 'حذف نهائي';

  @override
  String get documentsPermanentDeleteConfirm => 'حذف نهائي؟';

  @override
  String get documentsPermanentDeleteMessage => 'سيتم حذفه نهائياً.';

  @override
  String get documentsDeletedSection => 'المستندات المحذوفة';

  @override
  String get documentsEmpty => 'لا توجد مستندات بعد';

  @override
  String get documentsEmptySubtitle => 'اضغط على + لإضافة مستند';

  @override
  String get documentsAdded => 'تمت إضافة المستند (وضع تجريبي)';

  @override
  String get documentsNamePlaceholder => 'مثال: سيرة_ذاتية_2024.pdf';

  @override
  String get chatTitle => 'الرسائل';

  @override
  String get chatEmpty => 'لا توجد رسائل';

  @override
  String get chatEmptySubtitle =>
      'ستظهر محادثاتك هنا عندما تتواصل مع أصحاب العمل.';

  @override
  String get chatInputHint => 'اكتب رسالة...';

  @override
  String get chatSend => 'إرسال';

  @override
  String chatMinutesAgo(int count) {
    return 'منذ $count دقيقة';
  }

  @override
  String chatHoursAgo(int count) {
    return 'منذ $count ساعة';
  }

  @override
  String get chatYesterday => 'أمس';

  @override
  String chatDaysAgo(int count) {
    return 'منذ $count أيام';
  }

  @override
  String get chatNoMessages => 'لا توجد رسائل بعد.\nاكتب الرسالة الأولى!';

  @override
  String get chatNewInfo => 'تنشأ الرسائل الجديدة تلقائياً عند التقديم';

  @override
  String get notificationsTitle => 'الإشعارات';

  @override
  String get notificationsActiveAlerts => 'تنبيهات الوظائف النشطة';

  @override
  String get notificationsNoAlerts => 'لا توجد تنبيهات.';

  @override
  String get notificationsCreateAlert => 'إنشاء تنبيه جديد';

  @override
  String get notificationsSearchQuery => 'مصطلح البحث (مثال: مطور برامج)';

  @override
  String get notificationsCategoryOptional => 'الفئة (اختياري)';

  @override
  String get notificationsLocationOptional => 'الموقع (اختياري)';

  @override
  String get notificationsCreateButton => 'إنشاء تنبيه';

  @override
  String notificationsAlertCreated(String query) {
    return 'تم إنشاء تنبيه: \"$query\"';
  }

  @override
  String get notificationsRecentTitle => 'الإشعارات الأخيرة';

  @override
  String get notificationsViewEmail => 'عرض البريد الإلكتروني';

  @override
  String get notificationsEmailPreview => 'معاينة البريد الإلكتروني';

  @override
  String get notificationsNewOffers => 'عروض وظيفية جديدة لك!';

  @override
  String get notificationsManage => 'إدارة الإشعارات';

  @override
  String get notificationsViewDetails => 'عرض التفاصيل';

  @override
  String get settingsTitle => 'الإعدادات';

  @override
  String get settingsLanguage => 'اللغة';

  @override
  String get settingsDarkMode => 'الوضع الداكن';

  @override
  String get settingsNotifications => 'الإشعارات';

  @override
  String get settingsAccount => 'إدارة الحساب';

  @override
  String get settingsSupport => 'المساعدة والدعم';

  @override
  String get settingsPrivacy => 'الخصوصية';

  @override
  String get settingsTerms => 'شروط الاستخدام';

  @override
  String get settingsAbout => 'حول bewerbi.tn';

  @override
  String get settingsVersion => 'v1.0.0';

  @override
  String get settingsAccountSection => 'الحساب';

  @override
  String get settingsAppSection => 'التطبيق';

  @override
  String get settingsLegalSection => 'القانوني';

  @override
  String get settingsFooter => 'bewerbi.tn v1.0.0 | صنع بحب في تونس';

  @override
  String get accountTitle => 'إدارة الحساب';

  @override
  String get accountChangeEmail => 'تغيير البريد الإلكتروني';

  @override
  String get accountCurrentEmail => 'البريد الإلكتروني الحالي';

  @override
  String get accountNewEmail => 'البريد الإلكتروني الجديد';

  @override
  String get accountNewEmailPlaceholder => 'email@example.com';

  @override
  String get accountChange => 'تغيير';

  @override
  String get accountChangePassword => 'تغيير كلمة المرور';

  @override
  String get accountCurrentPassword => 'كلمة المرور الحالية';

  @override
  String get accountNewPassword => 'كلمة المرور الجديدة';

  @override
  String get accountConfirmNewPassword => 'تأكيد كلمة المرور';

  @override
  String get accountNewPasswordPlaceholder => '8 أحرف على الأقل';

  @override
  String get accountConfirmPasswordPlaceholder => 'إعادة كلمة المرور';

  @override
  String get accountEmailVerification => 'التحقق من البريد الإلكتروني';

  @override
  String get accountVerified => 'تم التحقق';

  @override
  String get accountNotVerified => 'لم يتم التحقق';

  @override
  String get accountSendVerification => 'إرسال بريد التأكيد';

  @override
  String get accountDataExport => 'تصدير البيانات';

  @override
  String get accountDataExportDescription =>
      'قم بتنزيل نسخة من جميع بياناتك المحفوظة.';

  @override
  String get accountExportButton => 'تنزيل بياناتي';

  @override
  String get accountDeleteAccount => 'حذف الحساب';

  @override
  String get accountDeleteWarning =>
      'عند حذف حسابك، سيتم حذف جميع بياناتك نهائياً.';

  @override
  String get accountDeleteButton => 'حذف الحساب نهائياً';

  @override
  String get accountDeleteConfirm => 'هل أنت متأكد؟';

  @override
  String get accountDeleteInstruction => 'اكتب \"حذف\" للتأكيد:';

  @override
  String get accountDeletePlaceholder => 'حذف';

  @override
  String get accountDeleteIrreversible =>
      'لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع بياناتك نهائياً.';

  @override
  String get accountDeleted => 'تم حذف الحساب';

  @override
  String accountEmailConfirmSent(String email) {
    return 'تم إرسال بريد التأكيد إلى $email (تجريبي)';
  }

  @override
  String get accountPasswordChanged => 'تم تغيير كلمة المرور بنجاح';

  @override
  String get accountVerificationSent => 'تم إرسال بريد التأكيد (تجريبي)';

  @override
  String get accountExportPreparing => 'جاري تجهيز تصدير البيانات... (تجريبي)';

  @override
  String get accountInvalidEmail => 'يرجى إدخال بريد إلكتروني صالح';

  @override
  String get accountEnterCurrentPassword => 'يرجى إدخال كلمة المرور الحالية';

  @override
  String get accountPasswordTooShort =>
      'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل';

  @override
  String get accountPasswordsMismatch => 'كلمتا المرور غير متطابقتين';

  @override
  String get employerDashboard => 'لوحة التحكم';

  @override
  String get employerActiveJobs => 'الوظائف النشطة';

  @override
  String get employerTotalApplications => 'الطلبات';

  @override
  String get employerNewThisWeek => 'جديد هذا الأسبوع';

  @override
  String get employerRecentApplications => 'آخر الطلبات';

  @override
  String get employerCreateListing => 'إنشاء وظيفة جديدة';

  @override
  String get employerMyListings => 'إعلاناتي الوظيفية';

  @override
  String get employerEditListing => 'تعديل الوظيفة';

  @override
  String get employerPublish => 'نشر';

  @override
  String get employerSaveChanges => 'حفظ';

  @override
  String get employerCloseListing => 'إغلاق الوظيفة';

  @override
  String get employerActivateListing => 'تفعيل الوظيفة';

  @override
  String get employerApplicants => 'الطلبات';

  @override
  String get employerAccept => 'قبول';

  @override
  String get employerReject => 'رفض';

  @override
  String get employerTopCandidate => 'مرشح متميز';

  @override
  String get employerGoodMatch => 'تطابق جيد';

  @override
  String get employerSuitable => 'مناسب';

  @override
  String get employerReview => 'مراجعة';

  @override
  String get employerCandidateScoring => 'المرشحون مرتبون حسب درجة التطابق';

  @override
  String get employerCompanyProfile => 'الملف التعريفي للشركة';

  @override
  String get employerNoApplications => 'لا توجد طلبات بعد';

  @override
  String get employerNoListings => 'لا توجد إعلانات وظيفية';

  @override
  String get employerNoListingsSubtitle => 'أنشئ إعلانك الوظيفي الأول.';

  @override
  String get employerListingPublished => 'تم نشر الوظيفة بنجاح!';

  @override
  String get employerFillRequired => 'يرجى ملء جميع الحقول المطلوبة.';

  @override
  String get employerListingTitle => 'العنوان';

  @override
  String get employerListingTitlePlaceholder =>
      'مثال: مطور Full-Stack (ذكور/إناث)';

  @override
  String get employerListingCategory => 'الفئة';

  @override
  String get employerListingType => 'النوع';

  @override
  String get employerListingLocation => 'الموقع';

  @override
  String get employerListingLocationPlaceholder => 'مثال: برلين، ميونخ';

  @override
  String get employerListingSalary => 'نطاق الراتب (اختياري)';

  @override
  String get employerListingSalaryPlaceholder => 'مثال: 45,000 - 60,000 يورو';

  @override
  String get employerListingGermanLevel => 'مستوى اللغة الألمانية';

  @override
  String get employerListingDescription => 'الوصف';

  @override
  String get employerListingDescriptionPlaceholder => 'صف الوظيفة...';

  @override
  String get employerListingRequirements => 'المتطلبات';

  @override
  String get employerListingRequirementsPlaceholder =>
      'ما هي المتطلبات التي يجب توفرها؟';

  @override
  String get adminUsers => 'إدارة المستخدمين';

  @override
  String get adminListings => 'إدارة الوظائف';

  @override
  String get adminReports => 'الإحصائيات';

  @override
  String get adminAll => 'الكل';

  @override
  String get adminApplicants => 'المتقدمون';

  @override
  String get adminEmployers => 'أصحاب العمل';

  @override
  String get adminAdmins => 'المديرون';

  @override
  String get adminActive => 'نشط';

  @override
  String get adminClosed => 'مغلق';

  @override
  String get adminTotalUsers => 'إجمالي المستخدمين';

  @override
  String get adminActiveJobs => 'الوظائف النشطة';

  @override
  String get adminTotalApplications => 'الطلبات';

  @override
  String get adminAcceptedApps => 'مقبول';

  @override
  String get adminRejectedApps => 'مرفوض';

  @override
  String get adminReviewedApps => 'قيد المراجعة';

  @override
  String get onboardingSkip => 'تخطي';

  @override
  String get onboardingNext => 'التالي';

  @override
  String get onboardingGetStarted => 'لنبدأ';

  @override
  String get onboardingTitle1 => 'جسرك نحو ألمانيا';

  @override
  String get onboardingSubtitle1 =>
      'ابحث عن وظائف وتدريبات ودورات لغوية في ألمانيا – مخصصة للكفاءات التونسية.';

  @override
  String get onboardingTitle2 => 'أنشئ ملفك الشخصي';

  @override
  String get onboardingSubtitle2 =>
      'ارفع سيرتك الذاتية، أضف خبراتك ودع أصحاب العمل يجدونك.';

  @override
  String get onboardingTitle3 => 'تقدم بنقرة واحدة';

  @override
  String get onboardingSubtitle3 =>
      'أرسل طلبك مباشرة إلى أصحاب العمل الألمان وتابع الحالة في الوقت الفعلي.';

  @override
  String get legalPrivacy => 'سياسة الخصوصية';

  @override
  String get legalTerms => 'شروط الاستخدام';

  @override
  String get legalImpressum => 'بيانات الناشر';

  @override
  String get legalSupport => 'المساعدة والدعم';

  @override
  String get legalFaq => 'الأسئلة الشائعة';

  @override
  String get legalContact => 'اتصل بنا';

  @override
  String get legalFeedback => 'إرسال ملاحظات';

  @override
  String get legalFeedbackHint => 'ملاحظاتك تساعدنا في تحسين التطبيق...';

  @override
  String get legalFeedbackSent => 'شكراً لملاحظاتك!';

  @override
  String get errorGeneral => 'حدث خطأ ما';

  @override
  String get errorNetwork =>
      'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';

  @override
  String get errorRetry => 'إعادة المحاولة';

  @override
  String get navHome => 'الرئيسية';

  @override
  String get navSearch => 'بحث';

  @override
  String get navApplications => 'الطلبات';

  @override
  String get navFavorites => 'المفضلة';

  @override
  String get navProfile => 'الملف الشخصي';

  @override
  String get navSettings => 'الإعدادات';

  @override
  String get navMessages => 'الرسائل';
}
