import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Plus, Trash2, FileText, Upload } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Badge } from "../../../src/components/ui/Badge";
import { EmptyState } from "../../../src/components/shared/EmptyState";
import { useAuthStore } from "../../../src/stores/authStore";
import { useThemeStore } from "../../../src/hooks/useColorScheme";
import { supabase, IS_MOCK_MODE } from "../../../src/lib/supabase";
import { mockDocuments } from "../../../src/lib/mockData";
import type { Document as DocType, DocumentType } from "../../../src/types";

const docTypeLabels: Record<DocumentType, string> = {
  cv: "Lebenslauf",
  diploma: "Diplom",
  certificate: "Zertifikat",
  transcript: "Zeugnis",
};

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useAuthStore();
  const { isDark } = useThemeStore();
  const [items, setItems] = useState<DocType[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!profile?.id) return;
    if (IS_MOCK_MODE) {
      setItems((mockDocuments as unknown as DocType[]).filter(d => d.profile_id === profile.id));
      return;
    }
    const { data } = await supabase.from("documents").select("*").eq("profile_id", profile.id).order("created_at", { ascending: false });
    setItems(data || []);
  };

  const pickAndUpload = async (type: DocumentType) => {
    if (IS_MOCK_MODE) {
      const newDoc: DocType = {
        id: `d-${Date.now()}`,
        profile_id: profile?.id || "",
        type,
        file_url: "https://example.com/mock.pdf",
        name: `Mock_${type}_${Date.now()}.pdf`,
        created_at: new Date().toISOString(),
      };
      setItems(prev => [newDoc, ...prev]);
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (result.canceled) return;

      setUploading(true);
      const file = result.assets[0];
      const fileName = `${profile?.user_id}/${type}-${Date.now()}.pdf`;

      const formData = new FormData();
      formData.append("file", { uri: file.uri, name: file.name, type: "application/pdf" } as any);

      const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, formData);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(fileName);

      const { error } = await supabase.from("documents").insert({
        profile_id: profile?.id,
        type,
        file_url: publicUrl,
        name: file.name,
      });
      if (error) throw error;
      loadData();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(t("common.delete"), "Dokument löschen?", [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: async () => {
        if (IS_MOCK_MODE) {
          setItems(prev => prev.filter(item => item.id !== id));
          return;
        }
        await supabase.from("documents").delete().eq("id", id); loadData();
      } },
    ]);
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-row items-center px-6 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={isDark ? "#e2e8f0" : "#374151"} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}>{t("profile.documents")}</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Upload Buttons */}
        <Animated.View entering={FadeInDown.springify()} className="flex-row flex-wrap gap-2 mb-4">
          {(Object.keys(docTypeLabels) as DocumentType[]).map((type) => (
            <Button
              key={type}
              title={docTypeLabels[type]}
              onPress={() => pickAndUpload(type)}
              variant="outline"
              size="sm"
              loading={uploading}
              icon={<Upload size={14} color="#2563EB" />}
            />
          ))}
        </Animated.View>

        {/* Documents List */}
        {items.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).springify()}>
            <Card className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center">
                  <FileText size={20} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`font-medium ${isDark ? "text-dark-text" : "text-gray-900"}`} numberOfLines={1}>{item.name}</Text>
                  <Badge label={docTypeLabels[item.type as DocumentType]} size="sm" />
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            </Card>
          </Animated.View>
        ))}

        {items.length === 0 && (
          <EmptyState
            icon={<FileText size={48} color={isDark ? "#334155" : "#d1d5db"} />}
            title="Keine Dokumente"
            subtitle="Lade deinen Lebenslauf, Diplome und Zertifikate hoch"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
