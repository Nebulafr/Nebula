"use client";

import Image from "next/image";
import { LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";


import { logos } from "@/lib/images/logos";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  const { profile, signOut } = useAuth();
  const t = useTranslations("common");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const dashboardUrl =
    profile?.role === "COACH"
      ? "/coach-dashboard"
      : profile?.role === "ADMIN"
        ? "/admin"
        : "/dashboard";

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      suppressHydrationWarning
    >
      <div className="flex h-14 max-w-screen-2xl items-center px-header mx-auto">
        <div className="flex flex-1 items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 relative">
              <Image
                src={logos.nebulaLogo}
                alt="Nebula Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-headline text-xl font-bold notranslate">
              Nebula
            </span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex flex-nowrap notranslate">
            <Link
              href="/programs"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80 whitespace-nowrap"
            >
              {t("programs")}
            </Link>
            <Link
              href="/coaches"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80 whitespace-nowrap"
            >
              {t("coaches")}
            </Link>
            <Link
              href="/events"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80 whitespace-nowrap"
            >
              {t("events")}
            </Link>
            <Link
              href="/universities"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80 whitespace-nowrap"
            >
              {t("universities")}
            </Link>
            <Link
              href="/become-a-coach"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80 whitespace-nowrap"
            >
              {t("becomeCoach")}
            </Link>
            <Link
              href="/nebula-ai"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80 whitespace-nowrap"
            >
              {t("nebulaAi")}
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 notranslate">
          {profile ? (
            <>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? t("loggingOut") : t("logout")}
              </Button>
              <Button asChild>
                <Link href={dashboardUrl}>{t("dashboard")}</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
