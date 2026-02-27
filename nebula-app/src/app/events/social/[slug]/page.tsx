"use client";
import { } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Sun,
  Users,
  Loader2,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useEventBySlug, useEventCheckout, useAuth } from "@/hooks";
import { useTranslations, useLocale } from "next-intl";
import {
  getDefaultAvatar,
  getDefaultBanner,
} from "@/lib/event-utils";
import { toast } from "react-toastify";
import { CheckoutStatusModal } from "@/components/checkout/checkout-status-modal";
import { useParams, useRouter } from "next/navigation";
import { UserRole } from "../../../../../generated/prisma/edge";

export default function SocialEventPage() {
  const t = useTranslations("events.details");
  const locale = useLocale();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { mutateAsync: initiateCheckout, isPending: isCheckingOut } = useEventCheckout();
  const {
    data: eventResponse,
    isLoading: loading,
    error: queryError,
  } = useEventBySlug(slug);

  const event = eventResponse?.event || null;
  const error = queryError ? t("eventNotFound") : null;

  const handleEventCheckout = async () => {
    if (!event) return;

    if (profile?.role && profile.role !== UserRole.STUDENT) {
      toast.info(t("notStudent"));
      return;
    }

    if (!isAuthenticated) {
      toast.info("Please log in to register for this event");
      router.push(`/login?returnUrl=/events/social/${slug}`);
      return;
    }

    try {
      const response = await initiateCheckout({
        eventId: event.id,
        successUrl: window.location.href + "?success=true",
        cancelUrl: window.location.href + "?canceled=true",
      });

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
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
  const attendeesCount = Array.isArray(event.attendees) ? event.attendees.length : (event.attendees || 0);

  const renderBookingState = () => {
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
                    {event.price === 0 ? t("free") : `$${event.price || 0}`} {t("perPerson")}
                  </p>
                  {event.maxAttendees && (
                    <Badge variant="outline" className="mt-1">
                      {t("spotsLeft", {
                        count: event.maxAttendees - attendeesCount
                      })}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Button
            size="lg"
            className="w-full mt-6"
            onClick={handleEventCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("registerNow")}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <CheckoutStatusModal />
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
                          {event.location || t("onlineEvent")}
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
                              {event.tags.map((tag: string, index: number) => (
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
