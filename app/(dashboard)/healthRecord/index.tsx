import { auth, db } from "@/firebase";
import { Pet } from "@/types/pet";
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

export default function HealthIndexScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const user = auth.currentUser;
  if (!user) return null;

  const fetchPets = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "pets"));
      const petList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pet[];
      setPets(petList);
    } catch (err) {
      console.error("Error fetching pets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* AppBar */}
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
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: "#fff",
          }}
        >
          Health Records
        </Text>
        <Text
          style={{
            color: "#e5e7eb",
            marginTop: 2,
          }}
        >
          Choose a pet to view and add health records
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#0ea5e9" />
        ) : pets.length === 0 ? (
          <Text style={{ color: "#6b7280", marginBottom: 12 }}>
            No pets found. Add a pet first!
          </Text>
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
                    pathname: "/healthRecord/[petId]",
                    params: { petId: pet.id!, petName: pet.name },
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
                      View health records
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
