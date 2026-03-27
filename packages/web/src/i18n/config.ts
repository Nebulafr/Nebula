export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const TIMEZONE_COOKIE_NAME = 'USER_TIMEZONE';
