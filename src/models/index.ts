import { DocumentReference } from "firebase/firestore";

export interface IBaseTimestamp {
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUser extends IBaseTimestamp {
  uid: string;
  email: string;
  role: "student" | "coach" | "admin";
  status?: "active" | "inactive" | "suspended";
  fullName?: string;
  avatarUrl?: string;
}

export interface ICoach extends IBaseTimestamp {
  id: string;
  userId?: string;
  userRef: DocumentReference;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl: string;
  availability: string;
  hourlyRate: number;
  rating?: number;
  totalReviews?: number;
  totalSessions?: number;
  isActive: boolean;
  isVerified: boolean;
  slug?: string;
  qualifications?: string[];
  experience?: string;
  timezone?: string;
  languages?: string[];
}

export interface IStudent extends IBaseTimestamp {
  id: string;
  userId?: string; // Direct user ID reference
  userRef: DocumentReference; // Firestore reference
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  interestedProgram?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced";
  commitment?: string;
  learningGoals?: string[];
  currentLevel?: string;
  timeZone?: string;
  enrolledPrograms?: string[];
  completedSessions?: string[];
  upcomingSessions?: string[];
  preferences?: IStudentPreferences;
}

export interface IStudentPreferences {
  timezone: string;
  notifications: boolean;
  emailUpdates?: boolean;
  preferredContactTime?: string;
  communicationStyle?: string;
}

export interface Module {
  title: string;
  week: number;
  description?: string;
}

export interface IProgram extends IBaseTimestamp {
  id: string;
  title: string;
  category: string;
  description: string;
  objectives: string[];
  coachRef: DocumentReference;
  slug: string;
  rating: number;
  totalReviews?: number;
  price?: number;
  duration?: string;
  difficultyLevel?: "beginner" | "intermediate" | "advanced";
  maxStudents?: number;
  currentEnrollments?: number;
  isActive: boolean;
  tags?: string[];
  prerequisites?: string[];
  modules?: Module[];
}

export interface ISession extends IBaseTimestamp {
  id: string;
  programRef: DocumentReference;
  coachRef: DocumentReference;
  studentRefs: DocumentReference[];
  title?: string;
  description?: string;
  scheduledTime: Date;
  duration: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  meetLink?: string;
  googleEventId?: string;
  notes?: string;
  recordings?: ISessionRecording[];
  attendance?: ISessionAttendance[];
}

export interface ISessionRecording {
  id: string;
  title: string;
  url: string;
  duration: number;
  uploadedAt: Date;
  isPublic: boolean;
}

export interface ISessionAttendance {
  studentRef: DocumentReference;
  joinTime?: Date;
  leaveTime?: Date;
  attended: boolean;
  participationScore?: number;
}

export interface IEnrollment extends IBaseTimestamp {
  id: string;
  studentRef: DocumentReference;
  programRef: DocumentReference;
  coachRef: DocumentReference;
  status: "active" | "completed" | "cancelled" | "paused";
  enrollmentDate: Date;
  completionDate?: Date;
  progress: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  amountPaid?: number;
}

export interface IReview extends IBaseTimestamp {
  id: string;
  reviewerRef: DocumentReference;
  revieweeRef: DocumentReference;
  targetRef: DocumentReference;
  targetType: "program" | "coach" | "session";
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount?: number;
  tags?: string[];
}

export interface IMessage extends IBaseTimestamp {
  id: string;
  conversationRef: DocumentReference; // Document reference
  senderRef: any; // Document reference
  content: string;
  type?: "text" | "image" | "file" | "link";
  messageType?: "text" | "image" | "file" | "link"; // Legacy field
  attachments?: IMessageAttachment[];
  isRead: boolean;
  readAt?: Date;
  editedAt?: Date;
  isEdited?: boolean;
  isDeleted?: boolean;
  reactions?: IMessageReaction[];
}

export interface IMessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface IMessageReaction {
  userId: string;
  userRef: any; // Document reference
  emoji: string;
  createdAt: Date;
}

export interface IConversation extends IBaseTimestamp {
  id: string;
  participantRefs: DocumentReference[];
  type: "direct" | "group" | "support";
  title?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageRef?: string;
  lastMessageAt?: Date;
  isActive?: boolean;
  isArchived?: boolean;
  unreadCount?: Record<string, number>;
  unreadCounts?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface IPayment extends IBaseTimestamp {
  id: string;
  userRef: any; // Document reference
  payerRef?: string;
  payeeRef?: string;
  enrollmentRef?: any;
  programRef?: any;
  sessionRef?: string;
  amount: number;
  currency: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  paymentMethod: "card" | "bank_transfer" | "paypal" | "stripe";
  stripePaymentIntentId?: string;
  transactionId?: string;
  description?: string;
  refundAmount?: number;
  refundReason?: string;
  failureReason?: string;
  refundedAt?: Date;
  metadata?: Record<string, any>;
}

export interface IPayout extends IBaseTimestamp {
  id: string;
  coachRef: any;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  paymentRefs?: any[];
  stripeTransferId?: string;
  payoutMethod?: "bank_transfer" | "paypal" | "stripe";
  transactionId?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  description?: string;
  feeAmount?: number;
  netAmount?: number;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface INotification extends IBaseTimestamp {
  id: string;
  userRef: any; // Document reference
  recipientRef?: string;
  type:
    | "message"
    | "session"
    | "payment"
    | "review"
    | "system"
    | "marketing"
    | "enrollment"
    | "session_reminder";
  title: string;
  message: string;
  content?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  priority?: "low" | "medium" | "high" | "urgent";
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IEvent extends IBaseTimestamp {
  id: string;
  title: string;
  description: string;
  type: "workshop" | "webinar" | "networking" | "social" | "conference";
  organizerRef: DocumentReference;
  startTime: Date;
  endTime: Date;
  location?: string;
  isVirtual: boolean;
  meetLink?: string;
  capacity?: number;
  currentAttendees?: number;
  price?: number;
  isPublic: boolean;
  tags?: string[];
  status:
    | "draft"
    | "published"
    | "cancelled"
    | "completed"
    | "scheduled"
    | "in-progress"
    | "postponed";
  slug?: string;
  attendeeRefs?: any[];
  maxAttendees?: number;
  sessionRef?: any;
  programRef?: any;
}

export interface IEventRegistration extends IBaseTimestamp {
  id: string;
  eventRef: DocumentReference;
  attendeeRef: DocumentReference;
  status: "registered" | "attended" | "no-show" | "cancelled";
  registrationDate: Date;
  paymentStatus?: "pending" | "paid" | "failed";
  checkInTime?: Date;
  feedback?: string;
  rating?: number;
}

export interface IAnalytics {
  id: string;
  entityRef: DocumentReference;
  entityType: "user" | "coach" | "student" | "program" | "session" | "event";
  metricType: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IFeedback extends IBaseTimestamp {
  id: string;
  fromRef: DocumentReference;
  toRef?: string;
  type: "bug" | "feature_request" | "general" | "complaint" | "compliment";
  subject: string;
  content: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
  tags?: string[];
}

export interface IAdminSettings extends IBaseTimestamp {
  id: string;
  category: string;
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  updatedBy: string;
}

export interface IActivityLog extends IBaseTimestamp {
  id: string;
  userRef: DocumentReference;
  action: string;
  entityType: string;
  entityRef?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Auth related interfaces
export interface ISignUpData {
  email: string;
  password: string;
  fullName: string;
  role: "student" | "coach" | "admin";
}

export interface ISignInData {
  email: string;
  password: string;
}

export interface IAuthError {
  code: string;
  message: string;
}

// Onboarding interfaces
export interface IStudentOnboardingData {
  interestedProgram: string;
  skillLevel: string;
  commitment: string;
}

export interface ICoachOnboardingData {
  userId: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl: string;
  availability: string;
  hourlyRate: number;
}

// Google API interfaces
export interface IGoogleCalendarEvent {
  meetLink: string;
  eventId: string;
}

// Dashboard interfaces
export interface IDashboardStats {
  totalRevenue?: number;
  activeStudents?: number;
  sessionsThisMonth?: number;
  averageRating?: number;
}

export interface IUpcomingSession {
  id: string;
  title: string;
  coach: string;
  date: string;
  day: string;
  time: string;
  type: string;
}

export interface ISuggestedCoach {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  studentsCoached: number;
  specialties: string[];
  slug: string;
}

// Utility types and enums
export enum UserRole {
  STUDENT = "student",
  COACH = "coach",
  ADMIN = "admin",
}

export enum SessionStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PAUSED = "paused",
}

// Form validation interfaces
export interface IFormError {
  field: string;
  message: string;
}

export interface IFormState {
  loading: boolean;
  errors: IFormError[];
  success: boolean;
}

// API Response interfaces
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T = any> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Search and Filter interfaces
export interface ISearchFilters {
  query?: string;
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  difficulty?: string;
  tags?: string[];
}

export interface ISortOptions {
  field: string;
  direction: "asc" | "desc";
}

// Navigation and Layout interfaces
export interface INavigationItem {
  label: string;
  href: DocumentReference;
  icon?: string;
  badge?: string | number;
  children?: INavigationItem[];
}

export interface IBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Toast and Notification interfaces
export interface IToastMessage {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
