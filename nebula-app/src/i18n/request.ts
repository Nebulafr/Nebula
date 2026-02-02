import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
import {defaultLocale, LOCALE_COOKIE_NAME, TIMEZONE_COOKIE_NAME} from './config';

async function loadMessages(locale: string) {
  const common = (await import(`../../messages/${locale}/common.json`)).default;
  const auth = (await import(`../../messages/${locale}/auth.json`)).default;
  const dashboard = (await import(`../../messages/${locale}/dashboard.json`)).default;
  const pages = (await import(`../../messages/${locale}/pages.json`)).default;
  const marketing = (await import(`../../messages/${locale}/marketing.json`)).default;

  return {
    ...common,
    ...auth,
    ...dashboard,
    ...pages,
    ...marketing
  };
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const timeZone = cookieStore.get(TIMEZONE_COOKIE_NAME)?.value || 'UTC';
  
  // Strictly default to 'en' if not precisely 'fr'
  const locale = rawLocale === "fr" ? "fr" : "en";
  
  return {
    locale,
    messages: await loadMessages(locale),
    timeZone
  };
});
