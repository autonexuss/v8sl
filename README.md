# Velocitrak

Velocitrak is an independent car-discovery and ownership website: <https://v8sl-grg.github.io/v8sl/>. GitHub Actions publishes the `main` branch to GitHub Pages. This project is a static site and does not require Firebase or billing to serve its current features.

## Homepage and 3D feature panels

The homepage combines a four-film hero slideshow, editorial car photographs and a dedicated EV charging artwork section. A white **Get started** control scrolls to the main 3D feature tiles. The page has seven general tools and a separate five-tile personal ownership collection. Model assets are stored under `assets/models/` and loaded through the locally bundled `<model-viewer>` component and Draco decoder.

Each tile opens only its matching feature in an accessible same-page panel. Use **Close**, the Escape key, or the dimmed background to dismiss it. The slideshow has Previous, Next and mute controls; it advances when a video ends or when the viewer selects Next/Previous or clicks/taps the playing video. Its four supplied WebM files are `assets/videos/video1.webm` through `video4.webm`; they are copied without transcoding. The separate small Defender editorial film continues to loop independently.

The large `assets/editorial/gtavmap.jpg` image is illustrative fictional-city artwork. The EV search asks for an area and opens a Google Maps search; it does not display verified charging locations or station availability inside Velocitrak.

## Car search and tools

- The car search uses a curated India-market directory. Coverage is not exhaustive. Variant, model year and specifications should be verified against the linked manufacturer source.
- Vehicle photos are shown only when public image metadata matches the searched make/model and the requested view. If a reliable match is unavailable, the gallery can remain empty instead of substituting an unrelated image.
- YouTube results depend on the configured browser API key, quota, network and image hosts. Direct search links and a labeled fallback remain available when thumbnails cannot load. A browser API key is visible to visitors and must be restricted to the website referrer and the YouTube Data API.
- Loan and mileage planners calculate from values entered by the visitor. Resale links open marketplace searches; Velocitrak does not scrape, verify or guarantee the individual ads.
- Personal garage, reminders, service notes and listing drafts are saved in the current browser profile. They do not sync across devices. Browser alerts are available only while the site is open.
- Challan, insurance, RTO and vehicle registration records are not retrieved. Links lead to the relevant official services for manual checks.
- Service-report and payment screens are previews only. The ₹250 amount is illustrative; no report provider, checkout, payment gateway or transaction is connected, and no money is collected.

## Temporary developer gate

The current site includes the temporary developer-code screen requested for this preview. It is a client-side convenience gate, not real security: website files and the gate logic are public to anyone who can access the site. Remove the marked gate block and `dev-lock.css`/`dev-lock.js` references from `index.html` to restore direct access.

## Run locally on Windows

1. Install Node.js 18 or later.
2. Extract the project and double-click **Start Velocitrak.cmd**.
3. Keep the terminal open and use the local address it prints. Do not open `index.html` directly with `file://`, because browsers restrict local modules and 3D assets.
4. Press **Ctrl+C** in the terminal to stop the local server.

No npm package installation is required for the static website.

## Assets and publishing

The WebM videos, GLB models, supplied map artwork and editorial photos are stored beside the site using relative paths. The new media files are served as static GitHub Pages assets. The uploads did not include license documents for all third-party photos/models; check those rights before commercial use.

GitHub Actions publishes `main` to GitHub Pages. Check the latest Actions run and the deployed site before treating a change as live. Do not put private credentials in HTML, JavaScript or Git history.

## Official services

- [VAHAN vehicle services](https://vahan.parivahan.gov.in/vahanservice/)
- [eChallan](https://echallan.parivahan.gov.in/index/accused-challan)
- [IRDAI-listed general insurers](https://irdai.gov.in/list-of-general-insurers)
