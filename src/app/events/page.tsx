
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  ExternalLink,
  Info,
  Linkedin,
  LogOut,
  LucideIcon,
  PartyPopper,
  Search,
  Star,
  Twitter,
  Users,
  Video,
  Youtube,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Footer } from '@/components/layout/footer';
import { useUser } from '@/hooks/use-user';
import { getAuth, signOut } from 'firebase/auth';

const webinarEvents = [
  {
    title: 'Problem-Solving & Structured Thinking',
    coach: {
      name: 'Adrian Cucurella',
      firstName: 'Adrian',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/400?u=adrian`,
    },
    tag: 'Free',
    date: 'Thursday, August 4',
    time: '6:00 PM - 7:00 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=1`,
      `https://i.pravatar.cc/40?u=2`,
      `https://i.pravatar.cc/40?u=3`,
    ],
    otherAttendees: 32,
    color: 'bg-yellow-50',
    textColor: 'text-gray-800',
  },
  {
    title: 'LinkedIn & Personal Branding',
    coach: {
      name: 'Adrian Cucurella',
      firstName: 'Adrian',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/400?u=adrian-2`,
    },
    tag: 'Premium',
    date: 'Friday, August 12',
    time: '5:00 PM - 6:00 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=4`,
      `https://i.pravatar.cc/40?u=5`,
      `https://i.pravatar.cc/40?u=6`,
    ],
    otherAttendees: 32,
    color: 'bg-blue-50',
    textColor: 'text-gray-800',
  },
  {
    title: 'Mastering behavioral and case interviews',
    coach: {
      name: 'Adrian Cucurella',
      firstName: 'Adrian',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/400?u=adrian-3`,
    },
    tag: 'Premium',
    date: 'Monday, August 22',
    time: '7:00 PM - 8:00 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=7`,
      `https://i.pravatar.cc/40?u=8`,
      `https://i.pravatar.cc/40?u=9`,
    ],
    otherAttendees: 32,
    color: 'bg-purple-50',
    textColor: 'text-gray-800',
  },
  {
    title: 'LinkedIn & Personal Branding',
    coach: {
      name: 'Adrian Cucurella',
      firstName: 'Adrian',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/400?u=adrian-4`,
    },
    tag: 'Free',
    date: 'Tuesday, August 30',
    time: '6:30 PM - 7:30 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=10`,
      `https://i.pravatar.cc/40?u=11`,
      `https://i.pravatar.cc/40?u=12`,
    ],
    otherAttendees: 32,
    color: 'bg-blue-50',
    textColor: 'text-gray-800',
  },
  {
    title: 'Mastering behavioral and case interviews',
    coach: {
      name: 'Adrian Cucurella',
      firstName: 'Adrian',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/400?u=adrian-5`,
    },
    tag: 'Premium',
    date: 'Wednesday, September 7',
    time: '6:00 PM - 7:00 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=13`,
      `https://i.pravatar.cc/40?u=14`,
      `https://i.pravatar.cc/40?u=15`,
    ],
    otherAttendees: 32,
    color: 'bg-purple-50',
    textColor: 'text-gray-800',
  },
  {
    title: 'Problem-Solving & Structured Thinking',
    coach: {
      name: 'Adrian Cucurella',
      firstName: 'Adrian',
      role: 'Partner, BCG',
      avatar: `https://i.pravatar.cc/400?u=adrian-6`,
    },
    tag: 'Free',
    date: 'Thursday, September 15',
    time: '8:00 PM - 9:00 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=16`,
      `https://i.pravatar.cc/40?u=17`,
      `https://i.pravatar.cc/40?u=18`,
    ],
    otherAttendees: 32,
    color: 'bg-yellow-50',
    textColor: 'text-gray-800',
  },
];

const socialEvents = [
  {
    slug: 'hiking-adventure',
    title: 'Hiking',
    image: 'https://picsum.photos/seed/hike/600/400',
    imageHint: 'people hiking',
    coach: {
      name: 'Maxwell Boyt',
      role: 'Student',
      avatar: 'https://i.pravatar.cc/40?u=maxwell',
    },
    tag: 'Premium',
    date: 'July 14, 6:30 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=19`,
      `https://i.pravatar.cc/40?u=20`,
      `https://i.pravatar.cc/40?u=21`,
    ],
    otherAttendees: 32,
  },
  {
    slug: 'picnic-hangout',
    title: 'Hang out',
    image: 'https://picsum.photos/seed/hangout/600/400',
    imageHint: 'friends picnic',
    coach: {
      name: 'Keziah L.',
      role: 'Student',
      avatar: 'https://i.pravatar.cc/40?u=keziah',
    },
    tag: 'Free',
    date: 'July 14, 6:30 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=22`,
      `https://i.pravatar.cc/40?u=23`,
      `https://i.pravatar.cc/40?u=24`,
    ],
    otherAttendees: 32,
  },
  {
    slug: 'museum-visit',
    title: 'Museum Visit | Montmartre, Paris',
    image: 'https://picsum.photos/seed/museum/600/400',
    imageHint: 'Paris museum',
    coach: {
      name: 'Juliana Sorowitz',
      role: 'Student',
      avatar: 'https://i.pravatar.cc/40?u=juliana',
    },
    tag: 'Premium',
    date: 'July 14, 6:30 PM GMT+2',
    rating: 4.9,
    attendees: [
      `https://i.pravatar.cc/40?u=25`,
      `https://i.pravatar.cc/40?u=26`,
      `https://i.pravatar.cc/40?u=27`,
    ],
    otherAttendees: 32,
  },
];

