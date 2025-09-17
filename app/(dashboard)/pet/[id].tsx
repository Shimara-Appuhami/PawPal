import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { db, storage } from "@/firebase";
import { createPet, getPetById, updatePet } from "@/services/taskService";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ChevronDown, ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PetFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [breed, setBreed] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [breedQuery, setBreedQuery] = useState("");
  const originalRef = useRef<{
    name: string;
    type: string;
    age: string;
    breed: string;
    imageUrl?: string;
  }>({
    name: "",
    type: "",
    age: "",
    breed: "",
    imageUrl: undefined,
  });
  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!isNew && id && user?.uid) {
        try {
          showLoader();
          const pet = await getPetById(user.uid, id);
          if (pet) {
            setName(pet.name);
            setType(pet.type);
            setAge(pet.age);
            setBreed((pet as any).breed || "");
            setImageUrl((pet as any).imageUrl);
            // save originals for dirty-check
            originalRef.current = {
              name: pet.name || "",
              type: pet.type || "",
              age: pet.age || "",
              breed: (pet as any).breed || "",
              imageUrl: (pet as any).imageUrl,
            };
          }
        } catch (err) {
          console.error("Error loading pet:", err);
        } finally {
          hideLoader();
        }
      }
    };
    load();
  }, [id, user?.uid]);

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

  const handleSubmit = async () => {
    if (!name.trim() || !type.trim() || !age.trim() || !breed.trim()) {
      Alert.alert("Validation", "All fields are required");
      return;
    }

    if (!user?.uid) {
      Alert.alert("Auth", "You must be logged in to save pets");
      return;
    }

    try {
      showLoader();
      const baseData = {
        name: name.trim(),
        type: type.trim(),
        age: age.trim(),
        breed: breed.trim(),
      } as any;

      if (isNew) {
        await createPet(user.uid, baseData);
      } else {
        if (imageUri && id) {
          const url = await uploadImage(user.uid, id as string, imageUri);
          baseData.imageUrl = url;
        }
        await updatePet(user.uid, id as string, baseData);

        if (baseData.imageUrl) {
          await updateDoc(doc(db, "users", user.uid, "pets", id as string), {
            imageUrl: baseData.imageUrl,
          });
        }
      }

      Alert.alert(
        "Success",
        `Pet ${isNew ? "added" : "updated"} successfully!`
      );
      router.back();
    } catch (err) {
      console.error(`Error ${isNew ? "adding" : "updating"} pet`, err);
      Alert.alert("Error", `Failed to ${isNew ? "add" : "update"} pet`);
    } finally {
      hideLoader();
    }
  };

  // hasChanges + back handler
  const hasChanges = isNew
    ? !!(name.trim() || type.trim() || age.trim() || breed.trim() || imageUri)
    : name !== originalRef.current.name ||
      type !== originalRef.current.type ||
      age !== originalRef.current.age ||
      breed !== originalRef.current.breed ||
      !!imageUri;

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
            backgroundColor: "#f3f4f6",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <ChevronLeft size={18} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{isNew ? "Add Pet" : "Edit Pet"}</Text>
          <Text style={styles.subtitle}>
            Keep your pet profile up to date with a photo and details.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.uploadBox}
        activeOpacity={0.85}
        onPress={pickImage}
      >
        {imageUri || imageUrl ? (
          <>
            <Image
              source={{ uri: imageUri ?? imageUrl! }}
              style={styles.uploadImage}
            />
            <View style={styles.uploadOverlay}>
              <Text style={styles.uploadOverlayText}>Change photo</Text>
            </View>
          </>
        ) : (
          <View style={{ alignItems: "center" }}>
            <View style={styles.uploadIcon} />
            <Text style={styles.uploadTitle}>Add a pet photo</Text>
            <Text style={styles.uploadHint}>JPG or PNG, up to 5MB</Text>
            <Text style={styles.uploadCta}>Tap to choose from gallery</Text>
          </View>
        )}
      </TouchableOpacity>

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

      <View style={styles.inputGroup}>
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

      <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
        <Text style={styles.primaryBtnText}>
          {isNew ? "Add Pet" : "Update Pet"}
        </Text>
      </TouchableOpacity>

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
};

export default PetFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6b7280" },
  uploadBox: {
    height: 200,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    marginTop: 12,
    marginBottom: 16,
  },
  uploadImage: { width: "100%", height: "100%" },
  uploadOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 8,
    alignItems: "center",
  },
  uploadOverlayText: { color: "#fff", fontWeight: "600" },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginBottom: 8,
  },
  uploadTitle: { fontWeight: "600", color: "#111827" },
  uploadHint: { marginTop: 2, color: "#6b7280", fontSize: 12 },
  uploadCta: { marginTop: 6, color: "#2563eb", fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  inputGroup: { marginBottom: 14 },
  label: { fontWeight: "600", marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  helper: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  primaryBtn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
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
