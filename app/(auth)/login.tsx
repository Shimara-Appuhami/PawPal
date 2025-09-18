import { login } from "@/services/authService";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
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

  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState<string>("");
  const [fpSending, setFpSending] = useState(false);

  const openForgot = () => {
    setFpEmail(email || "");
    setForgotOpen(true);
  };

  const handleSendReset = async () => {
    if (!fpEmail.trim()) {
      Alert.alert("Missing email", "Please enter your email.");
      return;
    }
    try {
      setFpSending(true);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, fpEmail.trim());
      Alert.alert(
        "Password reset link sent",
        `Check your email (${fpEmail}) for instructions.`
      );
      setForgotOpen(false);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Failed to send reset email.");
    } finally {
      setFpSending(false);
    }
  };

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
        Alert.alert("Login failed", "Something went wrong");
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
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.15)" }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 25,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Image
                source={require("../../assets/logo/logo.png")}
                style={{ width: 56, height: 56, marginBottom: 10 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#fff" }}>
                Welcome back
              </Text>
              <Text style={{ color: "#e5e7eb", marginTop: 2 }}>
                Sign in to continue
              </Text>
            </View>

            <BlurView
              intensity={60}
              tint="light"
              style={{ borderRadius: 18, overflow: "hidden", marginBottom: 16 }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  padding: 16,
                }}
              >
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      marginBottom: 6,
                      color: "#0f172a",
                    }}
                  >
                    Email
                  </Text>
                  <View style={{ position: "relative" }}>
                    <Mail
                      size={20}
                      color="#6b7280"
                      style={{ position: "absolute", top: 12, left: 12 }}
                    />
                    <TextInput
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor="#6b7280"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 44,
                        color: "#111827",
                      }}
                    />
                  </View>
                </View>

                <Text
                  style={{
                    fontWeight: "700",
                    marginBottom: 6,
                    color: "#0f172a",
                  }}
                >
                  Password
                </Text>
                <View style={{ position: "relative" }}>
                  <Lock
                    size={20}
                    color="#6b7280"
                    style={{ position: "absolute", top: 12, left: 12 }}
                  />
                  <TextInput
                    placeholder="Your password"
                    value={password}
                    onChangeText={setPasword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#6b7280"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.85)",
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 44,
                      color: "#111827",
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword((s) => !s)}
                    style={{ position: "absolute", right: 12, top: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </Pressable>
                </View>

                <Pressable
                  onPress={openForgot}
                  style={{ alignSelf: "flex-end", marginTop: 8 }}
                >
                  <Text style={{ color: "#0ea5e9", fontWeight: "700" }}>
                    Forgot password?
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleLogin}
                  disabled={isLodingReg}
                  style={{
                    marginTop: 16,
                    backgroundColor: "#0ea5e9",
                    height: 52,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
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
                        }}
                      >
                        Login
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </BlurView>

            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "800",
                }}
              >
                Don't have an account? Register
              </Text>
            </Pressable>
          </ScrollView>

          <Modal
            visible={forgotOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setForgotOpen(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "800", marginBottom: 12 }}
                >
                  Reset your password
                </Text>

                <TextInput
                  placeholder="Enter your email"
                  value={fpEmail}
                  onChangeText={setFpEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9CA3AF"
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 14,
                    color: "#111827",
                  }}
                />

                <Pressable
                  onPress={handleSendReset}
                  disabled={fpSending}
                  style={{
                    backgroundColor: "#0ea5e9",
                    height: 48,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {fpSending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "800" }}>
                      Send reset link
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setForgotOpen(false)}
                  style={{ marginTop: 12, alignSelf: "center" }}
                >
                  <Text style={{ color: "#64748B", fontWeight: "700" }}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Login;
