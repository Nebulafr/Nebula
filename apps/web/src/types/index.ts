export * from "./api";
export * from "./user";
export * from "./student";
export * from "./coach";
export * from "./program";
export * from "./cohort";
export * from "./category";
export * from "./enrollment";
export * from "./review";
export * from "./admin";
export * from "./coach-dashboard";
export * from "./messaging";
export * from "./session";
export { ExperienceLevel, EnrollmentStatus, PaymentStatus, SessionStatus, MessageType, ConversationType, CohortStatus, ReviewTargetType, TransactionType, TransactionStatus, TransactionSourceType } from "@/enums";

export interface AuthenticatedRequest {
  user: import("./user").UserProfile;
}

export type AuthState =
  | "LOADING"
  | "UNAUTHENTICATED"
  | "AUTHENTICATED_NO_PROFILE"
  | "AUTHENTICATED_WITH_PROFILE";
