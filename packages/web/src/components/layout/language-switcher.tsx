"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE_NAME } from "@/i18n/config";

import Cookies from "universal-cookie";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const cookies = new Cookies();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    
    // Use universal-cookie for consistent behavior
    cookies.set(LOCALE_COOKIE_NAME, newLocale, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax"
    });
    
    // Trigger a refresh to update the server components and next-intl state
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 border rounded-md px-2 h-9 text-sm bg-background">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={handleLanguageChange}
        className="bg-transparent outline-none cursor-pointer text-sm font-medium"
      >
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </div>
  );
}
