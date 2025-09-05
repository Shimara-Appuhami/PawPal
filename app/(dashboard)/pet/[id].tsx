import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import { createPet, getPetById, updatePet } from "@/services/taskService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

const PetFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [age, setAge] = useState<string>(""); // optional age field
  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!isNew && id && user?.uid) {
        try {
          showLoader();
          const pet = await getPetById(user.uid, id);
          if (pet) {
            setName(pet.name);
            setType(pet.type);
            setAge(pet.age);
          }
        } catch (err) {
          console.error("Error loading pet:", err);
        } finally {
          hideLoader();
        }
      }
    };
    load();
  }, [id, user?.uid]);

  const handleSubmit = async () => {
    if (!name.trim() || !type.trim() || !age.trim()) {
      Alert.alert("Validation", "All fields are required");
      return;
    }

    if (!user?.uid) {
      Alert.alert("Auth", "You must be logged in to save pets");
      return;
    }

    try {
      showLoader();
      const petData = {
        name: name.trim(),
        type: type.trim(),
        age: age.trim(),
      };

      if (isNew) {
        await createPet(user.uid, petData);
      } else {
        await updatePet(user.uid, id as string, petData);
      }

      Alert.alert(
        "Success",
        `Pet ${isNew ? "added" : "updated"} successfully!`
      );
      router.back();
    } catch (err) {
      console.error(`Error ${isNew ? "adding" : "updating"} pet`, err);
      Alert.alert("Error", `Failed to ${isNew ? "add" : "update"} pet`);
    } finally {
      hideLoader();
    }
  };

  return (
    <View className="flex-1 w-full p-5">
      <Text className="text-2xl font-bold">
        {isNew ? "Add Pet" : "Edit Pet"}
      </Text>

      <TextInput
        placeholder="Pet Name"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Pet Type"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={type}
        onChangeText={setType}
      />

      <TextInput
        placeholder="Pet Age"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TouchableOpacity
        className="bg-blue-400 rounded-md px-6 py-3 my-2"
        onPress={handleSubmit}
      >
        <Text className="text-xl text-white">
          {isNew ? "Add Pet" : "Update Pet"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PetFormScreen;
