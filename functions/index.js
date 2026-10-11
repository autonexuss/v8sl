const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const vision = require('@google-cloud/vision');

initializeApp();
const db = getFirestore();
const visionClient = new vision.ImageAnnotatorClient();
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_SCANS_PER_USER_DAY = 5;
const MAX_SCANS_PER_MONTH = 500;

function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
}

async function reserveVisionQuota(uid) {
  const today = dayKey();
  const month = today.slice(0, 7);
  const userRef = db.doc(`visionUsage/${month}/users/${uid}`);
  const globalRef = db.doc(`visionUsage/${month}`);
  await db.runTransaction(async transaction => {
    const [userSnapshot, globalSnapshot] = await Promise.all([
      transaction.get(userRef), transaction.get(globalRef)
    ]);
    const userData = userSnapshot.data() || {};
    const globalData = globalSnapshot.data() || {};
    const userCount = userData.day === today ? Number(userData.count || 0) : 0;
    const globalCount = Number(globalData.count || 0);
    if (userCount >= MAX_SCANS_PER_USER_DAY) {
      throw new HttpsError('resource-exhausted', 'You have used today’s photo-scan allowance. Try again tomorrow.');
    }
    if (globalCount >= MAX_SCANS_PER_MONTH) {
      throw new HttpsError('resource-exhausted', 'The monthly photo-scan allowance is reached. Please try again next month.');
    }
    transaction.set(userRef, { day: today, count: userCount + 1 }, { merge: true });
    transaction.set(globalRef, { count: globalCount + 1, month }, { merge: true });
  });
}

exports.identifyCar = onCall({
  region: 'asia-south1',
  maxInstances: 2,
  memory: '512MiB',
  timeoutSeconds: 30
}, async request => {
  if (!request.auth || request.auth.token.email_verified !== true) {
    throw new HttpsError('unauthenticated', 'Sign in with a verified email before using cloud photo identification.');
  }
  const encoded = request.data?.imageBase64;
  if (typeof encoded !== 'string' || encoded.length < 100 || encoded.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 16) {
    throw new HttpsError('invalid-argument', 'Choose a supported photo smaller than 8 MB.');
  }
  const imageBytes = Buffer.from(encoded, 'base64');
  if (imageBytes.length > MAX_IMAGE_BYTES) throw new HttpsError('invalid-argument', 'Choose a photo smaller than 8 MB.');
  await reserveVisionQuota(request.auth.uid);

  try {
    const [result] = await visionClient.annotateImage({
      image: { content: imageBytes },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 15 },
        { type: 'LOGO_DETECTION', maxResults: 8 },
        { type: 'WEB_DETECTION', maxResults: 12 }
      ]
    });
    const labels = (result.labelAnnotations || []).map(item => ({
      text: item.description || '', score: Number(item.score || 0)
    }));
    const logos = (result.logoAnnotations || []).map(item => ({
      text: item.description || '', score: Number(item.score || 0)
    }));
    const web = result.webDetection || {};
    const webEntities = (web.webEntities || []).map(item => ({
      text: item.description || '', score: Number(item.score || 0)
    })).filter(item => item.text);
    const bestGuesses = (web.bestGuessLabels || []).map(item => item.label || '').filter(Boolean);
    const webMatches = (web.pagesWithMatchingImages || []).slice(0, 5).map(item => ({
      title: item.pageTitle || 'Matching image page', url: item.url || ''
    })).filter(item => /^https:\/\//i.test(item.url));
    const carTerms = /\b(car|automobile|motor vehicle|sports car|sedan|suv|hatchback|coupe|convertible|station wagon|limousine)\b/i;
    const isCar = labels.some(item => carTerms.test(item.text) && item.score >= 0.4)
      || webEntities.some(item => carTerms.test(item.text) && item.score >= 0.5)
      || bestGuesses.some(item => carTerms.test(item));
    return {
      isCar,
      labels,
      logos,
      webEntities,
      bestGuesses,
      webMatches,
      note: 'Cloud Vision provides visual clues and web matches, not a verified vehicle identity. Confirm the make, model, year and variant against manufacturer sources.'
    };
  } catch (error) {
    console.error('Vision annotation failed', { code: error?.code || 'unknown' });
    throw new HttpsError('unavailable', 'Photo identification is temporarily unavailable. No photo was saved.');
  }
});

exports.deleteMyChassisAccount = onCall({
  region: 'asia-south1',
  maxInstances: 1,
  timeoutSeconds: 120
}, async request => {
  if (!request.auth || request.auth.token.email_verified !== true) {
    throw new HttpsError('unauthenticated', 'Sign in with your verified email before deleting your account.');
  }
  const authTime = Number(request.auth.token.auth_time || 0);
  if (Date.now() / 1000 - authTime > 5 * 60) {
    throw new HttpsError('failed-precondition', 'Sign out and sign in again, then retry account deletion.');
  }
  const uid = request.auth.uid;
  try {
    const ownedListings = await db.collection('publicListings').where('ownerUid', '==', uid).get();
    for (const listing of ownedListings.docs) await db.recursiveDelete(listing.ref);
    const sentInterest = await db.collectionGroup('interest').where('fromUid', '==', uid).get();
    await Promise.all(sentInterest.docs.map(item => item.ref.delete()));
    await db.recursiveDelete(db.doc(`users/${uid}`));
    await getStorage().bucket().deleteFiles({ prefix: `users/${uid}/` });
    await getAuth().deleteUser(uid);
    return { deleted: true };
  } catch (error) {
    console.error('Account deletion failed', { uid, code: error?.code || 'unknown' });
    throw new HttpsError('internal', 'Chassis could not finish deleting the account data. Contact support before creating a new account.');
  }
});

async function tokensFor(uid) {
  const snapshot = await db.collection(`users/${uid}/deviceTokens`).get();
  return snapshot.docs.map(document => document.data().token).filter(Boolean);
}

exports.notifyListingInterest = onDocumentCreated({
  document: 'publicListings/{listingId}/interest/{buyerUid}',
  region: 'asia-south1',
  maxInstances: 2
}, async event => {
  const listingSnapshot = await db.doc(`publicListings/${event.params.listingId}`).get();
  if (!listingSnapshot.exists || listingSnapshot.data().status !== 'published') return;
  const listing = listingSnapshot.data();
  const tokens = await tokensFor(listing.ownerUid);
  if (!tokens.length) return;
  await getMessaging().sendEachForMulticast({
    tokens,
    data: {
      title: 'Someone is interested in your Chassis listing',
      body: `${listing.year} ${listing.make} ${listing.model} · open Chassis to view their contact details`,
      link: 'https://v8sl-grg.github.io/v8sl/#ownership-tools'
    },
    webpush: { fcmOptions: { link: 'https://v8sl-grg.github.io/v8sl/#ownership-tools' } }
  });
});

exports.notifyDueReminders = onSchedule({
  schedule: 'every day 09:00',
  timeZone: 'Asia/Kolkata',
  region: 'asia-south1',
  maxInstances: 1
}, async () => {
  const today = dayKey();
  const due = await db.collectionGroup('privateData')
    .where('kind', '==', 'reminders')
    .get();
  for (const document of due.docs) {
    const uid = document.ref.parent.parent?.id;
    if (!uid) continue;
    const items = Array.isArray(document.data().items) ? document.data().items : [];
    const ready = items.filter(item => item.date <= today && !item.notified);
    if (!ready.length) continue;
    const tokens = await tokensFor(uid);
    if (!tokens.length) continue;
    await document.ref.set({
      kind: 'reminders',
      items: items.map(item => item.date <= today ? { ...item, notified: true } : item),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    const response = await getMessaging().sendEachForMulticast({
      tokens,
      data: {
        title: 'A Chassis reminder is due',
        body: ready.slice(0, 3).map(item => `${item.type}${item.title ? ` · ${item.title}` : ''}`).join(' / '),
        link: 'https://v8sl-grg.github.io/v8sl/#private-reminders'
      },
      webpush: { fcmOptions: { link: 'https://v8sl-grg.github.io/v8sl/#private-reminders' } }
    });
    const invalid = [];
    response.responses.forEach((result, index) => {
      if (!result.success && ['messaging/invalid-registration-token', 'messaging/registration-token-not-registered'].includes(result.error?.code)) invalid.push(tokens[index]);
    });
    if (invalid.length) {
      const refs = await db.collection(`users/${uid}/deviceTokens`).where('token', 'in', invalid.slice(0, 10)).get();
      await Promise.all(refs.docs.map(item => item.ref.delete()));
    }
  }
});
