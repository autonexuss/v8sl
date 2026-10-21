(() => {
  const firebaseConfig = globalThis.CHASSIS_FIREBASE_CONFIG || {};
  const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const configured = requiredConfigKeys.every(key => typeof firebaseConfig[key] === 'string' && firebaseConfig[key].trim() && !/replace|your[_-]?/i.test(firebaseConfig[key]));
  const firebaseCdn = 'https://www.gstatic.com/firebasejs/12.4.0';
  const profileToggle = document.getElementById('my-profile-toggle');
  const profileLabel = profileToggle.querySelector('.my-profile-label');
  const signInDialog = document.getElementById('account-signin-dialog');
  const proForm = document.getElementById('pro-auth-form');
  const proNameWrap = document.getElementById('pro-auth-name-wrap');
  const proName = document.getElementById('pro-auth-name');
  const proEmail = document.getElementById('pro-auth-email');
  const proPassword = document.getElementById('pro-auth-password');
  const proSubmit = document.getElementById('pro-auth-submit');
  const proModeToggle = document.getElementById('pro-auth-mode-toggle');
  const proReset = document.getElementById('pro-auth-reset');
  const proStatus = document.getElementById('pro-auth-status');
  const proSession = document.getElementById('pro-auth-session');
  const proSessionTitle = document.getElementById('pro-auth-session-title');
  const proSessionEmail = document.getElementById('pro-auth-session-email');
  const proSessionVerification = document.getElementById('pro-auth-session-verification');
  const proResend = document.getElementById('pro-auth-resend');
  const proRefresh = document.getElementById('pro-auth-refresh');
  const profileDialog = document.getElementById('account-profile-dialog');
  const profileTitle = document.getElementById('account-profile-name');
  const profileEmail = document.getElementById('account-profile-email');
  const profileVerification = document.getElementById('account-profile-verification');
  const profileAvatarLarge = document.getElementById('account-profile-avatar');
  const profileAvatarLetter = document.getElementById('account-profile-avatar-letter');
  const profileAvatarPhoto = document.getElementById('account-profile-avatar-photo');
  const topAvatarPhoto = document.getElementById('my-profile-avatar-photo');
  const topAvatarFallback = document.getElementById('my-profile-avatar-fallback');
  const profilePhotoInput = document.getElementById('account-profile-photo-input');
  const profilePhotoRemove = document.getElementById('account-profile-photo-remove');
  const profileNameInput = document.getElementById('account-profile-name-input');
  const profileNameForm = document.getElementById('account-profile-name-form');
  const profileStatus = document.getElementById('account-profile-status');
  const profileResend = document.getElementById('account-profile-resend');
  const profileRefresh = document.getElementById('account-profile-refresh');
  const profileSignout = document.getElementById('account-profile-signout');
  const openProfileButton = document.getElementById('pro-auth-open-profile');
  if (!profileToggle || !proForm || !profileDialog || !profilePhotoInput || !profilePhotoRemove) return;

  let sdk = null;
  let auth = null;
  let currentUser = null;
  let initialization = null;
  let authMode = 'signin';

  function setStatus(element, message, state = '') {
    if (!element) return;
    element.textContent = message;
    element.dataset.state = state;
  }

  function friendlyError(error) {
    const code = error && error.code;
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Email or password was not recognized.';
    if (code === 'auth/email-already-in-use') return 'An account already uses this email. Sign in instead.';
    if (code === 'auth/weak-password') return 'Choose a password with at least 8 characters.';
    if (code === 'auth/invalid-email') return 'Enter a valid email address.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Wait a little and try again.';
    if (code === 'auth/network-request-failed') return 'Connection issue. Check your internet and try again.';
    return error && error.message ? error.message : 'The account request could not be completed. Try again.';
  }

  function avatarLetter(user) {
    const source = (user && user.displayName) || (user && user.email) || 'A';
    return source.trim().charAt(0).toUpperCase() || 'A';
  }

  function savedPhotoFor(user) {
    if (!user || !user.uid) return '';
    try { return localStorage.getItem('autonexus-profile-photo-v1:' + user.uid) || ''; }
    catch { return ''; }
  }

  function showAvatarPhoto(image, fallback, photo) {
    if (photo) {
      image.src = photo;
      image.hidden = false;
      fallback.hidden = true;
    } else {
      image.removeAttribute('src');
      image.hidden = true;
      fallback.hidden = false;
    }
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The selected image could not be read.'));
      reader.readAsDataURL(file);
    });
  }

  async function compressProfilePhoto(file) {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      throw new Error('Choose a JPEG, PNG or WebP image.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Choose an image smaller than 10 MB.');
    }
    const source = await readAsDataUrl(file);
    const image = new Image();
    image.src = source;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
    });
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    if (!side) throw new Error('The selected image has no readable dimensions.');
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing is unavailable in this browser.');
    const sx = (image.naturalWidth - side) / 2;
    const sy = (image.naturalHeight - side) / 2;
    context.drawImage(image, sx, sy, side, side, 0, 0, 512, 512);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) throw new Error('The selected image could not be prepared.');
    return readAsDataUrl(blob);
  }

  function renderUser(user) {
    currentUser = user || null;
    const signedIn = Boolean(currentUser);
    profileToggle.hidden = false;
    profileToggle.setAttribute('aria-controls', signedIn ? 'account-profile-dialog' : 'account-signin-dialog');
    profileLabel.textContent = signedIn ? 'My Profile' : 'Sign in';
    document.body.classList.toggle('autonexus-user-signed-in', signedIn);
    if (!signedIn) {
      profileToggle.setAttribute('aria-label', 'Sign in to Autonexus');
      showAvatarPhoto(topAvatarPhoto, topAvatarFallback, null);
      proForm.hidden = false;
      if (proSession) proSession.hidden = true;
      return;
    }
    const displayName = currentUser.displayName || currentUser.email || 'Autonexus driver';
    const letter = avatarLetter(currentUser);
    profileToggle.setAttribute('aria-label', 'My Profile for ' + (currentUser.email || displayName));
    profileTitle.textContent = displayName;
    profileEmail.textContent = currentUser.email || '';
    profileAvatarLetter.textContent = letter;
    const profilePhoto = savedPhotoFor(currentUser);
    showAvatarPhoto(profileAvatarPhoto, profileAvatarLetter, profilePhoto);
    showAvatarPhoto(topAvatarPhoto, topAvatarFallback, profilePhoto);
    profilePhotoRemove.hidden = !profilePhoto;
    profileNameInput.value = currentUser.displayName || '';
    const verification = currentUser.emailVerified ? 'Email verified' : 'Email not verified';
    profileVerification.textContent = verification;
    profileVerification.dataset.state = currentUser.emailVerified ? 'verified' : 'pending';
    profileResend.hidden = Boolean(currentUser.emailVerified);
    profileRefresh.hidden = Boolean(currentUser.emailVerified);
    proForm.hidden = true;
    if (proSession) proSession.hidden = false;
    if (proSessionTitle) proSessionTitle.textContent = currentUser.emailVerified ? 'Your account is verified' : 'One more step: verify your email';
    if (proSessionEmail) proSessionEmail.textContent = currentUser.email || '';
    if (proSessionVerification) proSessionVerification.textContent = currentUser.emailVerified
      ? 'You’re signed in. Pro membership access still follows the options shown above.'
      : 'Open the verification link from your inbox, then refresh your status here.';
    if (proResend) proResend.hidden = Boolean(currentUser.emailVerified);
    if (proRefresh) proRefresh.hidden = Boolean(currentUser.emailVerified);
  }

  async function prepare() {
    if (!configured) {
      setStatus(proStatus, 'Email accounts are not connected yet. The owner needs to finish the Firebase setup.', 'setup');
      return false;
    }
    if (auth && sdk) return true;
    if (!initialization) {
      initialization = (async () => {
        const [appModule, authModule] = await Promise.all([
          import(firebaseCdn + '/firebase-app.js'),
          import(firebaseCdn + '/firebase-auth.js')
        ]);
        const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(firebaseConfig);
        auth = authModule.getAuth(app);
        sdk = authModule;
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
        authModule.onAuthStateChanged(auth, renderUser, error => setStatus(proStatus, friendlyError(error), 'error'));
        return true;
      })().catch(error => {
        initialization = null;
        setStatus(proStatus, 'Could not connect to the account service. ' + friendlyError(error), 'error');
        return false;
      });
    }
    return initialization;
  }

  function setMode(mode) {
    authMode = mode;
    const creating = authMode === 'signup';
    proNameWrap.hidden = !creating;
    proName.required = creating;
    proPassword.autocomplete = creating ? 'new-password' : 'current-password';
    proSubmit.innerHTML = creating
      ? 'Create account <span aria-hidden="true">↗</span>'
      : 'Sign in securely <span aria-hidden="true">↗</span>';
    proModeToggle.textContent = creating ? 'Already have an account? Sign in' : 'New to Autonexus? Create an account';
    proReset.hidden = creating;
    setStatus(proStatus, '');
  }

  profilePhotoInput.addEventListener('change', async () => {
    const file = profilePhotoInput.files && profilePhotoInput.files[0];
    if (!file) return;
    if (!currentUser) {
      setStatus(profileStatus, 'Sign in before adding a profile picture.', 'error');
      profilePhotoInput.value = '';
      return;
    }
    setStatus(profileStatus, 'Preparing your profile picture…', 'pending');
    try {
      const compressed = await compressProfilePhoto(file);
      localStorage.setItem('autonexus-profile-photo-v1:' + currentUser.uid, compressed);
      renderUser(currentUser);
      setStatus(profileStatus, 'Profile picture saved on this device.', 'success');
    } catch (error) {
      setStatus(profileStatus, error && error.message ? error.message : 'The profile picture could not be saved in this browser.', 'error');
    } finally {
      profilePhotoInput.value = '';
    }
  });

  profilePhotoRemove.addEventListener('click', () => {
    if (!currentUser) return;
    try {
      localStorage.removeItem('autonexus-profile-photo-v1:' + currentUser.uid);
      renderUser(currentUser);
      setStatus(profileStatus, 'Profile picture removed from this device.', 'success');
    } catch {
      setStatus(profileStatus, 'The profile picture could not be removed in this browser.', 'error');
    }
  });

  proModeToggle.addEventListener('click', () => setMode(authMode === 'signin' ? 'signup' : 'signin'));

  proForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!await prepare()) return;
    const email = proEmail.value.trim();
    const password = proPassword.value;
    const originalLabel = proSubmit.innerHTML;
    proSubmit.disabled = true;
    proSubmit.textContent = authMode === 'signup' ? 'Creating account…' : 'Signing in…';
    try {
      if (authMode === 'signup') {
        if (password.length < 8) throw new Error('Choose a password with at least 8 characters.');
        const credential = await sdk.createUserWithEmailAndPassword(auth, email, password);
        const name = proName.value.trim();
        if (name) await sdk.updateProfile(credential.user, { displayName: name });
        await sdk.sendEmailVerification(credential.user);
        renderUser(credential.user);
        setStatus(profileStatus, 'A verification link was sent to ' + email + '. Open it, then refresh your verification status.', 'success');
        setStatus(proStatus, 'Account created. A verification link was sent to ' + email + '.', 'success');
      } else {
        const credential = await sdk.signInWithEmailAndPassword(auth, email, password);
        renderUser(credential.user);
        setStatus(proStatus, credential.user.emailVerified
          ? 'Signed in. Your account is ready.'
          : 'Signed in. Verify your email using the link in your inbox, then refresh your status.', credential.user.emailVerified ? 'success' : 'pending');
      }
    } catch (error) {
      setStatus(proStatus, friendlyError(error), 'error');
    } finally {
      proSubmit.disabled = false;
      proSubmit.innerHTML = originalLabel;
    }
  });

  proReset.addEventListener('click', async () => {
    if (!await prepare()) return;
    const email = proEmail.value.trim();
    if (!email) { setStatus(proStatus, 'Enter your email address first, then choose Forgot password.', 'error'); proEmail.focus(); return; }
    try {
      await sdk.sendPasswordResetEmail(auth, email);
      setStatus(proStatus, 'If an account exists for ' + email + ', a password reset link has been sent.', 'success');
    } catch (error) { setStatus(proStatus, friendlyError(error), 'error'); }
  });

  async function resendVerification(statusElement) {
    if (!await prepare()) return;
    if (!auth.currentUser) { setStatus(statusElement, 'Sign in to resend the verification link.', 'error'); return; }
    try {
      await sdk.sendEmailVerification(auth.currentUser);
      setStatus(statusElement, 'A new verification link was sent to ' + (auth.currentUser.email || 'your email') + '.', 'success');
    } catch (error) { setStatus(statusElement, friendlyError(error), 'error'); }
  }

  async function refreshVerification(statusElement) {
    if (!await prepare()) return;
    if (!auth.currentUser) return;
    try {
      await sdk.reload(auth.currentUser);
      renderUser(auth.currentUser);
      setStatus(statusElement, auth.currentUser.emailVerified ? 'Email verified. Your account is ready.' : 'The email is still awaiting verification. Open the link, then refresh again.', auth.currentUser.emailVerified ? 'success' : 'pending');
    } catch (error) { setStatus(statusElement, friendlyError(error), 'error'); }
  }

  proResend.addEventListener('click', () => resendVerification(proStatus));
  proRefresh.addEventListener('click', () => refreshVerification(proStatus));
  profileResend.addEventListener('click', () => resendVerification(profileStatus));
  profileRefresh.addEventListener('click', () => refreshVerification(profileStatus));

  profileToggle.addEventListener('click', async () => {
    if (!currentUser) {
      setMode('signin');
      if (signInDialog && !signInDialog.open) signInDialog.showModal();
      if (!await prepare()) return;
      if (currentUser) {
        if (signInDialog?.open) signInDialog.close();
        if (!profileDialog.open) profileDialog.showModal();
        return;
      }
      requestAnimationFrame(() => proEmail.focus({ preventScroll: true }));
      return;
    }
    if (!await prepare()) return;
    if (!profileDialog.open) profileDialog.showModal();
  });
  openProfileButton.addEventListener('click', () => {
    if (signInDialog.open) signInDialog.close('profile');
    if (!profileDialog.open) profileDialog.showModal();
  });

  profileNameForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!await prepare()) return;
    if (!auth.currentUser) { setStatus(profileStatus, 'Sign in to update your profile.', 'error'); return; }
    const displayName = profileNameInput.value.trim();
    if (!displayName) { setStatus(profileStatus, 'Enter a display name.', 'error'); return; }
    try {
      await sdk.updateProfile(auth.currentUser, { displayName });
      await sdk.reload(auth.currentUser);
      renderUser(auth.currentUser);
      setStatus(profileStatus, 'Your display name was updated.', 'success');
    } catch (error) { setStatus(profileStatus, friendlyError(error), 'error'); }
  });

  profileSignout.addEventListener('click', async () => {
    if (!await prepare()) return;
    try {
      await sdk.signOut(auth);
      if (profileDialog.open) profileDialog.close('signed-out');
      setStatus(proStatus, 'You have been signed out.', 'success');
    } catch (error) { setStatus(profileStatus, friendlyError(error), 'error'); }
  });

  signInDialog.addEventListener('click', event => {
    if (event.target === signInDialog) signInDialog.close('backdrop');
  });

  profileDialog.addEventListener('click', event => {
    if (event.target === profileDialog) profileDialog.close('backdrop');
  });

  window.AutonexusAccount = { prepare, get user() { return currentUser; } };
  setMode('signin');
  if (configured) {
    const start = () => prepare();
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 3500 });
    else window.setTimeout(start, 800);
  }
})();