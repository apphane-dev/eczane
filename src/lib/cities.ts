export interface CityDefinition {
  /** URL-safe identifier, also used as the data file name (src/data/<slug>.json). */
  slug: string;
  /** Display name of the province. */
  name: string;
  /** Source page to scrape for on-duty pharmacy listings. */
  sourceUrl: string;
}

export const cities: CityDefinition[] = [
  {
    slug: "antalya",
    name: "Antalya",
    sourceUrl: "https://www.antalyaeo.org.tr/tr/nobetci-eczaneler",
  },
];

export function getCity(slug: string): CityDefinition | undefined {
  return cities.find((city) => city.slug === slug);
}
