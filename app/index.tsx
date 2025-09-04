import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const Index = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  console.log("User data : ", user);

  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/(tasks)/HomeScreen");
      else router.replace("/login");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 w-full justify-center align-items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
};

export default Index;

// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import React from "react";
// import { Image, Pressable, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const Index = () => {
//   const router = useRouter();

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {/* Gradient Background */}
//       <LinearGradient
//         colors={["#FDBA74", "#FFFFFF"]}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//           paddingHorizontal: 24,
//         }}
//       >
//         {/* Dog Image */}
//         <Image
//           source={require("../assets/images/dog.png")}
//           style={{ width: 250, height: 250, marginBottom: 20 }}
//           resizeMode="contain"
//         />

//         {/* App Branding */}
//         <View style={{ alignItems: "center", marginBottom: 16 }}>
//           <Text style={{ fontSize: 32, fontWeight: "bold", color: "#9A3412" }}>
//             PawPal
//           </Text>
//         </View>

//         {/* Tagline */}
//         <Text
//           style={{
//             fontSize: 16,
//             textAlign: "center",
//             color: "#374151",
//             marginBottom: 32,
//             lineHeight: 22,
//             paddingHorizontal: 16,
//           }}
//         >
//           Make pet care simple and joyful – track feeding, walks, and health all
//           in one place!
//         </Text>

//         {/* Get Started Button */}
//         <Pressable
//           onPress={() => router.push("/tasks/HomeScreen")}
//           style={{
//             backgroundColor: "#F97316",
//             paddingHorizontal: 32,
//             paddingVertical: 16,
//             borderRadius: 12,
//             shadowColor: "#000",
//             shadowOpacity: 0.2,
//             shadowRadius: 4,
//             transform: [{ scale: 1 }],
//           }}
//         >
//           <Text
//             style={{
//               color: "#fff",
//               fontSize: 18,
//               fontWeight: "bold",
//               textAlign: "center",
//             }}
//           >
//             Get Started
//           </Text>
//         </Pressable>

//         {/* Footer Subtext */}
//         <Text
//           style={{
//             color: "#6B7280",
//             fontSize: 14,
//             textAlign: "center",
//             marginTop: 16,
//           }}
//         >
//           Join thousands of happy pet parents
//         </Text>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// export default Index;
