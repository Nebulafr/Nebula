'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface StepperProps {
    currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
    const t = useTranslations("dashboard.coach.programs.proposeFlow.steps");
    
    const STEPS = [
        t("step1"),
        t("step2"),
        t("step3"),
        t("step4"),
        t("step5")
    ];

    return (
        <div className="flex items-center justify-center space-x-4">
            {STEPS.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                            "flex items-center justify-center rounded-full h-8 w-8 text-sm font-semibold",
                            index + 1 < currentStep ? "bg-primary text-primary-foreground" :
                            index + 1 === currentStep ? "border-2 border-primary text-primary" :
                            "bg-muted text-muted-foreground"
                        )}>
                            {index + 1 < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <span className={cn(
                            "text-xs font-medium text-center",
                            index + 1 === currentStep ? "text-primary" : "text-muted-foreground"
                        )}>{step}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className="flex-1 h-px bg-border -mt-6" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
