"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "collect", title: "1. Information We Collect" },
    { id: "use", title: "2. How We Use Your Information" },
    { id: "share", title: "3. How We Share Your Information" },
    { id: "rights", title: "4. Your Rights and Choices" },
    { id: "security", title: "5. Data Security" },
    { id: "changes", title: "6. Changes to This Policy" },
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
                Privacy Policy
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Your privacy is important to us. Learn how we collect, use, and
                protect your information.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
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
                    On this page
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
                    Nebula ("we," "us," or "our") is committed to protecting
                    your privacy. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use
                    our platform and services. Please read this policy
                    carefully. If you do not agree with the terms of this
                    privacy policy, please do not access the site.
                  </p>

                  <Separator className="my-8" />

                  <section id="collect" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      1. Information We Collect
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      We may collect information about you in a variety of ways.
                      The information we may collect on the Site includes:
                    </p>

                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Personal Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Personally identifiable information, such as your
                          name, email address, and telephone number, and
                          demographic information, such as your age, gender,
                          hometown, and interests, that you voluntarily give to
                          us when you register with the Site or when you choose
                          to participate in various activities related to the
                          Site, such as online chat and message boards.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Derivative Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Information our servers automatically collect when you
                          access the Site, such as your IP address, your browser
                          type, your operating system, your access times, and
                          the pages you have viewed directly before and after
                          accessing the Site.
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator className="my-8" />

                  <section id="use" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      2. How We Use Your Information
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Having accurate information about you permits us to
                      provide you with a smooth, efficient, and customized
                      experience. Specifically, we may use information collected
                      about you via the Site to:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Create and manage your account.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Email you regarding your account or order.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Enable user-to-user communications.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Generate a personal profile about you to make future
                        visits to the Site more personalized.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Monitor and analyze usage and trends to improve your
                        experience with the Site.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Notify you of updates to the Site.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Offer new products, services, and/or recommendations to
                        you.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Request feedback and contact you about your use of the
                        Site.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="share" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      3. How We Share Your Information
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      We may share information we have collected about you in
                      certain situations. Your information may be disclosed as
                      follows:
                    </p>

                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">
                          By Law or to Protect Rights
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          If we believe the release of information about you is
                          necessary to respond to legal process, to investigate
                          or remedy potential violations of our policies, or to
                          protect the rights, property, and safety of others, we
                          may share your information as permitted or required by
                          any applicable law, rule, or regulation.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">
                          Third-Party Service Providers
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We may share your information with third parties that
                          perform services for us or on our behalf, including
                          payment processing, data analysis, email delivery,
                          hosting services, customer service, and marketing
                          assistance.
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  <Separator className="my-8" />

                  <section id="rights" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      4. Your Rights and Choices
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      You have certain rights regarding your personal
                      information. You may at any time review or change the
                      information in your account or terminate your account by:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Logging into your account settings and updating your
                        account.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Contacting us using the contact information provided
                        below.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="security" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      5. Data Security
                    </h2>
                    <p className="text-muted-foreground">
                      We use administrative, technical, and physical security
                      measures to help protect your personal information. While
                      we have taken reasonable steps to secure the personal
                      information you provide to us, please be aware that
                      despite our efforts, no security measures are perfect or
                      impenetrable, and no method of data transmission can be
                      guaranteed against any interception or other type of
                      misuse.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="changes" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      6. Changes to This Policy
                    </h2>
                    <p className="text-muted-foreground">
                      We reserve the right to make changes to this Privacy
                      Policy at any time and for any reason. We will alert you
                      about any changes by updating the "Last updated" date of
                      this Privacy Policy. You are encouraged to periodically
                      review this Privacy Policy to stay informed of updates.
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
