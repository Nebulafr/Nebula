import Image from "next/image";
import Link from "next/link";
import { logos } from "@/lib/images/logos";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");

  const footerLinks = {
    [t("sections.company")]: [
      { title: tc("about"), href: "/about" },
      { title: tc("careers"), href: "/careers" },
    ],
    [t("sections.resources")]: [
      { title: tc("helpCenter"), href: "/help-center" },
      { title: tc("privacyPolicy"), href: "/privacy-policy" },
      { title: tc("termsOfService"), href: "/terms-of-service" },
    ],
    [t("sections.connect")]: [
      {
        title: "LinkedIn",
        href: "http://linkedin.com/company/discover-nebula",
      },
      { title: "Facebook", href: "#" },
      { title: "Instagram", href: "https://www.instagram.com/nebulaengage" },
    ],
  };

  return (
    <footer
      className="border-t bg-secondary text-secondary-foreground"
      suppressHydrationWarning
    >
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 relative">
                <Image
                  src={logos.nebulaLogo}
                  alt="Nebula Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-headline text-2xl font-bold notranslate">
                Nebula
              </span>
            </Link>
            <p className="mt-4 text-xs text-secondary-foreground/70">
              {t("description")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-4">
            <div>
              <h4 className="font-headline text-xs font-bold text-secondary-foreground">
                {t("sections.programs")}
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/programs"
                    className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                  >
                    {t("links.career")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coaches"
                    className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                  >
                    {tc("coaches")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                  >
                    {tc("events")}
                  </Link>
                </li>
              </ul>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-headline text-xs font-bold text-secondary-foreground">
                  {title}
                </h4>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-secondary-foreground/20 pt-8 text-center text-xs text-secondary-foreground/60 notranslate">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
