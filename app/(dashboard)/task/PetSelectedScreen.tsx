// app/(dashboard)/task/PetSelectScreen.tsx
import { auth, db } from "@/firebase";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";

interface Pet {
  id: string;
  name: string;
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
          name: doc.data().name,
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
      <ActivityIndicator
        size="large"
        color="#ea580c"
        className="flex-1 justify-center"
      />
    );

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Select a Pet</Text>
      {pets.map((pet) => (
        <TouchableOpacity
          key={pet.id}
          className="p-4 mb-3 bg-gray-100 rounded-lg border border-gray-300"
          onPress={() =>
            router.push({
              pathname: "/task/PetTaskScreen",
              params: { petId: pet.id, petName: pet.name },
            })
          }
        >
          <Text className="text-lg font-semibold">{pet.name}</Text>
        </TouchableOpacity>
      ))}
      {pets.length === 0 && (
        <Text className="text-gray-500">No pets found. Add a pet first.</Text>
      )}
    </ScrollView>
  );
}
