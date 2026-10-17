const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/12.4.0';
const config = globalThis.CHASSIS_FIREBASE_CONFIG || {};
const configured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
let currentUser = null;
let app;
let authApi;
let dbApi;
let storageApi;
let functionsApi;
let cloudReady = false;

function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function validUser() {
  if (!currentUser) throw new Error('Sign in to a verified Autonexus account to sync across devices.');
  if (!currentUser.emailVerified) throw new Error('Verify your email address before using cloud sync.');
  return currentUser;
}

async function initialize() {
  if (!configured) {
    emit('chassis-cloud-ready', { enabled: false, message: 'Cloud sync is not configured yet. Local saving still works on this device.' });
    return;
  }
  try {
    const [appModule, authModule, firestoreModule, storageModule, functionsModule] = await Promise.all([
      import(`${FIREBASE_SDK}/firebase-app.js`),
      import(`${FIREBASE_SDK}/firebase-auth.js`),
      import(`${FIREBASE_SDK}/firebase-firestore.js`),
      import(`${FIREBASE_SDK}/firebase-storage.js`),
      import(`${FIREBASE_SDK}/firebase-functions.js`)
    ]);
    app = appModule.initializeApp(config);
    authApi = { ...authModule };
    dbApi = { ...firestoreModule };
    storageApi = { ...storageModule };
    functionsApi = { ...functionsModule };
    const auth = authModule.getAuth(app);
    dbApi.db = firestoreModule.getFirestore(app);
    storageApi.storage = storageModule.getStorage(app);
    functionsApi.functions = functionsModule.getFunctions(app, 'asia-south1');
    authModule.onAuthStateChanged(auth, user => {
      if (currentUser?.uid !== user?.uid) stopSubscriptions();
      currentUser = user;
      emit('chassis-auth-change', { user: user ? { uid: user.uid, email: user.email, emailVerified: user.emailVerified } : null });
    });
    cloudReady = true;
    emit('chassis-cloud-ready', { enabled: true, message: 'Cloud sync is ready. Sign in to use your account on other devices.' });
  } catch (error) {
    emit('chassis-cloud-ready', { enabled: false, message: `Cloud services could not initialize: ${error.message}` });
  }
}

async function privateListReference(key) {
  const user = validUser();
  return dbApi.doc(dbApi.db, 'users', user.uid, 'privateData', key);
}

async function fetchPrivateList(key) {
  if (!cloudReady || !currentUser?.emailVerified) return null;
  const ref = await privateListReference(key);
  const snapshot = await dbApi.getDoc(ref);
  return snapshot.exists() ? (Array.isArray(snapshot.data().items) ? snapshot.data().items : []) : null;
}

async function savePrivateList(key, items) {
  if (!cloudReady || !currentUser?.emailVerified) return false;
  if (!['garage', 'serviceNotes', 'reminders'].includes(key)) throw new Error('Unsupported private collection.');
  if (!Array.isArray(items) || items.length > 100) throw new Error('Keep no more than 100 saved items in one private collection.');
  const ref = await privateListReference(key);
  await dbApi.setDoc(ref, { kind: key, items, updatedAt: dbApi.serverTimestamp() }, { merge: true });
  return true;
}

function watchPrivateList(key, onChange) {
  if (!cloudReady || !currentUser?.emailVerified) return () => {};
  let stop = () => {};
  let cancelled = false;
  privateListReference(key).then(value => {
    if (!cancelled && currentUser?.emailVerified) {
      const unsubscribe = dbApi.onSnapshot(value, snapshot => onChange(snapshot.exists() ? (snapshot.data().items || []) : null));
      stop = () => { unsubscribe(); unsubscribers.delete(unsubscribe); };
      unsubscribers.add(unsubscribe);
    }
  }).catch(() => {});
  return () => { cancelled = true; stop(); };
}

const unsubscribers = new Set();
function stopSubscriptions() {
  for (const unsubscribe of unsubscribers) unsubscribe();
  unsubscribers.clear();
}

function safeFileName(name) {
  return String(name || 'photo.jpg').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-90) || 'photo.jpg';
}

