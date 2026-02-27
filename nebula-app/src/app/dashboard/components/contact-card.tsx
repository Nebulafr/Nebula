/* eslint-disable */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { logos } from "@/lib/images/logos";
import { PopupModal } from "react-calendly";
import { useState, useEffect } from "react";

function NebulaLogo() {
  return (
    <div className="h-10 w-10 relative">
      <Image
        src={logos.nebulaLogo}
        alt="Nebula Logo"
        fill
        className="object-cover"
      />
    </div>
  );
}

export function ContactCard() {
  const t = useTranslations("dashboard.student");
  const [isOpen, setIsOpen] = useState(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Ensure we are on the client and document is available
    if (typeof window !== "undefined" && document.body) {
      setRootElement(document.body);
    }
  }, []);

  return (
    <Card className="rounded-xl border">
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="hidden sm:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <NebulaLogo />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {t("notSureWhereToStart")}
            </h3>
            <p className="text-muted-foreground mt-1">
              {t("getPersonalizedRecs")}
            </p>
          </div>
        </div>
        <div className="flex gap-4 flex-shrink-0">
          <Button variant="outline" size="lg" onClick={() => setIsOpen(true)}>
            <Phone className="mr-2 h-5 w-5" />
            {t("scheduleCall")}
          </Button>
          <Button size="lg">{t("getRecommendations")}</Button>
        </div>
      </CardContent>
      {rootElement && (
        <PopupModal
          url={
            process.env.NEXT_PUBLIC_CALENDLY_URL ||
            "https://calendly.com/masudndatsu/30min"
          }
          onModalClose={() => setIsOpen(false)}
          open={isOpen}
          rootElement={rootElement}
        />
      )}
    </Card>
  );
}
