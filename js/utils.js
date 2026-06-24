/* ==========================================================================
   FREELANCER PROJECT OS - UTILITY HELPERS
   ========================================================================== */

import { getLanguage } from './i18n.js';

/**
 * Generates a unique secure pseudo-random identifier.
 * @returns {string}
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
}

/**
 * Formats a number to currency representation according to selected currency.
 * IDR uses dot separators (e.g., Rp27.300.000).
 * USD, SGD, MYR, EUR use comma separators (e.g., $2,500).
 * @param {number} value
 * @param {string} currency - IDR, USD, SGD, AUD, EUR
 * @returns {string}
 */
export function formatMoney(amount, currency = 'IDR', locale = null) {
  if (amount === null || amount === undefined || amount === '') return '—';
  const num = Number(amount);
  if (isNaN(num)) return '—';

  const cur = (currency || 'IDR').toUpperCase();
  const decimals = (cur === 'IDR') ? 0 : 2;
  const targetLocale = locale || (cur === 'IDR' ? 'id-ID' : 'en-US');

  let formattedNumber;
  try {
    formattedNumber = new Intl.NumberFormat(targetLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch (err) {
    try {
      formattedNumber = num.toFixed(decimals);
    } catch (e2) {
      formattedNumber = String(num);
    }
  }

  const symbols = {
    IDR: 'Rp',
    USD: '$',
    SGD: 'S$',
    AUD: 'A$',
    EUR: '€'
  };

  const symbol = symbols[cur];
  if (symbol) {
    return `${symbol}${formattedNumber}`;
  }

  return `${cur} ${formattedNumber}`;
}

export function formatCurrency(value, currency = 'IDR') {
  return formatMoney(value, currency);
}

/**
 * Formats a raw date string (YYYY-MM-DD) into a friendly human date.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  const lang = getLanguage() || 'en';
  if (!dateString) return lang === 'id' ? 'Tanpa Tanggal' : 'No Date';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  if (lang === 'id') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${months[month]} ${year}`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Determines urgency details for a given due date string.
 * @param {string} dueDateStr - YYYY-MM-DD
 * @returns {{isOverdue: boolean, text: string, daysDiff: number}}
 */
export function getDueDateStatus(dueDateStr) {
  const lang = getLanguage() || 'en';
  if (!dueDateStr) return { isOverdue: false, text: lang === 'id' ? 'Tanpa tenggat' : 'No deadline', daysDiff: 999 };
  
  const [y, m, d] = dueDateStr.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  due.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      isOverdue: true,
      text: lang === 'id' ? `${Math.abs(diffDays)}h terlambat` : `${Math.abs(diffDays)}d overdue`,
      daysDiff: diffDays
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      text: lang === 'id' ? 'jatuh tempo hari ini' : 'due today',
      daysDiff: 0
    };
  } else if (diffDays === 1) {
    return {
      isOverdue: false,
      text: lang === 'id' ? 'jatuh tempo besok' : 'due tomorrow',
      daysDiff: 1
    };
  } else {
    return {
      isOverdue: false,
      text: lang === 'id' ? `${diffDays} hari tersisa` : `${diffDays} days left`,
      daysDiff: diffDays
    };
  }
}

/**
 * Determines localized urgency details for a given due date string.
 * @param {string} dueDateStr - YYYY-MM-DD
 * @returns {{status: string, text: string, isOverdue: boolean, daysDiff: number}}
 */
