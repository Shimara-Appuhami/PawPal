import { Stack } from "expo-router";
import React from "react";

const TaskLayout = () => {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Pet Form" }} />
    </Stack>
  );
};

export default TaskLayout;
