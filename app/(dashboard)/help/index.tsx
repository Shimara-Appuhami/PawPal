import {
  ArrowUpRight,
  AtSign,
  BookOpen,
  CalendarCheck2,
  HeartPulse,
  LifeBuoy,
  MapPin,
  MessageSquare,
  PawPrint,
  PhoneCall,
  Sparkles,
} from "lucide-react-native";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HelpScreen() {
  const steps = [
    {
      icon: <PawPrint size={20} color="#0EA5E9" />,
      bg: "rgba(14,165,233,0.12)",
      title: "Add your pets",
      desc: "Create profiles with photos, breed, and age.",
    },
    {
      icon: <CalendarCheck2 size={20} color="#22C55E" />,
      bg: "rgba(34,197,94,0.12)",
      title: "Plan care tasks",
      desc: "Schedule feeding, grooming, walks, and meds.",
    },
    {
      icon: <HeartPulse size={20} color="#F43F5E" />,
      bg: "rgba(244,63,94,0.12)",
      title: "Health records",
      desc: "Store vet visits, notes, and scans securely.",
    },
    {
      icon: <MapPin size={20} color="#A855F7" />,
      bg: "rgba(168,85,247,0.12)",
      title: "Find clinics",
      desc: "Use the vet map to locate nearby clinics.",
    },
    {
      icon: <BookOpen size={20} color="#FB923C" />,
      bg: "rgba(251,146,60,0.12)",
      title: "Learn & improve",
      desc: "Follow tips to keep your pets happier.",
    },
  ];

  const contacts = [
    {
      title: "Email Support",
      subtitle: "shimarailshani@gmail.com",
      icon: <AtSign size={20} color="#0EA5E9" />,
      tint: "rgba(14,165,233,0.12)",
      onPress: () => Linking.openURL("mailto:shimarailshani@gmail.com"),
    },
    {
      title: "Call Us",
      subtitle: "+94 75 040 7672",
      icon: <PhoneCall size={20} color="#22C55E" />,
      tint: "rgba(34,197,94,0.12)",
      onPress: () => Linking.openURL("tel:+94750407672"),
    },
    {
      title: "WhatsApp",
      subtitle: "Chat with our team",
      icon: <MessageSquare size={20} color="#A855F7" />,
      tint: "rgba(168,85,247,0.12)",
      onPress: () =>
        Linking.openURL(
          "https://wa.me/94750407672?text=Hello,%20I%20need%20help"
        ),
    },
  ];

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 44;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#F8FAFC",
      }}
    >
      <View
        style={{
          backgroundColor: "#0ea5e9",
          paddingTop: topPad,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          elevation: 4,
          marginHorizontal: -20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          overflow: "hidden",
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#0ea5e9" />
        <View
          style={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            position: "absolute",
            left: -20,
            top: -20,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
              Help & Support
            </Text>
            <Text style={{ color: "#e5e7eb", marginTop: 2 }}>
              We’re here to help you
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 12,
            }}
          >
            <LifeBuoy size={18} color="#fff" />
          </View>
        </View>
      </View>

      {/* hero header */}
      <View
        style={{ marginBottom: 16, flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "rgba(99,102,241,0.12)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Sparkles size={20} color="#6366F1" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#0F172A" }}>
          How to use PawPal
        </Text>
      </View>
      <Text style={{ color: "#475569", marginBottom: 14 }}>
        Get started in minutes. Organize your pets, stay on top of tasks, and
        keep health data in one place.
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {steps.map((s, i) => (
          <View
            key={i}
            style={{
              width: "48%",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: s.bg,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              {s.icon}
            </View>
            <Text
              style={{ fontWeight: "800", color: "#0F172A", marginBottom: 4 }}
            >
              {s.title}
            </Text>
            <Text style={{ color: "#64748B" }}>{s.desc}</Text>
          </View>
        ))}
      </View>

      <View
        style={{ marginTop: 18, flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "rgba(2,132,199,0.12)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <LifeBuoy size={20} color="#0284C7" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A" }}>
          Need Help?
        </Text>
      </View>
      <Text style={{ color: "#475569", marginTop: 6, marginBottom: 12 }}>
        Reach us through any of the options below. We’re happy to assist.
      </Text>

      <View style={{ gap: 12 }}>
        {contacts.map((c, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={c.onPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 14,
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 5,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: c.tint,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {c.icon}
              </View>
              <View>
                <Text style={{ fontWeight: "800", color: "#0F172A" }}>
                  {c.title}
                </Text>
                <Text style={{ color: "#64748B", marginTop: 2 }}>
                  {c.subtitle}
                </Text>
              </View>
            </View>
            <ArrowUpRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
