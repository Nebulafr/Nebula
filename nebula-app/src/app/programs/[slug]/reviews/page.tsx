"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { useProgramReviews } from "@/hooks";

export default function ProgramReviewsPage() {
  const params = useParams<{ slug: string }>();
  
  const { 
    data: reviewsResponse, 
    isLoading: loading 
  } = useProgramReviews({ programSlug: params.slug });
  
  const reviews = reviewsResponse?.data?.reviews || [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href={`/programs/${params.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Program
              </Link>
            </Button>
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
            Reviews for Program
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            See what other students have to say about this program.
          </p>

          {loading ? (
            <div className="mt-12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-lg text-muted-foreground">
                No reviews available for this program yet.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review: any, i: number) => (
                <Card key={i} className="rounded-xl border shadow-sm">
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
                    </div>
                    <p className="font-serif text-base text-muted-foreground">
                      &quot;{review.content}&quot;
                    </p>
                    <p className="mt-4 text-sm font-semibold">
                      {review.reviewer?.fullName || review.reviewer?.email},{" "}
                      <span className="font-normal text-muted-foreground">
                        Student
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