async function saveListing(record, publish) {
  const user = validUser();
  const photos = Array.isArray(record.photos) ? record.photos : [];
  const totalBytes = photos.reduce((sum, photo) => sum + Number(photo.blob?.size || 0), 0);
  if (!photos.length || photos.length > 18 || totalBytes > 40 * 1024 * 1024) {
    throw new Error('Use up to 18 photos and keep the whole listing under 40 MB.');
  }
  const uploaded = [];
  const privateRef = dbApi.doc(dbApi.db, 'users', user.uid, 'listings', record.id);
  const publicRef = dbApi.doc(dbApi.db, 'publicListings', record.id);
  try {
    for (let index = 0; index < photos.length; index += 1) {
      const photo = photos[index];
      if (!(photo.blob instanceof Blob) || !photo.blob.type.startsWith('image/') || photo.blob.size > 12 * 1024 * 1024) {
        throw new Error('Every listing photo must be an image under 12 MB.');
      }
      const path = `users/${user.uid}/listings/${record.id}/${String(index + 1).padStart(2, '0')}-${safeFileName(photo.name)}`;
      const reference = storageApi.ref(storageApi.storage, path);
      await storageApi.uploadBytes(reference, photo.blob, { contentType: photo.type || photo.blob.type });
      const storedPhoto = { group: photo.group, name: safeFileName(photo.name), path };
      // Download URLs are bearer links. Only mint one after the owner has
      // explicitly chosen to make this listing and its photos public.
      if (publish) storedPhoto.url = await storageApi.getDownloadURL(reference);
      uploaded.push(storedPhoto);
    }
    const listing = {
      id: record.id,
      ownerUid: user.uid,
      status: publish ? 'published' : 'draft',
      make: String(record.make), model: String(record.model), year: Number(record.year),
      fuel: String(record.fuel), km: Number(record.km), price: Number(record.price),
      transmission: String(record.transmission), city: String(record.city).slice(0, 70),
      description: String(record.description).slice(0, 800), photos: uploaded,
      createdAt: Number(record.createdAt || Date.now()), updatedAt: Date.now()
    };
    await dbApi.setDoc(privateRef, listing);
    if (publish) await dbApi.setDoc(publicRef, listing);
    else await dbApi.deleteDoc(publicRef).catch(() => {});
    return listing;
  } catch (error) {
    await Promise.all(uploaded.map(photo => storageApi.deleteObject(storageApi.ref(storageApi.storage, photo.path)).catch(() => {})));
    await dbApi.deleteDoc(privateRef).catch(() => {});
    await dbApi.deleteDoc(publicRef).catch(() => {});
    throw error;
  }
}

async function listMyListings() {
  const user = validUser();
  const ref = dbApi.collection(dbApi.db, 'users', user.uid, 'listings');
  const snapshot = await dbApi.getDocs(ref);
  return snapshot.docs.map(item => item.data()).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
}

async function getPrivateListingPhoto(path) {
  const user = validUser();
  const allowedPrefix = `users/${user.uid}/listings/`;
  if (typeof path !== 'string' || !path.startsWith(allowedPrefix)) {
    throw new Error('This photo is not part of your private listings.');
  }
  return storageApi.getBlob(storageApi.ref(storageApi.storage, path));
}

async function listPublicListings() {
  if (!cloudReady) return [];
  const ref = dbApi.query(dbApi.collection(dbApi.db, 'publicListings'), dbApi.where('status', '==', 'published'), dbApi.limit(50));
  const snapshot = await dbApi.getDocs(ref);
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id })).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

async function deleteListing(id) {
  const user = validUser();
  const privateRef = dbApi.doc(dbApi.db, 'users', user.uid, 'listings', id);
  const snapshot = await dbApi.getDoc(privateRef);
  const photos = snapshot.exists() ? snapshot.data().photos || [] : [];
  const interestCollection = dbApi.collection(dbApi.db, 'publicListings', id, 'interest');
  const interests = await dbApi.getDocs(interestCollection);
  await Promise.all(interests.docs.map(item => dbApi.deleteDoc(item.ref)));
  await dbApi.deleteDoc(dbApi.doc(dbApi.db, 'publicListings', id)).catch(() => {});
  await dbApi.deleteDoc(privateRef);
  await Promise.all(photos.map(photo => photo.path ? storageApi.deleteObject(storageApi.ref(storageApi.storage, photo.path)).catch(() => {}) : Promise.resolve()));
}

