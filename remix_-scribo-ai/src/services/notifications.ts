import { getMessaging, getToken, onMessage }
  from 'firebase/messaging';
import { getFirestore, doc, setDoc }
  from 'firebase/firestore';
import { app } from './firebase';

const VAPID_KEY = 'BAL6IvVqmeoz6LnpBWMXixAKqeL0lN10cxdesFVLQ0NQt2rQDYglCXFwyEHvD1Bd8YN9aCTYEIxz0deXxTz9RkM';

export const setupNotifications = async (
  uid: string
): Promise<void> => {
  try {
    if (!('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;

    const permission =
      await Notification.requestPermission();
    if (permission !== 'granted') return;

    const swReg = await navigator.serviceWorker
      .register('/firebase-messaging-sw.js');

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg
    });

    if (token && uid) {
      const db = getFirestore();
      await setDoc(
        doc(db, 'users', uid),
        {
          fcmToken: token,
          notificationsEnabled: true
        },
        { merge: true }
      );
    }

    onMessage(messaging, (payload) => {
      if (!payload.notification) return;
      new Notification(
        payload.notification.title || 'Scribo AI',
        {
          body: payload.notification.body || '',
          icon: '/logo.png'
        }
      );
    });

  } catch(e) {
    console.log('Notification setup:', e);
  }
};
