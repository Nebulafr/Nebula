export interface CoachProgram {
  id: string;
  title: string;
  category: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  currentEnrollments: number;
  createdAt: string;
}

export interface CoachReview {
  id: string;
  reviewerId: string;
  revieweeId?: string;
  targetId: string;
  targetType: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isPublic: boolean;
  helpfulCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  reviewee: {
    id: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
}

export interface CoachWithRelations {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
  isActive: boolean;
  isVerified: boolean;
  slug: string;
  category: string;
  qualifications: string[];
  experience?: string;
  timezone?: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  programs: {
    id: string;
    title: string;
    category: string;
    slug: string;
    description: string;
    price: number;
    duration: string;
    rating: number;
    currentEnrollments: number;
    createdAt: string;
  }[];
  reviews: {
    id: string;
    reviewerId: string;
    revieweeId?: string;
    targetId: string;
    targetType: string;
    rating: number;
    title?: string;
    content: string;
    isVerified: boolean;
    isPublic: boolean;
    helpfulCount?: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    reviewer: {
      id: string;
      fullName?: string;
      avatarUrl?: string;
    } | null;
    reviewee: {
      id: string;
      fullName?: string;
      avatarUrl?: string;
    } | null;
  }[];
}

export interface CoachGroup {
  group: string;
  items: ApiCoach[];
}

interface ApiCoach {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  title: string;
  bio: string;
  style: string;
  specialties: string[];
  pastCompanies: string[];
  linkedinUrl?: string;
  availability: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  studentsCoached: number;
  isActive: boolean;
  isVerified: boolean;
  slug: string;
  category: string;
  qualifications: string[];
  experience?: string;
  timezone?: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CoachesResponse {
  success: boolean;
  data?: {
    coaches: ApiCoach[];
    groupedCoaches: CoachGroup[];
  };
  error?: string;
  message?: string;
}

export interface CoachDetailResponse {
  success: boolean;
  data?: {
    coach: CoachWithRelations;
  };
  error?: string;
  message?: string;
}

export interface CreateCoachResponse {
  success: boolean;
  data?: {
    coach: any;
  };
  error?: string;
  message?: string;
}

export interface UpdateCoachResponse {
  success: boolean;
  data?: {
    coach: any;
  };
  error?: string;
  message?: string;
}
