/**
 * Utility functions for chat formatting and display
 */

/**
 * Formats a user's name for display in chat
 * Handles various edge cases like empty names, long names, etc.
 */
export function formatUserName(name: string | null | undefined): string {
  if (!name || name.trim().length === 0) {
    return "Unknown User";
  }

  // Trim whitespace and capitalize first letter of each word
  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Formats a user's role for display
 * Standardizes role naming and capitalization
 */
export function formatUserRole(role: string | null | undefined): string {
  if (!role || role.trim().length === 0) {
    return "User";
  }

  const roleMap: Record<string, string> = {
    COACH: "Coach",
    STUDENT: "Student",
    ADMIN: "Administrator",
    SUPPORT: "Support",
    MENTOR: "Mentor",
    TUTOR: "Tutor",
    INSTRUCTOR: "Instructor",
    TEACHER: "Teacher",
  };

  const normalizedRole = role.toUpperCase();
  return roleMap[normalizedRole] || formatUserName(role);
}

/**
 * Gets the user's initials for avatar fallback
 * Handles edge cases and ensures consistent formatting
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name || name.trim().length === 0) {
    return "U";
  }

  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return "U";
  } else if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  }
}

/**
 * Formats timestamp for display in chat
 * Provides consistent time formatting across the platform
 */
export function formatChatTime(date: string | Date | null | undefined): string {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return dateObj.toLocaleDateString([], { weekday: "short" });
    } else if (dateObj.getFullYear() === now.getFullYear()) {
      return dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
    } else {
      return dateObj.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch (error) {
    console.warn("Error formatting chat time:", error);
    return "";
  }
}

/**
 * Formats the conversation header information
 * Provides consistent formatting for chat headers across platforms
 */
export interface ChatHeaderInfo {
  displayName: string;
  displayRole: string;
  initials: string;
  lastSeen?: string;
}

export function formatChatHeader(conversation: any): ChatHeaderInfo {
  return {
    displayName: formatUserName(conversation.name),
    displayRole: formatUserRole(conversation.role),
    initials: getUserInitials(conversation.name),
    lastSeen: conversation.time ? formatChatTime(conversation.time) : undefined,
  };
}

/**
 * Truncates long messages for preview in conversation list
 * Ensures consistent message preview length and formatting
 */
export function formatMessagePreview(
  message: string | null | undefined,
  maxLength: number = 15
): string {
  if (!message || message.trim().length === 0) {
    return "No messages yet";
  }

  const cleanMessage = message.trim().replace(/\s+/g, " ");

  if (cleanMessage.length <= maxLength) {
    return cleanMessage;
  }

  return cleanMessage.substring(0, maxLength - 3) + "...";
}

/**
 * Formats unread count for display
 * Handles large numbers and provides consistent formatting
 */
export function formatUnreadCount(count: number | null | undefined): string {
  if (!count || count <= 0) return "";

  if (count > 99) {
    return "99+";
  }

  return count.toString();
}

/**
 * Gets the appropriate placeholder text for message input based on user role
 */
export function getMessageInputPlaceholder(
  userRole: string,
  recipientRole: string
): string {
  const userRoleFormatted = formatUserRole(userRole).toLowerCase();
  const recipientRoleFormatted = formatUserRole(recipientRole).toLowerCase();

  return `Type a message to your ${recipientRoleFormatted}...`;
}
