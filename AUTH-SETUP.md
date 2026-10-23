# Firebase email sign-in setup for Autonexus

The site uses Firebase Authentication's free email/password provider. Firebase sends an email verification **link**; it does not send a numeric OTP in this setup. No payment is needed for basic email/password sign-in. Account data is kept by Firebase Authentication; garage entries and renewal dates stay in the visitor's browser.

## 1. Create a Firebase project and web app

1. Open the [Firebase console](https://console.firebase.google.com/) and create a project on the no-cost Spark plan.
2. In Project overview, add a Web app named `Autonexus`.
3. Open **Project settings → General → Your apps** and copy the web configuration values.

## 2. Turn on email/password sign-in

1. In Firebase, open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Open **Authentication → Settings → Authorized domains** and add `autonexuss.github.io`.
4. In **Authentication → Templates**, confirm the verification-email and password-reset templates are enabled and use your preferred sender name.

## 3. Add the public web config

Edit [firebase-config.js](firebase-config.js) in the repository. Replace the blank values under `globalThis.CHASSIS_FIREBASE_CONFIG` with the values from the Web app:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

The Autonexus account flow needs `apiKey`, `authDomain`, `projectId`, and `appId`. Keep the other fields from the copied config if present. The `vapidKey` field is for separate push-notification features and is not needed for email sign-in.

The Firebase web config and browser API key are public client settings. Do **not** put a service-account JSON file, private key, SMTP password, or other server secret in this repository. Firebase Authentication handles the user's password.

## 4. Publish and verify

Commit and push the config to the repository's `main` branch. After GitHub Pages deploys, open the site and select a Pro feature:

- Create an account with a name, email, and password (at least 8 characters).
- Open the verification link in the email.
- Return to Autonexus and choose **I've verified — refresh**.
- Sign in later from the Pro access panel. **My Profile** appears in the top bar after sign-in.
- Use **Forgot password?** to send a password-reset link.

The Firebase SDK loads only after account initialization is needed. No Firebase Storage, Firestore, Cloud Functions, payment gateway, or Google Maps key is required for this basic account flow. Referral-code access remains a separate browser-session feature.

## Free-plan note

Firebase plan features and quotas can change. Check the current [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans) before enabling additional services. The account feature described here uses Firebase Authentication only.
