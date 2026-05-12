import { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Camera, Settings, Moon, Globe, LogOut } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Avatar } from "../../../src/components/ui/Avatar";
import { Card } from "../../../src/components/ui/Card";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase } from "../../../src/lib/supabase";

export default function EmployerProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, fetchProfile, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.city || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        first_name: firstName, last_name: lastName, phone, city, bio,
      }).eq("id", profile.id);
      if (error) throw error;
      await fetchProfile();
      Alert.alert(t("common.success"), "Profil aktualisiert!");
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        <Text className={`text-2xl font-bold pt-4 pb-4 ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("employer.companyProfile")}
        </Text>

        <Animated.View entering={FadeInDown.springify()} className="items-center mb-6">
          <Avatar uri={profile?.photo_url} name={`${firstName} ${lastName}`} size="xl" />
          <Text className="text-primary-500 text-sm font-medium mt-2">{t("profile.changePhoto")}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label={t("auth.firstName")} value={firstName} onChangeText={setFirstName} /></View>
            <View className="flex-1"><Input label={t("auth.lastName")} value={lastName} onChangeText={setLastName} /></View>
          </View>
          <Input label={t("profile.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label={t("profile.city")} value={city} onChangeText={setCity} />
          <Input label={t("profile.bio")} value={bio} onChangeText={setBio} multiline numberOfLines={4} placeholder="Beschreibung des Unternehmens..." />
          <Button title={t("common.save")} onPress={handleSave} loading={saving} size="lg" className="w-full mt-2" />
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-6 pb-8">
          <TouchableOpacity onPress={toggleTheme}>
            <Card className="flex-row items-center gap-3 mb-3">
              <Moon size={20} color="#8b5cf6" />
              <Text className={`font-medium ${isDark ? "text-dark-text" : "text-gray-900"}`}>{t("settings.darkMode")}</Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}>
            <Card className="flex-row items-center gap-3">
              <LogOut size={20} color="#DC2626" />
              <Text className="font-medium text-accent-500">{t("auth.logout")}</Text>
            </Card>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