export function getLocalizedDueDateStatus(dueDateStr) {
  const lang = getLanguage() || 'en';
  if (!dueDateStr) {
    return {
      status: 'none',
      text: lang === 'id' ? 'Tanpa tenggat' : 'No deadline',
      isOverdue: false,
      daysDiff: 999
    };
  }
  
  const [y, m, d] = dueDateStr.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  due.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return {
      status: 'overdue',
      text: lang === 'id' ? 'Terlambat' : 'Overdue',
      isOverdue: true,
      daysDiff: diffDays
    };
  } else if (diffDays === 0) {
    return {
      status: 'today',
      text: lang === 'id' ? 'Jatuh tempo hari ini' : 'Due today',
      isOverdue: false,
      daysDiff: 0
    };
  } else if (diffDays === 1) {
    return {
      status: 'soon',
      text: lang === 'id' ? 'Jatuh tempo besok' : 'Due tomorrow',
      isOverdue: false,
      daysDiff: 1
    };
  } else if (diffDays <= 3) {
    return {
      status: 'soon',
      text: lang === 'id' ? `${diffDays} hari tersisa` : `${diffDays} days left`,
      isOverdue: false,
      daysDiff: diffDays
    };
  } else {
    return {
      status: 'normal',
      text: lang === 'id' ? `${diffDays} hari tersisa` : `${diffDays} days left`,
      isOverdue: false,
      daysDiff: diffDays
    };
  }
}


/**
 * Generates freelancer-friendly email reminder template for payment follow-up.
 * @param {object} invoice
 * @param {object} client
 * @param {object} project
 * @returns {{subject: string, body: string}}
 */
export function generateEmailReminder(invoice, client, project) {
  const urgency = getDueDateStatus(invoice.dueDate);
  const subject = `Check-in: Invoice #${invoice.invoiceNumber} for ${project.title}`;
  
  let body = `Hi ${client.name},\n\n`;
  
  if (urgency.isOverdue) {
    const days = Math.abs(urgency.daysDiff);
    body += `I hope you're having a great week! Just a quick check-in regarding Invoice #${invoice.invoiceNumber} (${formatCurrency(invoice.amount, invoice.currency)}) for the '${project.title}' project, which was due on ${formatDate(invoice.dueDate)} and is now ${days} days overdue.\n\n`;
    body += `Please take a moment to review the payment details when you get a chance. If you have any questions or need another copy of the files, let me know!\n\n`;
  } else {
    body += `I hope you're having a great week! This is a quick note to let you know that Invoice #${invoice.invoiceNumber} for the '${project.title}' project is due on ${formatDate(invoice.dueDate)}.\n\n`;
    body += `The total balance is ${formatCurrency(invoice.amount, invoice.currency)}. I've already wrapped up all deliverables for review. Please let me know once the transfer is processed.\n\n`;
  }
  
  body += `Thanks so much for working together!\n\nBest,\n[Your Name]`;
  
  return { subject, body };
}

/**
 * Safely resolves the system's timezone name, falling back to 'Asia/Jakarta' if it fails.
 * @returns {string}
 */
export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
  } catch (e) {
    return 'Asia/Jakarta';
  }
}

/**
 * Maps common abbreviations to standard IANA timezone names and verifies correctness.
 * @param {string} tz
 * @returns {string}
 */
export function getEffectiveTimezone(tz) {
  if (!tz) return 'Asia/Jakarta';
  const cleanTz = tz.trim();
  const tzMap = {
    'WIB': 'Asia/Jakarta',
    'WITA': 'Asia/Makassar',
    'WIT': 'Asia/Jayapura',
    'EST': 'America/New_York',
    'EDT': 'America/New_York',
    'CST': 'America/Chicago',
    'CDT': 'America/Chicago',
    'MST': 'America/Denver',
    'MDT': 'America/Denver',
    'PST': 'America/Los_Angeles',
    'PDT': 'America/Los_Angeles',
    'UTC': 'UTC',
    'GMT': 'UTC'
  };

  const mapped = tzMap[cleanTz.toUpperCase()];
  if (mapped) return mapped;

  try {
    Intl.DateTimeFormat(undefined, { timeZone: cleanTz });
    return cleanTz;
  } catch (e) {
    return 'Asia/Jakarta';
  }
}

/**
 * Calculates the offset from UTC in milliseconds for a specific timezone and date.
 * @param {string} tz
 * @param {Date} date
 * @returns {number}
 */
