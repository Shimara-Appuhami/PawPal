// import { auth, db } from "@/firebase";
// import { router, useLocalSearchParams } from "expo-router";
// import { collection, getDocs } from "firebase/firestore";
// import { Plus } from "lucide-react-native";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// interface Task {
//   id: string;
//   title: string;
//   description?: string;
// }

// export default function PetTasksScreen() {
//   const { petId, petName } = useLocalSearchParams<{
//     petId: string;
//     petName: string;
//   }>();

//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);

//   const user = auth.currentUser;
//   if (!user || !petId) return null;

//   const tasksRef = collection(db, `users/${user.uid}/pets/${petId}/tasks`);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       setLoading(true);
//       try {
//         const snapshot = await getDocs(tasksRef);
//         const taskList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...(doc.data() as any),
//         })) as Task[];
//         setTasks(taskList);
//       } catch (err) {
//         console.error("Error fetching tasks:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, [petId, user.uid]);

//   return (
//     <View style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
//       {/* AppBar */}
//       <View
//         style={{
//           backgroundColor: "#0ea5e9",
//           paddingVertical: 16,
//           paddingHorizontal: 16,
//           borderBottomLeftRadius: 16,
//           borderBottomRightRadius: 16,
//           elevation: 3,
//           marginBottom: 12,
//         }}
//       >
//         <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
//           {petName}'s Tasks
//         </Text>
//         <Text style={{ color: "#e5e7eb", marginTop: 2 }}>
//           View existing tasks or add new ones
//         </Text>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
//         {loading ? (
//           <ActivityIndicator size="small" color="#0ea5e9" />
//         ) : tasks.length === 0 ? (
//           <Text style={{ color: "#6b7280" }}>
//             No tasks yet. Add a new task!
//           </Text>
//         ) : (
//           tasks.map((task) => (
//             <View
//               key={task.id}
//               style={{
//                 backgroundColor: "#fff",
//                 padding: 12,
//                 marginBottom: 10,
//                 borderRadius: 12,
//                 borderWidth: 1,
//                 borderColor: "#e5e7eb",
//               }}
//             >
//               <Text
//                 style={{ fontWeight: "700", color: "#111827", fontSize: 16 }}
//               >
//                 {task.title}
//               </Text>
//               {task.description ? (
//                 <Text style={{ color: "#6b7280", marginTop: 2 }}>
//                   {task.description}
//                 </Text>
//               ) : null}
//             </View>
//           ))
//         )}

//         <TouchableOpacity
//           onPress={() =>
//             router.push({
//               pathname: "/(dashboard)/task/PetTaskScreen",
//               params: { petId, petName },
//             })
//           }
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             marginTop: 12,
//             backgroundColor: "#0ea5e9",
//             padding: 12,
//             borderRadius: 12,
//           }}
//         >
//           <Plus size={20} color="#fff" />
//           <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>
//             Add Task
//           </Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }
