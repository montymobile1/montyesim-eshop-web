import CryptoJS from "crypto-js";
import { logAnalyticsEvent } from "../../../firebaseconfig";

export const normalizeString = (str) => {
  return str
    ?.normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

/**
 * Hash email using SHA-256 for security
 * @param {string} email - Email address to hash
 * @returns {string} Hashed email or empty string if email is invalid
 */
export const hashEmail = (email) => {
  if (!email) return "";
  try {
    // Normalize email (lowercase and trim) before hashing
    const normalizedEmail = email.toLowerCase().trim();
    return CryptoJS.SHA256(normalizedEmail).toString();
  } catch (error) {
    console.warn("Failed to hash email:", error);
    return "";
  }
};

/**
 * Log Firebase Analytics event with automatic email hashing
 * @param {string} eventName - Name of the analytics event
 * @param {object} eventParams - Event parameters (user email will be automatically hashed if provided)
 * @param {string} eventParams.user - User email (will be hashed automatically)
 */
export const logAnalyticsEventWithUser = (eventName, eventParams = {}) => {
  const { user, ...restParams } = eventParams;
  
  // Hash user email if provided
  const hashedUser = user ? hashEmail(user) : "";
  
  // Log event with hashed user email
  logAnalyticsEvent(eventName, {
    ...restParams,
    ...(hashedUser && { user: hashedUser }),
  });
};
