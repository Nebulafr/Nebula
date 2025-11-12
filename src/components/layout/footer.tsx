
import { Linkedin, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    Company: [
      { title: 'About Us', href: '/about' },
      { title: 'Careers', href: '#' },
      { title: 'Press', href: '#' },
      { title: 'Admin', href: '/admin' },
    ],
    Resources: [
      { title: 'Help Center', href: '/help-center' },
      { title: 'Privacy Policy', href: '#' },
      { title: 'Terms of Service', href: '#' },
    ],
    Connect: [
      { title: 'Twitter', href: '#' },
      { title: 'LinkedIn', href: '#' },
      { title: 'Facebook', href: '#' },
      { title: 'Instagram', href: '#' },
    ],
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-7 w-7 text-primary"
                fill="currentColor"
              >
                <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
              </svg>
              <span className="font-headline text-2xl font-bold">Nebula</span>
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
                  <li><Link href="/programs" className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground">Career Programs</Link></li>
                  <li><Link href="/coaches" className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground">Coaches</Link></li>
                  <li><Link href="#" className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground">Skill Assessment</Link></li>
                  <li><Link href="#" className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground">Industry network</Link></li>
                  <li><Link href="/events" className="text-xs text-secondary-foreground/70 transition-colors hover:text-secondary-foreground">Events</Link></li>
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
