import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Star, Globe, Users, MapPin, ArrowLeft, Send } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useThemeStore } from "../../src/hooks/useColorScheme";
import { VerifiedBadge } from "../../src/components/ui/VerifiedBadge";
import { companiesApi, IS_API_MODE, type Company, type CompanyReview } from "../../src/lib/apiClient";

export default function CompanyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useThemeStore();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      if (!IS_API_MODE) {
        setCompany(mockCompany(slug));
        setReviews(mockReviews());
        setLoading(false);
        return;
      }
      try {
        const c = await companiesApi.bySlug(slug);
        setCompany(c);
        const page = await companiesApi.listReviews(c.id);
        setReviews(page.content);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading || !company) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="px-5 pt-3 pb-2 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-100"
        >
          <ArrowLeft size={18} color="#374151" />
        </TouchableOpacity>
        <Text
          className={`text-lg font-bold flex-1 ${
            isDark ? "text-dark-text" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {company.name}
        </Text>
      </View>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.springify()}
          className={`rounded-2xl p-5 border ${
            isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
          }`}
        >
          <View className="flex-row items-center gap-3">
            <Text
              className={`text-2xl font-bold flex-1 ${
                isDark ? "text-dark-text" : "text-gray-900"
              }`}
            >
              {company.name}
            </Text>
            <VerifiedBadge status={company.verificationStatus} size="md" />
          </View>
          {company.description ? (
            <Text
              className={`mt-3 text-[14px] leading-6 ${
                isDark ? "text-dark-muted" : "text-gray-600"
              }`}
            >
              {company.description}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-4 mt-4 flex-wrap">
            {company.industry ? (
              <MetaRow icon={<Users size={14} />} label={company.industry} isDark={isDark} />
            ) : null}
            {company.city ? (
              <MetaRow icon={<MapPin size={14} />} label={`${company.city}${company.country ? ", " + company.country : ""}`} isDark={isDark} />
            ) : null}
            {company.website ? (
              <MetaRow icon={<Globe size={14} />} label={company.website} isDark={isDark} />
            ) : null}
          </View>
          {company.ratingCount > 0 && (
            <View className="flex-row items-center gap-2 mt-4">
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <Text className={`font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                {(company.ratingAvg ?? 0).toFixed(1)}
              </Text>
              <Text className={isDark ? "text-dark-muted" : "text-gray-500"}>
                ({company.ratingCount} {t("company.reviews")})
              </Text>
            </View>
          )}
        </Animated.View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className={`text-lg font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
            {t("company.reviews")}
          </Text>
          <TouchableOpacity onPress={() => setShowReviewForm(!showReviewForm)}>
            <Text className="text-primary-500 font-semibold">
              {t("company.writeReview")}
            </Text>
          </TouchableOpacity>
        </View>

        {showReviewForm && <ReviewForm companyId={company.id} onSubmitted={(r) => { setReviews([r, ...reviews]); setShowReviewForm(false); }} isDark={isDark} />}

        <View className="mt-4 gap-3 pb-8">
          {reviews.map((r, i) => (
            <Animated.View
              key={r.id}
              entering={FadeInDown.delay(i * 40).springify()}
              className={`rounded-2xl p-4 border ${
                isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
              }`}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <StarRow rating={r.rating} />
                {r.employmentStatus ? (
                  <Text
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isDark ? "bg-dark-border text-dark-muted" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.employmentStatus}
                  </Text>
                ) : null}
              </View>
              {r.title ? (
                <Text className={`text-[15px] font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
                  {r.title}
                </Text>
              ) : null}
              {r.body ? (
                <Text className={`mt-1 text-[13px] leading-5 ${isDark ? "text-dark-muted" : "text-gray-600"}`}>
                  {r.body}
                </Text>
              ) : null}
              {(r.pros || r.cons) && (
                <View className="mt-3 gap-1">
                  {r.pros ? (
                    <Text className="text-[13px] text-success-700">👍 {r.pros}</Text>
                  ) : null}
                  {r.cons ? (
                    <Text className="text-[13px] text-accent-600">👎 {r.cons}</Text>
                  ) : null}
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ icon, label, isDark }: { icon: React.ReactNode; label: string; isDark: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {icon}
      <Text className={`text-[13px] ${isDark ? "text-dark-muted" : "text-gray-600"}`}>{label}</Text>
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          color="#f59e0b"
          fill={i <= rating ? "#f59e0b" : "transparent"}
        />
      ))}
    </View>
  );
}

