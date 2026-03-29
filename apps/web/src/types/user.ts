import { ApiResponse } from "./api";
import { UserRole, UserStatus } from "@/enums";
export { UserRole, UserStatus };

export interface User {
  id: string;
  googleId?: string | null;
  hashedPassword?: string | null;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: string;
  country?: string | null;
  countryIso?: string | null;
  isStripeConnected?: boolean;
  stripeAccountId?: string | null;
  stripeCustomerId?: string | null;
  emailVerified?: string | null;
  createdAt: string;
  updatedAt: string;
}

import { Student } from "./student";
import { Coach, CoachWithRelations } from "./coach";

export interface UserProfile extends User {
  student?: Student | null;
  coach?: CoachWithRelations | null;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export interface AuthResponse extends AuthData { }

export interface UserProfileResponse {
  user: UserProfile;
}
