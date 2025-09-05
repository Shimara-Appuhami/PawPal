// app/(dashboard)/task/tasks.tsx
import { auth, db } from "@/firebase";
import { router, useLocalSearchParams } from "expo-router";
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

interface Task {
  id: string;
  title: string;
  description?: string;
}

export default function PetTasksScreen() {
  const { petId, petName } = useLocalSearchParams<{
    petId: string;
    petName: string;
  }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  if (!user || !petId) return null;

  const tasksRef = collection(db, `users/${user.uid}/pets/${petId}/tasks`);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(tasksRef);
        const taskList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(taskList);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [petId, user.uid]);

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">{petName}'s Tasks</Text>

      <ScrollView>
        {loading ? (
          <ActivityIndicator size="small" color="#ea580c" />
        ) : tasks.length === 0 ? (
          <Text className="text-gray-500">No tasks yet. Add a new task!</Text>
        ) : (
          tasks.map((task) => (
            <View
              key={task.id}
              className="bg-gray-100 p-4 mb-3 rounded-lg border border-gray-300"
            >
              <Text className="font-semibold text-lg">{task.title}</Text>
              {task.description && (
                <Text className="text-gray-600 mt-1">{task.description}</Text>
              )}
            </View>
          ))
        )}

        {/* Add Task Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center mt-4 bg-orange-500 p-3 rounded-lg"
          onPress={() =>
            router.push({
              pathname: "/task/PetTaskScreen",
              params: { petId, petName },
            })
          }
        >
          <Plus size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">Add Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
