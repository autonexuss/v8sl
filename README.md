# Chassis car explorer

Chassis is a responsive car-discovery and ownership prototype, published at https://v8sl-grg.github.io/v8sl/. It includes the three supplied car photos, a searchable starter catalogue, live Wikipedia/Wikidata reference details, model-related Wikimedia Commons image galleries with attribution/license links, video search, buying calculators, private browser-only service notes and reminders, and official VAHAN/eChallan links.

## Start it on Windows

1. Create a normal folder named `chassis-site` and extract the ZIP contents into it. You should see `index.html`, `Start Chassis.cmd` and the `assets` folder directly inside it.
2. Install Node.js 18 or newer if it is not already installed.
3. Open the `chassis-site` folder and double-click **Start Chassis.cmd**.
4. Leave the black window open. It prints the exact local address, for example `http://127.0.0.1:4173`.
5. Open that printed address in Chrome or Edge. If a port is already in use, the launcher picks another one and prints it.
6. To stop the local site, return to the black window and press **Ctrl+C**.

No package installation is required. The local server uses Node's built-in modules. A network connection is needed for online reference previews and external search links.

## Search and data coverage

- Search any make or model name. A Wikipedia article can provide a long overview and linked Wikidata record; Wikidata contributes any structured power, torque, displacement, speed, dimensions, range, mass or manufacturer values it contains. Missing values remain missing.
- Model-related exterior and interior images are searched from Wikimedia Commons at query time. Each image links to its file page and displays the available creator and license information. The match may be a different year, generation or trim; Commons results can also be empty.
- The online lookup is best-effort. A result can refer to a similar name rather than the exact model year, trim or market. Check manufacturer sources before relying on details.
- Wikipedia/Wikidata are reference sources, not a complete car-specification feed. Chassis does not copy or scrape CarDekho pages, inventory, reviews or prices.
- Filters and side-by-side model comparison use the included starter catalogue. They do not compare every model on the internet.
- Prices, variant tables, dealer inventory, offers, valuation, insurance quotes and vehicle-history records are not live feeds. India-wide data requires a licensed provider API and a server-side account/key. No secret key is bundled in the website, and no provider credentials have been created.
- Photo matching is only an illustrative reference. Selecting an image previews it in your browser; there is no AI scan or upload.
- Channel-focused YouTube search links work without a key. To show individual videos with their real thumbnails and direct watch links in the local app, configure a YouTube Data API key as `YOUTUBE_API_KEY` on the server. GitHub Pages is static and cannot run this private-key-backed endpoint; it therefore shows channel search links until a separate backend is deployed. Never put a private API key in browser JavaScript or a public repository.
- Registration and challan links open the official [VAHAN](https://vahan.parivahan.gov.in/vahanservice/) and [eChallan](https://echallan.parivahan.gov.in/index/accused-challan) services. Chassis does not read their results or submit user details.

## Put the site on the public internet

The project includes a GitHub Pages workflow at `.github/workflows/deploy.yml`. The public site is deployed at https://v8sl-grg.github.io/v8sl/ and its source repository is https://github.com/v8sl-grg/v8sl. GitHub Pages serves the static website and its photos without a Node server. The public copy calls Wikimedia's cross-origin APIs for article references, structured facts and Commons images. The optional YouTube Data API endpoint runs only with the local Node server; a separate protected backend is required to enable it on the public site.

To publish changes later, commit them to the repository's `main` branch. The included GitHub Actions workflow republishes the site. GitHub Pages settings should stay set to **GitHub Actions**.

GitHub's setup steps are documented in its [Pages publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). A custom domain is optional.

## What works in the site

- Search known catalogue entries or arbitrary make/model names and open a longer public-reference profile.
- View a structured specification table, output-scale graphics and Commons interior/exterior photo results when public source data exists.
- Filter 26 included models by make, body style and fuel type; compare included models.
- Browse the three supplied photos and their explicitly unverified reference profiles.
- Estimate a loan EMI and view a clearly labeled depreciation illustration.
- Prepare a private used-car listing draft; nothing is posted automatically.
- Open map searches for dealers, EV charging, fuel or service centres.
- Save service notes and reminders in this browser's local storage. They are not synced.
- Open CarDekho's new-car, used-car, comparison, offers, valuation, dealer, EV charging and fuel-price sections. These links open CarDekho; they do not connect its data to Chassis.
- Open official government links for VAHAN and eChallan. Sensitive details should only be entered on the official portals.

## Optional YouTube Data API for direct video links and thumbnails

1. Create a Google Cloud project and enable [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com).
2. Create an API key restricted to the YouTube Data API v3. Keep the key server-side; when deploying a backend, restrict it to the backend's IP or provider as appropriate.
3. In PowerShell, set the key for that terminal and start the local server:

   ```powershell
   $env:YOUTUBE_API_KEY = "your-key"
   node .\server.mjs
   ```

The API returns individual video IDs, creator/channel names, thumbnail URLs and direct watch links. Chassis displays the thumbnail as a clickable link to that video. Never put a private key in `app.js`, `features.js` or `index.html`. API quotas and terms apply. GitHub Pages cannot run this private endpoint by itself; deploy the Node endpoint to a backend and keep the key in that host's secret settings before enabling individual videos on the public site.

## Included assets and independent status

Keep `assets/1.jpg`, `assets/2.jpg` and `assets/3.jpg` beside the HTML file. The hero and photo profiles use those relative paths. Chassis is an independent concept and is not affiliated with CarDekho, Wikipedia, the named manufacturers, video creators or government agencies.

