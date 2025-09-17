import { Tabs } from "expo-router";
import {
  DogIcon,
  HeartPulseIcon,
  HelpCircleIcon,
  HomeIcon,
  ListTodoIcon,
  MapIcon,
  SyringeIcon as VaccinationIcon,
} from "lucide-react-native";

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
        name="pet"
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
          title: "Task",
          tabBarIcon: ({ color, size }) => (
            <ListTodoIcon color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="healthRecord"
        options={{
          title: "Health Record",
          tabBarIcon: ({ color, size }) => (
            <HeartPulseIcon color={color} size={size} />
          ),
        }}
      />
      {/* map */}

      <Tabs.Screen
        name="map"
        options={{
          title: "Vet Map",
          tabBarIcon: ({ color, size }) => (
            <MapIcon color={color} size={size} />
          ),
        }}
      />
      {/* vaccinations */}

      <Tabs.Screen
        name="vaccinations"
        options={{
          title: "Vaccinations",
          tabBarIcon: ({ color, size }) => (
            <VaccinationIcon color={color} size={size} />
          ),
        }}
      />

      {/* help */}
      <Tabs.Screen
        name="help"
        options={{
          title: "Help",
          tabBarIcon: ({ color, size }) => (
            <HelpCircleIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
