# Backend Data Models Documentation

This document provides comprehensive documentation for the backend data models used in the Nebula coaching platform.

## Table of Contents

- [Overview](#overview)
- [Base Interfaces](#base-interfaces)
- [Core Entities](#core-entities)
- [Business Logic](#business-logic)
- [Communication](#communication)
- [Events & Analytics](#events--analytics)
- [Administrative](#administrative)
- [Relationships](#relationships)
- [Usage Examples](#usage-examples)

## Overview

The Nebula platform uses Firebase Firestore as its primary database. All models follow TypeScript interfaces and include proper type definitions for type safety and development efficiency.

### Design Principles

- **Type Safety**: All models use TypeScript for compile-time type checking
- **Firestore References**: Relationships use document reference IDs as strings
- **Timestamp Tracking**: All entities include creation and update timestamps
- **Extensibility**: Models support optional fields for future enhancements
- **Consistency**: Standardized naming conventions and structure patterns

## Base Interfaces

### BaseTimestamp
```typescript
interface BaseTimestamp {
  createdAt: Date;
  updatedAt?: Date;
}
```
All entities extend this interface for consistent timestamp tracking.

## Core Entities

### User
Central user entity for authentication and basic profile information.

```typescript
interface User extends BaseTimestamp {
  uid: string;              // Firebase Auth UID
  email: string;            // User email address
  role: 'student' | 'coach' | 'admin';
  fullName?: string;        // Display name
  avatarUrl?: string;       // Profile picture URL
}
```

**Collections**: `users`
**Access**: Public (limited fields), Private (full profile)

### Coach
Extended profile for coaching professionals.

```typescript
interface Coach extends BaseTimestamp {
  id: string;               // Document ID
  userRef: string;          // Reference to User document
  title: string;            // Professional title
  bio: string;              // Professional biography
  style: string;            // Coaching style description
  specialties: string[];    // Areas of expertise
  pastCompanies: string[];  // Work history
  linkedinUrl: string;      // LinkedIn profile
  availability: string;     // Availability schedule
  hourlyRate: number;       // USD hourly rate
  rating?: number;          // Average rating (0-5)
  totalReviews?: number;    // Number of reviews
  isActive: boolean;        // Account active status
  isVerified: boolean;      // Platform verification status
  slug?: string;            // URL-friendly identifier
}
```

**Collections**: `coaches`
**Access**: Public (profile info), Private (rates, settings)

### Student
Extended profile for learning participants.

```typescript
interface Student extends BaseTimestamp {
  id: string;               // Document ID
  userRef: string;          // Reference to User document
  interestedProgram: string; // Program of interest
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  commitment: 'part-time' | 'full-time' | 'flexible';
  learningGoals?: string[]; // Learning objectives
  currentLevel?: string;    // Current skill assessment
  timeZone?: string;        // Preferred timezone
}
```

**Collections**: `students`
**Access**: Private (student only), Limited (enrolled coaches)

### Program
Learning programs offered by coaches.

```typescript
interface Program extends BaseTimestamp {
  id: string;               // Document ID
  title: string;            // Program name
  category: string;         // Program category
  description: string;      // Detailed description
  objectives: string[];     // Learning objectives
  coachRef: string;         // Reference to Coach document
  slug: string;             // URL-friendly identifier
  rating: number;           // Average rating (0-5)
  totalReviews?: number;    // Number of reviews
  price?: number;           // Program price in USD
  duration?: string;        // Program duration
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxStudents?: number;     // Maximum enrollment
  currentEnrollments?: number; // Current enrolled students
  isActive: boolean;        // Availability status
  tags?: string[];          // Search tags
  prerequisites?: string[]; // Required skills/knowledge
  materials?: string[];     // Required materials/tools
}
```

**Collections**: `programs`
**Access**: Public (program info), Private (enrollment data)

## Business Logic

### Session
Individual coaching sessions within programs.

```typescript
interface Session extends BaseTimestamp {
  id: string;               // Document ID
  programRef: string;       // Reference to Program document
  coachRef: string;         // Reference to Coach document
  studentRefs: string[];    // References to Student documents
  title?: string;           // Session title
  description?: string;     // Session description
  scheduledTime: Date;      // Session start time
  duration: number;         // Duration in minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetLink?: string;        // Video call link
  googleEventId?: string;   // Calendar event ID
  notes?: string;           // Session notes
  recordings?: SessionRecording[]; // Session recordings
  attendance?: SessionAttendance[]; // Attendance tracking
}
```

### Enrollment
Student enrollment in programs.

```typescript
interface Enrollment extends BaseTimestamp {
  id: string;               // Document ID
  studentRef: string;       // Reference to Student document
  programRef: string;       // Reference to Program document
  coachRef: string;         // Reference to Coach document
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  enrollmentDate: Date;     // Enrollment timestamp
  completionDate?: Date;    // Completion timestamp
  progress: number;         // Progress percentage (0-100)
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amountPaid?: number;      // Amount paid in USD
}
```

### Payment
Financial transaction records.

```typescript
interface Payment extends BaseTimestamp {
  id: string;               // Document ID
  payerRef: string;         // Reference to User (payer)
  payeeRef: string;         // Reference to User (payee)
  enrollmentRef?: string;   // Reference to Enrollment
  sessionRef?: string;      // Reference to Session
  amount: number;           // Payment amount
  currency: string;         // Currency code (USD)
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'paypal' | 'stripe';
  transactionId?: string;   // External transaction ID
  description?: string;     // Payment description
  refundAmount?: number;    // Refund amount
  refundedAt?: Date;        // Refund timestamp
}
```

## Communication

### Message
Individual messages in conversations.

```typescript
interface Message extends BaseTimestamp {
  id: string;               // Document ID
  conversationRef: string;  // Reference to Conversation
  senderRef: string;        // Reference to User (sender)
  content: string;          // Message content
  messageType: 'text' | 'image' | 'file' | 'link';
  attachments?: MessageAttachment[]; // File attachments
  isRead: boolean;          // Read status
  readAt?: Date;            // Read timestamp
  editedAt?: Date;          // Edit timestamp
  isDeleted: boolean;       // Deletion status
}
```

### Conversation
Chat conversations between users.

```typescript
interface Conversation extends BaseTimestamp {
  id: string;               // Document ID
  participantRefs: string[]; // References to User documents
  type: 'direct' | 'group' | 'support';
  title?: string;           // Conversation title
  lastMessageRef?: string;  // Reference to last Message
  lastMessageAt?: Date;     // Last message timestamp
  isActive: boolean;        // Conversation status
  unreadCount?: Record<string, number>; // Unread counts per user
  metadata?: Record<string, any>; // Additional data
}
```

## Events & Analytics

### Event
Platform events and workshops.

```typescript
interface Event extends BaseTimestamp {
  id: string;               // Document ID
  title: string;            // Event title
  description: string;      // Event description
  type: 'workshop' | 'webinar' | 'networking' | 'social' | 'conference';
  organizerRef: string;     // Reference to User (organizer)
  startTime: Date;          // Event start time
  endTime: Date;            // Event end time
  location?: string;        // Physical location
  isVirtual: boolean;       // Virtual event flag
  meetLink?: string;        // Virtual meeting link
  capacity?: number;        // Maximum attendees
  currentAttendees?: number; // Current registrations
  price?: number;           // Ticket price
  isPublic: boolean;        // Public visibility
  tags?: string[];          // Event tags
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  slug?: string;            // URL-friendly identifier
}
```

### Analytics
Platform usage and performance metrics.

```typescript
interface Analytics {
  id: string;               // Document ID
  entityRef: string;        // Reference to tracked entity
  entityType: 'user' | 'coach' | 'student' | 'program' | 'session' | 'event';
  metricType: string;       // Metric identifier
  value: number;            // Metric value
  timestamp: Date;          // Measurement time
  metadata?: Record<string, any>; // Additional context
}
```

## Administrative

### AdminSettings
Platform configuration settings.

```typescript
interface AdminSettings extends BaseTimestamp {
  id: string;               // Document ID
  category: string;         // Setting category
  key: string;              // Setting key
  value: any;               // Setting value
  description?: string;     // Setting description
  isPublic: boolean;        // Public access flag
  updatedBy: string;        // Reference to User (admin)
}
```

### ActivityLog
User and system activity tracking.

```typescript
interface ActivityLog extends BaseTimestamp {
  id: string;               // Document ID
  userRef: string;          // Reference to User
  action: string;           // Action performed
  entityType: string;       // Type of entity affected
  entityRef?: string;       // Reference to affected entity
  ipAddress?: string;       // User IP address
  userAgent?: string;       // User browser/device
  metadata?: Record<string, any>; // Additional context
  timestamp: Date;          // Action timestamp
}
```

## Relationships

### Entity Relationship Diagram

```
User (1) ──→ (0..1) Coach
User (1) ──→ (0..1) Student

Coach (1) ──→ (0..*) Program
Program (1) ──→ (0..*) Session
Program (1) ──→ (0..*) Enrollment

Student (1) ──→ (0..*) Enrollment
Session (1) ──→ (0..*) Student [many-to-many]

User (1) ──→ (0..*) Message
Conversation (1) ──→ (0..*) Message
Conversation (1) ──→ (2..*) User [many-to-many]

User (1) ──→ (0..*) Payment
User (1) ──→ (0..*) Review
```

### Reference Patterns

All relationships use string references to document IDs:

```typescript
// Single reference
coachRef: string;  // References coaches/{id}

// Multiple references
studentRefs: string[];  // References students/{id1}, students/{id2}, ...

// Optional reference
parentRef?: string;  // Optional reference
```

## Usage Examples

### Creating a New Coach Profile

```typescript
const coach: Coach = {
  id: 'coach_123',
  userRef: 'user_456',
  title: 'Senior Software Engineer',
  bio: 'Experienced full-stack developer with 10+ years...',
  style: 'Hands-on, project-based learning',
  specialties: ['React', 'Node.js', 'System Design'],
  pastCompanies: ['Google', 'Microsoft', 'Startup Inc'],
  linkedinUrl: 'https://linkedin.com/in/coach123',
  availability: 'Weekdays 6-9 PM EST',
  hourlyRate: 150,
  isActive: true,
  isVerified: false,
  createdAt: new Date(),
};
```

### Creating a Program

```typescript
const program: Program = {
  id: 'program_789',
  title: 'Full-Stack Web Development Bootcamp',
  category: 'Programming',
  description: 'Learn to build modern web applications...',
  objectives: [
    'Master React and Node.js',
    'Build 3 portfolio projects',
    'Deploy applications to production'
  ],
  coachRef: 'coach_123',
  slug: 'full-stack-web-development-bootcamp',
  rating: 0,
  price: 2500,
  duration: '12 weeks',
  difficultyLevel: 'intermediate',
  maxStudents: 10,
  currentEnrollments: 0,
  isActive: true,
  tags: ['javascript', 'react', 'nodejs', 'full-stack'],
  prerequisites: ['Basic HTML/CSS', 'JavaScript fundamentals'],
  createdAt: new Date(),
};
```

### Enrolling a Student

```typescript
const enrollment: Enrollment = {
  id: 'enrollment_101',
  studentRef: 'student_555',
  programRef: 'program_789',
  coachRef: 'coach_123',
  status: 'active',
  enrollmentDate: new Date(),
  progress: 0,
  paymentStatus: 'pending',
  amountPaid: 2500,
  createdAt: new Date(),
};
```

### Scheduling a Session

```typescript
const session: Session = {
  id: 'session_202',
  programRef: 'program_789',
  coachRef: 'coach_123',
  studentRefs: ['student_555', 'student_666'],
  title: 'Week 1: Setting Up Development Environment',
  description: 'Install and configure development tools',
  scheduledTime: new Date('2024-01-15T18:00:00Z'),
  duration: 90,
  status: 'scheduled',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  createdAt: new Date(),
};
```

## API Methods

### User Management

```typescript
// Authentication
createUserDocument(user: User, role: 'student' | 'coach' | 'admin', fullName?: string): Promise<void>
getUserById(uid: string): Promise<User | null>
updateUserProfile(uid: string, updates: Partial<User>): Promise<void>
deleteUser(uid: string): Promise<void>
```

### Coach Operations

```typescript
// Coach Profile Management
createCoachProfile(db: Firestore, userId: string, data: Partial<Coach>): Promise<void>
getCoachById(coachId: string): Promise<Coach | null>
getCoachesBySpecialty(specialty: string): Promise<Coach[]>
updateCoachProfile(coachId: string, updates: Partial<Coach>): Promise<void>
updateCoachAvailability(coachId: string, availability: string): Promise<void>
updateCoachRating(coachId: string, rating: number, reviewCount: number): Promise<void>
deactivateCoach(coachId: string): Promise<void>

// Coach Analytics
getCoachEarnings(coachId: string, startDate: Date, endDate: Date): Promise<number>
getCoachSessionCount(coachId: string, period: string): Promise<number>
getCoachStudentCount(coachId: string): Promise<number>
```

### Student Operations

```typescript
// Student Profile Management
createStudentProfile(db: Firestore, userId: string, data: Partial<Student>): Promise<void>
getStudentById(studentId: string): Promise<Student | null>
updateStudentProfile(studentId: string, updates: Partial<Student>): Promise<void>
updateStudentProgress(studentId: string, programId: string, progress: number): Promise<void>

// Student Learning
getStudentEnrollments(studentId: string): Promise<Enrollment[]>
getStudentUpcomingSessions(studentId: string): Promise<Session[]>
getStudentCompletedPrograms(studentId: string): Promise<Program[]>
```

### Program Management

```typescript
// Program CRUD
createProgram(db: Firestore, coachId: string, data: Partial<Program>): Promise<string>
getProgramById(programId: string): Promise<Program | null>
getProgramsByCoach(coachId: string): Promise<Program[]>
getProgramsByCategory(category: string): Promise<Program[]>
updateProgram(programId: string, updates: Partial<Program>): Promise<void>
deactivateProgram(programId: string): Promise<void>

// Program Search & Discovery
searchPrograms(query: string, filters?: ProgramFilters): Promise<Program[]>
getFeaturedPrograms(limit?: number): Promise<Program[]>
getPopularPrograms(limit?: number): Promise<Program[]>
getProgramRecommendations(studentId: string): Promise<Program[]>
```

### Session Management

```typescript
// Session Creation & Scheduling
createSession(input: CreateSessionInput): Promise<CreateSessionOutput>
scheduleSession(sessionData: Partial<Session>): Promise<string>
rescheduleSession(sessionId: string, newTime: Date): Promise<void>
cancelSession(sessionId: string, reason?: string): Promise<void>

// Session Operations
startSession(sessionId: string): Promise<void>
endSession(sessionId: string, notes?: string): Promise<void>
joinSession(sessionId: string, studentId: string): Promise<void>
leaveSession(sessionId: string, studentId: string): Promise<void>

// Session Data
getSessionById(sessionId: string): Promise<Session | null>
getSessionsByProgram(programId: string): Promise<Session[]>
getUpcomingSessions(userId: string, role: 'coach' | 'student'): Promise<Session[]>
getPastSessions(userId: string, role: 'coach' | 'student'): Promise<Session[]>
```

### Enrollment Operations

```typescript
// Enrollment Management
enrollStudent(studentId: string, programId: string, paymentData?: Partial<Payment>): Promise<string>
unenrollStudent(enrollmentId: string, reason?: string): Promise<void>
pauseEnrollment(enrollmentId: string): Promise<void>
resumeEnrollment(enrollmentId: string): Promise<void>

// Enrollment Queries
getEnrollmentById(enrollmentId: string): Promise<Enrollment | null>
getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>
getEnrollmentsByProgram(programId: string): Promise<Enrollment[]>
getActiveEnrollments(programId: string): Promise<Enrollment[]>
```

### Review & Rating System

```typescript
// Review Management
createReview(reviewData: Partial<Review>): Promise<string>
getReviewById(reviewId: string): Promise<Review | null>
getReviewsByTarget(targetId: string, targetType: 'program' | 'coach'): Promise<Review[]>
updateReview(reviewId: string, updates: Partial<Review>): Promise<void>
deleteReview(reviewId: string): Promise<void>

// Rating Calculations
calculateAverageRating(targetId: string, targetType: 'program' | 'coach'): Promise<number>
updateTargetRating(targetId: string, targetType: 'program' | 'coach'): Promise<void>
```

### Messaging System

```typescript
// Conversation Management
createConversation(participantIds: string[], type: 'direct' | 'group'): Promise<string>
getConversationById(conversationId: string): Promise<Conversation | null>
getUserConversations(userId: string): Promise<Conversation[]>
addParticipant(conversationId: string, userId: string): Promise<void>
removeParticipant(conversationId: string, userId: string): Promise<void>

// Message Operations
sendMessage(conversationId: string, senderId: string, content: string, type?: string): Promise<string>
getMessage(messageId: string): Promise<Message | null>
getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>
markMessageAsRead(messageId: string, userId: string): Promise<void>
editMessage(messageId: string, newContent: string): Promise<void>
deleteMessage(messageId: string): Promise<void>

// Unread Messages
getUnreadMessageCount(userId: string): Promise<number>
markConversationAsRead(conversationId: string, userId: string): Promise<void>
```

### Payment Processing

```typescript
// Payment Operations
processPayment(paymentData: Partial<Payment>): Promise<string>
getPaymentById(paymentId: string): Promise<Payment | null>
getPaymentsByUser(userId: string, role: 'payer' | 'payee'): Promise<Payment[]>
refundPayment(paymentId: string, amount?: number, reason?: string): Promise<void>
updatePaymentStatus(paymentId: string, status: string, transactionId?: string): Promise<void>

// Payout Management
createPayout(coachId: string, amount: number, method: string): Promise<string>
getPayoutsByCoach(coachId: string): Promise<Payout[]>
processPayout(payoutId: string): Promise<void>
updatePayoutStatus(payoutId: string, status: string): Promise<void>
```

### Event Management

```typescript
// Event Operations
createEvent(eventData: Partial<Event>): Promise<string>
getEventById(eventId: string): Promise<Event | null>
getUpcomingEvents(limit?: number): Promise<Event[]>
getEventsByOrganizer(organizerId: string): Promise<Event[]>
updateEvent(eventId: string, updates: Partial<Event>): Promise<void>
cancelEvent(eventId: string, reason?: string): Promise<void>

// Event Registration
registerForEvent(eventId: string, attendeeId: string): Promise<string>
unregisterFromEvent(registrationId: string): Promise<void>
getEventRegistrations(eventId: string): Promise<EventRegistration[]>
getUserEventRegistrations(userId: string): Promise<EventRegistration[]>
checkInAttendee(registrationId: string): Promise<void>
```

### Notification System

```typescript
// Notification Management
createNotification(recipientId: string, type: string, title: string, content: string): Promise<string>
getNotificationById(notificationId: string): Promise<Notification | null>
getUserNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>
markNotificationAsRead(notificationId: string): Promise<void>
markAllNotificationsAsRead(userId: string): Promise<void>
deleteNotification(notificationId: string): Promise<void>

// Notification Broadcasting
sendBulkNotifications(userIds: string[], notificationData: Partial<Notification>): Promise<void>
sendRoleBasedNotifications(role: 'coach' | 'student', notificationData: Partial<Notification>): Promise<void>
```

### Analytics & Reporting

```typescript
// Analytics Tracking
recordAnalytic(entityId: string, entityType: string, metricType: string, value: number): Promise<void>
getAnalytics(entityId: string, metricType: string, startDate?: Date, endDate?: Date): Promise<Analytics[]>
getAggregatedMetrics(entityType: string, metricType: string, period: string): Promise<Record<string, number>>

// Platform Statistics
getPlatformStats(): Promise<{
  totalUsers: number;
  totalCoaches: number;
  totalStudents: number;
  totalPrograms: number;
  totalSessions: number;
  totalRevenue: number;
}>
getUserGrowthStats(period: string): Promise<Record<string, number>>
getRevenueStats(period: string): Promise<Record<string, number>>
```

### Administrative Functions

```typescript
// Admin Settings
getAdminSetting(key: string): Promise<AdminSettings | null>
updateAdminSetting(key: string, value: any, updatedBy: string): Promise<void>
getAllAdminSettings(category?: string): Promise<AdminSettings[]>

// User Management (Admin)
getAllUsers(role?: string, limit?: number, offset?: number): Promise<User[]>
suspendUser(userId: string, reason: string, suspendedBy: string): Promise<void>
unsuspendUser(userId: string, unsuspendedBy: string): Promise<void>
promoteUserToAdmin(userId: string, promotedBy: string): Promise<void>

// Activity Logging
logActivity(userId: string, action: string, entityType: string, entityId?: string, metadata?: any): Promise<void>
getActivityLogs(userId?: string, limit?: number, offset?: number): Promise<ActivityLog[]>
getSystemActivityLogs(startDate: Date, endDate: Date): Promise<ActivityLog[]>

// Content Moderation
flagContent(contentId: string, contentType: string, reason: string, flaggedBy: string): Promise<void>
reviewFlaggedContent(flagId: string, action: 'approve' | 'remove', reviewedBy: string): Promise<void>
getFlaggedContent(): Promise<any[]>
```

### Utility Functions

```typescript
// Search & Filtering
searchUsers(query: string, role?: string): Promise<User[]>
searchPrograms(query: string, filters?: any): Promise<Program[]>
searchCoaches(query: string, specialties?: string[]): Promise<Coach[]>

// Data Validation
validateEmail(email: string): boolean
validatePhoneNumber(phone: string): boolean
validateUserInput(input: any, type: 'user' | 'coach' | 'student' | 'program'): ValidationResult

// File Management
uploadFile(file: File, path: string): Promise<string>
deleteFile(url: string): Promise<void>
getSignedUrl(path: string, expirationTime?: number): Promise<string>

// Slug Generation
generateSlug(text: string, existingIds?: string[]): string
updateSlugReferences(oldSlug: string, newSlug: string, entityType: string): Promise<void>
```

---

## Notes

- All timestamps use JavaScript `Date` objects
- Currency amounts are stored in USD cents (multiply by 100)
- File URLs should use secure, signed URLs for private content
- Implement proper access control rules in Firestore Security Rules
- Consider data validation at both client and server levels
- Use indexes for frequently queried fields
- All methods return Promises for async operations
- Error handling should be implemented for all database operations
- Consider implementing caching for frequently accessed data