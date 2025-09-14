// import { auth, db, storage } from "@/firebase";
// import { Ionicons } from "@expo/vector-icons";
// import * as FileSystem from "expo-file-system";
// import * as ImagePicker from "expo-image-picker";
// import * as MediaLibrary from "expo-media-library";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
// import { useState } from "react";
// import {
//   Alert,
//   Image,
//   Modal,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// export default function AddHealthRecord() {
//   const { petId, petName } = useLocalSearchParams<{
//     petId: string;
//     petName: string;
//   }>();
//   const [note, setNote] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [previewVisible, setPreviewVisible] = useState(false);

//   const router = useRouter();
//   const user = auth.currentUser;
//   if (!user || !petId) return null;

//   const recordsRef = collection(
//     db,
//     `users/${user.uid}/pets/${petId}/healthRecords`
//   );

//   // pick image from gallery or camera
//   const pickImage = async (fromCamera: boolean) => {
//     const permission = fromCamera
//       ? await ImagePicker.requestCameraPermissionsAsync()
//       : await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       Alert.alert("Permission required", "Please allow access to continue.");
//       return;
//     }

//     const result = fromCamera
//       ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
//       : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//       setPreviewVisible(true); // open preview immediately
//     }
//   };

//   // upload image
//   const uploadImageAsync = async (uri: string): Promise<string> => {
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     const fileRef = ref(
//       storage,
//       `healthRecords/${user!.uid}/${petId}/${Date.now()}.jpg`
//     );

//     return new Promise((resolve, reject) => {
//       const uploadTask = uploadBytesResumable(fileRef, blob);

//       uploadTask.on(
//         "state_changed",
//         null,
//         (error) => reject(error),
//         async () => {
//           const url = await getDownloadURL(uploadTask.snapshot.ref);
//           resolve(url);
//         }
//       );
//     });
//   };

//   // download image
//   const downloadImage = async (uri: string) => {
//     try {
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission Denied",
//           "Cannot save image without permission."
//         );
//         return;
//       }
//       const fileUri = FileSystem.documentDirectory + `${Date.now()}.jpg`;
//       const download = await FileSystem.downloadAsync(uri, fileUri);
//       await MediaLibrary.saveToLibraryAsync(download.uri);
//       Alert.alert("Success", "Image saved to gallery!");
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to download image.");
//     }
//   };

//   // save health record
//   const handleSave = async () => {
//     if (!image) {
//       Alert.alert("Validation", "Please add an image.");
//       return;
//     }
//     setUploading(true);

//     try {
//       const imageUrl = await uploadImageAsync(image);
//       await addDoc(recordsRef, {
//         date: new Date().toISOString(),
//         note: note.trim() || null,
//         imageUrl,
//         createdAt: serverTimestamp(),
//       });

//       Alert.alert("Success", "Health record added!");
//       router.back(); // go back after saving
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to add health record.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <ScrollView className="flex-1 p-4 bg-white">
//       <Text className="text-2xl font-bold mb-4">
//         Add Health Record for {petName}
//       </Text>

//       {/* Image preview modal */}
//       <Modal visible={previewVisible} transparent={true}>
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "black",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           {image && (
//             <Image
//               source={{ uri: image }}
//               style={{ width: "100%", height: "80%" }}
//               resizeMode="contain"
//             />
//           )}
//           <View style={{ flexDirection: "row", marginTop: 20 }}>
//             <TouchableOpacity
//               style={{
//                 backgroundColor: "orange",
//                 padding: 10,
//                 borderRadius: 8,
//                 marginHorizontal: 10,
//               }}
//               onPress={() => {
//                 if (image) downloadImage(image);
//               }}
//             >
//               <Ionicons name="download" size={24} color="white" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={{
//                 backgroundColor: "red",
//                 padding: 10,
//                 borderRadius: 8,
//                 marginHorizontal: 10,
//               }}
//               onPress={() => setPreviewVisible(false)}
//             >
//               <Ionicons name="close-circle" size={24} color="white" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Pick buttons */}
//       <View className="flex-row justify-between mb-4">
//         <TouchableOpacity
//           className="bg-blue-500 p-3 rounded-lg flex-1 mr-2"
//           onPress={() => pickImage(false)}
//         >
//           <Text className="text-white text-center font-bold">Pick Image</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           className="bg-green-500 p-3 rounded-lg flex-1 ml-2"
//           onPress={() => pickImage(true)}
//         >
//           <Text className="text-white text-center font-bold">Camera</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Notes input */}
//       <TextInput
//         placeholder="Notes (optional)"
//         className="border border-gray-400 p-2 rounded-md mb-4"
//         value={note}
//         onChangeText={setNote}
//         multiline
//       />

//       {/* Save button */}
//       <TouchableOpacity
//         className={`p-3 rounded-lg items-center ${
//           uploading ? "bg-gray-400" : "bg-orange-500"
//         }`}
//         onPress={handleSave}
//         disabled={uploading}
//       >
//         <Text className="text-white font-bold">
//           {uploading ? "Saving..." : "Save Record"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }
