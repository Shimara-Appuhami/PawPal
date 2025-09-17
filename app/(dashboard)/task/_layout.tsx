import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TaskLayout() {
  return (
    <View className="flex-1 bg-white">
      {/* header */}
      {/* <View className="bg-orange-500 p-4 flex-row justify-between items-center">
        <Text className="text-white text-lg font-bold">Pet Tasks</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-white font-semibold">Back</Text>
        </TouchableOpacity>
      </View> */}

      <Slot />
    </View>
  );
}
