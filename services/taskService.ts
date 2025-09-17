import { db } from "@/firebase";
import { Pet } from "@/types/pet";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export const petsRef = collection(db, "pets"); 

// Get all pets 
export const getAllPetsByUserId = async (userId: string) => {
  const userPetsRef = collection(db, "users", userId, "pets");
  const snapshot = await getDocs(userPetsRef);
  const petList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Pet[];
  return petList;
};

export const getAllPets = async () => {
  const snapshot = await getDocs(petsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Pet[];
};

export const getPetById = async (userId: string, petId: string) => {
  const petDocRef = doc(db, "users", userId, "pets", petId);
  const snapshot = await getDoc(petDocRef);
  return snapshot.exists()
    ? ({
        id: snapshot.id,
        ...snapshot.data(),
      } as Pet)
    : null;
};

export const createPet = async (userId: string, pet: Pet) => {
  const userPetsRef = collection(db, "users", userId, "pets");
  const docRef = await addDoc(userPetsRef, pet);
  return docRef.id;
};

export const updatePet = async (userId: string, petId: string, pet: Pet) => {
  const petDocRef = doc(db, "users", userId, "pets", petId);
  const { id, ...petData } = pet; // remove id
  return updateDoc(petDocRef, petData);
};

export const deletePet = async (userId: string, petId: string) => {
  const petDocRef = doc(db, "users", userId, "pets", petId);
  return deleteDoc(petDocRef);
};
