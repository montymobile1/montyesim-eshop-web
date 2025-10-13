/*EXPLANATION : 
https://medium.com/simform-engineering/firebase-cloud-messaging-in-react-a-comprehensive-guide-b5e325452f97
https://blog.audreyhal.com/posts/push-notifications-with-firebase-in-react*/

// Scripts for firebase and firebase messaging
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
// );

// importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "__VITE_FIREBASE_API_KEY__",
  authDomain: "__VITE_FIREBASE_AUTH_DOMAIN__",
  projectId: "__VITE_FIREBASE_PROJECT_ID__",
  storageBucket: "__VITE_FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__VITE_FIREBASE_APP_ID__",
};

// const firebaseConfig = {
//   apiKey: `AIzaSyCKvWxpI-sFEkO6K4X2EiDaiIIr4LMaEMY`,
//   authDomain: `luxesim-test.firebaseapp.com`,
//   projectId: `luxesim-test`,
//   storageBucket: `luxesim-test.firebasestorage.app`,
//   messagingSenderId: `178766894738`,
//   appId: `1:178766894738:web:f21b7a66e4292ac3afb84b`,
//   measurementId: `G-R8847LR2WG`,
// };

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
