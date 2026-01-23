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
import { handleAndToastError } from "@/lib/error-handler";

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
      if (result.data) {
        storeAuthData(result.data);
        queryClient.setQueryData([USER_PROFILE_QUERY_KEY], result);
      }
    },
    onError: (error: any) => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      handleAndToastError(error, "Sign up failed");
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SigninData) => signInWithEmail(data),
    onSuccess: (result) => {
      if (result.data) {
        storeAuthData(result.data);
        queryClient.setQueryData([USER_PROFILE_QUERY_KEY], result);
      }
    },
    onError: (error: any) => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      handleAndToastError(error, "Sign in failed");
    },
  });
}

export function useGoogleSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: UserRole = UserRole.STUDENT) => signInWithGoogle(role),
    onSuccess: (result) => {
      if (result.data) {
        storeAuthData(result.data);
        queryClient.setQueryData([USER_PROFILE_QUERY_KEY], result);
      }
    },
    onError: (error: any) => {
      clearAuthData();
      queryClient.removeQueries({ queryKey: [USER_PROFILE_QUERY_KEY] });
      handleAndToastError(error, "Google sign in failed");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => resetPassword(email),
    onSuccess: () => {},
    onError: (error: any) => {
      handleAndToastError(error, "Failed to send reset email");
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
