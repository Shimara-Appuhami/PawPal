import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Bell, ChevronRight, Plus, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
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

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const petsRef = collection(db, `users/${user.uid}/pets`);
        const petsSnap = await getDocs(petsRef);
        const petList = petsSnap.docs.map((d) => ({
          id: d.id,
          name: (d.data() as any).name,
          imageUrl: (d.data() as any).imageUrl,
        }));

        setPets(petList);

        const all: HomeTask[] = [];
        for (const p of petList) {
          const tRef = collection(db, `users/${user.uid}/pets/${p.id}/tasks`);
          const qy = query(tRef, orderBy("createdAt", "desc"));
          const tSnap = await getDocs(qy);
          tSnap.docs.forEach((doc) => {
            const data: any = doc.data();
            all.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt?.toDate
                ? data.createdAt.toDate()
                : undefined,
              dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
              completed: data.completed,
              category: data.category,
              petId: p.id,
              petName: p.name,
              petImage: p.imageUrl,
            });
          });
        }
        setTasks(all);
      } catch (e) {
        console.error("Error fetching tasks:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // modern task card
  const TaskCard = ({ t }: { t: HomeTask }) => {
    const accent = t.completed
      ? "#10b981"
      : t.category === "important"
        ? "#ef4444"
        : "#0ea5e9";
    return (
      <Pressable
        key={t.id}
        android_ripple={{ color: "rgba(0,0,0,0.06)" }}
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 18,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: accent,
            marginRight: 12,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 16, color: "#111827" }}>
            {t.title}
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Text style={{ color: "#6b7280", fontSize: 12 }}>{t.petName}</Text>
            {t.dueDate ? (
              <Text style={{ color: accent, fontSize: 12, marginLeft: 8 }}>
                • {t.dueDate.toLocaleDateString()}
              </Text>
            ) : null}
          </View>
        </View>
        <ChevronRight size={18} color="#9ca3af" />
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
      contentContainerStyle={{ paddingBottom: 96 }}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}>
              Welcome back
            </Text>
            <Text style={{ color: "#e5e7eb", marginTop: 2 }}>{today}</Text>
          </View>
          <Pressable
            android_ripple={{
              color: "rgba(255,255,255,0.2)",
              borderless: true,
            }}
            style={{ padding: 6, borderRadius: 999 }}
          >
            <Bell size={22} color="#fff" />
          </Pressable>
        </View>
        <Pressable
          android_ripple={{ color: "rgba(0,0,0,0.05)" }}
          style={{
            marginTop: 16,
            backgroundColor: "#fff",
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Search size={18} color="#9ca3af" />
          <Text style={{ color: "#9ca3af", marginLeft: 8 }}>Search</Text>
        </Pressable>
      </View>

      {/* Pets grid */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text
          style={{
            fontWeight: "700",
            fontSize: 18,
            color: "#111827",
            marginBottom: 12,
          }}
        >
          Your Pets
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0ea5e9" />
        ) : pets.length === 0 ? (
          <Text style={{ color: "#9ca3af" }}>No pets yet.</Text>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {pets.map((p) => (
              <Pressable
                key={p.id}
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
                    elevation: 3,
                  }}
                >
                  <View style={{ width: "100%", aspectRatio: 1 }}>
                    {p.imageUrl ? (
                      <Image
                        source={{ uri: p.imageUrl }}
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
                            color: "#0ea5e9",
                          }}
                        >
                          {p.name?.charAt(0) || "P"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text
                      style={{ fontWeight: "600", color: "#111827" }}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Tasks with tabs */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 18, color: "#111827" }}>
            Tasks
          </Text>
          <Text style={{ color: "#6b7280" }}>{filteredTasks.length} items</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#e5e7eb",
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
                backgroundColor: tab === k ? "#fff" : "transparent",
              }}
            >
              <Text
                style={{
                  color: tab === k ? "#111827" : "#6b7280",
                  fontWeight: tab === k ? ("700" as const) : "500",
                }}
              >
                {k[0].toUpperCase() + k.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#0ea5e9" />
        ) : filteredTasks.length === 0 ? (
          <Text style={{ color: "#9ca3af" }}>No tasks to show.</Text>
        ) : (
          filteredTasks.map((t) => <TaskCard key={t.id} t={t} />)
        )}
      </View>

      {/* FAB */}
      <Pressable
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
        <Plus size={24} color="#fff" />
      </Pressable>
    </ScrollView>
  );
}
