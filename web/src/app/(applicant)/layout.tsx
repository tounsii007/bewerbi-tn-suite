import { AppShell } from "@/components/shared/app-shell";
import { VerifyEmailBanner } from "@/components/auth/verify-email-banner";

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <VerifyEmailBanner />
      {children}
    </AppShell>
  );
}
