'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Clock, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { Stepper } from '../components/stepper';
import { useProposeProgramContext } from '../context/propose-program-context';
import { useCreateProgram } from '@/hooks';
import { useRouter } from 'next/navigation';

export default function ProposeStep5Page() {
    const [isClient, setIsClient] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionComplete, setSubmissionComplete] = useState(false);
    const router = useRouter();
    const { formData, resetForm } = useProposeProgramContext();
    const createProgramMutation = useCreateProgram();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Submit the program when component mounts if not already submitting or complete
        if (!isSubmitting && !submissionComplete && formData.title) {
            submitProgram();
        }
    }, []);

    const submitProgram = async () => {
        setIsSubmitting(true);
        try {
            const programData = {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                objectives: formData.objectives,
                modules: formData.modules.map(mod => ({
                    title: mod.title,
                    week: mod.week,
                    description: mod.description,
                })),
                price: formData.price,
                duration: `${formData.duration} weeks`,
                difficultyLevel: formData.difficultyLevel,
                maxStudents: formData.maxStudents,
                tags: formData.tags,
                prerequisites: formData.prerequisites,
                targetAudience: formData.targetAudience,
                coCoachIds: formData.coCoaches.map(coach => coach.id),
            };

            await createProgramMutation.mutateAsync(programData);
            setSubmissionComplete(true);
        } catch (error) {
            console.error('Failed to submit program:', error);
            // Redirect back to step 4 on error
            router.push('/coach-dashboard/programs/propose/step-4');
        } finally {
            setIsSubmitting(false);
        }
    };

    // A simple guard to prevent rendering confetti on the server
    const ConfettiWrapper = () => {
        const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

        useEffect(() => {
            const { innerWidth, innerHeight } = window;
            setDimensions({ width: innerWidth, height: innerHeight });
        }, []);

        if (!isClient || dimensions.width === 0) return null;

        const ConfettiComponent = Confetti as any;

        return (
            <ConfettiComponent
                width={dimensions.width}
                height={dimensions.height}
                recycle={false}
                numberOfPieces={400}
                gravity={0.1}
            />
        );
    };

    if (isSubmitting) {
        return (
            <Card className="w-full max-w-4xl shadow-lg relative overflow-hidden">
                <CardContent className="p-8">
                    <Stepper currentStep={5} />
                    <div className="text-center mt-12 py-12">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                        <h1 className="text-2xl font-bold">Submitting Your Proposal...</h1>
                        <p className="mt-2 text-muted-foreground">
                            Please wait while we process your application.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl shadow-lg relative overflow-hidden">
            <ConfettiWrapper />
            <CardContent className="p-8">
                <Stepper currentStep={5} />
                <div className="text-center mt-12">
                    <h1 className="text-3xl font-bold">Thank You for Your Proposal!</h1>
                    <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                        Your Immersion Program proposal has been successfully submitted.
                        Our team will review your application and get back to you shortly.
                    </p>
                </div>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Card className="p-4 bg-muted border-none">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold text-sm">Review time</p>
                                <p className="text-xs text-muted-foreground">5-7 business days</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 bg-muted border-none">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold text-sm">Confirmation email</p>
                                <p className="text-xs text-muted-foreground">A confirmation has been sent to you</p>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="text-center mt-12">
                    <Button asChild size="lg" onClick={() => resetForm()}>
                        <Link href="/coach-dashboard/programs">Back to Programs</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

