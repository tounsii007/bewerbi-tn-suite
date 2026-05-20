package tn.bewerbi.common.events;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.ExponentialBackOff;

/**
 * Iter 114 — platform-wide dead-letter queue for Kafka consumers.
 *
 * <p>Any {@code @KafkaListener} that lets an exception propagate will be
 * retried with exponential back-off; after the back-off budget is exhausted
 * the record is forwarded to {@code <original-topic>.DLT} for investigation
 * and manual replay.
 *
 * <h2>Why DLT instead of swallowing?</h2>
 * <ul>
 *   <li><b>Malformed payload</b>: the old {@code catch (Exception e) { log.warn(…) }}
 *       silently discarded the record — the GDPR cascade never ran. With the DLT the
 *       bad record is retained for forensics and the ops team can fix the producer
 *       and replay from the DLT.</li>
 *   <li><b>Transient failure</b> (DB briefly unavailable, downstream service down):
 *       the exponential back-off gives the dependency time to recover; most
 *       transient failures clear within the retry window.</li>
 * </ul>
 *
 * <h2>Consumer contract</h2>
 * Listener methods <em>must not</em> swallow exceptions. Remove the outer
 * {@code try/catch} so the error handler can observe the failure. Best-effort
 * side-effects (e.g. blob deletion before a SQL delete) may still use an inner
 * {@code try/catch} to ensure the primary operation is not blocked by a
 * secondary failure.
 *
 * <p>This auto-configuration is activated on every service that has
 * {@code common-events} on its classpath (no per-service wiring needed).
 */
@AutoConfiguration
@ConditionalOnClass(KafkaTemplate.class)
public class KafkaConsumerConfig {

    private static final Logger log = LoggerFactory.getLogger(KafkaConsumerConfig.class);

    /** Back-off: 1 s → 2 s → 4 s → 8 s → … capped at 10 s per interval,
     *  total budget 30 s.  Typically 4–5 retry attempts before DLT. */
    static final long   INITIAL_INTERVAL_MS = 1_000L;
    static final double MULTIPLIER          = 2.0;
    static final long   MAX_INTERVAL_MS     = 10_000L;
    static final long   MAX_ELAPSED_MS      = 30_000L;

    @Bean
    public DefaultErrorHandler kafkaErrorHandler(KafkaTemplate<String, String> template) {
        var recoverer = new DeadLetterPublishingRecoverer(template,
                KafkaConsumerConfig::dltDestination);

        var backOff = new ExponentialBackOff(INITIAL_INTERVAL_MS, MULTIPLIER);
        backOff.setMaxInterval(MAX_INTERVAL_MS);
        backOff.setMaxElapsedTime(MAX_ELAPSED_MS);

        var handler = new DefaultErrorHandler(recoverer, backOff);
        handler.setRetryListeners((record, ex, deliveryAttempt) ->
                log.warn("Kafka retry: attempt={} topic={} partition={} offset={}: {}",
                        deliveryAttempt, record.topic(), record.partition(),
                        record.offset(), ex.getMessage()));
        return handler;
    }

    /**
     * Routes a failed record to {@code <source-topic>.DLT} preserving the
     * original partition so consumers can process DLT messages in the same
     * order they arrived on the source topic.
     *
     * <p>Package-private for direct unit-testing without a live Kafka broker.
     */
    static TopicPartition dltDestination(ConsumerRecord<?, ?> record, Exception ex) {
        String dltTopic = record.topic() + ".DLT";
        log.error("Kafka DLT: forwarding failed record topic={} partition={} offset={} → {}. cause={}",
                record.topic(), record.partition(), record.offset(), dltTopic,
                ex.getMessage());
        return new TopicPartition(dltTopic, record.partition());
    }
}
