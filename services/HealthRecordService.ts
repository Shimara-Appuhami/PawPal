import { auth, db } from "@/firebase";
import { HealthRecord } from "@/types/HealthRecord";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";


export const healthRecordService = {
  getRecords: async (petId: string): Promise<HealthRecord[]> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const recordsRef = collection(
      db,
      `users/${user.uid}/pets/${petId}/healthRecords`
    );
    const snapshot = await getDocs(recordsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HealthRecord[];
  },

  addRecord: async (petId: string, record: HealthRecord) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const recordsRef = collection(
      db,
      `users/${user.uid}/pets/${petId}/healthRecords`
    );
    await addDoc(recordsRef, {
      title: record.title,
      notes: record.notes || "",
      createdAt: serverTimestamp(),
    });
  },
};
