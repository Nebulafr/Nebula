import Image from "next/image";
import { companyList } from "@/lib/images/companies";

export function CompanyLogosSection() {
  const allLogos = [...companyList, ...companyList];

  return (
    <section className="py-12 bg-muted">
      <div className="container text-center">
        <p className="text-lg text-muted-foreground">Some of our coaches work here</p>
        <div className="relative mt-8 marquee-container overflow-hidden">
          <div className="flex items-center animate-marquee">
            {allLogos.map((company, index) => (
              <div key={index} className="flex-shrink-0 mx-4" style={{ minWidth: '150px' }}>
                <Image src={company.logo} alt={company.name} width={100} height={40} className="object-contain rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
