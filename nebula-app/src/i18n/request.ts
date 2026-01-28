import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
import {defaultLocale, LOCALE_COOKIE_NAME, TIMEZONE_COOKIE_NAME} from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const timeZone = cookieStore.get(TIMEZONE_COOKIE_NAME)?.value || 'UTC';
  
  // Strictly default to 'en' if not precisely 'fr'
  const locale = rawLocale === "fr" ? "fr" : "en";
  
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone
  };
});
