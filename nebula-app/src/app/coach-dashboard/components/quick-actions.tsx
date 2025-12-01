"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings,
  Plus
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onActionClick?: (actionId: string) => void;
}

const defaultActions: QuickAction[] = [
  {
    id: 'schedule-session',
    label: 'Schedule Session',
    icon: Calendar,
    href: '/coach-dashboard/schedule',
  },
  {
    id: 'view-messages',
    label: 'View Messages',
    icon: MessageSquare,
    href: '/coach-dashboard/messaging',
  },
  {
    id: 'manage-students',
    label: 'Manage Students',
    icon: Users,
    href: '/coach-dashboard/students',
  },
  {
    id: 'create-program',
    label: 'Create Program',
    icon: Plus,
    href: '/coach-dashboard/programs',
  },
  {
    id: 'view-programs',
    label: 'View Programs',
    icon: BookOpen,
    href: '/coach-dashboard/programs',
    variant: 'outline' as const,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/coach-dashboard/settings',
    variant: 'outline' as const,
  },
];

export function QuickActions({ 
  actions = defaultActions, 
  onActionClick 
}: QuickActionsProps) {
  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (onActionClick) {
      onActionClick(action.id);
    } else if (action.href) {
      // This would normally use router.push or Link
      window.location.href = action.href;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant || "default"}
                size="sm"
                onClick={() => handleActionClick(action)}
                className="h-auto p-3 flex flex-col gap-2"
              >
                <IconComponent className="h-4 w-4" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}