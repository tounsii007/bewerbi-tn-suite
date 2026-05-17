-- Iter 67: HIBP-derived "password appears in a known breach" error.
-- Only emitted when bewerbi.security.password.breach-check.enabled=true.
INSERT INTO messages (locale, namespace, key, value) VALUES
  ('de','default','error.auth.password.weak.breached',
   'Dieses Passwort taucht in bekannten Datenlecks auf. Bitte wähle ein anderes.'),
  ('fr','default','error.auth.password.weak.breached',
   'Ce mot de passe figure dans des fuites de données connues. Choisissez-en un autre.'),
  ('ar','default','error.auth.password.weak.breached',
   'كلمة المرور هذه ظهرت في تسريبات بيانات معروفة. الرجاء اختيار كلمة مرور أخرى.');
