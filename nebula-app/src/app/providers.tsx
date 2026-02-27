 
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";


import { NextIntlClientProvider } from "next-intl";

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: any;
  timeZone: string;
}

export function Providers({ children, locale, messages, timeZone }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Strictly default to 'en' if not 'fr'
  const validLocale = locale === "fr" ? "fr" : "en";

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={validLocale} messages={messages} timeZone={timeZone}>
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}
