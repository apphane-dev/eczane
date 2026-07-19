# Nöbetçi Eczane

A static site listing on-duty ("nöbetçi") pharmacies in Turkish provinces, built
with [Astro](https://astro.build). Pharmacy data is scraped daily from official
provincial chamber of pharmacists pages and committed as static JSON, so the
deployed site needs no backend.

The scraping approach (selectors, parsing logic) is ported from the earlier
Gleam implementation on this repository's `main` branch, a scraper for the same
Antalya source page using headless Chrome. This version uses a plain `fetch` +
[cheerio](https://cheerio.js.org/) instead, since the source pages turned out
to be server-rendered and don't require JS execution.

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

`.github/workflows/deploy.yml` builds the site and deploys `dist/` to Cloudflare
Pages (project `eczane`) via `cloudflare/wrangler-action@v3`. It runs on push to
`main` and can be triggered manually via `workflow_dispatch`. The workflow does
not run the scraper — pharmacy data is committed to the repo, so the site builds
from whatever JSON is currently in `src/data/`.

Pharmacy data is refreshed on a host machine by running `scripts/update-data.sh`,
which re-scrapes `antalya`, commits any changes under `src/data/`, and pushes to
`origin main`. Schedule it with cron, for example daily at 06:17:

```
17 6 * * * /path/to/repo/scripts/update-data.sh
```

Each push then triggers the Cloudflare Pages deploy above.

## Adding a city

1. Add an entry to `src/lib/cities.ts` with a `slug`, display `name`, and the
   province's on-duty pharmacy source URL.
2. Inspect the source page's HTML and adjust the selectors in
   `scripts/scrape.ts` if the markup differs from Antalya's (`.ilce`,
   `.ilcebas`, `.nobetciDiv` structure).
3. Run `npm run scrape -- <slug>` and verify `src/data/<slug>.json` looks
   correct (plausible pharmacy count, mostly non-null coordinates).
4. If you want the host-side refresh to cover the new city, add a corresponding
   `npm run scrape -- <slug>` line to `scripts/update-data.sh`.
