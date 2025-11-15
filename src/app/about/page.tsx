"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  ArrowRight,
  Eye,
  Linkedin,
  LogOut,
  Sparkles,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { getAuth, signOut } from "firebase/auth";

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "about-hero");
  const storyImage = PlaceHolderImages.find((img) => img.id === "about-story");

  const team = [
    {
      name: "Alex Thompson",
      role: "Founder & CEO",
      avatar: "https://i.pravatar.cc/300/500?u=alex-thompson",
    },
    {
      name: "Ben Carter",
      role: "Head of Product",
      avatar: "https://i.pravatar.cc/300/500?u=ben-carter",
    },
    {
      name: "Chloe Davis",
      role: "Head of Coaching",
      avatar: "https://i.pravatar.cc/300/500?u=chloe-davis",
    },
  ];

  const partners = [
    { name: "Innovate Inc." },
    { name: "QuantumLeap" },
    { name: "Stellar Solutions" },
    { name: "Apex Enterprises" },
    { name: "Synergy Corp" },
    { name: "NextGen" },
    { name: "Pinnacle" },
    { name: "FusionWorks" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-screen flex items-end text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container pb-20 text-left">
            <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-7xl">
              Our Mission
            </h1>
            <p className="mt-4 max-w-3xl font-body text-lg text-white/80 md:text-xl">
              To democratize access to world-class career coaching and empower
              individuals to achieve their professional dreams, regardless of
              their background or location.
            </p>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-3 md:gap-12">
            <div className="md:col-span-1">
              <h2 className="font-headline text-4xl">About Us</h2>
            </div>
            <div className="md:col-span-2">
              <p className="text-[28px] font-medium text-muted-foreground">
                We’re not an AI platform. At our core, we champion
                human-centered interactions. That doesn’t mean we’re against AI
                — far from it. In fact, AI is a powerful enabler of our mission:
                connecting students with coaches for real-world job immersion
                and growth.
              </p>
            </div>
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section className="py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">Meet the Team</h2>
              <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
                The minds behind the mission, dedicated to your success.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-col items-start text-left"
                >
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="rounded-2xl object-cover"
                    />
                  </div>
                  <h3 className="font-headline text-xl font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-3 md:gap-12">
            <div className="md:col-span-1">
              <h2 className="font-headline text-4xl">Our Partners</h2>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 items-center mt-8 md:mt-0">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex justify-center items-center"
                >
                  <span className="font-headline text-2xl font-semibold text-muted-foreground/80">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="container">
          <Separator />
        </div>

        <section className="container py-20 sm:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
            <Card className="rounded-2xl bg-primary border-none h-full">
              <CardContent className="p-12 text-left h-full flex flex-col justify-center">
                <h2 className="font-headline text-4xl text-primary-foreground">
                  Join Our Team
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
                  We're always looking for passionate individuals to join us on
                  our mission. If you believe in the power of mentorship, we'd
                  love to hear from you.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-8 bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/become-a-coach">
                    View Open Roles <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            {storyImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image
                  src={storyImage.imageUrl}
                  alt={storyImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={storyImage.imageHint}
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const { user, profile } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const dashboardUrl =
    profile?.role === "coach" ? "/coach-dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-screen-2xl items-center px-header mx-auto">
        <div className="flex flex-1 items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="currentColor"
            >
              <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
            </svg>
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
              href="/events"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Events
            </Link>
            <Link
              href="/become-a-coach"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Become a coach
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
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
        </div>
      </div>
    </header>
  );
}
