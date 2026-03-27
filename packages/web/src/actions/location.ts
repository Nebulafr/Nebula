"use server";

interface LocationApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const FALLBACK_COUNTRIES = [
  { name: "United States", iso2: "US" },
  { name: "United Kingdom", iso2: "GB" },
  { name: "Canada", iso2: "CA" },
  { name: "Australia", iso2: "AU" },
  { name: "Germany", iso2: "DE" },
  { name: "France", iso2: "FR" },
  { name: "Nigeria", iso2: "NG" },
  { name: "India", iso2: "IN" },
  { name: "Brazil", iso2: "BR" },
  { name: "Japan", iso2: "JP" },
];

export async function getCountries(): Promise<LocationApiResponse<any[]>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,capital,cca2",
      {
        method: "GET",
        signal: controller.signal,
        // @ts-ignore
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.statusText}`);
    }

    const data = await response.json();

    const allCountries = data.map((c: any) => ({
      name: c.name.common,
      iso2: c.cca2,
      capital: c.capital?.[0] || null,
    }));

    return {
      success: true,
      data: allCountries.sort((a: any, b: any) => a.name.localeCompare(b.name)),
    };
  } catch (error: any) {
    console.warn("getCountries failed or timed out, using fallback:", error.message);
    return {
      success: true,
      data: FALLBACK_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }
}
