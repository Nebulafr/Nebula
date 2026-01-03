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
  "bg-emerald-50",
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
  "bg-gradient-to-br from-emerald-100 to-emerald-200",
];

/**
 * Get a background color for an event based on its index, ensuring no two sequential items share the same color
 * @param index - The index of the event in the list
 * @param previousIndex - Optional previous color index to avoid
 * @returns Tailwind CSS background color class
 */
export function getEventBackgroundColor(
  index: number,
  previousIndex?: number
): string {
  let colorIndex = index % backgroundColors.length;

  // If this would match the previous color, shift to the next one
  if (
    previousIndex !== undefined &&
    colorIndex === previousIndex % backgroundColors.length
  ) {
    colorIndex = (colorIndex + 1) % backgroundColors.length;
  }

  return backgroundColors[colorIndex];
}

/**
 * Get a gradient background for social events, ensuring no two sequential items share the same gradient
 * @param index - The index of the event in the list
 * @param previousIndex - Optional previous gradient index to avoid
 * @returns Tailwind CSS gradient background class
 */
export function getEventGradientBackground(
  index: number,
  previousIndex?: number
): string {
  let gradientIndex = index % gradientBackgrounds.length;

  // If this would match the previous gradient, shift to the next one
  if (
    previousIndex !== undefined &&
    gradientIndex === previousIndex % gradientBackgrounds.length
  ) {
    gradientIndex = (gradientIndex + 1) % gradientBackgrounds.length;
  }

  return gradientBackgrounds[gradientIndex];
}

/**
 * Get background colors for a list of events, ensuring no sequential duplicates
 * @param count - Number of events
 * @returns Array of Tailwind CSS background color classes
 */
export function getEventBackgroundColors(count: number): string[] {
  const colors: string[] = [];
  let lastIndex = -1;

  for (let i = 0; i < count; i++) {
    let colorIndex = i % backgroundColors.length;

    // Avoid same color as previous
    if (colorIndex === lastIndex) {
      colorIndex = (colorIndex + 1) % backgroundColors.length;
    }

    colors.push(backgroundColors[colorIndex]);
    lastIndex = colorIndex;
  }

  return colors;
}

/**
 * Get gradient backgrounds for a list of events, ensuring no sequential duplicates
 * @param count - Number of events
 * @returns Array of Tailwind CSS gradient background classes
 */
export function getEventGradientBackgrounds(count: number): string[] {
  const gradients: string[] = [];
  let lastIndex = -1;

  for (let i = 0; i < count; i++) {
    let gradientIndex = i % gradientBackgrounds.length;

    // Avoid same gradient as previous
    if (gradientIndex === lastIndex) {
      gradientIndex = (gradientIndex + 1) % gradientBackgrounds.length;
    }

    gradients.push(gradientBackgrounds[gradientIndex]);
    lastIndex = gradientIndex;
  }

  return gradients;
}

/**
 * Get a default avatar URL using pravatar.cc with consistent seeding
 * @param name - The person's name
 * @returns Pravatar.cc URL with consistent seed
 */
export function getDefaultAvatar(name?: string): string {
  const seed = name ? name.replace(/\s/g, "").toLowerCase() : "default";
  return `https://i.pravatar.cc/400?u=${seed}`;
}

/**
 * Get a default banner image URL using picsum.photos, ensuring no sequential duplicates
 * @param index - The index of the event in the list
 * @param previousSeed - Optional previous seed to avoid
 * @returns Picsum.photos URL with unique seed
 */
export function getDefaultBanner(index: number, previousSeed?: number): string {
  let seed = (index % 1000) + 1;

  // Avoid same seed as previous
  if (previousSeed !== undefined && seed === previousSeed) {
    seed = (seed % 1000) + 1;
  }

  return `https://picsum.photos/800/400?random=${seed}`;
}

/**
 * Get banner URLs for a list of events, ensuring no sequential duplicates
 * @param count - Number of events
 * @returns Array of picsum.photos URLs
 */
export function getDefaultBanners(count: number): string[] {
  const banners: string[] = [];
  let lastSeed = -1;

  for (let i = 0; i < count; i++) {
    let seed = (i % 1000) + 1;

    // Avoid same seed as previous
    if (seed === lastSeed) {
      seed = ((i + 1) % 1000) + 1;
    }

    banners.push(`https://picsum.photos/800/400?random=${seed}`);
    lastSeed = seed;
  }

  return banners;
}

/**
 * Get the access type display text
 * @param accessType - The access type from the database
 * @returns Display text for the access type
 */
export function getAccessTypeText(accessType?: string): string {
  return accessType?.toLowerCase() === "free" ? "Free" : "Premium";
}
