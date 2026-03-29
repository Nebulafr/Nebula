"use client";

import React, { ReactNode, CSSProperties } from "react";
import { Card } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  customStyle?: CSSProperties;
}

export function FeatureCard({
  icon,
  title,
  description,
  customStyle,
}: FeatureCardProps) {
  return (
    <Card
      className="rounded-xl border p-6 text-card-foreground shadow-md h-full"
      style={{ backgroundColor: "#FFFEF8" }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
        style={customStyle}
      >
        {icon}
      </div>
      <h3 className="mt-6 font-headline text-xl font-semibold">
        {title}
      </h3>
      <p className="mt-2 text-base text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}
