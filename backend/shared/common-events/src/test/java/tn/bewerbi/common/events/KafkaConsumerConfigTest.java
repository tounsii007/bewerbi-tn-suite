package tn.bewerbi.common.events;

import static org.junit.jupiter.api.Assertions.*;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.Test;

/**
 * Iter 114 — dead-letter queue configuration for Kafka consumers.
 *
 * Tests the DLT destination resolver and the Topics naming convention
 * without requiring a running Kafka broker or a Spring context.
 */
class KafkaConsumerConfigTest {

    @Test
    void dltTopicConstantMatchesNamingConvention() {
        // The constant must equal source + ".DLT" so monitoring queries
        // and replays can be derived programmatically.
        assertEquals(Topics.USER_DELETED + ".DLT", Topics.USER_DELETED_DLT);
    }

    @Test
    void dltTopicConstantHasExpectedValue() {
        assertEquals("bewerbi.users.deleted.DLT", Topics.USER_DELETED_DLT);
    }

    @Test
    void dltDestinationAppendsToSourceTopic() {
        var record = new ConsumerRecord<>(Topics.USER_DELETED, 0, 42L, "key", "payload");
        TopicPartition dest = KafkaConsumerConfig.dltDestination(record, new RuntimeException("boom"));

        assertEquals(Topics.USER_DELETED_DLT, dest.topic(),
                "DLT topic must be source + \".DLT\"");
    }

    @Test
    void dltDestinationPreservesPartition() {
        // Records should land on the same DLT partition as the source
        // partition so order is maintained and consumers can correlate them.
        int sourcePartition = 3;
        var record = new ConsumerRecord<>(Topics.USER_DELETED, sourcePartition, 7L, "k", "v");
        TopicPartition dest = KafkaConsumerConfig.dltDestination(record, new RuntimeException());

        assertEquals(sourcePartition, dest.partition(),
                "DLT partition must equal source partition");
    }

    @Test
    void dltDestinationWorksForAnyTopic() {
        // The naming convention must hold for all topics, not just USER_DELETED,
        // since the error handler is shared across all @KafkaListener methods.
        String sourceTopic = "bewerbi.notifications.email";
        var record = new ConsumerRecord<>(sourceTopic, 1, 99L, null, "body");
        TopicPartition dest = KafkaConsumerConfig.dltDestination(record, new RuntimeException());

        assertEquals(sourceTopic + ".DLT", dest.topic());
        assertEquals(1, dest.partition());
    }

    @Test
    void backOffConstantsAreSane() {
        // Guard against accidentally setting zero or negative values which
        // would cause the error handler to not retry at all.
        assertTrue(KafkaConsumerConfig.INITIAL_INTERVAL_MS > 0,
                "initial interval must be positive");
        assertTrue(KafkaConsumerConfig.MULTIPLIER > 1.0,
                "multiplier must be > 1 for the back-off to actually grow");
        assertTrue(KafkaConsumerConfig.MAX_INTERVAL_MS >= KafkaConsumerConfig.INITIAL_INTERVAL_MS,
                "max interval must be >= initial interval");
        assertTrue(KafkaConsumerConfig.MAX_ELAPSED_MS > KafkaConsumerConfig.MAX_INTERVAL_MS,
                "max elapsed time must allow at least one retry beyond the max interval");
    }
}
