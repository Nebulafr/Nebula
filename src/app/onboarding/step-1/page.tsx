
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const programs = [
  {
    icon: <Image src="/custom-images/career-prep.svg" alt="Career Prep" width={20} height={20} />,
    title: 'Career Prep',
    description: 'Land your dream job with expert guidance.',
    color: 'bg-primary/10',
  },
  {
    icon: <Image src="/custom-images/school.svg" alt="School Admissions" width={20} height={20} />,
    title: 'School Admissions',
    description: 'Get into your top-choice school.',
    color: 'bg-blue-500/10',
  },
  {
    icon: <Image src="/custom-images/skills-assessment.svg" alt="Skill Assessment" width={20} height={20} />,
    title: 'Skill Assessment',
    description: 'Sharpen your skills for career growth.',
    color: 'bg-yellow-500/10',
  },
];

export default function OnboardingStep1() {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const image = PlaceHolderImages.find((img) => img.id === 'about-story');

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] lg:grid lg:grid-cols-5">
      <div className="relative hidden h-full bg-muted lg:col-span-3 lg:block">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            fill
            className="object-cover"
            data-ai-hint={image.imageHint}
          />
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-4xl font-bold">Step 1: Your Interests</h2>
            <p className="mt-2 max-w-lg">Let's start by understanding what you're here to achieve.</p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-6 px-4">
            <Progress value={33} className="mb-6 h-2" />
            <div className="text-left">
            <h1 className="font-headline text-4xl font-bold text-primary">
                Welcome to Nebula!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Let&apos;s personalize your experience. To start, which program are you interested in?
            </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
            {programs.map((program) => (
                <Card
                key={program.title}
                className={`cursor-pointer rounded-xl border p-6 text-left transition-all hover:shadow-lg ${
                    selectedProgram === program.title
                    ? 'border-primary shadow-lg'
                    : 'border-border'
                }`}
                onClick={() => setSelectedProgram(program.title)}
                >
                <CardContent className="flex items-center gap-6 p-0">
                    <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${program.color}`}
                    >
                    {program.icon}
                    </div>
                    <div>
                        <h3 className="font-headline text-lg font-semibold">
                        {program.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                        {program.description}
                        </p>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>

            <div className="mt-6 flex justify-end">
                <Button
                size="lg"
                asChild
                disabled={!selectedProgram}
                >
                <Link href={`/onboarding/step-2?program=${encodeURIComponent(selectedProgram || '')}`}>
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
