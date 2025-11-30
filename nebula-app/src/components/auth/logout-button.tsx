"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuthActions } from "@/hooks/use-auth";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const {} = useAuthActions();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children || (loading ? "Signing out..." : "Sign Out")}
    </Button>
  );
}
