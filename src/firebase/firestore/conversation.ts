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
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db } from "../client";
import type { IConversation } from "@/models";

export async function createConversation(data: {
  participantIds: string[];
  type?: IConversation["type"];
  title?: string;
}) {
  const conversationsCollection = collection(db, "conversations");

  const conversationData = {
    participantRefs: data.participantIds.map((id) => doc(db, "users", id)),
    type: data.type || "direct",
    title: data.title,
    lastMessage: null,
    lastMessageTime: null,
    isArchived: false,
    unreadCounts: data.participantIds.reduce(
      (acc, id) => ({ ...acc, [id]: 0 }),
      {}
    ),
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(conversationsCollection, conversationData);
}

export async function updateConversation(
  conversationId: string,
  data: Partial<IConversation>
) {
  const conversationRef = doc(db, "conversations", conversationId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(conversationRef, updateData);
}

export async function deleteConversation(conversationId: string) {
  const conversationRef = doc(db, "conversations", conversationId);
  return deleteDoc(conversationRef);
}

export async function getConversation(conversationId: string) {
  const conversationRef = doc(db, "conversations", conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (conversationSnap.exists()) {
    return {
      id: conversationSnap.id,
      ...conversationSnap.data(),
    } as IConversation;
  }
  return null;
}

export async function getConversationsByUser(
  userId: string,
  limitCount: number = 20
) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "conversations"),
    where("participantRefs", "array-contains", userRef),
    where("isArchived", "==", false),
    orderBy("lastMessageTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IConversation[];
}

export async function getArchivedConversations(
  userId: string,
  limitCount: number = 20
) {
  const userRef = doc(db, "users", userId);
  const q = query(
    collection(db, "conversations"),
    where("participantRefs", "array-contains", userRef),
    where("isArchived", "==", true),
    orderBy("updatedAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IConversation[];
}

export async function findDirectConversation(userId1: string, userId2: string) {
  const user1Ref = doc(db, "users", userId1);
  const user2Ref = doc(db, "users", userId2);

  const q = query(
    collection(db, "conversations"),
    where("type", "==", "direct"),
    where("participantRefs", "array-contains", user1Ref)
  );

  const querySnapshot = await getDocs(q);
  const conversation = querySnapshot.docs.find((doc) => {
    const data = doc.data() as IConversation;
    return data.participantRefs.some((ref) => ref.id === userId2);
  });

  if (conversation) {
    return { id: conversation.id, ...conversation.data() } as IConversation;
  }
  return null;
}

export async function updateLastMessage(
  conversationId: string,
  lastMessage: string,
  senderId: string
) {
  const conversationRef = doc(db, "conversations", conversationId);
  const conversation = await getConversation(conversationId);

  if (!conversation) throw new Error("IConversation not found");

  // Update unread counts for all participants except the sender
  const newUnreadCounts = { ...conversation.unreadCounts };
  Object.keys(newUnreadCounts).forEach((userId) => {
    if (userId !== senderId) {
      newUnreadCounts[userId] = (newUnreadCounts[userId] || 0) + 1;
    }
  });

  return updateDoc(conversationRef, {
    lastMessage,
    lastMessageTime: new Date(),
    unreadCounts: newUnreadCounts,
    updatedAt: serverTimestamp(),
  });
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
) {
  const conversationRef = doc(db, "conversations", conversationId);
  const conversation = await getConversation(conversationId);

  if (!conversation) throw new Error("IConversation not found");

  const newUnreadCounts = { ...conversation.unreadCounts };
  newUnreadCounts[userId] = 0;

  return updateDoc(conversationRef, {
    unreadCounts: newUnreadCounts,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveConversation(conversationId: string) {
  const conversationRef = doc(db, "conversations", conversationId);
  return updateDoc(conversationRef, {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
}

export async function unarchiveConversation(conversationId: string) {
  const conversationRef = doc(db, "conversations", conversationId);
  return updateDoc(conversationRef, {
    isArchived: false,
    updatedAt: serverTimestamp(),
  });
}

export async function addParticipant(conversationId: string, userId: string) {
  const conversationRef = doc(db, "conversations", conversationId);
  const userRef = doc(db, "users", userId);
  const conversation = await getConversation(conversationId);

  if (!conversation) throw new Error("IConversation not found");

  const newUnreadCounts = { ...conversation.unreadCounts, [userId]: 0 };

  return updateDoc(conversationRef, {
    participantRefs: arrayUnion(userRef),
    unreadCounts: newUnreadCounts,
    updatedAt: serverTimestamp(),
  });
}

export async function removeParticipant(
  conversationId: string,
  userId: string
) {
  const conversationRef = doc(db, "conversations", conversationId);
  const userRef = doc(db, "users", userId);
  const conversation = await getConversation(conversationId);

  if (!conversation) throw new Error("IConversation not found");

  const newUnreadCounts = { ...conversation.unreadCounts };
  delete newUnreadCounts[userId];

  return updateDoc(conversationRef, {
    participantRefs: arrayRemove(userRef),
    unreadCounts: newUnreadCounts,
    updatedAt: serverTimestamp(),
  });
}
