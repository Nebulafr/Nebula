"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Loader2, PlusCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useProgramReviews, useProgramBySlug } from "@/hooks";
import { useTranslations, useLocale } from "next-intl";
import { Review } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { getEnrollments } from "@/actions/enrollment";
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
import { toast } from "react-toastify";
import { reviewProgram } from "@/actions/reviews";
import { useQueryClient } from "@tanstack/react-query";
import { PROGRAM_BY_SLUG_QUERY_KEY } from "@/hooks/use-programs-queries";
import { cn } from "@/lib/utils";

export default function ProgramReviewsPage() {
  const t = useTranslations("programDetails");
  const locale = useLocale();
  const params = useParams<{ slug: string }>();

  const {
    data: reviewsResponse,
    isLoading: loading,
    error,
  } = useProgramReviews({ programSlug: params.slug });

  const reviews = reviewsResponse?.data?.reviews || [];
  const targetEntity = reviewsResponse?.data?.targetEntity;
  const queryClient = useQueryClient();

  const { profile } = useAuth();
  const { data: programResponse } = useProgramBySlug(params.slug);
  const program = programResponse?.data?.program;

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (profile && program) {
        try {
          const response = await getEnrollments();
          if (response && response.success) {
            const isStudentEnrolled = response.data!.enrollments.some(
              (en: { programId: string }) => en.programId === program.id,
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!program) return;

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
        queryClient.invalidateQueries({
          queryKey: [PROGRAM_BY_SLUG_QUERY_KEY, params.slug],
        });
        queryClient.invalidateQueries({
          queryKey: ["program-reviews", params.slug],
        });
      } else {
        toast.error(response.error || "Failed to submit review.");
      }
    } catch (error: unknown) {
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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <section className="container py-12 md:py-20">
            <div className="text-center">
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
                {t("programNotFound")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("programNotFoundDesc")}
              </p>
              <Button asChild className="mt-6">
                <Link href="/programs">{t("backToPrograms")}</Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href={`/programs/${params.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToPrograms")}
              </Link>
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
              {targetEntity?.title
                ? t("reviewsFor", { title: targetEntity.title })
                : t("reviews")}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {t("programReviewsSummary")}
            </p>

            {targetEntity && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{targetEntity.rating}</span>
                  <span className="text-muted-foreground">
                    ({t("reviewsCount", { count: targetEntity.totalReviews || 0 })})
                  </span>
                </div>

                {program && (
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
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t("loadingReviews")}</span>
            </div>
          ) : (
            <>
              {reviews.length === 0 && (
                <div className="mt-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    {t("noReviewsAvailable")}
                  </p>
                </div>
              )}
              {reviews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {reviews.map((review: Review) => (
                    <Card key={review.id} className="rounded-xl border shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          {[...Array(5 - review.rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-gray-300" />
                          ))}
                          {review.isVerified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {t("verified")}
                            </span>
                          )}
                        </div>

                        {review.title && (
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                        )}

                        <p className="font-serif text-base text-muted-foreground mb-4">
                          &quot;{review.content}&quot;
                        </p>

                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-sm font-semibold">
                              {review.reviewer?.fullName || t("anonymous")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
