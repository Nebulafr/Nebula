"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { useParams } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useUser } from "@/hooks/use-user";

const reviews = [
  {
    text: "Adrian was incredibly insightful and supportive. His real-world examples from BCG made complex concepts easy to understand. I left the session feeling more confident and inspired.",
    author: "Carlos Pavol",
    role: "Student",
    rating: 5,
  },
  {
    text: "A fantastic mentor. Adrian helped me navigate the complexities of a case interview and provided actionable feedback.",
    author: "Sarah K.",
    role: "UX Designer",
    rating: 5,
  },
  {
    text: "The sessions were practical and directly applicable to what I was facing at work. Adrian is a great listener and gives advice that you can actually use.",
    author: "Maria G.",
    role: "Product Manager",
    rating: 5,
  },
  {
    text: "I was hesitant about online coaching, but Adrian made it a very personal and engaging experience. I learned a lot in just a few sessions.",
    author: "James F.",
    role: "Student",
    rating: 4,
  },
  {
    text: "Highly recommend Adrian for anyone looking to break into consulting. His knowledge of the industry is immense.",
    author: "Li W.",
    role: "Graduate",
    rating: 5,
  },
  {
    text: "Good insights, but I was hoping for more materials to review after the sessions. The live coaching was great, though.",
    author: "Tom B.",
    role: "Analyst",
    rating: 4,
  },
];

export default function CoachReviewsPage() {
  const params = useParams<{ coachId: string }>();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href={`/coaches/${params.coachId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Coach Profile
              </Link>
            </Button>
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
            Reviews for Adrian Cucurella
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            See what others have to say about coaching with Adrian.
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

function Header() {
  const { user, profile } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const dashboardUrl =
    profile?.role === "COACH" ? "/coach-dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-screen-2xl items-center px-header mx-auto">
        <div className="flex flex-1 items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="currentColor"
            >
              <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
            </svg>
            <span className="font-headline text-xl font-bold">Nebula</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/programs"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Programs
            </Link>
            <Link
              href="/events"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Events
            </Link>
            <Link
              href="/become-a-coach"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Become a coach
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
              <Button asChild>
                <Link href={dashboardUrl}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
