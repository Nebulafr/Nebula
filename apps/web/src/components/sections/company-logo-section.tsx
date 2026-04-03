"use client";

import Image from "next/image";
import { companyList } from "@/lib/images/companies";
import { useTranslations } from "next-intl";

export function CompanyLogosSection() {
  const t = useTranslations("companies");

  return (
    <section className="py-12">
      <div className="container text-center">
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        <div
          className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"
        >
          <div
            className="flex items-center gap-12 w-max animate-marquee hover:[animation-play-state:paused]"
            style={{
              willChange: "transform",
            }}
          >
            {/* First set of logos */}
            {companyList.map((company, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 px-8">
                <div className="relative h-12 w-40">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    fill
                    className="object-contain transition-all duration-500"
                    sizes="160px"
                  />
                </div>
              </div>
            ))}
            {/* Second set of logos for seamless loop */}
            {companyList.map((company, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 px-8" aria-hidden="true">
                <div className="relative h-12 w-40">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    fill
                    className="object-contain transition-all duration-500"
                    sizes="160px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
