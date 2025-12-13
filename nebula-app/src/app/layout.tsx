import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastContainer } from "react-toastify";
import React from "react";
import { CategoryProvider } from "@/contexts/category-context";
import { EventsProvider } from "@/contexts/events-context";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ProgramsProvider } from "@/contexts/programs-context";
import { Manrope } from "next/font/google";

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
  return (
    <html lang="en">
      <body className={`${manrope.className}  antialiased`}>
        <AuthProvider>
          <CategoryProvider>
            <ProgramsProvider>
              <EventsProvider>{children}</EventsProvider>
            </ProgramsProvider>
          </CategoryProvider>
        </AuthProvider>
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
