package tn.bewerbi.identity.auth;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tn.bewerbi.identity.domain.LoginAttempt;
import tn.bewerbi.identity.domain.LoginAttemptRepository;
import tn.bewerbi.identity.domain.LoginMethod;

/**
 * Iter 160 — fire-and-forget recorder for {@link LoginAttempt} rows.
 *
 * <p>Wraps every save in {@code Propagation.REQUIRES_NEW} so a transient
 * DB failure (e.g. brief Postgres restart) never tears down the calling
 * transaction — for example, we still want a successful login to return
 * tokens to the user even if the audit-row insert fails.
 *
 * <p>Failures are logged at WARN, never thrown. The Kafka audit stream
 * is the primary durable trail; this Postgres mirror is for the UI's
 * "recent activity" view.
 */
@Component
public class LoginAttemptRecorder {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptRecorder.class);

    private final LoginAttemptRepository repo;

    public LoginAttemptRecorder(LoginAttemptRepository repo) {
        this.repo = repo;
    }

    /**
     * Record a successful login. {@code userId} must be set (we know
     * who they are by definition of "success"); {@code email} should
     * be the canonical email from the User row, not what the client
     * typed.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSuccess(UUID userId, String email, LoginMethod method,
                              String ip, String userAgent) {
        try {
            repo.save(LoginAttempt.success(userId, email, method, ip, userAgent));
        } catch (DataAccessException e) {
            log.warn("Failed to persist successful login attempt for user={} method={}: {}",
                    userId, method, e.getMessage());
        }
    }

    /**
     * Record a failed login. {@code userId} may be {@code null} (the
     * email didn't resolve to any user — brute-force probe). {@code reason}
     * should be one of the stable codes documented on
     * {@link LoginAttempt#getFailureReason()}.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(UUID userId, String email, LoginMethod method,
                              String reason, String ip, String userAgent) {
        try {
            repo.save(LoginAttempt.failure(userId, email, method, reason, ip, userAgent));
        } catch (DataAccessException e) {
            log.warn("Failed to persist failed login attempt for email={} method={} reason={}: {}",
                    email, method, reason, e.getMessage());
        }
    }
}
