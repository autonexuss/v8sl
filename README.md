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
- The image-upload area only previews a photo in the browser; it does not identify a car or upload the image.
- The included `assets/1.jpg`, `assets/2.jpg` and `assets/3.jpg` remain available for the three bundled reference profiles.

## Films and display

The hero uses these relative paths: `assets/videos/bmw-7-series.mp4`, `assets/videos/mercedes-s-class.mp4` and `assets/videos/chassis-film.mp4`. Keep the `assets/videos` folder beside `index.html`. The current clip continues until it ends or the visitor selects Prev/Next. The liquid-glass film controls include a visible Next button. The video fills the hero frame with a centered cover crop, with a soft sampled ambient glow behind it. Dark mode is the default; the theme button switches to light mode and remembers the choice in that browser.

## Vehicle services and pricing display

Entering a registration number in the Vehicle Checkpoint only reveals links to official services. The number stays in the page and is not sent, saved or used for a lookup. Challan status, insurance expiry, RTO records, renewal and payments are not connected. The site links to official VAHAN/eChallan and the IRDAI list of general insurers so visitors can continue with the responsible service provider. The displayed ₹250 report amount is indicative only and no charge is collected. A real report or renewal flow requires authorized data/insurance partners, consent, a secure backend and a payment partner; never claim a status result until those integrations are active.

Service notes and reminders are saved only in the current browser using local storage. They are personal notes, not verified service records. EMI, mileage and resale values are user-entered illustrations; they are not lender offers, official mileage values or live valuations.

## YouTube videos

Without an API key, creator links lead to YouTube searches. To use direct video results and thumbnails, enable YouTube Data API v3 and use a browser key restricted to that API and the Chassis site referrer. The GitHub Pages workflow can inject the optional site-wide key from the repository Actions secret named `YOUTUBE_BROWSER_API_KEY`; browser keys are visible to site visitors, so keep the HTTP referrer and API restrictions enabled. Never put an unrestricted or server key in client-side code. YouTube determines whether captions are available.

## Publish

The source repository is https://github.com/v8sl-grg/v8sl . GitHub Actions publishes the `main` branch to GitHub Pages. The static site uses relative paths so it works at the repository Pages URL and from a local server. Keep GitHub Pages set to **GitHub Actions** as its publishing source.

## External services

- [VAHAN vehicle services](https://vahan.parivahan.gov.in/vahanservice/)
- [eChallan](https://echallan.parivahan.gov.in/index/accused-challan)
- [IRDAI list of general insurers](https://irdai.gov.in/list-of-general-insurers)
- [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

