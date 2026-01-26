"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export type SupportedLanguage = "en" | "fr";

const getLanguageFromCookie = (): SupportedLanguage => {
  if (typeof window === "undefined") return "en";
  const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  if (match && match[1] && (match[1] === "en" || match[1] === "fr")) {
    return match[1] as SupportedLanguage;
  }
  return "en";
};

const setGoogleTranslateCookie = (lang: SupportedLanguage) => {
  const domain = window.location.hostname;
  document.cookie = `googtrans=/en/${lang}; path=/`;
  document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain}`;
};

export interface LanguageContextValue {
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isEnglish: boolean;
  isFrench: boolean;
  isChangingLanguage: boolean;
  hasMounted: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>("en");
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const cookieLang = getLanguageFromCookie();
    setGoogleTranslateCookie(cookieLang);
    setCurrentLang(cookieLang);

    const syncLangFromCookie = () => {
      const lang = getLanguageFromCookie();
      setCurrentLang(lang);
    };

    if (!document.getElementById("google_translate_element")) {
      const translateDiv = document.createElement("div");
      translateDiv.id = "google_translate_element";
      translateDiv.className = "hidden";
      document.body.appendChild(translateDiv);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr",
          autoDisplay: false,
        },
        "google_translate_element",
      );
      syncLangFromCookie();
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      syncLangFromCookie();
    }

    const langObserver = new MutationObserver(() => {
      syncLangFromCookie();
    });

    langObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "lang"],
    });

    return () => langObserver.disconnect();
  }, []);

  useEffect(() => {
    if (currentLang !== "fr") return;

    const replaceTranslations = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue?.includes("Entraîneurs")) {
          node.nodeValue = node.nodeValue.replace(/Entraîneurs/g, "Coachs");
        }
      }
    };

    replaceTranslations();

    const textObserver = new MutationObserver(() => {
      replaceTranslations();
    });

    textObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => textObserver.disconnect();
  }, [currentLang]);

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      if (lang === currentLang) return;

      setIsChangingLanguage(true);
      setGoogleTranslateCookie(lang);

      const select = document.querySelector(
        ".goog-te-combo",
      ) as HTMLSelectElement | null;

      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
      }
      setCurrentLang(lang);

      setTimeout(() => {
        setIsChangingLanguage(false);
      }, 800);
    },
    [currentLang],
  );

  const value: LanguageContextValue = {
    currentLang,
    setLanguage,
    isEnglish: currentLang === "en",
    isFrench: hasMounted && currentLang === "fr",
    isChangingLanguage,
    hasMounted,
  };

  return (
    <LanguageContext.Provider value={value}>
      {isChangingLanguage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              {currentLang === "fr" ? "Traduction..." : "Translating..."}
            </span>
          </div>
        </div>
      )}
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
