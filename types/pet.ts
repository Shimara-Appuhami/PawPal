// src/types/pet.ts

export interface Pet {
  id?: string;       // Firestore document ID
  name: string;      // Pet name
  age: string;       // Pet age (can be string or number depending on your input)
  type: string;      // Pet type (Dog, Cat, etc.)
}
