import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

function NebulaLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#059669" />
      <path
        d="M22.6641 22V12.625H18.8418V22H22.6641ZM15.8223 18.2578C16.0547 17.207 16.5938 16.3867 17.4414 15.7969C18.2891 15.1953 19.3477 14.8945 20.6172 14.8945V11.1641C19.3223 11.1641 18.0918 11.3867 16.9258 11.8311C15.7598 12.2754 14.9395 12.9395 14.4648 13.8223H14.2812V10H10.459V22H14.2812V18.2578H15.8223Z"
        fill="white"
      />
    </svg>
  );
}

export function ContactCard() {
  const t = useTranslations("dashboard.student");

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
          <Button variant="outline" size="lg">
            <Phone className="mr-2 h-5 w-5" />
            {t("scheduleCall")}
          </Button>
          <Button size="lg">{t("getRecommendations")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
