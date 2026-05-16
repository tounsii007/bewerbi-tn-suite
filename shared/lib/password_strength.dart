/// Dart port of `password-strength.ts`. Same scoring rubric, identical
/// suggestion IDs — see shared/lib/README.md for the parity rules.
class PasswordStrengthResult {
  const PasswordStrengthResult({
    required this.score,
    required this.label,
    required this.suggestions,
  });

  /// 0 = very weak, 4 = very strong.
  final int score;

  /// Stable string ID — translate client-side, do not show directly.
  final String label;

  /// Stable suggestion IDs (i18n key suffix:
  /// `auth.password.suggest.<id>`). Empty when score >= 3.
  final List<String> suggestions;
}

const _common = <String>{
  'password',
  'passwort',
  '123456',
  '12345678',
  'qwerty',
  'azerty',
  'abc123',
  'letmein',
  'iloveyou',
  'admin',
  'welcome',
  'monkey',
  'dragon',
  'bewerbi',
  'tunisia',
  'deutschland',
};

int _classesPresent(String input) {
  var c = 0;
  if (RegExp(r'[a-z]').hasMatch(input)) c++;
  if (RegExp(r'[A-Z]').hasMatch(input)) c++;
  if (RegExp(r'[0-9]').hasMatch(input)) c++;
  if (RegExp(r'[^A-Za-z0-9]').hasMatch(input)) c++;
  return c;
}

bool _hasSequentialRun(String input) {
  for (var i = 0; i < input.length - 2; i++) {
    final a = input.codeUnitAt(i);
    final b = input.codeUnitAt(i + 1);
    final c = input.codeUnitAt(i + 2);
    if (b - a == 1 && c - b == 1) return true;
  }
  return false;
}

bool _hasRepeatRun(String input) => RegExp(r'(.)\1\1').hasMatch(input);

String _labelFor(int score) {
  switch (score) {
    case 0:
      return 'very-weak';
    case 1:
      return 'weak';
    case 2:
      return 'fair';
    case 3:
      return 'strong';
    default:
      return 'very-strong';
  }
}

PasswordStrengthResult evaluatePassword(String input) {
  final value = input;
  final suggestions = <String>[];

  var raw = 0;
  if (value.length >= 8) raw += 1;
  if (value.length >= 12) raw += 1;

  final classes = _classesPresent(value);
  if (classes >= 3) raw += 1;
  if (classes == 4 && value.length >= 10) raw += 1;

  if (_hasSequentialRun(value) || _hasRepeatRun(value)) raw -= 1;
  if (_common.contains(value.toLowerCase())) raw -= 1;

  if (value.length < 8) suggestions.add('length');
  if (classes < 3) suggestions.add('mixClasses');
  if (_hasSequentialRun(value)) suggestions.add('noSequential');
  if (_hasRepeatRun(value)) suggestions.add('noRepeats');
  if (_common.contains(value.toLowerCase())) suggestions.add('notCommon');

  final score = raw.clamp(0, 4);
  return PasswordStrengthResult(
    score: score,
    label: _labelFor(score),
    suggestions: suggestions,
  );
}
