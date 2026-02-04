"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
  avatar: {
    imageUrl: string;
    description: string;
    imageHint?: string;
  } | null;
}

export function TestimonialCard({
  name,
  role,
  testimonial,
  avatar,
}: TestimonialCardProps) {
  return (
    <Card className="relative aspect-[4/5] w-full overflow-hidden rounded-xl group">
      {avatar && (
        <Image
          src={avatar.imageUrl}
          alt={avatar.description}
          fill
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          data-ai-hint={avatar.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <CardContent className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <p className="font-serif text-lg leading-snug">
          &quot;{testimonial}&quot;
        </p>
        <div className="mt-4">
          <h4 className="font-headline text-lg font-semibold">
            {name}
          </h4>
          <p className="text-sm text-white/80">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}
