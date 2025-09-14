import { auth, db } from "@/firebase";
import { Pet } from "@/types/pet";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
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
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Pets Health Records</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ea580c" />
      ) : pets.length === 0 ? (
        <Text className="text-gray-500 mb-4">
          No pets found. Add a pet first!
        </Text>
      ) : (
        pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            className="bg-gray-100 p-4 mb-3 rounded-lg border border-gray-300"
            onPress={() =>
              router.push({
                pathname: "/healthRecord/[petId]",
                params: { petId: pet.id, petName: pet.name },
              })
            }
          >
            <Text className="font-semibold text-lg">{pet.name}</Text>
            {pet.age && (
              <Text className="text-gray-600 mt-1">Age: {pet.age}</Text>
            )}
            {pet.type && (
              <Text className="text-gray-600 mt-1">Type: {pet.type}</Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
