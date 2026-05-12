import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingQuiz, type OnboardingResult } from "../../src/components/shared/OnboardingQuiz";
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

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <OnboardingQuiz onComplete={handleComplete} onSkip={handleSkip} />
    </SafeAreaView>
  );
}