async function sendInterest(listing) {
  const user = validUser();
  if (listing.ownerUid === user.uid) throw new Error('You cannot send interest to your own listing.');
  const ref = dbApi.doc(dbApi.db, 'publicListings', listing.id, 'interest', user.uid);
  if ((await dbApi.getDoc(ref)).exists()) throw new Error('You have already sent interest for this car.');
  await dbApi.setDoc(ref, { fromUid: user.uid, fromEmail: user.email, createdAt: dbApi.serverTimestamp() });
}

async function listListingInterests(listingId) {
  const user = validUser();
  const ref = dbApi.collection(dbApi.db, 'publicListings', listingId, 'interest');
  const snapshot = await dbApi.getDocs(ref);
  return snapshot.docs.map(item => item.data()).filter(item => item.fromUid !== user.uid);
}

async function enableDeviceNotifications() {
  const user = validUser();
  if (!config.vapidKey) throw new Error('The web push VAPID key is not configured yet.');
  if (!('Notification' in window) || !('serviceWorker' in navigator)) throw new Error('This browser does not support web notifications.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted.');
  const messagingModule = await import(`${FIREBASE_SDK}/firebase-messaging.js`);
  if (!(await messagingModule.isSupported())) throw new Error('Firebase push messaging is not supported in this browser.');
  const registration = await navigator.serviceWorker.register(new URL('./firebase-messaging-sw.js', import.meta.url));
  const token = await messagingModule.getToken(messagingModule.getMessaging(app), { vapidKey: config.vapidKey, serviceWorkerRegistration: registration });
  const tokenId = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)).then(bytes => Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join(''));
  const tokenCollection = dbApi.collection(dbApi.db, 'users', user.uid, 'deviceTokens');
  const existingTokens = await dbApi.getDocs(dbApi.query(tokenCollection, dbApi.limit(6)));
  const tokenRef = dbApi.doc(tokenCollection, tokenId);
  if (existingTokens.size >= 5 && !existingTokens.docs.some(item => item.id === tokenId)) throw new Error('This account already has five notification devices. Sign out on an old device first.');
  await dbApi.setDoc(tokenRef, { token, updatedAt: dbApi.serverTimestamp() });
  localStorage.setItem('chassis-fcm-token-id', tokenId);
  return true;
}

async function removeCurrentDeviceToken(uid = currentUser?.uid) {
  const tokenId = localStorage.getItem('chassis-fcm-token-id');
  if (!uid || !tokenId || !cloudReady) return;
  await dbApi.deleteDoc(dbApi.doc(dbApi.db, 'users', uid, 'deviceTokens', tokenId)).catch(() => {});
  localStorage.removeItem('chassis-fcm-token-id');
}

async function identifyCar(imageBase64) {
  validUser();
  const callable = functionsApi.httpsCallable(functionsApi.functions, 'identifyCar');
  const result = await callable({ imageBase64 });
  return result.data;
}

async function deleteMyAccount() {
  const user = validUser();
  const callable = functionsApi.httpsCallable(functionsApi.functions, 'deleteMyChassisAccount');
  await callable({});
  stopSubscriptions();
  await authApi.signOut(authApi.getAuth(app));
  localStorage.removeItem('chassis-fcm-token-id');
  return user.uid;
}

async function signIn(email, password) {
  const credential = await authApi.signInWithEmailAndPassword(authApi.getAuth(app), email, password);
  if (!credential.user.emailVerified) {
    await authApi.signOut(authApi.getAuth(app));
    throw new Error('Check your inbox and verify your email before using cloud features.');
  }
  return credential.user;
}

async function signUp(email, password) {
  if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
  const credential = await authApi.createUserWithEmailAndPassword(authApi.getAuth(app), email, password);
  await authApi.sendEmailVerification(credential.user);
  await authApi.signOut(authApi.getAuth(app));
}

const api = {
  get configured() { return configured && cloudReady; },
  get user() { return currentUser; },
  signIn,
  signUp,
  signOut: async () => { stopSubscriptions(); await removeCurrentDeviceToken(); await authApi.signOut(authApi.getAuth(app)); },
  resetPassword: async email => authApi.sendPasswordResetEmail(authApi.getAuth(app), email),
  fetchPrivateList,
  savePrivateList,
  watchPrivateList,
  saveListing,
  listMyListings,
  getPrivateListingPhoto,
  listPublicListings,
  deleteListing,
  sendInterest,
  listListingInterests,
  enableDeviceNotifications,
  identifyCar,
  deleteMyAccount
};
window.chassisCloud = api;
initialize();
