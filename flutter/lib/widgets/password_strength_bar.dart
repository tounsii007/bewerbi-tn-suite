import 'package:flutter/material.dart';
import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/services/password_strength.dart';

/// Compact strength meter intended to sit directly under a plain TextField
/// (i.e. screens that don't go through AppPasswordField). Same scoring as
/// the web and mobile meters — what shows green here will also pass the
/// backend's 422 gate added in Iter 30.
class PasswordStrengthBar extends StatelessWidget {
  const PasswordStrengthBar({super.key, required this.value});

  final String value;

  @override
  Widget build(BuildContext context) {
    if (value.isEmpty) return const SizedBox.shrink();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final result = evaluatePassword(value);

    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(4, (i) {
              final filled = i < result.score;
              return Expanded(
                child: Padding(
                  padding: EdgeInsets.only(right: i < 3 ? 4 : 0),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 4,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(2),
                      color: filled
                          ? _strengthColor(result.score)
                          : (isDark ? AppColors.darkBorder : AppColors.gray200),
                    ),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _labelDe(result.label),
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.gray400 : AppColors.gray500,
                ),
              ),
              if (result.suggestions.isNotEmpty && result.score < 3)
                Flexible(
                  child: Text(
                    _suggestionDe(result.suggestions.first),
                    textAlign: TextAlign.end,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.gray400,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  static Color _strengthColor(int score) {
    if (score <= 1) return AppColors.error;
    if (score == 2) return AppColors.warning;
    if (score == 3) return AppColors.info;
    return AppColors.success;
  }

  static String _labelDe(String id) {
    switch (id) {
      case 'very-weak':
        return 'Sehr schwach';
      case 'weak':
        return 'Schwach';
      case 'fair':
        return 'Mittel';
      case 'strong':
        return 'Stark';
      default:
        return 'Sehr stark';
    }
  }

  static String _suggestionDe(String id) {
    switch (id) {
      case 'length':
        return 'Mindestens 8 Zeichen.';
      case 'mixClasses':
        return 'Mische Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen.';
      case 'noSequential':
        return 'Keine Folgen wie "abc" oder "123".';
      case 'noRepeats':
        return 'Vermeide drei gleiche Zeichen hintereinander.';
      case 'notCommon':
        return 'Dieses Passwort ist zu weit verbreitet.';
      default:
        return '';
    }
  }
}