export function getTzOffset(tz, date = new Date()) {
  const resolvedTz = getEffectiveTimezone(tz);
  try {
    const tzString = date.toLocaleString('en-US', { timeZone: resolvedTz, timeZoneName: 'longOffset' });
    const match = tzString.match(/GMT([+-]\d+)(?::(\d+))?/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      return (hours * 60 + (hours < 0 ? -minutes : minutes)) * 60000;
    }
  } catch (e) {
    console.error('Failed to get offset for resolved timezone:', resolvedTz, e);
  }
  return 0;
}

/**
 * Formats a raw date range into a friendly English display format (e.g. Jun 7, 2026 – Jun 13, 2026).
 * Uses UTC/timezone-noon construction to avoid midnight edge cases shifting the date.
 * @param {string|Date} dateStart
 * @param {string|Date} dateEnd
 * @param {string} timezone
 * @returns {string}
 */
export function formatDateRange(dateStart, dateEnd, timezone) {
  const cleanTz = timezone ? getEffectiveTimezone(timezone) : 'UTC';
  const lang = getLanguage() || 'en';
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  
  const format = (dStr) => {
    if (!dStr) return '';
    if (dStr instanceof Date) {
      return dStr.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: cleanTz });
    }
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      // Construct at noon to ensure formatting in other timezones doesn't shift the day boundary
      const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: cleanTz });
    }
    return new Date(dStr).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: cleanTz });
  };
  
  const startStr = format(dateStart);
  if (!dateEnd) return startStr;
  const endStr = format(dateEnd);
  return `${startStr} – ${endStr}`;
}

/**
 * Formats a 24-hour time string into a 12-hour AM/PM format (e.g. 09:00 AM).
 * @param {string} time - HH:MM
 * @param {string} timezone
 * @returns {string}
 */
export function formatTimeForTimezone(time, timezone) {
  if (!time) return 'TBD';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  const lang = getLanguage() || 'en';
  if (lang === 'id') {
    return `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}`;
  }
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  
  return `${String(displayHours).padStart(2, '0')}:${displayMinutes} ${ampm}`;
}

/**
 * Converts a date and time from a source timezone to a target timezone.
 * Returns the date and time strings in the target timezone.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM
 * @param {string} sourceTz
 * @param {string} targetTz
 * @returns {{dateStr: string, timeStr: string}}
 */
export function convertDateTimeTimezone(dateStr, timeStr, sourceTz, targetTz) {
  const resolvedSource = getEffectiveTimezone(sourceTz);
  const resolvedTarget = getEffectiveTimezone(targetTz);
  
  if (!timeStr) {
    return { dateStr, timeStr: '' };
  }
  
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    
    const offsetDate = new Date(y, m - 1, d, h, min);
    const sourceOffset = getTzOffset(resolvedSource, offsetDate);
    const targetOffset = getTzOffset(resolvedTarget, offsetDate);
    
    const utcTime = Date.UTC(y, m - 1, d, h, min);
    const actualEpoch = utcTime - sourceOffset;
    const targetLocalTime = actualEpoch + targetOffset;
    
    const targetDateObj = new Date(targetLocalTime);
    
    if (!isNaN(targetDateObj.getTime())) {
      const targetY = targetDateObj.getUTCFullYear();
      const targetM = String(targetDateObj.getUTCMonth() + 1).padStart(2, '0');
      const targetD = String(targetDateObj.getUTCDate()).padStart(2, '0');
      const targetH = String(targetDateObj.getUTCHours()).padStart(2, '0');
      const targetMin = String(targetDateObj.getUTCMinutes()).padStart(2, '0');
      
      return {
        dateStr: `${targetY}-${targetM}-${targetD}`,
        timeStr: `${targetH}:${targetMin}`
      };
    }
  } catch (e) {
    console.error('Failed converting timezone', e);
  }
  
  return { dateStr, timeStr };
}

