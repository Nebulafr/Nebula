import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../client";
import type { User } from "firebase/auth";

export async function createUserDocument(
  user: User,
  role: "student" | "coach" | "admin",
  fullName?: string | null
) {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userData = {
    uid: user.uid,
    email: user.email,
    role: role,
    fullName: fullName,
    avatarUrl: user.photoURL,
    createdAt: serverTimestamp(),
  };
  return setDoc(userRef, userData, { merge: true });
}
