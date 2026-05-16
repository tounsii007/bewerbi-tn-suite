-- ============================================================
-- Translations for the 422 emitted by AuthService.rejectWeakPassword.
-- Each suggestion ID from shared/lib/password-strength.ts maps to one key.
-- ============================================================

INSERT INTO messages (locale, namespace, key, value) VALUES
  ('de','default','error.auth.password.weak.length',       'Passwort zu kurz — mindestens 8 Zeichen.'),
  ('de','default','error.auth.password.weak.mixClasses',   'Bitte mische Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen.'),
  ('de','default','error.auth.password.weak.noSequential', 'Keine aufeinanderfolgenden Zeichen wie "abc" oder "123".'),
  ('de','default','error.auth.password.weak.noRepeats',    'Vermeide drei gleiche Zeichen hintereinander.'),
  ('de','default','error.auth.password.weak.notCommon',    'Dieses Passwort ist zu weit verbreitet.'),
  ('de','default','error.auth.password.weak.weak',         'Passwort zu schwach.'),

  ('fr','default','error.auth.password.weak.length',       'Mot de passe trop court — 8 caractères minimum.'),
  ('fr','default','error.auth.password.weak.mixClasses',   'Mélangez majuscules, minuscules, chiffres et caractères spéciaux.'),
  ('fr','default','error.auth.password.weak.noSequential', 'Évitez les suites comme « abc » ou « 123 ».'),
  ('fr','default','error.auth.password.weak.noRepeats',    'Évitez trois caractères identiques d''affilée.'),
  ('fr','default','error.auth.password.weak.notCommon',    'Ce mot de passe est trop courant.'),
  ('fr','default','error.auth.password.weak.weak',         'Mot de passe trop faible.'),

  ('ar','default','error.auth.password.weak.length',       'كلمة المرور قصيرة جدًا — 8 أحرف على الأقل.'),
  ('ar','default','error.auth.password.weak.mixClasses',   'استخدم أحرفًا كبيرة وصغيرة وأرقامًا ورموزًا.'),
  ('ar','default','error.auth.password.weak.noSequential', 'تجنب التسلسلات مثل "abc" أو "123".'),
  ('ar','default','error.auth.password.weak.noRepeats',    'تجنب تكرار نفس الحرف ثلاث مرات.'),
  ('ar','default','error.auth.password.weak.notCommon',    'كلمة المرور هذه شائعة جدًا.'),
  ('ar','default','error.auth.password.weak.weak',         'كلمة المرور ضعيفة جدًا.');
