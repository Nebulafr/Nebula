import Image from "next/image";
import Link from "next/link";
import { logos } from "@/lib/images/logos";

export default function CoachOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex flex-1 items-center gap-12">
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
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Link
              href="/help-center"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Help
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
