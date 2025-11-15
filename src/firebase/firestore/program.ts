import {
  doc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { IProgram } from "@/models";

export async function createProgram(data: {
  title: string;
  category: string;
  description: string;
  objectives: string[];
  coachId: string;
  price?: number;
  duration?: string;
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  maxStudents?: number;
  tags?: string[];
  prerequisites?: string[];
  materials?: string[];
}) {
  const programsCollection = collection(db, "programs");

  const programData = {
    title: data.title,
    category: data.category,
    description: data.description,
    objectives: data.objectives,
    coachRef: doc(db, "coaches", data.coachId),
    slug: data.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, ""),
    rating: 0,
    totalReviews: 0,
    price: data.price,
    duration: data.duration,
    difficultyLevel: data.difficultyLevel,
    maxStudents: data.maxStudents,
    currentEnrollments: 0,
    isActive: true,
    tags: data.tags || [],
    prerequisites: data.prerequisites || [],
    materials: data.materials || [],
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(programsCollection, programData);
}

export async function updateProgram(
  programId: string,
  data: Partial<IProgram>
) {
  const programRef = doc(db, "programs", programId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.title) {
    updateData.slug = data.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }

  return updateDoc(programRef, updateData);
}

export async function deleteProgram(programId: string) {
  const programRef = doc(db, "programs", programId);
  return deleteDoc(programRef);
}

export async function getProgram(programId: string) {
  const programRef = doc(db, "programs", programId);
  const programSnap = await getDoc(programRef);

  if (programSnap.exists()) {
    return { id: programSnap.id, ...programSnap.data() } as IProgram;
  }
  return null;
}

export async function getProgramBySlug(slug: string) {
  const q = query(collection(db, "programs"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IProgram;
  }
  return null;
}

export async function getProgramsByCoach(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  const q = query(
    collection(db, "programs"),
    where("coachRef", "==", coachRef),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IProgram[];
}

export async function getActivePrograms(limitCount: number = 10) {
  const q = query(
    collection(db, "programs"),
    where("isActive", "==", true),
    orderBy("rating", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IProgram[];
}
