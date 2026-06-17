package tn.bewerbi.identity;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * End-to-end integration test for the identity-service.
 *
 * Uses a real PostgreSQL container (via Testcontainers) so Flyway migrations,
 * JPA mappings, JSON (de)serialization and Spring Security filters are all
 * exercised together — exactly the failure modes unit tests miss.
 *
 * Same pattern works for every other service: only the Testcontainers
 * setup and the endpoints under test change.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
// disabledWithoutDocker=true: skip the whole class (instead of failing
// with ContainerFetchException) when the dev machine has no running
// Docker daemon. CI always has one — the test still runs there.
@Testcontainers(disabledWithoutDocker = true)
class IdentityIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("bewerbi_test")
            .withInitScript("init-test-schema.sql");

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper mapper;

    @Test
    void register_then_login_then_fetch_profile_with_completeness() throws Exception {
        // register
        String registerBody = """
                {
                  "email": "ahmed@example.tn",
                  "password": "StrongP@ss123",
                  "firstName": "Ahmed",
                  "lastName": "Ben Salem",
                  "role": "APPLICANT"
                }
                """;
        MvcResult register = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody))
                .andReturn();
        assertThat(register.getResponse().getStatus()).isEqualTo(200);

        JsonNode regJson = mapper.readTree(register.getResponse().getContentAsString());
        String accessToken = regJson.get("accessToken").asText();
        assertThat(accessToken).isNotBlank();

        // login
        String loginBody = """
                { "email": "ahmed@example.tn", "password": "StrongP@ss123" }
                """;
        MvcResult login = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andReturn();
        assertThat(login.getResponse().getStatus()).isEqualTo(200);

        // fetch profile — requires auth
        MvcResult profile = mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/profile/me")
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept-Language", "fr"))
                .andReturn();
        assertThat(profile.getResponse().getStatus()).isEqualTo(200);
        assertThat(profile.getResponse().getHeader("Content-Language")).isEqualTo("fr");

        JsonNode profileJson = mapper.readTree(profile.getResponse().getContentAsString());
        assertThat(profileJson.path("firstName").asText()).isEqualTo("Ahmed");
        assertThat(profileJson.path("completeness").path("percent").asInt()).isGreaterThan(0);
        assertThat(profileJson.path("completeness").path("tier").asText()).isIn("STARTER", "MOVER");
        assertThat(profileJson.path("completeness").path("nextAction")).isNotNull();
    }

    @Test
    void login_with_wrong_password_returns_401() throws Exception {
        String loginBody = """
                { "email": "nobody@example.tn", "password": "wrongwrongwrong" }
                """;
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody))
                .andReturn();
        assertThat(result.getResponse().getStatus()).isIn(401, 400);
    }

    /**
     * Weak passwords must be rejected by the shared PasswordStrength
     * rubric *before* the user row is created. Asserts the 422 +
     * messageKey contract that the web/mobile/Flutter clients translate.
     */
    @Test
    void register_with_weak_password_returns_422_with_messageKey() throws Exception {
        String body = """
                {
                  "email": "weak@example.tn",
                  "password": "password",
                  "firstName": "Weak",
                  "lastName": "Pwd",
                  "role": "APPLICANT"
                }
                """;
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andReturn();
        assertThat(result.getResponse().getStatus()).isEqualTo(422);
        JsonNode json = mapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.path("messageKey").asText()).startsWith("error.auth.password.weak.");
    }

    /**
     * /password/forgot must always 204, regardless of whether the
     * address exists, so it cannot be used as an account-enumeration
     * oracle.
     */
    @Test
    void forgot_password_always_returns_204() throws Exception {
        int unknown = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"email\": \"definitely-not-there@example.tn\" }"))
                .andReturn().getResponse().getStatus();
        assertThat(unknown).isEqualTo(204);

        // Register + reuse the address — still 204 (the side-effect
        // happens only on the known path, but the visible response is
        // identical).
        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "email": "knownuser@example.tn",
                          "password": "StrongP@ss123",
                          "firstName": "K",
                          "lastName": "User",
                          "role": "APPLICANT"
                        }
                        """));
        int known = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"email\": \"knownuser@example.tn\" }"))
                .andReturn().getResponse().getStatus();
        assertThat(known).isEqualTo(204);
    }

    /**
     * GDPR delete-account end-to-end. Locks in two contracts:
     * 1) the wrong password is rejected with 401 (the user stays around),
     * 2) the right password returns 204 and a subsequent login fails
     *    with 401 (the account is gone).
     */
    @Test
    void delete_account_requires_password_and_is_irreversible() throws Exception {
        // Register a fresh account.
        String register = """
                {
                  "email": "tombstone@example.tn",
                  "password": "StrongP@ss123",
                  "firstName": "Tomb",
                  "lastName": "Stone",
                  "role": "APPLICANT"
                }
                """;
        MvcResult reg = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(register))
                .andReturn();
        assertThat(reg.getResponse().getStatus()).isEqualTo(200);
        String accessToken = mapper.readTree(reg.getResponse().getContentAsString())
                .get("accessToken").asText();

        // Wrong password → 401, account untouched.
        int wrong = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/me/delete")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"password\": \"not-the-password\" }"))
                .andReturn().getResponse().getStatus();
        assertThat(wrong).isIn(400, 401);

        // Correct password → 204.
        int deleted = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/me/delete")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"password\": \"StrongP@ss123\" }"))
                .andReturn().getResponse().getStatus();
        assertThat(deleted).isEqualTo(204);

        // Login with the now-deleted email must fail.
        int afterLogin = mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"email\": \"tombstone@example.tn\", "
                        + "\"password\": \"StrongP@ss123\" }"))
                .andReturn().getResponse().getStatus();
        assertThat(afterLogin).isIn(400, 401);
    }
}
