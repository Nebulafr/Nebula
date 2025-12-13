"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import {
  ArrowRight,
  Briefcase,
  HeartHandshake,
  PlayCircle,
  Scaling,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function UniversitiesPage() {
  const schoolLogos = [
    {
      name: "HEC Paris",
      url: "https://via.placeholder.com/150x50/FFFFFF/000000?text=HEC+Paris",
    },
    {
      name: "ESSEC",
      url: "https://via.placeholder.com/150x50/FFFFFF/000000?text=ESSEC",
    },
    {
      name: "ESCP",
      url: "https://via.placeholder.com/150x50/FFFFFF/000000?text=ESCP",
    },
    {
      name: "emlyon",
      url: "https://via.placeholder.com/150x50/FFFFFF/000000?text=emlyon",
    },
    {
      name: "EDHEC",
      url: "https://via.placeholder.com/150x50/FFFFFF/000000?text=EDHEC",
    },
  ];

  const benefits = [
    {
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      title: "Enhance Employability",
      description:
        "Equip your students with the real-world skills and interview practice they need to stand out to top employers.",
      color: "bg-primary/10",
    },
    {
      icon: <HeartHandshake className="h-6 w-6 text-blue-500" />,
      title: "Activate Your Alumni Network",
      description:
        "Transform your alumni from a passive resource into an active, engaged community of mentors, strengthening ties back to your institution.",
      color: "bg-blue-500/10",
    },
    {
      icon: <Scaling className="h-6 w-6 text-purple-500" />,
      title: "Scale Career Services",
      description:
        "Supplement your existing career services with on-demand, expert coaching from a global network of professionals.",
      color: "bg-purple-500/10",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Partner with Us",
      description:
        "We'll work with you to create a custom plan that fits the needs of your institution and your students.",
    },
    {
      step: 2,
      title: "Onboard Students",
      description:
        "Students sign up and get personalized recommendations for coaches and programs based on their career interests.",
    },
    {
      step: 3,
      title: "Track Progress",
      description:
        "Gain insights into student engagement and career readiness through our dedicated university dashboard.",
    },
  ];

  const faqs = [
    {
      question:
        "How much does it cost for a university to partner with Nebula?",
      answer:
        "Our partnership is free for a stipulated time, which is mutually agreed upon with each university. We offer flexible pilot programs to demonstrate value before any long-term commitment.",
    },
    {
      question: "How are the coaches selected?",
      answer:
        "We work directly with you to recruit and onboard coaches from your own talented alumni network. This ensures that students receive guidance from professionals who share their academic background and can provide highly relevant industry insights.",
    },
    {
      question:
        "Can we integrate Nebula with our existing career services platform?",
      answer:
        "While direct technical integrations are not yet available, we partner closely with your career services team. We collaborate to design and implement a seamless job immersion program that complements your existing offerings, leveraging coaches from your alumni network.",
    },
  ];

  const videoImage = PlaceHolderImages.find((img) => img.id === "program-1");
  const ctaImage = PlaceHolderImages.find((img) => img.id === "coach-network");
  const problemImage = PlaceHolderImages.find(
    (img) => img.id === "university-problem"
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container py-20 text-center md:py-32">
          <h1 className="font-headline text-6xl font-bold tracking-tighter text-primary md:text-8xl">
            Experiential Learning +
          </h1>
          <h1 className="font-headline text-6xl font-bold tracking-tighter text-muted-foreground md:text-8xl">
            Career Prep
          </h1>
        </section>

        <section className="py-12 bg-primary/5">
          <div className="container text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              IN CONVERSATION WITH LEADING BUSINESS SCHOOLS
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
              {schoolLogos.map((logo) => (
                <div key={logo.name} className="flex justify-center">
                  <Image
                    src={logo.url}
                    alt={logo.name}
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <Card className="bg-gradient-to-br from-primary/5 to-blue-500/10 border-none rounded-xl p-12 flex flex-col justify-center">
              <CardContent className="p-0">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">
                  The Problem
                </div>
                <p className="mt-4 text-lg text-muted-foreground">
                  Universities excel at providing theoretical knowledge, but
                  students often struggle to bridge the gap between academia and
                  the practical demands of the job market.
                </p>
                <p className="mt-4 text-lg text-muted-foreground">
                  They lack exposure to real-world business challenges and the
                  specific interview skills needed to land competitive roles.
                </p>
              </CardContent>
            </Card>
            {problemImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <Image
                  src={problemImage.imageUrl}
                  alt={problemImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={problemImage.imageHint}
                />
              </div>
            )}
          </div>
        </section>

        <section className="pb-20 sm:pb-32">
          <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1 py-12">
              <h2 className="font-headline text-4xl">Our Solution</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                A powerful, internal ecosystem for practical skill-building.
              </p>
            </div>
            <div className="md:col-span-3">
              <Card className="h-full rounded-xl">
                <CardContent className="p-12">
                  <p className="text-lg text-muted-foreground">
                    Nebula partners with your institution to design a custom job
                    immersion program. We leverage your most valuable asset,
                    your alumni network, to connect experienced professionals
                    with current students for 1-on-1 coaching.
                  </p>
                  <p className="mt-4 text-lg text-muted-foreground">
                    This creates a powerful, internal ecosystem where students
                    practice real-world case studies and gain practical skills
                    directly from experts who have walked the same path, giving
                    them the confidence to launch their careers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-32">
          <div className="container">
            <div className="mb-12 text-left">
              <h2 className="font-headline text-4xl">
                Benefits for Your Institution
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="p-8 bg-white shadow-none border-none rounded-xl text-left"
                >
                  <CardContent className="p-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${benefit.color}`}
                    >
                      {benefit.icon}
                    </div>
                    <h3 className="mt-6 font-headline text-2xl font-semibold">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-base text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {howItWorks.map((step) => (
                <div
                  key={step.step}
                  className="flex flex-col items-center text-center z-10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg border-4 border-background">
                    {step.step}
                  </div>
                  <h3 className="mt-4 font-headline text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground py-20 sm:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-4xl md:text-5xl">
              Ready to empower your students?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
              Partner with Nebula to give your students the competitive edge
              they need to succeed in today's job market.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                Request a Demo
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">One More Thing...</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                By partnering with us, you’ll gain early access to our
                next-generation virtual workplace simulation, currently in
                development, designed to feel real, dynamic, and challenging.
              </p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden group mt-8">
              {videoImage && (
                <Image
                  src={videoImage.imageUrl}
                  alt={videoImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={videoImage.imageHint}
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="h-40 w-40 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-32">
          <div className="container max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-headline text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pl-4 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-20 sm:py-32">
          <div className="container text-center">
            <h2 className="font-headline text-4xl md:text-5xl">
              Take the Next Step
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Let's discuss how Nebula can help your students achieve their
              career goals.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/help-center/contact">
                  Contact our Partnerships Team
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
