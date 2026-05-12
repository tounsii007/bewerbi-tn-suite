package tn.bewerbi.common.security.audit;

import java.time.Instant;
import java.util.Map;

/**
 * Structured audit event. Logged at {@code AUDIT} level via the {@code tn.bewerbi.audit} logger,
 * which downstream pipelines can route to a dedicated index/topic.
 *
 * <p>Categories: {@code AUTH_LOGIN_SUCCESS}, {@code AUTH_LOGIN_FAILED}, {@code AUTH_REGISTER},
 * {@code AUTH_PASSWORD_CHANGED}, {@code AUTH_TOKEN_REFRESH}, {@code AUTH_LOGOUT},
 * {@code RESOURCE_CREATED}, {@code RESOURCE_DELETED}, {@code ADMIN_ACTION},
 * {@code PERMISSION_DENIED}.
 */
public record AuditEvent(
        String type,
        String actor,
        String target,
        String outcome,
        String reason,
        String ip,
        String userAgent,
        Map<String, Object> attrs,
        Instant timestamp) {

    public static AuditEvent success(String type, String actor, String target) {
        return new AuditEvent(type, actor, target, "SUCCESS", null, null, null, Map.of(),
                Instant.now());
    }

    public static AuditEvent failure(String type, String actor, String target, String reason) {
        return new AuditEvent(type, actor, target, "FAILURE", reason, null, null, Map.of(),
                Instant.now());
    }

    public AuditEvent withRequestContext(String ip, String userAgent) {
        return new AuditEvent(type, actor, target, outcome, reason, ip, userAgent, attrs,
                timestamp);
    }

    public AuditEvent withAttr(String key, Object value) {
        var copy = new java.util.HashMap<>(attrs);
        copy.put(key, value);
        return new AuditEvent(type, actor, target, outcome, reason, ip, userAgent,
                Map.copyOf(copy), timestamp);
    }
}
