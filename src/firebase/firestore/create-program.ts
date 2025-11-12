'use client';

import { doc, serverTimestamp, type Firestore, collection, addDoc } from 'firebase/firestore';

export async function createProgram(
  db: Firestore,
  coachId: string,
  data: {
    title: string;
    category: string;
    description: string;
    objectives: string[];
  },
) {
  const programsCollection = collection(db, 'programs');
  
  const programData = {
    ...data,
    coachRef: doc(db, 'coaches', coachId),
    createdAt: serverTimestamp(),
    slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    rating: 0, // Initial rating
  };
  
  return addDoc(programsCollection, programData);
}
