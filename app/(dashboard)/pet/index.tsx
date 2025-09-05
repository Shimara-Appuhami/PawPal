import { useLoader } from "@/context/LoaderContext";
import { auth, db } from "@/firebase";
import { Pet } from "@/types/pet";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PetsScreen = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Auth", "You must be logged in to see pets.");
    router.push("/login"); // redirect to login if needed
    return null;
  }

  // Fetch pets
  useEffect(() => {
    showLoader();
    const q = collection(db, "users", user.uid, "pets");
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
  }, [user]);

  // Delete pet
  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this pet?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteDoc(doc(db, "users", user.uid, "pets", id));
            setPets((prev) => prev.filter((pet) => pet.id !== id)); // update UI
          } catch (err) {
            console.log("Error deleting pet:", err);
            Alert.alert("Error", "Failed to delete pet.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 w-full">
      <Text className="text-4xl font-bold px-4 py-4">Pets</Text>

      {user && (
        <View className="absolute bottom-5 right-5 z-50">
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
              <Plus size={28} color="#9ca3af" />
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
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#0d6efd" className="mt-4" />
      )}

      <ScrollView className="mt-4">
        {pets.length === 0 && !loading && (
          <Text className="text-center text-gray-500 mt-6">
            No pets available.
          </Text>
        )}

        {pets.map((pet) => (
          <View
            key={pet.id}
            className="bg-gray-200 p-4 mb-3 rounded-lg mx-4 border border-gray-400"
          >
            <Text className="text-lg font-semibold">{pet.name}</Text>
            <Text className="text-sm text-gray-700 mb-2">
              Age: {pet.age} | Type: {pet.type}
            </Text>

            <View className="flex-row">
              <TouchableOpacity
                className="bg-yellow-300 px-3 py-1 rounded"
                onPress={() =>
                  router.push({
                    pathname: "/(dashboard)/pet/[id]",
                    params: { id: pet.id ?? "" },
                  })
                }
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 px-3 py-1 rounded ml-3"
                onPress={() => handleDelete(pet.id!)}
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PetsScreen;
