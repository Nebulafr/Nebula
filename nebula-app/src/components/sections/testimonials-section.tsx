import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { TestimonialCard } from "@/components/cards/testimonial-card";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: {
    name: string;
    role: string;
    testimonial: string;
    avatar: {
      imageUrl: string;
      description: string;
      imageHint?: string;
    } | null;
  }[];
}) {
  const t = useTranslations("home.testimonials");
  const tc = useTranslations("common");

  return (
    <section className="bg-yellow-400/5 py-20 sm:py-32">
      <div className="container">
        <div className="text-center">
          <h2 className="font-headline">{t("title")}</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              role={testimonial.role}
              testimonial={testimonial.testimonial}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/signup">{tc("getStarted")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}