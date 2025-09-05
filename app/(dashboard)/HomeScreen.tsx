import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase";

export default function HomeScreen() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [pets, setPets] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      try {
        const petsRef = collection(db, `users/${user.uid}/pets`);
        const snapshot = await getDocs(petsRef);

        if (!snapshot.empty) {
          const petList = snapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setPets(petList);
        } else {
          setPets([]);
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {/* Greeting */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#374151" }}>
          Good afternoon, {auth.currentUser?.displayName || "User"}!
        </Text>
        <Text style={{ color: "#6b7280" }}>{today}</Text>
      </View>

      {/* Pets Section */}
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "600", color: "#374151" }}>Your Pets</Text>
          <TouchableOpacity onPress={() => router.push("/(dashboard)/Pet")}>
            <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "500" }}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ea580c" />
          ) : (
            <>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={{ marginRight: 16, alignItems: "center" }}
                  onPress={() =>
                    router.push({
                      pathname: "/(dashboard)/task/PetTaskScreen",
                      params: { petId: pet.id, petName: pet.name },
                    })
                  }
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: "#ffedd5",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ea580c",
                        fontWeight: "bold",
                        fontSize: 20,
                      }}
                    >
                      {pet.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, textAlign: "center" }}>
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Add Pet Button */}
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/pet/PetProfile")}
                style={{ alignItems: "center" }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: "#d1d5db",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  <Plus size={20} color="#9ca3af" />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  Add Pet
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
