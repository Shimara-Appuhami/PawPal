// src/services/petService.ts
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

// Reference to pets collection
export const petsRef = collection(db, "pets"); // top-level, but we will use userId for subcollection

// Get all pets for a specific user
export const getAllPetsByUserId = async (userId: string) => {
  const userPetsRef = collection(db, "users", userId, "pets");
  const snapshot = await getDocs(userPetsRef);
  const petList = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Pet[];
  return petList;
};

// Get all pets (not filtered by user)
export const getAllPets = async () => {
  const snapshot = await getDocs(petsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Pet[];
};

// Get a pet by ID
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

// Create a new pet
export const createPet = async (userId: string, pet: Pet) => {
  const userPetsRef = collection(db, "users", userId, "pets");
  const docRef = await addDoc(userPetsRef, pet);
  return docRef.id;
};

// Update a pet
export const updatePet = async (userId: string, petId: string, pet: Pet) => {
  const petDocRef = doc(db, "users", userId, "pets", petId);
  const { id, ...petData } = pet; // remove id
  return updateDoc(petDocRef, petData);
};

// Delete a pet
export const deletePet = async (userId: string, petId: string) => {
  const petDocRef = doc(db, "users", userId, "pets", petId);
  return deleteDoc(petDocRef);
};
