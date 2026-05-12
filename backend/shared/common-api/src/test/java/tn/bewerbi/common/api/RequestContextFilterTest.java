package tn.bewerbi.common.api;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestContextFilterTest {

    private final RequestContextFilter filter = new RequestContextFilter();

    @Test
    void generates_correlation_id_when_missing() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/jobs/42");
        MockHttpServletResponse res = new MockHttpServletResponse();
        String[] captured = new String[3];
        FilterChain chain = (request, response) -> {
            captured[0] = MDC.get("path");
            captured[1] = MDC.get("method");
            captured[2] = MDC.get("correlationId");
        };

        filter.doFilter(req, res, chain);

        assertThat(captured[0]).isEqualTo("/api/v1/jobs/42");
        assertThat(captured[1]).isEqualTo("GET");
        assertThat(captured[2]).isNotBlank();
        assertThat(res.getHeader(RequestContextFilter.HEADER_CORRELATION_ID)).isEqualTo(captured[2]);
    }

    @Test
    void echoes_incoming_correlation_id() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        req.addHeader(RequestContextFilter.HEADER_CORRELATION_ID, "client-supplied-id");
        MockHttpServletResponse res = new MockHttpServletResponse();
        String[] captured = new String[1];

        filter.doFilter(req, res, (rq, rs) -> captured[0] = MDC.get("correlationId"));

        assertThat(captured[0]).isEqualTo("client-supplied-id");
        assertThat(res.getHeader(RequestContextFilter.HEADER_CORRELATION_ID))
                .isEqualTo("client-supplied-id");
    }

    @Test
    void mdc_is_cleared_after_request() throws Exception {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/x");
        MockHttpServletResponse res = new MockHttpServletResponse();

        filter.doFilter(req, res, (rq, rs) -> {});

        assertThat(MDC.get("path")).isNull();
        assertThat(MDC.get("method")).isNull();
        assertThat(MDC.get("correlationId")).isNull();
    }
}
