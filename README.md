# Chassis car explorer

Chassis is an independent car-discovery and ownership site: https://v8sl-grg.github.io/v8sl/ . It includes a responsive film-led homepage, a curated India-market car directory, public reference profiles, image/video links, ownership planners, private service notes and official vehicle-service links.

## Run locally on Windows

1. Open the `chassis-site` folder and double-click **Start Chassis.cmd**.
2. Keep the terminal window open. It prints the local address to open in Chrome or Edge.
3. If the chosen address is already busy, the launcher selects an available port and prints the correct address.
4. To stop the local server, focus the terminal and press **Ctrl+C**.

Node.js 18 or later is required. The launcher uses Node's built-in modules; no package install is needed. Do not start a second copy of the server on the same port.

## Car information and coverage

- Search only uses the editable `vehicle-data.js` India-market directory. If a make or model is not in that directory, the page returns no car result and does not send that text to Wikipedia.
- The directory covers many current and discontinued makes/models, but is curated and not exhaustive or an official live catalogue. Model-year ranges are indicative; verify the exact year and variant with the manufacturer.
- For listed cars, the page can request public Wikipedia/Wikidata references and Wikimedia Commons photos when available. Their data may be incomplete or refer to another year, trim or market. Source links and attributions are shown when returned.
- Photo scan downloads TensorFlow.js COCO-SSD to the browser and checks locally for the object class `car`. The image is not uploaded. The model cannot identify make, model, trim or year; after detecting a car, visitors select a directory entry to open its reference profile. A photo with no detected car returns `invalid input`. Detection is a visual aid, not a safety or identity verification.
- The included `assets/1.jpg`, `assets/2.jpg` and `assets/3.jpg` remain available for the three bundled reference profiles.

## Films and display

The hero uses these relative paths: `assets/videos/bmw-7-series.mp4`, `assets/videos/mercedes-s-class.mp4` and `assets/videos/chassis-film.mp4`. Keep the `assets/videos` folder beside `index.html`. The current clip continues until it ends or the visitor selects Prev/Next. The liquid-glass film controls include a visible Next button. The video fills the hero frame with a centered cover crop, with a soft sampled ambient glow behind it. Dark mode is the default; the theme button switches to light mode and remembers the choice in that browser.

## Vehicle services and pricing display

- Vehicle Checkpoint does not check a registration number against government systems. The Personal Garage saves cars and their registration numbers in the current browser's local storage, only on that device; the user must open eChallan and enter the number there to check it. Chassis does not monitor challans, transmit registration numbers, or send challan alerts. Cross-device sync requires a secure authenticated backend. The displayed ₹250 report amount is indicative only and no charge is collected.

Service notes and reminders are saved only in the current browser using local storage. They are personal notes, not verified service records. Reminder alerts can fire while the site is open if browser notification permission is granted; the browser cannot promise alerts while closed. Resale search opens current marketplace results on CarDekho, CarWale, CARS24 and Spinny with the selected make/model/year/city in the query. Chassis does not scrape listing prices or photos. A range is calculated only from comparable low/high prices the visitor enters. EMI and mileage values use the visitor's inputs and are not lender offers or official efficiency data.

Personal Garage, service notes and reminders persist in the same browser on the same device. Listing drafts and their uploaded images are stored in IndexedDB in that browser. Clearing site data, using a different browser/profile/device, or storage restrictions can remove or hide these records. They are not backed up to GitHub and are not synced between users.

Listing drafts include make/model/year dropdowns and multiple exterior, interior and odometer photos. They remain private in the current browser; no marketplace listing is published and no buyer-interest alerts can be sent until an authenticated marketplace backend is connected.

## YouTube videos

Direct creator videos and thumbnails use a site-wide key injected by GitHub Actions from the repository Actions secret named `YOUTUBE_BROWSER_API_KEY`. The key must be a Google Cloud browser key with YouTube Data API v3 enabled and HTTP referrer restrictions for `https://v8sl-grg.github.io/*` (and any local development address you use). Browser keys are visible to site visitors, so never use an unrestricted or server key. If no valid key was added or the API is disabled/quota-limited, the page shows creator search links instead; no website code can activate a missing/invalid Google Cloud key. Thumbnail URLs fall back through YouTube's standard sizes when a preferred size is unavailable. YouTube determines whether captions are available.

## Features requiring a backend before public launch

GitHub Pages only serves static files. Exact image make/model recognition, private accounts and cross-device sync, registration-based challan/insurance monitoring, public listing publication and interest alerts require an authenticated backend, provider-approved API access, consent and secret storage. Do not place server credentials in this public repository or browser JavaScript. The current site does not claim those connections are active.

## Publish

The source repository is https://github.com/v8sl-grg/v8sl . GitHub Actions publishes the `main` branch to GitHub Pages. The static site uses relative paths so it works at the repository Pages URL and from a local server. Keep GitHub Pages set to **GitHub Actions** as its publishing source.

## External services

- [VAHAN vehicle services](https://vahan.parivahan.gov.in/vahanservice/)
- [eChallan](https://echallan.parivahan.gov.in/index/accused-challan)
- [IRDAI list of general insurers](https://irdai.gov.in/list-of-general-insurers)
- [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

