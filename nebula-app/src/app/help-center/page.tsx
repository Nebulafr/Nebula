"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Smile,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function HelpCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "FAQs",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      icon: <Smile className="h-5 w-5" />,
      title: "Getting Started",
      description:
        "New to Nebula? Find everything you need to start your journey.",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Account & Profile",
      description: "Manage your account settings, profile, and notifications.",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Billing & Subscriptions",
      description: "Find information about payments, invoices, and plans.",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Programs & Coaching",
      description: "Learn about how our programs and coaching sessions work.",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Events & Webinars",
      description: "Find details about upcoming live events and webinars.",
    },
    {
      icon: <LifeBuoy className="h-5 w-5" />,
      title: "Troubleshooting",
      description: "Experiencing technical issues? Find solutions here.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Community Guidelines",
      description: "Learn about our rules for a safe and supportive community.",
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: "FAQs",
      description: "Find answers to frequently asked questions.",
    },
  ];

  const faqData: { [key: string]: { question: string; answer: string }[] } = {
    "Getting Started": [
      {
        question: "How do I sign up for Nebula?",
        answer:
          'You can sign up for a student account by clicking the "Sign Up" button on our homepage. If you are a coach, you can apply through the "Become a Coach" page.',
      },
      {
        question: "What is the onboarding process like?",
        answer:
          "Our onboarding process is a quick, three-step flow where you tell us about your interests, skill level, and commitment. This helps us personalize your dashboard with relevant programs and coaches.",
      },
    ],
    "Account & Profile": [
      {
        question: "How do I reset my password?",
        answer:
          'You can reset your password by clicking the "Forgot your password?" link on the login page. You will receive an email with instructions on how to create a new password.',
      },
      {
        question: "How can I update my profile information?",
        answer:
          'You can update your name, email, and other personal details in the "Settings" section of your dashboard.',
      },
    ],
    "Billing & Subscriptions": [
      {
        question: "Can I change my subscription plan?",
        answer:
          "Yes, you can upgrade, downgrade, or cancel your subscription at any time from your billing settings. Changes will take effect at the end of your current billing cycle.",
      },
      {
        question: "What is the refund policy?",
        answer:
          "We offer a 30-day money-back guarantee on all our subscription plans. If you are not satisfied, you can request a full refund within 30 days of your purchase.",
      },
    ],
    "Programs & Coaching": [
      {
        question: "How do I enroll in a program or book a session?",
        answer:
          "To enroll in a program, visit the program's page and click 'Enroll'. For individual sessions, you can book a time directly from a coach's profile page. All your bookings will appear in the 'My Sessions' section of your dashboard.",
      },
      {
        question:
          "What is the difference between a program and an individual session?",
        answer:
          "Programs are structured, multi-week cohort-based experiences focused on a specific career goal. Individual sessions are one-off meetings you can book with a coach for personalized guidance on any topic.",
      },
      {
        question: "Can I get a certificate after completing a program?",
        answer:
          "Yes, upon successful completion of a program, a digital certificate of completion will be available for you to download from the 'My Sessions' section of your dashboard.",
      },
      {
        question: "How are coaches vetted?",
        answer:
          "Our coaches undergo a rigorous vetting process that includes a review of their professional experience, coaching qualifications, and a practical assessment. We only partner with top-tier experts to ensure you receive the highest quality guidance.",
      },
    ],
    "Events & Webinars": [
      {
        question: "How do I register for an event or webinar?",
        answer:
          'You can register for any event or webinar directly from the "Events" page. Once registered, you will receive a confirmation email with all the details.',
      },
    ],
    Troubleshooting: [],
    "Community Guidelines": [],
  };

  const allFaqs = Object.values(faqData).flat();
  faqData["FAQs"] = allFaqs;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCategory("FAQs");
  };

  const faqsForCategory = selectedCategory
    ? faqData[selectedCategory] || []
    : [];
  const filteredFaqs = faqsForCategory.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-primary/5 py-20 text-center sm:py-24">
          <div className="container">
            <h1 className="font-headline text-5xl font-bold tracking-tighter md:text-6xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Find answers to your questions, explore articles, and get the most
              out of Nebula.
            </p>
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto mt-8 flex max-w-xl items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for topics, questions, or keywords"
                  className="h-14 rounded-full pl-12"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                className="ml-2 h-14 w-14 flex-shrink-0 rounded-full"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="container grid grid-cols-1 md:grid-cols-4 md:gap-12">
            <aside className="md:col-span-1 mb-12 md:mb-0">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <nav>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.title}>
                      <button
                        onClick={() => setSelectedCategory(category.title)}
                        className={cn(
                          "flex w-full items-center gap-3 p-2 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                          selectedCategory === category.title &&
                            "bg-muted text-foreground",
                        )}
                      >
                        {category.icon}
                        <span className="text-sm font-medium">
                          {category.title}
                        </span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/help-center/contact"
                      className="flex w-full items-center gap-3 rounded-md bg-primary/5 p-2 text-primary transition-colors hover:bg-primary/10 mt-4"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Contact Support
                      </span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
            <div className="md:col-span-3">
              <div className="h-full rounded-lg border p-12">
                {!selectedCategory ? (
                  <div className="flex flex-col items-center justify-start text-center text-muted-foreground">
                    <Search className="h-6 w-6 mb-4" />
                    <h3 className="text-base font-semibold text-foreground">
                      Select a category or search above
                    </h3>
                    <p className="max-w-xs mt-1 text-sm">
                      Choose a topic from the sidebar to view related articles
                      and FAQs.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-headline text-3xl mb-8">
                      {selectedCategory}
                    </h2>
                    {filteredFaqs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {filteredFaqs.map((faq, i) => (
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
                    ) : (
                      <p className="text-muted-foreground text-center mt-8">
                        No questions found matching your search.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-2xl p-8 text-center mt-16">
                <h2 className="font-headline text-3xl">Still need help?</h2>
                <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
                  Our team is here to assist you. Reach out for personalized
                  support.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat with us
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent border-border"
                  >
                    Email Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
