import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  collection,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { db } from "../config";
import type { ICoach, ICoachOnboardingData } from "@/models";

export async function createCoachProfile(
  data: ICoachOnboardingData,
  userEmail: string,
  fullName: string
) {
  const coachRef = doc(db, "coaches", data.userId);
  const coachData = {
    id: data.userId,
    userId: data.userId,
    userRef: doc(db, "users", data.userId),
    email: userEmail,
    fullName: fullName,
    title: data.title,
    bio: data.bio,
    style: data.style,
    specialties: data.specialties,
    pastCompanies: data.pastCompanies,
    linkedinUrl: data.linkedinUrl,
    availability: data.availability,
    hourlyRate: data.hourlyRate,
    rating: 0,
    totalReviews: 0,
    totalSessions: 0,
    isActive: false,
    isVerified: false,
    qualifications: [],
    languages: ["English"],
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(coachRef, coachData, { merge: true });
  return coachRef.id;
}

export async function updateCoachProfile(
  coachId: string,
  data: Partial<ICoach>
) {
  const coachRef = doc(db, "coaches", coachId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(coachRef, updateData);
}

export async function deleteCoachProfile(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  return deleteDoc(coachRef);
}

export async function getCoachProfile(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  const coachSnap = await getDoc(coachRef);

  if (coachSnap.exists()) {
    return { id: coachSnap.id, ...coachSnap.data() } as ICoach;
  }
  return null;
}

export async function getCoach(coachRef: DocumentReference) {
  const coachSnap = await getDoc(coachRef);

  if (coachSnap.exists()) {
    return { id: coachSnap.id, ...coachSnap.data() } as ICoach;
  }
  return null;
}

export async function getCoachBySlug(slug: string) {
  const q = query(collection(db, "coaches"), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ICoach;
  }
  return null;
}

export async function getActiveCoaches(limitCount: number = 10) {
  const q = query(
    collection(db, "coaches"),
    where("isActive", "==", true),
    where("isVerified", "==", true),
    orderBy("rating", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ICoach[];
}

export async function getCoachesBySpecialty(specialty: string) {
  const q = query(
    collection(db, "coaches"),
    where("specialties", "array-contains", specialty),
    where("isActive", "==", true),
    orderBy("rating", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ICoach[];
}

export async function updateCoachRating(
  coachId: string,
  newRating: number,
  totalReviews: number
) {
  const coachRef = doc(db, "coaches", coachId);
  return updateDoc(coachRef, {
    rating: newRating,
    totalReviews: totalReviews,
    updatedAt: serverTimestamp(),
  });
}

export async function activateCoach(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  return updateDoc(coachRef, {
    isActive: true,
    isVerified: true,
    updatedAt: serverTimestamp(),
  });
}

export async function deactivateCoach(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  return updateDoc(coachRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}
