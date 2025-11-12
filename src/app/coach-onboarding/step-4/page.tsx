
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

function CoachOnboardingStep4Content() {
  const image = PlaceHolderImages.find((img) => img.id === 'coach-hero');
  const [style, setStyle] = useState('');

  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const company = searchParams.get('company');
  const linkedin = searchParams.get('linkedin');
  const specialties = searchParams.get('specialties');
  const motivation = searchParams.get('motivation');
  
  const nextStepUrl = `/coach-onboarding/step-5?role=${encodeURIComponent(role||"")}&company=${encodeURIComponent(company||"")}&linkedin=${encodeURIComponent(linkedin||"")}&specialties=${encodeURIComponent(specialties||"")}&motivation=${encodeURIComponent(motivation||"")}&style=${encodeURIComponent(style)}`;
  const prevStepUrl = `/coach-onboarding/step-3?role=${encodeURIComponent(role||"")}&company=${encodeURIComponent(company||"")}&linkedin=${encodeURIComponent(linkedin||"")}&specialties=${encodeURIComponent(specialties||"")}&motivation=${encodeURIComponent(motivation||"")}`;

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
            <h2 className="text-4xl font-bold">Step 4: Your Coaching Style</h2>
            <p className="mt-2 max-w-lg">How do you approach guiding your students?</p>
        </div>
      </div>
      <div className="flex h-full flex-col justify-center py-12 lg:col-span-2">
        <div className="mx-auto grid w-full max-w-md gap-8 px-4">
            <Progress value={80} className="h-2" />
            <Card className="border-none shadow-none">
                <CardHeader className="p-0 text-left">
                <CardTitle className="text-3xl font-bold text-primary">
                    Your Approach
                </CardTitle>
                <CardDescription>
                    Briefly describe your coaching style. How do you help students find solutions?
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 p-0 mt-8">
                    <div className="grid gap-2">
                        <Textarea 
                            id="style" 
                            placeholder="e.g., 'I focus on asking powerful questions to help students uncover their own answers...'" 
                            rows={6}
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-between">
                <Button size="lg" variant="outline" asChild>
                    <Link href={prevStepUrl}>
                        <ArrowLeft className="mr-2 h-5 w-5" /> Back
                    </Link>
                </Button>
                <Button size="lg" asChild>
                    <Link href={nextStepUrl}>
                        Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingStep4() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <CoachOnboardingStep4Content />
        </React.Suspense>
    )
}
