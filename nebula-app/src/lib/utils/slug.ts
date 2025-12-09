export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateUniqueSlug(text: string, existingSlugs: string[] = []): string {
  const baseSlug = generateSlug(text);
  
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}

export function generateTimestampSlug(text: string): string {
  const baseSlug = generateSlug(text);
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}