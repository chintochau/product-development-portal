import axios from "axios";


// /users/{userId}/drive/root/children
// 

// Graph API Configuration
const CONFIG = {
  clientId: import.meta.env.VITE_MS_CLIENT_ID, // Replace with your app's client ID
  clientSecret: import.meta.env.VITE_MS_CLIENT_SECRET, // Replace with your app's client secret
  tenantId: import.meta.env.VITE_MS_TENANT_ID, // Replace with your tenant ID
  tokenEndpoint: (tenantId) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
  graphBaseUrl: "https://graph.microsoft.com/v1.0",
};

let accessToken = null; // Cached access token
let tokenExpiry = null; // Token expiration time

/**
 * Fetches a new access token from Microsoft Graph API.
 */
export async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CONFIG.clientId,
    client_secret: CONFIG.clientSecret,
    scope: "https://graph.microsoft.com/.default",
  });

  try {
    const response = await axios.post(CONFIG.tokenEndpoint(CONFIG.tenantId), params);
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000; // Save expiry time
    console.log("Fetched new access token.");
    return accessToken;
  } catch (error) {
    console.error("Error fetching access token:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Ensures a valid access token is available, fetching a new one if expired.
 */
export async function ensureAccessToken() {
  if (!accessToken || Date.now() >= tokenExpiry) {
    console.log("Access token expired or not found. Fetching a new token...");
    return await getAccessToken();
  }
  return accessToken;
}

/**
 * Makes a GET request to the Microsoft Graph API.
 * @param {string} endpoint - The API endpoint (relative to the base URL).
 */
export async function graphGet(endpoint) {
  try {
    const token = await ensureAccessToken();
    const response = await axios.get(`${CONFIG.graphBaseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error making Graph API GET request:", error.message);
    throw error;
  }
}

/**
 * Lists files and folders in the root directory of a specified drive.
 * @param {string} driveId - The ID of the drive to query.
 */
export async function listDriveFiles(driveId) {
  const endpoint = `/drives/${driveId}/root/children`;
  return await graphGet(endpoint);
}

/**
 * Fetches metadata of a specific file or folder by its path in the drive.
 * @param {string} driveId - The ID of the drive.
 * @param {string} filePath - The path to the file or folder (relative to the root).
 */
export async function getDriveItemByPath(driveId, filePath) {
  const endpoint = `/drives/${driveId}/root:/${filePath}`;
  return await graphGet(endpoint);
}

/**
 * Fetches metadata of a specific file or folder by its ID in the drive.
 * @param {string} driveId - The ID of the drive.
 * @param {string} itemId - The ID of the item (file or folder).
 */
export async function getDriveItemById(driveId, itemId) {
  const endpoint = `/drives/${driveId}/items/${itemId}`;
  return await graphGet(endpoint);
}

module.exports = {
  listDriveFiles,
  getDriveItemByPath,
  getDriveItemById,
};