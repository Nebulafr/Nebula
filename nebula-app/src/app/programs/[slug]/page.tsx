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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { enrollInProgram, getEnrollments } from "@/actions/enrollment";
import { toast } from "react-toastify";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/hooks/use-auth";
import { useProgramBySlug } from "@/hooks";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewProgram } from "@/actions/reviews";
import { useQueryClient } from "@tanstack/react-query";
import { PROGRAM_BY_SLUG_QUERY_KEY } from "@/hooks/use-programs-queries";

type Cohort = {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string | null;
  maxStudents: number;
  status: string;
  programId: string;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  week: number;
  materials: string[];
  programId: string;
};

type ReviewWithReviewer = {
  id: string;
  content: string;
  rating: number;
  reviewer: { fullName: string };
};

type ProgramWithRelations = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  coachId: string;
  rating: number | null;
  totalReviews: number;
  currentEnrollments: number;
  hasUserReviewed?: boolean;
  category?: { name: string } | null;
  objectives?: string[];
  cohorts?: Cohort[];
  modules?: Module[];
  reviews?: ReviewWithReviewer[];
  coach?: {
    id: string;
    title: string;
    bio: string;
    rating: number | null;
    user: {
      id: string;
      fullName: string;
      avatarUrl: string | null;
    };
  };
};

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = useTranslations("programDetails");
  const locale = useLocale();
  const { slug } = use(params);
  const { profile, isStudent } = useAuth();
  const queryClient = useQueryClient();

  // Use the platform hook for fetching program data
  const { data: programResponse, isLoading, error } = useProgramBySlug(slug);
  const program = programResponse?.data?.program as
    | ProgramWithRelations
    | undefined;

  const [enrollmentStep, setEnrollmentStep] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (profile && program) {
        try {
          const response = await getEnrollments();
          if (response && response.success) {
            const isStudentEnrolled = response.data!.enrollments.some(
              (en: any) => en.programId === program.id,
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

  useEffect(() => {
    if (program) {
      const now = new Date();
      if (program.cohorts && program.cohorts.length > 0) {
        const futureCohorts = program.cohorts
          .map((c: Cohort) => ({ ...c, startDate: new Date(c.startDate) }))
          .filter(
            (c: Cohort & { startDate: Date }) =>
              c.startDate > now && c.status === "UPCOMING",
          )
          .sort(
            (a: { startDate: Date }, b: { startDate: Date }) =>
              a.startDate.getTime() - b.startDate.getTime(),
          );

        if (futureCohorts.length > 0) {
          const nextCohort = futureCohorts[0];
          setSelectedDate(nextCohort.startDate);
          const timeStr = nextCohort.startDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          setSelectedTime(timeStr);
        }
      }
    }
  }, [program]);

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-8">
              {error instanceof Error
                ? error.message
                : t("failedToLoadProgram")}
            </p>
            <Button asChild>
              <Link href="/programs">{t("browseAll")}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <div className="container py-12 md:py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">{t("programNotFound")}</h1>
            <p className="text-muted-foreground mb-8">
              {t("programNotFoundDesc")}
            </p>
            <Button asChild>
              <Link href="/programs">{t("browseAll")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleEnrollClick = async () => {
    if (!profile) {
      router.replace("/login");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error(t("noSchedule"));
      return;
    }

    try {
      setEnrolling(true);
      if (!profile) {
        toast.error(t("completeProfile"));
        router.replace("/dashboard/profile");
        return;
      }

      const enrollmentResult = await enrollInProgram({
        programSlug: program!.slug,
        coachId: program!.coachId,
        amountPaid: program!.price || 0,
        time: selectedTime,
      });

      if (!enrollmentResult.success) {
        throw new Error(
          enrollmentResult.error || "Failed to enroll in program",
        );
      }

      setEnrollmentStep(3);
      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "There was an error processing your enrollment. Please try again.",
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
      toast.error(t("programInfoNotAvailable"));
      return;
    }

    if (rating === 0) {
      toast.error(t("selectRating"));
      return;
    }

    if (!reviewText.trim()) {
      toast.error(t("writeReview"));
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
        setReviewSubmitted(true);

        // Invalidate the query to refetch program data with updated reviews
        queryClient.invalidateQueries({
          queryKey: [PROGRAM_BY_SLUG_QUERY_KEY, slug],
        });

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
                {t("backToPrograms")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>{program.category?.name || t("fallbackCategory")}</span>
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
              {program.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-foreground/70">
              {program.description}
            </p>
            <div className="mt-8 flex items-center gap-4">
              {!isEnrolled && (
                <Button
                  size="lg"
                  onClick={() => setEnrollmentStep(1)}
                  variant={enrollmentStep > 0 ? "outline" : "default"}
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> {t("enrollNow")}
                </Button>
              )}
              {isEnrolled && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">
                    <CheckCircle className="mr-2 h-5 w-5" /> {t("accessDashboard")}
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
                  {t("readModules")} <ArrowRight className="ml-2 h-4 w-4" />
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
                  {t("learningObjectives")}
                </h2>
                <ul className="space-y-4 text-muted-foreground">
                  {program?.objectives?.map((obj, i) => (
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
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onEnroll={handleEnrollClick}
                    onCancel={() => setEnrollmentStep(0)}
                  />
                ) : (
                  <>
                    <h2 className="mb-4 font-headline text-lg font-bold text-center">
                      {t("studentsEnrolled", { count: program.currentEnrollments || 0 })}
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
                          {t("ratedBy", {
                            rating: Number(program.rating || 0).toFixed(1),
                            count: program.totalReviews || 0,
                          })}
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
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onEnroll={handleEnrollClick}
                  onCancel={() => setEnrollmentStep(0)}
                />
              ) : (
                isStudent && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setEnrollmentStep(1)}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" /> {t("enrollNow")}
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
                {t("runBy")}
              </h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={program.coach?.user.avatarUrl || undefined}
                  />
                  <AvatarFallback>
                    {program.coach?.user.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-headline text-2xl font-semibold">
                    {program.coach?.user.fullName}
                  </h3>
                  <p className="text-muted-foreground">
                    {program.coach?.title}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 ml-auto px-2 py-0.5"
                >
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span className="font-semibold">
                    {Number(program.coach?.rating || 0).toFixed(1)}
                  </span>
                </Badge>
              </div>
              <p className="mt-6 text-base text-muted-foreground">
                {program.coach?.bio}
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Button asChild>
                  <Link href={`/coaches/${program.coach?.id}`}>
                    {t("viewProfile")}
                  </Link>
                </Button>
                {isStudent && (
                  <Button variant="outline" onClick={handleMessageClick}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("messageCoach", { name: program.coach?.user.fullName?.split(" ")[0] || "" })}
                  </Button>
                )}
              </div>
            </div>
            <div className="md:col-span-1">
              <h2 className="mb-4 font-headline text-xl font-bold">{t("reviews")}</h2>
              {program?.reviews && program.reviews.length > 0 ? (
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
                              : "text-muted opacity-30",
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
                        {t("student")}
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
                              profile?.role !== "STUDENT" ||
                              !isEnrolled
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
                                <DialogTitle>{t("shareReview")}</DialogTitle>
                                <DialogDescription>
                                  {t("shareReviewDesc")}
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                onSubmit={handleReviewSubmit}
                                className="grid gap-6 py-4"
                              >
                                <div className="grid gap-2">
                                  <Label>{t("yourRating")}</Label>
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
                                              : "text-gray-300",
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
                                    {t("shareThoughts")}
                                  </Label>
                                  <Textarea
                                    id="review-text"
                                    placeholder={t("textareaPlaceholder")}
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
                                      ? t("submitting")
                                      : t("submitReview")}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                              <h3 className="text-xl font-semibold">
                                {t("thankYou")}
                              </h3>
                              <p className="text-muted-foreground mt-2">
                                {t("reviewSubmitted")}
                              </p>
                              <Button
                                onClick={resetReviewForm}
                                className="mt-6"
                              >
                                {t("close")}
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="link" className="px-0" asChild>
                        <Link href={`/programs/${slug}/reviews`}>
                          {t("viewMoreReviews")}{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {t("noReviewsYet")}
                  </p>
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
                          profile?.role !== "STUDENT" ||
                          !isEnrolled
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
                            <DialogTitle>{t("shareReview")}</DialogTitle>
                            <DialogDescription>
                              {t("shareReviewDesc")}
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            onSubmit={handleReviewSubmit}
                            className="grid gap-6 py-4"
                          >
                            <div className="grid gap-2">
                              <Label>{t("yourRating")}</Label>
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
                                          : "text-gray-300",
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
                                {t("shareThoughts")}
                              </Label>
                              <Textarea
                                id="review-text"
                                placeholder={t("textareaPlaceholder")}
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
                                  ? t("submitting")
                                  : t("submitReview")}
                              </Button>
                            </DialogFooter>
                          </form>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                          <h3 className="text-xl font-semibold">
                            {t("thankYou")}
                          </h3>
                          <p className="text-muted-foreground mt-2">
                            {t("reviewSubmitted")}
                          </p>
                          <Button
                            onClick={resetReviewForm}
                            className="mt-6"
                          >
                            {t("close")}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="modules" className="container py-20">
          <h2 className="mb-8 font-headline text-3xl font-bold">
            {t("programModules")}
          </h2>
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-0"
          >
            {program?.modules?.map((mod, i) => (
              <AccordionItem key={mod.id} value={`item-${i}`}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">
                  <div className="flex items-center gap-4">
                    <span>{mod.title}</span>
                    <Badge variant="secondary">{t("week", { count: mod.week })}</Badge>
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
  loading,
  selectedDate,
  selectedTime,
  onEnroll,
  onCancel,
}: {
  step: number;
  loading: boolean;
  selectedDate: Date | undefined;
  selectedTime: string;
  onEnroll: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("programDetails");
  const locale = useLocale();

  if (step === 1) {
    return (
      <Card className="rounded-xl border-border shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-lg font-bold">
              {t("joinNextCohort")}
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
          <div className="text-center my-6">
            <p className="text-muted-foreground">{t("nextCohortStarts")}</p>
            <p className="text-xl font-bold mt-1">
              {selectedDate?.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")} at {selectedTime}
            </p>
          </div>
          <Button className="w-full" onClick={onEnroll} disabled={loading}>
            {loading ? t("submitting") : t("enrollNow")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="rounded-xl border-none bg-green-50 text-green-900 shadow-lg">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="font-headline text-xl font-bold">{t("enrollSuccessTitle")}</h3>
          <p className="text-sm mt-2">
            {t("enrollSuccessDesc")}
          </p>
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="w-full bg-green-100 border-green-600 text-green-800 hover:bg-green-200"
              onClick={onCancel}
            >
              {t("close")}
            </Button>
            <Button className="w-full bg-green-700 hover:bg-green-800" asChild>
              <Link href="/dashboard">{t("goToDashboard")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
