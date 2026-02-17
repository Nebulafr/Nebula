"use client";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Video, Loader2, Home } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useParams } from "next/navigation";
import { useEventBySlug, useAuth, useEventCheckout } from "@/hooks";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import {
  getDefaultAvatar,
  getDefaultBanner,
  getEventBackgroundColor,
} from "@/lib/event-utils";

import { CheckoutStatusModal } from "@/components/checkout/checkout-status-modal";
import { UserRole } from "@/enums";

export default function WebinarPage() {
  const t = useTranslations("events.details");
  const tCoach = useTranslations("coachDetails");
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

  const event = eventResponse?.data?.event || null;
  const error = queryError ? t("webinarNotFound") : null;

  const handleEventCheckout = async () => {
    if (!event) return;

    if (profile?.role && profile.role !== UserRole.STUDENT) {
      toast.info(t("notStudent"));
      return;
    }

    if (!isAuthenticated) {
      toast.info("Please log in to register for this event");
      router.push(`/login?returnUrl=/events/webinar/${slug}`);
      return;
    }

    try {
      const response = await initiateCheckout({
        eventId: event.id,
        successUrl: window.location.href + "?success=true",
        cancelUrl: window.location.href + "?canceled=true",
      });

      if (response.success && (response.data as any)?.url) {
        window.location.href = (response.data as any).url;
      } else {
        // Error toast is handled by the hook
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // error toast handled by hook
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
              {t("loadingWebinar")}
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
              <h1 className="text-2xl font-bold mb-4">{t("webinarNotFound")}</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <CheckoutStatusModal />
        <div className="container">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToEvents")}
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-8">
              <Card className="overflow-hidden rounded-xl">
                <div
                  className={`relative h-56 ${getEventBackgroundColor(0)}`}
                >
                  <Image
                    src={
                      event.images && event.images.length > 0
                        ? event.images[0]
                        : getDefaultBanner(0)
                    }
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 p-6 flex flex-col justify-end">
                    <h2 className="font-headline text-3xl font-bold text-white leading-tight">
                      {event.title}
                    </h2>
                    <p className="text-white/80 mt-2">
                      {t("hostedBy")} {event.organizer?.fullName || "Expert Host"}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="rounded-xl p-6">
                <h3 className="font-semibold mb-4">{t("hostedBy")}</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={
                        event.organizer?.avatarUrl ||
                        getDefaultAvatar(event.organizer?.fullName)
                      }
                    />
                    <AvatarFallback>
                      {event.organizer?.fullName?.charAt(0) || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {event.organizer?.fullName || "Expert Host"}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>
                        {event.organizer?.coach?.rating || 0} ({tCoach("reviewsCount", { count: event.organizer?.coach?.totalReviews || 0 })})
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Expert facilitator with years of experience in delivering
                  engaging webinars.
                </p>
              </Card>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <span>/</span>
                <span>Webinar</span>
              </div>
              <h1 className="font-headline text-4xl font-bold mt-4">
                {event.title}
              </h1>

              <Card className="my-8 rounded-xl p-6">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase text-muted-foreground">
                      {new Date(event.date)
                        .toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { month: "short" })
                        .toUpperCase()}
                    </span>
                    <span className="text-2xl font-bold">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
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
                      })}{" "}
                      -{" "}
                      {new Date(
                        new Date(event.date).getTime() + 60 * 60 * 1000
                      ).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: locale !== "fr",
                      })}{" "}
                      CET
                    </p>
                  </div>
                </div>
                <hr className="my-4" />
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center justify-center h-10 w-10">
                    <Video className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{t("onlineEvent")}</p>
                  </div>
                </div>
              </Card>

              {event.price > 0 && (
                <div className="mb-4 text-2xl font-bold">
                  {new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(event.price)}
                </div>
              )}

              <Button
                size="lg"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                onClick={handleEventCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("registerNow")}
              </Button>

              <div className="mt-12">
                <h3 className="text-xl font-bold mb-4">{t("aboutEvent")}</h3>
                <div className="prose max-w-none text-muted-foreground">
                  <p>{event.description}</p>
                </div>
                <Button variant="link" className="px-0 mt-2">
                  {t("showMore")} &raquo;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
