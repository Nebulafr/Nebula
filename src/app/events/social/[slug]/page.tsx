"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";

const eventData: Record<string, any> = {
  "hiking-adventure": {
    title: "Hiking Adventure",
    organizer: {
      name: "Maxwell Boyt",
      rating: 4.9,
      avatar: "https://i.pravatar.cc/40?u=maxwell",
    },
    description:
      "Join us for a scenic hike through the beautiful mountain trails. A great way to connect with nature and fellow professionals.",
    totalSlots: 7,
    filledSlots: 3,
    images: [
      PlaceHolderImages.find((img) => img.id === "social-hiking-1"),
      PlaceHolderImages.find((img) => img.id === "social-hiking-2"),
      PlaceHolderImages.find((img) => img.id === "social-hiking-3"),
    ],
    sessions: [
      {
        date: "Monday, Aug 26",
        time: "9:00 AM",
        spotsLeft: 2,
        price: 25,
        currency: "EUR",
      },
      {
        date: "Wednesday, Aug 28",
        time: "11:00 AM",
        spotsLeft: 5,
        price: 25,
        currency: "EUR",
      },
      {
        date: "Friday, Aug 30",
        time: "9:00 AM",
        spotsLeft: 3,
        price: 25,
        currency: "EUR",
      },
    ],
    location: "Mountain View Park, Trailhead #2",
    whatToBring:
      "Comfortable hiking shoes, water bottle, sunscreen, and a hat.",
    additionalInfo:
      "The hike is of moderate difficulty and is approximately 5 miles long. Please arrive 15 minutes early for a brief orientation.",
  },
  // Add other events here
};

export default function SocialEventPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const event = eventData[slug] || eventData["hiking-adventure"]; // Fallback to default
  const [showPayment, setShowPayment] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const images = event.images.filter(Boolean);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(false);
    setIsRegistered(true);
  };

  const handleCloseSuccess = () => {
    setIsRegistered(false);
    setSelectedSession(null);
  };

  const handleSessionSelect = (session: any) => {
    setSelectedSession(session);
    setShowPayment(true);
  };

  const handleBackFromPayment = () => {
    setShowPayment(false);
    setSelectedSession(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
            {/* Left side: Image Collage */}
            <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px]">
              {images.length > 0 && images[0] && (
                <div className="col-span-2 row-span-2 rounded-xl overflow-hidden">
                  <Image
                    src={images[0].imageUrl}
                    alt={images[0].description}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                    data-ai-hint={images[0].imageHint}
                  />
                </div>
              )}
              {images.length > 1 && images[1] && (
                <div className="absolute bottom-4 right-4 col-span-1 row-span-1 rounded-xl overflow-hidden w-1/3 border-4 border-white shadow-lg">
                  <Image
                    src={images[1].imageUrl}
                    alt={images[1].description}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    data-ai-hint={images[1].imageHint}
                  />
                </div>
              )}
            </div>

            {/* Right side: Event Details and Booking */}
            <div>
              {isRegistered ? (
                <Card className="mb-6 rounded-xl border bg-green-50">
                  <CardContent className="p-8 text-center text-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <h3 className="font-headline text-2xl font-bold">
                      You're Registered!
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Your spot for {event.title} is confirmed. We've sent a
                      confirmation to your email.
                    </p>
                    <Button
                      onClick={handleCloseSuccess}
                      variant="outline"
                      className="w-full mt-6 bg-transparent border-green-700 text-green-700 hover:bg-green-100 hover:text-green-800"
                    >
                      Close
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6 rounded-xl border">
                  <CardContent className="p-8">
                    <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
                      {event.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={event.organizer.avatar} />
                        <AvatarFallback>
                          {event.organizer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-semibold">{event.organizer.name}</p>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-2 py-0.5 text-[10px] text-yellow-700 ml-2"
                      >
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="font-semibold">
                          {event.organizer.rating}
                        </span>
                      </Badge>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                      {event.description}
                    </p>

                    {!showPayment && (
                      <div className="mt-6 space-y-3">
                        {event.sessions.map((session: any, index: number) => (
                          <Card
                            key={index}
                            className="cursor-pointer border hover:shadow-lg transition-shadow"
                            onClick={() => handleSessionSelect(session)}
                          >
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{session.date}</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.time}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: session.currency,
                                  }).format(session.price)}{" "}
                                  / guest
                                </p>
                                <Badge variant="outline" className="mt-1">
                                  {session.spotsLeft} spots left
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {showPayment && (
                      <Card className="mt-6 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <Button
                                variant="ghost"
                                onClick={handleBackFromPayment}
                                className="mb-4 -ml-4"
                              >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                              </Button>
                              <h3 className="font-semibold text-lg">
                                Complete booking
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                You're booking for {selectedSession?.date} at{" "}
                                {selectedSession?.time}
                              </p>
                            </div>
                            <p className="text-lg font-bold">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: selectedSession?.currency,
                              }).format(selectedSession?.price)}
                            </p>
                          </div>
                          <form onSubmit={handlePaymentSubmit}>
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  placeholder="John Doe"
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="m@example.com"
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="card">Card Details</Label>
                                <div className="relative">
                                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    id="card"
                                    placeholder="Card number"
                                    className="pl-10"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="expiry">Expiry</Label>
                                  <Input
                                    id="expiry"
                                    placeholder="MM/YY"
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="cvc">CVC</Label>
                                  <Input id="cvc" placeholder="CVC" required />
                                </div>
                              </div>
                              <Button
                                size="lg"
                                type="submit"
                                className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90"
                              >
                                Confirm Payment
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="rounded-xl border">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <Users className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">Capacity</p>
                        <p className="text-sm text-muted-foreground">
                          This event has a maximum capacity of{" "}
                          {event.totalSlots} participants.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <Sun className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">What to bring</p>
                        <p className="text-sm text-muted-foreground">
                          {event.whatToBring}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <Sparkles className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">Good to know</p>
                        <p className="text-sm text-muted-foreground">
                          {event.additionalInfo}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
              className="font-menu text-sm font-medium text-foreground"
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
