import { useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Avatar } from "../../../src/components/ui/Avatar";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, fetchProfile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState(profile?.city || "");
  const [country, setCountry] = useState(profile?.country || "Tunesien");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (IS_MOCK_MODE) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const file = result.assets[0];
      const fileExt = file.uri.split(".").pop();
      const fileName = `${profile?.user_id}-${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, formData);

      if (uploadError) {
        Alert.alert(t("common.error"), uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);

      await supabase.from("profiles").update({ photo_url: publicUrl }).eq("id", profile?.id);
      fetchProfile();
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      if (IS_MOCK_MODE) {
        Alert.alert(t("common.success"), "Profil aktualisiert!");
        router.back();
        setLoading(false);
        return;
      }
      const { error } = await supabase.from("profiles").update({
        first_name: firstName,
        last_name: lastName,
        phone,
        city,
        country,
        bio,
      }).eq("id", profile.id);

      if (error) throw error;
      await fetchProfile();
      Alert.alert(t("common.success"), "Profil aktualisiert!");
      router.back();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>
          {t("profile.edit")}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        {/* Photo */}
        <Animated.View entering={FadeInDown.springify()} className="items-center my-6">
          <TouchableOpacity onPress={pickImage} className="relative">
            <Avatar
              uri={profile?.photo_url}
              name={`${firstName} ${lastName}`}
              size="xl"
            />
            <View className="absolute bottom-0 right-0 w-9 h-9 bg-primary-500 rounded-full items-center justify-center border-2 border-white">
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-primary-500 text-sm font-medium mt-2" onPress={pickImage}>
            {t("profile.changePhoto")}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label={t("auth.firstName")} value={firstName} onChangeText={setFirstName} />
            </View>
            <View className="flex-1">
              <Input label={t("auth.lastName")} value={lastName} onChangeText={setLastName} />
            </View>
          </View>

          <Input
            label={t("profile.phone")}
            value={phone}
            onChangeText={setPhone}
            placeholder="+216 XX XXX XXX"
            keyboardType="phone-pad"
          />
          <Input label={t("profile.city")} value={city} onChangeText={setCity} placeholder="Tunis, Sfax..." />
          <Input label={t("profile.country")} value={country} onChangeText={setCountry} />
          <Input
            label={t("profile.bio")}
            value={bio}
            onChangeText={setBio}
            placeholder="Erz&#228;hle etwas &#252;ber dich..."
            multiline
            numberOfLines={4}
          />

          <Button
            title={t("common.save")}
            onPress={handleSave}
            loading={loading}
            size="lg"
            className="w-full mt-4 mb-8"
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
