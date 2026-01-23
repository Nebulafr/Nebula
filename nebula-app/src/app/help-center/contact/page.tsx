"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from "@/lib/images/placeholder-images";
import { ArrowLeft, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function ContactPage() {
  const contactImage = PlaceHolderImages.find(
    (img) => img.id === "about-story",
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="w-full min-h-[calc(100vh-7rem)] lg:grid lg:grid-cols-2">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[450px] gap-6">
              <Card className="border-none shadow-none">
                <CardHeader className="p-0 text-left">
                  <Link
                    href="/help-center"
                    className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Help Center
                  </Link>
                  <CardTitle className="text-3xl font-bold text-primary">
                    Contact Us
                  </CardTitle>
                  <CardDescription>
                    We're excited to explore how we can work together. Please
                    fill out the form below.
                  </CardDescription>
                </CardHeader>
                <form>
                  <CardContent className="grid gap-4 p-0 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input id="full-name" placeholder="John Doe" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@example.edu"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="university">
                        University / Institution
                      </Label>
                      <Input
                        id="university"
                        placeholder="Example University"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us a bit about your institution and what you're looking for..."
                        required
                        rows={5}
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Send Message <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </div>
          </div>
          <div className="relative hidden h-full bg-muted lg:block">
            {contactImage && (
              <Image
                src={contactImage.imageUrl}
                alt={contactImage.description}
                fill
                className="object-cover"
                data-ai-hint={contactImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-4xl font-bold">
                Let's Build the Future Together
              </h2>
              <p className="mt-2 max-w-lg">
                Partner with us to create powerful learning experiences for your
                students.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
