import { auth, db, storage } from "@/firebase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Camera, ChevronDown, ChevronLeft, Save } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PetProfileScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [breedQuery, setBreedQuery] = useState("");

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled && res.assets.length > 0) {
      setImageUri(res.assets[0].uri);
    }
  };

  const uploadImage = async (uid: string, petId: string, uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(
      storage,
      `users/${uid}/pets/${petId}/photo-${Date.now()}.jpg`
    );
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    if (!name.trim() || !age.trim() || !type.trim() || !breed.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add a pet.");
      return;
    }
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "users", user.uid, "pets"), {
        name: name.trim(),
        age: age.trim(),
        type: type.trim(),
        breed: breed.trim(),
        createdAt: serverTimestamp(),
      });
      if (imageUri) {
        const url = await uploadImage(user.uid, docRef.id, imageUri);
        await updateDoc(doc(db, "users", user.uid, "pets", docRef.id), {
          imageUrl: url,
        });
      }
      Alert.alert("Success", "Pet saved successfully!");
      router.back();
    } catch (error: any) {
      console.error("Error saving pet:", error?.code, error?.message);
      Alert.alert("Error", "Failed to save pet. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = !!(
    name.trim() ||
    age.trim() ||
    type.trim() ||
    breed.trim() ||
    imageUri
  );

  const handleBack = () => {
    if (!hasChanges) {
      router.back();
      return;
    }
    Alert.alert("Discard changes?", "Your changes will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
    ]);
  };

  const TYPE_OPTIONS = ["Dog", "Cat"] as const;
  const BREED_CATALOG: Record<string, string[]> = {
    Dog: [
      "Labrador Retriever",
      "German Shepherd",
      "Golden Retriever",
      "Poodle",
      "American Bully",
      "Dog (General)",
    ],
    Cat: ["Persian", "Siamese", "Maine Coon", "Cat (General)"],
  };
  const breedOptions = React.useMemo(() => {
    const list = type && BREED_CATALOG[type] ? BREED_CATALOG[type] : [];
    if (!breedQuery.trim()) return list;
    const q = breedQuery.toLowerCase();
    return list.filter((b) => b.toLowerCase().includes(q));
  }, [type, breedQuery]);

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 44;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.appBar,
          {
            paddingTop: topPad,
            paddingBottom: 16,
            paddingHorizontal: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            overflow: "hidden",
          },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0ea5e9" />
        <View
          style={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: -20,
            top: -20,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <View style={styles.appBarRow}>
          <Pressable
            onPress={handleBack}
            android_ripple={{
              color: "rgba(255,255,255,0.2)",
              borderless: true,
            }}
            style={styles.backBtn}
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.appBarTitle}>New Pet</Text>
            <Text style={styles.appBarSubtitle}>
              Create a profile with photo and details
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <Pressable
        style={styles.uploadCard}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        onPress={pickImage}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.uploadImage} />
            <View style={styles.uploadOverlayBar}>
              <Camera size={16} color="#fff" />
              <Text style={styles.uploadOverlayText}>Change photo</Text>
            </View>
          </>
        ) : (
          <View style={styles.uploadEmpty}>
            <View style={styles.uploadIconModern}>
              <Camera size={20} color="#0ea5e9" />
            </View>
            <Text style={styles.uploadTitle}>Add a pet photo</Text>
            <Text style={styles.uploadHint}>JPG or PNG, up to 5MB</Text>
            <Text style={styles.uploadCta}>Tap to choose from gallery</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pet Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter pet name"
          />
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.col]}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 2"
              keyboardType="numeric"
            />
            <Text style={styles.helper}>Enter age in years</Text>
          </View>
          <View style={[styles.inputGroup, styles.col]}>
            <Text style={styles.label}>Type</Text>
            <Pressable
              onPress={() => setShowTypePicker(true)}
              style={[styles.input, styles.pickerButton]}
            >
              <Text
                style={[
                  styles.pickerText,
                  !type && { color: "#9ca3af", fontWeight: "400" },
                ]}
              >
                {type || "Select type"}
              </Text>
              <ChevronDown size={16} color="#6b7280" />
            </Pressable>
            <Text style={styles.helper}>Animal category</Text>
          </View>
        </View>
        <View className="inputGroup" style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <Pressable
            onPress={() => {
              if (!type) {
                Alert.alert("Select Type", "Please choose a pet type first.");
                return;
              }
              setBreedQuery("");
              setShowBreedPicker(true);
            }}
            style={[styles.input, styles.pickerButton]}
          >
            <Text
              style={[
                styles.pickerText,
                !breed && { color: "#9ca3af", fontWeight: "400" },
              ]}
            >
              {breed || (type ? "Select breed" : "Choose type first")}
            </Text>
            <ChevronDown size={16} color="#6b7280" />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={handleSave}
        disabled={loading}
        android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
        style={[styles.fab, loading && { opacity: 0.8 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Save size={20} color="#fff" />
        )}
        {!loading && <Text style={styles.fabText}>Save</Text>}
      </Pressable>

      <Text style={styles.disclaimer}>
        By saving, you agree to keep your pet's info accurate.
      </Text>

      <Modal
        visible={showTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Type</Text>
              <Pressable
                onPress={() => setShowTypePicker(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
            {TYPE_OPTIONS.map((opt) => {
              const selected = type === opt;
              return (
                <Pressable
                  key={opt}
                  style={styles.optionRow}
                  onPress={() => {
                    setType(opt);
                    setBreed("");
                    setShowTypePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && { fontWeight: "700", color: "#0ea5e9" },
                    ]}
                  >
                    {opt}
                  </Text>
                  {selected && <View style={styles.selectedDot} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
      <Modal
        visible={showBreedPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBreedPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {type ? `${type} Breeds` : "Breeds"}
              </Text>
              <Pressable
                onPress={() => setShowBreedPicker(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.searchInput}
              value={breedQuery}
              onChangeText={setBreedQuery}
              placeholder="Search breed..."
              placeholderTextColor="#9ca3af"
            />
            <FlatList
              data={breedOptions}
              keyExtractor={(i) => i}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptySearch}>No breeds found.</Text>
              }
              renderItem={({ item }) => {
                const selected = breed === item;
                return (
                  <Pressable
                    style={styles.optionRow}
                    onPress={() => {
                      setBreed(item);
                      setShowBreedPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && { fontWeight: "700", color: "#0ea5e9" },
                      ]}
                    >
                      {item}
                    </Text>
                    {selected && <View style={styles.selectedDot} />}
                  </Pressable>
                );
              }}
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fb" },
  content: { padding: 16, paddingBottom: 32 },
  appBar: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 3,
    marginHorizontal: -16,
    marginBottom: 12,
  },
  appBarRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  appBarTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  appBarSubtitle: { color: "#e5e7eb", marginTop: 2, fontSize: 12 },

  uploadCard: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  uploadImage: { width: "100%", height: "100%" },
  uploadOverlayBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadOverlayText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  uploadEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  uploadIconModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: { fontWeight: "600", color: "#111827" },
  uploadHint: { marginTop: 2, color: "#6b7280", fontSize: 12 },
  uploadCta: { marginTop: 6, color: "#2563eb", fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  row: { flexDirection: "row" },
  col: { flex: 1 },

  inputGroup: { marginBottom: 14 },
  label: { fontWeight: "600", marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8fafc",
  },
  helper: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  fabText: { color: "#fff", fontWeight: "700", marginLeft: 8 },

  disclaimer: { textAlign: "center", color: "#9ca3af", marginTop: 12 },

  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  pickerText: { fontSize: 16, color: "#111827", fontWeight: "600" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
  },
  closeBtnText: { color: "#334155", fontWeight: "600", fontSize: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    fontSize: 14,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionText: { fontSize: 15, color: "#111827", flex: 1 },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0ea5e9",
  },
  emptySearch: {
    textAlign: "center",
    color: "#6b7280",
    paddingVertical: 24,
    fontSize: 13,
  },
});
