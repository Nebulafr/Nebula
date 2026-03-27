"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";

import { useTranslations, useLocale } from "next-intl";
import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  const t = useTranslations("termsOfService");
  const locale = useLocale();

  const sections = [
    { id: "acceptance", title: t("sections.acceptance.title") },
    { id: "accounts", title: t("sections.accounts.title") },
    { id: "responsibilities", title: t("sections.responsibilities.title") },
    { id: "ip", title: t("sections.ip.title") },
    { id: "termination", title: t("sections.termination.title") },
    { id: "disclaimers", title: t("sections.disclaimers.title") },
    { id: "liability", title: t("sections.liability.title") },
    { id: "governing", title: t("sections.governing.title") },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 border-b">
          <div className="container py-16 md:py-24">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("subtitle")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("lastUpdated", {
                  date: new Date().toLocaleDateString(
                    locale === "fr" ? "fr-FR" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  ),
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Sidebar Navigation */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                    {t("onThisPage")}
                  </h3>
                  <nav className="space-y-2">
                    {sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-lg text-muted-foreground">{t("intro")}</p>

                  <Separator className="my-8" />

                  <section id="acceptance" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.acceptance.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.acceptance.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="accounts" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.accounts.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.accounts.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="responsibilities" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.responsibilities.title")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("sections.responsibilities.p1")}
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.responsibilities.item1")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.responsibilities.item2")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.responsibilities.item3")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.responsibilities.item4")}
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="ip" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.ip.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.ip.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="termination" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.termination.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.termination.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="disclaimers" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.disclaimers.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.disclaimers.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="liability" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.liability.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.liability.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="governing" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.governing.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.governing.p1")}
                    </p>
                  </section>
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
