/**
 * On-duty pharmacy scraper.
 *
 * Usage: npm run scrape -- <city-slug>
 *
 * Ports the parsing logic from the prior art at
 * https://github.com/guria/eczaneleri (a Gleam scraper of the same source
 * pages using headless Chrome). A plain `fetch` + cheerio was verified to be
 * sufficient here -- the on-duty pharmacy list is server-rendered HTML, no
 * client-side JS rendering is required.
 */
import * as cheerio from "cheerio";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCity } from "../src/lib/cities.ts";
import type { CityData, Pharmacy } from "../src/lib/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../src/data");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const GOOGLE_MAPS_COORDS_RE =
  /maps\.google\.com\/maps\?q=([\d.-]+),([\d.-]+)/;

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, "");
  return digits.length > 0 ? digits : null;
}

function parseCoordinates(
  href: string | undefined,
): { lat: number; lng: number } | null {
  if (!href) return null;
  const match = href.match(GOOGLE_MAPS_COORDS_RE);
  if (!match) return null;
  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.text();
}

function parsePharmacies(html: string, province: string): Pharmacy[] {
  const $ = cheerio.load(html);
  const pharmacies: Pharmacy[] = [];

  $(".ilce").each((_, ilceEl) => {
    const district = $(ilceEl).find(".ilcebas").first().text().trim();

    $(ilceEl)
      .find(".nobetciDiv")
      .each((_, card) => {
        const $card = $(card);

        const name = $card
          .find("div:first-child > div > a:first-child")
          .first()
          .text()
          .trim();

        const rawPhone = $card
          .find("div:first-child > div > a:last-child")
          .first()
          .text()
          .trim();
        const phone = rawPhone ? normalizePhone(rawPhone) : null;

        const address = $card
          .find("div:last-child > div")
          .first()
          .text()
          .trim();

        const href = $card
          .find("div:last-child > div > a")
          .first()
          .attr("href");
        const coordinates = parseCoordinates(href);

        if (!name) return;

        pharmacies.push({
          name,
          address,
          phone,
          province,
          district,
          coordinates,
        });
      });
  });

  return pharmacies;
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npm run scrape -- <city-slug>");
    console.error(
      `Known cities: ${(await import("../src/lib/cities.ts")).cities
        .map((c) => c.slug)
        .join(", ")}`,
    );
    process.exit(1);
  }

  const city = getCity(slug);
  if (!city) {
    console.error(`Unknown city slug: "${slug}"`);
    process.exit(1);
  }

  console.log(`Fetching ${city.sourceUrl} ...`);
  const html = await fetchHtml(city.sourceUrl);

  const pharmacies = parsePharmacies(html, city.name);
  const withCoords = pharmacies.filter((p) => p.coordinates !== null).length;
  console.log(
    `Parsed ${pharmacies.length} pharmacies (${withCoords} with coordinates) across ${
      new Set(pharmacies.map((p) => p.district)).size
    } districts.`,
  );

  if (pharmacies.length === 0) {
    throw new Error(
      "No pharmacies were parsed -- the page structure may have changed.",
    );
  }

  const cityData: CityData = {
    province: city.name,
    updatedAt: new Date().toISOString(),
    pharmacies,
  };

  await mkdir(DATA_DIR, { recursive: true });
  const outPath = path.join(DATA_DIR, `${city.slug}.json`);
  await writeFile(outPath, JSON.stringify(cityData, null, 2) + "\n", "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
