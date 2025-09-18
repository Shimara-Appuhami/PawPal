import { router } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  LogOut,
  PawPrint,
  Plus,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";

import { signOut } from "firebase/auth"; // + add
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
import { auth, db } from "../../firebase";

interface HomePet {
  id: string;
  name: string;
  imageUrl?: string;
}

interface HomeTask {
  id: string;
  title: string;
  description?: string;
  createdAt?: Date;
  dueDate?: Date;
  completed?: boolean;
  category?: "important" | "daily";
  petId: string;
  petName: string;
  petImage?: string;
}

export default function HomeScreen() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [pets, setPets] = useState<HomePet[]>([]);
  const [tasks, setTasks] = useState<HomeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "important" | "daily">("all");
  const filteredTasks = tasks.filter((t) =>
    tab === "all" ? true : t.category === tab
  );
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < new Date()
  ).length;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    const toDate = (v: any): Date | undefined => {
      if (!v) return undefined;
      if (v.toDate) return v.toDate();
      if (typeof v === "number") return new Date(v);
      if (typeof v === "string") return new Date(v);
      return undefined;
    };

    let taskUnsubs: Record<string, () => void> = {};
    let tasksByPet: Record<string, HomeTask[]> = {};

    const petsRef = collection(db, `users/${user.uid}/pets`);
    const unsubPets = onSnapshot(
      petsRef,
      { includeMetadataChanges: true },
      (petsSnap) => {
        const petList: HomePet[] = petsSnap.docs.map((d) => ({
          id: d.id,
          name: (d.data() as any).name,
          imageUrl: (d.data() as any).imageUrl,
        }));

        setPets(petList);
        setLoading(false);

        Object.values(taskUnsubs).forEach((u) => u && u());
        taskUnsubs = {};
        tasksByPet = {};

        petList.forEach((p) => {
          const tRef = collection(db, `users/${user.uid}/pets/${p.id}/tasks`);
          const qy = query(tRef, orderBy("createdAt", "desc"));
          taskUnsubs[p.id] = onSnapshot(
            qy,
            { includeMetadataChanges: true },
            (tSnap) => {
              const list: HomeTask[] = tSnap.docs.map((doc) => {
                const data: any = doc.data();
                const created = toDate(data.createdAt);
                const due = toDate(data.dueDate);
                const completed =
                  data?.completed ??
                  data?.done ??
                  data?.isDone ??
                  (typeof data?.status === "string" &&
                    ["done", "completed"].includes(
                      data.status.toLowerCase()
                    )) ??
                  false;

                return {
                  id: doc.id,
                  title: data.title,
                  description: data.description,
                  createdAt: created,
                  dueDate: due,
                  completed: Boolean(completed),
                  category: data.category,
                  petId: p.id,
                  petName: p.name,
                  petImage: p.imageUrl,
                } as HomeTask;
              });

              tasksByPet[p.id] = list;

              const merged = Object.values(tasksByPet)
                .flat()
                .sort(
                  (a, b) =>
                    (b.createdAt?.getTime?.() ?? 0) -
                    (a.createdAt?.getTime?.() ?? 0)
                );
              setTasks(merged);
            },
            (err) => {
              console.log("Error fetching tasks for pet", p.id, err);
            }
          );
        });
      },
      (err) => {
        console.error("Error fetching pets:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubPets();
      Object.values(taskUnsubs).forEach((u) => u && u());
    };
  }, []);

  const TaskCard = ({ t }: { t: HomeTask }) => {
    const accent = t.completed
      ? "#16a34a"
      : t.category === "important"
        ? "#ef4444"
        : "#3b82f6";

    return (
      <View
        key={t.id}
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 14,
          marginBottom: 14,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* accent bar */}
        <View
          style={{
            width: 4,
            height: "100%",
            borderRadius: 2,
            backgroundColor: accent,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />

        {/* pet avatar */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            overflow: "hidden",
            marginRight: 14,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {t.petImage ? (
            <Image
              source={{ uri: t.petImage }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text style={{ color: "#2563EB", fontWeight: "700", fontSize: 16 }}>
              {t.petName?.charAt(0) ?? "P"}
            </Text>
          )}
        </View>

        {/* content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 16,
              color: t.completed ? "#6B7280" : "#111827",
              textDecorationLine: t.completed ? "line-through" : "none",
            }}
            numberOfLines={1}
          >
            {t.title}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: t.completed ? "#9CA3AF" : "#6B7280",
              textDecorationLine: t.completed ? "line-through" : "none",
            }}
            numberOfLines={1}
          >
            {t.petName} {t.dueDate ? `• ${t.dueDate.toLocaleDateString()}` : ""}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(dashboard)/task/PetTaskScreen",
              params: { petId: t.petId, petName: t.petName },
            })
          }
          style={{ padding: 6 }}
        >
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </View>
    );
  };

  const PetTile = ({ p }: { p: HomePet }) => (
    <Pressable
      key={p.id}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 12,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View style={{ flex: 1 }}>
        {p.imageUrl ? (
          <Image
            source={{ uri: p.imageUrl }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F3F4F6",
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#6366F1" }}>
              {p.name?.charAt(0) || "P"}
            </Text>
          </View>
        )}
        {/* bottom bar */}
        {/* <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 0,
            backgroundColor: "rgba(255,255,255,0.95)",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
            paddingHorizontal: 10,
            justifyContent: "center",
          }}
        >
          <Text
            numberOfLines={1}
            style={{ color: "#111827", fontWeight: "800" }}
          >
            {p.name}
          </Text>
        </View> */}
      </View>
    </Pressable>
  );

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 44;

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/(auth)/login");
          } catch (e) {
            console.log("Sign out failed:", e);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F7FAFC" }}
      contentContainerStyle={{
        paddingBottom: 96,
      }}
    >
      {/* header */}
      <View
        style={{
          backgroundColor: "#0ea5e9",
          paddingTop: topPad,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: 4,
          overflow: "hidden",
          marginTop: 0,
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 100,
                height: 50,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Image
                source={require("../../assets/logo/logo.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>

            <View>
              <Text
                style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF" }}
              >
                Welcome back
              </Text>
              <Text style={{ color: "#FFFFFF", marginTop: 2 }}>{today}</Text>
            </View>
          </View>

          {/* Right: Logout */}
          <Pressable
            onPress={handleLogout}
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
            <LogOut size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontWeight: "800",
              fontSize: 18,
              color: "#111827",
              paddingTop: 45,
            }}
          >
            Your Pets
          </Text>
          <Text style={{ color: "#6B7280", fontSize: 12 }}>
            {pets.length} total
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#0EA5E9" />
        ) : pets.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text style={{ color: "#6B7280" }}>You have no pets yet.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pets.map((p) => (
              <PetTile key={p.id} p={p} />
            ))}
          </ScrollView>
        )}
      </View>
      {/* quick stats */}
      <View style={{ marginTop: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Pets */}
          <Pressable
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 20,
              marginRight: 12,
              minWidth: 160,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 6,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(14,165,233,0.12)",
                borderWidth: 1,
                borderColor: "#E0F2FE",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <PawPrint size={20} color="#0EA5E9" />
            </View>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>Pets</Text>
              <Text
                style={{ color: "#111827", fontWeight: "800", fontSize: 20 }}
              >
                {pets.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 14,
              marginRight: 12,
              minWidth: 160,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 6,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(34,197,94,0.12)",
                borderWidth: 1,
                borderColor: "rgba(187,247,208,1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <CheckCircle2 size={20} color="#16A34A" />
            </View>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>Completed</Text>
              <Text
                style={{ color: "#111827", fontWeight: "800", fontSize: 20 }}
              >
                {completedTasks}/{totalTasks}
              </Text>
            </View>
          </Pressable>

          {/* overdue */}
          <Pressable
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 16,
              padding: 14,
              marginRight: 12,
              minWidth: 160,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 6,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(239,68,68,0.12)",
                borderWidth: 1,
                borderColor: "rgba(254,202,202,1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <AlertTriangle size={20} color="#EF4444" />
            </View>
            <View>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>Overdue</Text>
              <Text
                style={{ color: "#111827", fontWeight: "800", fontSize: 20 }}
              >
                {overdueTasks}
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "800", fontSize: 18, color: "#111827" }}>
            Tasks
          </Text>
          <Text style={{ color: "#6B7280" }}>{filteredTasks.length} items</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#E5E7EB",
            borderRadius: 999,
            padding: 4,
            marginBottom: 12,
          }}
        >
          {(["all", "important", "daily"] as const).map((k) => (
            <Pressable
              key={k}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
              onPress={() => setTab(k)}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 999,
                backgroundColor: tab === k ? "#FFFFFF" : "transparent",
                borderWidth: tab === k ? 1 : 0,
                borderColor: tab === k ? "#E5E7EB" : "transparent",
              }}
            >
              <Text
                style={{
                  color: tab === k ? "#111827" : "#6B7280",
                  fontWeight: tab === k ? ("800" as const) : "600",
                }}
              >
                {k[0].toUpperCase() + k.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#0EA5E9" />
        ) : filteredTasks.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <Text style={{ color: "#6B7280" }}>No tasks to show.</Text>
          </View>
        ) : (
          filteredTasks.map((t) => <TaskCard key={t.id} t={t} />)
        )}
      </View>

      <Pressable
        android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#0EA5E9",
          alignItems: "center",
          justifyContent: "center",
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
        }}
      >
        <Plus size={24} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}
