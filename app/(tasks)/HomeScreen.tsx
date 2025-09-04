import { router } from "expo-router";
import { Check, Clock, Plus } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pets = ["Buddy", "Luna", "Max"];
  const tasks = [
    {
      title: "Feed Buddy",
      time: "8:00 AM - Daily",
      color: "#fed7aa",
      iconColor: "#ea580c",
    },
    {
      title: "Walk Max",
      time: "5:00 PM - Daily",
      color: "#bbf7d0",
      iconColor: "#22c55e",
    },
    {
      title: "Luna's Medication",
      time: "7:00 PM - Daily",
      color: "#e9d5ff",
      iconColor: "#a21caf",
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {/* Greeting */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#374151" }}>
          Good afternoon, Jane!
        </Text>
        <Text style={{ color: "#6b7280" }}>{today}</Text>
      </View>

      {/* Pets Section */}
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "600", color: "#374151" }}>Your Pets</Text>
          <TouchableOpacity>
            <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "500" }}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {pets.map((pet, index) => (
            <View key={index} style={{ marginRight: 16, alignItems: "center" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#ffedd5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{ color: "#ea580c", fontWeight: "bold", fontSize: 20 }}
                >
                  {pet.charAt(0)}
                </Text>
              </View>
              <Text style={{ fontSize: 12, textAlign: "center" }}>{pet}</Text>
            </View>
          ))}
          <View style={{ alignItems: "center" }}>
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
              <Plus size={20} color="#9ca3af" />
            </View>
            <Text
              style={{ fontSize: 12, textAlign: "center", color: "#9ca3af" }}
            >
              Add Pet
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Today's Tasks */}
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "600", color: "#374151" }}>
            Today's Tasks
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tasks)/PetProfile")}>
            <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "500" }}>
              Add Task
            </Text>
          </TouchableOpacity>
        </View>

        {tasks.map((task, i) => (
          <View
            key={i}
            style={{
              backgroundColor: "#fff",
              padding: 12,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 2,
              borderWidth: 1,
              borderColor: "#f3f4f6",
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: task.color,
              }}
            >
              <Clock size={20} color={task.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "500" }}>{task.title}</Text>
              <Text style={{ fontSize: 14, color: "#6b7280" }}>
                {task.time}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#d1d5db",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={14} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Upcoming */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "600", color: "#374151" }}>Upcoming</Text>
          <TouchableOpacity>
            <Text style={{ color: "#ea580c", fontSize: 14, fontWeight: "500" }}>
              See all
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            padding: 12,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 2,
            borderWidth: 1,
            borderColor: "#f3f4f6",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#dbeafe",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Clock size={20} color="#3b82f6" />
          </View>
          <View>
            <Text style={{ fontWeight: "500" }}>Vet Appointment - Buddy</Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              Tomorrow, 2:30 PM
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
