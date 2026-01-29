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
import { useEventBySlug } from "@/hooks";
import { useTranslations, useLocale } from "next-intl";
import { Event } from "@/types/event";
import {
  getDefaultAvatar,
  getDefaultBanner,
  getEventGradientBackground,
  getAccessTypeText,
} from "@/lib/event-utils";

export default function SocialEventPage() {
  const t = useTranslations("events.details");
  const locale = useLocale();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    data: eventResponse,
    isLoading: loading,
    error: queryError,
  } = useEventBySlug(slug);

  const event = eventResponse?.data?.event || null;
  const error = queryError ? t("eventNotFound") : null;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(false);
    setIsRegistered(true);
  };

  const handleCloseSuccess = () => {
    setIsRegistered(false);
  };

  const handleBackFromPayment = () => {
    setShowPayment(false);
    setShowRegistration(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              {t("loading")}
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
                  {t("backToEvents")}
                </Link>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">{t("eventNotFound")}</h1>
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
              {t("registered")}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t("registeredDesc", { title: event.title })}
            </p>
            <Button
              onClick={handleCloseSuccess}
              variant="outline"
              className="w-full mt-6 bg-transparent border-green-700 text-green-700 hover:bg-green-100 hover:text-green-800"
            >
              {t("close")}
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
                  {t("backToEvents")}
                </Button>
                <h3 className="font-semibold text-lg">{t("completeBooking")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("bookingFor", {
                    date: new Date(event.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }),
                    time: new Date(event.date).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: locale !== "fr",
                    })
                  })}
                </p>
              </div>
              <p className="text-lg font-bold">
                {event.isPublic
                  ? t("free")
                  : new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                      style: "currency",
                      currency: "EUR",
                    }).format(25)}
              </p>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="card">{t("cardDetails")}</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="card"
                      placeholder={t("cardNumber")}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiry">{t("expiry")}</Label>
                    <Input id="expiry" placeholder="MM/YY" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvc">{t("cvc")}</Label>
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

    return (
      <Card className="mb-6 rounded-xl border">
        <CardContent className="p-8">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 mt-4">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  event.organizer?.avatarUrl ||
                  getDefaultAvatar(event.organizer?.fullName)
                }
              />
              <AvatarFallback>
                {event.organizer?.fullName?.charAt(0) || "O"}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">
              {event.organizer?.fullName || t("unknownOrganizer")}
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
                    {new Date(event.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: locale !== "fr",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {t(event.accessType?.toLowerCase() === "free" ? "free" : "premium")} {t("perGuest")}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {t("spotsLeft", {
                      count: event.maxAttendees
                        ? event.maxAttendees - event.attendees
                        : 10
                    })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button size="lg" className="w-full mt-6" asChild>
            <a
              href={event.lumaEventLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("registerOnLuma")}
            </a>
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
                {t("backToEvents")}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
            {/* Left side: Image Layout */}
            <div className="relative h-[500px] rounded-xl overflow-hidden">
              <div className="w-full h-full">
                <Image
                  src={
                    images.length > 0
                      ? images[0]
                      : getDefaultBanner(0)
                  }
                  alt={event.title}
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={
                        images.length > 0
                          ? images[1]
                          : getDefaultBanner(1, 0)
                      }
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
                      src={
                        images.length > 0
                          ? images[2]
                          : getDefaultBanner(2, 1)
                      }
                      alt={`${event.title} - Image 3`}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
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
                        <p className="font-semibold">{t("location")}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <Users className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">{t("capacity")}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.maxAttendees
                            ? t("capacityDesc", { count: event.maxAttendees })
                            : t("capacityUnlimited")}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-semibold">{t("dateTime")}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(event.date).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: locale !== "fr",
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
                            <p className="font-semibold">{t("whatToBring")}</p>
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
                            <p className="font-semibold">{t("goodToKnow")}</p>
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
                            <p className="font-semibold">{t("tags")}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {event.tags.map((tag: any, index: number) => (
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
