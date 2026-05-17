-- ============================================================
-- "New sign-in detected" mail (Iter 76).
-- Args: {0}=first-name, {1}=device label, {2}=IP, {3}=settings URL.
-- ============================================================

INSERT INTO messages (locale, namespace, key, value) VALUES
  ('de','default','email.new-device.subject','bewerbi.tn — Neue Anmeldung erkannt'),
  ('de','default','email.new-device.body','Hallo {0},

eine neue Anmeldung auf deinem bewerbi.tn-Konto wurde gerade registriert:

  Gerät: {1}
  IP-Adresse: {2}

Warst du das? Dann kannst du diese Nachricht ignorieren.

Wenn nicht: Öffne sofort deine Einstellungen, beende die fremde Sitzung
und setze dein Passwort zurück:

  {3}

Dein bewerbi.tn-Team'),

  ('fr','default','email.new-device.subject','bewerbi.tn — Nouvelle connexion détectée'),
  ('fr','default','email.new-device.body','Bonjour {0},

Une nouvelle connexion à votre compte bewerbi.tn vient d''être enregistrée :

  Appareil : {1}
  Adresse IP : {2}

Si c''était bien vous, vous pouvez ignorer cet e-mail.

Sinon, ouvrez immédiatement vos paramètres, terminez la session inconnue
et réinitialisez votre mot de passe :

  {3}

L''équipe bewerbi.tn'),

  ('ar','default','email.new-device.subject','bewerbi.tn — تسجيل دخول جديد'),
  ('ar','default','email.new-device.body','مرحبًا {0}،

تم تسجيل دخول جديد إلى حسابك على bewerbi.tn:

  الجهاز: {1}
  عنوان IP: {2}

إذا كنت أنت، يمكنك تجاهل هذه الرسالة.

إذا لم تكن أنت، افتح الإعدادات فورًا، أنهِ الجلسة غير المعروفة وأعد تعيين
كلمة المرور:

  {3}

فريق bewerbi.tn');
