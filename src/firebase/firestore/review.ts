"use client";

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
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import type { IReview } from "@/models";

export async function createReview(data: {
  reviewerId: string;
  revieweeId: string;
  targetId: string;
  targetType: "program" | "coach" | "session";
  rating: number;
  title?: string;
  content: string;
  tags?: string[];
}) {
  const reviewsCollection = collection(db, "reviews");

  const reviewData = {
    reviewerRef: doc(db, "users", data.reviewerId),
    revieweeRef: doc(db, "users", data.revieweeId),
    targetRef: doc(
      db,
      data.targetType === "program"
        ? "programs"
        : data.targetType === "coach"
        ? "coaches"
        : "sessions",
      data.targetId
    ),
    targetType: data.targetType,
    rating: Math.max(1, Math.min(5, data.rating)), // Ensure rating is between 1-5
    title: data.title,
    content: data.content,
    isVerified: false,
    isPublic: true,
    helpfulCount: 0,
    tags: data.tags || [],
    createdAt: Timestamp.now(),
    updatedAt: serverTimestamp(),
  };

  const reviewRef = await addDoc(reviewsCollection, reviewData);

  // Update target's rating statistics
  await updateTargetRating(data.targetId, data.targetType, data.rating);

  return reviewRef;
}

export async function updateReview(reviewId: string, data: Partial<IReview>) {
  const reviewRef = doc(db, "reviews", reviewId);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  return updateDoc(reviewRef, updateData);
}

export async function deleteReview(reviewId: string) {
  const reviewRef = doc(db, "reviews", reviewId);
  return deleteDoc(reviewRef);
}

export async function getReview(reviewId: string) {
  const reviewRef = doc(db, "reviews", reviewId);
  const reviewSnap = await getDoc(reviewRef);

  if (reviewSnap.exists()) {
    return { id: reviewSnap.id, ...reviewSnap.data() } as IReview;
  }
  return null;
}

export async function getReviewsByTarget(
  targetId: string,
  targetType: "program" | "coach" | "session",
  limitCount: number = 10
) {
  const targetRef = doc(
    db,
    targetType === "program"
      ? "programs"
      : targetType === "coach"
      ? "coaches"
      : "sessions",
    targetId
  );
  const q = query(
    collection(db, "reviews"),
    where("targetRef", "==", targetRef),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IReview[];
}

export async function getReviewsByReviewer(reviewerId: string) {
  const reviewerRef = doc(db, "users", reviewerId);
  const q = query(
    collection(db, "reviews"),
    where("reviewerRef", "==", reviewerRef),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IReview[];
}

export async function getReviewsByReviewee(revieweeId: string) {
  const revieweeRef = doc(db, "users", revieweeId);
  const q = query(
    collection(db, "reviews"),
    where("revieweeRef", "==", revieweeRef),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IReview[];
}

export async function getTopRatedReviews(limitCount: number = 10) {
  const q = query(
    collection(db, "reviews"),
    where("isPublic", "==", true),
    where("rating", ">=", 4),
    orderBy("helpfulCount", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as IReview[];
}

export async function markReviewHelpful(reviewId: string) {
  const reviewRef = doc(db, "reviews", reviewId);
  return updateDoc(reviewRef, {
    helpfulCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

export async function verifyReview(reviewId: string) {
  const reviewRef = doc(db, "reviews", reviewId);
  return updateDoc(reviewRef, {
    isVerified: true,
    updatedAt: serverTimestamp(),
  });
}

export async function hideReview(reviewId: string) {
  const reviewRef = doc(db, "reviews", reviewId);
  return updateDoc(reviewRef, {
    isPublic: false,
    updatedAt: serverTimestamp(),
  });
}

export async function showReview(reviewId: string) {
  const reviewRef = doc(db, "reviews", reviewId);
  return updateDoc(reviewRef, {
    isPublic: true,
    updatedAt: serverTimestamp(),
  });
}

// Helper function to update target rating statistics
async function updateTargetRating(
  targetId: string,
  targetType: "program" | "coach" | "session",
  newRating: number
) {
  const targetCollection =
    targetType === "program"
      ? "programs"
      : targetType === "coach"
      ? "coaches"
      : "sessions";
  const targetRef = doc(db, targetCollection, targetId);

  // Get current reviews to calculate new average
  const reviews = await getReviewsByTarget(targetId, targetType, 1000); // Get all reviews
  const totalRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) + newRating;
  const totalReviews = reviews.length + 1;
  const averageRating = Math.round((totalRating / totalReviews) * 10) / 10; // Round to 1 decimal

  return updateDoc(targetRef, {
    rating: averageRating,
    totalReviews: totalReviews,
    updatedAt: serverTimestamp(),
  });
}
