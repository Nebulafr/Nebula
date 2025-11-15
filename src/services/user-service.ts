import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { IUser as UserModel } from "@/models";

/**
 * Get user by email and role from users collection
 */
export async function getUserByEmailAndRole(
  email: string,
  role: "student" | "coach" | "admin"
): Promise<UserModel | null> {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", "==", email),
      where("role", "==", role),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return userDoc.data() as UserModel;
  } catch (error) {
    console.error("Error getting user by email and role:", error);
    return null;
  }
}
