// app/(dashboard)/PetProfile.tsx
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
import { Camera, ChevronLeft, Save } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.appBar}>
        <View style={styles.appBarRow}>
          <Pressable
            onPress={() => router.back()}
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
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
              placeholder="Dog, Cat, etc."
            />
            <Text style={styles.helper}>Animal category</Text>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="Labrador, Persian, etc."
          />
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
});
