"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { useCoachById } from "@/hooks/use-coach-queries";
import { useSessionCheckout } from "@/hooks/use-checkout-queries";
import { useQueryClient } from "@tanstack/react-query";
import { reviewCoach } from "@/actions/reviews";
import { createConversation } from "@/actions/messaging";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { CoachHeader } from "./components/CoachHeader";
import { ExperienceLogos } from "./components/ExperienceLogos";
import { ProgramsSection } from "./components/ProgramsSection";
import { ScheduleOverview } from "./components/ScheduleOverview";
import { ResumeSection } from "./components/ResumeSection";
import { SpecialitiesSection } from "./components/SpecialitiesSection";
import { ReviewsSection } from "./components/ReviewsSection";
import { BookingSidebar } from "./components/BookingSidebar";
import { BookingModal } from "./components/BookingModal";
import { Button } from "@/components/ui/button";


const getAvailabilityData = (coach: any) => {
  if (!coach.availability) return {};
  try {
    return typeof coach.availability === "string"
      ? JSON.parse(coach.availability)
      : coach.availability;
  } catch (e) {
    console.error("Failed to parse availability", e);
    return {};
  }
};

export default function CoachDetailPage() {
  const t = useTranslations("coachDetails");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [duration, setDuration] = useState("60");
  const [weekOffset, setWeekOffset] = useState(0);

  const params = useParams<{ coachId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, isAuthenticated, isStudent } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: coach,
    isLoading: loading,
    error: coachError,
  } = useCoachById(params.coachId);

  const { mutateAsync: initiateCheckout, isPending: isCheckingOut } =
    useSessionCheckout();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success(t("sessionBooked") || "Session booked successfully!");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else if (searchParams.get("canceled") === "true") {
      toast.info(t("bookingCancelled") || "Booking cancelled");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, t]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coach) return;

    setIsSubmittingReview(true);
    try {
      const response = await reviewCoach({
        coachId: coach.id,
        rating,
        content: reviewText,
      });

      if (response.success) {
        setReviewSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ["coach", params.coachId] });
      } else {
        toast.error(response.error || "Failed to submit review.");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const resetReviewForm = () => {
    setIsReviewDialogOpen(false);
    setTimeout(() => {
      setReviewSubmitted(false);
      setRating(0);
      setHoverRating(0);
      setReviewText("");
    }, 300);
  };

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!coach) {
      toast.error(t("coachInfoNotAvailable") || "Coach info not available");
      return;
    }

    try {
      const conversationResult = await createConversation({
        participants: [profile && profile.id, coach.userId],
        type: "DIRECT",
      });

      if (conversationResult.success && conversationResult.data) {
        router.push(
          `/dashboard/messaging?conversationId=${conversationResult.data.id}`
        );
      } else {
        throw new Error(
          conversationResult.error || "Failed to create conversation"
        );
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error(t("startConvFailed") || "Failed to start conversation");
    }
  };

  const handleBookingConfirm = async (selectedSlot: {
    date: Date;
    time: string;
  }) => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && !isStudent) {
      toast.info(t("notStudent") || "Only students can book sessions");
      return;
    }

    const [hours, minutes] = selectedSlot.time.split(":").map(Number);
    const sessionDate = new Date(selectedSlot.date);
    sessionDate.setHours(hours, minutes, 0, 0);
    const scheduledTime = sessionDate.toISOString();

    try {
      const response = await initiateCheckout({
        coachId: params.coachId,
        scheduledTime,
        duration: parseInt(duration),
        successUrl: window.location.href + "?success=true",
        cancelUrl: window.location.href + "?canceled=true",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (response && response.success && (response.data as any)?.url) {
        window.location.href = (response.data as any).url;
      } else {
        toast.error(response.error || "Failed to initiate checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred during checkout.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 rounded w-32"></div>
                <div className="h-12 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (coachError || !coach) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t("coachNotFound") || "Coach Not Found"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("coachNotFoundDesc") ||
                "Sorry, we couldn't find the coach you're looking for."}
            </p>
            <Button asChild>
              <Link href="/coaches">
                {t("browseAll") || "Browse All Coaches"}
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse data using helper functions
  const experienceList = coach.experiences || [];
  const availabilityData = getAvailabilityData(coach);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/coaches" className="hover:text-primary">
                  {t("backToCoaches") || "Coaches"}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>{coach.fullName}</span>
              </div>

              <CoachHeader coach={coach} />
              <ExperienceLogos coach={coach} />
              <ProgramsSection coach={coach} />

              <ScheduleOverview
                availabilityData={availabilityData}
                weekOffset={weekOffset}
                setWeekOffset={setWeekOffset}
                duration={duration}
                setDuration={setDuration}
                openBookingModal={() => setIsBookingModalOpen(true)}
              />

              <ResumeSection experienceList={experienceList} />
              <SpecialitiesSection coach={coach} />

              <ReviewsSection
                coach={coach}
                isReviewDialogOpen={isReviewDialogOpen}
                setIsReviewDialogOpen={setIsReviewDialogOpen}
                reviewSubmitted={reviewSubmitted}
                isSubmittingReview={isSubmittingReview}
                rating={rating}
                setRating={setRating}
                hoverRating={hoverRating}
                setHoverRating={setHoverRating}
                reviewText={reviewText}
                setReviewText={setReviewText}
                handleReviewSubmit={handleReviewSubmit}
                resetReviewForm={resetReviewForm}
                isStudent={isStudent}
              />
            </div>

            <div className="md:col-span-1 relative pt-10">
              <div className="sticky top-24">
                <BookingSidebar
                  onMessageClick={handleMessageClick}
                  openBookingModal={() => setIsBookingModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </section>

        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          coach={coach}
          duration={duration}
          setDuration={setDuration}
          onConfirm={handleBookingConfirm}
          isCheckingOut={isCheckingOut}
          availabilityData={availabilityData}
        />
      </main>
      <Footer />
    </div>
  );
}
