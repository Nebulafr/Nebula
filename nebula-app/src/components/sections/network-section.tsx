"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export function NetworkSection() {
  const { isFrench } = useLanguage();
  const networkImage = PlaceHolderImages.find((img) => img.id === "network");
  return (
    <section className="py-20 sm:py-32">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <div className="order-1 md:order-2">
          {networkImage && (
            <Image
              src={networkImage.imageUrl}
              alt={networkImage.description}
              width={500}
              height={500}
              className="rounded-lg"
              data-ai-hint={networkImage.imageHint}
            />
          )}
        </div>
        <div className="order-2 md:order-1">
          <h2 className="font-headline">
            Global Community of <span className="notranslate">{isFrench ? "Coachs" : "Coaches"}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our network comprises professionals from world-renowned institutions
            and top-tier companies. We bridge the gap between academic theory
            and real-world application, offering you unparalleled access to
            insider knowledge and career opportunities.
          </p>
          <Link href="/coaches">
            <Button className="mt-8" size="lg">
              Explore the Network
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
