/* ==========================================================================
   ALURKARYA - SAFE AI PROMPT CONTEXT BUILDER
   ========================================================================== */

/**
 * Builds a secure, formatted context object for AI Prompt Generation.
 * Supports 'client-facing' (safe) and 'internal' modes to prevent exposing private data.
 *
 * @param {object} project - The project object
 * @param {object} client - The client object
 * @param {object} freelancerProfile - The freelancer's profile metadata
 * @param {object} options - Options containing { mode: 'client-facing' | 'internal' }
 * @returns {object} The safe contextual data
 */
export function buildPromptContext(project, client, freelancerProfile, options = {}) {
  const mode = options.mode || 'client-facing'; // Default to safe client-facing mode
  const p = project || {};
  const c = client || {};
  const cm = c.clientMemory || {};
  const f = freelancerProfile || {};

  // Helper to fallback gracefully to readable placeholders if data is missing
  const getVal = (val, placeholder) => {
    if (val === undefined || val === null || val === "" || Number.isNaN(val)) {
      return placeholder;
    }
    return val;
  };

  const context = {
    // Project
    projectTitle: getVal(p.title, "[Project Name]"),
    clientName: getVal(c.name || p.clientName, "[Client Name]"),
    stage: getVal(p.stage, "[Stage]"),
    priority: getVal(p.priority, "[Priority]"),
    deadline: getVal(p.dueDate, "[Due Date]"),
    nextAction: getVal(p.nextAction, "[Next Action]"),
    category: getVal(p.category, "[Category]"),
    templateRole: getVal(p.templateRole, "[Template Role]"),
    revisionCount: getVal(p.revisionCount, 0),
    maxRevision: getVal(p.maxRevision, 3),
    approvalStatus: getVal(p.approvalStatus, "[Approval Status]"),
    budget: getVal(p.budget, 0),
    projectCurrency: getVal(p.projectCurrency, "IDR"),
    invoiceCurrency: getVal(p.invoiceCurrency, "IDR"),
    paymentCurrency: getVal(p.paymentCurrency, "IDR"),

    // Delivery
    deliveryStatus: getVal(p.deliveryStatus || p.deliveryChecklistStatus, "[Delivery Status]"),
    previewLink: getVal(p.previewLink || p.previewUrl, "[Preview Link]"),
    finalFileLink: getVal(p.finalFileLink || p.finalFileUrl, "[Final File Link]"),
    sourceFileLink: getVal(p.sourceFileLink || p.rawFileLink || p.rawFileDownloadLink, "[Source File Link]"),
    rawFileLink: getVal(p.rawFileLink || p.sourceFileLink || p.rawFileDownloadLink, "[Source File Link]"),
    deliveryDate: getVal(p.deliveryDate || p.handoverDate, "[Delivery Date]"),
    handoverNotes: getVal(p.handoverNotes || p.setupInstructions, "[Handover Notes]"),
    clientFeedbackSummary: getVal(p.clientFeedbackSummary || p.revisionNotes, "[Client Feedback]"),
    deliveryChecklist: p.deliveryChecklist || [],
    revisionRule: getVal(p.revisionRule, "[Revision Rule]"),

    // Invoice
    invoiceStatus: getVal(p.invoiceStatus, "Not Created"),
    paymentStatus: getVal(p.paymentStatus, "Not Started"),
    invoiceNumber: getVal(p.invoiceNumber, "[Invoice Number]"),
    invoiceAmount: getVal(p.invoiceAmount, 0),
    invoiceDueDate: getVal(p.invoiceDueDate, "[Invoice Due Date]"),
    amountPaid: getVal(p.amountPaid, 0),
    amountDue: getVal(p.amountDue, 0),
    lastFollowUpDate: getVal(p.lastFollowUpDate, "[Last Follow-Up Date]"),
    nextFollowUpDate: getVal(p.nextFollowUpDate, "[Next Follow-Up Date]"),
    receiptLink: getVal(p.receiptLink || p.paymentReceiptLink, "[Receipt Link]"),
    invoiceFileLink: getVal(p.invoiceFileLink, "[Invoice Link]"),

    // Freelancer
    freelancerName: getVal(f.freelancerName, "[Freelancer Name]"),
    freelancerRole: getVal(f.freelancerRole, "[Freelancer Role]"),
    portfolioLink: getVal(f.freelancerPortfolioLink, "[Portfolio Link]"),

    // Meeting
    meetingDate: getVal(p.meetingDate, "[Meeting Date]"),
    meetingType: getVal(p.meetingType, "[Meeting Type]"),
    clientRequest: getVal(p.clientRequest, "[Client Request]"),
    keyDiscussionPoints: getVal(p.keyDiscussionPoints || p.meetingNotes, "[Meeting Notes / Discussion Points]"),
    decisionMade: getVal(p.decisionMade, "[Decisions Made]"),
    actionItems: getVal(p.actionItems, "[Action Items]"),
    clientConcern: getVal(p.clientConcern, "[Client Concerns]"),
    clientExpectation: getVal(p.clientExpectation, "[Client Expectations]"),
    clientVisibleNotes: getVal(p.clientVisibleNotes || cm.clientVisibleNotes, ""),
  };

  // Safe mode segmentation
  if (mode === 'internal') {
    // Internal strategy / AI context can include all client memory safely
    context.clientMemory = {
      preferredChannel: getVal(cm.preferredChannel, "[Preferred Channel]"),
      communicationStyle: getVal(cm.communicationStyle, "[Communication Style]"),
      tonePreference: getVal(cm.tonePreference, "[Tone Preference]"),
      approvalStyle: getVal(cm.approvalStyle, "[Approval Style]"),
      revisionPattern: getVal(cm.revisionPattern, "[Revision Pattern]"),
      paymentBehavior: getVal(cm.paymentBehavior, "[Payment Behavior]"),
      paymentReminderStyle: getVal(cm.paymentReminderStyle, "[Payment Reminder Style]"),
      deliveryPreference: getVal(cm.deliveryPreference, "[Delivery Preference]"),
      filePreference: getVal(cm.filePreference, "[File Preference]"),
      clientVisibleNotes: getVal(cm.clientVisibleNotes, "[Client-Facing Notes]"),
      relationshipStatus: getVal(cm.relationshipStatus || c.relationshipStatus, "[Relationship Status]"),
      importantNotes: getVal(cm.importantNotes || c.importantNotes, "[Important Notes]"),
      clientRiskNotes: getVal(cm.clientRiskNotes || c.clientRiskNotes, "[Client Risk Notes]"),
      lastMeetingSummary: getVal(cm.lastMeetingSummary, "[Last Meeting Summary]"),
      lastProjectSummary: getVal(cm.lastProjectSummary, "[Last Project Summary]"),
    };
    context.internalNotes = getVal(p.internalNotes || p.notes, "[Internal Notes]");
    context.paymentNotes = getVal(p.paymentNotes || p.internalPaymentNotes, "[Internal Payment Notes]");
  } else {
    // Client-facing mode: strictly exclude private details from output
    context.clientMemory = {
      // Expose delivery preferences ONLY if explicitly allowed
      deliveryPreference: cm.shareDeliveryPref ? getVal(cm.deliveryPreference, "[Delivery Preference]") : "",
      filePreference: cm.shareDeliveryPref ? getVal(cm.filePreference, "[File Preference]") : "",
      clientVisibleNotes: getVal(cm.clientVisibleNotes, ""),
      preferredChannel: getVal(cm.preferredChannel, ""), // Kept as empty or for structural logic only
      tonePreference: getVal(cm.tonePreference, ""),
      communicationStyle: getVal(cm.communicationStyle, ""),
    };
    
    context.clientRiskNotes = "";
    context.internalNotes = "";
    context.paymentNotes = "";
    context.relationshipStatus = "";
    context.importantNotes = "";
  }

  return context;
}
