import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: {
    name: string;
    role: string;
    testimonial: string;
    avatar: any;
  }[];
}) {
  return (
    <section className="bg-yellow-400/5 py-20 sm:py-32">
      <div className="container">
        <div className="text-center">
          <h2 className="font-headline">This is what your peers have to say</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl"
            >
              {testimonial.avatar && (
                <Image
                  src={testimonial.avatar.imageUrl}
                  alt={testimonial.avatar.description}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  data-ai-hint={testimonial.avatar.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <CardContent className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <p className="font-serif text-lg leading-snug">
                  &quot;{testimonial.testimonial}&quot;
                </p>
                <div className="mt-4">
                  <h4 className="font-headline text-lg font-semibold">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-white/80">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}