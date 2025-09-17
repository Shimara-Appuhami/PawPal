import { useRouter } from "expo-router";
import { PawPrint, Syringe } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Vaccine = {
  name: string;
  months: number[]; // months after birth (e.g., 2, 3, 4, 12)
  notes?: string;
};

type Breed = {
  id: string;
  name: string;
  species: "Dog" | "Cat";
  vaccines: Vaccine[];
};

const BREEDS: Breed[] = [
  {
    id: "lab",
    name: "Labrador Retriever",
    species: "Dog",
    vaccines: [
      {
        name: "DAPP/DHPP (Core)",
        months: [2, 3, 4, 12],
        notes: "Puppy series + 12 mo booster, then q1–3y.",
      },
      {
        name: "Rabies (Core)",
        months: [4, 12],
        notes: "Follow local law thereafter (q1–3y).",
      },
      {
        name: "Leptospirosis",
        months: [3, 4, 12],
        notes: "Annual after puppy series.",
      },
      {
        name: "Bordetella",
        months: [2, 12],
        notes: "Annual; semi-annual if high exposure.",
      },
    ],
  },
  {
    id: "gsd",
    name: "German Shepherd",
    species: "Dog",
    vaccines: [
      { name: "DAPP/DHPP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      {
        name: "Rabies (Core)",
        months: [4, 12],
        notes: "Then q1–3y as per law.",
      },
      {
        name: "Leptospirosis",
        months: [3, 4, 12],
        notes: "Annual thereafter.",
      },
      {
        name: "Lyme (Risk-based)",
        months: [3, 4, 12],
        notes: "Annual if tick exposure.",
      },
    ],
  },
  {
    id: "poodle",
    name: "Poodle",
    species: "Dog",
    vaccines: [
      { name: "DAPP/DHPP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      {
        name: "Rabies (Core)",
        months: [4, 12],
        notes: "Then per local regulation.",
      },
      {
        name: "Bordetella (Lifestyle)",
        months: [2, 12],
        notes: "Annual; consider before boarding/grooming.",
      },
    ],
  },
  {
    id: "golden",
    name: "Golden Retriever",
    species: "Dog",
    vaccines: [
      { name: "DAPP/DHPP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      { name: "Rabies (Core)", months: [4, 12], notes: "Then q1–3y." },
      {
        name: "Leptospirosis",
        months: [3, 4, 12],
        notes: "Annual thereafter.",
      },
      {
        name: "Bordetella",
        months: [2, 12],
        notes: "Annual; consider semi-annual for social dogs.",
      },
    ],
  },
  {
    id: "persian",
    name: "Persian",
    species: "Cat",
    vaccines: [
      { name: "FVRCP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      { name: "Rabies (Core)", months: [4, 12], notes: "Then per local law." },
      {
        name: "FeLV (Lifestyle)",
        months: [2, 3, 12],
        notes: "Annual if outdoor or multi-cat home.",
      },
    ],
  },
  {
    id: "siamese",
    name: "Siamese",
    species: "Cat",
    vaccines: [
      { name: "FVRCP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      { name: "Rabies (Core)", months: [4, 12], notes: "Then per local law." },
      {
        name: "FeLV (Lifestyle)",
        months: [2, 3, 12],
        notes: "Annual if exposure risk.",
      },
    ],
  },
  {
    id: "maine-coon",
    name: "Maine Coon",
    species: "Cat",
    vaccines: [
      { name: "FVRCP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      { name: "Rabies (Core)", months: [4, 12], notes: "Then per local law." },
      {
        name: "FeLV (Lifestyle)",
        months: [2, 3, 12],
        notes: "Annual if outdoor.",
      },
    ],
  },
  {
    id: "american-bully",
    name: "American Bully",
    species: "Dog",
    vaccines: [
      { name: "DAPP/DHPP (Core)", months: [2, 3, 4, 12], notes: "Then q1–3y." },
      { name: "Rabies (Core)", months: [4, 12], notes: "Then per regulation." },
      {
        name: "Leptospirosis",
        months: [3, 4, 12],
        notes: "Annual thereafter.",
      },
      {
        name: "Bordetella (Lifestyle)",
        months: [2, 12],
        notes: "Annual; semi-annual if high exposure.",
      },
    ],
  },
  {
    id: "dog-generic",
    name: "Dog (General)",
    species: "Dog",
    vaccines: [
      {
        name: "DAPP/DHPP (Core)",
        months: [2, 3, 4, 12],
        notes: "Core puppy series; booster q1–3y.",
      },
      {
        name: "Rabies (Core)",
        months: [4, 12],
        notes: "Then q1–3y per local law.",
      },
      {
        name: "Leptospirosis (Risk)",
        months: [3, 4, 12],
        notes: "Annual if regional risk.",
      },
      {
        name: "Bordetella (Lifestyle)",
        months: [2, 12],
        notes: "Annual; before boarding/social events.",
      },
      {
        name: "Lyme (Risk)",
        months: [3, 4, 12],
        notes: "Annual if tick exposure.",
      },
    ],
  },
  {
    id: "cat-generic",
    name: "Cat (General)",
    species: "Cat",
    vaccines: [
      { name: "FVRCP (Core)", months: [2, 3, 4, 12], notes: "Booster q1–3y." },
      { name: "Rabies (Core)", months: [4, 12], notes: "Then per local law." },
      {
        name: "FeLV (Lifestyle)",
        months: [2, 3, 12],
        notes: "Annual if outdoor / multi-cat / risk.",
      },
    ],
  },
];
// Add placeholder user breed hook (replace with real auth/context later)
const useUserBreeds = () => {
  // TODO: integrate with real user data
  return {
    breedIds: [
      "lab",
      "persian",
      "golden",
      "american-bully",
      "dog-generic",
      "cat-generic",
    ],
  };
};
// Fuzzy helpers for tolerant search
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
const levenshtein = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
};

export default function VaccinationsScreen() {
  const [query, setQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const router = useRouter();
  const { breedIds } = useUserBreeds();
  const userBreeds = useMemo(
    () => BREEDS.filter((b) => breedIds.includes(b.id)),
    [breedIds]
  );
  const filteredBreeds = useMemo(() => {
    const q = query.trim();
    if (!q) return userBreeds;
    const qNorm = normalize(q);
    // Primary exact/substring filter
    let primary = userBreeds.filter(
      (b) =>
        b.name.toLowerCase().includes(q.toLowerCase()) ||
        b.species.toLowerCase().includes(q.toLowerCase())
    );
    if (primary.length > 0) return primary;
    // Fuzzy fallback
    const fuzzy = userBreeds.filter((b) => {
      const n = normalize(b.name);
      if (n.includes(qNorm)) return true;
      const dist = levenshtein(qNorm, n);
      return (
        qNorm.length > 2 && dist <= Math.min(2, Math.floor(qNorm.length / 3))
      );
    });
    return fuzzy.length ? fuzzy : userBreeds;
  }, [query, userBreeds]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.headerIcon}>
              <PawPrint size={18} color="#0EA5E9" />
            </View>
            <Text style={styles.headerTitle}>Vaccinations</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Keep your pets protected</Text>
      </View>

      {!selectedBreed ? (
        <View style={styles.listWrapper}>
          <Text style={styles.title}>Select a pet breed</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search breeds (e.g., Labrador, Persian, Cat)..."
            placeholderTextColor="#999"
            style={styles.input}
          />
          <FlatList
            data={filteredBreeds}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedBreed(item)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.995 }] },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.chipSmall}>{item.species}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No breeds found.</Text>
              </View>
            }
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.detailWrapper}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.navRow}>
            <Pressable
              onPress={() => setSelectedBreed(null)}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>‹ Breeds Home</Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={styles.navBtnSecondary}
            >
              <Text style={styles.navBtnSecondaryText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>{selectedBreed.name}</Text>
          <Text style={styles.subtitle}>{selectedBreed.species}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Vaccination schedule (by months)
            </Text>
            <Text style={styles.helperText}>
              Months are counted from birth. Always follow your veterinarian’s
              guidance and local regulations.
            </Text>
          </View>

          {selectedBreed.vaccines.map((vaccine) => (
            <View key={vaccine.name} style={styles.vaccineCard}>
              <View style={styles.vaccineTitleRow}>
                <Syringe size={16} color="#0EA5E9" />
                <Text style={styles.vaccineTitle}>{vaccine.name}</Text>
              </View>
              <View style={styles.monthsRow}>
                {vaccine.months
                  .slice()
                  .sort((a, b) => a - b)
                  .map((m) => (
                    <View key={m} style={styles.monthChip}>
                      <Text style={styles.monthChipText}>{m} mo</Text>
                    </View>
                  ))}
              </View>
              {!!vaccine.notes && (
                <Text style={styles.notes}>{vaccine.notes}</Text>
              )}
            </View>
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 8 : 12,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#0EA5E9",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  headerSubtitle: { color: "#FFFFFF", opacity: 0.9 },

  listWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  detailWrapper: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: { fontSize: 13, color: "#6B7280", marginBottom: 12 },

  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    color: "#111827",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  chipSmall: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  chevron: { color: "#9CA3AF", fontSize: 26, marginLeft: 8 },

  emptyState: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#6B7280" },

  section: { marginTop: 8, marginBottom: 8 },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  helperText: { color: "#6B7280", fontSize: 12 },

  vaccineCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  vaccineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  vaccineTitle: { color: "#111827", fontSize: 15, fontWeight: "800" },

  monthsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  monthChip: {
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginRight: 8,
    marginBottom: 8,
  },
  monthChipText: { color: "#1D4ED8", fontSize: 12, fontWeight: "700" },
  notes: { color: "#6B7280", fontSize: 12, marginTop: 8 },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  navBtnText: { color: "#111827", fontSize: 13, fontWeight: "800" },
  navBtnSecondary: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  navBtnSecondaryText: { color: "#374151", fontSize: 13, fontWeight: "700" },
});
