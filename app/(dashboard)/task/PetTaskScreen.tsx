import { auth, db } from "@/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { CheckCircle2, ChevronLeft, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt?: any;
  dueDate?: any;
  category: "important" | "daily";
  completed?: boolean;
}

export default function PetTaskScreen() {
  const { petId, petName } = useLocalSearchParams<{
    petId: string;
    petName: string;
  }>();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"important" | "daily">("daily");
  const [taskDate, setTaskDate] = useState<Date | null>(null);
  const [taskDateWeb, setTaskDateWeb] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [tab, setTab] = useState<"all" | "important" | "daily" | "completed">(
    "all"
  );
  const [showAdd, setShowAdd] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !petId) router.replace("/(dashboard)/task");
  }, [user?.uid, petId]);
  if (!user || !petId) return null;

  const tasksRef = collection(db, `users/${user.uid}/pets/${petId}/tasks`);

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

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Task title is required");
      return;
    }

    let finalDate: Date | null = taskDate;
    if (Platform.OS === "web" && taskDateWeb) {
      const parsed = new Date(taskDateWeb);
      if (isNaN(parsed.getTime())) {
        Alert.alert("Validation", "Enter a valid date/time");
        return;
      }
      finalDate = parsed;
    }

    try {
      await addDoc(tasksRef, {
        title: title.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
        dueDate: finalDate ? finalDate.toISOString() : null,
        category,
        completed: false,
      });

      setTitle("");
      setDescription("");
      setTaskDate(null);
      setTaskDateWeb("");
    } catch (err) {
      console.error("Error adding task:", err);
      Alert.alert("Error", "Failed to add task");
    }
  };

  const toggleComplete = async (task: Task) => {
    const ref = doc(tasksRef, task.id);
    await updateDoc(ref, { completed: !task.completed });
  };

  const removeTask = async (taskId: string) => {
    await deleteDoc(doc(tasksRef, taskId));
  };

  const formatDate = (d: string | Date) => {
    const dateObj = typeof d === "string" ? new Date(d) : d;
    return dateObj.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredTasks = tasks.filter((t) => {
    if (tab === "all") return true;
    if (tab === "completed") return !!t.completed;
    return t.category === tab;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View
        style={{
          backgroundColor: "#0ea5e9",
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          elevation: 3,
          marginTop: 30,
          marginBottom: 50,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            android_ripple={{
              color: "rgba(255,255,255,0.2)",
              borderless: true,
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {petName} Tasks
            </Text>
            <Text style={{ color: "#e5e7eb", marginTop: 2 }}>
              Create and track tasks
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#e5e7eb",
            borderRadius: 999,
            padding: 4,
          }}
        >
          {(["all", "important", "daily", "completed"] as const).map((k) => (
            <Pressable
              key={k}
              android_ripple={{
                color: "rgba(0,0,0,0.06)",
                borderless: true,
              }}
              onPress={() => setTab(k)}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 999,
                backgroundColor: tab === k ? "#fff" : "transparent",
              }}
            >
              <Text
                style={{
                  color: tab === k ? "#111827" : "#6b7280",
                  fontWeight: tab === k ? "700" : "500",
                }}
              >
                {k[0].toUpperCase() + k.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* tasks */}
      <View style={{ paddingHorizontal: 16 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#0ea5e9" />
        ) : filteredTasks.length === 0 ? (
          <Text style={{ color: "#6b7280", marginBottom: 12 }}>
            No tasks yet. Add one below!
          </Text>
        ) : (
          filteredTasks.map((task) => (
            <Pressable
              key={task.id}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              style={{
                backgroundColor: "#fff",
                padding: 12,
                marginBottom: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "700",
                    color: task.completed ? "#9ca3af" : "#111827",
                    fontSize: 16,
                  }}
                >
                  {task.title}
                </Text>
                {task.description ? (
                  <Text style={{ color: "#6b7280" }}>{task.description}</Text>
                ) : null}
                {task.dueDate ? (
                  <Text style={{ color: "#2563eb" }}>
                    Reminder: {formatDate(task.dueDate)}
                  </Text>
                ) : null}
                <View
                  style={{
                    marginTop: 4,
                    alignSelf: "flex-start",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor:
                      task.category === "important" ? "#fee2e2" : "#dbeafe",
                    borderWidth: 1,
                    borderColor:
                      task.category === "important" ? "#fecaca" : "#bfdbfe",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        task.category === "important" ? "#991b1b" : "#1e3a8a",
                      fontWeight: "700",
                    }}
                  >
                    {task.category}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity onPress={() => toggleComplete(task)}>
                  <CheckCircle2
                    size={22}
                    color={task.completed ? "#22c55e" : "#9ca3af"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTask(task.id)}>
                  <Trash2 size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <Pressable
        onPress={() => setShowAdd(true)}
        android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#0ea5e9",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
        }}
      >
        <Plus size={22} color="#fff" />
      </Pressable>

      {/* Add Task Bottom Sheet */}
      {showAdd ? (
        <>
          <Pressable
            onPress={() => setShowAdd(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          />
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#fff",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: -2 },
              shadowRadius: 6,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "700",
                fontSize: 16,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Add Task
            </Text>
            <TextInput
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                padding: 10,
                borderRadius: 10,
                marginBottom: 8,
              }}
            />
            <TextInput
              placeholder="Task Description (optional)"
              value={description}
              onChangeText={setDescription}
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb",
                padding: 10,
                borderRadius: 10,
                marginBottom: 8,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#e5e7eb",
                borderRadius: 999,
                padding: 4,
                marginBottom: 8,
              }}
            >
              {(["daily", "important"] as const).map((c) => (
                <Pressable
                  key={c}
                  android_ripple={{
                    color: "rgba(0,0,0,0.06)",
                    borderless: true,
                  }}
                  onPress={() => setCategory(c)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    alignItems: "center",
                    borderRadius: 999,
                    backgroundColor: category === c ? "#fff" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: category === c ? "#111827" : "#6b7280",
                      fontWeight: category === c ? "700" : "500",
                    }}
                  >
                    {c[0].toUpperCase() + c.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            {Platform.OS === "web" ? (
              <input
                type="datetime-local"
                value={taskDateWeb}
                onChange={(e) => setTaskDateWeb(e.target.value)}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                  width: "100%",
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  style={{
                    backgroundColor: "#0ea5e9",
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    {taskDate ? "Change Date & Time" : "Pick Date & Time"}
                  </Text>
                </TouchableOpacity>
                {taskDate ? (
                  <Text style={{ color: "#111827", marginBottom: 6 }}>
                    Selected: {formatDate(taskDate)}
                  </Text>
                ) : null}
                <DateTimePickerModal
                  isVisible={showPicker}
                  mode="datetime"
                  onConfirm={(date: Date) => {
                    setTaskDate(date);
                    setShowPicker(false);
                  }}
                  onCancel={() => setShowPicker(false)}
                  minimumDate={new Date()}
                />
              </>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <Pressable
                onPress={() => setShowAdd(false)}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: "#f3f4f6",
                }}
              >
                <Text style={{ color: "#111827", fontWeight: "700" }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  handleAddTask();
                  setShowAdd(false);
                }}
                android_ripple={{
                  color: "rgba(255,255,255,0.3)",
                  borderless: true,
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: "#0ea5e9",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Add Task
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
