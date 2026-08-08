# Nöbetçi Eczane

A static site listing on-duty ("nöbetçi") pharmacies in Turkish provinces, built
with [Astro](https://astro.build). Pharmacy data is scraped daily from official
provincial chamber of pharmacists pages into static JSON, so the deployed site
needs no backend.

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

There are two deploy workflows, both deploying `dist/` to Cloudflare Pages
(project `eczane`) via `wrangler`:

- **`.github/workflows/deploy.yml`** runs on push to `main` and on
  `workflow_dispatch`. It builds and deploys only — it does not run the scraper,
  so the site builds from whatever JSON is currently committed in `src/data/`.

- **`.github/workflows/update-data.yml`** runs daily (and on `workflow_dispatch`).
  It scrapes fresh data into the working tree, builds, and deploys — all without
  committing. The daily refresh therefore produces no commits on `main`; the
  `src/data/*.json` files committed to the repo act only as a build-time
  baseline.

Both workflows use the same `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`
secrets. To update the committed baseline (e.g. after adding a city), run
`npm run scrape -- <slug>` locally and commit the resulting file under
`src/data/`.

## Adding a city

1. Add an entry to `src/lib/cities.ts` with a `slug`, display `name`, and the
   province's on-duty pharmacy source URL.
2. Inspect the source page's HTML and adjust the selectors in
   `scripts/scrape.ts` if the markup differs from Antalya's (`.ilce`,
   `.ilcebas`, `.nobetciDiv` structure).
3. Run `npm run scrape -- <slug>` and verify `src/data/<slug>.json` looks
   correct (plausible pharmacy count, mostly non-null coordinates).
4. If you want the daily CI refresh to cover the new city, add a corresponding
   `npm run scrape -- <slug>` line to `.github/workflows/update-data.yml`.
