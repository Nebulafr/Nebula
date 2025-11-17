import admin from "firebase-admin";
import { cert } from "firebase-admin/app";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin once
let adminApp: admin.app.App | null = null;

function initializeAdmin() {
  if (!adminApp && !admin.apps.length) {
    const serviceAccountPath = path.join(
      process.cwd(),
      "src",
      "firebase",
      "serviceAccount.json"
    );

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf8")
      );

      adminApp = admin.initializeApp({
        credential: cert(serviceAccount),
      });
      
      console.log("Firebase Admin initialized successfully");
    } else {
      console.error("Firebase service account file not found at:", serviceAccountPath);
      throw new Error("Firebase service account file not found");
    }
  } else if (admin.apps.length > 0) {
    adminApp = admin.apps[0]!;
  }
  
  return adminApp;
}

// Ensure initialization
initializeAdmin();

// Export initialized instances - guaranteed to be available after initialization
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export { admin as app };
export default admin;
