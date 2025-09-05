import { Tabs } from "expo-router";
import { BellIcon, DogIcon, HeartIcon, HomeIcon } from "lucide-react-native";

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ea580c",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          height: 60,
          paddingBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="Pets"
        options={{
          title: "Pets",
          tabBarIcon: ({ color, size }) => (
            <DogIcon color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="task"
        options={{
          title: "task",
          tabBarIcon: ({ color, size }) => (
            <HeartIcon color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="Reminders"
        options={{
          title: "Reminders",
          tabBarIcon: ({ color, size }) => (
            <BellIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
