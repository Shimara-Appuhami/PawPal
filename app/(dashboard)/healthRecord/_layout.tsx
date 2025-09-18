import { Stack } from "expo-router";
import React from "react";

const HealthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Health Record" }} />

      {/* <Stack.Screen name="add" options={{ title: "Add Health Record" }} /> */}
    </Stack>
  );
};

export default HealthLayout;
