
'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  ArrowRight,
  ChevronRight,
  Linkedin,
  MessageCircle,
  PlusCircle,
  Star,
  Twitter,
  Youtube,
  X,
  CheckCircle,
  Briefcase,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/footer';
import { useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';

export default function CoachDetailPage() {
  const [bookingStep, setBookingStep] = useState(0); // 0: default, 1: calendar, 2: time, 3: success
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const coach = {
      name: 'Adrian Cucurella',
      slug: 'adrian-cucurella',
      role: 'Partner, BCG',
      avatar: 'https://i.pravatar.cc/150?u=adrian-cucurella',
      rating: 4.9,
      reviewsCount: '6',
      bio: "With over five years of experience at a leading global consulting firm, Adrian brings deep expertise in strategy and operations. Now a Consultant at BCG, they help Fortune 500 clients tackle complex business challenges. Their work spans multiple industries, with a focus on digital transformation and growth strategy. Passionate about talent development, they coach emerging professionals on a job immersion platform. Adrian holds a Master's degree in Business and thrives at the intersection of impact and innovation.",
      pastCompanies: [
        { name: 'BCG' },
        { name: 'PALIN' },
      ],
      reviews: [
        {
          text: "Adrian was incredibly insightful and supportive. His real-world examples from BCG made complex concepts easy to understand. I left the session feeling more confident and inspired.",
          author: 'Carlos Pavol',
          role: 'Student',
          rating: 5,
        },
        {
          text: "A fantastic mentor. Adrian helped me navigate the complexities of a case interview and provided actionable feedback.",
          author: 'Sarah K.',
          role: 'UX Designer',
          rating: 5,
        }
      ],
      programs: [
        {
            title: 'Consulting, Associate Level',
            category: 'Career Prep',
            icon: <Briefcase className="h-5 w-5 text-primary" />,
            slug: '/programs/consulting-associate-level'
        },
        {
            title: 'MBA Admissions Coaching',
            category: 'School Admissions',
            icon: <GraduationCap className="h-5 w-5 text-blue-500" />,
            slug: '/programs/mba-admissions'
        }
      ]
  };

  const handleBookClick = () => {
    setBookingStep(1);
  }

  const handleCancelBooking = () => {
    setBookingStep(0);
  }
  
  const handleDateSelect = () => {
    setBookingStep(2);
  }

  const handleTimeSelect = () => {
    // Here you would typically trigger the Genkit flow to create the session
    // For now, we just show the success step
    setBookingStep(3);
  }
  
  const handleMessageClick = () => {
    // Assuming coach 'Adrian Cucurella' has conversation ID 1 for demonstration
    router.push('/dashboard/messaging?conversationId=1');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className='md:col-span-2'>
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/coaches" className="hover:text-primary">
                        Coaches
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span>{coach.name}</span>
                </div>
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={coach.avatar} />
                        <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-5xl">
                        {coach.name}
                        </h1>
                        <p className="mt-1 text-lg text-foreground/70">
                        {coach.role}
                        </p>
                    </div>
                     <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-yellow-400 bg-yellow-50/50 text-yellow-700 ml-auto px-2 py-0.5 text-[10px]"
                      >
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span className="font-semibold">{coach.rating}</span>
                    </Badge>
                </div>
                <p className="mt-6 text-base text-muted-foreground">
                    {coach.bio}
                </p>

                 <div className="mt-8">
                    <h4 className="text-sm font-semibold text-muted-foreground">Adrian has worked at:</h4>
                    <div className="mt-4 flex items-center gap-4">
                        {coach.pastCompanies.map(company => (
                             <div key={company.name} className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">{company.name}</div>
                        ))}
                    </div>
                </div>

                <div className="my-12">
                    <h2 className="mb-6 font-headline text-2xl font-bold">
                        Programs by {coach.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {coach.programs.map((program) => (
                            <Link href={program.slug} key={program.title}>
                                <Card className='p-6 flex items-center gap-4 hover:shadow-lg transition-shadow'>
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${program.category === 'Career Prep' ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
                                        {program.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-headline font-semibold">{program.title}</h3>
                                        <p className="text-sm text-muted-foreground">{program.category}</p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={cn("md:col-span-1 relative pt-10")}>
                <div className="sticky top-24">
                     <BookingForm 
                        step={bookingStep}
                        onBook={handleBookClick}
                        onCancel={handleCancelBooking}
                        onDateSelect={handleDateSelect}
                        onTimeSelect={handleTimeSelect}
                        onMessageClick={handleMessageClick}
                    />
                </div>
            </div>
          </div>
        </section>

        

        <section className="container py-20">
            <h2 className="mb-8 font-headline text-3xl font-bold">
                Reviews ({coach.reviewsCount})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {coach.reviews.map((review, i) => (
                    <Card key={i} className="rounded-xl border shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="font-serif text-base text-muted-foreground">
                            &quot;{review.text}&quot;
                            </p>
                            <p className="mt-4 text-sm font-semibold">{review.author}, <span className="font-normal text-muted-foreground">{review.role}</span></p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <Button variant="link" className="mt-6 px-0" asChild>
                <Link href={`/coaches/${params.slug}/reviews`}>
                  View all reviews <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function BookingForm({ 
    step,
    onBook,
    onCancel,
    onDateSelect,
    onTimeSelect,
    onMessageClick
}: { 
    step: number;
    onBook: () => void;
    onCancel: () => void;
    onDateSelect: () => void;
    onTimeSelect: () => void;
    onMessageClick: () => void;
}) {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const timeSlots = ["09:00", "11:00", "14:00", "16:00"];

  if (step === 0) {
      return (
        <Card className="rounded-xl border shadow-lg">
            <CardContent className="p-6 text-center">
                <h3 className='font-headline text-2xl font-bold'>Book a session</h3>
                <p className='text-muted-foreground mt-2 mb-6'>Find a time that works for you.</p>
                <Button size="lg" className="w-full" onClick={onBook}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Book now
                </Button>
                <Button size="lg" variant="outline" className="w-full mt-2" onClick={onMessageClick}>
                    <MessageCircle className="mr-2 h-5 w-5" /> Message
                </Button>
            </CardContent>
        </Card>
      )
  }

  if (step === 1) {
    return (
      <Card className="rounded-xl border shadow-lg p-0">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-4 px-4 pt-4">
            <h3 className="font-headline text-lg font-bold">Select a date</h3>
            <Button variant="ghost" size="icon" onClick={onCancel} className="-mr-2 -mt-2">
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
            <Button className="w-full mt-4" disabled={!date} onClick={onDateSelect}>
                Continue
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
            <Button variant="ghost" size="icon" onClick={() => onCancel()} className="-mr-2 -mt-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold text-sm mb-2">Available Slots</h4>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(time => (
                <Button 
                  key={time} 
                  variant="outline"
                  className={cn(selectedTime === time && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground')}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
          <Button className="w-full mt-6" disabled={!selectedTime} onClick={onTimeSelect}>
            Confirm Booking
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
                <h3 className="font-headline text-xl font-bold">Session Booked!</h3>
                <p className="text-sm mt-2">Your session has been confirmed. You can view your booking details on your dashboard.</p>
                <div className='flex gap-2 mt-6'>
                    <Button variant='outline' className='w-full bg-transparent border-green-700 text-green-700 hover:bg-green-100 hover:text-green-800' onClick={onCancel}>Close</Button>
                    <Button className="w-full bg-green-700 hover:bg-green-800" asChild>
                        <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      )
  }

  return null;
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
              <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
              <Button asChild><Link href="/signup">Sign Up</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
