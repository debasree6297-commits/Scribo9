importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD5IdgBRDh3QjJUpsOMUJXs24SLMjO_LyM",
  authDomain: "scribo-ai-99eeb.firebaseapp.com",
  projectId: "scribo-ai-99eeb",
  messagingSenderId: "69014787122",
  appId: "1:69014787122:web:7f712aa7b09c216f88182b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title || 'Scribo AI', 
    {
      body: payload.notification.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      tag: 'scribo-notif',
      requireInteraction: false
    }
  );
});
