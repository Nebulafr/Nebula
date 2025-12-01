"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Star, Users } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/hooks/use-user";

interface Coach {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  studentsCoached: number;
  specialties: string[];
  id: string;
}

interface SuggestedCoachesProps {
  coaches: Coach[];
  user: UserProfile;
  loading?: boolean;
  onViewProfile?: (coach: Coach) => void;
}

export function SuggestedCoaches({ 
  coaches, 
  user, 
  loading = false, 
  onViewProfile 
}: SuggestedCoachesProps) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Suggested Coaches</h3>
          <Button variant="link" disabled>
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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
        {coaches.map((coach) => (
          <Link key={coach.name} href={`/coaches/${coach.id}`} className="flex">
            <Card className="flex w-full flex-col rounded-xl border transition-all hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={coach.avatar} />
                    <AvatarFallback>{coach.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="mt-4">
                    <h3 className="font-headline text-lg font-semibold">
                      {coach.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {coach.role}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-semibold">
                        {coach.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {coach.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex-grow" />
                <div className="mt-4 flex items-center justify-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {coach.studentsCoached}+ students
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={(e) => {
                    if (onViewProfile) {
                      e.preventDefault();
                      onViewProfile(coach);
                    }
                  }}
                >
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