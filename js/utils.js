/* ==========================================================================
   FREELANCER PROJECT OS - UTILITY HELPERS
   ========================================================================== */

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
 * @param {string} currency - IDR, USD, SGD, MYR, EUR
 * @returns {string}
 */
export function formatCurrency(value, currency = 'IDR') {
  if (typeof value !== 'number') return 'Rp0';
  
  if (currency === 'IDR') {
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    return `Rp${formatted}`;
  }
  
  // USD, SGD, MYR, EUR formatting
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
  
  const symbol = {
    USD: '$',
    SGD: 'S$',
    MYR: 'RM',
    EUR: '€'
  }[currency] || '$';
  
  return `${symbol}${formatted}`;
}

/**
 * Formats a raw date string (YYYY-MM-DD) into a friendly human date.
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return 'No Date';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
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
  if (!dueDateStr) return { isOverdue: false, text: 'No deadline', daysDiff: 999 };
  
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
      text: `${Math.abs(diffDays)}d overdue`,
      daysDiff: diffDays
    };
  } else if (diffDays === 0) {
    return {
      isOverdue: false,
      text: 'due today',
      daysDiff: 0
    };
  } else if (diffDays === 1) {
    return {
      isOverdue: false,
      text: 'due tomorrow',
      daysDiff: 1
    };
  } else {
    return {
      isOverdue: false,
      text: `${diffDays} days left`,
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
  if (!dueDateStr) {
    return {
      status: 'none',
      text: 'No deadline',
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
      text: 'Overdue',
      isOverdue: true,
      daysDiff: diffDays
    };
  } else if (diffDays === 0) {
    return {
      status: 'today',
      text: 'Due today',
      isOverdue: false,
      daysDiff: 0
    };
  } else if (diffDays <= 3) {
    return {
      status: 'soon',
      text: 'Due soon',
      isOverdue: false,
      daysDiff: diffDays
    };
  } else {
    return {
      status: 'normal',
      text: formatDate(dueDateStr),
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
  
  const format = (dStr) => {
    if (!dStr) return '';
    if (dStr instanceof Date) {
      return dStr.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: cleanTz });
    }
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      // Construct at noon to ensure formatting in other timezones doesn't shift the day boundary
      const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: cleanTz });
    }
    return new Date(dStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: cleanTz });
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
