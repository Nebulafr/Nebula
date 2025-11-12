export interface BaseTimestamp {
  createdAt: Date;
  updatedAt?: Date;
}

export interface User extends BaseTimestamp {
  uid: string;
  email: string;
  role: 'student' | 'coach' | 'admin';
  fullName?: string;
  avatarUrl?: string;
}

export interface Coach extends BaseTimestamp {
  id: string;
  userRef: string;
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
  isActive: boolean;
  isVerified: boolean;
  slug?: string;
}

export interface Student extends BaseTimestamp {
  id: string;
  userRef: string;
  interestedProgram: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  commitment: 'part-time' | 'full-time' | 'flexible';
  learningGoals?: string[];
  currentLevel?: string;
  timeZone?: string;
}

export interface Program extends BaseTimestamp {
  id: string;
  title: string;
  category: string;
  description: string;
  objectives: string[];
  coachRef: string;
  slug: string;
  rating: number;
  totalReviews?: number;
  price?: number;
  duration?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxStudents?: number;
  currentEnrollments?: number;
  isActive: boolean;
  tags?: string[];
  prerequisites?: string[];
  materials?: string[];
}

export interface Session extends BaseTimestamp {
  id: string;
  programRef: string;
  coachRef: string;
  studentRefs: string[];
  title?: string;
  description?: string;
  scheduledTime: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetLink?: string;
  googleEventId?: string;
  notes?: string;
  recordings?: SessionRecording[];
  attendance?: SessionAttendance[];
}

export interface SessionRecording {
  id: string;
  title: string;
  url: string;
  duration: number;
  uploadedAt: Date;
  isPublic: boolean;
}

export interface SessionAttendance {
  studentRef: string;
  joinTime?: Date;
  leaveTime?: Date;
  attended: boolean;
  participationScore?: number;
}

export interface Enrollment extends BaseTimestamp {
  id: string;
  studentRef: string;
  programRef: string;
  coachRef: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  enrollmentDate: Date;
  completionDate?: Date;
  progress: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amountPaid?: number;
}

export interface Review extends BaseTimestamp {
  id: string;
  reviewerRef: string;
  revieweeRef: string;
  targetRef: string;
  targetType: 'program' | 'coach' | 'session';
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount?: number;
  tags?: string[];
}

export interface Message extends BaseTimestamp {
  id: string;
  conversationRef: string;
  senderRef: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'link';
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface Conversation extends BaseTimestamp {
  id: string;
  participantRefs: string[];
  type: 'direct' | 'group' | 'support';
  title?: string;
  lastMessageRef?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  unreadCount?: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface Payment extends BaseTimestamp {
  id: string;
  payerRef: string;
  payeeRef: string;
  enrollmentRef?: string;
  sessionRef?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe';
  transactionId?: string;
  description?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

export interface Payout extends BaseTimestamp {
  id: string;
  coachRef: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe';
  transactionId?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  description?: string;
  feeAmount?: number;
  netAmount?: number;
}

export interface Notification extends BaseTimestamp {
  id: string;
  recipientRef: string;
  type: 'message' | 'session' | 'payment' | 'review' | 'system' | 'marketing';
  title: string;
  content: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface Event extends BaseTimestamp {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'networking' | 'social' | 'conference';
  organizerRef: string;
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
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  slug?: string;
}

export interface EventRegistration extends BaseTimestamp {
  id: string;
  eventRef: string;
  attendeeRef: string;
  status: 'registered' | 'attended' | 'no-show' | 'cancelled';
  registrationDate: Date;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  checkInTime?: Date;
  feedback?: string;
  rating?: number;
}

export interface Analytics {
  id: string;
  entityRef: string;
  entityType: 'user' | 'coach' | 'student' | 'program' | 'session' | 'event';
  metricType: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Feedback extends BaseTimestamp {
  id: string;
  fromRef: string;
  toRef?: string;
  type: 'bug' | 'feature_request' | 'general' | 'complaint' | 'compliment';
  subject: string;
  content: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  resolution?: string;
  resolvedAt?: Date;
  tags?: string[];
}

export interface AdminSettings extends BaseTimestamp {
  id: string;
  category: string;
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  updatedBy: string;
}

export interface ActivityLog extends BaseTimestamp {
  id: string;
  userRef: string;
  action: string;
  entityType: string;
  entityRef?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}