import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // Support both JSON key file and individual env vars
  const projectId = process.env.FIREBASE_PROJECT_ID
    ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }

  // Fall back to individual env vars (useful for Vercel/CI)
  if (
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      projectId,
    });
  }

  // Default credentials (e.g., running on GCP)
  return initializeApp({ projectId });
}

const adminApp = getAdminApp();

/** Firebase Admin Auth instance (server-side). */
export const adminAuth = getAuth(adminApp);

/** Firestore Admin instance (server-side, full access). */
export const adminDb = getFirestore(adminApp);

export default adminApp;
