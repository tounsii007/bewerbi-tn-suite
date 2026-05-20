package tn.bewerbi.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tn.bewerbi.common.events.DomainEvents;
import tn.bewerbi.common.events.Topics;

/**
 * Kafka consumers that react to domain events and dispatch notifications.
 *
 * Each listener resolves message keys through the i18n-service using the
 * recipient's own locale so every mail is delivered in the right language
 * without the caller having to think about translation.
 */
@Component
public class EventListeners {

    private static final Logger log = LoggerFactory.getLogger(EventListeners.class);

    private final NotificationApp.EmailService emails;
    private final ObjectMapper mapper;

    @Value("${bewerbi.notifications.base-url:https://bewerbi.tn}")
    private String frontendBaseUrl;

    public EventListeners(NotificationApp.EmailService emails, ObjectMapper mapper) {
        this.emails = emails;
        this.mapper = mapper;
    }

    /** Sends the welcome / verify-email mail right after registration. */
    @KafkaListener(topics = Topics.USER_REGISTERED)
    public void onUserRegistered(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.UserRegistered.class);
        log.info("UserRegistered: user={} locale={}", event.userId(), event.preferredLocale());

        // The identity-service includes the single-use verification token
        // inside the event — embed it directly so the recipient can click
        // through to GET /api/v1/auth/verify-email?token=...
        String verifyLink = "%s/verify?token=%s&lang=%s".formatted(
                frontendBaseUrl,
                event.verificationToken(),
                event.preferredLocale());

        emails.sendMessage(new NotificationApp.EmailRequest(
                event.email(),
                "email.verify.subject",
                "email.verify.body",
                event.preferredLocale(),
                new Object[]{event.firstName(), verifyLink}));
    }

    @KafkaListener(topics = Topics.NEW_DEVICE_SIGN_IN)
    public void onNewDeviceSignIn(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.NewDeviceSignIn.class);
        log.info("NewDeviceSignIn: user={} locale={}",
                event.userId(), event.preferredLocale());

        // {0..3} args:
        //   0 — first name (or "")
        //   1 — short UA label (e.g. "Chrome auf Windows")
        //   2 — IP address  (helps the recipient confirm "wasn't me")
        //   3 — deep-link to /settings to terminate the bad session
        String sessionsLink = "%s/settings".formatted(frontendBaseUrl);
        String uaLabel = describeUserAgent(event.userAgent());

        emails.sendMessage(new NotificationApp.EmailRequest(
                event.email(),
                "email.new-device.subject",
                "email.new-device.body",
                event.preferredLocale(),
                new Object[]{
                        event.firstName(),
                        uaLabel,
                        event.ip() == null ? "" : event.ip(),
                        sessionsLink,
                }));
    }

    /** Cheap UA describer — first browser + OS pair we can spot, no parser. */
    private static String describeUserAgent(String ua) {
        if (ua == null || ua.isBlank()) return "Unbekanntes Gerät";
        String browser = ua.contains("Edg/") ? "Edge"
                : ua.contains("Chrome/") ? "Chrome"
                : ua.contains("Firefox/") ? "Firefox"
                : ua.contains("Safari/") ? "Safari"
                : "Browser";
        String os = ua.contains("Android") ? "Android"
                : ua.contains("iPhone") || ua.contains("iPad") || ua.contains("iOS") ? "iOS"
                : ua.contains("Windows") ? "Windows"
                : ua.contains("Mac OS") ? "macOS"
                : ua.contains("Linux") ? "Linux"
                : "";
        return os.isEmpty() ? browser : browser + " auf " + os;
    }

    @KafkaListener(topics = Topics.PASSWORD_RESET_REQUESTED)
    public void onPasswordResetRequested(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.PasswordResetRequested.class);
        log.info("PasswordResetRequested: user={} locale={}",
                event.userId(), event.preferredLocale());

        String resetLink = "%s/reset-password?token=%s&lang=%s".formatted(
                frontendBaseUrl, event.resetToken(), event.preferredLocale());

        emails.sendMessage(new NotificationApp.EmailRequest(
                event.email(),
                "email.password-reset.subject",
                "email.password-reset.body",
                event.preferredLocale(),
                new Object[]{event.firstName(), resetLink}));
    }

    @KafkaListener(topics = Topics.APPLICATION_CREATED)
    public void onApplicationCreated(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.ApplicationCreated.class);
        log.info("ApplicationCreated: application={} job={} applicant={}",
                event.applicationId(), event.jobId(), event.applicantUserId());
        // Next step: fetch applicant profile via identity-service for the e-mail
        // address + locale, then call emails.sendMessage(...) with
        // "email.applied.subject" / "email.applied.body". Kept minimal here
        // to avoid a synchronous cross-service call in a Kafka listener —
        // scheduled batch approach is planned.
    }

    @KafkaListener(topics = Topics.COMPANY_VERIFIED)
    public void onCompanyVerified(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.CompanyVerified.class);
        log.info("CompanyVerified: {} ({})", event.name(), event.slug());
    }

    @KafkaListener(topics = Topics.JOB_PUBLISHED)
    public void onJobPublished(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.JobPublished.class);
        log.info("JobPublished: {} in {} ({})", event.title(), event.location(), event.category());
        // Hook for saved-search alerts: query subscribers whose saved
        // searches match this job and trigger their configured alert
        // frequency (INSTANT fires now, DAILY/WEEKLY are aggregated by
        // the alert scheduler).
    }
}
