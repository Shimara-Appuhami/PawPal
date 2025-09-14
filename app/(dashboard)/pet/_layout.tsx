import { Stack } from "expo-router";
import React from "react";

const TaskLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="[id]" options={{ title: "Pet Form" }} /> */}
    </Stack>
  );
};

export default TaskLayout;
