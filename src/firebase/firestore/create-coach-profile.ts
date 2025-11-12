
'use client';

import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export async function createCoachProfile(
  db: Firestore,
  userId: string,
  data: {
    title: string;
    bio: string;
    style: string;
    specialties: string[];
    pastCompanies: string[];
    linkedinUrl: string;
    availability: string;
    hourlyRate: number;
  },
) {
  const coachRef = doc(db, 'coaches', userId);
  const coachData = {
    ...data,
    userRef: doc(db, 'users', userId),
    createdAt: serverTimestamp(),
  };
  return setDoc(coachRef, coachData, { merge: true });
}
