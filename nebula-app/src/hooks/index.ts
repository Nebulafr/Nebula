// Auth hooks
export * from "./use-auth-queries";

// Programs hooks
export * from "./use-programs-queries";

// Coaches hooks
export * from "./use-coaches-queries";

// Schedule hooks (coach dashboard)
export * from "./use-schedule-queries";

// Events hooks
export * from "./use-events-queries";

// Reviews hooks
export * from "./use-reviews-queries";

// Categories hooks
export * from "./use-categories-queries";

// Checkout hooks
export * from "./use-checkout-queries";

// Admin hooks
export * from "./use-admin-queries";
export * from "./use-cohort-queries";

// Legacy hook re-exports (maintain backward compatibility)
export * from "./use-auth";
export * from "./use-user";
export * from "./use-events";
export * from "./use-filtered-events";
export * from "./use-admin-reviews";
export * from "./use-admin-users";
export * from "./use-mobile";

// Query keys for easy access
export const QUERY_KEYS = {
  // Auth
  USER_PROFILE: "user-profile",

  // Programs
  PROGRAMS: "programs",
  GROUPED_PROGRAMS: "grouped-programs",
  RECOMMENDED_PROGRAMS: "recommended-programs",
  POPULAR_PROGRAMS: "popular-programs",
  PROGRAM_BY_SLUG: "program-by-slug",
  ADMIN_PROGRAMS: "admin-programs",

  // Coaches
  COACHES: "coaches",
  COACH_BY_SLUG: "coach-by-slug",
  COACH_BY_ID: "coach-by-id",
  SUGGESTED_COACHES: "suggested-coaches",

  // Events
  EVENTS: "events",
  PUBLIC_EVENTS: "public-events",
  EVENT_BY_ID: "event-by-id",
  EVENT_BY_SLUG: "event-by-slug",

  // Reviews
  COACH_REVIEWS: "coach-reviews",
  PROGRAM_REVIEWS: "program-reviews",

  // Categories
  CATEGORIES: "categories",
  ADMIN_CATEGORIES: "admin-categories",

  // Admin
  ADMIN_REVIEWS: "admin-reviews",
  ADMIN_USERS: "admin-users",
  ADMIN_DASHBOARD_STATS: "admin-dashboard-stats",
  ADMIN_RECENT_SIGNUPS: "admin-recent-signups",
  ADMIN_PLATFORM_ACTIVITY: "admin-platform-activity",
  ADMIN_EVENTS: "admin-events",

  // Schedule (coach dashboard)
  COACH_SESSIONS: "coach-sessions",
  COACH_STATS: "coach-stats",
  COACH_AVAILABILITY: "coach-availability",
} as const;
