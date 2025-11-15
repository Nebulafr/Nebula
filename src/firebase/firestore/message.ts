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
import type { IMessage } from "@/models";

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  type?: IMessage["type"];
}) {
  const messagesCollection = collection(db, "messages");

  const messageData = {
    conversationRef: doc(db, "conversations", data.conversationId),
    senderRef: doc(db, "users", data.senderId),
    content: data.content,
    type: data.type || "text",
    isRead: false,
    isEdited: false,
    reactions: [],
    attachments: [],
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(messagesCollection, messageData);
}

export async function updateMessage(
  messageId: string,
  data: Partial<IMessage>
) {
  const messageRef = doc(db, "messages", messageId);
  const updateData = {
    ...data,
    isEdited: true,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(messageRef, updateData);
}

export async function deleteMessage(messageId: string) {
  const messageRef = doc(db, "messages", messageId);
  return deleteDoc(messageRef);
}

export async function getMessage(messageId: string) {
  const messageRef = doc(db, "messages", messageId);
  const messageSnap = await getDoc(messageRef);

  if (messageSnap.exists()) {
    return { id: messageSnap.id, ...messageSnap.data() } as IMessage;
  }
  return null;
}

export async function getMessagesByConversation(
  conversationId: string,
  limitCount: number = 50
) {
  const conversationRef = doc(db, "conversations", conversationId);
  const q = query(
    collection(db, "messages"),
    where("conversationRef", "==", conversationRef),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IMessage[];
}

export async function getMessagesBySender(
  senderId: string,
  limitCount: number = 50
) {
  const senderRef = doc(db, "users", senderId);
  const q = query(
    collection(db, "messages"),
    where("senderRef", "==", senderRef),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IMessage[];
}

export async function markMessageAsRead(messageId: string) {
  const messageRef = doc(db, "messages", messageId);
  return updateDoc(messageRef, {
    isRead: true,
    updatedAt: serverTimestamp(),
  });
}

export async function markConversationMessagesAsRead(
  conversationId: string,
  userId: string
) {
  const conversationRef = doc(db, "conversations", conversationId);
  const userRef = doc(db, "users", userId);

  // Get all unread messages in the conversation not sent by the current user
  const q = query(
    collection(db, "messages"),
    where("conversationRef", "==", conversationRef),
    where("isRead", "==", false),
    where("senderRef", "!=", userRef)
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

export async function addMessageReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const messageRef = doc(db, "messages", messageId);
  const message = await getMessage(messageId);

  if (!message) throw new Error("IMessage not found");

  const existingReaction = message.reactions?.find((r) => r.userId === userId);
  let reactions = message.reactions || [];

  if (existingReaction) {
    // Update existing reaction
    reactions = reactions.map((r) =>
      r.userId === userId ? { ...r, emoji } : r
    );
  } else {
    // Add new reaction
    reactions.push({
      userId,
      userRef: doc(db, "users", userId),
      emoji,
      createdAt: new Date(),
    });
  }

  return updateDoc(messageRef, {
    reactions,
    updatedAt: serverTimestamp(),
  });
}

export async function removeMessageReaction(messageId: string, userId: string) {
  const messageRef = doc(db, "messages", messageId);
  const message = await getMessage(messageId);

  if (!message) throw new Error("IMessage not found");

  const reactions = (message.reactions || []).filter(
    (r) => r.userId !== userId
  );

  return updateDoc(messageRef, {
    reactions,
    updatedAt: serverTimestamp(),
  });
}
