import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  collection,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "../client";
import type {
  IStudent,
  IStudentOnboardingData,
  IStudentPreferences,
} from "@/models";

export async function createStudentProfile(
  userId: string,
  data: IStudentOnboardingData,
  userEmail: string,
  fullName: string
) {
  const studentRef = doc(db, "students", userId);
  const studentData = {
    id: userId,
    userId: userId,
    userRef: doc(db, "users", userId),
    email: userEmail,
    fullName: fullName,
    interestedProgram: data.interestedProgram,
    skillLevel: data.skillLevel as "beginner" | "intermediate" | "advanced",
    commitment: data.commitment,
    learningGoals: [],
    currentLevel: data.skillLevel,
    timeZone: "UTC",
    enrolledPrograms: [],
    completedSessions: [],
    upcomingSessions: [],
    preferences: {
      timezone: "UTC",
      notifications: true,
    } as IStudentPreferences,
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return setDoc(studentRef, studentData, { merge: true });
}

export async function updateStudentProfile(
  studentId: string,
  data: Partial<IStudent>
) {
  const studentRef = doc(db, "students", studentId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(studentRef, updateData);
}

export async function deleteStudentProfile(studentId: string) {
  const studentRef = doc(db, "students", studentId);
  return deleteDoc(studentRef);
}

export async function getStudentProfile(studentId: string) {
  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    return { id: studentSnap.id, ...studentSnap.data() } as IStudent;
  }
  return null;
}

export async function enrollStudentInProgram(
  studentId: string,
  programId: string
) {
  const studentRef = doc(db, "students", studentId);
  return updateDoc(studentRef, {
    enrolledPrograms: arrayUnion(programId),
    updatedAt: serverTimestamp(),
  });
}

export async function unenrollStudentFromProgram(
  studentId: string,
  programId: string
) {
  const studentRef = doc(db, "students", studentId);
  return updateDoc(studentRef, {
    enrolledPrograms: arrayRemove(programId),
    updatedAt: serverTimestamp(),
  });
}

export async function addCompletedSession(
  studentId: string,
  sessionId: string
) {
  const studentRef = doc(db, "students", studentId);
  return updateDoc(studentRef, {
    completedSessions: arrayUnion(sessionId),
    upcomingSessions: arrayRemove(sessionId),
    updatedAt: serverTimestamp(),
  });
}

export async function addUpcomingSession(studentId: string, sessionId: string) {
  const studentRef = doc(db, "students", studentId);
  return updateDoc(studentRef, {
    upcomingSessions: arrayUnion(sessionId),
    updatedAt: serverTimestamp(),
  });
}

export async function updateStudentPreferences(
  studentId: string,
  preferences: Partial<IStudent["preferences"]>
) {
  const studentRef = doc(db, "students", studentId);
  return updateDoc(studentRef, {
    preferences: preferences,
    updatedAt: serverTimestamp(),
  });
}

export async function getStudentsByProgram(programId: string) {
  const q = query(
    collection(db, "students"),
    where("enrolledPrograms", "array-contains", programId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IStudent[];
}

export async function getActiveStudents(limitCount: number = 10) {
  const q = query(
    collection(db, "students"),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IStudent[];
}
