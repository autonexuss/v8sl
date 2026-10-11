# Chassis car explorer

Chassis is an independent car-discovery and ownership website: <https://v8sl-grg.github.io/v8sl/>. The source of truth is the public GitHub repository `v8sl-grg/v8sl`; GitHub Actions publishes its `main` branch to GitHub Pages.

## Run locally on Windows

1. Open the `chassis-site` folder and double-click **Start Chassis.cmd**.
2. Keep the terminal open and use the local address printed there.
3. If that address is busy, the launcher picks a free port and prints the new address. Do not start a second server on the same port.
4. Press **Ctrl+C** in the server window to stop it.

Node.js 18 or later is required for the static local server. No package install is needed for the website itself.

## No-billing mode

The live GitHub Pages site works without a billing account or payment details. Its current Firebase web config is blank, so the site does not connect to Firebase or send vehicle data to Google Cloud.

- Car search uses the curated India-market directory in `vehicle-data.js`; it does not search arbitrary web pages or non-car results. Profiles use public Wikipedia/Wikidata references, Wikimedia Commons images when available, source links and YouTube creator results. Confirm exact variant and specification with the manufacturer.
- Photo scan uses an on-device detector to tell whether a photo appears to contain a car. It cannot identify the exact make, model, trim or year; the user selects a profile manually. The photo stays in the browser.
- Garage, service notes and reminders are saved in the current browser profile. Listing drafts and their photos are stored in that browser's IndexedDB. They persist across reloads on that device, but are not synced to another device and can be removed if browser data is cleared.
- Browser reminder alerts work while the site is open and the user has allowed notifications. Alerts while the site is closed are not available in no-billing mode.
- Public listings with uploaded photos, buyer alerts, server-side account deletion and automatic government lookups are not active.
- Chassis has no authorized government connection for live challan, RTO or insurance status. Its links open official services for manual checking; it does not monitor vehicles or auto-pay.
- Service-history notes are user-entered, not workshop-verified records. Resale search opens marketplace searches; it does not scrape current offers. Loan and mileage planners calculate from the values entered.

## Firebase setup without billing

Firebase's Spark plan does not require payment information and includes no-cost Firebase products and Firestore usage quotas. The Firebase project is not yet confirmed as activated, and `firebase-config.js` is blank, so account sign-in and cross-device sync are not live.

To prepare the free-tier data path after Firebase Console access is available:

1. Add Firebase to the existing Google Cloud project and register a Web app.
2. Enable Email/Password sign-in, create the default Cloud Firestore database, and add `v8sl-grg.github.io` to Authentication's authorized domains.
3. Put the public Firebase Web App configuration in `firebase-config.js`. This config is visible in the browser; restrict its API key to the Chassis site and the APIs it needs. Never put service-account JSON, private keys or Vision credentials in the public repository.
4. The GitHub Actions workflow can deploy `firestore.rules` only. Repository Actions variables are `FIREBASE_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and `GCP_FIREBASE_DEPLOYER_SERVICE_ACCOUNT`. The workflow uses GitHub OIDC; do not create or store a downloadable service-account key.

The Firebase Console currently reports an error while loading Terms status and says the project does not exist or the account cannot list its apps. Firebase activation and Firestore sync therefore remain blocked until the Console issue is resolved. Do not treat the existing function source as deployed.

## Features that require a billing account

These cloud services are excluded from the no-billing workflow:

- Cloud Functions for Firebase requires the Blaze pay-as-you-go plan. It is used by the current source for Cloud Vision scanning, scheduled reminder notifications, buyer-interest notifications and server-side account cleanup.
- Cloud Storage for Firebase requires Blaze to create or access a storage bucket. It is used by the current source for cloud listing photos.
- Cloud Vision setup requires billing to be enabled, even though the API has a limited free usage tier. The on-device detector remains available without it.

Adding a billing account changes the project to a pay-as-you-go plan and can create charges if usage exceeds free quotas. Do not enable these services unless the project owner chooses to add billing. See Google's current [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [Cloud Functions FAQ](https://firebase.google.com/docs/functions/faq-and-troubleshooting), [Cloud Storage billing requirements](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), and [Cloud Vision setup](https://docs.cloud.google.com/vision/docs/setup).

## Videos, assets and YouTube

The hero's relative paths are `assets/videos/bmw-7-series.mp4`, `assets/videos/mercedes-s-class.mp4` and `assets/videos/chassis-film.mp4`. Keep the video directory beside `index.html`. Films continue to the end unless the visitor uses Prev/Next. The dark/light preference is stored in the current browser.

YouTube results use `YOUTUBE_BROWSER_API_KEY` in GitHub Actions as a restricted browser key. Public browser keys are visible to visitors; restrict the key to the Chassis referrer and YouTube Data API v3. If the key/API is unavailable, the site falls back to creator search links. Do not put service credentials in website code.

## Publish

GitHub Actions publishes `main` to Pages with relative assets. Keep GitHub Pages' publishing source set to **GitHub Actions**. The Pages workflow publishes the static site independently of the optional Firestore-rules workflow.

## Official vehicle links

- [VAHAN vehicle services](https://vahan.parivahan.gov.in/vahanservice/)
- [eChallan](https://echallan.parivahan.gov.in/index/accused-challan)
- [IRDAI-listed general insurers](https://irdai.gov.in/list-of-general-insurers)
- [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
