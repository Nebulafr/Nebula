 
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  icon,
}: EmptyStateProps) {
  const t = useTranslations("dashboard.coach.messaging.emptyState");
  const displayTitle = title || t("title");
  const displayMessage = message || t("message");

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <div className="text-center">
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        <h3 className="text-lg font-medium text-gray-900">{displayTitle}</h3>
        <p className="text-gray-500">{displayMessage}</p>
      </div>
    </div>
  );
}