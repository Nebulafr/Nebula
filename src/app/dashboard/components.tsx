
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, CalendarIcon, Star, Video, Users } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Link from 'next/link';

const recommendedPrograms = [
  {
    category: 'Career Prep',
    title: 'Consulting, Associate Level',
    description: "Here's a short text that describes the program.",
    coach: {
      name: 'Adrian Cucurella',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/40?u=adrian`,
    },
    attendees: [
      `https://i.pravatar.cc/40?u=1`,
      `https://i.pravatar.cc/40?u=2`,
      `https://i.pravatar.cc/40?u=3`,
      `https://i.pravatar.cc/40?u=4`,
      `https://i.pravatar.cc/40?u=5`,
    ],
    otherAttendees: 32,
    rating: 4.9,
    slug: 'consulting-associate-level',
  },
  {
    category: 'Interview Prep',
    title: 'Product Management Interviews',
    description: 'Ace your PM interviews with a Senior PM from Google.',
    coach: {
      name: 'Sarah Chen',
      role: 'Senior PM, Google',
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
    slug: 'product-management-interviews',
  },
  {
    category: 'Skill Building',
    title: 'Advanced System Design',
    description: 'Master scalable architecture for your engineering career.',
    coach: {
      name: 'David Lee',
      role: 'Principal Engineer, AWS',
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
    slug: 'advanced-system-design',
  },
];

const upcomingSessions = [
  {
    title: 'Problem-Solving & Structured Thinking',
    coach: 'Adrian Cucurella',
    date: 'Aug 4',
    day: 'Thu',
    time: '6:00 PM',
    type: 'Webinar',
  },
  {
    title: 'From Founder to VC',
    coach: 'William Harris',
    date: 'Aug 12',
    day: 'Fri',
    time: '5:00 PM',
    type: 'Webinar',
  },
  {
    title: 'Design Systems at Scale',
    coach: 'Sophia Nguyen',
    date: 'Aug 22',
    day: 'Mon',
    time: '7:00 PM',
    type: 'AMA',
  },
];

const suggestedCoaches = [
    {
      name: 'Adrian Cucurella',
      role: 'Partner, BCG',
      avatar: 'https://i.pravatar.cc/150?u=adrian-cucurella',
      rating: 4.9,
      studentsCoached: 120,
      specialties: ['Career Prep', 'Interview Skills'],
      slug: 'adrian-cucurella',
    },
    {
      name: 'Sarah Chen',
      role: 'Senior PM, Google',
      avatar: 'https://i.pravatar.cc/150?u=sarah-chen',
      rating: 4.8,
      studentsCoached: 95,
      specialties: ['Product Management', 'Resume Review'],
      slug: 'sarah-chen',
    },
    {
      name: 'Michael B. Jordan',
      role: 'Actor, Director',
      avatar: 'https://i.pravatar.cc/150?u=michael-jordan',
      rating: 4.9,
      studentsCoached: 150,
      specialties: ['Acting', 'Film Direction'],
      slug: 'michael-b-jordan',
    },
    {
      name: 'Lisa Kudrow',
      role: 'Comedian, Actress',
      avatar: 'https://i.pravatar.cc/150?u=lisa-kudrow',
      rating: 4.7,
      studentsCoached: 80,
      specialties: ['Comedy', 'Improvisation'],
      slug: 'lisa-kudrow',
    },
  ];

export function RecommendedPrograms() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">
            Recommended Programs
          </h3>
        </div>
        <Button variant="link" asChild>
          <Link href="/programs">
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {recommendedPrograms.map((program, index) => (
              <CarouselItem
                key={index}
                className="p-2 md:basis-1/2 lg:basis-1/3"
              >
                <Link href={`/programs/${program.slug}`} className="flex h-full">
                  <Card
                    key={program.title}
                    className="flex h-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg"
                  >
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
                            className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 px-2 py-0.5 text-[10px]"
                          >
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                            <span className="font-semibold">
                              {program.rating}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4 flex justify-start gap-2">
            <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
            <CarouselNext className="relative -right-0 top-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}

export function UpcomingSessions() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Upcoming Sessions</h3>
        </div>
        <Button variant="link" asChild>
          <Link href="/events">
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6 rounded-xl bg-primary/5 p-6">
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {upcomingSessions.map((session, index) => (
              <CarouselItem
                key={index}
                className="p-4 md:basis-1/2 lg:basis-1/3"
              >
                <Card
                  key={session.title}
                  className="group flex h-full flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg"
                >
                  <CardContent className="relative flex flex-1 flex-col p-6">
                    <Badge variant="outline" className="absolute right-4 top-4 z-10 bg-background/50 backdrop-blur-sm transition-opacity group-hover:opacity-20">{session.type}</Badge>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="flex w-16 flex-col items-center justify-center rounded-lg border bg-background p-2">
                          <span className="text-sm font-semibold text-muted-foreground">
                            {session.day}
                          </span>
                          <span className="font-headline text-3xl font-bold text-primary">
                            {session.date.split(' ')[1]}
                          </span>
                          <span className="-mt-1 text-xs text-muted-foreground">
                            {session.date.split(' ')[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline text-lg font-semibold leading-tight">
                            {session.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            with {session.coach}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {session.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex-grow" />
                    <Button className="w-full">Register</Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4 flex justify-start gap-2">
            <CarouselPrevious className="relative -left-0 top-0 translate-y-0" />
            <CarouselNext className="relative -right-0 top-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </div>
  );
}


export function SuggestedCoaches() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Suggested Coaches</h3>
        <Button variant="link" asChild>
          <Link href="/coaches">
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {suggestedCoaches.map((coach) => (
          <Link key={coach.name} href={`/coaches/${coach.slug}`} className="flex">
          <Card className="flex w-full flex-col rounded-xl border transition-all hover:shadow-lg">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={coach.avatar} />
                  <AvatarFallback>{coach.name[0]}</AvatarFallback>
                </Avatar>
                <div className="mt-4">
                  <h3 className="font-headline text-lg font-semibold">{coach.name}</h3>
                  <p className="text-sm text-muted-foreground">{coach.role}</p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold">{coach.rating}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {coach.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex-grow"/>
              <div className="mt-4 flex items-center justify-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{coach.studentsCoached}+ students</span>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
