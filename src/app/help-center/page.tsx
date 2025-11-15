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
  Briefcase,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  Smile,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { useUser } from "@/hooks/use-user";
import { getAuth, signOut } from "firebase/auth";

export default function HelpCenterPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
      icon: <Briefcase className="h-5 w-5" />,
      title: "Case Studies",
      description: "Explore success stories from our community.",
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

  const faqs = [
    {
      question: "How do I book a session with a coach?",
      answer:
        "You can book a session by visiting a coach's profile and selecting a time from their calendar. Once you confirm, the session will be added to your dashboard.",
    },
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
    {
      question: "How are coaches vetted?",
      answer:
        "Our coaches undergo a rigorous vetting process that includes a review of their professional experience, coaching qualifications, and a practical assessment. We only partner with top-tier experts to ensure you receive the highest quality guidance.",
    },
    {
      question: "How do I reset my password?",
      answer:
        'You can reset your password by clicking the "Forgot your password?" link on the login page. You will receive an email with instructions to create a new password.',
    },
    {
      question: "Are there any free resources available?",
      answer:
        'Yes! We offer a variety of free resources, including articles, webinars, and community events. You can explore them in the "Events" and "Blog" sections of our website.',
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() !== "") {
      setSelectedCategory("FAQs");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      setSelectedCategory("FAQs");
    }
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
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
                            "bg-muted text-foreground"
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
                    <button className="flex w-full items-center gap-3 rounded-md bg-primary/5 p-2 text-primary transition-colors hover:bg-primary/10 mt-4">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Contact Support
                      </span>
                    </button>
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
                ) : selectedCategory === "FAQs" ? (
                  <div>
                    <h2 className="font-headline text-3xl mb-8">
                      Frequently Asked Questions
                    </h2>
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
                    {filteredFaqs.length === 0 && (
                      <p className="text-muted-foreground text-center mt-8">
                        No FAQs found matching your search.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-start text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mb-4" />
                    <h3 className="text-base font-semibold text-foreground">
                      Articles for {selectedCategory}
                    </h3>
                    <p className="max-w-xs mt-1 text-sm">
                      Content for this category will be displayed here.
                    </p>
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

function Header() {
  const { user, profile } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const dashboardUrl =
    profile?.role === "coach" ? "/coach-dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 max-w-screen-2xl items-center px-header mx-auto">
        <div className="flex flex-1 items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="currentColor"
            >
              <path
                d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 14a6 6 0 1 1 6-6 6 6 0 0
 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"
              />
            </svg>
            <span className="font-headline text-xl font-bold">Nebula</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            <Link
              href="/programs"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Programs
            </Link>
            <Link
              href="/events"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Events
            </Link>
            <Link
              href="/become-a-coach"
              className="font-menu text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Become a coach
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
              <Button asChild>
                <Link href={dashboardUrl}>Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
