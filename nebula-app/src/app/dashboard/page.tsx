"use client";

import { StudentRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "./components/dashboard-header";
import { RecommendedPrograms } from "./components/recommended-programs";
import { UpcomingSessions } from "./components/upcoming-sessions";
import { SuggestedCoaches } from "./components/suggested-coaches";

const recommendedPrograms = [
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
      `https://i.pravatar.cc/40?u=3`,
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

const upcomingSessions = [
  {
    title: "Problem-Solving & Structured Thinking",
    coach: "Adrian Cucurella",
    date: "Aug 4",
    day: "Thu",
    time: "6:00 PM",
    type: "Webinar",
  },
  {
    title: "From Founder to VC",
    coach: "William Harris",
    date: "Aug 12",
    day: "Fri",
    time: "5:00 PM",
    type: "Webinar",
  },
  {
    title: "Design Systems at Scale",
    coach: "Sophia Nguyen",
    date: "Aug 22",
    day: "Mon",
    time: "7:00 PM",
    type: "AMA",
  },
];

const suggestedCoaches = [
  {
    name: "Adrian Cucurella",
    role: "Partner, BCG",
    avatar: "https://i.pravatar.cc/150?u=adrian-cucurella",
    rating: 4.9,
    studentsCoached: 120,
    specialties: ["Career Prep", "Interview Skills"],
    id: "coach-1",
  },
  {
    name: "Sarah Chen",
    role: "Senior PM, Google",
    avatar: "https://i.pravatar.cc/150?u=sarah-chen",
    rating: 4.8,
    studentsCoached: 95,
    specialties: ["Product Management", "Resume Review"],
    id: "coach-2",
  },
  {
    name: "Michael B. Jordan",
    role: "Actor, Director",
    avatar: "https://i.pravatar.cc/150?u=michael-jordan",
    rating: 4.9,
    studentsCoached: 150,
    specialties: ["Acting", "Film Direction"],
    id: "coach-3",
  },
  {
    name: "Lisa Kudrow",
    role: "Comedian, Actress",
    avatar: "https://i.pravatar.cc/150?u=lisa-kudrow",
    rating: 4.7,
    studentsCoached: 80,
    specialties: ["Comedy", "Improvisation"],
    id: "coach-4",
  },
];

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <StudentRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <DashboardHeader user={profile} />
        <div className="flex flex-col gap-[90px] mt-6">
          <RecommendedPrograms programs={recommendedPrograms} user={profile!} />
          <UpcomingSessions sessions={upcomingSessions} user={profile!} />
          <SuggestedCoaches coaches={suggestedCoaches} user={profile!} />
        </div>
      </div>
    </StudentRoute>
  );
}