export default function EventsPage() {
  const [activePriceFilter, setActivePriceFilter] = useState('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  const priceFilters = ['All', 'Free', 'Premium'];
  const typeFilters = [
    { name: 'Webinar', icon: <Video className="mr-2 h-4 w-4" />, tooltip: 'Show only webinars. Click again to clear.' },
    { name: 'Social', icon: <PartyPopper className="mr-2 h-4 w-4" />, tooltip: 'Show only social events. Click again to clear.' },
  ];

  const handleTypeFilterClick = (filterName: string) => {
    setActiveTypeFilter(prevFilter => prevFilter === filterName ? null : filterName);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  }

  const filteredWebinarEvents = webinarEvents.filter(event => {
    const priceMatch = activePriceFilter === 'All' || event.tag === activePriceFilter;
    const searchMatch = searchTerm === '' || event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.coach.name.toLowerCase().includes(searchTerm.toLowerCase());
    return priceMatch && searchMatch;
  });

  const filteredSocialEvents = socialEvents.filter(event => {
    const priceMatch = activePriceFilter === 'All' || event.tag === activePriceFilter;
    const searchMatch = searchTerm === '' || event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.coach.name.toLowerCase().includes(searchTerm.toLowerCase());
    return priceMatch && searchMatch;
  });
  
  const showWebinars = !activeTypeFilter || activeTypeFilter === 'Webinar';
  const showSocial = !activeTypeFilter || activeTypeFilter === 'Social';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container pt-12 pb-8 md:pt-24 md:pb-12 text-center">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary md:text-6xl">
            Events
          </h1>
          <div className="mx-auto mt-8 flex max-w-lg justify-center gap-2">
            {priceFilters.map(filter => (
              <Button
                key={filter}
                variant="outline"
                className={cn(
                  'rounded-full',
                  activePriceFilter === filter && 'bg-muted font-bold'
                )}
                onClick={() => setActivePriceFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </section>

        <section className="container pb-12">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-3xl items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events by title or coach"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 w-full rounded-full border pl-10 focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 flex-shrink-0 rounded-full ml-2"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
          <div className="mx-auto mt-4 flex max-w-3xl justify-center gap-4">
             <TooltipProvider>
              {typeFilters.map(filter => (
                <Tooltip key={filter.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        activeTypeFilter === filter.name && 'bg-muted'
                      )}
                      onClick={() => handleTypeFilterClick(filter.name)}
                    >
                      {filter.icon}
                      {filter.name}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{filter.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </section>

        {showWebinars && filteredWebinarEvents.length > 0 && (
          <section className="container pb-12">
            <div className="mb-8 flex items-center gap-2">
              <h2 className="font-headline text-2xl font-bold">Webinar</h2>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWebinarEvents.map((event, index) => (
                <WebinarCard key={index} event={event} />
              ))}
            </div>
          </section>
        )}

        {showSocial && filteredSocialEvents.length > 0 && (
          <section className="container pb-20">
            <div className="mb-8 flex items-center gap-2">
              <h2 className="font-headline text-2xl font-bold">
                Social Experience
              </h2>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSocialEvents.map((event, index) => (
                <SocialEventCard key={index} event={event} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function WebinarCard({ event }: { event: (typeof webinarEvents)[0] }) {
  const timeParts = event.time.split(' GMT');
  const mainTime = timeParts[0];
  const timezone = timeParts[1] ? `GMT${timeParts[1]}` : '';

  return (
    <div className="group flex flex-col gap-[5px] h-full">
      <div className={`${event.color} p-4 relative rounded-xl transition-transform group-hover:-translate-y-1 flex flex-col flex-grow`}>
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
                <p>{mainTime} <span className="text-xs">{timezone}</span></p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center pb-2">
          <div className="flex -space-x-2">
            {event.attendees.map((attendee, i) => (
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


function SocialEventCard({ event }: { event: (typeof socialEvents)[0] }) {
  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl shadow-none transition-shadow hover:shadow-lg">
      <Link href={`/events/social/${event.slug}`} className="block relative">
        <Image src={event.image} alt={event.title} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint={event.imageHint} />
        <Badge className="absolute top-2 left-2 bg-white text-gray-800 hover:bg-gray-200">
          {event.tag}
        </Badge>
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        <h3 className="font-headline text-lg font-semibold leading-tight">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.coach.avatar} />
            <AvatarFallback>{event.coach.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-sm text-muted-foreground">{event.coach.name}, {event.coach.role}</p>
           <Badge
              variant="outline"
              className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 px-1 py-0.5 text-[10px] text-yellow-700"
            >
              <Star className="h-2 w-2 fill-current text-yellow-500" />
              <span className="font-semibold">{event.rating}</span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{event.date}</p>

        <div className="flex-grow" />
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {event.attendees.map((attendee, i) => (
                <Avatar key={i} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={attendee} />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {event.otherAttendees > 0 && (
              <span className="ml-3 text-sm font-medium text-muted-foreground">
                +{event.otherAttendees} people attending
              </span>
            )}
          </div>
        </div>
        <Button asChild className="mt-4 w-full bg-gray-900 text-white hover:bg-gray-800">
          <Link href={`/events/social/${event.slug}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Header() {
  const { user, profile } = useUser();
  const auth = getAuth();
  
  const handleLogout = async () => {
    await signOut(auth);
  };

  const dashboardUrl = profile?.role === 'coach' ? '/coach-dashboard' : '/dashboard';

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
              className="font-menu text-sm font-medium text-foreground"
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
              <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
              <Button asChild><Link href="/signup">Sign Up</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
