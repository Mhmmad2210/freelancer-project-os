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
      text: 'Belum ada deadline',
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
