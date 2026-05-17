package tn.bewerbi.common.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Parity tests for the shared password-strength heuristic. Mirror the
 * fixtures used by the TS and Dart ports under shared/lib so a change
 * to any one rubric will fail the matching fixture in at least one
 * platform.
 */
class PasswordStrengthTest {

    @Test
    void emptyIsVeryWeak() {
        var r = PasswordStrength.evaluate("");
        assertThat(r.score()).isZero();
        assertThat(r.label()).isEqualTo("very-weak");
        assertThat(r.suggestions()).contains("length", "mixClasses");
    }

    @Test
    void shortAlphaIsWeak() {
        var r = PasswordStrength.evaluate("abc");
        assertThat(r.score()).isZero();
        assertThat(r.suggestions()).contains("length", "noSequential");
    }

    @Test
    void commonPasswordPenalised() {
        var r = PasswordStrength.evaluate("password");
        // length>=8 +1, single class only, common -1 → 0
        assertThat(r.score()).isZero();
        assertThat(r.suggestions()).contains("notCommon", "mixClasses");
    }

    @Test
    void mixedClassMediumLengthIsFair() {
        // 8 chars, 4 classes, no sequential run (cde would trigger one),
        // no repeats → len>=8 +1, classes>=3 +1 → 2.
        var r = PasswordStrength.evaluate("Ab1!xq9z");
        assertThat(r.score()).isEqualTo(2);
        assertThat(r.label()).isEqualTo("fair");
    }

    @Test
    void strongMixedLong() {
        // 12 chars, 4 classes, no sequential, no repeats →
        // len>=8 +1, len>=12 +1, classes>=3 +1, len>=10 +1 → 4.
        var r = PasswordStrength.evaluate("Kp9!xq7zM2#v");
        assertThat(r.score()).isEqualTo(4);
        assertThat(r.label()).isEqualTo("very-strong");
    }

    @Test
    void repeatRunFlagged() {
        var r = PasswordStrength.evaluate("aaa12345");
        assertThat(r.suggestions()).contains("noRepeats");
    }

    @Test
    void sequentialRunFlagged() {
        var r = PasswordStrength.evaluate("xyzAB1!@");
        assertThat(r.suggestions()).contains("noSequential");
    }

    @Test
    void nullSafe() {
        var r = PasswordStrength.evaluate(null);
        assertThat(r.score()).isZero();
        assertThat(r.label()).isEqualTo("very-weak");
    }
}
