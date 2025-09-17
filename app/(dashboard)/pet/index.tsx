import { useLoader } from "@/context/LoaderContext";
import { auth, db } from "@/firebase";
import { Pet } from "@/types/pet";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { Pencil, Plus, Search, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";

const PetsScreen = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // add
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null); // fix: add state
  const router = useRouter();

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 44;

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      Alert.alert("Auth", "You must be logged in to see pets.");
      router.replace("/(auth)/login");
      return;
    }
    setUserId(u.uid);
  }, []);

  useEffect(() => {
    if (!userId) return;
    showLoader();
    const q = collection(db, "users", userId, "pets");
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allPets = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Pet[];
        setPets(allPets);
        hideLoader();
      },
      (err) => {
        console.log("Error fetching pets:", err);
        hideLoader();
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // delete pet
  const handleDelete = (id: string) => {
    if (!userId || deletingPetId) return;
    Alert.alert("Delete", "Are you sure you want to delete this pet?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingPetId(id);

            const batch = writeBatch(db);
            const tasksCol = collection(
              db,
              "users",
              userId,
              "pets",
              id,
              "tasks"
            );
            const tasksSnap = await getDocs(tasksCol);
            tasksSnap.docs.forEach((d) => batch.delete(d.ref));
            const petRef = doc(db, "users", userId, "pets", id);
            batch.delete(petRef);

            await batch.commit();

            setPets((prev) => prev.filter((pet) => pet.id !== id));
          } catch (err: any) {
            console.log("Error deleting pet:", err?.message || err);
            Alert.alert("Error", "Failed to delete pet.");
          } finally {
            setDeletingPetId(null);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 w-full" style={{ backgroundColor: "#f5f7fb" }}>
      <View
        style={{
          backgroundColor: "#0ea5e9",
          paddingTop: topPad,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          overflow: "hidden",
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0ea5e9" />
        <View
          style={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: -20,
            top: -20,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
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
                fontSize: 22,
                fontWeight: "700",
                color: "#fff",
              }}
            >
              Pets
            </Text>
            <Text
              style={{
                color: "#e5e7eb",
                marginTop: 2,
              }}
            >
              {pets.length} total
            </Text>
          </View>
          <Pressable
            android_ripple={{
              color: "rgba(255,255,255,0.25)",
              borderless: true,
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.18)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Search size={20} color="#fff" />
          </Pressable>
        </View>
      </View>

      {userId && (
        <View
          style={{
            position: "absolute",
            bottom: 24,
            right: 20,
            zIndex: 50,
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => router.push("/(dashboard)/pet/PetProfile")}
            android_ripple={{
              color: "rgba(255,255,255,0.3)",
              borderless: true,
            }}
            style={{ alignItems: "center" }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#0ea5e9",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
                marginBottom: 4,
              }}
            >
              <Plus size={28} color="#fff" />
            </View>
            <Text
              style={{
                fontSize: 12,
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Add Pet
            </Text>
          </Pressable>
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#0d6efd" className="mt-4" />
      )}

      <ScrollView
        className="mt-2"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {pets.length === 0 && !loading && (
          <Text className="text-center text-gray-500 mt-6">
            No pets available.
          </Text>
        )}

        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {pets.map((pet) => (
            <View key={pet.id} style={{ width: "48%", marginBottom: 14 }}>
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
                    style={{ color: "#6b7280", marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {pet.breed ? pet.breed : pet.type}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 8,
                      justifyContent: "space-between",
                    }}
                  >
                    <Pressable
                      android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                      onPress={() =>
                        router.push({
                          pathname: "/(dashboard)/pet/[id]",
                          params: { id: pet.id ?? "" },
                        })
                      }
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        backgroundColor: "#f3f4f6",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Pencil size={16} color="#111827" />
                      <Text
                        style={{
                          marginLeft: 6,
                          color: "#111827",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        Edit
                      </Text>
                    </Pressable>
                    <Pressable
                      android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                      onPress={() => handleDelete(pet.id!)}
                      disabled={deletingPetId === pet.id}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        backgroundColor: "#fee2e2",
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: deletingPetId === pet.id ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                      <Text
                        style={{
                          marginLeft: 6,
                          color: "#b91c1c",
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {deletingPetId === pet.id ? "Deleting..." : "Delete"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PetsScreen;
