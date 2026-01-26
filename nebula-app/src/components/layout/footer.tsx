import Image from "next/image";
import Link from "next/link";
import { logos } from "@/lib/images/logos";
import { useLanguage } from "@/contexts/language-context";


export function Footer() {
  const { isFrench } = useLanguage();
  const footerLinks = {
    Company: [
      { title: "About Us", href: "/about" },
      { title: "Careers", href: "/careers" },
    ],
    Resources: [
      { title: "Help Center", href: "/help-center" },
      { title: "Privacy Policy", href: "/privacy-policy" },
      { title: "Terms of Service", href: "/terms-of-service" },
    ],
    Connect: [
      { title: "LinkedIn", href: "#" },
      { title: "Facebook", href: "#" },
      { title: "Instagram", href: "#" },
    ],
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
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
              <span className="notranslate font-headline text-2xl font-bold">Nebula</span>
            </Link>
            <p className="mt-4 text-xs text-secondary-foreground/70">
              Empower your career journey.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-4">
            <div>
              <h4 className="font-headline text-xs font-bold text-secondary-foreground">
                Programs
              </h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/programs"
                    className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                  >
                    Career Programs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coaches"
                    className="notranslate text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                  >
                    {isFrench ? "Coachs" : "Coaches"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
                  >
                    Events
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
        <div className="mt-8 border-t border-secondary-foreground/20 pt-8 text-center text-xs text-secondary-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} Nebula, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
