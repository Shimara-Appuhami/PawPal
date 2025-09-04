import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { HealthRecords } from "./(tasks)/HelthScreen";
import HomeScreen from "./(tasks)/HomeScreen";
import PetProfiles from "./(tasks)/PetProfile";
import { Reminders } from "./(tasks)/ReminderScreen";
import { DashboardLayout } from "./(tasks)/_layout";

export function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "reminders":
        return <Reminders />;
      case "health":
        return <HealthRecords />;
      case "pets":
        return <PetProfiles />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // light gray bg
  },
  content: {
    flex: 1,
  },
});
