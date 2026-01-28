import React, { ReactNode, CSSProperties } from "react";
import { Card } from "@/components/ui/card";

interface FeatureCard {
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
  customStyle?: CSSProperties;
}

export function FeaturesSection({ cards }: { cards: FeatureCard[] }) {
  return (
    <section className="py-20 sm:py-32" style={{ backgroundColor: "#059669" }}>
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card, i) => (
            <Card
              key={i}
              className="rounded-xl border p-6 text-card-foreground shadow-md"
              style={{ backgroundColor: "#FFFEF8" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10"
                style={card.customStyle}
              >
                {card.icon}
              </div>
              <h3 className="mt-6 font-headline text-xl font-semibold">
                {card.title}
              </h3>
              <p className="mt-2 text-base text-muted-foreground">
                {card.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}