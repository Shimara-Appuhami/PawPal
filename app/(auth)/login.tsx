import { login } from "@/services/authService";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPasword] = useState<string>("");
  const [isLodingReg, setIsLoadingReg] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (isLodingReg) return;
    setIsLoadingReg(true);
    await login(email, password)
      .then((res) => {
        console.log(res);
        router.push("/(dashboard)/HomeScreen");
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Login failed", "Somthing went wrong");
      })
      .finally(() => {
        setIsLoadingReg(false);
      });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/hero.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
      resizeMethod="resize"
      imageStyle={{
        width: "100%",
        height: "100%",
        transform: [{ scale: 1.05 }],
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 25,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff" }}>
                Welcome back
              </Text>
              <Text style={{ color: "#e5e7eb", marginTop: 2 }}>
                Sign in to continue
              </Text>
            </View>

            <BlurView
              intensity={0}
              tint="light"
              style={{ borderRadius: 18, overflow: "hidden", marginBottom: 16 }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  padding: 16,
                }}
              >
                {/* Email */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </Text>
                  <View style={{ position: "relative" }}>
                    <View
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                      }}
                    >
                      <Mail size={20} color="#6b7280" />
                    </View>
                    <TextInput
                      placeholder="you@example.com"
                      placeholderTextColor="#6b7280"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={{
                        borderWidth: 0,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 44,
                        color: "#111827",
                      }}
                    />
                  </View>
                </View>

                {/* Password */}
                <View>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    Password
                  </Text>
                  <View style={{ position: "relative" }}>
                    <View
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                      }}
                    >
                      <Lock size={20} color="#6b7280" />
                    </View>
                    <TextInput
                      placeholder="Your password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPasword}
                      style={{
                        borderWidth: 0,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 44,
                        paddingRight: 44,
                        color: "#111827",
                      }}
                    />
                    <Pressable
                      onPress={() => setShowPassword((s) => !s)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 10,
                        padding: 4,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6b7280" />
                      ) : (
                        <Eye size={20} color="#6b7280" />
                      )}
                    </Pressable>
                  </View>
                </View>

                {/* Login Button */}
                <Pressable
                  onPress={handleLogin}
                  disabled={isLodingReg}
                  android_ripple={{
                    color: "rgba(255,255,255,0.3)",
                    borderless: true,
                  }}
                  style={{
                    marginTop: 16,
                    backgroundColor: "#10b981",
                    height: 52,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    opacity: email && password ? 1 : 0.8,
                  }}
                >
                  {isLodingReg ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <LogIn size={18} color="#fff" />
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                          marginLeft: 8,
                          fontSize: 16,
                        }}
                      >
                        Login
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </BlurView>

            <Pressable
              onPress={() => router.push("/(auth)/register")}
              style={{ marginTop: 16 }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "800",
                  textDecorationLine: "underline",
                }}
              >
                Don't have an account? Register
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Login;
