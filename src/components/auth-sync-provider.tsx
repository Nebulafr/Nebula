"use client";

import { useEffect } from "react";
import { initAuthSync } from "@/lib/auth-sync";

export function AuthSyncProvider() {
  useEffect(() => {
    const authSync = initAuthSync();
    return () => {};
  }, []);

  return null; // This component doesn't render anything
}