function ReviewForm({
  companyId,
  onSubmitted,
  isDark,
}: {
  companyId: string;
  onSubmitted: (r: CompanyReview) => void;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [status, setStatus] = useState<"current" | "former" | "interview">("current");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) return;
    setSubmitting(true);
    try {
      const newReview: CompanyReview = IS_API_MODE
        ? await companiesApi.createReview(companyId, {
            rating, title, body, pros, cons, employmentStatus: status,
          })
        : {
            id: `mock-${Date.now()}`, companyId, authorUserId: "me",
            rating, title, body, pros, cons, employmentStatus: status,
            createdAt: new Date().toISOString(),
          };
      onSubmitted(newReview);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      className={`mt-4 rounded-2xl p-4 border ${
        isDark ? "bg-dark-card border-dark-border" : "bg-white border-gray-100"
      }`}
    >
      <View className="flex-row gap-1.5 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Star
              size={28}
              color="#f59e0b"
              fill={i <= rating ? "#f59e0b" : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Titel"
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        className={`rounded-2xl px-4 mb-2 text-[14px] ${Platform.OS === "web" ? "py-2" : "py-3"} ${
          isDark ? "bg-dark-bg border border-dark-border text-dark-text" : "bg-gray-50 border border-gray-200 text-gray-900"
        }`}
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Erfahrungsbericht"
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        multiline
        className={`rounded-2xl px-4 py-3 mb-2 text-[14px] min-h-[80px] ${
          isDark ? "bg-dark-bg border border-dark-border text-dark-text" : "bg-gray-50 border border-gray-200 text-gray-900"
        }`}
      />
      <TextInput
        value={pros}
        onChangeText={setPros}
        placeholder={t("company.pros")}
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        className={`rounded-2xl px-4 mb-2 text-[14px] ${Platform.OS === "web" ? "py-2" : "py-3"} ${
          isDark ? "bg-dark-bg border border-dark-border text-dark-text" : "bg-gray-50 border border-gray-200 text-gray-900"
        }`}
      />
      <TextInput
        value={cons}
        onChangeText={setCons}
        placeholder={t("company.cons")}
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        className={`rounded-2xl px-4 mb-3 text-[14px] ${Platform.OS === "web" ? "py-2" : "py-3"} ${
          isDark ? "bg-dark-bg border border-dark-border text-dark-text" : "bg-gray-50 border border-gray-200 text-gray-900"
        }`}
      />
      <View className="flex-row gap-2 mb-3">
        {(["current", "former", "interview"] as const).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-full ${
              status === s
                ? "bg-primary-500"
                : isDark
                  ? "bg-dark-bg border border-dark-border"
                  : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-[12px] font-semibold ${
                status === s ? "text-white" : isDark ? "text-dark-text" : "text-gray-700"
              }`}
            >
              {t(`company.status${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={submit}
        disabled={rating < 1 || submitting}
        className={`rounded-2xl py-3 items-center flex-row justify-center gap-2 ${
          rating < 1 || submitting ? "bg-gray-300" : "bg-primary-500"
        }`}
      >
        <Send size={16} color="#fff" />
        <Text className="text-white font-bold">{t("common.submit")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function mockCompany(slug: string): Company {
  return {
    id: "mock",
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    description: "Führender Anbieter für Fachkräfte aus Nordafrika.",
    website: "https://example.com",
    industry: "IT & Software",
    size: "51-200",
    country: "Deutschland",
    city: "Berlin",
    verificationStatus: "VERIFIED",
    ratingAvg: 4.2,
    ratingCount: 12,
  };
}

function mockReviews(): CompanyReview[] {
  return [
    {
      id: "r1",
      companyId: "mock",
      authorUserId: "u1",
      rating: 5,
      title: "Sehr professioneller Onboarding-Prozess",
      body: "Von der Bewerbung bis zum Visum wurde alles begleitet.",
      pros: "Faire Bezahlung, Anerkennung wurde unterstützt",
      cons: "Wohnungssuche war stressig",
      employmentStatus: "current",
      createdAt: new Date().toISOString(),
    },
  ];
}
