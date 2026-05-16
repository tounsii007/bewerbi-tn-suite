package tn.bewerbi.common.security;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Java port of {@code shared/lib/password-strength.ts}. Same scoring rubric
 * and suggestion IDs — see {@code shared/lib/README.md} for parity rules.
 *
 * <p>Used by identity-service to reject obviously weak passwords on
 * {@code /register} and {@code /password/reset} with a 422 carrying a
 * structured suggestion list, so the client can localise the hints.
 */
public final class PasswordStrength {

    /** Stable result. Score is in [0,4]; label is the matching stable id. */
    public record Result(int score, String label, List<String> suggestions) {}

    private static final Set<String> COMMON = Set.of(
            "password", "passwort", "123456", "12345678",
            "qwerty", "azerty", "abc123", "letmein", "iloveyou",
            "admin", "welcome", "monkey", "dragon",
            "bewerbi", "tunisia", "deutschland");

    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SYMBOL = Pattern.compile("[^A-Za-z0-9]");
    private static final Pattern REPEAT = Pattern.compile("(.)\\1\\1");

    private PasswordStrength() {}

    public static Result evaluate(String input) {
        String value = input == null ? "" : input;
        List<String> suggestions = new ArrayList<>(5);

        int raw = 0;
        if (value.length() >= 8) raw += 1;
        if (value.length() >= 12) raw += 1;

        int classes = classesPresent(value);
        if (classes >= 3) raw += 1;
        if (classes == 4 && value.length() >= 10) raw += 1;

        boolean seq = hasSequentialRun(value);
        boolean rep = hasRepeatRun(value);
        if (seq || rep) raw -= 1;

        boolean common = COMMON.contains(value.toLowerCase());
        if (common) raw -= 1;

        if (value.length() < 8) suggestions.add("length");
        if (classes < 3) suggestions.add("mixClasses");
        if (seq) suggestions.add("noSequential");
        if (rep) suggestions.add("noRepeats");
        if (common) suggestions.add("notCommon");

        int score = Math.max(0, Math.min(4, raw));
        return new Result(score, labelFor(score), List.copyOf(suggestions));
    }

    private static int classesPresent(String s) {
        int c = 0;
        if (LOWER.matcher(s).find()) c++;
        if (UPPER.matcher(s).find()) c++;
        if (DIGIT.matcher(s).find()) c++;
        if (SYMBOL.matcher(s).find()) c++;
        return c;
    }

    private static boolean hasSequentialRun(String s) {
        for (int i = 0; i < s.length() - 2; i++) {
            int a = s.charAt(i);
            int b = s.charAt(i + 1);
            int c = s.charAt(i + 2);
            if (b - a == 1 && c - b == 1) return true;
        }
        return false;
    }

    private static boolean hasRepeatRun(String s) {
        return REPEAT.matcher(s).find();
    }

    private static String labelFor(int score) {
        return switch (score) {
            case 0 -> "very-weak";
            case 1 -> "weak";
            case 2 -> "fair";
            case 3 -> "strong";
            default -> "very-strong";
        };
    }
}
