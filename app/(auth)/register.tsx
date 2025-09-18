import { register } from "@/services/authService";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserPlus,
} from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPasword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isLodingReg, setIsLoadingReg] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );
  const isPasswordValid = useMemo(() => password.length >= 8, [password]);
  const doPasswordsMatch = useMemo(
    () => confirmPassword.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );

  const canSubmit =
    isEmailValid && isPasswordValid && doPasswordsMatch && !isLodingReg;

  const handleRegister = async () => {
    if (isLodingReg) return;

    if (!isEmailValid) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      Alert.alert("Weak password", "Use at least 8 characters.");
      return;
    }
    if (!doPasswordsMatch) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    setIsLoadingReg(true);
    await register(email.trim(), password)
      .then(() => {
        router.back();
      })
      .catch(() => {
        Alert.alert(
          "Registration failed",
          "Something went wrong. Please try again."
        );
      })
      .finally(() => {
        setIsLoadingReg(false);
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* light decorative blobs */}
      <View
        style={{
          position: "absolute",
          top: -60,
          right: -80,
          width: 220,
          height: 220,
          borderRadius: 200,
          backgroundColor: "rgba(14,165,233,0.10)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: 260,
          backgroundColor: "rgba(236,72,153,0.08)",
        }}
      />

      {/* Header */}
      <View
        style={{
          paddingTop: 24,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(14,165,233,0.12)",
          }}
        >
          <ArrowLeft size={18} color="#0EA5E9" />
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: "rgba(14,165,233,0.08)",
            borderRadius: 14,
          }}
        >
          <Image
            source={require("../../assets/logo/logo.png")}
            style={{ width: 22, height: 22, borderRadius: 4 }}
          />
          <Text style={{ color: "#0EA5E9", marginLeft: 8, fontWeight: "700" }}>
            PawPal
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#0F172A" }}>
          Create your account
        </Text>
        <Text style={{ color: "#64748B", marginTop: 6 }}>
          Join the community of pet lovers.
        </Text>
      </View>

      {/* Form Card */}
      <View
        style={{
          marginTop: 12,
          marginHorizontal: 20,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 16,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{ fontWeight: "700", color: "#334155", marginBottom: 8 }}
          >
            Email
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor:
                isEmailValid || email.length === 0 ? "#E5E7EB" : "#FCA5A5",
              borderRadius: 14,
              paddingHorizontal: 12,
              height: 52,
            }}
          >
            <Mail size={18} color="#6B7280" />
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={{ flex: 1, color: "#0F172A", marginLeft: 10 }}
            />
          </View>
          {!isEmailValid && email.length > 0 && (
            <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>
              Enter a valid email address.
            </Text>
          )}
        </View>

        {/* Password */}
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{ fontWeight: "700", color: "#334155", marginBottom: 8 }}
          >
            Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor:
                isPasswordValid || password.length === 0
                  ? "#E5E7EB"
                  : "#FCA5A5",
              borderRadius: 14,
              paddingHorizontal: 12,
              height: 52,
            }}
          >
            <Lock size={18} color="#6B7280" />
            <TextInput
              placeholder="Create a strong password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPasword}
              autoCapitalize="none"
              style={{ flex: 1, color: "#0F172A", marginLeft: 10 }}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
              {showPassword ? (
                <EyeOff size={18} color="#6B7280" />
              ) : (
                <Eye size={18} color="#6B7280" />
              )}
            </Pressable>
          </View>
          {!isPasswordValid && password.length > 0 && (
            <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>
              At least 8 characters required.
            </Text>
          )}
        </View>

        {/* Confirm password */}
        <View>
          <Text
            style={{ fontWeight: "700", color: "#334155", marginBottom: 8 }}
          >
            Confirm password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor:
                doPasswordsMatch || confirmPassword.length === 0
                  ? "#E5E7EB"
                  : "#FCA5A5",
              borderRadius: 14,
              paddingHorizontal: 12,
              height: 52,
            }}
          >
            <Lock size={18} color="#6B7280" />
            <TextInput
              placeholder="Re-enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              style={{ flex: 1, color: "#0F172A", marginLeft: 10 }}
            />
            <Pressable
              onPress={() => setShowConfirmPassword((s) => !s)}
              hitSlop={10}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} color="#6B7280" />
              ) : (
                <Eye size={18} color="#6B7280" />
              )}
            </Pressable>
          </View>
          {!doPasswordsMatch && confirmPassword.length > 0 && (
            <Text style={{ color: "#DC2626", marginTop: 6, fontSize: 12 }}>
              Passwords do not match.
            </Text>
          )}
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleRegister}
          disabled={!canSubmit}
          android_ripple={{ color: "rgba(14,165,233,0.12)", borderless: true }}
          style={{
            marginTop: 18,
            backgroundColor: canSubmit ? "#0ea5e9" : "rgba(14,165,233,0.35)",
            height: 56,
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
              <UserPlus size={18} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                  marginLeft: 8,
                  fontSize: 16,
                }}
              >
                Create account
              </Text>
            </>
          )}
        </Pressable>

        <Text
          style={{
            color: "#64748B",
            fontSize: 12,
            marginTop: 12,
            textAlign: "center",
          }}
        >
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </View>

      {/* Footer link */}
      <Pressable onPress={() => router.back()} style={{ marginTop: 18 }}>
        <Text
          style={{ textAlign: "center", color: "#0EA5E9", fontWeight: "800" }}
        >
          Already have an account? Log in
        </Text>
      </Pressable>
    </View>
  );
};
export default Register;
