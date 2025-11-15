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
import type { IPayout } from "@/models";

export async function createPayout(data: {
  coachId: string;
  amount: number;
  currency?: string;
  paymentIds?: string[];
  stripeTransferId?: string;
}) {
  const payoutsCollection = collection(db, "payouts");

  const payoutData = {
    coachRef: doc(db, "coaches", data.coachId),
    amount: data.amount,
    currency: data.currency || "USD",
    status: "pending" as const,
    paymentRefs: data.paymentIds
      ? data.paymentIds.map((id) => doc(db, "payments", id))
      : [],
    stripeTransferId: data.stripeTransferId,
    failureReason: null,
    metadata: {},
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(payoutsCollection, payoutData);
}

export async function updatePayout(payoutId: string, data: Partial<IPayout>) {
  const payoutRef = doc(db, "payouts", payoutId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(payoutRef, updateData);
}

export async function deletePayout(payoutId: string) {
  const payoutRef = doc(db, "payouts", payoutId);
  return deleteDoc(payoutRef);
}

export async function getPayout(payoutId: string) {
  const payoutRef = doc(db, "payouts", payoutId);
  const payoutSnap = await getDoc(payoutRef);

  if (payoutSnap.exists()) {
    return { id: payoutSnap.id, ...payoutSnap.data() } as IPayout;
  }
  return null;
}

export async function getPayoutsByCoach(
  coachId: string,
  limitCount: number = 20
) {
  const coachRef = doc(db, "coaches", coachId);
  const q = query(
    collection(db, "payouts"),
    where("coachRef", "==", coachRef),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayout[];
}

export async function getPayoutsByStatus(
  status: IPayout["status"],
  limitCount: number = 50
) {
  const q = query(
    collection(db, "payouts"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayout[];
}

export async function getPendingPayouts(limitCount: number = 50) {
  return getPayoutsByStatus("pending", limitCount);
}

export async function getCompletedPayouts(limitCount: number = 50) {
  return getPayoutsByStatus("completed", limitCount);
}

export async function getFailedPayouts(limitCount: number = 50) {
  return getPayoutsByStatus("failed", limitCount);
}

export async function getPayoutByStripeId(stripeTransferId: string) {
  const q = query(
    collection(db, "payouts"),
    where("stripeTransferId", "==", stripeTransferId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IPayout;
  }
  return null;
}

export async function completePayout(
  payoutId: string,
  stripeTransferId?: string,
  metadata?: Record<string, any>
) {
  const payoutRef = doc(db, "payouts", payoutId);
  return updateDoc(payoutRef, {
    status: "completed",
    stripeTransferId: stripeTransferId || null,
    metadata: metadata || {},
    updatedAt: serverTimestamp(),
  });
}

export async function failPayout(payoutId: string, reason: string) {
  const payoutRef = doc(db, "payouts", payoutId);
  return updateDoc(payoutRef, {
    status: "failed",
    failureReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function processPayout(payoutId: string) {
  const payoutRef = doc(db, "payouts", payoutId);
  return updateDoc(payoutRef, {
    status: "processing",
    updatedAt: serverTimestamp(),
  });
}

export async function getCoachEarnings(
  coachId: string,
  startDate?: Date,
  endDate?: Date
) {
  const coachRef = doc(db, "coaches", coachId);
  let q = query(
    collection(db, "payouts"),
    where("coachRef", "==", coachRef),
    where("status", "==", "completed"),
    orderBy("createdAt", "desc")
  );

  if (startDate && endDate) {
    q = query(
      collection(db, "payouts"),
      where("coachRef", "==", coachRef),
      where("status", "==", "completed"),
      where("createdAt", ">=", startDate),
      where("createdAt", "<=", endDate),
      orderBy("createdAt", "desc")
    );
  }

  const querySnapshot = await getDocs(q);
  const payouts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayout[];

  const totalEarnings = payouts.reduce((sum, payout) => sum + payout.amount, 0);

  return {
    totalEarnings,
    totalPayouts: payouts.length,
    payouts,
  };
}

export async function getCoachPendingEarnings(coachId: string) {
  const coachRef = doc(db, "coaches", coachId);
  const q = query(
    collection(db, "payouts"),
    where("coachRef", "==", coachRef),
    where("status", "in", ["pending", "processing"]),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  const pendingPayouts = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IPayout[];

  const pendingAmount = pendingPayouts.reduce(
    (sum, payout) => sum + payout.amount,
    0
  );

  return {
    pendingAmount,
    pendingPayouts: pendingPayouts.length,
    payouts: pendingPayouts,
  };
}
