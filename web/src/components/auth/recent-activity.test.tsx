import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecentActivity } from "./recent-activity";
import type { LoginAttemptEntry } from "@/lib/api";

/**
 * Iter 163 — RecentActivity smoke tests.
 *
 * The component branches on react-query state (loading / error / empty
 * / data). We render it inside an isolated QueryClient (retry disabled,
 * staleTime = 0) and mock authApi.activity per test to drive each
 * branch.
 *
 * Coverage:
 *  - loading state shows the loading copy
 *  - empty array shows the "no attempts yet" copy
 *  - error renders the retry button + error message
 *  - successful data renders a list with method labels + success/failure badges
 */

const activityMock = vi.fn<() => Promise<LoginAttemptEntry[]>>();

vi.mock("@/lib/api", () => ({
  authApi: { activity: () => activityMock() },
}));

vi.mock("@/i18n/use-translate", () => ({
  useTranslate: () => (key: string) => key,
}));

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("RecentActivity", () => {
  it("shows the loading copy before the query resolves", async () => {
    // Hang the promise so we observe the loading state.
    activityMock.mockReturnValue(new Promise(() => {}));
    renderWithClient(<RecentActivity />);
    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  it("shows the empty copy when the API returns []", async () => {
    activityMock.mockResolvedValue([]);
    renderWithClient(<RecentActivity />);
    await waitFor(() =>
      expect(screen.getByText("settings.activity.empty")).toBeInTheDocument(),
    );
  });

  it("renders one row per attempt with success badge", async () => {
    const entries: LoginAttemptEntry[] = [
      {
        id: "a",
        userId: "u1",
        email: "user@example.tn",
        method: "PASSWORD",
        success: true,
        failureReason: null,
        ip: "10.0.0.1",
        userAgent: "Mozilla/5.0",
        occurredAt: "2026-05-21T10:00:00Z",
      },
      {
        id: "b",
        userId: "u1",
        email: "user@example.tn",
        method: "GOOGLE",
        success: false,
        failureReason: "OAUTH_TOKEN_INVALID",
        ip: "10.0.0.2",
        userAgent: null,
        occurredAt: "2026-05-21T09:55:00Z",
      },
    ];
    activityMock.mockResolvedValue(entries);
    renderWithClient(<RecentActivity />);

    await waitFor(() =>
      expect(screen.getByText("settings.activity.success")).toBeInTheDocument(),
    );
    expect(screen.getByText("settings.activity.failure")).toBeInTheDocument();
    // The component's translateOrCode() helper strips the prefix from
    // any key it can't translate (our mocked useTranslate returns the
    // key unchanged), so "auth.method.PASSWORD" → "PASSWORD" etc.
    expect(screen.getByText(/PASSWORD/)).toBeInTheDocument();
    expect(screen.getByText(/GOOGLE/)).toBeInTheDocument();
    expect(screen.getByText(/OAUTH_TOKEN_INVALID/)).toBeInTheDocument();
    // Both IPs should appear in the rendered list.
    expect(screen.getByText(/10\.0\.0\.1/)).toBeInTheDocument();
    expect(screen.getByText(/10\.0\.0\.2/)).toBeInTheDocument();
  });

  it("shows the error copy + retry button when the API rejects", async () => {
    activityMock.mockRejectedValue(new Error("boom"));
    renderWithClient(<RecentActivity />);
    await waitFor(() =>
      expect(screen.getByText("settings.activity.loadError")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /common\.retry/ })).toBeInTheDocument();
  });
});
