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
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "../client";
import type { ISession } from "@/models";

export async function createSession(data: {
  programId: string;
  coachId: string;
  studentIds: string[];
  title?: string;
  description?: string;
  scheduledTime: Date;
  duration: number;
  meetLink?: string;
  googleEventId?: string;
}) {
  const sessionsCollection = collection(db, "sessions");

  const sessionData = {
    programRef: doc(db, "programs", data.programId),
    coachRef: doc(db, "coaches", data.coachId),
    studentRefs: data.studentIds.map((id) => doc(db, "students", id)),
    title: data.title,
    description: data.description,
    scheduledTime: data.scheduledTime,
    duration: data.duration,
    status: "scheduled" as const,
    meetLink: data.meetLink,
    googleEventId: data.googleEventId,
    notes: "",
    recordings: [],
    attendance: [],
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(sessionsCollection, sessionData);
}

export async function updateSession(
  sessionId: string,
  data: Partial<ISession>
) {
  const sessionRef = doc(db, "sessions", sessionId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(sessionRef, updateData);
}

export async function deleteSession(sessionId: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  return deleteDoc(sessionRef);
}

export async function getSession(sessionId: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (sessionSnap.exists()) {
    return { id: sessionSnap.id, ...sessionSnap.data() } as ISession;
  }
  return null;
}

export async function getSessionsByCoach(
  coachId: string,
  limitCount: number = 10
) {
  const coachRef = doc(db, "coaches", coachId);
  const q = query(
    collection(db, "sessions"),
    where("coachRef", "==", coachRef),
    orderBy("scheduledTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ISession[];
}

export async function getSessionsByStudent(
  studentId: string,
  limitCount: number = 10
) {
  const studentRef = doc(db, "students", studentId);
  const q = query(
    collection(db, "sessions"),
    where("studentRefs", "array-contains", studentRef),
    orderBy("scheduledTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ISession[];
}

export async function getSessionsByProgram(programId: string) {
  const programRef = doc(db, "programs", programId);
  const q = query(
    collection(db, "sessions"),
    where("programRef", "==", programRef),
    orderBy("scheduledTime", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ISession[];
}

export async function getUpcomingSessions(limitCount: number = 10) {
  const now = new Date();
  const q = query(
    collection(db, "sessions"),
    where("scheduledTime", ">=", now),
    where("status", "==", "scheduled"),
    orderBy("scheduledTime", "asc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ISession[];
}

export async function startSession(sessionId: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  return updateDoc(sessionRef, {
    status: "in-progress",
    updatedAt: serverTimestamp(),
  });
}

export async function completeSession(sessionId: string, notes?: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  return updateDoc(sessionRef, {
    status: "completed",
    notes: notes || "",
    updatedAt: serverTimestamp(),
  });
}

export async function cancelSession(sessionId: string, reason?: string) {
  const sessionRef = doc(db, "sessions", sessionId);
  return updateDoc(sessionRef, {
    status: "cancelled",
    notes: reason || "",
    updatedAt: serverTimestamp(),
  });
}

export async function addSessionRecording(
  sessionId: string,
  recording: {
    title: string;
    url: string;
    duration: number;
    isPublic: boolean;
  }
) {
  const sessionRef = doc(db, "sessions", sessionId);
  const recordingData = {
    id: crypto.randomUUID(),
    ...recording,
    uploadedAt: new Date(),
  };

  return updateDoc(sessionRef, {
    recordings: arrayUnion(recordingData),
    updatedAt: serverTimestamp(),
  });
}

export async function markAttendance(
  sessionId: string,
  studentId: string,
  attended: boolean
) {
  const sessionRef = doc(db, "sessions", sessionId);
  const attendanceData = {
    studentRef: doc(db, "students", studentId),
    attended: attended,
    joinTime: attended ? new Date() : undefined,
    leaveTime: undefined,
    participationScore: undefined,
  };

  return updateDoc(sessionRef, {
    attendance: arrayUnion(attendanceData),
    updatedAt: serverTimestamp(),
  });
}
