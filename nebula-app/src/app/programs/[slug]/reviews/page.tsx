"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";

const reviews = [
  {
    text: "Adrian was incredibly insightful and supportive. His real-world examples from BCG made complex concepts easy to understand. I left the session feeling more confident and inspired.",
    author: "Carlos Pavol",
    role: "Student",
    rating: 5,
  },
  {
    text: "A fantastic mentor. Adrian helped me navigate the complexities of a case interview and provided actionable feedback that was instrumental in my preparation.",
    author: "Sarah K.",
    role: "UX Designer",
    rating: 5,
  },
  {
    text: "The program structure is excellent. It covers all the key areas needed for consulting. The live sessions were particularly valuable. Highly recommended!",
    author: "Michael T.",
    role: "Graduate Student",
    rating: 5,
  },
  {
    text: "I appreciated the personalized attention. Adrian took the time to understand my specific weaknesses and tailored his coaching accordingly. It made a huge difference.",
    author: "Jessica L.",
    role: "Aspiring Consultant",
    rating: 4,
  },
  {
    text: "Great content and a very knowledgeable coach. The only reason I'm not giving it 5 stars is because I wished there were more group sessions to interact with peers.",
    author: "David H.",
    role: "Analyst",
    rating: 4,
  },
  {
    text: "This program exceeded my expectations. The frameworks and mock interviews were top-notch and directly applicable to my real interviews.",
    author: "Priya S.",
    role: "Student",
    rating: 5,
  },
];

export default function ProgramReviewsPage() {
  const params = useParams<{ slug: string }>();

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
            Reviews for Consulting, Associate Level
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            See what other students have to say about this program.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
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
                    &quot;{review.text}&quot;
                  </p>
                  <p className="mt-4 text-sm font-semibold">
                    {review.author},{" "}
                    <span className="font-normal text-muted-foreground">
                      {review.role}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
