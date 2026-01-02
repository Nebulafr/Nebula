/**
 * Utility functions for event card components
 * Provides consistent styling and image generation across all event displays
 */

// Array of background colors for webinar cards
export const backgroundColors = [
  "bg-yellow-50",
  "bg-blue-50", 
  "bg-green-50",
  "bg-purple-50",
  "bg-pink-50",
  "bg-indigo-50",
  "bg-orange-50",
  "bg-teal-50",
  "bg-cyan-50",
  "bg-emerald-50"
];

// Array of gradient backgrounds for social event cards
export const gradientBackgrounds = [
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-purple-100 to-purple-200", 
  "bg-gradient-to-br from-pink-100 to-pink-200",
  "bg-gradient-to-br from-green-100 to-green-200",
  "bg-gradient-to-br from-yellow-100 to-yellow-200",
  "bg-gradient-to-br from-indigo-100 to-indigo-200",
  "bg-gradient-to-br from-orange-100 to-orange-200",
  "bg-gradient-to-br from-teal-100 to-teal-200",
  "bg-gradient-to-br from-cyan-100 to-cyan-200",
  "bg-gradient-to-br from-emerald-100 to-emerald-200"
];

/**
 * Get a consistent background color for an event based on its ID or title
 * @param eventId - The event ID
 * @param eventTitle - The event title (fallback if no ID)
 * @returns Tailwind CSS background color class
 */
export function getEventBackgroundColor(eventId?: string, eventTitle?: string): string {
  const seed = eventId || eventTitle || "";
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return backgroundColors[hash % backgroundColors.length];
}

/**
 * Get a consistent gradient background for social events
 * @param eventId - The event ID
 * @param eventTitle - The event title (fallback if no ID)
 * @returns Tailwind CSS gradient background class
 */
export function getEventGradientBackground(eventId?: string, eventTitle?: string): string {
  const seed = eventId || eventTitle || "";
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientBackgrounds[hash % gradientBackgrounds.length];
}

/**
 * Get a default avatar URL using pravatar.cc with consistent seeding
 * @param name - The person's name
 * @returns Pravatar.cc URL with consistent seed
 */
export function getDefaultAvatar(name?: string): string {
  const seed = name ? name.replace(/\s/g, '').toLowerCase() : 'default';
  return `https://i.pravatar.cc/400?u=${seed}`;
}

/**
 * Get a default banner image URL using picsum.photos with consistent seeding
 * @param title - The event title
 * @returns Picsum.photos URL with consistent seed
 */
export function getDefaultBanner(title?: string): string {
  const seed = title ? title.replace(/\s/g, '').toLowerCase().charCodeAt(0) % 1000 + 1 : 1;
  return `https://picsum.photos/800/400?random=${seed}`;
}

/**
 * Get the access type display text
 * @param accessType - The access type from the database
 * @returns Display text for the access type
 */
export function getAccessTypeText(accessType?: string): string {
  return accessType === "free" ? "Free" : "Premium";
}