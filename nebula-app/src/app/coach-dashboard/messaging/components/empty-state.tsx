"use client";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Welcome Coach!",
  message = "Select a conversation to start messaging with your students",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <div className="text-center">
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}