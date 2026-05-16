-- ============================================================
-- Email + UI strings for the password-reset flow (Iter 22).
-- Args: {0} = recipient first name, {1} = reset link.
-- ============================================================

INSERT INTO messages (locale, namespace, key, value) VALUES
  ('de','default','email.password-reset.subject','bewerbi.tn — Passwort zurücksetzen'),
  ('de','default','email.password-reset.body','Hallo {0},

du hast einen Link zum Zurücksetzen deines Passworts angefordert.
Öffne den folgenden Link in deinem Browser — er ist 30 Minuten lang gültig:

{1}

Wenn du das nicht warst, ignoriere diese E-Mail einfach. Dein bestehendes Passwort bleibt unverändert.

Dein bewerbi.tn-Team'),

  ('fr','default','email.password-reset.subject','bewerbi.tn — Réinitialisation du mot de passe'),
  ('fr','default','email.password-reset.body','Bonjour {0},

Vous avez demandé un lien pour réinitialiser votre mot de passe.
Ouvrez le lien suivant dans votre navigateur — il est valable 30 minutes :

{1}

Si ce n''est pas vous, ignorez simplement cet e-mail. Votre mot de passe actuel reste inchangé.

L''équipe bewerbi.tn'),

  ('ar','default','email.password-reset.subject','bewerbi.tn — إعادة تعيين كلمة المرور'),
  ('ar','default','email.password-reset.body','مرحبًا {0}،

لقد طلبت رابطًا لإعادة تعيين كلمة المرور الخاصة بك.
افتح الرابط التالي في متصفحك — وهو صالح لمدة 30 دقيقة:

{1}

إذا لم تكن أنت، فتجاهل هذه الرسالة. ستظل كلمة المرور الحالية كما هي.

فريق bewerbi.tn');

INSERT INTO messages (locale, namespace, key, value) VALUES
  ('de','default','auth.password.reset.requested','Wenn ein Konto mit dieser Adresse existiert, ist gerade ein Link unterwegs.'),
  ('de','default','auth.password.reset.success','Passwort aktualisiert. Du kannst dich jetzt anmelden.'),
  ('fr','default','auth.password.reset.requested','Si un compte est associé à cette adresse, un lien vient d''être envoyé.'),
  ('fr','default','auth.password.reset.success','Mot de passe mis à jour. Vous pouvez vous connecter.'),
  ('ar','default','auth.password.reset.requested','إذا كان هناك حساب مرتبط بهذا البريد، فقد تم إرسال رابط الآن.'),
  ('ar','default','auth.password.reset.success','تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.');
