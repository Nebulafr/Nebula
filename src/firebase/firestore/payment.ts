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
import type { IPayment } from "@/models";

export async function createPayment(data: {
  userId: string;
  enrollmentId?: string;
  programId?: string;
  amount: number;
  currency?: string;
  paymentMethod: IPayment["paymentMethod"];
  stripePaymentIntentId?: string;
}) {
  const paymentsCollection = collection(db, "payments");

  const paymentData = {
    userRef: doc(db, "users", data.userId),
    enrollmentRef: data.enrollmentId
      ? doc(db, "enrollments", data.enrollmentId)
      : null,
    programRef: data.programId ? doc(db, "programs", data.programId) : null,
    amount: data.amount,
    currency: data.currency || "USD",
    paymentMethod: data.paymentMethod,
    status: "pending" as const,
    stripePaymentIntentId: data.stripePaymentIntentId,
    refundAmount: 0,
    refundReason: null,
    failureReason: null,
    metadata: {},
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(paymentsCollection, paymentData);
}

export async function updateIPayment(
  paymentId: string,
  data: Partial<IPayment>
) {
  const paymentRef = doc(db, "payments", paymentId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(paymentRef, updateData);
}

export async function deleteIPayment(paymentId: string) {
  const paymentRef = doc(db, "payments", paymentId);
  return deleteDoc(paymentRef);
}

export async function getIPayment(paymentId: string) {
  const paymentRef = doc(db, "payments", paymentId);
  const paymentSnap = await getDoc(paymentRef);

  if (paymentSnap.exists()) {
    return { id: paymentSnap.id, ...paymentSnap.data() } as IPayment;
  }
  return null;
}

export async function getIPaymentsByUser(
  userId: string,
  limitCount: number = 20
) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "payments"),
    where("userRef", "==", userRef),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayment[];
}

export async function getIPaymentsByEnrollment(enrollmentId: string) {
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  const q = query(
    collection(db, "payments"),
    where("enrollmentRef", "==", enrollmentRef),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayment[];
}

export async function getIPaymentsByProgram(
  programId: string,
  limitCount: number = 50
) {
  const programRef = doc(db, "programs", programId);
  const q = query(
    collection(db, "payments"),
    where("programRef", "==", programRef),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayment[];
}

export async function getIPaymentsByStatus(
  status: IPayment["status"],
  limitCount: number = 50
) {
  const q = query(
    collection(db, "payments"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayment[];
}

export async function getIPaymentByStripeId(stripeIPaymentIntentId: string) {
  const q = query(
    collection(db, "payments"),
    where("stripeIPaymentIntentId", "==", stripeIPaymentIntentId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IPayment;
  }
  return null;
}

export async function completeIPayment(
  paymentId: string,
  metadata?: Record<string, any>
) {
  const paymentRef = doc(db, "payments", paymentId);
  return updateDoc(paymentRef, {
    status: "completed",
    metadata: metadata || {},
    updatedAt: serverTimestamp(),
  });
}

export async function failIPayment(paymentId: string, reason: string) {
  const paymentRef = doc(db, "payments", paymentId);
  return updateDoc(paymentRef, {
    status: "failed",
    failureReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function refundIPayment(
  paymentId: string,
  amount: number,
  reason: string
) {
  const paymentRef = doc(db, "payments", paymentId);
  return updateDoc(paymentRef, {
    status: "refunded",
    refundAmount: amount,
    refundReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelIPayment(paymentId: string) {
  const paymentRef = doc(db, "payments", paymentId);
  return updateDoc(paymentRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function getRevenueByPeriod(startDate: Date, endDate: Date) {
  const q = query(
    collection(db, "payments"),
    where("status", "==", "completed"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const payments = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayment[];

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const refundedAmount = payments.reduce(
    (sum, payment) => sum + (payment.refundAmount || 0),
    0
  );

  return {
    totalRevenue,
    netRevenue: totalRevenue - refundedAmount,
    totalIPayments: payments.length,
    refundedAmount,
    payments,
  };
}