/**
 * Checks if a scheduled meeting is outside of the freelancer's working availability hours.
 * Converts the meeting time from the meeting's timezone to the freelancer's timezone first.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - HH:MM
 * @param {object} availability
 * @param {string} meetingTimezone
 * @returns {boolean}
 */
export function isOutsideWorkingHours(dateStr, timeStr, availability, meetingTimezone) {
  if (!dateStr || !availability) return false;

  const {
    workingDays = [1, 2, 3, 4, 5],
    workingHoursStart = '09:00',
    workingHoursEnd = '17:00',
    unavailableDates = [],
    timezone = 'Asia/Jakarta'
  } = availability;

  const targetTz = timezone || 'Asia/Jakarta';
  const sourceTz = meetingTimezone || targetTz;

  const converted = convertDateTimeTimezone(dateStr, timeStr, sourceTz, targetTz);
  const checkDateStr = converted.dateStr;
  const checkTimeStr = converted.timeStr;

  let checkDayOfWeek = -1;
  const [y, m, d] = checkDateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (!isNaN(dateObj.getTime())) {
    checkDayOfWeek = dateObj.getDay();
  }

  // 1. Check if the converted date is in the list of unavailable dates
  if (unavailableDates.includes(checkDateStr)) {
    return true;
  }

  // 2. Check if the day of week is a working day
  if (checkDayOfWeek !== -1) {
    if (!workingDays.includes(checkDayOfWeek)) {
      return true;
    }
  }

  // 3. Check if the time falls within working hours
  if (checkTimeStr) {
    if (checkTimeStr < workingHoursStart || checkTimeStr > workingHoursEnd) {
      return true;
    }
  }

  return false;
}

/**
 * Generates initials from a full name (e.g. "Aris Aulia" -> "AA", "Mohammad Irsyad Ridwan" -> "MR").
 * If the name is empty, returns "YK".
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return 'YK';
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean) return 'YK';
  const parts = clean.split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase() || 'YK';
  }
  const first = parts[0][0] || '';
  const last = parts[parts.length - 1][0] || '';
  return (first + last).toUpperCase() || 'YK';
}

/**
 * Returns customized delivery input/display labels based on freelancer template role.
 * @param {string} templateRole
 * @returns {{preview: string, final: string, raw: string}}
 */
export function getDeliveryLabels(templateRole) {
  const labels = {
    designer: {
      preview: "Design Preview",
      final: "Final Design Files",
      raw: "Editable Source Files"
    },
    video_editor: {
      preview: "First Cut",
      final: "Final Export",
      raw: "Source Project File"
    },
    copywriter: {
      preview: "Draft Document",
      final: "Final Copy",
      raw: "Usage Notes"
    },
    web_developer: {
      preview: "Staging Link",
      final: "Final URL",
      raw: "Handover Notes"
    },
    social_media_manager: {
      preview: "Content Calendar",
      final: "Caption Batch",
      raw: "Monthly Report"
    },
    ai_consultant: {
      preview: "Workflow Map",
      final: "Prompt Documentation",
      raw: "Demo Video"
    }
  };
  return labels[templateRole] || {
    preview: "Preview Link",
    final: "Final File Link",
    raw: "Source File Link"
  };
}

/**
 * Normalizes a URL link, ensuring it starts with http:// or https://
 * @param {string} url
 * @returns {string}
 */
