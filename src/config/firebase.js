import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import serverConfig from "./server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isFirebaseInitialized = false;

function initializeFirebase() {
  try {
    if (admin.apps.length > 0) {
      isFirebaseInitialized = true;
      return admin.app();
    }

    let serviceAccount = null;

    // 1. Check individual environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || "";
      const formattedPrivateKey = rawPrivateKey.replace(/\\n/g, "\n");

      serviceAccount = {
        type: process.env.FIREBASE_TYPE || "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: formattedPrivateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
      };
    }
    // 2. Check env variable for JSON file path
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      const rawData = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf-8");
      serviceAccount = JSON.parse(rawData);
    } 
    // 3. Check standard location in project root or src/config/
    else {
      const rootPath = path.join(__dirname, "../../firebaseServiceAccount.json");
      const defaultPath = path.join(__dirname, "firebaseServiceAccount.json");
      
      if (fs.existsSync(rootPath)) {
        const rawData = fs.readFileSync(rootPath, "utf-8");
        serviceAccount = JSON.parse(rawData);
      } else if (fs.existsSync(defaultPath)) {
        const rawData = fs.readFileSync(defaultPath, "utf-8");
        serviceAccount = JSON.parse(rawData);
      } else if (process.env.FIREBASE_CREDENTIALS) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } catch (e) {
          console.warn("[Firebase] Could not parse FIREBASE_CREDENTIALS env string.");
        }
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      isFirebaseInitialized = true;
      console.log("[Firebase] Successfully initialized Firebase Admin SDK.");
      return admin.app();
    } else {
      console.warn(
        "\n=========================================================================\n" +
        "[Firebase Notice]: Service account credentials file not found.\n" +
        "Please place your 'firebaseServiceAccount.json' file inside:\n" +
        "  -> src/config/firebaseServiceAccount.json\n" +
        "OR set the environment variable FIREBASE_SERVICE_ACCOUNT_PATH in .env\n" +
        "Push notifications will be logged in mock mode until credentials are placed.\n" +
        "=========================================================================\n"
      );
      return null;
    }
  } catch (error) {
    console.error("[Firebase] Error during initialization:", error.message);
    return null;
  }
}

// Initialize on module load
initializeFirebase();

/**
 * Send single push notification
 */
export async function sendPushNotification({ token, title, body, data = {} }) {
  if (!token) return { success: false, error: "No token provided" };

  if (!isFirebaseInitialized) {
    console.log(`[Firebase Mock Push] To Token: ${token} | Title: "${title}" | Body: "${body}"`);
    return { success: true, mock: true };
  }

  try {
    const message = {
      token,
      notification: {
        title: title || "LagProperty Notification",
        body: body || "",
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error(`[Firebase Push Error] Token ${token}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send push notification to multiple tokens in scheduled/throttled batches
 * to prevent server memory spikes and FCM rate limiting.
 */
export async function sendBatchedPushNotifications({
  tokens = [],
  title,
  body,
  data = {},
  batchSize = 100,
  delayMs = 200,
}) {
  const validTokens = [...new Set(tokens.filter((t) => typeof t === "string" && t.trim() !== ""))];

  if (validTokens.length === 0) {
    return { total: 0, successCount: 0, failureCount: 0 };
  }

  if (!isFirebaseInitialized) {
    console.log(`[Firebase Mock Bulk Push] Target Tokens Count: ${validTokens.length} | Title: "${title}" | Body: "${body}"`);
    return { total: validTokens.length, successCount: validTokens.length, failureCount: 0, mock: true };
  }

  let totalSuccess = 0;
  let totalFailure = 0;

  // FCM multicast supports max 500 per call, we use batchSize (e.g. 100) with scheduled delay
  const chunks = [];
  for (let i = 0; i < validTokens.length; i += batchSize) {
    chunks.push(validTokens.slice(i, i + batchSize));
  }

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    try {
      const message = {
        tokens: chunk,
        notification: {
          title: title || "LagProperty Announcement",
          body: body || "",
        },
        data: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      console.log(
        `[Firebase Push Batch ${idx + 1}/${chunks.length}] Processed ${chunk.length} tokens. Success: ${response.successCount}, Failed: ${response.failureCount}`
      );
    } catch (err) {
      console.error(`[Firebase Push Batch ${idx + 1} Error]:`, err.message);
      totalFailure += chunk.length;
    }

    // Schedule delay between batches to avoid overloading network/FCM
    if (idx < chunks.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    total: validTokens.length,
    successCount: totalSuccess,
    failureCount: totalFailure,
  };
}

export default {
  initializeFirebase,
  sendPushNotification,
  sendBatchedPushNotifications,
};
