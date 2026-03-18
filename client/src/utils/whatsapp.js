/**
 * WhatsApp Utility Functions
 * Handles WhatsApp integration for the gym membership app
 */

// Gym's WhatsApp number (without + or spaces)
const GYM_WHATSAPP_NUMBER = "94767933556";
const GYM_NAME = "Muscle Mantra Gym";

/**
 * Generate WhatsApp link for contacting the gym
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp link
 */
export const getGymWhatsAppLink = (message = "") => {
  const encoded = encodeURIComponent(message || `Hi! I'd like to know more about ${GYM_NAME}`);
  return `https://wa.me/${GYM_WHATSAPP_NUMBER}?text=${encoded}`;
};

/**
 * Generate WhatsApp link for member to contact admin
 * @param {string} memberName - Member's name
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp link
 */
export const getMemberQueryLink = (memberName = "Member", message = "") => {
  const defaultMsg = `Hi! I have a question about my membership at ${GYM_NAME}. ${message}`;
  const encoded = encodeURIComponent(defaultMsg);
  return `https://wa.me/${GYM_WHATSAPP_NUMBER}?text=${encoded}`;
};

/**
 * Generate WhatsApp share link for admin to send announcements
 * @param {string} announcement - Announcement text
 * @param {string} recipients - Comma-separated member names or "All Members"
 * @returns {string} WhatsApp link
 */
export const getAnnouncementLink = (announcement = "", recipients = "All Members") => {
  const msg = `📢 ANNOUNCEMENT from ${GYM_NAME}:\n\n${announcement}\n\n(Sent to: ${recipients})`;
  const encoded = encodeURIComponent(msg);
  return `https://wa.me/${GYM_WHATSAPP_NUMBER}?text=${encoded}`;
};

/**
 * Open WhatsApp in new window
 * @param {string} link - WhatsApp link
 */
export const openWhatsApp = (link) => {
  window.open(link, "_blank", "noopener,noreferrer");
};

/**
 * Copy WhatsApp link to clipboard
 * @param {string} link - WhatsApp link
 * @returns {Promise<boolean>}
 */
export const copyWhatsAppLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (err) {
    console.error("Failed to copy WhatsApp link:", err);
    return false;
  }
};

export const WHATSAPP_NUMBERS = {
  gym: GYM_WHATSAPP_NUMBER,
};

export const WHATSAPP_CONFIG = {
  gymName: GYM_NAME,
  gymPhone: GYM_WHATSAPP_NUMBER,
  baseUrl: "https://wa.me/",
};
