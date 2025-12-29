"use client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  PlusCircle,
  Star,
  X,
  CheckCircle,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { WeeklyTimeSlotPicker } from "@/components/ui/weekly-time-slot-picker";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { bookCoachSession } from "@/actions/session";
import { toast } from "react-toastify";
import { getCoachById } from "@/actions/coaches";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewCoach } from "@/actions/reviews";
import { createConversation } from "@/actions/messaging";
import { CoachWithRelations } from "@/types/coach";

export default function CoachDetailPage() {
  const [bookingStep, setBookingStep] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [coach, setCoach] = useState<CoachWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams<{ coachId: string }>();
  const router = useRouter();
  const { profile, isStudent } = useAuth();
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  console.log({ coach });

  useEffect(() => {
    const fetchCoach = async () => {
      if (!params.coachId) return;

      try {
        setLoading(true);
        const response = await getCoachById(params.coachId);

        if (response.success && response.data?.coach) {
          setCoach(response.data?.coach!);
        } else {
          setCoach({
            id: "mock-coach",
            userId: "mock-user-id",
            email: "adrian@example.com",
            fullName: "Adrian Cucurella",
            title: "Partner, BCG",
            avatarUrl: "https://i.pravatar.cc/150?u=adrian-cucurella",
            rating: 4.9,
            studentsCoached: 150,
            totalSessions: 150,
            specialties: ["Consulting", "Strategy"],
            slug: params.coachId,
            category: "Career Prep",
            bio: "With over five years of experience at a leading global consulting firm, Adrian brings deep expertise in strategy and operations. Now a Consultant at BCG, they help Fortune 500 clients tackle complex business challenges. Their work spans multiple industries, with a focus on digital transformation and growth strategy. Passionate about talent development, they coach emerging professionals on a job immersion platform. Adrian holds a Master's degree in Business and thrives at the intersection of impact and innovation.",
            style: "Professional",
            pastCompanies: ["BCG", "PALIN"],
            linkedinUrl: "",
            availability: "Weekends",
            hourlyRate: 100,
            isActive: true,
            isVerified: true,
            totalReviews: 6,
            qualifications: [],
            languages: ["English"],
            experience: "5+ years in consulting",
            timezone: "PST",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hasUserReviewed: false,
            programs: [
              {
                id: "mock-1",
                title: "Consulting, Associate Level",
                category: "Career Prep",
                slug: "consulting-associate-level",
                description: "Learn consulting fundamentals",
                price: 299,
                duration: "8 weeks",
                rating: 4.8,
                currentEnrollments: 15,
                createdAt: new Date().toISOString(),
              },
              {
                id: "mock-2",
                title: "MBA Admissions Coaching",
                category: "School Admissions",
                slug: "mba-admissions",
                description: "Get into top MBA programs",
                price: 499,
                duration: "12 weeks",
                rating: 4.9,
                currentEnrollments: 8,
                createdAt: new Date().toISOString(),
              },
            ],
            reviews: [
              {
                id: "review-1",
                reviewerId: "student-1",
                revieweeId: "mock-coach",
                targetId: "mock-coach",
                targetType: "COACH",
                rating: 5,
                title: "Excellent PM coaching",
                content:
                  "Sarah was incredibly insightful and supportive. Her real-world examples from Google made complex concepts easy to understand. I left the session feeling more confident and inspired.",
                isVerified: false,
                isPublic: true,
                helpfulCount: 12,
                tags: ["product-management", "interview-prep"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                reviewer: {
                  id: "student-1",
                  fullName: "Jessica Wang",
                  avatarUrl: "https://i.pravatar.cc/40?u=jessica-wang",
                },
                reviewee: {
                  id: "mock-coach",
                  fullName: "Adrian Cucurella",
                  avatarUrl: "https://i.pravatar.cc/150?u=adrian-cucurella",
                },
              },
              {
                id: "review-2",
                reviewerId: "student-6",
                revieweeId: "mock-coach",
                targetId: "mock-coach",
                targetType: "COACH",
                rating: 5,
                title: "Great mentor for PMs",
                content:
                  "As a current PM looking to level up, Sarah's insights were invaluable. She helped me identify gaps in my strategy thinking and provided actionable frameworks.",
                isVerified: true,
                isPublic: true,
                helpfulCount: 8,
                tags: ["career-advancement", "strategy"],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                reviewer: {
                  id: "student-6",
                  fullName: "Ryan O'Connor",
                  avatarUrl: "https://i.pravatar.cc/40?u=ryan-oconnor",
                },
                reviewee: {
                  id: "mock-coach",
                  fullName: "Adrian Cucurella",
                  avatarUrl: "https://i.pravatar.cc/150?u=adrian-cucurella",
                },
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching coach:", error);
        setCoach({
          id: "mock-coach",
          userId: "mock-user-id",
          email: "adrian@example.com",
          fullName: "Adrian Cucurella",
          title: "Partner, BCG",
          avatarUrl: "https://i.pravatar.cc/150?u=adrian-cucurella",
          rating: 4.9,
          studentsCoached: 150,
          totalSessions: 150,
          specialties: ["Consulting", "Strategy"],
          slug: params.coachId,
          category: "Career Prep",
          bio: "With over five years of experience at a leading global consulting firm, Adrian brings deep expertise in strategy and operations.",
          style: "Professional",
          pastCompanies: ["BCG", "PALIN"],
          linkedinUrl: "",
          availability: "Weekends",
          hourlyRate: 100,
          isActive: true,
          isVerified: true,
          totalReviews: 6,
          qualifications: [],
          languages: ["English"],
          experience: "5+ years in consulting",
          timezone: "PST",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasUserReviewed: false,
          programs: [],
          reviews: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, [params.coachId]);

  const handleBookClick = () => {
    console.log("Start Booking...");
    if (!profile) {
      toast.error("Please log in to book a session.");
      router.replace("/login");
      return;
    }
    setBookingStep(1);
  };

  const handleCancelBooking = () => {
    setBookingStep(0);
    setDate(undefined);
    setSelectedTime("");
  };

  const handleTimeSelect = async () => {
    if (!date || !profile) {
      toast.error("Please select a date and ensure you're logged in.");
      return;
    }

    try {
      setIsBooking(true);
      const result = await bookCoachSession({
        coachId: params.coachId,
        date,
        time: selectedTime,
        duration: 60,
      });

      if (result.success) {
        toast.success(
          result.message || "Your session has been successfully booked."
        );
        setBookingStep(2); // Go to success step
      } else {
        throw new Error(result.error || "Failed to book session");
      }
    } catch (error: any) {
      console.error("Booking failed:", error);
      toast.error(
        error.message ||
          "There was an error booking your session. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleMessageClick = async () => {
    if (!profile) {
      toast.error("Please log in to send a message.");
      router.replace("/login");
      return;
    }

    if (!coach) {
      toast.error("Coach information not available.");
      return;
    }

    try {
      const conversationResult = await createConversation({
        participants: [profile.id, coach.userId],
        type: "DIRECT",
      });

      if (conversationResult.success && conversationResult.data) {
        router.push(
          `/dashboard/messaging?conversationId=${conversationResult.data.id}`
        );
        toast.success("Opening conversation...");
      } else {
        throw new Error(
          conversationResult.error || "Failed to create conversation"
        );
      }
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coach) {
      toast.error("Coach information not available.");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await reviewCoach({
        coachId: coach.id,
        rating,
        content: reviewText,
      });

      if (response.success) {
        toast.success(response.message || "Review submitted successfully!");
        setReviewSubmitted(true);

        const updatedCoachResponse = await getCoachById(params.coachId);
        if (updatedCoachResponse.success && updatedCoachResponse.data?.coach) {
          setCoach(updatedCoachResponse.data.coach);
        }

        setIsReviewDialogOpen(false);
      } else {
        toast.error(response.error || "Failed to submit review.");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
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
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Coach not found</h1>
            <p className="text-muted-foreground mb-8">
              The coach you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/coaches">Browse all coaches</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/coaches" className="hover:text-primary">
                  Coaches
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>{coach.fullName}</span>
              </div>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={coach.avatarUrl!} />
                  <AvatarFallback>{coach.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
                    {coach.fullName}
                  </h1>
                  <p className="mt-1 text-lg text-foreground/70">
                    {coach.title}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 ml-auto px-2 py-0.5 text-[10px]"
                >
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <span className="font-semibold">{coach.rating}</span>
                </Badge>
              </div>
              <p className="mt-6 text-base text-muted-foreground">
                {coach.bio}
              </p>

              {coach.pastCompanies && coach.pastCompanies.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    {coach.fullName?.split(" ")[0] || "Coach"} has worked at:
                  </h4>
                  <div className="mt-4 flex items-center gap-4">
                    {coach.pastCompanies
                      .slice(0, 3)
                      .map((company: string, index: number) => (
                        <div
                          key={company || index}
                          className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700"
                        >
                          {(company || "Co").substring(0, 5)}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {coach.programs && coach.programs.length > 0 && (
                <div className="my-12">
                  <h2 className="mb-6 font-headline text-2xl font-bold">
                    Programs by {coach.fullName}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {coach.programs.map((program) => (
                      <Link
                        href={
                          program.slug.startsWith("/")
                            ? program.slug
                            : `/programs/${program.slug}`
                        }
                        key={program.id || program.title}
                      >
                        <Card className="p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              program.category === "Career Prep"
                                ? "bg-primary/10"
                                : "bg-blue-500/10"
                            }`}
                          >
                            {program.category === "Career Prep" ? (
                              <Briefcase className="h-5 w-5 text-primary" />
                            ) : (
                              <GraduationCap className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-headline font-semibold">
                              {program.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {program.category}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={cn("md:col-span-1 relative pt-10")}>
              <div className="sticky top-24">
                <EnrollmentForm
                  step={bookingStep}
                  loading={isBooking}
                  selectedDate={date}
                  setSelectedDate={setDate}
                  selectedTime={selectedTime}
                  setSelectedTime={setSelectedTime}
                  onEnroll={handleBookClick}
                  onCancel={handleCancelBooking}
                  onTimeSelect={handleTimeSelect}
                  title="Book a session"
                  subtitle="Find a time that works for you."
                  enrollButtonText="Book now"
                  slotSelectTitle="Select a time slot"
                  successTitle="Session Booked!"
                  successMessage="Your session has been confirmed. You can view your booking details on your dashboard."
                  dashboardLink="/dashboard"
                  showMessageButton={isStudent}
                  onMessageClick={handleMessageClick}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="mb-8 font-headline text-3xl font-bold">
              Reviews ({coach.totalReviews || coach.reviews?.length || 0})
            </h2>
            <Dialog
              open={isReviewDialogOpen}
              onOpenChange={setIsReviewDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={
                    coach.hasUserReviewed || profile?.role !== "STUDENT"
                  }
                  title={
                    coach.hasUserReviewed
                      ? "You have already reviewed this coach"
                      : "Add a review"
                  }
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[625px]"
                onInteractOutside={(e) => {
                  if (reviewSubmitted) {
                    e.preventDefault();
                  }
                }}
              >
                {!reviewSubmitted ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>Share your review</DialogTitle>
                      <DialogDescription>
                        Let others know about your experience with{" "}
                        {coach.fullName!}
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleReviewSubmit}
                      className="grid gap-6 py-4"
                    >
                      <div className="grid gap-2">
                        <Label>Your Rating</Label>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => {
                            const starValue = i + 1;
                            return (
                              <Star
                                key={i}
                                className={cn(
                                  "h-6 w-6 cursor-pointer",
                                  starValue <= (hoverRating || rating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                )}
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="review-text">Share your thoughts</Label>
                        <Textarea
                          id="review-text"
                          placeholder="What did you like or dislike? What should other students know?"
                          rows={4}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={
                            rating === 0 ||
                            !reviewText.trim() ||
                            isSubmittingReview
                          }
                        >
                          {isSubmittingReview
                            ? "Submitting..."
                            : "Submit Review"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </>
                ) : (
                  <>
                    <DialogHeader>
                      <VisuallyHidden>
                        <DialogTitle>Review Submitted</DialogTitle>
                      </VisuallyHidden>
                    </DialogHeader>
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold">Thank You!</h3>
                      <p className="text-muted-foreground mt-2">
                        Your review has been submitted successfully.
                      </p>
                      <Button onClick={resetReviewForm} className="mt-6">
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {coach.reviews && coach.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {coach.reviews.slice(0, 4).map((review, i) => (
                <Card
                  key={review.id || i}
                  className="rounded-xl border shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="font-serif text-base text-muted-foreground">
                      &quot;{review.content}&quot;
                    </p>
                    <p className="mt-4 text-sm font-semibold">
                      {review.reviewer?.fullName || "Anonymous"}{" "}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reviews yet.</p>
            </div>
          )}
          <Button variant="link" className="mt-6 px-0" asChild>
            <Link href={`/coaches/${params.coachId}/reviews`}>
              View all reviews <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EnrollmentForm({
  step,
  loading = false,
  isEnrolled = false,
  selectedDate,
  selectedTime,
  onEnroll,
  onCancel,
  setSelectedDate,
  setSelectedTime,
  onTimeSelect,
  title = "Ready to start?",
  subtitle = "Enroll in this program to get personalized coaching.",
  enrollButtonText = "Enroll now",
  slotSelectTitle = "Select a time slot",
  successTitle = "You're In!",
  successMessage = "Welcome to the program. You can view your enrollment details on your dashboard.",
  dashboardLink = "/dashboard",
  showMessageButton = false,
  onMessageClick,
}: {
  step: number;
  loading?: boolean;
  isEnrolled?: boolean;
  selectedDate?: Date;
  selectedTime?: string;
  onEnroll: () => void;
  onCancel: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string) => void;
  onTimeSelect: () => void;
  title?: string;
  subtitle?: string;
  enrollButtonText?: string;
  slotSelectTitle?: string;
  successTitle?: string;
  successMessage?: string;
  dashboardLink?: string;
  showMessageButton?: boolean;
  onMessageClick?: () => void;
}) {
  const { isStudent } = useAuth();

  const handleSlotSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  if (step === 0) {
    if (isEnrolled) {
      return (
        <Card className="rounded-xl border shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-headline text-xl font-bold text-green-700">
              Already Enrolled!
            </h3>
            <p className="text-muted-foreground mt-2 mb-6">
              You're already part of this program. Access it from your
              dashboard.
            </p>
            <div className="space-y-2">
              <Button size="lg" className="w-full" asChild>
                <Link href={dashboardLink}>Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="rounded-xl border shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="font-headline text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground mt-2 mb-6">{subtitle}</p>
          {isStudent && (
            <Button size="lg" className="w-full" onClick={onEnroll}>
              <PlusCircle className="mr-2 h-5 w-5" /> {enrollButtonText}
            </Button>
          )}
          {showMessageButton && onMessageClick && (
            <Button
              size="lg"
              variant="outline"
              className="w-full mt-2"
              onClick={onMessageClick}
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Message
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Step 1: Weekly time slot picker (combined date and time selection)
  if (step === 1) {
    return (
      <Card className="rounded-xl border shadow-lg w-[600px]">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-lg font-bold">
              {slotSelectTitle}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="-mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <WeeklyTimeSlotPicker
            selectedSlot={
              selectedDate && selectedTime
                ? { date: selectedDate, time: selectedTime }
                : null
            }
            onSlotSelect={handleSlotSelect}
            startHour={9}
            endHour={18}
            slotIntervalMinutes={30}
          />
          <Button
            className="w-full mt-4"
            disabled={!selectedDate || !selectedTime || loading}
            onClick={onTimeSelect}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Success state
  if (step === 2) {
    return (
      <Card className="rounded-xl border-none bg-green-50 text-green-900">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="font-headline text-xl font-bold">{successTitle}</h3>
          <p className="text-sm mt-2">{successMessage}</p>
          {selectedDate && selectedTime && (
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <p className="text-sm font-medium">Details:</p>
              <p className="text-xs text-muted-foreground">
                Date: {selectedDate.toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Time: {selectedTime}
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="w-full bg-transparent border-green-700 text-green-700 hover:bg-green-100 hover:text-green-800"
              onClick={onCancel}
            >
              Close
            </Button>
            <Button className="w-full bg-green-700 hover:bg-green-800" asChild>
              <Link href={dashboardLink}>Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
