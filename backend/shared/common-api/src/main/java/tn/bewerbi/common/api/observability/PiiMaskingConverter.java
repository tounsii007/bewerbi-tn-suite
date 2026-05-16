package tn.bewerbi.common.api.observability;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Logback converter that redacts likely-PII fragments from log messages
 * before they reach disk / log-aggregator. Wired in via
 * {@code logback-spring.xml} with:
 *
 * <pre>{@code
 * <conversionRule conversionWord="mskmsg"
 *     converterClass="tn.bewerbi.common.api.observability.PiiMaskingConverter"/>
 * <pattern>... %mskmsg%n</pattern>
 * }</pre>
 *
 * Patterns redacted:
 * <ul>
 *   <li><b>Email</b> → first char + {@code ***@domain}. {@code anna@example.com}
 *       becomes {@code a***@example.com}.</li>
 *   <li><b>Bearer header values</b> → {@code Bearer ***}. The token itself
 *       is replaced regardless of its length.</li>
 *   <li><b>JWT-shape strings</b> (three dot-separated base64url chunks)
 *       → {@code ***}. Catches access tokens logged outside a Bearer
 *       header (e.g. by a third-party library).</li>
 *   <li><b>Long hex strings</b> (>= 32 chars) → first 4 chars + {@code ***}.
 *       Catches refresh tokens, password-reset tokens, session ids.</li>
 * </ul>
 *
 * Designed to be cheap — every regex is anchored and short-circuits when
 * the message contains no candidate characters. Skip the converter for
 * messages that have no `@`, `Bearer `, `.`, or long alphanumeric runs.
 *
 * <p>This is a *defence in depth* layer. The right fix is never to log
 * PII in the first place — but in practice exception messages, framework
 * defaults, and SQL prepared-statement parameters slip through. The
 * masker keeps a forgotten {@code log.info("user " + email)} from being
 * a privacy incident.
 */
public class PiiMaskingConverter extends ClassicConverter {

    private static final Pattern EMAIL = Pattern.compile(
            "([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})");

    private static final Pattern BEARER = Pattern.compile(
            "Bearer\\s+[A-Za-z0-9._-]+", Pattern.CASE_INSENSITIVE);

    private static final Pattern JWT = Pattern.compile(
            "\\b[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\b");

    private static final Pattern HEX_TOKEN = Pattern.compile(
            "\\b([A-Fa-f0-9]{4})[A-Fa-f0-9]{28,}\\b");

    @Override
    public String convert(ILoggingEvent event) {
        return mask(event.getFormattedMessage());
    }

    /** Package-private for tests. */
    static String mask(String raw) {
        if (raw == null || raw.isEmpty()) return raw;
        String msg = raw;

        // Bearer first — strips entire "Bearer <jwt>" before the JWT
        // pattern can match the inner token (which would also be fine,
        // but produces less informative output).
        if (containsIgnoreCase(msg, "bearer ")) {
            msg = BEARER.matcher(msg).replaceAll("Bearer ***");
        }
        if (msg.indexOf('@') >= 0) {
            Matcher m = EMAIL.matcher(msg);
            StringBuilder out = new StringBuilder();
            while (m.find()) {
                m.appendReplacement(out, Matcher.quoteReplacement(
                        m.group(1) + "***" + m.group(2)));
            }
            m.appendTail(out);
            msg = out.toString();
        }
        if (msg.indexOf('.') >= 0) {
            msg = JWT.matcher(msg).replaceAll("***");
        }
        // Hex tokens last: keep a 4-char prefix so distinct tokens stay
        // distinguishable in logs without leaking the secret.
        msg = HEX_TOKEN.matcher(msg).replaceAll("$1***");
        return msg;
    }

    private static boolean containsIgnoreCase(String s, String needle) {
        final int sl = s.length();
        final int nl = needle.length();
        if (nl > sl) return false;
        for (int i = 0; i <= sl - nl; i++) {
            if (s.regionMatches(true, i, needle, 0, nl)) return true;
        }
        return false;
    }
}
