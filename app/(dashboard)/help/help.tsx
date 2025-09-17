// import { Globe, HelpCircle, Mail, Phone } from "lucide-react-native";
// import React from "react";
// import { Linking, Pressable, ScrollView, Text, View } from "react-native";

// export default function HelpScreen() {
//   return (
//     <ScrollView
//       style={{ flex: 1, backgroundColor: "#f9fafb" }}
//       contentContainerStyle={{ padding: 16 }}
//     >
//       {/* header */}
//       <View
//         style={{
//           backgroundColor: "#0ea5e9",
//           padding: 20,
//           borderRadius: 16,
//           flexDirection: "row",
//           alignItems: "center",
//           marginBottom: 20,
//         }}
//       >
//         <HelpCircle size={28} color="#fff" style={{ marginRight: 12 }} />
//         <View>
//           <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
//             Help & Support
//           </Text>
//           <Text style={{ color: "#e5e7eb", marginTop: 2 }}>
//             Find answers or reach us anytime
//           </Text>
//         </View>
//       </View>

//       {/* FAQs */}
//       <View
//         style={{
//           backgroundColor: "#fff",
//           borderRadius: 16,
//           padding: 16,
//           marginBottom: 20,
//           shadowColor: "#000",
//           shadowOpacity: 0.05,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 18,
//             fontWeight: "700",
//             marginBottom: 12,
//             color: "#111827",
//           }}
//         >
//           📌 FAQs
//         </Text>
//         <Text style={{ color: "#374151", marginBottom: 10 }}>
//           • <Text style={{ fontWeight: "600" }}>How do I add a pet?</Text>{" "}
//           {"\n"}Tap on the **Pets** tab and click the ➕ button.
//         </Text>
//         <Text style={{ color: "#374151", marginBottom: 10 }}>
//           • <Text style={{ fontWeight: "600" }}>How do I track health?</Text>{" "}
//           {"\n"}Go to **Health Record** and upload notes & images.
//         </Text>
//         <Text style={{ color: "#374151", marginBottom: 10 }}>
//           • <Text style={{ fontWeight: "600" }}>How do I delete a task?</Text>{" "}
//           {"\n"}Swipe left on a task and tap the 🗑️ icon.
//         </Text>
//       </View>

//       <View
//         style={{
//           backgroundColor: "#fff",
//           borderRadius: 16,
//           padding: 16,
//           shadowColor: "#000",
//           shadowOpacity: 0.05,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         <Text
//           style={{
//             fontSize: 18,
//             fontWeight: "700",
//             marginBottom: 12,
//             color: "#111827",
//           }}
//         >
//           📞 Contact Us
//         </Text>

//         <Pressable
//           onPress={() => Linking.openURL("mailto:shimarailshani@gmail.com")}
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingVertical: 12,
//           }}
//         >
//           <Mail size={22} color="#0ea5e9" style={{ marginRight: 10 }} />
//           <Text style={{ fontSize: 16, color: "#111827" }}>
//             Email: shimarailshani@gmail.com
//           </Text>
//         </Pressable>

//         <Pressable
//           onPress={() => Linking.openURL("tel:+94750407672")}
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingVertical: 12,
//           }}
//         >
//           <Phone size={22} color="#10b981" style={{ marginRight: 10 }} />
//           <Text style={{ fontSize: 16, color: "#111827" }}>
//             Call: +94 75 040 7672
//           </Text>
//         </Pressable>

//         <Pressable
//           onPress={() => Linking.openURL("https://pawpal.com/help")}
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingVertical: 12,
//           }}
//         >
//           <Globe size={22} color="#f59e0b" style={{ marginRight: 10 }} />
//           <Text style={{ fontSize: 16, color: "#111827" }}>
//             Visit Help Center
//           </Text>
//         </Pressable>
//       </View>
//     </ScrollView>
//   );
// }
