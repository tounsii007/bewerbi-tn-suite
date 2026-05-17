-- Iter 68: reject reuse of the current password on reset / change.
INSERT INTO messages (locale, namespace, key, value) VALUES
  ('de','default','error.auth.password.reused',
   'Das neue Passwort muss sich vom aktuellen unterscheiden.'),
  ('fr','default','error.auth.password.reused',
   'Le nouveau mot de passe doit être différent de l''actuel.'),
  ('ar','default','error.auth.password.reused',
   'يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية.');
