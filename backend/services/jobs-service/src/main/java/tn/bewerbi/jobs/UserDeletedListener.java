package tn.bewerbi.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.bewerbi.common.events.DomainEvents;
import tn.bewerbi.common.events.Topics;
import tn.bewerbi.jobs.api.SavedSearchController.SavedSearchRepository;

/**
 * GDPR cascade for jobs-service. Removes every saved-search owned by
 * the now-deleted user. Listens to {@link Topics#USER_DELETED}.
 *
 * <p>Job posts themselves are owned by companies, not by applicant
 * users — they stay around even when the user who created the company
 * deletes their applicant account. That's handled separately when an
 * EMPLOYER deletes (out of scope for this iteration).
 */
@Component
public class UserDeletedListener {

    private static final Logger log = LoggerFactory.getLogger(UserDeletedListener.class);

    private final SavedSearchRepository savedSearches;
    private final ObjectMapper mapper;

    public UserDeletedListener(SavedSearchRepository savedSearches, ObjectMapper mapper) {
        this.savedSearches = savedSearches;
        this.mapper = mapper;
    }

    @Transactional
    @KafkaListener(topics = Topics.USER_DELETED)
    public void onUserDeleted(String payload) throws Exception {
        var event = mapper.readValue(payload, DomainEvents.UserDeleted.class);
        long removed = savedSearches.deleteByUserId(event.userId());
        log.info("UserDeleted: removed {} saved-searches for user={}",
                removed, event.userId());
    }
}
