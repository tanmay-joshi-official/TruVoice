import "./global.css";
import { View, Text } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-3xl font-bold text-white">
        Welcome to TrueVoice
      </Text>
    </View>
  );
}