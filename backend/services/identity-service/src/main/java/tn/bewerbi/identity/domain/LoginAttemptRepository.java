package tn.bewerbi.identity.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Iter 159 — persisted login-history repository.
 *
 * <p>Two read patterns are pre-indexed in V6:
 * <ul>
 *   <li>By user (the "my sessions" page in the UI)</li>
 *   <li>By email (security ops scanning for credential-stuffing on a
 *       single account)</li>
 *   <li>By IP (ops scanning for a noisy source)</li>
 * </ul>
 *
 * <p>The write path is fire-and-forget from {@code LoginAttemptRecorder}
 * — never block a login on a failed insert.
 */
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, UUID> {

    /** Most-recent first, page-limited. */
    List<LoginAttempt> findByUserIdOrderByOccurredAtDesc(UUID userId, Pageable pageable);

    /** Recent failures for a single email — used by anti-enumeration
     *  status checks in the dashboard. */
    List<LoginAttempt> findByEmailAndSuccessFalseAndOccurredAtAfterOrderByOccurredAtDesc(
            String email, Instant since);

    /** Iter 159 — GDPR right-to-erasure cascade. Called by the existing
     *  USER_DELETED handler in AuthService.deleteAccount() to anonymise
     *  the user's history rows. We don't physically delete — security
     *  retention of failed-login records survives account deletion for
     *  the short window the retention job allows. */
    @Modifying
    @Query("UPDATE LoginAttempt la SET la.userId = NULL, la.email = '[deleted]', " +
           "la.userAgent = NULL WHERE la.userId = :userId")
    int anonymiseForUser(@Param("userId") UUID userId);

    /**
     * Iter 180 — ops query: count distinct failed-login emails per IP
     * within a time window. Spikes signal credential stuffing — one IP
     * trying many emails — which the per-IP rate-limiter eventually
     * locks out, but ops want to see it early.
     *
     * <p>Backed by idx_login_attempts_ip_time (V6 migration).
     * Returns {@code (ip, distinctEmailCount)} pairs.
     */
    @Query("SELECT la.ip, COUNT(DISTINCT la.email) FROM LoginAttempt la " +
           "WHERE la.success = false AND la.ip IS NOT NULL " +
           "AND la.occurredAt > :since " +
           "GROUP BY la.ip HAVING COUNT(DISTINCT la.email) >= :minDistinctEmails " +
           "ORDER BY COUNT(DISTINCT la.email) DESC")
    List<Object[]> findStuffingSources(@Param("since") Instant since,
                                       @Param("minDistinctEmails") long minDistinctEmails);

    /**
     * Iter 180 — count attempts in the last {@code since} window grouped
     * by method + outcome. Powers a Grafana panel that complements the
     * Iter 176 Micrometer counters (DB-backed answer is authoritative;
     * the counter is fast). Two-row result per method (success + failure).
     *
     * <p>Returns {@code (method, success, count)}.
     */
    @Query("SELECT la.method, la.success, COUNT(la) FROM LoginAttempt la " +
           "WHERE la.occurredAt > :since " +
           "GROUP BY la.method, la.success")
    List<Object[]> countByMethodAndOutcome(@Param("since") Instant since);
}
