"use client";

import Image from "next/image";
import { LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { logos } from "@/lib/images/logos";
import Link from "next/link";

declare global {
  interface Window {
    google?: any;
  }
}

function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // Check the current language from Google Translate cookie
    const checkLang = () => {
      const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
      if (match && match[1]) {
        setCurrentLang(match[1]);
      }
    };
    checkLang();
  }, []);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const select = document.querySelector(
      '.goog-te-combo'
    ) as HTMLSelectElement | null;

    if (select) {
      select.value = value;
      select.dispatchEvent(new Event('change'));
    }
    setCurrentLang(value);
  }, []);

  return (
    <div className="notranslate flex items-center gap-1 border rounded-md px-2 h-9 text-sm bg-background">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="bg-transparent outline-none cursor-pointer text-sm"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  );
}

export function Header() {
  const { profile, signOut } = useAuth();
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <span className="font-headline text-xl font-bold">Nebula</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/programs"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Programs
            </Link>
            <Link
              href="/coaches"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Coaches
            </Link>
            <Link
              href="/events"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Events
            </Link>

            <Link
              href="/universities"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              For Universities
            </Link>
            <Link
              href="/become-a-coach"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Become a coach
            </Link>
            <Link
              href="/nebula-ai"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Nebula Ai
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {profile ? (
            <>
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Log Out..." : "Log Out"}
              </Button>
              <Button asChild>
                <Link href={dashboardUrl}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
