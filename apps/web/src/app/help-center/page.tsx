 
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

import { useTranslations } from "next-intl";

export default function HelpCenterPage() {
  const t = useTranslations("helpCenter");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "FAQs",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      id: "gettingStarted",
      icon: <Smile className="h-5 w-5" />,
      title: t("catItems.gettingStarted.title"),
      description: t("catItems.gettingStarted.description"),
    },
    {
      id: "account",
      icon: <Settings className="h-5 w-5" />,
      title: t("catItems.account.title"),
      description: t("catItems.account.description"),
    },
    {
      id: "billing",
      icon: <CreditCard className="h-5 w-5" />,
      title: t("catItems.billing.title"),
      description: t("catItems.billing.description"),
    },
    {
      id: "programs",
      icon: <BookOpen className="h-5 w-5" />,
      title: t("catItems.programs.title"),
      description: t("catItems.programs.description"),
    },
    {
      id: "events",
      icon: <Calendar className="h-5 w-5" />,
      title: t("catItems.events.title"),
      description: t("catItems.events.description"),
    },
    {
      id: "troubleshooting",
      icon: <LifeBuoy className="h-5 w-5" />,
      title: t("catItems.troubleshooting.title"),
      description: t("catItems.troubleshooting.description"),
    },
    {
      id: "guidelines",
      icon: <ShieldCheck className="h-5 w-5" />,
      title: t("catItems.guidelines.title"),
      description: t("catItems.guidelines.description"),
    },
    {
      id: "faqs",
      icon: <HelpCircle className="h-5 w-5" />,
      title: t("catItems.faqs.title"),
      description: t("catItems.faqs.description"),
    },
  ];

  const faqData: { [key: string]: { question: string; answer: string }[] } = {
    [t("catItems.gettingStarted.title")]: [
      {
        question: t("faqs.gettingStarted.0.question"),
        answer: t("faqs.gettingStarted.0.answer"),
      },
      {
        question: t("faqs.gettingStarted.1.question"),
        answer: t("faqs.gettingStarted.1.answer"),
      },
    ],
    [t("catItems.account.title")]: [
      {
        question: t("faqs.account.0.question"),
        answer: t("faqs.account.0.answer"),
      },
      {
        question: t("faqs.account.1.question"),
        answer: t("faqs.account.1.answer"),
      },
    ],
    [t("catItems.billing.title")]: [
      {
        question: t("faqs.billing.0.question"),
        answer: t("faqs.billing.0.answer"),
      },
      {
        question: t("faqs.billing.1.question"),
        answer: t("faqs.billing.1.answer"),
      },
    ],
    [t("catItems.programs.title")]: [
      {
        question: t("faqs.programs.0.question"),
        answer: t("faqs.programs.0.answer"),
      },
      {
        question: t("faqs.programs.1.question"),
        answer: t("faqs.programs.1.answer"),
      },
      {
        question: t("faqs.programs.2.question"),
        answer: t("faqs.programs.2.answer"),
      },
      {
        question: t("faqs.programs.3.question"),
        answer: t("faqs.programs.3.answer"),
      },
    ],
    [t("catItems.events.title")]: [
      {
        question: t("faqs.events.0.question"),
        answer: t("faqs.events.0.answer"),
      },
    ],
    [t("catItems.troubleshooting.title")]: [],
    [t("catItems.guidelines.title")]: [],
  };

  const allFaqs = Object.values(faqData).flat();
  faqData[t("catItems.faqs.title")] = allFaqs;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCategory(t("catItems.faqs.title"));
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
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto mt-8 flex max-w-xl items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  className="h-14 rounded-full pl-12"
                  value={searchTerm || ""}
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
              <h2 className="text-lg font-semibold mb-4">{t("categories")}</h2>
              <nav>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.id}>
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
                        {t("contactSupport")}
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
                      {t("notSelected")}
                    </h3>
                    <p className="max-w-xs mt-1 text-sm">
                      {t("notSelectedDesc")}
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
                        {t("noResults")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-2xl p-8 text-center mt-16">
                <h2 className="font-headline text-3xl">{t("stillNeedHelp")}</h2>
                <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
                  {t("stillNeedHelpDesc")}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" className="w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {t("chatWithUs")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent border-border"
                  >
                    {t("emailSupport")}
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
