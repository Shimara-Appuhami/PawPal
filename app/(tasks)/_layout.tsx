// components/Navigation.tsx
import { Calendar, Dog, Heart, Home } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardLayout({ activeTab, setActiveTab }: NavigationProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "reminders", icon: Calendar, label: "Reminders" },
    { id: "health", icon: Heart, label: "Health" },
    { id: "pets", icon: Dog, label: "Pets" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => setActiveTab(item.id)}
            >
              <Icon
                size={24}
                color={isActive ? "#ea580c" : "#6b7280"} // Orange active, gray inactive
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? "#ea580c" : "#6b7280" },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 5,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});
