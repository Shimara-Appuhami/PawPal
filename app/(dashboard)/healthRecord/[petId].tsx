import { auth, db, storage } from "@/firebase";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowDownTrayIcon, EyeIcon } from "react-native-heroicons/outline";

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

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
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

      // Ask for gallery permission
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your media library to save images."
        );
        return;
      }

      // Download to app cache
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

      // Preferred: save straight to gallery
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Saved", "Image saved to your gallery.");
        return;
      } catch (e) {
        // Fallback: create album and add asset (some Android devices require this)
        const asset = await MediaLibrary.createAssetAsync(uri);
        const albumName = "PawPal";
        const album = await MediaLibrary.getAlbumAsync(albumName);
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
        }
        Alert.alert("Saved", "Image saved to your gallery.");
        return;
      }
    } catch (err) {
      console.error("Download failed", err);
      Alert.alert("Error", "Failed to download image.");
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">
        {petName} - Health Records
      </Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : records.length === 0 ? (
        <Text className="text-gray-500 mb-4">No health records yet.</Text>
      ) : (
        records.map((record) => (
          <View
            key={record.id}
            className="bg-white shadow-md p-4 mb-4 rounded-lg border border-gray-200"
          >
            <Image
              source={{ uri: record.imageUrl }}
              className="w-full h-48 rounded mb-3"
              style={{ resizeMode: "cover" }}
            />
            {record.note ? (
              <Text className="text-gray-700">{record.note}</Text>
            ) : null}
            <Text className="text-gray-500 mt-1 text-sm">
              Date: {new Date(record.date).toLocaleString()}
            </Text>

            <View className="flex-row mt-3 space-x-4">
              <TouchableOpacity
                className="flex-row items-center bg-blue-500 px-3 py-2 rounded-lg"
                onPress={() => {
                  setSelectedImage(record.imageUrl);
                  setPreviewVisible(true);
                }}
              >
                <EyeIcon size={20} color="white" />
                <Text className="text-white ml-2">Preview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center bg-green-500 px-3 py-2 rounded-lg"
                onPress={() => handleDownload(record.imageUrl)}
              >
                <ArrowDownTrayIcon size={20} color="white" />
                <Text className="text-white ml-2">Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View className="mt-6">
        {image && (
          <Image
            source={{ uri: image }}
            className="w-full h-48 rounded mb-2"
            style={{ resizeMode: "cover" }}
          />
        )}

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg flex-1 mr-2"
            onPress={() => pickImage(true)}
          >
            <Text className="text-white text-center font-bold">Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-500 p-3 rounded-lg flex-1 ml-2"
            onPress={() => pickImage(false)}
          >
            <Text className="text-white text-center font-bold">Gallery</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Notes (optional)"
          className="border border-gray-400 p-2 rounded-md mb-4"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity
          className="bg-orange-500 p-3 rounded-lg items-center"
          onPress={handleAddRecord}
          disabled={uploading}
        >
          <Text className="text-white font-bold">
            {uploading ? "Saving..." : "Save Record"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={previewVisible} transparent animationType="fade">
        <View className="flex-1 bg-black justify-center items-center">
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-[80%]"
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            className="bg-red-500 p-3 rounded-lg mt-4"
            onPress={() => setPreviewVisible(false)}
          >
            <Text className="text-white font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
