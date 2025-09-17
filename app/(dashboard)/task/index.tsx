import { auth, db } from "@/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface Pet {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function PetSelectScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPets = async () => {
      const user = auth.currentUser;
      if (!user) return;
      setLoading(true);
      try {
        const petsRef = collection(db, `users/${user.uid}/pets`);
        const snapshot = await getDocs(petsRef);
        const petList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: (doc.data() as any).name,
          imageUrl: (doc.data() as any).imageUrl,
        }));
        setPets(petList);
      } catch (err) {
        console.error("Error fetching pets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View
        style={{
          backgroundColor: "#0ea5e9",
          paddingTop: 28,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#fff",
              }}
            >
              Select a Pet
            </Text>
            <Text
              style={{
                color: "#e5e7eb",
                marginTop: 20,
              }}
            >
              Choose a pet to view and add tasks
            </Text>
          </View>
          <Pressable
            android_ripple={{
              color: "rgba(255,255,255,0.2)",
              borderless: true,
            }}
            style={{
              padding: 6,
              borderRadius: 999,
            }}
          >
            <Search size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        {pets.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Text
              style={{
                color: "#6b7280",
                marginBottom: 12,
              }}
            >
              No pets found. Add a pet first.
            </Text>
            <Pressable
              onPress={() => router.push("/(dashboard)/pet/PetProfile")}
              android_ripple={{
                color: "rgba(255,255,255,0.3)",
                borderless: true,
              }}
              style={{
                backgroundColor: "#0ea5e9",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Add Pet</Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {pets.map((pet) => (
              <Pressable
                key={pet.id}
                onPress={() =>
                  router.push({
                    pathname: "/(dashboard)/task/PetTaskScreen",
                    params: { petId: pet.id, petName: pet.name },
                  })
                }
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={{ width: "48%", marginBottom: 14 }}
              >
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
                    {pet.imageUrl ? (
                      <Image
                        source={{ uri: pet.imageUrl }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#e5e7eb",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "700",
                            fontSize: 22,
                            color: "#9ca3af",
                          }}
                        >
                          {pet.name?.[0]?.toUpperCase?.() ?? "P"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        color: "#111827",
                      }}
                      numberOfLines={1}
                    >
                      {pet.name}
                    </Text>
                    <Text
                      style={{
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      Tap to manage tasks
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
