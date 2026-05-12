package tn.bewerbi.gateway;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Edge logging at the gateway: emits one line per request/response with method, path, status,
 * duration, and correlation id. Correlation id is read from {@code X-Correlation-Id} or
 * generated when absent, then propagated downstream and back out in the response header — so
 * service-side logs and client-side breadcrumbs can be joined on the same id.
 */
@Component
public class RequestLoggingWebFilter implements WebFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger("gateway.access");
    private static final String HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        long start = System.nanoTime();
        ServerHttpRequest req = exchange.getRequest();
        String corr = req.getHeaders().getFirst(HEADER);
        if (corr == null || corr.isBlank()) corr = UUID.randomUUID().toString();
        final String corrId = corr;

        // Propagate the correlation id to the downstream service.
        ServerHttpRequest mutated = req.mutate().header(HEADER, corrId).build();
        ServerHttpResponse res = exchange.getResponse();
        res.getHeaders().set(HEADER, corrId);

        String method = req.getMethod().name();
        String path = req.getURI().getPath();
        String ip = req.getRemoteAddress() == null ? "-"
                : req.getRemoteAddress().getAddress().getHostAddress();

        return chain.filter(exchange.mutate().request(mutated).build())
                .doFinally(s -> {
                    int status = res.getStatusCode() == null ? 0 : res.getStatusCode().value();
                    long ms = (System.nanoTime() - start) / 1_000_000L;
                    log.info("{} {} {} {}ms ip={} corr={}",
                            method, path, status, ms, ip, corrId);
                });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 5;
    }
}
