"use client";
import { useState, useEffect } from "react";
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
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Sparkles,
  Star,
  Sun,
  Users,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getEventBySlug } from "@/actions/events";
import { Event } from "@/types/event";


export default function SocialEventPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);

      const response = await getEventBySlug(slug);

      if (response.success && response.data) {
        setEvent(response.data.event);
      } else {
        setError(response.message || "Event not found");
      }

      setLoading(false);
    }

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(false);
    setIsRegistered(true);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRegistration(false);
    setShowPayment(true);
  };

  const handleCloseSuccess = () => {
    setIsRegistered(false);
  };

  const handleRegisterClick = () => {
    setShowRegistration(true);
  };

  const handleBackFromPayment = () => {
    setShowPayment(false);
    setShowRegistration(true);
  };

  const handleBackFromRegistration = () => {
    setShowRegistration(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading event...
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12">
            <div className="mb-8">
              <Button variant="ghost" asChild>
                <Link href="/events">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Events
                </Link>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = event.images && event.images.length > 0 ? event.images : [];

  const renderBookingState = () => {
    if (isRegistered) {
      return (
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
      );
    }

    if (showPayment) {
      return (
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
                <h3 className="font-semibold text-lg">Complete booking</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You're booking for{" "}
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(event.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <p className="text-lg font-bold">
                {event.isPublic
                  ? "Free"
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EUR",
                    }).format(25)}
              </p>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="grid gap-4">
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
                    <Input id="expiry" placeholder="MM/YY" required />
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
      );
    }

    if (showRegistration) {
      return (
        <Card className="mt-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <Button
                  variant="ghost"
                  onClick={handleBackFromRegistration}
                  className="mb-4 -ml-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h3 className="font-semibold text-lg">Your Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please provide your details to register.
                </p>
              </div>
            </div>
            <form onSubmit={handleRegistrationSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required />
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <Button size="lg" type="submit" className="w-full mt-4">
                  Continue to Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6 rounded-xl border">
        <CardContent className="p-8">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.organizer?.avatarUrl} />
              <AvatarFallback>
                {event.organizer?.fullName?.charAt(0) || "O"}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">
              {event.organizer?.fullName || "Unknown Organizer"}
            </p>
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-2 py-0.5 text-[10px] text-yellow-700 ml-2"
            >
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              <span className="font-semibold">5.0</span>
            </Badge>
          </div>
          <p className="mt-4 text-muted-foreground">{event.description}</p>
          <div className="mt-6 space-y-3">
            <Card className="border">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {event.isPublic
                      ? "Free"
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "EUR",
                        }).format(25)}{" "}
                    / guest
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {event.maxAttendees
                      ? event.maxAttendees - event.attendees
                      : 10}{" "}
                    spots left
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button
            size="lg"
            className="w-full mt-6"
            onClick={handleRegisterClick}
          >
            Register
          </Button>
        </CardContent>
      </Card>
    );
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
            {/* Left side: Image Layout */}
            <div className="relative h-[500px] rounded-xl overflow-hidden">
              {images.length > 0 ? (
                <div className="w-full h-full">
                  <Image
                    src={images[0]}
                    alt={event.title}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={images[1]}
                        alt={`${event.title} - Image 2`}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  {images.length > 2 && (
                    <div className="absolute bottom-4 right-40 w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={images[2]}
                        alt={`${event.title} - Image 3`}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-lg font-medium text-blue-800">
                      {event.eventType.toLowerCase()} event
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Event Details and Booking */}
            <div>
              {renderBookingState()}
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
                          {event.maxAttendees || "unlimited"} participants.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(event.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>
                    {event.whatToBring && (
                      <>
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
                      </>
                    )}
                    {event.additionalInfo && (
                      <>
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
                      </>
                    )}
                    {event.tags && event.tags.length > 0 && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-4">
                          <Sparkles className="h-5 w-5 text-muted-foreground mt-1" />
                          <div>
                            <p className="font-semibold">Tags</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
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