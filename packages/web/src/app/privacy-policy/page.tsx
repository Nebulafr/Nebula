 
"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield } from "lucide-react";

import { useTranslations, useLocale } from "next-intl";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacyPolicy");
  const locale = useLocale();

  const sections = [
    { id: "collect", title: t("sections.collect.title") },
    { id: "use", title: t("sections.use.title") },
    { id: "share", title: t("sections.share.title") },
    { id: "rights", title: t("sections.rights.title") },
    { id: "security", title: t("sections.security.title") },
    { id: "changes", title: t("sections.changes.title") },
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
                  <Shield className="h-6 w-6 text-primary" />
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
                  <p className="text-lg text-muted-foreground">
                    {t("intro")}
                  </p>

                  <Separator className="my-8" />

                  <section id="collect" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.collect.title")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("sections.collect.p1")}
                    </p>

                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">
                          {t("sections.collect.personalData.title")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("sections.collect.personalData.description")}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">
                          {t("sections.collect.derivativeData.title")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("sections.collect.derivativeData.description")}
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator className="my-8" />

                  <section id="use" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.use.title")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("sections.use.p1")}
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item1")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item2")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item3")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item4")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item5")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item6")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item7")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.use.item8")}
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="share" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.share.title")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("sections.share.p1")}
                    </p>

                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">
                          {t("sections.share.byLaw.title")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("sections.share.byLaw.description")}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">
                          {t("sections.share.thirdParties.title")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("sections.share.thirdParties.description")}
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator className="my-8" />

                  <section id="rights" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.rights.title")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("sections.rights.p1")}
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.rights.item1")}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {t("sections.rights.item2")}
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="security" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.security.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.security.p1")}
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="changes" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      {t("sections.changes.title")}
                    </h2>
                    <p className="text-muted-foreground">
                      {t("sections.changes.p1")}
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
