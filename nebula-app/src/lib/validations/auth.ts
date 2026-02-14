import { z } from "zod";
import { UserRole } from "@/generated/prisma";

export const loginSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.nativeEnum(UserRole),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.nativeEnum(UserRole),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const googleAuthSchema = z.object({
  googleId: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.nativeEnum(UserRole),
  avatarUrl: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const googleSigninSchema = z.object({
  googleId: z.string(),
});

export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type SigninData = z.infer<typeof signinSchema>;
export type GoogleAuthData = z.infer<typeof googleAuthSchema>;
export type GoogleSigninData = z.infer<typeof googleSigninSchema>;
