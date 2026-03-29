// Local enum definitions to prevent non-portable prisma types leaking into the frontend
export enum UserRole {
  STUDENT = "STUDENT",
  COACH = "COACH",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export enum ProgramStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  SUBMITTED = "SUBMITTED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  REJECTED = "REJECTED",
}

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PAUSED = "PAUSED",
}

export enum ExperienceLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum SessionStatus {
  REQUESTED = "REQUESTED",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  LINK = "LINK",
}

export enum ConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
  SUPPORT = "SUPPORT",
  AI = "AI",
}

export enum CohortStatus {
  UPCOMING = "UPCOMING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ReviewTargetType {
  PROGRAM = "PROGRAM",
  COACH = "COACH",
  SESSION = "SESSION",
}

export enum TransactionType {
  EARNING = "EARNING",
  PAYOUT = "PAYOUT",
  REFUND = "REFUND",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum TransactionSourceType {
  ENROLLMENT = "ENROLLMENT",
  SESSION = "SESSION",
  EVENT = "EVENT",
  PAYOUT = "PAYOUT",
  OTHER = "OTHER",
}
