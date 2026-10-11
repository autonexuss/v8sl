# Chassis car explorer

Chassis is an independent car-discovery and ownership website: <https://v8sl-grg.github.io/v8sl/>. The source of truth is the public GitHub repository `v8sl-grg/v8sl`; GitHub Actions publishes its `main` branch to GitHub Pages.

## Run locally on Windows

1. Open the `chassis-site` folder and double-click **Start Chassis.cmd**.
2. Keep the terminal open and use the local address printed there.
3. If that address is busy, the launcher picks a free port and prints the new address. Do not start a second server on the same port.
4. Press **Ctrl+C** in the server window to stop it.

Node.js 18 or later is required for the static local server. No package install is needed for the website itself.

## Website features and limits

- Search is limited to the curated India-market directory in `vehicle-data.js`; it does not search arbitrary web pages or non-car results. Its entries and year windows are editorial, not an official live vehicle catalogue.
- Profiles use public Wikipedia/Wikidata references, Wikimedia Commons images when available, source links and YouTube creator results. A source may describe a different generation, trim or market; confirm exact details with the manufacturer.
- The photo section has two paths. Signed-in, verified users on a configured Firebase deployment send a compressed copy to the authenticated `identifyCar` function. Google Cloud Vision checks vehicle labels and logos and searches related public web matches. It can suggest a make/model clue but cannot certify a car's exact identity. Chassis does not save the scan photo. Signed-out visitors use the existing on-device car/not-car detector and select a profile manually.
- The Vision function requires authentication, checks verified email, limits an account to 5 scans per day and the whole site to 500 scans per month. It calls label, logo and web detection; Google bills each requested feature separately. The site cap cannot account for other Vision use already made in the same Google project.
- A verified account syncs the owner's garage registration numbers, personal service notes and reminders to Firestore. Data is scoped by Firebase UID and protected by the included Firestore rules. If a local device has not been associated with another account, its existing private lists are copied into the first account signed into that browser. Local-only drafts still work when Firebase is not configured.
- Listing photos are stored in Firebase Storage for signed-in users. A listing stays private unless its owner checks **Publish this listing publicly**. A published listing shows its vehicle details and photos, but not the owner's email or registration number. A buyer must sign in and confirm before their account email is shared with the seller; the seller can see buyer interest in their account and can opt into push notifications.
- Reminders can alert while the site is open. Due-date push alerts while it is closed require a deployed scheduled function, verified account, browser notification permission, Web Push VAPID configuration and an enabled device. The schedule sends due reminders at 9:00 AM India time.
- The account menu includes a confirmed delete action for the account's synced garage, notes, reminders, notification tokens, listing photos, listings and Firebase Auth account. A fresh sign-in within five minutes is required.
- Chassis has no authorized government connection for live challan, RTO or insurance status. Personal Garage opens official eChallan for manual checking; it does not monitor vehicles or auto-pay. Insurance status/renewal also needs an authorized provider. Do not represent these lookups as active.
- The service-history notes are user-entered, not workshop-verified records. Resale search opens marketplace searches; it does not scrape current offers. Loan and mileage planners calculate from the values entered.

## Configure Firebase and Cloud Vision

Firebase is optional for the static site, but account sync, cloud image matching, public listings and push notifications remain unavailable until the following is configured. The current source contains no project secrets or service-account credentials.

1. In the correct Google account, create/select a Firebase project and register a **Web app**. Enable Email/Password sign-in, create a Firestore database, set up Firebase Storage and enable Cloud Messaging. Add `v8sl-grg.github.io` to Firebase Authentication's authorized domains.
2. Copy the Firebase Web App configuration into `firebase-config.js`. Add the Web Push certificate's public VAPID key to `vapidKey`. This web-app config is visible in the browser; it is not a server credential. Restrict its Google browser key to `https://v8sl-grg.github.io/*` and the Firebase APIs it needs. Never put service-account JSON, private keys or Vision credentials in this file or the public repository.
3. Enable the Cloud Vision API for the same project. The deployed function uses its Google-managed runtime identity rather than a browser key; that identity needs permission to call Vision. Google Cloud billing may be required for Cloud Functions and scheduled notifications. The included monthly scan cap limits Chassis calls; it does not control charges from unrelated project use.
4. The repository includes default-deny `firestore.rules` and `storage.rules`, Firebase function source, and a GitHub deployment workflow. Deploying requires GitHub repository **Actions variables**:
   - `FIREBASE_PROJECT_ID`
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`
   - `GCP_FIREBASE_DEPLOYER_SERVICE_ACCOUNT`

   Configure Google Workload Identity Federation so only this GitHub repository can impersonate a narrowly scoped deployer service account. Do not create or store a downloadable service-account key. Once those variables and project services are ready, pushes affecting Firebase files deploy the functions and rules automatically. A manual run is available from **Actions → Deploy Chassis Firebase services**.

The Firebase workflow is intentionally skipped when those three repository variables are missing. GitHub Pages still deploys the static site, with device-local behavior. Enabling the Firebase workflow may create Cloud Functions and Cloud Scheduler resources; costs depend on project usage and Google Cloud's current prices.

## Firebase/Google Cloud costs

Google currently lists the first 1,000 monthly units of each Cloud Vision feature as free, then lists Label Detection at $1.50, Logo Detection at $1.50 and Web Detection at $3.50 per 1,000 units in the next tier. Each feature requested on an image is a separate unit. Cloud Functions, Cloud Scheduler, Firestore and Storage can have separate charges; project-wide usage and billing terms apply. Review Google's [Cloud Vision pricing](https://cloud.google.com/vision/pricing) and the relevant Firebase pricing before enabling billing. These prices can change.

## Videos, assets and YouTube

The hero's relative paths are `assets/videos/bmw-7-series.mp4`, `assets/videos/mercedes-s-class.mp4` and `assets/videos/chassis-film.mp4`. Keep the video directory beside `index.html`. Films continue to the end unless the visitor uses Prev/Next. The dark/light preference is stored in the current browser.

YouTube results use `YOUTUBE_BROWSER_API_KEY` in GitHub Actions as a restricted browser key. Public browser keys are visible to visitors; restrict the key to the Chassis referrer and YouTube Data API v3. If the key/API is unavailable, the site falls back to creator search links. Do not put service credentials in website code.

## Publish

GitHub Actions publishes `main` to Pages with relative assets. Keep GitHub Pages' publishing source set to **GitHub Actions**. The Pages workflow publishes the site even when the optional Firebase deployment workflow is skipped.

## Official vehicle links

- [VAHAN vehicle services](https://vahan.parivahan.gov.in/vahanservice/)
- [eChallan](https://echallan.parivahan.gov.in/index/accused-challan)
- [IRDAI-listed general insurers](https://irdai.gov.in/list-of-general-insurers)
- [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
