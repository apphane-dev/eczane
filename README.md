# Nöbetçi Eczane

A static site listing on-duty ("nöbetçi") pharmacies in Turkish provinces, built
with [Astro](https://astro.build). Pharmacy data is scraped daily from official
provincial chamber of pharmacists pages and committed as static JSON, so the
deployed site needs no backend.

Prior art / credit: the scraping approach (selectors, parsing logic) is ported
from [guria/eczaneleri](https://github.com/guria/eczaneleri), a Gleam scraper
for the same Antalya source page using headless Chrome. This project uses a
plain `fetch` + [cheerio](https://cheerio.js.org/) instead, since the source
pages turned out to be server-rendered and don't require JS execution.

## Project structure

```
src/
  data/          scraped CityData JSON, one file per city (e.g. antalya.json)
  lib/
    cities.ts    registry of known cities (slug, name, source URL)
    types.ts     Pharmacy / CityData contract shared with the UI
  pages/         Astro pages (UI is owned separately from the scraper)
scripts/
  scrape.ts      scraper entrypoint, run per city
```

## Commands

| Command                    | Action                                             |
| :-------------------------- | :-------------------------------------------------- |
| `npm install`                | Install dependencies                                |
| `npm run scrape -- <slug>`   | Scrape a city (e.g. `npm run scrape -- antalya`) and write `src/data/<slug>.json` |
| `npm run dev`                 | Start local dev server                              |
| `npm run build`               | Build the static site to `./dist/`                  |
| `npm run preview`             | Preview the production build locally                |

## Deployment

`.github/workflows/deploy.yml` scrapes all configured cities, builds the site,
and deploys it to GitHub Pages. It runs on push to `main`, on a daily cron
(`23 3 * * *` UTC) to keep pharmacy data fresh, and can be triggered manually
via `workflow_dispatch`.

## Adding a city

1. Add an entry to `src/lib/cities.ts` with a `slug`, display `name`, and the
   province's on-duty pharmacy source URL.
2. Inspect the source page's HTML and adjust the selectors in
   `scripts/scrape.ts` if the markup differs from Antalya's (`.ilce`,
   `.ilcebas`, `.nobetciDiv` structure).
3. Run `npm run scrape -- <slug>` and verify `src/data/<slug>.json` looks
   correct (plausible pharmacy count, mostly non-null coordinates).
4. Add the new slug to the scrape step in
   `.github/workflows/deploy.yml`.
