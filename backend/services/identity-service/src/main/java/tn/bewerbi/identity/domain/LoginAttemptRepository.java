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
}
