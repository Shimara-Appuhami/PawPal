import { Stack } from "expo-router";
import React from "react";

const HealthLayout = () => {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      {/* Health Records List */}
      <Stack.Screen name="index" options={{ title: "Health Records" }} />

      {/* Single Record or Add Form */}
      <Stack.Screen
        name="HealthRecordScreen"
        options={{ title: "Health Record" }}
      />

      {/* Optional: Add New Record Screen */}
      <Stack.Screen name="add" options={{ title: "Add Health Record" }} />
    </Stack>
  );
};

export default HealthLayout;
