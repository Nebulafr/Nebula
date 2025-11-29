import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthActions() {
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();

  return {
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
  };
}
