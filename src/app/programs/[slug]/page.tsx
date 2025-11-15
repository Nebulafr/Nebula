"use client";
import { useState, use } from "react";
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
  LogOut,
  MessageCircle,
  PlusCircle,
  Star,
  X,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@/hooks/use-user";
import { getAuth, signOut } from "firebase/auth";

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [enrollmentStep, setEnrollmentStep] = useState(0); // 0: default, 1: calendar, 2: time, 3: success
  const router = useRouter();

  const program = {
    title: "Consulting, Associate Level",
    description:
      "Here's a short text that describes the program. Here's a short text that describes the program. Here's a short text that describes the program.",
    objectives: [
      "Clearly outline the objectives of this program",
      "Clearly outline the objectives of this program",
      "Clearly outline the objectives of this program",
    ],
    enrolled: "300+",
    rating: 4.8,
    reviewsCount: "6",
    coach: {
      name: "Adrian Cucurella",
      role: "Partner, BCG",
      avatar: "https://i.pravatar.cc/150?u=adrian-cucurella",
      rating: 4.9,
      slug: "adrian-cucurella",
      bio: "With over five years of experience at a leading global consulting firm, Adrian brings deep expertise in strategy and operations. Now a Consultant at BCG, they help Fortune 500 clients tackle complex business challenges. Their work spans multiple industries, with a focus on digital transformation and growth strategy. Passionate about talent development, they coach emerging professionals on a job immersion platform. Adrian holds a Master's degree in Business and thrives at the intersection of impact and innovation.",
      pastCompanies: [
        { name: "BCG", logo: "/bcg-logo.png" },
        { name: "PALIN", logo: "/palin-logo.png" },
      ],
    },
    reviews: [
      {
        text: "This program exceeded my expectations. The frameworks and mock interviews were top-notch and directly applicable to my real interviews.",
        author: "Priya S.",
        role: "Student",
        rating: 5,
      },
    ],
    modules: [
      {
        title: "Problem Solving & Structured Thinking",
        week: 1,
      },
      {
        title: "Client Communication & Stakeholder Management",
        week: 2,
      },
      {
        title: "Case Interview & Presentation Skills",
        week: 3,
      },
    ],
  };

  const handleEnrollClick = () => {
    setEnrollmentStep(1);
  };

  const handleCancelEnrollment = () => {
    setEnrollmentStep(0);
  };

  const handleDateSelect = () => {
    setEnrollmentStep(2);
  };

  const handleTimeSelect = () => {
    // Here you would typically trigger the Genkit flow to create the session
    // For now, we just show the success step
    setEnrollmentStep(3);
  };

  const handleMessageClick = () => {
    // Assuming coach 'Adrian Cucurella' has conversation ID 1 for demonstration
    router.push("/dashboard/messaging?conversationId=1");
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
              <span>Consulting</span>
            </div>
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
              {program.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-foreground/70">
              {program.description}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button
                size="lg"
                onClick={handleEnrollClick}
                variant={enrollmentStep > 0 ? "outline" : "default"}
              >
                <PlusCircle className="mr-2 h-5 w-5" /> Enroll now
              </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-12">
            <div className="md:col-span-2">
              <div className="mb-12">
                <h2 className="mb-6 font-headline text-3xl font-bold">
                  What you'll learn
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  {program.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8"
                  onClick={handleEnrollClick}
                  variant={enrollmentStep > 0 ? "outline" : "default"}
                >
                  <PlusCircle className="mr-2 h-5 w-5" /> Enroll
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "hidden md:block md:col-span-1",
                enrollmentStep > 0 && "pt-10"
              )}
            >
              <div className="sticky top-24">
                <EnrollmentForm
                  step={enrollmentStep}
                  onEnroll={handleEnrollClick}
                  onCancel={handleCancelEnrollment}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                />
              </div>
            </div>

            {/* View for mobile screens */}
            <div className="md:hidden mt-8">
              <EnrollmentForm
                step={enrollmentStep}
                onEnroll={handleEnrollClick}
                onCancel={handleCancelEnrollment}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
          <div className="container">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
              <div className="md:col-span-2">
                <h2 className="mb-4 font-headline text-xl font-bold">
                  This program is run by
                </h2>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={program.coach.avatar} />
                    <AvatarFallback>
                      {program.coach.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-headline text-2xl font-semibold">
                      {program.coach.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {program.coach.role}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 ml-auto"
                  >
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="font-semibold">
                      {program.coach.rating}
                    </span>
                  </Badge>
                </div>
                <p className="mt-6 text-base text-muted-foreground">
                  {program.coach.bio}
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={handleMessageClick}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Adrian
                </Button>

                <div className="mt-12">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Adrian has worked at:
                  </h4>
                  <div className="mt-4 flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
                      BCG
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                      PALIN
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1">
                <h2 className="mb-4 font-headline text-xl font-bold">
                  Reviews ({program.reviewsCount})
                </h2>
                <Card className="rounded-xl border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1">
                      {[...Array(program.reviews[0].rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="font-serif mt-4 text-sm text-muted-foreground">
                      &quot;{program.reviews[0].text}&quot;
                    </p>
                    <p className="mt-4 text-sm font-semibold">
                      {program.reviews[0].author},{" "}
                      <span className="font-normal text-muted-foreground">
                        {program.reviews[0].role}
                      </span>
                    </p>

                    <Button variant="link" className="mt-4 px-0" asChild>
                      <Link href={`/programs/${slug}/reviews`}>
                        View more reviews{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="container py-20">
          <h2 className="mb-8 font-headline text-3xl font-bold">Modules</h2>
          <Accordion type="single" collapsible className="w-full">
            {program.modules.map((mod, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-4">
                    <span>{mod.title}</span>
                    <Badge variant="secondary">Week {mod.week}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-4">
                  Details about {mod.title} will be shown here.
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button
            size="lg"
            className="mt-8"
            onClick={handleEnrollClick}
            variant={enrollmentStep > 0 ? "outline" : "default"}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Enroll
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EnrollmentForm({
  step,
  onEnroll,
  onCancel,
  onDateSelect,
  onTimeSelect,
}: {
  step: number;
  onEnroll: () => void;
  onCancel: () => void;
  onDateSelect: () => void;
  onTimeSelect: () => void;
}) {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  console.log({ date });

  const timeSlots = ["09:00", "11:00", "14:00", "16:00"];

  if (step === 0) {
    return (
      <Card className="rounded-xl border shadow-lg">
        <CardContent className="p-6 text-center">
          <h3 className="font-headline text-2xl font-bold">Ready to start?</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Enroll in this program to get personalized coaching.
          </p>
          <Button size="lg" className="w-full" onClick={onEnroll}>
            <PlusCircle className="mr-2 h-5 w-5" /> Enroll now
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 1) {
    return (
      <Card className="rounded-xl border shadow-lg p-0">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-4 px-4 pt-4">
            <h3 className="font-headline text-lg font-bold">
              Select a start date
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
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0 w-full"
          />
          <div className="px-4 pb-4">
            <Button
              className="w-full mt-4"
              disabled={!date}
              onClick={onDateSelect}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="rounded-xl border shadow-lg p-4">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-lg font-bold">Select a time</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="-mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Available Slots</h4>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  className={cn(
                    selectedTime === time &&
                      "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
          <Button
            className="w-full mt-6"
            disabled={!selectedTime}
            onClick={onTimeSelect}
          >
            Confirm Enrollment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className="rounded-xl border-none bg-green-50 text-green-900">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="font-headline text-xl font-bold">You're In!</h3>
          <p className="text-sm mt-2">
            Welcome to the program. You can view your enrollment details on your
            dashboard.
          </p>
          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="w-full bg-transparent border-green-700 text-green-700 hover:bg-green-100 hover:text-green-800"
              onClick={onCancel}
            >
              Close
            </Button>
            <Button className="w-full bg-green-700 hover:bg-green-800" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function Header() {
  const { user, profile } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const dashboardUrl =
    profile?.role === "coach" ? "/coach-dashboard" : "/dashboard";

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
              className="font-menu text-sm font-medium text-foreground"
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
