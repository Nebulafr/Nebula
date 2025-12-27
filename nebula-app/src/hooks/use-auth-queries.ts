import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile } from "@/actions/user";
import {
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from "@/actions/auth";
import { signInWithGoogle } from "@/firebase/auth";
import { SignupData, SigninData } from "@/lib/validations";
import { UserRole } from "@/generated/prisma";
import { storeAuthData, clearAuthData } from "@/lib/auth-storage";
import { toast } from "react-toastify";

export const USER_PROFILE_QUERY_KEY = "user-profile";

export function useUserProfile() {
  return useQuery({
    queryKey: [USER_PROFILE_QUERY_KEY],
    queryFn: getUserProfile,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupData) => signUpWithEmail(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        storeAuthData(result.data);
        // Update the user profile cache
        queryClient.setQueryData([USER_PROFILE_QUERY_KEY], result);
        toast.success("Account created successfully!");
      }
    },
    onError: (error: Error) => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      toast.error(error.message || "Sign up failed. Please try again.");
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SigninData) => signInWithEmail(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        storeAuthData(result.data);
        // Update the user profile cache
        queryClient.setQueryData([USER_PROFILE_QUERY_KEY], result);
        toast.success("Signed in successfully!");
      }
    },
    onError: (error: Error) => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      toast.error(error.message || "Sign in failed. Please try again.");
    },
  });
}

export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: UserRole = UserRole.STUDENT) => signInWithGoogle(role),
    onSuccess: (result) => {
      if (result.success && result.data) {
        storeAuthData(result.data);
        // Update the user profile cache
        queryClient.setQueryData([USER_PROFILE_QUERY_KEY], result);
        toast.success("Signed in with Google successfully!");
      }
    },
    onError: (error: Error) => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      toast.error(error.message || "Google sign in failed. Please try again.");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => resetPassword(email),
    onSuccess: () => {
      toast.success("Password reset email sent!");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to send reset email. Please try again."
      );
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.warn("API logout failed:", error);
      }
    },
    onSettled: () => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      queryClient.clear(); // Clear all cached data on logout
    },
  });
}
