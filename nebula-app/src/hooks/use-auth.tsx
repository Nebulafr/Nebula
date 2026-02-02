import { AuthContext } from "@/contexts/auth-context";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthActions() {
  const {
    signUp,
    signIn,
    signInWithGoogle,
    requestPasswordReset,
    completePasswordReset,
    signOut,
  } = useAuth();

  return {
    signUp,
    signIn,
    signInWithGoogle,
    requestPasswordReset,
    completePasswordReset,
    signOut,
  };
}
