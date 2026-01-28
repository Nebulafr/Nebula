import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastContainer } from "react-toastify";
import React from "react";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Manrope } from "next/font/google";
import { Providers } from "./providers";
import { getLocale, getMessages } from 'next-intl/server';
import { cookies } from "next/headers";
import { TIMEZONE_COOKIE_NAME } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Nebula - Coaching Platform",
  description: "Connect with expert coaches and accelerate your career growth",
};

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cookieStore = await cookies();
  const timeZone = cookieStore.get(TIMEZONE_COOKIE_NAME)?.value || 'UTC';

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className={`${manrope.className} antialiased`}>
        <Providers locale={locale} messages={messages} timeZone={timeZone}>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
        <Toaster />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
