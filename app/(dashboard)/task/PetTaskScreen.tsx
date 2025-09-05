// app/(dashboard)/task/PetTasksScreen.tsx
import { auth, db } from "@/firebase";
import { useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt?: any;
}

export default function PetTaskScreen() {
  const { petId, petName } = useLocalSearchParams<{
    petId: string;
    petName: string;
  }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const user = auth.currentUser;

  if (!user || !petId) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Missing user or pet</Text>
      </View>
    );
  }

  const tasksRef = collection(db, `users/${user.uid}/pets/${petId}/tasks`);

  // Real-time listener
  useEffect(() => {
    setLoading(true);
    const q = query(tasksRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const taskList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(taskList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tasks:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [petId]);

  // Add new task
  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Task title is required");
      return;
    }

    try {
      await addDoc(tasksRef, {
        title: title.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error adding task:", err);
      Alert.alert("Error", "Failed to add task");
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">{petName} Tasks</Text>

      {/* Task List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : tasks.length === 0 ? (
        <Text className="text-gray-500 mb-4">No tasks yet. Add one below!</Text>
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

      {/* Add Task Fields */}
      <View className="mt-6">
        <TextInput
          placeholder="Task Title"
          className="border border-gray-400 p-2 rounded-md mb-2"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Task Description (optional)"
          className="border border-gray-400 p-2 rounded-md mb-2"
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity
          className="flex-row items-center justify-center bg-orange-500 p-3 rounded-lg"
          onPress={handleAddTask}
        >
          <Plus size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">Add Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
