import React, { Suspense } from "react";
import { UserProvider } from "@/contexts/user-context";
import AdminEventsContent from "./components/admin-events-content";

function AdminEventsPageFallback() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <UserProvider>
      <Suspense fallback={<AdminEventsPageFallback />}>
        <AdminEventsContent />
      </Suspense>
    </UserProvider>
  );
}
