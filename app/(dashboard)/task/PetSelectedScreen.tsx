// app/(dashboard)/task/PetSelectedScreen.tsx
import { auth, db } from "@/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
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

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 4,
          }}
        >
          Select a Pet
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 12 }}>
          Choose a pet to view and add tasks.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
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
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 12,
              marginBottom: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                overflow: "hidden",
                backgroundColor: "#e5e7eb",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {pet.imageUrl ? (
                <Image
                  source={{ uri: pet.imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#6b7280",
                  }}
                >
                  {pet.name?.[0]?.toUpperCase?.() ?? "P"}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: "700",
                  color: "#111827",
                  fontSize: 16,
                }}
              >
                {pet.name}
              </Text>
              <Text style={{ color: "#6b7280", marginTop: 2 }}>
                Tap to manage tasks
              </Text>
            </View>
          </Pressable>
        ))}

        {pets.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Text style={{ color: "#6b7280", marginBottom: 12 }}>
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
        )}
      </View>
    </ScrollView>
  );
}
