import { auth, db } from "@/firebase";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PetProfileScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim() || !age.trim() || !type.trim()) {
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

      // Firestore path: users/{uid}/pets
      const docRef = await addDoc(collection(db, "users", user.uid, "pets"), {
        name: name.trim(),
        age: age.trim(),
        type: type.trim(),
        createdAt: serverTimestamp(),
      });

      console.log("Pet saved with ID:", docRef.id);

      Alert.alert("Success", "Pet saved successfully!");
      router.back(); // Go back to previous screen
    } catch (error: any) {
      console.error("Error saving pet:", error.code, error.message);
      Alert.alert("Error", "Failed to save pet. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Pet</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter pet name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter pet age"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Type</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Dog, Cat, etc."
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Pet</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    color: "#374151",
  },
  inputGroup: { marginBottom: 16 },
  label: { fontWeight: "500", marginBottom: 4, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  button: {
    backgroundColor: "#ea580c",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
