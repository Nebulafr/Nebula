 
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, ContactFormData } from "@/lib/validations";
import { submitContactForm } from "./actions";

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
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

export default function ContactPage() {
  const t = useTranslations("contact");
  const router = useRouter();
  const contactImage = PlaceHolderImages.find(
    (img) => img.id === "about-story",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);

      if (result.success) {
        toast.success(t("successMessage") || "Message sent successfully!");
        reset();
      } else {
        toast.error(result.error || t("errorMessage") || "Failed to send message.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="w-full min-h-[calc(100vh-7rem)] lg:grid lg:grid-cols-2">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[450px] gap-6">
              <Card className="border-none shadow-none">
                <CardHeader className="p-0 text-left">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("backToHelp")}
                  </button>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {t("title")}
                  </CardTitle>
                  <CardDescription>
                    {t("description")}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CardContent className="grid gap-4 p-0 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="full-name">{t("fields.fullName")}</Label>
                        <Input
                          id="full-name"
                          placeholder={t("fields.fullNamePlaceholder")}
                          className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
                          {...register("fullName")}
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName.message}</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">{t("fields.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("fields.emailPlaceholder")}
                          className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="university">
                        {t("fields.university")}
                      </Label>
                      <Input
                        id="university"
                        placeholder={t("fields.universityPlaceholder")}
                        className={errors.university ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register("university")}
                      />
                      {errors.university && (
                        <p className="text-sm text-destructive">{errors.university.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">{t("fields.message")}</Label>
                      <Textarea
                        id="message"
                        placeholder={t("fields.messagePlaceholder")}
                        rows={5}
                        className={errors.message ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <span>{t("send")}</span> <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
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
                quality={85}
                className="object-cover"
                data-ai-hint={contactImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h2 className="text-4xl font-bold">
                {t("futureTitle")}
              </h2>
              <p className="mt-2 max-w-lg">
                {t("futureDesc")}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
