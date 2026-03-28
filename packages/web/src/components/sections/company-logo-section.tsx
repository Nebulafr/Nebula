"use client";
/* eslint-disable */

import Image from "next/image";
import { companyList } from "@/lib/images/companies";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function CompanyLogosSection() {
  const t = useTranslations("companies");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Duplicate the content for seamless looping
    const scrollerInner = scroller.querySelector(".scroller-inner");
    if (!scrollerInner) return;

    // Check if already duplicated
    if (scrollerInner.getAttribute("data-cloned") === "true") return;

    const scrollerContent = Array.from(scrollerInner.children);
    scrollerContent.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      scrollerInner.appendChild(clone);
    });

    scrollerInner.setAttribute("data-cloned", "true");
    setIsReady(true);
  }, []);

  return (
    <section className="py-12">
      <div className="container text-center">
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        <div
          ref={scrollerRef}
          className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"
        >
          {mounted && (
            <div
              className={`scroller-inner flex items-center gap-8 w-max ${isReady ? "animate-scroll" : ""
                }`}
              style={{
                willChange: "transform",
              }}
            >
              {companyList.map((company, index) => (
                <div key={index} className="flex-shrink-0 px-8">
                  <div className="relative h-10 w-32">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className="object-contain transition-all duration-300"
                      sizes="128px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
