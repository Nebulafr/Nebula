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
import type { INotification } from "@/models";

export async function createNotification(data: {
  userId: string;
  type: INotification["type"];
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
}) {
  const notificationsCollection = collection(db, "notifications");

  const notificationData = {
    userRef: doc(db, "users", data.userId),
    type: data.type,
    title: data.title,
    message: data.message,
    actionUrl: data.actionUrl,
    isRead: false,
    data: data.data || {},
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(notificationsCollection, notificationData);
}

export async function updateNotification(
  notificationId: string,
  data: Partial<INotification>
) {
  const notificationRef = doc(db, "notifications", notificationId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(notificationRef, updateData);
}

export async function deleteNotification(notificationId: string) {
  const notificationRef = doc(db, "notifications", notificationId);
  return deleteDoc(notificationRef);
}

export async function getNotification(notificationId: string) {
  const notificationRef = doc(db, "notifications", notificationId);
  const notificationSnap = await getDoc(notificationRef);

  if (notificationSnap.exists()) {
    return {
      id: notificationSnap.id,
      ...notificationSnap.data(),
    } as INotification;
  }
  return null;
}

export async function getNotificationsByUser(
  userId: string,
  limitCount: number = 50
) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as INotification[];
}

export async function getUnreadNotifications(
  userId: string,
  limitCount: number = 50
) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef),
    where("isRead", "==", false),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as INotification[];
}

export async function getNotificationsByType(
  userId: string,
  type: INotification["type"],
  limitCount: number = 20
) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef),
    where("type", "==", type),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as INotification[];
}

export async function markNotificationAsRead(notificationId: string) {
  const notificationRef = doc(db, "notifications", notificationId);
  return updateDoc(notificationRef, {
    isRead: true,
    updatedAt: serverTimestamp(),
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef),
    where("isRead", "==", false)
  );

  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map((doc) =>
    updateDoc(doc.ref, {
      isRead: true,
      updatedAt: serverTimestamp(),
    })
  );

  return Promise.all(updatePromises);
}

export async function getUnreadNotificationCount(userId: string) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef),
    where("isRead", "==", false)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
}

export async function deleteAllNotifications(userId: string) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef)
  );

  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

  return Promise.all(deletePromises);
}

export async function deleteOldNotifications(
  userId: string,
  olderThanDays: number = 30
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "notifications"),
    where("userRef", "==", userRef),
    where("createdAt", "<=", cutoffDate)
  );

  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

  return Promise.all(deletePromises);
}

// INotification creation helpers for common scenarios
export async function createSessionNotification(
  userId: string,
  sessionTitle: string,
  sessionTime: Date,
  sessionId: string
) {
  return createNotification({
    userId,
    type: "session_reminder",
    title: "Upcoming ISession",
    message: `Your session "${sessionTitle}" starts at ${sessionTime.toLocaleString()}`,
    actionUrl: `/sessions/${sessionId}`,
    data: { sessionId, sessionTime: sessionTime.toISOString() },
  });
}

export async function createEnrollmentNotification(
  userId: string,
  programTitle: string,
  enrollmentId: string
) {
  return createNotification({
    userId,
    type: "enrollment",
    title: "Successfully Enrolled",
    message: `You have been enrolled in "${programTitle}"`,
    actionUrl: `/programs/${enrollmentId}`,
    data: { enrollmentId },
  });
}

export async function createPaymentNotification(
  userId: string,
  amount: number,
  currency: string,
  paymentId: string
) {
  return createNotification({
    userId,
    type: "payment",
    title: "Payment Processed",
    message: `Your payment of ${currency} ${amount} has been processed successfully`,
    actionUrl: `/payments/${paymentId}`,
    data: { paymentId, amount, currency },
  });
}

export async function createMessageNotification(
  userId: string,
  senderName: string,
  conversationId: string
) {
  return createNotification({
    userId,
    type: "message",
    title: "New IMessage",
    message: `You have a new message from ${senderName}`,
    actionUrl: `/conversations/${conversationId}`,
    data: { conversationId },
  });
}
