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
import { db } from "../config";
import type { IEvent } from "@/models";

export async function createEvent(data: {
  title: string;
  description?: string;
  type: IEvent["type"];
  startTime: Date;
  endTime: Date;
  location?: string;
  organizerId: string;
  attendeeIds?: string[];
  maxAttendees?: number;
  isPublic?: boolean;
  tags?: string[];
  sessionId?: string;
  programId?: string;
}) {
  const eventsCollection = collection(db, "events");

  const eventData = {
    title: data.title,
    description: data.description || "",
    type: data.type,
    organizerRef: doc(db, "users", data.organizerId),
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    isVirtual: !data.location,
    meetLink: undefined,
    capacity: data.maxAttendees,
    currentAttendees: 0,
    price: undefined,
    isPublic: data.isPublic || false,
    tags: data.tags || [],
    status: "published" as const,
    slug: undefined,
    attendeeRefs: data.attendeeIds
      ? data.attendeeIds.map((id) => doc(db, "users", id))
      : [],
    maxAttendees: data.maxAttendees,
    sessionRef: data.sessionId ? doc(db, "sessions", data.sessionId) : null,
    programRef: data.programId ? doc(db, "programs", data.programId) : null,
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(eventsCollection, eventData);
}

export async function updateEvent(eventId: string, data: Partial<IEvent>) {
  const eventRef = doc(db, "events", eventId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(eventRef, updateData);
}

export async function deleteEvent(eventId: string) {
  const eventRef = doc(db, "events", eventId);
  return deleteDoc(eventRef);
}

export async function getEvent(eventId: string) {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (eventSnap.exists()) {
    return { id: eventSnap.id, ...eventSnap.data() } as IEvent;
  }
  return null;
}

export async function getEventsByOrganizer(
  organizerId: string,
  limitCount: number = 20
) {
  const organizerRef = doc(db, "users", organizerId);
  const q = query(
    collection(db, "events"),
    where("organizerRef", "==", organizerRef),
    orderBy("startTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEvent[];
}

export async function getEventsByAttendee(
  attendeeId: string,
  limitCount: number = 20
) {
  const attendeeRef = doc(db, "users", attendeeId);
  const q = query(
    collection(db, "events"),
    where("attendeeRefs", "array-contains", attendeeRef),
    orderBy("startTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEvent[];
}

export async function getEventsByProgram(
  programId: string,
  limitCount: number = 50
) {
  const programRef = doc(db, "programs", programId);
  const q = query(
    collection(db, "events"),
    where("programRef", "==", programRef),
    orderBy("startTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEvent[];
}

export async function getUpcomingEvents(
  limitCount: number = 20,
  isPublic?: boolean
) {
  const now = new Date();
  let q = query(
    collection(db, "events"),
    where("startTime", ">=", now),
    where("status", "==", "scheduled"),
    orderBy("startTime", "asc"),
    limit(limitCount)
  );

  if (isPublic !== undefined) {
    q = query(
      collection(db, "events"),
      where("startTime", ">=", now),
      where("status", "==", "scheduled"),
      where("isPublic", "==", isPublic),
      orderBy("startTime", "asc"),
      limit(limitCount)
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEvent[];
}

export async function getEventsByType(
  type: IEvent["type"],
  limitCount: number = 20
) {
  const q = query(
    collection(db, "events"),
    where("type", "==", type),
    orderBy("startTime", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEvent[];
}

export async function getEventsByDateRange(
  startDate: Date,
  endDate: Date,
  limitCount: number = 50
) {
  const q = query(
    collection(db, "events"),
    where("startTime", ">=", startDate),
    where("startTime", "<=", endDate),
    orderBy("startTime", "asc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IEvent[];
}

export async function addEventAttendee(eventId: string, attendeeId: string) {
  const eventRef = doc(db, "events", eventId);
  const attendeeRef = doc(db, "users", attendeeId);
  const event = await getEvent(eventId);

  if (!event) throw new Error("IEvent not found");

  const newCurrentAttendees = (event.currentAttendees || 0) + 1;

  return updateDoc(eventRef, {
    attendeeRefs: arrayUnion(attendeeRef),
    currentAttendees: newCurrentAttendees,
    updatedAt: serverTimestamp(),
  });
}

export async function removeEventAttendee(eventId: string, attendeeId: string) {
  const eventRef = doc(db, "events", eventId);
  const attendeeRef = doc(db, "users", attendeeId);
  const event = await getEvent(eventId);

  if (!event) throw new Error("IEvent not found");

  const newCurrentAttendees = Math.max(0, (event.currentAttendees || 0) - 1);

  return updateDoc(eventRef, {
    attendeeRefs: arrayRemove(attendeeRef),
    currentAttendees: newCurrentAttendees,
    updatedAt: serverTimestamp(),
  });
}

export async function startEvent(eventId: string) {
  const eventRef = doc(db, "events", eventId);
  return updateDoc(eventRef, {
    status: "in-progress",
    updatedAt: serverTimestamp(),
  });
}

export async function completeEvent(eventId: string) {
  const eventRef = doc(db, "events", eventId);
  return updateDoc(eventRef, {
    status: "completed",
    updatedAt: serverTimestamp(),
  });
}

export async function cancelEvent(eventId: string) {
  const eventRef = doc(db, "events", eventId);
  return updateDoc(eventRef, {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function postponeEvent(
  eventId: string,
  newStartTime: Date,
  newEndTime: Date
) {
  const eventRef = doc(db, "events", eventId);
  return updateDoc(eventRef, {
    startTime: newStartTime,
    endTime: newEndTime,
    status: "postponed",
    updatedAt: serverTimestamp(),
  });
}

export async function getEventCapacity(eventId: string) {
  const event = await getEvent(eventId);
  if (!event) return null;

  // Use both model fields and additional attendee tracking
  const currentAttendees = Math.max(
    event.currentAttendees || 0,
    event.attendeeRefs?.length || 0
  );
  const maxAttendees = event.capacity || event.maxAttendees || Infinity;

  return {
    currentAttendees,
    maxAttendees,
    availableSpots:
      maxAttendees === Infinity ? Infinity : maxAttendees - currentAttendees,
    isFull: maxAttendees !== Infinity && currentAttendees >= maxAttendees,
  };
}

export async function isUserAttending(eventId: string, userId: string) {
  const event = await getEvent(eventId);
  if (!event) return false;

  return event.attendeeRefs?.some((ref) => ref.id === userId) || false;
}
