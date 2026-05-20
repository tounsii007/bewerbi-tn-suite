import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingQuiz, type OnboardingResult } from "../../src/components/shared/OnboardingQuiz";
import { AuroraBackground } from "../../src/components/ui/AuroraBackground";
import { IS_API_MODE, profileApi } from "../../src/lib/apiClient";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleComplete = async (result: OnboardingResult) => {
    if (IS_API_MODE) {
      try {
        await profileApi.completeOnboarding({
          desiredProfession: result.desiredProfession || undefined,
          germanLevel: result.germanLevel ?? undefined,
          recognitionStatus: result.recognitionStatus ?? undefined,
          skills: result.skills,
        });
      } catch {
        // fail silently — user can update profile later
      }
    }
    router.replace("/(applicant)/(home)");
  };

  const handleSkip = () => router.replace("/(applicant)/(home)");

  // Iter 140 — onboarding screen now sits on a vivid aurora backdrop
  // for the marketing-feel onboarding moment. The OnboardingQuiz
  // component itself is unchanged (its internal step cards work fine
  // against the aurora's lighter areas).
  return (
    <AuroraBackground variant="vivid" style={{ flex: 1, borderRadius: 0 }}>
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <OnboardingQuiz onComplete={handleComplete} onSkip={handleSkip} />
      </SafeAreaView>
    </AuroraBackground>
  );
}
