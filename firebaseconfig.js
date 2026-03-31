import { initializeApp } from "firebase/app";

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics, logEvent, setUserId, isSupported as isAnalyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

let messaging = null;
let analytics = null;

// Initialize Analytics if supported
(async () => {
  try {
    const analyticsSupported = await isAnalyticsSupported();
    if (analyticsSupported) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn("Failed to initialize Firebase Analytics:", error.message);
    analytics = null;
  }
})();

// Async initialization to handle isSupported() check
(async () => {
  try {
    // Check if messaging is supported (handles Safari, WKWebView, etc.)
    const messagingSupported = await isSupported();
    if (messagingSupported) {
      messaging = getMessaging(app);
    } else {
      console.warn("Firebase Messaging is not supported in this browser");
    }
  } catch (error) {
    console.warn("Failed to initialize Firebase Messaging:", error.message);
    messaging = null;
  }
})();

export { messaging };

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (!messaging) {
      reject(new Error("Messaging not available"));
      return;
    }
    try {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } catch (error) {
      reject(error);
    }
  });

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

const requestPermission = async () => {
  try {
    // Check if messaging is available
    if (!messaging) {
      console.warn("Messaging not available in this environment");
      return null;
    }

    // Check if Notification API exists
    if (!("Notification" in window)) {
      console.warn("Notification API not supported");
      return null;
    }

    //requesting permission using Notification API
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
      });

      return token;
    } else if (permission === "denied") {
      console.log("User Permission Denied.");
    }
  } catch (error) {
    console.warn("Error requesting notification permission:", error.message);
    return null;
  }
};

// Analytics log event helper
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    console.warn("Failed to log analytics event:", error.message);
  }
};

// Set Firebase Analytics user ID (hashed email)
export const setAnalyticsUserId = (hashedEmail) => {
  try {
    if (analytics && hashedEmail) {
      setUserId(analytics, hashedEmail);
    }
  } catch (error) {
    console.warn("Failed to set analytics user ID:", error.message);
  }
};

// Clear Firebase Analytics user ID
export const clearAnalyticsUserId = () => {
  try {
    if (analytics) {
      setUserId(analytics, null);
    }
  } catch (error) {
    console.warn("Failed to clear analytics user ID:", error.message);
  }
};

export { auth, googleProvider, signInWithPopup, requestPermission, analytics };