export function normalizeLink(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Displays a glassmorphic confirmation warning modal prior to setting a project as completed.
 * @param {object} params
 * @param {function} params.onConfirm
 * @param {function} params.onReview
 * @param {string} [params.title]
 * @param {string} [params.message]
 * @param {string} [params.confirmText]
 * @param {string} [params.cancelText]
 */
export function showCompletionWarningModal({ onConfirm, onReview, title, message, confirmText, cancelText }) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5, 8, 16, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 100000; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;';
  
  const displayTitle = title || 'Complete this project?';
  const displayMsg = message || 'Some completion items may still be missing: client approval, final delivery, or payment confirmation.';
  const displayConfirm = confirmText || 'Move to Completed Anyway';
  const displayCancel = cancelText || 'Review Project';

  overlay.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 28px; width: 440px; max-width: 90%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
      <style>
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      </style>
      <div style="font-size: 2.5rem; margin-bottom: 16px; filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4));">⚠️</div>
      <h3 style="font-size: 1.35rem; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -0.01em;">${displayTitle}</h3>
      <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 26px;">
        ${displayMsg}
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn btn-primary" id="btn-warn-confirm" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 10px 16px; border-radius: 8px; font-weight: 700; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
          ${displayConfirm}
        </button>
        <button class="btn btn-secondary" id="btn-warn-review" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 10px 16px; border-radius: 8px; font-weight: 600; background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); color: #fff;">
          ${displayCancel}
        </button>
      </div>
    </div>
  `;
  
  overlay.querySelector('#btn-warn-confirm').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
  
  overlay.querySelector('#btn-warn-review').addEventListener('click', () => {
    overlay.remove();
    onReview();
  });
  
  document.body.appendChild(overlay);
}

/**
 * Displays a glassmorphic confirmation modal for generic prompts.
 * @param {object} params
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.confirmText]
 * @param {string} [params.cancelText]
 * @param {function} params.onConfirm
 * @param {function} params.onCancel
 */
export function showGenericConfirmationModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5, 8, 16, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); z-index: 100000; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;';
  
  overlay.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 28px; width: 420px; max-width: 90%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6); animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
      <style>
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      </style>
      <div style="font-size: 2.2rem; margin-bottom: 14px; filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4));">💼</div>
      <h3 style="font-size: 1.3rem; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: #fff; margin-bottom: 10px; letter-spacing: -0.01em;">${title}</h3>
      <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 24px;">
        ${message}
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="btn btn-primary" id="btn-generic-confirm" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 10px 16px; border-radius: 8px; font-weight: 700; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
          ${confirmText}
        </button>
        <button class="btn btn-secondary" id="btn-generic-cancel" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 10px 16px; border-radius: 8px; font-weight: 600; background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); color: #fff;">
          ${cancelText}
        </button>
      </div>
    </div>
  `;
  
  overlay.querySelector('#btn-generic-confirm').addEventListener('click', () => {
    overlay.remove();
    if (onConfirm) onConfirm();
  });
  
  overlay.querySelector('#btn-generic-cancel').addEventListener('click', () => {
    overlay.remove();
    if (onCancel) onCancel();
  });
  
  document.body.appendChild(overlay);
}

/**
 * Generates a professional client delivery message based on the project's delivery status.
 * @param {object} project
 * @returns {string}
 */
export function getDeliveryMessageText(project) {
  const clientName = project.clientName ? project.clientName.split('(')[0].trim() : 'Client';
  const projectName = project.title;
  const previewLink = project.previewLink || project.draftFileLink || project.briefLink || '[Preview Link]';
  const finalLink = project.finalFileLink || project.finalDeliveryLink || '[Final File Link]';
  const handoverNotes = project.handoverNotes || '[Handover Notes]';

  if (project.deliveryStatus === 'Handover Complete') {
    return `Hi ${clientName}, ${projectName} is now complete. Final files and handover notes have been delivered. Thank you for working together on this project.`;
  }
  if (project.deliveryStatus === 'Final Delivered') {
    return `Hi ${clientName}, the final files for ${projectName} have been delivered. You can access them here: ${finalLink}. I’ve also included handover notes below:\n\n${handoverNotes}`;
  }
  if (project.deliveryStatus === 'Waiting Feedback' || project.deliveryStatus === 'Draft Submitted') {
    return `Hi ${clientName}, I’ve submitted the latest version of ${projectName} for your review. You can check it here: ${previewLink}. Please send your feedback when ready.`;
  }
  return `Hi ${clientName}, here is the latest delivery update for ${projectName}. You can review the submitted work here: ${previewLink}. Please let me know if you have any feedback or approval.`;
}
