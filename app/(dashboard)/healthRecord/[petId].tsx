import { auth, db, storage } from "@/firebase";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  Camera,
  ChevronLeft,
  Download,
  Eye,
  Image as ImageIcon,
  Send,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

interface HealthRecord {
  id: string;
  date: string;
  note?: string;
  imageUrl: string;
}

export default function HealthFormScreen() {
  const { petId, petName } = useLocalSearchParams<{
    petId: string;
    petName: string;
  }>();
  const router = useRouter();

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const user = auth.currentUser;
  if (!user || !petId) return null;

  const recordsRef = collection(
    db,
    `users/${user.uid}/pets/${petId}/healthRecords`
  );

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(recordsRef);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<HealthRecord, "id">),
      }));
      setRecords(list);
    } catch (err) {
      console.error("Error fetching records:", err);
      Alert.alert("Error", "Failed to fetch health records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [petId]);

  const pickImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        fromCamera ? "Camera access is needed." : "Gallery access is needed."
      );
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets.length > 0)
      setImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(
      storage,
      `healthRecords/${user.uid}/${petId}/${Date.now()}.jpg`
    );
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleAddRecord = async () => {
    if (!image) {
      Alert.alert("Validation", "Please add an image");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadImage(image);
      await addDoc(recordsRef, {
        date: new Date().toISOString(),
        note: note.trim() || null,
        imageUrl,
      });
      setNote("");
      setImage(null);
      fetchRecords();
      Alert.alert("Success", "Health record added!");
    } catch (err) {
      console.error("Error adding record:", err);
      Alert.alert("Error", "Failed to add health record");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = url;
        link.download = "health-record.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert("Download started!");
        return;
      }
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library to save images."
        );
        return;
      }
      const FS: any = FileSystem;
      const baseDir: string | undefined =
        FS.cacheDirectory || FS.documentDirectory;
      if (!baseDir) {
        Alert.alert("Error", "No writable directory available.");
        return;
      }
      const filename = `health-record-${Date.now()}.jpg`;
      const localUri = `${baseDir}${filename}`;
      const { uri } = await FileSystem.downloadAsync(url, localUri);
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved", "Image saved to your gallery.");
        return;
      } catch (e) {
        const asset = await MediaLibrary.createAssetAsync(uri);
        const albumName = "PawPal";
        const album = await MediaLibrary.getAlbumAsync(albumName);
        if (album)
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        else await MediaLibrary.createAlbumAsync(albumName, asset, false);
        Alert.alert("Saved", "Image saved to your gallery.");
        return;
      }
    } catch (err) {
      console.error("Download failed", err);
      Alert.alert("Error", "Failed to download image.");
    }
  };

  const storagePathFromUrl = (url: string) => {
    const match = url.match(/\/o\/(.+?)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleDeleteRecord = (recordId: string, imageUrl?: string) => {
    Alert.alert("Delete", "Delete this health record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) {
              Alert.alert("Error", "No user logged in.");
              return;
            }

            const recordDocRef = doc(
              db,
              "users",
              user.uid,
              "pets",
              petId,
              "healthRecords",
              recordId
            );

            await deleteDoc(recordDocRef);

            if (imageUrl) {
              try {
                const imageRef = ref(storage, imageUrl);
                await deleteObject(imageRef);
                console.log("Deleted image:", imageUrl);
              } catch (e) {
                console.warn("Storage delete failed (continuing):", e);
              }
            }

            setRecords((prev) => prev.filter((r) => r.id !== recordId));

            Alert.alert("Deleted", "Health record removed.");
          } catch (err) {
            console.error("Delete failed", err);
            Alert.alert("Error", "Failed to delete record.");
          }
        },
      },
    ]);
  };

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 44;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f6f7fb" }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* appBar */}
      <View
        style={{
          backgroundColor: "#0ea5e9",
          paddingTop: topPad,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          overflow: "hidden",
        }}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => router.back()}
            android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: true }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#fff",
              }}
              numberOfLines={1}
            >
              {petName} - Health Records
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                marginTop: 4,
                fontSize: 14,
              }}
            >
              Upload health-related images and notes
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 12,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 2,
          marginHorizontal: 16,
        }}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              marginBottom: 10,
            }}
          />
        ) : null}

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
          <Pressable
            onPress={() => pickImage(true)}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <Camera size={22} color="#6366f1" />
            <Text style={{ marginTop: 6, color: "#111827", fontWeight: "600" }}>
              Camera
            </Text>
          </Pressable>
          <Pressable
            onPress={() => pickImage(false)}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <ImageIcon size={22} color="#6366f1" />
            <Text style={{ marginTop: 6, color: "#111827", fontWeight: "600" }}>
              Gallery
            </Text>
          </Pressable>
        </View>

        <Text style={{ fontWeight: "700", color: "#111827", marginBottom: 6 }}>
          Notes (optional)
        </Text>
        <View style={{ position: "relative" }}>
          <TextInput
            placeholder="Add any notes about this record..."
            style={{
              borderColor: "#e5e7eb",
              borderWidth: 1,
              padding: 12,
              borderRadius: 12,
              paddingRight: 56,
              minHeight: 48,
              backgroundColor: "#f9fafb",
            }}
            value={note}
            onChangeText={setNote}
            multiline
          />
          <Pressable
            onPress={handleAddRecord}
            disabled={uploading}
            android_ripple={{
              color: "rgba(255,255,255,0.3)",
              borderless: true,
            }}
            style={{
              position: "absolute",
              right: 8,
              bottom: 8,
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "#6366f1",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Send size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : records.length === 0 ? (
          <Text style={{ color: "#6b7280", marginBottom: 12 }}>
            No health records yet.
          </Text>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {records.map((record) => (
              <View key={record.id} style={{ width: "48%", marginBottom: 14 }}>
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowOffset: { width: 0, height: 3 },
                    shadowRadius: 5,
                    elevation: 2,
                  }}
                >
                  <View style={{ width: "100%", aspectRatio: 1 }}>
                    <Image
                      source={{ uri: record.imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                    />
                    <View
                      style={{
                        position: "absolute",
                        left: 8,
                        right: 8,
                        bottom: 8,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          setSelectedImage(record.imageUrl);
                          setPreviewVisible(true);
                        }}
                        android_ripple={{
                          color: "rgba(0,0,0,0.06)",
                          borderless: true,
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "rgba(255,255,255,0.9)",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: "#e5e7eb",
                        }}
                      >
                        <Eye size={18} color="#111827" />
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          handleDeleteRecord(record.id, record.imageUrl)
                        }
                        android_ripple={{
                          color: "rgba(0,0,0,0.06)",
                          borderless: true,
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#ef4444",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={18} color="#fff" />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDownload(record.imageUrl)}
                        android_ripple={{
                          color: "rgba(0,0,0,0.06)",
                          borderless: true,
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "rgba(255,255,255,0.9)",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: "#e5e7eb",
                        }}
                      >
                        <Download size={18} color="#111827" />
                      </Pressable>
                    </View>
                  </View>
                  {record.note ? (
                    <Text
                      style={{ padding: 8, color: "#374151" }}
                      numberOfLines={2}
                    >
                      {record.note}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 12,
                      paddingHorizontal: 8,
                      paddingBottom: 8,
                    }}
                  >
                    Date: {new Date(record.date).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal visible={previewVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "100%", height: "80%" as any }}
              resizeMode="contain"
            />
          ) : null}
          <Pressable
            onPress={() => setPreviewVisible(false)}
            android_ripple={{
              color: "rgba(255,255,255,0.3)",
              borderless: true,
            }}
            style={{
              backgroundColor: "#0ea5e9",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 14,
              marginTop: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}
