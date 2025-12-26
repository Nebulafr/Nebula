"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useCoachReviews } from "@/hooks";

export default function CoachReviewsPage() {
  const { coachId } = useParams<{ coachId: string }>();

  const {
    data: reviewsResponse,
    isLoading: loading,
    error,
  } = useCoachReviews({
    coachId,
  });

  const reviews = reviewsResponse?.data?.reviews || [];
  const targetEntity = reviewsResponse?.data?.targetEntity;
  // const ratingDistribution = reviewsResponse?.data?.ratingDistribution;
  // const pagination = reviewsResponse?.data?.pagination;

  const coachName = targetEntity?.fullName || "Coach";

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          <section className="container py-12 md:py-20">
            <div className="text-center">
              <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
                Coach Not Found
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                The coach you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild className="mt-6">
                <Link href="/coaches">Browse Coaches</Link>
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
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href={`/coaches/${coachId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Coach Profile
              </Link>
            </Button>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
              Reviews for {coachName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              See what others have to say about coaching with{" "}
              {coachName.split(" ")[0]}.
            </p>

            {/* Reviews Summary */}
            {targetEntity && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{targetEntity.rating}</span>
                  <span className="text-muted-foreground">
                    ({targetEntity.totalReviews} review
                    {targetEntity.totalReviews !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No reviews yet. Be the first to review this coach!
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/coaches/${coachId}`}>View Coach Profile</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review: any) => (
                  <Card
                    key={review.id}
                    className="overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                  >
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
                            Verified
                          </span>
                        )}
                      </div>

                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}

                      <p className="font-serif text-base text-muted-foreground italic mb-4">
                        &quot;{review.content}&quot;
                      </p>

                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={review.reviewer.avatarUrl}
                              alt={review.reviewer.fullName}
                            />
                            <AvatarFallback>
                              {review.reviewer.fullName?.charAt(0) || "A"}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <p className="text-sm font-semibold">
                              {review.reviewer.fullName || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
