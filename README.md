# Velocitrak car explorer

Velocitrak is an independent car-discovery and ownership website: <https://v8sl-grg.github.io/v8sl/>. GitHub Actions publishes the repository's `main` branch to GitHub Pages.

The homepage shows all 12 feature links in a fixed liquid-glass navigation bar. Choosing a feature opens an accessible panel in the same page; the browser stays on the same URL.

## Features available on the site

- Search the curated India-market vehicle directory, including searches that start with a model year. Coverage is not exhaustive; confirm model year, variant and specifications with manufacturer sources.
- Explore Wikipedia/Wikidata public vehicle references, with a direct Wikidata fallback when an exact Wikipedia model page is missing. Specs remain model-family facts unless a manufacturer source identifies the exact India variant.
- View sourced Commons photographs only when the file matches the car make/model category and has camera metadata or an explicit photography category. Cabin matches must also identify an interior view in the file title. If a match does not pass those checks, the gallery stays empty rather than showing unrelated artwork or a nearby model.
- Use the loan and mileage planners with values you provide.
- Open direct Spinny model pages and model-specific searches on other used-car marketplaces; compare asking prices you enter. Velocitrak does not scrape or verify marketplace listings.
- Save garage details, service notes, reminders and private listing drafts in the current browser profile. Listing photos use that browser's IndexedDB. Data does not sync across devices and can be lost if browser site data is cleared.
- Open official eChallan, VAHAN and IRDAI-listed insurer pages for manual checks. Velocitrak does not retrieve challan, RTO or insurance records.
- Review the service-history revenue model: ₹250 is an illustrative sample fee only. There is no report provider, checkout, payment gateway or transaction connected; no money is charged or collected.

## Features intentionally removed or inactive

- Photo scanning and car identification have been removed.
- Firebase sign-in and cross-device sync are not active.
- Public user listings, buyer interest, cloud photo storage and push notifications are not offered.
- Live challan, insurance, registration and service-history lookups are not connected. Use the official providers directly.

The project remains in no-billing mode. No service account key or payment details are used by GitHub Pages.

## Run locally on Windows

1. Extract the ZIP, open the extracted folder, and double-click **Start Chassis.cmd**.
2. Keep the terminal window open and use the local address it prints.
3. If the address is busy, the launcher chooses an available port and prints it.
4. Press **Ctrl+C** in the terminal window to stop the server.

Node.js 18 or later is required for the local static server. The website itself requires no package installation.

## Media and YouTube

The hero slideshow uses `assets/videos/bmw-7-series.mp4`, `assets/videos/mercedes-s-class.mp4` and `assets/videos/chassis-film.mp4`. A separate muted film loops in the decorative home gallery from `assets/videos/defender-dakar-2026.mp4`, beside `assets/velocitrak-decor-1.jpeg` and `assets/velocitrak-decor-2.jpeg`. Keep these relative paths beside `index.html`. Hero films play to their end unless the viewer chooses Prev or Next.

YouTube search uses the restricted browser API key injected by the GitHub Pages workflow. The latest deployment confirmed that the key works for the Velocitrak site referrer. Results are cached in each browser for repeat searches. Because the key is used by a public website, it is visible to visitors and restricted to the GitHub Pages referrer and YouTube Data API v3. API quota, internet access, or a thumbnail host can still be temporarily unavailable; in that case, the site keeps clearly labeled search previews and direct Faisal Khan/MotorOctane search links instead of blank image boxes.
## Publish

GitHub Actions publishes `main` to GitHub Pages with relative asset paths. The static site does not require a Firebase project or billing account.

## Official services

- [VAHAN vehicle services](https://vahan.parivahan.gov.in/vahanservice/)
- [eChallan](https://echallan.parivahan.gov.in/index/accused-challan)
- [IRDAI-listed general insurers](https://irdai.gov.in/list-of-general-insurers)

