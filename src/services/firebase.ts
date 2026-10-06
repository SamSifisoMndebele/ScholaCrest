// ============================================================================
// Firebase SDK Initialization & Security Configuration
// Schola Crest Multi-Tenant School Management Platform
// ============================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import type { Database } from 'firebase/database';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import type { AppCheck } from 'firebase/app-check';

// 1. Firebase Web App Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBTGB8msi4ju_e1JyZ9CyYGUXL9UfPqsZE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'schola-crest.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'schola-crest',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'schola-crest.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '216455666235',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:216455666235:web:cfcc738532a72334ce5a1e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7KKFHG7W0M',
};

// 2. Google reCAPTCHA Enterprise Site Key
export const RECAPTCHA_ENTERPRISE_SITE_KEY =
  import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY || '6LfSz0EtAAAAAF1WIZaaKxQs1Nsn_injlx8eSbn_';

// 3. Initialize Firebase App (Singleton Pattern)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 4. Initialize Core Firebase Services
export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const rtdb: Database = getDatabase(app);

// 5. Initialize Firebase Analytics Safely
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('[Firebase Analytics] Initialization skipped:', err);
  });
}

// 6. Initialize Firebase App Check with reCAPTCHA Enterprise
export let appCheck: AppCheck | null = null;
export function initAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheck) return appCheck;

  try {
    // In local development or testing, use the registered App Check debug token
    const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || (import.meta.env.DEV ? '905D1CC1-45C0-413C-AD5D-B8687A72185D' : undefined);
    if (debugToken) {
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    }


    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
    return appCheck;
  } catch (error) {
    console.warn('[Firebase App Check] Attestation warning:', error);
    return null;
  }
}

// Auto-initialize App Check in browser environment
if (typeof window !== 'undefined') {
  initAppCheck();
}
