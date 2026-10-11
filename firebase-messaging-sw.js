importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js');
importScripts('./firebase-config.js');

if (self.CHASSIS_FIREBASE_CONFIG?.apiKey && self.CHASSIS_FIREBASE_CONFIG?.projectId) {
  firebase.initializeApp(self.CHASSIS_FIREBASE_CONFIG);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const notification = payload.notification || payload.data || {};
    self.registration.showNotification(notification.title || 'Chassis update', {
      body: notification.body || 'Open Chassis to see the latest update.',
      icon: new URL('./assets/chassis-mark.svg', self.registration.scope).href,
      data: { link: payload.fcmOptions?.link || 'https://v8sl-grg.github.io/v8sl/' }
    });
  });
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const destination = event.notification.data?.link || 'https://v8sl-grg.github.io/v8sl/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    for (const client of clients) {
      if ('focus' in client && client.url.startsWith('https://v8sl-grg.github.io/v8sl/')) {
        client.navigate(destination);
        return client.focus();
      }
    }
    return self.clients.openWindow(destination);
  }));
});
