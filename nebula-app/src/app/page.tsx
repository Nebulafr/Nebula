"use client";

import Image from "next/image";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  ExternalLink,
  Linkedin,
  Star,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function Home() {
  const featureCards = [
    {
      icon: (
        <Image
          src="/custom-images/check-mark.svg"
          alt="Check mark"
          width={32}
          height={32}
        />
      ),
      title: "Vetted Coaches, Proven Results",
      description:
        "Our coaches are industry leaders with years of experience in their respective fields.",
    },
    {
      icon: (
        <Image
          src="/custom-images/learning-path.svg"
          alt="Learning Path"
          width={32}
          height={32}
        />
      ),
      title: "Personalized Learning Paths",
      description:
        "Tailored guidance to help you achieve your specific career goals and aspirations.",
      customStyle: { backgroundColor: "rgba(255, 75, 0, 0.3)" },
    },
    {
      icon: (
        <Image
          src="/custom-images/calendar.svg"
          alt="Calendar"
          width={32}
          height={32}
        />
      ),
      title: "Flexible Scheduling & Support",
      description:
        "Book sessions that fit your schedule and get support from our dedicated team.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      role: "UX Designer",
      testimonial:
        "Nebula connected me with a fantastic coach who helped me land my dream job. The personalized advice was a game-changer!",
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-1"),
    },
    {
      name: "David L.",
      role: "Software Engineer",
      testimonial:
        "The mock interviews were incredibly realistic. I felt so much more confident going into the real thing. Highly recommend!",
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-2"),
    },
    {
      name: "Emily R.",
      role: "Product Manager",
      testimonial:
        "I was feeling stuck in my career. My coach provided the clarity and strategy I needed to move forward. Thank you, Nebula!",
      avatar: PlaceHolderImages.find((img) => img.id === "testimonial-3"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection cards={featureCards} />
        <NetworkSection />
        <PopularProgramsSection />
        <UpcomingEventsSection />
        <TestimonialsSection testimonials={testimonials} />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.replace(
        `/coaches?search=${encodeURIComponent(searchTerm.trim())}`
      );
    } else {
      router.replace("/coaches");
    }
  };

  const stats = [
    { value: "50+", label: "Top Coaches" },
    { value: "200+", label: "Companies" },
    { value: "5k+", label: "Users Helped" },
  ];

  const categories = [
    "Product Management",
    "Software Engineering",
    "Marketing",
    "Venture Capital",
    "Consulting",
    "Finance",
    "UX Design",
    "Data Science",
  ];

  return (
    <section className="container py-20 text-center md:py-32">
      <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-7xl">
        Empower your career <br /> journey with Nebula
      </h1>
      <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70 md:text-xl">
        Get online career coaching from the world&apos;s leading experts to help
        you land your dream job.
      </p>
      <form
        onSubmit={handleSearch}
        className="mx-auto mt-8 flex max-w-lg items-center space-x-2"
      >
        <Input
          type="search"
          placeholder="Search for a coach or specialty..."
          className="h-14 flex-1 rounded-full border focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          className="h-14 w-14 flex-shrink-0 rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-headline text-5xl font-medium">{stat.value}</p>
            <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className="justify-center text-sm"
          >
            {category}
          </Badge>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection({
  cards,
}: {
  cards: {
    icon: JSX.Element;
    title: string;
    description: string;
    customStyle?: React.CSSProperties;
  }[];
}) {
  return (
    <section className="py-20 sm:py-32" style={{ backgroundColor: "#059669" }}>
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card, i) => (
            <Card
              key={i}
              className="rounded-xl border p-6 text-card-foreground shadow-md"
              style={{ backgroundColor: "#FFFEF8" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                style={card.customStyle}
              >
                {card.icon}
              </div>
              <h3 className="mt-6 font-headline text-xl font-semibold">
                {card.title}
              </h3>
              <p className="mt-2 text-base text-muted-foreground">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkSection() {
  const networkImage = PlaceHolderImages.find((img) => img.id === "network");
  return (
    <section className="py-20 sm:py-32">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <div className="order-1 md:order-2">
          {networkImage && (
            <Image
              src={networkImage.imageUrl}
              alt={networkImage.description}
              width={500}
              height={500}
              className="rounded-lg"
              data-ai-hint={networkImage.imageHint}
            />
          )}
        </div>
        <div className="order-2 md:order-1">
          <h2 className="font-headline">Global Community of Coaches</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our network comprises professionals from world-renowned institutions
            and top-tier companies. We bridge the gap between academic theory
            and real-world application, offering you unparalleled access to
            insider knowledge and career opportunities.
          </p>
          <Button className="mt-8" size="lg">
            Explore the Network
          </Button>
        </div>
      </div>
    </section>
  );
}

function PopularProgramsSection() {
  const programs = [
    {
      category: "Career Prep",
      title: "Consulting, Associate Level",
      description: "Here's a short text that describes the program.",
      coach: {
        name: "Adrian Cucurella",
        role: "Partner, BCG",
        avatar: `https://i.pravatar.cc/40?u=adrian`,
      },
      attendees: [
        `https://i.pravatar.cc/40?u=1`,
        `https://i.pravatar.cc/40?u=2`,
        `https.i.pravatar.cc/40?u=3`,
        `https://i.pravatar.cc/40?u=4`,
        `https://i.pravatar.cc/40?u=5`,
      ],
      otherAttendees: 32,
      rating: 4.9,
      slug: "consulting-associate-level",
    },
    {
      category: "Interview Prep",
      title: "Product Management Interviews",
      description: "Ace your PM interviews with a Senior PM from Google.",
      coach: {
        name: "Sarah Chen",
        role: "Senior PM, Google",
        avatar: `https://i.pravatar.cc/40?u=sarah`,
      },
      attendees: [
        `https://i.pravatar.cc/40?u=6`,
        `https://i.pravatar.cc/40?u=7`,
        `https://i.pravatar.cc/40?u=8`,
        `https://i.pravatar.cc/40?u=9`,
        `https://i.pravatar.cc/40?u=10`,
      ],
      otherAttendees: 45,
      rating: 4.8,
      slug: "product-management-interviews",
    },
    {
      category: "Skill Building",
      title: "Advanced System Design",
      description: "Master scalable architecture for your engineering career.",
      coach: {
        name: "David Lee",
        role: "Principal Engineer, AWS",
        avatar: `https://i.pravatar.cc/40?u=david`,
      },
      attendees: [
        `https://i.pravatar.cc/40?u=11`,
        `https://i.pravatar.cc/40?u=12`,
        `https://i.pravatar.cc/40?u=13`,
        `https://i.pravatar.cc/40?u=14`,
        `https://i.pravatar.cc/40?u=15`,
      ],
      otherAttendees: 28,
      rating: 4.9,
      slug: "advanced-system-design",
    },
  ];

  return (
    <section className="bg-light-gray py-20 sm:py-32">
      <div className="container">
        <div className="text-left">
          <h2 className="font-headline">Popular Programs</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore our most sought-after coaching programs designed for
            success.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Link
              key={program.title}
              href={`/programs/${program.slug}`}
              className="flex"
            >
              <Card className="flex w-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex-1">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      {program.category}
                    </Badge>
                    <h3 className="font-headline mt-4 text-2xl font-semibold leading-tight">
                      {program.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {program.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <div className="mb-6 rounded-lg border bg-background p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={program.coach.avatar} />
                          <AvatarFallback>
                            {program.coach.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-headline font-semibold text-foreground">
                            {program.coach.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {program.coach.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {program.attendees.map((attendee, i) => (
                            <Avatar
                              key={i}
                              className="h-8 w-8 border-2 border-background"
                            >
                              <AvatarImage src={attendee} />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {program.otherAttendees > 0 && (
                          <span className="ml-3 text-sm font-medium text-muted-foreground">
                            +{program.otherAttendees}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-1 py-0.5 text-[10px]"
                      >
                        <Star className="h-2 w-2 fill-current text-yellow-500" />
                        <span className="font-semibold">{program.rating}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEventsSection() {
  const events = [
    {
      title: "Problem-Solving & Structured Thinking",
      coach: {
        name: "Adrian Cucurella",
        firstName: "Adrian",
        role: "Partner, BCG",
        avatar: `https://i.pravatar.cc/400?u=adrian-6`,
      },
      tag: "Free",
      date: "Thursday, August 4",
      time: "6:00 PM - 7:00 PM GMT+2",
      attendees: [
        `https://i.pravatar.cc/40?u=1`,
        `https://i.pravatar.cc/40?u=2`,
        `https://i.pravatar.cc/40?u=3`,
      ],
      otherAttendees: 32,
      color: "bg-yellow-50",
    },
    {
      title: "From Founder to VC",
      coach: {
        name: "William Harris",
        firstName: "William",
        role: "Founder & VC",
        avatar: `https://i.pravatar.cc/400?u=william`,
      },
      tag: "Premium",
      date: "Friday, August 12",
      time: "5:00 PM - 6:00 PM GMT+2",
      attendees: [
        `https://i.pravatar.cc/40?u=4`,
        `https://i.pravatar.cc/40?u=5`,
        `https://i.pravatar.cc/40?u=6`,
      ],
      otherAttendees: 25,
      color: "bg-blue-50",
    },
    {
      title: "Design Systems at Scale",
      coach: {
        name: "Sophia Nguyen",
        firstName: "Sophia",
        role: "Lead Designer, Figma",
        avatar: `https://i.pravatar.cc/400?u=sophia`,
      },
      tag: "Premium",
      date: "Monday, August 22",
      time: "7:00 PM - 8:00 PM GMT+2",
      attendees: [
        `https://i.pravatar.cc/40?u=7`,
        `https://i.pravatar.cc/40?u=8`,
        `https://i.pravatar.cc/40?u=9`,
      ],
      otherAttendees: 41,
      color: "bg-purple-50",
    },
  ];

  return (
    <section className="py-20 sm:py-32">
      <div className="container">
        <div className="text-left">
          <h2 className="font-headline">Upcoming Events</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Join live sessions with industry experts to level up your skills.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <WebinarCard key={index} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WebinarCard({ event }: { event: any }) {
  const timeParts = event.time.split(" GMT");
  const mainTime = timeParts[0];
  const timezone = timeParts[1] ? `GMT${timeParts[1]}` : "";

  return (
    <div className="group flex flex-col gap-[5px] h-full">
      <div
        className={`${event.color} p-4 relative rounded-xl transition-transform group-hover:-translate-y-1 flex flex-col flex-grow`}
      >
        <Badge className="absolute top-4 left-4 bg-white text-gray-800 hover:bg-gray-200 z-10">
          {event.tag}
        </Badge>
        <div className="flex items-start gap-4 pt-6 pb-4 flex-grow">
          <div className="flex-shrink-0">
            <Image
              src={event.coach.avatar}
              alt={event.coach.name}
              width={120}
              height={120}
              className="rounded-lg object-cover aspect-square"
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-600">{event.coach.name}</p>
            <h4 className="font-semibold text-gray-800">{event.title}</h4>
            <div className="text-sm text-gray-600">
              <div>
                <p className="font-bold">{event.date}</p>
                <p>
                  {mainTime} <span className="text-xs">{timezone}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center pb-2">
          <div className="flex -space-x-2">
            {event.attendees.map((attendee: string, i: number) => (
              <Avatar key={i} className="h-8 w-8 border-2 border-white">
                <AvatarImage src={attendee} />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {event.otherAttendees > 0 && (
            <span className="ml-3 text-xs font-medium text-muted-foreground">
              +{event.otherAttendees} people attending
            </span>
          )}
        </div>
      </div>
      <div className="bg-white py-4 rounded-xl">
        <Button className="w-2/3 bg-gray-900 text-white hover:bg-gray-800 text-left">
          Register now <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TestimonialsSection({
  testimonials,
}: {
  testimonials: {
    name: string;
    role: string;
    testimonial: string;
    avatar: any;
  }[];
}) {
  return (
    <section className="bg-yellow-400/5 py-20 sm:py-32">
      <div className="container">
        <div className="text-center">
          <h2 className="font-headline">This is what your peers have to say</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl"
            >
              {testimonial.avatar && (
                <Image
                  src={testimonial.avatar.imageUrl}
                  alt={testimonial.avatar.description}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  data-ai-hint={testimonial.avatar.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <CardContent className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <p className="font-serif text-lg leading-snug">
                  &quot;{testimonial.testimonial}&quot;
                </p>
                <div className="mt-4">
                  <h4 className="font-headline text-lg font-semibold">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-white/80">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
