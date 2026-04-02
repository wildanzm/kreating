import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Toast from "react-native-toast-message";
import { Colors } from "../constants/colors";

const TONE_OPTIONS = [
  { id: "formal", label: "Formal", icon: "👔" },
  { id: "casual", label: "Santai", icon: "😊" },
  { id: "storytelling", label: "Bercerita", icon: "📚" },
];

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textMain,
  },
  strong: {
    fontWeight: "700",
    color: Colors.textMain,
  },
  heading1: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  paragraph: { marginBottom: 12 },
  bullet_list: { marginBottom: 12 },
};

export default function HomeScreen() {
  const [productName, setProductName] = useState("");
  const [isProductNameFocused, setIsProductNameFocused] = useState(false);
  const [features, setFeatures] = useState("");
  const [isFeaturesFocused, setIsFeaturesFocused] = useState(false);
  const [tone, setTone] = useState("casual");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedStatus, setCopiedStatus] = useState(false);

  const handleReset = () => {
    setProductName("");
    setFeatures("");
    setTone("casual");
    setResult(null);
    setCopiedStatus(false);
  };

  const handleGenerate = async () => {
    if (!productName.trim() || !features.trim()) {
      Toast.show({
        type: "error",
        text1: "Formulir Tidak Lengkap",
        text2: "Silakan masukkan nama produk dan fitur Anda.",
        position: "bottom",
        bottomOffset: 40,
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setCopiedStatus(false);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error(
          "API Key tidak ditemukan. Pastikan EXPO_PUBLIC_GROQ_API_KEY sudah diatur di environment (.env file).",
        );
      }

      // System prompt mapping the user inputs
      const systemPrompt = `Anda adalah Copywriter Profesional Khusus UMKM Indonesia. Tugas Anda adalah membuat teks promosi yang SANGAT memikat, persuasif, dan SIAP SALIN (ready to publish) untuk marketplace atau media sosial.

      INFORMASI PRODUK:
      - Nama Produk: ${productName}
      - Fitur/Keunggulan: ${features}
      - Gaya Bahasa: ${tone}

      STRUKTUR WAJIB:
      1. Headline/Hook: Kalimat pertama harus *catchy*, menyentuh emosi atau masalah pembeli. Gunakan Markdown (cetak tebal) untuk judul.
      2. Isi (Benefit): Jelaskan manfaat nyata secara terstruktur (wajib gunakan *bullet points*). Jangan terkesan kaku, sertakan emoji pendukung.
      3. Call to Action (CTA): Ajakan bertindak yang jelas di akhir kalimat.
      4. Hashtag: Berikan 3-5 hashtag relevan di paling bawah.

      ATURAN KETAT:
      - WAJIB berikan output murni hasil copywriting saja. Langsung mulai dari tulisan!
      - DILARANG KERAS menggunakan kata pengantar/basa-basi seperti "Tentu, berikut adalah...", "Ini dia hasil tulisan...", "Semoga ini sesuai...", dsb.`;

      // Call Groq API via native fetch
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b", // Specific model required
            messages: [{ role: "system", content: systemPrompt }],
            temperature: 0.7,
          }),
        },
      );

      if (!response.ok) {
        console.log("Groq Error:", response.status);
        let errorMsg = "Koneksi ke sistem AI gagal (Server Error).";

        if (response.status === 401) {
          errorMsg = "Kunci API tidak valid. Pastikan pengaturan server benar.";
        } else if (response.status === 429) {
          errorMsg =
            "Permintaan terlalu banyak. Mohon tunggu beberapa detik sebelum mencoba lagi.";
        } else if (response.status === 404) {
          errorMsg =
            "Sistem AI tidak ditemukan (Model Error). Hubungi developer.";
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();
      const textOutput = data.choices?.[0]?.message?.content?.trim();

      if (textOutput) {
        setResult(textOutput);
      } else {
        throw new Error("Menerima respons kosong dari AI.");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Pembuatan Gagal",
        text2: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        position: "bottom",
        bottomOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000); // Visual feedback duration
  };

  return (
    <View style={styles.rootContainer}>
      {/* Header (Outside Safe Area) */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo-kreating.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Ulang</Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.headline}>Kreating AI ✨</Text>
            <Text style={styles.subtitle}>
              Asisten marketing UMKM. Sulap keunggulan produk dan jasa jadi teks
              promosi yang memikat pembeli dalam hitungan detik!
            </Text>

            {/* Form */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nama Produk</Text>
              <TextInput
                style={[
                  styles.input,
                  isProductNameFocused && styles.inputFocused,
                ]}
                placeholder="misal: Nama Produk atau Jasa"
                placeholderTextColor={Colors.textLight}
                value={productName}
                onChangeText={setProductName}
                onFocus={() => setIsProductNameFocused(true)}
                onBlur={() => setIsProductNameFocused(false)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fitur Utama / Detail</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  isFeaturesFocused && styles.inputFocused,
                ]}
                placeholder="misal: Bahan pembuatan, varian, atau spesifikasi unggulan"
                placeholderTextColor={Colors.textLight}
                value={features}
                onChangeText={setFeatures}
                onFocus={() => setIsFeaturesFocused(true)}
                onBlur={() => setIsFeaturesFocused(false)}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Gaya Bahasa</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.toneScroll}
              >
                {TONE_OPTIONS.map((item) => {
                  const isActive = tone === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.toneCard,
                        isActive && styles.toneCardActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setTone(item.id)}
                    >
                      <Text
                        style={[
                          styles.toneIcon,
                          isActive && styles.toneIconActive,
                        ]}
                      >
                        {item.icon}
                      </Text>
                      <Text
                        style={[
                          styles.toneLabel,
                          isActive && styles.toneLabelActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                loading && styles.generateButtonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={Colors.white}
                  size="small"
                  style={styles.loader}
                />
              ) : (
                <Text style={styles.generateButtonText}>Buat Teks ✨</Text>
              )}
            </TouchableOpacity>

            {/* Result Card */}
            {result && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Hasil Teks Deskripsi:</Text>
                <View style={styles.resultCard}>
                  <Markdown style={markdownStyles}>{result}</Markdown>
                </View>

                <TouchableOpacity
                  style={[
                    styles.copyButton,
                    copiedStatus && styles.copyButtonSuccess,
                  ]}
                  onPress={handleCopy}
                  activeOpacity={0.8}
                >
                  <Text style={styles.copyButtonText}>
                    {copiedStatus ? "Disalin! ✅" : "Salin ke Papan Klip 📋"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom spacing helper */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: Colors.background,
    marginBottom: 28,
  },
  logo: {
    width: 120,
    height: 32,
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
  },
  resetButtonText: {
    color: Colors.textMain,
    fontSize: 14,
    fontWeight: "600",
  },
  headline: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textMain,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textLight,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMain,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textMain,
    shadowColor: Colors.textMain,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputFocused: {
    borderColor: Colors.accent,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  toneScroll: {
    flexDirection: "row",
    paddingVertical: 4, // prevent clipping shadows
  },
  toneCard: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: Colors.textMain,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  toneCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#F0FDFA",
  },
  toneIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  toneIconActive: {
    opacity: 1,
  },
  toneLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textLight,
  },
  toneLabelActive: {
    color: Colors.primary,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loader: {
    paddingVertical: 2,
  },
  resultContainer: {
    marginTop: 36,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textMain,
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textMain,
  },
  copyButton: {
    marginTop: 16,
    backgroundColor: Colors.textMain,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  copyButtonSuccess: {
    backgroundColor: Colors.success,
  },
  copyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
