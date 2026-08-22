import axios from "axios";
import serverConfig from "../config/server.js";

let cachedToken = null;

/**
 * Log into Fidopoint Identity Service to obtain a fresh JWT Bearer token
 */
export async function loginAndGetToken() {
  if (!serverConfig.FIDOPOINT_EMAIL || !serverConfig.FIDOPOINT_PASSWORD) {
    console.warn("[Fidopoint Auth] FIDOPOINT_EMAIL or FIDOPOINT_PASSWORD not configured.");
    return null;
  }

  try {
    const loginUrl = `${serverConfig.FIDOPOINT_BASE_URL}/auth/login`;
    console.log(`[Fidopoint Auth] Logging in to ${loginUrl} as ${serverConfig.FIDOPOINT_EMAIL}...`);
    const response = await axios.post(loginUrl, {
      email: serverConfig.FIDOPOINT_EMAIL,
      password: serverConfig.FIDOPOINT_PASSWORD,
    });

    const token = response.data?.data?.token;
    if (token) {
      cachedToken = token;
      console.log("[Fidopoint Auth] Successfully acquired Bearer token.");
      return token;
    }
  } catch (error) {
    console.error(
      "[Fidopoint Auth] Login failed:",
      error?.response?.data || error.message
    );
  }
  return null;
}

/**
 * Get headers containing x-api-key and Authorization Bearer token.
 * Automatically logs in if token is missing.
 */
export async function getFidopointHeaders(forceRefresh = false) {
  if (!cachedToken || forceRefresh) {
    await loginAndGetToken();
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (serverConfig.FIDOPOINT_API_KEY) {
    headers["x-api-key"] = serverConfig.FIDOPOINT_API_KEY;
  }

  if (cachedToken) {
    headers["Authorization"] = `Bearer ${cachedToken}`;
  }

  return headers;
}

/**
 * Helper to execute a POST request to Fidopoint with automatic retry on 401 Unauthorized (token expiration).
 */
export async function postToFidopoint(endpoint, payload) {
  const url = `${serverConfig.FIDOPOINT_BASE_URL}${endpoint}`;
  let headers = await getFidopointHeaders();

  try {
    return await axios.post(url, payload, { headers });
  } catch (error) {
    // If 401 Unauthorized, token might be expired. Force refresh token and retry once.
    if (error?.response?.status === 401 || error?.response?.data?.message?.includes("token")) {
      console.warn("[Fidopoint] Token expired or invalid. Attempting re-login...");
      headers = await getFidopointHeaders(true);
      return await axios.post(url, payload, { headers });
    }
    throw error;
  }
}
