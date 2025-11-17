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
import { db } from "../client";
import type { IEnrollment } from "@/models";

export async function createEnrollment(data: {
  studentId: string;
  programId: string;
  coachId: string;
  time: string;
  amountPaid?: number;
}) {
  const enrollmentsCollection = collection(db, "enrollments");

  const enrollmentData = {
    studentRef: doc(db, "students", data.studentId),
    programRef: doc(db, "programs", data.programId),
    coachRef: doc(db, "coaches", data.coachId),
    status: "active" as const,
    enrollmentDate: new Date(),
    time: data.time,
    progress: 0,
    paymentStatus: "pending" as const,
    amountPaid: data.amountPaid || 0,
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(enrollmentsCollection, enrollmentData);
}

export async function updateEnrollment(
  enrollmentId: string,
  data: Partial<IEnrollment>
) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(enrollmentRef, updateData);
}

export async function deleteEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return deleteDoc(enrollmentRef);
}

export async function getEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  const enrollmentSnap = await getDoc(enrollmentRef);

  if (enrollmentSnap.exists()) {
    return { id: enrollmentSnap.id, ...enrollmentSnap.data() } as IEnrollment;
  }
  return null;
}

export async function getEnrollmentsByStudent(studentId: string) {
  const studentRef = doc(db, "students", studentId);
  const q = query(
    collection(db, "enrollments"),
    where("studentRef", "==", studentRef),
    orderBy("enrollmentDate", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEnrollment[];
}

export async function getEnrollmentsByProgram(programId: string) {
  const programRef = doc(db, "programs", programId);
  const q = query(
    collection(db, "enrollments"),
    where("programRef", "==", programRef),
    orderBy("enrollmentDate", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEnrollment[];
}

export async function getEnrollmentsByCoach(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  const q = query(
    collection(db, "enrollments"),
    where("coachRef", "==", coachRef),
    orderBy("enrollmentDate", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEnrollment[];
}

export async function getActiveEnrollments(limitCount: number = 10) {
  const q = query(
    collection(db, "enrollments"),
    where("status", "==", "active"),
    orderBy("enrollmentDate", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEnrollment[];
}

export async function completeEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return updateDoc(enrollmentRef, {
    status: "completed",
    completionDate: new Date(),
    progress: 100,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return updateDoc(enrollmentRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function pauseEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return updateDoc(enrollmentRef, {
    status: "paused",
    updatedAt: serverTimestamp(),
  });
}

export async function resumeEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return updateDoc(enrollmentRef, {
    status: "active",
    updatedAt: serverTimestamp(),
  });
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  progress: number
) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return updateDoc(enrollmentRef, {
    progress: Math.max(0, Math.min(100, progress)), // Ensure between 0-100
    updatedAt: serverTimestamp(),
  });
}

export async function updatePaymentStatus(
  enrollmentId: string,
  paymentStatus: IEnrollment["paymentStatus"]
) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  return updateDoc(enrollmentRef, {
    paymentStatus,
    updatedAt: serverTimestamp(),
  });
}
