"use client";
import { useState, use, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  PlusCircle,
  Star,
  X,
  CheckCircle,
  FileText,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { getProgramBySlug } from "@/actions/programs";
import { enrollInProgram, getEnrollments } from "@/actions/enrollment";
import { toast } from "react-toastify";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
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
import { ProgramWithRelations } from "@/types/program";
import { reviewProgram } from "@/actions/reviews";

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { profile, isStudent } = useAuth();
  const [enrollmentStep, setEnrollmentStep] = useState(0);
  const [program, setProgram] = useState<ProgramWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [localSelectedTime, setLocalSelectedTime] = useState<string>("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const response = await getProgramBySlug(slug);
        if (response && response.success) {
          setProgram(response.data!.program);
        } else if (response && !response.success) {
          setFetchError(response.message || "Failed to fetch program.");
          setProgram({} as any);
        } else {
          setFetchError("Failed to fetch program.");
          setProgram({} as any);
        }
      } catch (error: any) {
        console.error("Error fetching program:", error);
        setFetchError(error.message || "Failed to fetch program.");
        setProgram(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [slug]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (profile && program) {
        try {
          const response = await getEnrollments();
          if (response && response.success) {
            const isStudentEnrolled = response.data!.enrollments.some(
              (en: any) => en.programId === program.id
            );
            setIsEnrolled(isStudentEnrolled);
          }
        } catch (error) {
          console.error("Error checking enrollment status:", error);
        }
      }
    };

    checkEnrollmentStatus();
  }, [profile, program]);

  // Handle program schedule selection automatically
  useEffect(() => {
    if (program && program.schedules && program.schedules.length > 0) {
      const now = new Date();
      const futureSchedules = program.schedules
        .map((s) => ({ ...s, startDate: new Date(s.startDate) }))
        .filter((s) => s.startDate > now)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      if (futureSchedules.length > 0) {
        const bestSchedule = futureSchedules[0];
        setSelectedDate(bestSchedule.startDate);
        const timeStr = bestSchedule.startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setSelectedTime(timeStr);
        setLocalSelectedTime(timeStr);
      }
    }
  }, [program]);

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

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-8">{fetchError}</p>
            <Button asChild>
              <Link href="/programs">Browse all programs</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Program not found</h1>
            <p className="text-muted-foreground mb-8">
              The program you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link href="/programs">Browse all programs</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleEnrollClick = () => {
    if (!profile) {
      toast.error("Please log in to enroll in this program.");
      router.replace("/login");
      return;
    }
    // If we have a selected date/time from the program schedule, go straight to confirmation (step 2)
    if (selectedDate && selectedTime) {
      setEnrollmentStep(2);
    } else {
      // Fallback if no schedule is found (shouldn't happen with user's new requirement)
      setEnrollmentStep(1);
    }
  };

  const handleCancelEnrollment = () => {
    setEnrollmentStep(0);
    setSelectedDate(undefined);
    setSelectedTime("");
    setLocalSelectedTime("");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setEnrollmentStep(2);
    } else {
      toast.error("Please select a valid date to continue.");
    }
  };

  const handleLocalTimeSelect = (time: string) => {
    setLocalSelectedTime(time);
  };

  const handleTimeSelect = async (time: string) => {
    if (!profile || !program) {
      toast.error("Please log in to complete enrollment.");
      return;
    }

    if (!selectedDate || !time) {
      toast.error("Please select both date and time for your enrollment.");
      return;
    }

    setSelectedTime(time);

    try {
      setEnrolling(true);
      if (!profile) {
        toast.error(
          "Please complete your student profile to enroll in programs."
        );
        router.replace("/dashboard/profile");
        return;
      }

      const enrollmentResult = await enrollInProgram({
        programSlug: program.slug,
        coachId: program.coachId,
        amountPaid: program.price || 0,
        time,
        date: selectedDate?.toISOString().split("T")[0],
      });

      if (!enrollmentResult.success) {
        throw new Error(
          enrollmentResult.error || "Failed to enroll in program"
        );
      }

      toast.success(
        "Welcome to the program! You can access it from your dashboard."
      );

      setEnrollmentStep(3);
      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error processing your enrollment. Please try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleMessageClick = () => {
    router.replace(`/dashboard/messaging?conversationId=${profile?.id}`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!program) {
      toast.error("Program information not available.");
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
      const response = await reviewProgram({
        programId: program.id,
        rating,
        content: reviewText,
      });

      if (response.success) {
        toast.success(response.message || "Review submitted successfully!");
        setReviewSubmitted(true);

        const updatedProgramResponse = await getProgramBySlug(slug);
        if (updatedProgramResponse.success && updatedProgramResponse.data) {
          setProgram(updatedProgramResponse.data.program);
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
    // Use a timeout to reset the form after the dialog has closed
    setTimeout(() => {
      setReviewSubmitted(false);
      setRating(0);
      setHoverRating(0);
      setReviewText("");
    }, 300);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="text-left">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/programs" className="hover:text-primary">
                Programs
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>{program.category?.name || "Program"}</span>
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
              {program.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-foreground/70">
              {program.description}
            </p>
            <div className="mt-8 flex items-center gap-4">
              {isStudent && !isEnrolled && (
                <Button
                  size="lg"
                  onClick={handleEnrollClick}
                  variant={enrollmentStep > 0 ? "outline" : "default"}
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Enroll now
                </Button>
              )}
              {isEnrolled && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">
                    <CheckCircle className="mr-2 h-5 w-5" /> Access Dashboard
                  </Link>
                </Button>
              )}
              <Button
                variant="link"
                size="lg"
                className="text-foreground"
                asChild
              >
                <Link href="#modules">
                  Read the Modules <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container pb-20">
          <div className="grid grid-cols-1 md:grid-cols-5 md:gap-12">
            <div className="md:col-span-3">
              <div className="mb-12">
                <h2 className="mb-6 font-headline text-2xl font-bold">
                  Learning Objectives
                </h2>
                <ul className="space-y-4 text-muted-foreground">
                  {program.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="hidden md:block md:col-span-2 relative">
              <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
                {enrollmentStep > 0 || isEnrolled ? (
                  <EnrollmentForm
                    step={enrollmentStep}
                    loading={enrolling}
                    isEnrolled={isEnrolled}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    localSelectedTime={localSelectedTime}
                    onEnroll={handleEnrollClick}
                    onCancel={handleCancelEnrollment}
                    onDateSelect={handleDateSelect}
                    onTimeSelect={handleTimeSelect}
                    onLocalTimeSelect={handleLocalTimeSelect}
                  />
                ) : (
                  <>
                    <h2 className="mb-4 font-headline text-lg font-bold text-center">
                      {program.currentEnrollments || 0} students enrolled so far
                    </h2>
                    <Card className="rounded-xl bg-secondary text-secondary-foreground min-h-48 flex flex-col justify-center">
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                          <span className="font-headline text-6xl font-bold">
                            {Number(program.rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary-foreground/80">
                          Rated {Number(program.rating || 0).toFixed(1)}/5 by{" "}
                          {program.totalReviews || 0} students
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Enrollment form for mobile screens */}
            <div className="md:hidden mt-8">
              {enrollmentStep > 0 || isEnrolled ? (
                <EnrollmentForm
                  step={enrollmentStep}
                  loading={enrolling}
                  isEnrolled={isEnrolled}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  localSelectedTime={localSelectedTime}
                  onEnroll={handleEnrollClick}
                  onCancel={handleCancelEnrollment}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  onLocalTimeSelect={handleLocalTimeSelect}
                />
              ) : (
                isStudent && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleEnrollClick}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" /> Enroll Now
                  </Button>
                )
              )}
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="mb-4 font-headline text-xl font-bold">
                This program is run by
              </h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={program.coach.user.avatarUrl || undefined} />
                  <AvatarFallback>
                    {program.coach.user.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-headline text-2xl font-semibold">
                    {program.coach.user.fullName}
                  </h3>
                  <p className="text-muted-foreground">{program.coach.title}</p>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 ml-auto px-2 py-0.5"
                >
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span className="font-semibold">
                    {Number(program.coach.rating || 0).toFixed(1)}
                  </span>
                </Badge>
              </div>
              <p className="mt-6 text-base text-muted-foreground">
                {program.coach.bio}
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Button asChild>
                  <Link href={`/coaches/${program.coach.user.id}`}>
                    View Profile
                  </Link>
                </Button>
                {isStudent && (
                  <Button variant="outline" onClick={handleMessageClick}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message {program.coach.user.fullName?.split(" ")[0]}
                  </Button>
                )}
              </div>
            </div>
            <div className="md:col-span-1">
              <h2 className="mb-4 font-headline text-xl font-bold">Reviews</h2>
              {program.reviews.length > 0 ? (
                <Card className="rounded-xl border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < Math.round(program.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted opacity-30"
                          )}
                        />
                      ))}
                    </div>
                    <p className="font-serif mt-4 text-base text-muted-foreground">
                      &quot;{program.reviews[0].content}&quot;
                    </p>
                    <p className="mt-4 text-sm font-semibold">
                      {program.reviews[0].reviewer.fullName},{" "}
                      <span className="font-normal text-muted-foreground">
                        Student
                      </span>
                    </p>

                    <div className="mt-4 flex items-center justify-between">
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
                              program.hasUserReviewed ||
                              profile?.role !== "STUDENT"
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
                                  Let others know about your experience with
                                  this program.
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
                                          onMouseEnter={() =>
                                            setHoverRating(starValue)
                                          }
                                          onMouseLeave={() => setHoverRating(0)}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="review-text">
                                    Share your thoughts
                                  </Label>
                                  <Textarea
                                    id="review-text"
                                    placeholder="What did you like or dislike? What should other students know?"
                                    rows={4}
                                    value={reviewText}
                                    onChange={(e) =>
                                      setReviewText(e.target.value)
                                    }
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
                            <div className="text-center py-8">
                              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                              <h3 className="text-xl font-semibold">
                                Thank You!
                              </h3>
                              <p className="text-muted-foreground mt-2">
                                Your review has been submitted successfully.
                              </p>
                              <Button
                                onClick={resetReviewForm}
                                className="mt-6"
                              >
                                Close
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="link" className="px-0" asChild>
                        <Link href={`/programs/${slug}/reviews`}>
                          View more reviews{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No reviews yet for this new program.
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="modules" className="container py-20">
          <h2 className="mb-8 font-headline text-3xl font-bold">
            Program Modules
          </h2>
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-0"
          >
            {program.modules.map((mod, i) => (
              <AccordionItem key={mod.id} value={`item-${i}`}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">
                  <div className="flex items-center gap-4">
                    <span>{mod.title}</span>
                    <Badge variant="secondary">Week {mod.week}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-4 pb-4 font-normal">
                  {mod.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
  localSelectedTime,
  onEnroll,
  onCancel,
  onDateSelect,
  onTimeSelect,
  onLocalTimeSelect,
}: {
  step: number;
  loading?: boolean;
  isEnrolled?: boolean;
  selectedDate?: Date;
  selectedTime?: string;
  localSelectedTime?: string;
  onEnroll: () => void;
  onCancel: () => void;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onLocalTimeSelect: (time: string) => void;
}) {
  const { isStudent } = useAuth();
  const timeSlots = ["09:00", "11:00", "14:00", "16:00"];

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
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="rounded-xl border shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="font-headline text-2xl font-bold font-headline">Ready to start?</h3>
          <p className="text-muted-foreground mt-2 mb-6 text-sm">Enroll in this program to get personalized coaching.</p>
          {isStudent && (
            <Button size="lg" className="w-full" onClick={onEnroll}>
              <PlusCircle className="mr-2 h-5 w-5" /> Enroll now
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="rounded-xl border border-border shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-lg font-bold text-left">Confirm Schedule</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="-mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border text-left">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Program Schedule</p>
            <div className="flex justify-between text-sm py-2 border-b border-border/50">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-semibold">{selectedDate?.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
          </div>

          <Button
            className="w-full mt-8"
            size="lg"
            disabled={loading}
            onClick={() => {
              onTimeSelect(selectedTime || "");
            }}
          >
            {loading ? "Processing..." : "Confirm Enrollment"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className="rounded-xl border-none bg-green-50 text-green-900 shadow-lg">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
          <h3 className="font-headline text-xl font-bold">You're In!</h3>
          <p className="text-sm mt-2 text-green-800/80">
            Welcome to the program. You can view your enrollment details on your dashboard.
          </p>
          {selectedDate && selectedTime && (
            <div className="mt-6 p-4 bg-white/60 rounded-xl border border-green-200 text-left">
              <p className="text-xs font-bold uppercase text-green-800 tracking-wider mb-2">Schedule Detail</p>
              <div className="flex justify-between text-sm py-1 border-b border-green-200/50">
                <span className="text-green-700/70">Date:</span>
                <span className="font-semibold">{selectedDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-green-700/70">Time:</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-8">
            <Button
              variant="outline"
              className="w-full bg-green-100 border-green-600 text-green-800 hover:bg-green-200"
              onClick={onCancel}
            >
              Close
            </Button>
            <Button className="w-full bg-green-700 hover:bg-green-800 text-white" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
