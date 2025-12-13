"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCoachReviews } from "@/actions/reviews";
import { capitalize } from "@/lib/utils";

type Review = {
  id: string;
  rating: number;
  content: string;
  reviewer: {
    id: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
  };
  createdAt: string;
};

export default function CoachReviewsPage() {
  const { coachId } = useParams<{ coachId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coachName, setCoachName] = useState("Adrian Cucurella");

  useEffect(() => {
    if (!coachId) return;

    const fetchReviews = async () => {
      const response = await getCoachReviews({ coachId });
      const responseData = response.data;
      if (responseData?.reviews) {
        setReviews(responseData.reviews);
      }
    };

    fetchReviews();
  }, [coachId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

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
          <div className="mb-12">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
              Reviews for {coachName}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              See what others have to say about coaching with{" "}
              {coachName.split(" ")[0]}.
            </p>

            {/* Reviews Summary */}
            {reviews.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card
                  key={review.id}
                  className="overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    {renderStars(review.rating)}

                    <p className="font-serif text-base text-muted-foreground italic">
                      &quot;{review.content}&quot;
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={review.reviewer.avatarUrl}
                          alt={review.reviewer.fullName}
                        />
                        <AvatarFallback>
                          {review.reviewer.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-semibold">
                          {review.reviewer.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {capitalize(review.reviewer.role)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No reviews yet. Be the first to review this coach!
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/coaches/${coachId}`}>View Coach Profile</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
