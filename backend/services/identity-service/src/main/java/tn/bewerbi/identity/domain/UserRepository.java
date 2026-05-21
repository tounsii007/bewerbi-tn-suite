package tn.bewerbi.identity.domain;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailVerificationToken(String token);
    Optional<User> findByPasswordResetTokenHash(String tokenHash);
    boolean existsByEmail(String email);

    /** Iter 159 — lookup by Google's stable `sub` claim. Used by the
     *  POST /auth/google handler to find a returning Google user without
     *  doing an email lookup (their email could theoretically change at
     *  Google; the sub never does). */
    Optional<User> findByGoogleSubject(String googleSubject);
}
