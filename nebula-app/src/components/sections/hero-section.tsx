"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.replace(
        `/coaches?search=${encodeURIComponent(searchTerm.trim())}`
      );
    } else {
      router.replace("/coaches");
    }
  };

  const stats = [
    { value: "50+", label: "Top Coaches" },
    { value: "200+", label: "Companies" },
    { value: "5k+", label: "Users Helped" },
  ];

  const categories = [
    "Product Management",
    "Software Engineering",
    "Marketing",
    "Venture Capital",
    "Consulting",
    "Finance",
    "UX Design",
    "Data Science",
  ];

  return (
    <section className="container py-20 text-center md:py-32">
      <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-7xl">
        Empower your career <br /> journey with Nebula
      </h1>
      <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-foreground/70 md:text-xl">
        Get online career coaching from the world&apos;s leading experts to help
        you land your dream job.
      </p>
      <form
        onSubmit={handleSearch}
        className="mx-auto mt-8 flex max-w-lg items-center space-x-2"
      >
        <Input
          type="search"
          placeholder="Search for a coach or specialty..."
          className="h-14 flex-1 rounded-full border focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          type="submit"
          size="icon"
          className="h-14 w-14 flex-shrink-0 rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-headline text-5xl font-medium">{stat.value}</p>
            <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-4">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="outline"
            className="justify-center text-sm"
          >
            {category}
          </Badge>
        ))}
      </div>
    </section>
  );
}