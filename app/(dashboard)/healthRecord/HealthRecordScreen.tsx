// import { auth, db, storage } from "@/firebase";
// import * as ImagePicker from "expo-image-picker";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { addDoc, collection, getDocs } from "firebase/firestore";
// import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
// import { useEffect, useState } from "react";
// import {
//   Alert,
//   Image,
//   ScrollView,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";

// interface HealthRecord {
//   id: string;
//   date: string;
//   note?: string;
//   imageUrl: string;
// }

// export default function HealthRecordScreen() {
//   const { petId, petName } = useLocalSearchParams<{
//     petId: string;
//     petName: string;
//   }>();
//   const router = useRouter();

//   const [records, setRecords] = useState<HealthRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [note, setNote] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const user = auth.currentUser;
//   if (!user) return null;

//   const recordsRef =
//     petId && collection(db, `users/${user.uid}/pets/${petId}/healthRecords`);

//   // Fetch records
//   const fetchRecords = async () => {
//     if (!recordsRef) return;
//     setLoading(true);
//     try {
//       const snapshot = await getDocs(recordsRef);
//       const list = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as HealthRecord[];
//       setRecords(list);
//     } catch (err) {
//       console.error("Error fetching records:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (user && petId) {
//       fetchRecords();
//     }
//   }, [user, petId]);

//   // Pick image from camera or gallery
//   const pickImage = async (fromCamera: boolean) => {
//     const permission = fromCamera
//       ? await ImagePicker.requestCameraPermissionsAsync()
//       : await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (!permission.granted) {
//       Alert.alert("Permission required", "Access is needed to continue.");
//       return;
//     }

//     const result = fromCamera
//       ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
//       : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   // Upload image to Firebase Storage
//   const uploadImage = async (uri: string): Promise<string> => {
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     const fileRef = ref(
//       storage,
//       `healthRecords/${user!.uid}/${petId}/${Date.now()}.jpg`
//     );
//     await uploadBytes(fileRef, blob);
//     return await getDownloadURL(fileRef);
//   };

//   // Add record
//   const handleAddRecord = async () => {
//     if (!image) {
//       Alert.alert("Validation", "Please add an image");
//       return;
//     }
//     if (!recordsRef) return;

//     setUploading(true);
//     try {
//       const imageUrl = await uploadImage(image);

//       await addDoc(recordsRef, {
//         date: new Date().toISOString(),
//         note: note.trim() || null,
//         imageUrl,
//       });

//       setNote("");
//       setImage(null);
//       fetchRecords();
//       Alert.alert("Success", "Health record added!");
//     } catch (err) {
//       console.error("Error adding record:", err);
//       Alert.alert("Error", "Failed to add health record");
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <ScrollView className="flex-1 p-4 bg-white">
//       <Text className="text-2xl font-bold mb-4">
//         {petName} - Health Recordss
//       </Text>

//       {/* Existing Records */}
//       {loading ? (
//         <Text>Loading...</Text>
//       ) : records.length === 0 ? (
//         <Text className="text-gray-500 mb-4">No health records yet.</Text>
//       ) : (
//         records.map((record) => (
//           <View
//             key={record.id}
//             className="bg-gray-100 p-4 mb-3 rounded-lg border border-gray-300"
//           >
//             <Image
//               source={{ uri: record.imageUrl }}
//               className="w-full h-48 rounded mb-2"
//               style={{ resizeMode: "cover" }}
//             />
//             {record.note && (
//               <Text className="text-gray-700">{record.note}</Text>
//             )}
//             <Text className="text-gray-500 mt-1 text-sm">
//               Date: {new Date(record.date).toLocaleString()}
//             </Text>
//           </View>
//         ))
//       )}

//       {/* Add New Record */}
//       <View className="mt-6">
//         {image && (
//           <Image
//             source={{ uri: image }}
//             className="w-full h-48 rounded mb-2"
//             style={{ resizeMode: "cover" }}
//           />
//         )}

//         <View className="flex-row justify-between mb-4">
//           <TouchableOpacity
//             className="bg-blue-500 p-3 rounded-lg flex-1 mr-2"
//             onPress={() => pickImage(true)}
//           >
//             <Text className="text-white text-center font-bold">Camera</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             className="bg-green-500 p-3 rounded-lg flex-1 ml-2"
//             onPress={() => pickImage(false)}
//           >
//             <Text className="text-white text-center font-bold">Gallery</Text>
//           </TouchableOpacity>
//         </View>

//         <TextInput
//           placeholder="Notes (optional)"
//           className="border border-gray-400 p-2 rounded-md mb-4"
//           value={note}
//           onChangeText={setNote}
//           multiline
//         />

//         <TouchableOpacity
//           className={`p-3 rounded-lg items-center ${
//             uploading ? "bg-gray-400" : "bg-orange-500"
//           }`}
//           onPress={handleAddRecord}
//           disabled={uploading}
//         >
//           <Text className="text-white font-bold">
//             {uploading ? "Saving..." : "Save Record"}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// }
