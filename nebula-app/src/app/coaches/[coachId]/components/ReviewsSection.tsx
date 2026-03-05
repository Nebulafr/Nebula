"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, PlusCircle, CheckCircle, ArrowRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ReviewsSectionProps {
    coach: any;
    isReviewDialogOpen: boolean;
    setIsReviewDialogOpen: (open: boolean) => void;
    reviewSubmitted: boolean;
    isSubmittingReview: boolean;
    rating: number;
    setRating: (rating: number) => void;
    hoverRating: number;
    setHoverRating: (rating: number) => void;
    reviewText: string;
    setReviewText: (text: string) => void;
    handleReviewSubmit: (e: React.FormEvent) => Promise<void>;
    resetReviewForm: () => void;
    isStudent: boolean;
}

export function ReviewsSection({
    coach,
    isReviewDialogOpen,
    setIsReviewDialogOpen,
    reviewSubmitted,
    isSubmittingReview,
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    reviewText,
    setReviewText,
    handleReviewSubmit,
    resetReviewForm,
    isStudent,
}: ReviewsSectionProps) {
    const params = useParams<{ coachId: string }>();

    return (
        <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-headline text-2xl font-bold">
                    Reviews ({coach.totalReviews || 0})
                </h2>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full"
                            disabled={coach.hasUserReviewed || !isStudent}
                        >
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        {!reviewSubmitted ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Share your review</DialogTitle>
                                    <DialogDescription>
                                        Let others know about your experience with {coach.fullName}.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleReviewSubmit} className="grid gap-6 py-4">
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
                                                rating === 0 || !reviewText.trim() || isSubmittingReview
                                            }
                                        >
                                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </>
                        ) : (
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
                        )}
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {coach.reviews &&
                    coach.reviews.slice(0, 4).map((review: any, i: number) => (
                        <Card key={i} className="rounded-xl border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>
                                <p className="font-serif text-base text-muted-foreground leading-relaxed">
                                    &quot;{review.content}&quot;
                                </p>
                                <p className="mt-4 text-sm font-semibold">
                                    {review.reviewer?.fullName || "Anonymous"}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
            </div>
            <Button variant="link" className="mt-6 px-0" asChild>
                <Link href={`/coaches/${params.coachId}/reviews`}>
                    View all reviews <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </section>
    );
}
