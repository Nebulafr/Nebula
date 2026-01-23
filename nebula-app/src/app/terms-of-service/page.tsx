"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "accounts", title: "2. User Accounts" },
    { id: "responsibilities", title: "3. User Responsibilities" },
    { id: "ip", title: "4. Intellectual Property" },
    { id: "termination", title: "5. Termination" },
    { id: "disclaimers", title: "6. Disclaimers" },
    { id: "liability", title: "7. Limitation of Liability" },
    { id: "governing", title: "8. Governing Law" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 border-b">
          <div className="container py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Please read these terms carefully before using our platform.
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
                    Welcome to Nebula! These Terms of Service ("Terms") govern
                    your use of our website, platform, and services
                    (collectively, the "Services"). Please read these Terms
                    carefully before using our Services.
                  </p>

                  <Separator className="my-8" />

                  <section id="acceptance" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      1. Acceptance of Terms
                    </h2>
                    <p className="text-muted-foreground">
                      By accessing or using our Services, you agree to be bound
                      by these Terms and our Privacy Policy. If you do not agree
                      to these Terms, you may not use our Services. We may
                      modify these Terms at any time, and such modification will
                      be effective upon posting on this page.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="accounts" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      2. User Accounts
                    </h2>
                    <p className="text-muted-foreground">
                      To access certain features of our Services, you may be
                      required to create an account. You are responsible for
                      maintaining the confidentiality of your account
                      information and for all activities that occur under your
                      account. You agree to notify us immediately of any
                      unauthorized use of your account.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="responsibilities" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      3. User Responsibilities
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      You agree to use our Services only for lawful purposes.
                      You are responsible for your own conduct and
                      communications while using our Services and for any
                      consequences thereof. You agree not to:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Use the Services for any fraudulent or unlawful purpose.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Post or transmit any content that is abusive,
                        defamatory, obscene, or otherwise objectionable.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Infringe on the intellectual property rights of others.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        Interfere with or disrupt the Services or servers or
                        networks connected to the Services.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="ip" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      4. Intellectual Property
                    </h2>
                    <p className="text-muted-foreground">
                      All content and materials available on Nebula, including
                      but not limited to text, graphics, website name, code,
                      images, and logos, are the intellectual property of Nebula
                      and are protected by applicable copyright and trademark
                      law. Any inappropriate use, including but not limited to
                      the reproduction, distribution, display, or transmission
                      of any content on this site is strictly prohibited, unless
                      specifically authorized by Nebula.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="termination" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      5. Termination
                    </h2>
                    <p className="text-muted-foreground">
                      We may terminate or suspend your access to our Services at
                      any time, without prior notice or liability, for any
                      reason whatsoever, including without limitation if you
                      breach the Terms. Upon termination, your right to use the
                      Services will immediately cease.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="disclaimers" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      6. Disclaimers
                    </h2>
                    <p className="text-muted-foreground">
                      Our Services are provided "as is" and "as available"
                      without any warranties of any kind, either express or
                      implied. Nebula does not warrant that the Services will be
                      uninterrupted, error-free, or free of viruses or other
                      harmful components.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="liability" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      7. Limitation of Liability
                    </h2>
                    <p className="text-muted-foreground">
                      In no event shall Nebula, nor its directors, employees,
                      partners, agents, suppliers, or affiliates, be liable for
                      any indirect, incidental, special, consequential, or
                      punitive damages, including without limitation, loss of
                      profits, data, use, goodwill, or other intangible losses,
                      resulting from your access to or use of or inability to
                      access or use the Services.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="governing" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold mb-4">
                      8. Governing Law
                    </h2>
                    <p className="text-muted-foreground">
                      These Terms shall be governed and construed in accordance
                      with the laws of the jurisdiction in which our company is
                      based, without regard to its conflict of law provisions.
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
