package tn.bewerbi.common.api;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * Iter 116 — request-body size cap for non-multipart endpoints.
 */
class ContentSizeFilterTest {

    private static final long LIMIT = 100L;

    private ContentSizeFilter filter;

    @BeforeEach
    void setUp() {
        filter = new ContentSizeFilter(LIMIT);
    }

    @Test
    void allowsRequestWithinLimit_contentLength() throws Exception {
        var req = new MockHttpServletRequest("POST", "/api/v1/test");
        req.setContentType("application/json");
        req.setContent("{}".getBytes(StandardCharsets.UTF_8));  // 2 bytes < 100
        var res = new MockHttpServletResponse();
        boolean[] chainCalled = {false};
        FilterChain chain = (rq, rs) -> chainCalled[0] = true;

        filter.doFilter(req, res, chain);

        assertThat(chainCalled[0]).isTrue();
        assertThat(res.getStatus()).isEqualTo(200);  // no rejection
    }

    @Test
    void rejects413WhenContentLengthExceedsLimit() throws Exception {
        // MockHttpServletRequest.getContentLengthLong() returns the length of
        // the byte array set via setContent(), not the raw header value.
        var req = new MockHttpServletRequest("POST", "/api/v1/test");
        req.setContentType("application/json");
        req.setContent(new byte[(int) (LIMIT + 1)]);  // declares Content-Length = LIMIT+1
        var res = new MockHttpServletResponse();
        boolean[] chainCalled = {false};
        FilterChain chain = (rq, rs) -> chainCalled[0] = true;

        filter.doFilter(req, res, chain);

        assertThat(chainCalled[0]).isFalse();
        assertThat(res.getStatus()).isEqualTo(413);
        assertThat(res.getContentAsString()).contains("PAYLOAD_TOO_LARGE");
    }

    @Test
    void rejects413WhenBodyStreamExceedsLimit() throws Exception {
        // Simulate the slow path: the filter wraps the InputStream, and the
        // chain drains it, hitting the size limit mid-stream.
        // MockHttpServletRequest.setContent() also sets ContentLength, so the
        // fast path would fire.  We bypass that by creating a custom subclass
        // that overrides getContentLengthLong() to return -1 (chunked-style).
        byte[] bigBody = new byte[(int) (LIMIT + 50)];
        java.util.Arrays.fill(bigBody, (byte) 'x');

        var req = new MockHttpServletRequest("POST", "/api/v1/test") {
            @Override
            public long getContentLengthLong() { return -1L; }  // simulate chunked
        };
        req.setContentType("application/json");
        req.setContent(bigBody);
        var res = new MockHttpServletResponse();
        boolean[] chainCalled = {false};
        FilterChain chain = (rq, rs) -> {
            // Drain — the LimitingStream throws BodyTooLargeException mid-read.
            rq.getInputStream().readAllBytes();
            chainCalled[0] = true;
        };

        filter.doFilter(req, res, chain);

        assertThat(res.getStatus()).isEqualTo(413);
    }

    @Test
    void passesMultipartRequestThrough() throws Exception {
        // Multipart is gated by Spring's MultipartResolver — ContentSizeFilter must not
        // interfere or it could double-reject before the custom max-file-size kicks in.
        // Use a content body larger than LIMIT so the filter would reject it if it
        // didn't exclude multipart requests.
        var req = new MockHttpServletRequest("POST", "/api/v1/documents");
        req.setContentType("multipart/form-data; boundary=----WebKitFormBoundaryXXX");
        req.setContent(new byte[(int) (LIMIT + 1)]);  // over limit, but multipart
        var res = new MockHttpServletResponse();
        boolean[] chainCalled = {false};
        FilterChain chain = (rq, rs) -> chainCalled[0] = true;

        filter.doFilter(req, res, chain);

        assertThat(chainCalled[0]).isTrue();  // must pass through, not rejected
        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void exactlyAtLimitIsAllowed() throws Exception {
        byte[] body = new byte[(int) LIMIT];
        var req = new MockHttpServletRequest("POST", "/api/v1/test");
        req.setContentType("application/json");
        req.addHeader("Content-Length", String.valueOf(LIMIT));
        req.setContent(body);
        var res = new MockHttpServletResponse();
        boolean[] chainCalled = {false};
        FilterChain chain = (rq, rs) -> chainCalled[0] = true;

        filter.doFilter(req, res, chain);

        assertThat(chainCalled[0]).isTrue();
        assertThat(res.getStatus()).isEqualTo(200);
    }

    @Test
    void getRequestWithNoBodyPassesThrough() throws Exception {
        var req = new MockHttpServletRequest("GET", "/api/v1/jobs");
        var res = new MockHttpServletResponse();
        boolean[] chainCalled = {false};
        FilterChain chain = (rq, rs) -> chainCalled[0] = true;

        filter.doFilter(req, res, chain);

        assertThat(chainCalled[0]).isTrue();
        assertThat(res.getStatus()).isEqualTo(200);
    }
}
