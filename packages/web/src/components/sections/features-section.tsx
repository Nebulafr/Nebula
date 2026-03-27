 
import React, { ReactNode, CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { FeatureCard } from "@/components/cards/feature-card";

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
            <FeatureCard
              key={i}
              icon={card.icon}
              title={card.title}
              description={card.description}
              customStyle={card.customStyle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}