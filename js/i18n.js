/* ==========================================================================
   ALURKARYA - GLOBAL LANGUAGE TRANSLATION SYSTEM
   ========================================================================== */

export const translations = {
  en: {
    // General / Actions
    save: "Save",
    saveProfile: "Save Profile",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",
    edit: "Edit",
    add: "Add",
    back: "Back",
    confirm: "Confirm",
    ok: "OK",
    search: "Search...",
    sortBy: "Sort by",
    all: "All",
    none: "None",
    tbd: "TBD",
    comingSoon: "Coming Soon",
    history: "History",
    currency: "Currency",
    projectCurrency: "Project Currency",
    invoiceCurrency: "Invoice Currency",
    paymentCurrency: "Payment Currency",
    amountDue: "Amount Due",
    amountPaid: "Amount Paid",
    currencyMismatchWarning: "Invoice currency differs from project currency.",
    paymentCurrencyMismatchWarning: "Payment currency differs from invoice currency. Amount due calculation is paused.",
    totalsGroupedHelper: "Totals are grouped by currency.",
    toast: {
      langUpdated: "Language updated.",
      profileUpdated: "Profile updated.",
      defaultCurrencyUpdated: "Default currency updated.",
      backupExported: "Workspace backup file exported successfully",
      backupImported: "Workspace restored successfully from backup",
      backupImportFailed: "Structural check failed. Invalid workspace backup format.",
      workspaceReset: "Workspace reset to baseline defaults",
      accessResetConfirm: "Are you sure you want to reset access? You will need to enter the access password again.",
      promptCopied: "AI Prompt successfully copied to clipboard!",
      messageCopied: "Message successfully copied to clipboard!",
      summaryCopied: "Internal summary successfully copied to clipboard!",
      copyFailed: "Failed to copy text to clipboard.",
      clientNameEmpty: "Client name cannot be empty.",
      clientCreated: "New client successfully created and linked.",
      invoiceApprovalWarning: "Invoice should be sent after client approval.",
      projectCompleted: "Project moved to Completed.",
      projectReviewing: "Reviewing project details.",
      stageUpdated: "Stage updated to: {stage}",
      revisionLimitReached: "Revision limit has been reached.",
      projectReturnInProgress: "Project returned to In Progress for revision work.",
      approvalUpdated: "Approval status updated to: {status}",
      invoiceNumberEmpty: "Invoice number cannot be empty.",
      invoiceSentWaitingPayment: "Invoice sent. Project moved to Waiting Payment.",
      projectReopened: "Project reopened.",
      rawFileSaved: "Raw file delivery link saved!",
      projectMovedInvoiceSent: "Project moved to Invoice Sent stage.",
      projectMovedWaitingPayment: "Project moved to Waiting Payment stage.",
      invoiceFollowUpCopied: "Invoice follow-up message copied.",
      copyMessageFailed: "Failed to copy message.",
      deliveryMessageCopied: "Delivery message copied.",
      projectResumed: "Project resumed (In Progress).",
      projectMovedClientReview: "Project moved to Client Review.",
      deliverableLinked: "Deliverable file linked.",
      generatedDraftInvoice: "Generated draft invoice.",
      projectRemoved: "Project successfully removed.",
      clientMemoryPromptCopied: "Client memory prompt copied.",
      promptHistoryCannotCopy: "Prompt history view cannot be copied directly.",
      itemCopied: "{item} copied.",
      deliverableSentRevisionIncremented: "Deliverable sent! Revision round incremented.",
      deliverableApproved: "Deliverable approved!",
      availabilitySaved: "Availability configuration saved!",
      timezoneUpdated: "Timezone updated to local: {timezone}",
      unavailableDateAdded: "Added unavailable date: {date}",
      unavailableDateRemoved: "Removed unavailable date: {date}",
      clientRecordsUpdated: "Client directory records updated.",
      clientRegistered: "Client successfully registered.",
      clientRemoved: "Client successfully removed",
      removeClientConfirm: "Remove \"{name}\" from directory?\nExisting project billing indexes will be preserved.",
      templateApplied: "Template applied successfully!",
      templateApplyFailed: "Failed to apply template."
    },
    // Sidebar
    sidebar: {
      dashboard: "Dashboard",
      workspaceBoard: "Workspace Board",
      plannerHub: "Planner Hub",
      weeklyFocus: "Weekly Focus",
      clientHub: "Client Hub",
      invoiceLedger: "Invoice Ledger",
      quotations: "Quotations",
      portfolioSandbox: "Portfolio Sandbox",
      settings: "Settings",
      freelancerProfile: "Freelancer Profile",
      tagline: "Manage freelance projects from client to paid."
    },
    // Workspace Board (Kanban)
    kanban: {
      searchPlaceholder: "Search projects, clients, or tags...",
      sortBy: "Sort by",
      viewSimple: "Simple",
      viewDetailed: "Detailed",
      collapseAll: "Collapse All",
      expandAll: "Expand All",
      addProject: "Add Project",
      templates: "Templates",
      emptyStateTitle: "Start with a freelancer template",
      emptyStateDesc: "Choose your freelance type and AlurKarya will create a sample client-to-paid workflow for you.",
      chooseTemplate: "Choose Template",
      createProject: "Create Project",
      noProjects: "No projects in this stage",
      emptyBoard: "No projects found. Use Templates or Add Project to start.",
      stages: {
        new_lead: "New Lead",
        proposal_sent: "Queue",
        in_progress: "In Progress",
        client_review: "Client Review",
        revision: "Revision",
        invoice_sent: "Invoice Sent",
        waiting_payment: "Waiting Payment",
        on_hold: "On Hold",
        completed: "Completed"
      }
    },
    // Project Modal
    projectModal: {
      setup: "Project Setup",
      client: "Client",
      stage: "Stage",
      priority: "Priority",
      category: "Category",
      customCategory: "Custom Category",
      nextAction: "Next Action",
      deadline: "Deadline",
      meetingNotesTitle: "Meeting Notes",
      deliveryCenter: "Delivery Center",
      invoicePayment: "Invoice & Payment",
      clientMemorySnapshot: "Client Memory Snapshot",
      aiPromptHelpers: "AI Prompt Helpers",
      saveProject: "Save Project",
      deleteProject: "Delete Project",
      budget: "Budget",
      description: "Description",
      tags: "Tags",
      lockedStageWarning: "To change details of this project, move it back to Queue.",
      completedHighlight: "Project completed and all payments received.",
      reopenProject: "Reopen Project",
      rawFileLink: "Link to Send Raw / Source File",
      rawFileLinkDesc: "Upload the raw/source file link to be sent or downloaded by the client.",
      saveLink: "Save Link",
      clientRiskNotes: "Client Risk Notes",
      internalNotes: "Internal Notes",
      paymentNotes: "Internal Payment Notes",
      preferredChannel: "Preferred Channel",
      communicationStyle: "Communication Style",
      tonePreference: "Tone Preference",
      approvalStyle: "Approval Style",
      revisionPattern: "Revision Pattern",
      paymentBehavior: "Payment Behavior",
      paymentReminderStyle: "Payment Reminder Style",
      deliveryPreference: "Delivery Preference",
      filePreference: "File Preference",
      clientVisibleNotes: "Client-Facing Notes",
      relationshipStatus: "Relationship Status",
      importantNotes: "Important Notes",
      lastMeetingSummary: "Last Meeting Summary",
      lastProjectSummary: "Last Project Summary",
      clientPreference: "Client Preference",
      clientPreferencePlaceholder: "e.g. Prefers Monday updates",
      communicationStylePlaceholder: "e.g. WhatsApp only, direct call",
      paymentBehaviorPlaceholder: "e.g. Needs 1 reminder follow-up",
      revisionPatternPlaceholder: "e.g. Usually asks for extra rounds",
      deliveryPreferencePlaceholder: "e.g. Figma + Google Drive SVGs",
      clientRiskNotesPlaceholder: "e.g. Scope creep prone",
      importantNotesPlaceholder: "Other critical preferences...",
      lastProjectSummaryPlaceholder: "Summary of previous work...",
      lastMeetingSummaryPlaceholder: "Notes from previous meeting...",
      noClientAssociated: "No client associated with this project. Select a client in the sidebar to enable Client Memory.",
      clientVisibleNotesDesc: "These notes may appear in the Client Workspace Portal.",
      addCustomDeliveryStep: "Add custom delivery step...",
      addStep: "Add Step",
      copyDeliveryMsg: "Copy Delivery Msg",
      handoverNotesPrompt: "Handover Notes Prompt",
      revisionSummaryMsg: "Revision Summary Msg",
      finalChecklistPrompt: "Final Checklist Prompt",
      selectTemplate: "Select Template",
      selectTone: "Select Tone",
      clientSafePrivacyShield: "Client-safe privacy shield",
      clientSafePrivacyShieldDesc: "Hides internal risk notes & private strategy fields",
      missingContextHelper: "⚠️ Some project details are missing. The prompt will use safe placeholders.",
      reviewContentBeforeCopying: "🔒 Review content before copying",
      regenerate: "Regenerate",
      copyPromptToClipboard: "Copy Prompt to Clipboard",
      lockedStageWarningHtml: "💡 To change details of this project, move it back to <strong>Queue</strong>.",
      deliveryCompletionChecklist: "Delivery Completion Checklist",
      clientApproved: "Client approved",
      invoiceSentCheck: "Invoice sent",
      paymentReceivedCheck: "Payment received",
      finalFilesSentCheck: "Final files sent",
      revisionTracking: "🔄 Revision Tracking",
      workOnRevision: "🛠️ Work on Revision",
      revisions: "Revisions",
      paymentReminder: "💳 Payment Reminder",
      paymentReminderDesc: "This stage is used as a payment reminder, not for working on the project.",
      paymentDueDate: "Payment Due Date",
      clientApprovalStatus: "Client Approval Status",
      projectStageStatus: "Project Stage Status",
      onHoldProject: "⏸️ On Hold Project",
      onHoldProjectDesc: "This project is temporarily on hold. Add a hold reason so the project does not get lost from tracking. Set a follow-up date to remind you when the project needs to be checked again.",
      holdReason: "Hold Reason",
      holdReasonPlaceholder: "Example: Waiting for client budget decision...",
      holdDate: "Hold Date",
      nextFollowUp: "Next Follow Up",
      resumeProject: "Resume Project",
      waitingClient: "Waiting Client",
      clientNameCompany: "Client Name / Company",
      noClientSelected: "-- No client selected --",
      registerNewClient: "+ Register New Client",
      clientTypeLabel: "Type",
      corporate: "Corporate",
      general: "General",
      newClientName: "New Client Name",
      newClientNamePlaceholder: "Example: Sarah Connor",
      clientType: "Client Type",
      clientTypeGeneral: "General (Freelancer / Individual)",
      clientTypeCorporate: "Corporate (Company / Group)",
      saveConnectClient: "Save & Connect Client",
      estimatedValue: "Estimated Value",
      deadlineTooltip: "Deadline for completion to track overdue status.",
      clientMemorySnapshotTitle: "🧠 Client Memory Snapshot",
      noClientSelectedSnapshot: "No client selected.",
      noClientMemoryAdded: "No client memory added yet.",
      addMemoryContext: "Add memory context",
      openFullClientMemory: "Open Full Client Memory",
      paymentTracking: "Payment Tracking",
      paymentStatusTooltip: "Current payment tracking state for cash flow monitoring.",
      notInvoiced: "Not Invoiced",
      nextActionTooltip: "The immediate concrete task to move the project forward.",
      nextActionPlaceholder: "What is the next task?",
      additionalInfo: "Additional Info",
      additionalInfoDesc: "Internal notes, meeting link, and payment terms",
      viewDetails: "View Details",
      liveMeetingPortal: "Live Meeting Portal",
      meetLinkPlaceholder: "https://meet.google.com/abc-defg",
      meetNotesPlaceholder: "Password, notes...",
      quotationReference: "Quotation Reference",
      meetPlatform: "Platform",
      meetLink: "Meeting Link URL",
      meetNotes: "Session Notes",
      files: "Files & Delivery Links",
      briefLink: "Brief / Specification Link",
      refLink: "Reference Asset Folder Link",
      meetDate: "Meeting Date",
      meetTime: "Meeting Time",
      meetPlatformType: "Meeting Platform / Type",
      meetRoomLink: "Meeting Room Link",
      invoicePaymentDesc: "Track invoice details, payment due date, follow-up reminders, and payment confirmation.",
      invoicePaymentTitle: "Invoice & Payment",
      outputLanguage: "Output Language",
      useAppLang: "Use App Language"
    },
    category: {
      design: "Design",
      development: "Development",
      production: "Production",
      marketing: "Marketing",
      consulting: "Consulting",
      copywriting: "Copywriting",
      addCustom: "Add custom category..."
    },
    // Priority levels
    priority: {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
      tbd: "TBD"
    },
    // Access Gate
    access: {
      welcome: "Welcome to AlurKarya",
      tagline: "Manage freelance projects from client to paid.",
      passwordLabel: "Access Password",
      passwordPlaceholder: "Enter your password",
      submitBtn: "Enter Workspace",
      hasNoAccess: "Don’t have access yet? Enter activation code",
      successMsg: "Access granted. Preparing your workspace…",
      activationLabel: "Activation Code",
      activationPlaceholder: "Enter your activation code",
      activateBtn: "Activate Access",
      backToLogin: "Back to login",
      footerNote: "Private access for AlurKarya early users.",
      errorEmptyPassword: "Please enter your password.",
      errorInvalidPassword: "Incorrect password. Please try again.",
      errorEmptyCode: "Please enter your activation code.",
      errorInvalidCode: "Invalid activation code. Please contact support."
    },
    // Delivery Center
    delivery: {
      status: "Delivery Status",
      previewLink: "Preview Link",
      draftLink: "Draft Link",
      reviewLink: "Review Link",
      fileFolderLink: "File Folder Link",
      finalFileLink: "Final File Link",
      rawSourceLink: "Raw / Source File Link",
      deliveryDate: "Delivery Date",
      handoverNotes: "Handover Notes",
      clientVisibleNotes: "Client Visible Notes",
      checklist: "Delivery Checklist",
      confirmedDelivery: "Client confirmed final delivery",
      copyDeliveryMessage: "Copy Delivery Message"
    },
    // Invoicing
    invoice: {
      status: "Invoice Status",
      paymentStatus: "Payment Status",
      number: "Invoice Number",
      amount: "Invoice Amount",
      dueDate: "Invoice Due Date",
      amountPaid: "Amount Paid",
      amountDue: "Amount Due",
      paymentMethod: "Payment Method",
      lastFollowUp: "Last Follow-up Date",
      nextFollowUp: "Next Follow-up Date",
      receiptLink: "Receipt / Payment Proof Link",
      copyFollowUp: "Copy Invoice Follow-up",
      paymentOverdue: "Payment Overdue",
      date: "Invoice Date",
      paymentDueDate: "Payment Due Date"
    },
    // Status display mappings
    status: {
      delivery: {
        not_submitted: "Not Submitted",
        draft_submitted: "Draft Submitted",
        waiting_feedback: "Waiting Feedback",
        revision_needed: "Revision Needed",
        approved: "Approved",
        final_delivered: "Final Delivered",
        handover_complete: "Handover Complete"
      },
      invoice: {
        not_created: "Not Created",
        draft: "Draft",
        sent: "Sent",
        waiting_payment: "Waiting Payment",
        overdue: "Overdue",
        paid: "Paid",
        cancelled: "Cancelled"
      },
      payment: {
        not_started: "Not Started",
        waiting_payment: "Waiting Payment",
        dp_paid: "DP Paid",
        partially_paid: "Partially Paid",
        payment_received: "Payment Received",
        fully_paid: "Fully Paid",
        overdue: "Overdue",
        cancelled: "Cancelled"
      },
      approval: {
        not_submitted: "Not Submitted Yet",
        pending_review: "Pending Review",
        approved: "Approved",
        needs_revision: "Needs Revision"
      },
      relationship: {
        new_client: "New Client",
        active_client: "Active Client",
        repeat_client: "Repeat Client",
        vip_client: "VIP Client",
        at_risk: "At Risk",
        dormant: "Dormant"
      }
    },
    // Planner Hub
    planner: {
      calendar: "Planner Calendar",
      weekly: "Weekly",
      monthly: "Monthly",
      upcomingMeetings: "Upcoming Meetings",
      followUpNeeded: "Follow-up Needed",
      dueSoon: "Due Soon",
      workingHours: "Working Hours & Availability",
      workingHoursSubtitle: "Configure your working days, hours, timezone, and unavailable dates. Meetings outside these hours will trigger a gentle warning.",
      useLocalTimezone: "Use Local Timezone",
      unavailableDates: "Unavailable Dates / Holidays",
      outsideHoursWarning: "Outside your working hours.",
      introText: "Manage client meetings, deadlines, invoice follow-ups, and your working availability in one connected dashboard.",
      timezone: "Timezone",
      timezoneDesc: "Detected from your device. You can change it manually anytime.",
      startTime: "Start Time",
      endTime: "End Time",
      workingDays: "Working Days",
      noUnavailableDates: "No unavailable dates added",
      addUnavailableDate: "Add Unavailable Date",
      meeting: "Meeting",
      followUp: "Follow-up",
      invoiceDue: "Invoice Due",
      paymentFollowUp: "Payment Follow-up",
      receiptCheck: "Receipt Check",
      review: "Review",
      gcalSync: "Google Calendar Sync",
      noMeetings: "No scheduled meetings",
      noFollowUpNeeded: "No follow-up needed",
      noUrgentDeadlines: "No urgent deadlines",
      onHoldFollowUp: "On Hold Follow-up",
      noHoldProjects: "No hold projects with follow-ups",
      checkInDate: "Check-in date",
      meetingNotesSummary: "Meeting Notes Summary",
      noMeetingNotes: "No meeting notes logged",
      noSummaryText: "No summary text",
      openFullNotes: "Open Full Notes",
      nextFollowUp: "Next Follow-up"
    },
    // Client view portal
    clientView: {
      projectStatus: "Project Status",
      timeline: "Client-to-Paid Timeline",
      submittedWork: "Submitted Work",
      approvalFeedback: "Approval & Feedback",
      invoicePayment: "Invoice & Payment",
      finalDelivery: "Final Delivery",
      copyUpdate: "Copy Client Update",
      emptyStateTitle: "No projects found",
      emptyStateDesc: "Add a client or create a project first to preview the client workspace.",
      freelancerPreviewMode: "Freelancer Preview Mode",
      previewModeDesc: "Preview how your client will see project status, submitted work, revision notes, approval state, invoice status, and final delivery.",
      selectClient: "Select Client",
      selectProject: "Select Project",
      onHoldDesc: "This project is currently paused. Your freelancer will follow up when it is ready to continue.",
      noSubmittedWork: "No submitted work link added yet.",
      openPreview: "Open Preview",
      waitingFeedback: "Waiting for client feedback.",
      approvedByClient: "Approved by client.",
      revisionInProgress: "Revision in progress.",
      handoverNotesTitle: "Handover & Installation Notes",
      clientConfirmation: "Client Confirmation",
      confirmedDesc: "Delivery has been formally accepted by the client.",
      waitingConfirmationDesc: "Waiting for client to confirm receipt of final deliverables.",
      confirmed: "Confirmed",
      pending: "Pending",
      portfolioWebsite: "Portfolio Website",
      noInvoiceSent: "No invoice has been sent yet."
    },
    // Client memory
    clientMemory: {
      title: "Client Memory",
      titleShort: "Memory",
      communication: "Communication",
      reviewRevision: "Review & Revision",
      paymentBehavior: "Payment Behavior",
      deliveryPreference: "Delivery Preference",
      relationshipNotes: "Relationship Notes",
      clientFacingNotes: "Client-Facing Notes",
      saveMemory: "Save Client Memory",
      copySummary: "Copy Client Summary",
      extractMemory: "Extract Client Memory"
    },
    // AI Prompts
    aiPrompts: {
      title: "AI Prompt Helpers",
      clientCommunication: "Client Communication",
      meetingMemory: "Meeting & Memory",
      delivery: "Delivery",
      invoicePayment: "Invoice & Payment",
      portfolioReview: "Portfolio & Review",
      planning: "Planning",
      readyMessage: "Ready Message",
      aiPrompt: "AI Prompt",
      internalSummary: "Internal Summary",
      copyPrompt: "Copy Prompt",
      copyMessage: "Copy Message",
      copySummary: "Copy Summary",
      clientSafeMode: "Client-safe mode",
      subtitle: "Generate copy-ready prompts and client messages from your project, client, delivery, invoice, and meeting context."
    },
    // Onboarding Templates
    templates: {
      title: "Start with a Freelancer Template",
      subtitle: "Start faster with a workflow template designed for your type of freelance work.",
      chooseTemplate: "Choose Template",
      useThisTemplate: "Use This Template",
      addTemplateProjects: "Add template projects",
      warningText: "Existing projects will not be deleted.",
      designer: "Designer",
      designer_desc: "For brand, social media, presentation, and visual design projects.",
      video_editor: "Video Editor",
      video_editor_desc: "For reels, YouTube edits, client review cuts, and final exports.",
      copywriter: "Copywriter",
      copywriter_desc: "For landing pages, ad copy, emails, sales pages, and content scripts.",
      web_developer: "Web Developer",
      web_developer_desc: "For landing pages, websites, web app prototypes, bug fixes, and handovers.",
      social_media_manager: "Social Media Manager",
      social_media_manager_desc: "For content calendars, monthly retainers, caption batches, reports, and approvals.",
      ai_consultant: "AI Consultant",
      ai_consultant_desc: "For AI workflow audits, automation setup, prompt systems, training, and handover.",
      general: "General Freelancer",
      general_desc: "For flexible client projects with review, revision, invoice, and delivery flow.",
      addTemplateProjectsQuestion: "Add template projects?",
      templateAlreadyApplied: "Template already applied",
      duplicateWarningText: "This template has already been added before. Do you want to add another copy?",
      addAnotherCopy: "Add Another Copy",
      seededVia: "Seeded via {template} template workflow.",
      sampleProjectDesc: "Sample project for {template} workflow.\n\nRevision Rule: {rule}",
      standardLimit: "Standard limit."
    },
    days: {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    tone: {
      professional: "Professional",
      friendly: "Friendly",
      firm: "Firm",
      warm: "Warm",
      concise: "Concise"
    },
    clientHub: {
      introText: "Track your clients, active projects, and total project value in one place. Keep notes, log WhatsApp details, and track follow-ups.",
      searchPlaceholder: "Search name, brand, WhatsApp, or email...",
      allStatuses: "-- All Statuses --",
      allChannels: "-- All Channels --",
      whatsapp: "WhatsApp",
      email: "Email",
      slack: "Slack",
      zoom: "Zoom",
      meet: "Google Meet",
      directCall: "Direct Call",
      other: "Other",
      addClient: "Add Client",
      noClientsTitle: "No clients in directory",
      noClientsDesc: "Add your first client to start launching custom proposals and invoicing workflows.",
      registerClient: "Register Client",
      colName: "Client & Business Name",
      colContact: "Contact Details",
      colStatus: "Client Status",
      colFollowUp: "Client Follow-Up",
      colProjects: "Active Projects",
      colValue: "Total Project Value",
      colActions: "Actions",
      needsReminder: "Needs reminder",
      personalContract: "Freelance Personal Contract",
      noEmail: "No email logged",
      noFollowUp: "No follow-up logged",
      editClientInfo: "Edit Client Info",
      registerNewClient: "Register New Client",
      fullName: "Full Client Name",
      businessBrandName: "Business / Brand Name",
      contactEmail: "Contact Email",
      phoneWhatsApp: "Phone or WhatsApp",
      lastFollowUpDate: "Last Client Follow-Up Date",
      clientStatus: "Client Status",
      statusLead: "Lead (Prospect)",
      statusActive: "Active Client",
      statusCompleted: "Completed Client",
      statusInactive: "Inactive Client",
      businessBrandPlaceholder: "e.g. Cyberdyne Systems",
      clientNotesPlaceholder: "Add contact summaries, specific request details...",
      clientNotes: "Client Notes",
      clientMemoryFields: "Client Memory Fields",
      saveClientDirectory: "Save Client Directory"
    },
    profile: {
      title: "Freelancer Profile",
      subtitle: "Configure your personal details, specialties, bio, location, and portfolio link. This data is synchronized with your sidebar profile card and the Client Workspace Portal.",
      sectionBranding: "Personal Workspace Branding",
      fullName: "Full Name",
      specialty: "Specialty / Role",
      email: "Email Address",
      location: "Location",
      bio: "Brief Bio",
      portfolioUrl: "Portfolio URL",
      avatarUrl: "Avatar Image URL",
      initials: "Custom Initials (Optional)",
      language: "Language / Bahasa",
      defaultCurrency: "Default Currency",
      defaultCurrencyHelper: "Used as the default currency for new projects and invoices.",
      openClientView: "Open Client View"
    },
    promptTemplates: {
      clientUpdate: {
        name: "Client Update Message",
        description: "Generate a weekly progress update message that highlights wins and next steps."
      },
      revisionBoundary: {
        name: "Revision Boundary Message",
        description: "Politely inform the client that they have reached the revision limit and explain fees."
      },
      scopeChange: {
        name: "Scope Change / Extra Revision Message",
        description: "Politely inform the client that their request is outside the original project scope."
      },
      testimonialRequest: {
        name: "Testimonial Request",
        description: "Politely request a testimonial or review from the client after completion."
      },
      proposalDraft: {
        name: "Proposal Draft Prompt",
        description: "Create a formal, structured freelance proposal to pitch to a lead."
      },
      scopeChecker: {
        name: "Scope Checker Prompt",
        description: "Check a client request against your original scope to flag potential scope creep."
      },
      meetingSummary: {
        name: "Meeting Summary Prompt",
        description: "Generate structured notes, deliverables, and action items from raw meeting notes."
      },
      clientMemoryExtraction: {
        name: "Client Memory Extraction Prompt",
        description: "Generate a prompt to extract client preferences and communication style from notes."
      },
      clientRelationshipSummary: {
        name: "Client Relationship Summary",
        description: "Generate a strategic internal summary of relationship health, risks, and next steps."
      },
      deliveryMessage: {
        name: "Delivery Message",
        description: "Draft a friendly, professional handover message to accompany final work."
      },
      handoverNotesPrompt: {
        name: "Handover Notes Prompt",
        description: "Create structured setup, documentation, or installation notes for client handoff."
      },
      revisionSummary: {
        name: "Revision Summary",
        description: "Politely summarize feedback points and how they were resolved for client signoff."
      },
      finalDeliveryChecklistPrompt: {
        name: "Final Delivery Checklist Prompt",
        description: "Create a checklist of final deliverables, formats, and handover tasks."
      },
      invoiceFollowupPrompt: {
        name: "Invoice Follow-up Prompt",
        description: "Draft a polite, professional invoice reminder based on terms and due date."
      },
      overduePaymentReminder: {
        name: "Overdue Payment Reminder",
        description: "Politely but firmly request payment for an overdue invoice."
      },
      paymentConfirmationMessage: {
        name: "Payment Confirmation Message",
        description: "Draft a professional receipt confirmation and thank-you note."
      },
      receiptRequestMessage: {
        name: "Receipt Request Message",
        description: "Politely request payment proof or transfer receipt from the client."
      },
      paymentSummaryPrompt: {
        name: "Payment Summary Prompt",
        description: "Create an internal summary of payments received, pending milestones, and totals."
      },
      portfolioCaseStudy: {
        name: "Portfolio Case Study",
        description: "Turn project milestones, deliverables, and outcome into a structured case study."
      },
      projectCompletionSummary: {
        name: "Project Completion Summary",
        description: "Generate an internal summary of project achievements, timeline stats, and next steps."
      },
      nextActionRecommendation: {
        name: "Next Action Recommendation",
        description: "Generate internal prompt to decide next action based on stage, deadline, and memory."
      },
      weeklyFocusSummary: {
        name: "Weekly Focus Summary",
        description: "Generate internal summary from due soon, overdue, and pending review projects."
      }
    },
    viewGuide: "View Guide",
    viewGuideTitle: "View Guided Start",
    onboarding: {
      modalTitle: "Start from 1 active project",
      modalSubtitle: "Do not setup everything at once. Choose one ongoing client project and fill its flow step-by-step.",
      step1Title: "Choose your type of work",
      step1Desc: "Designer, video editor, copywriter, web developer, social media manager, AI consultant, or general freelancer.",
      step2Title: "Add 1 active project",
      step2Desc: "Start with the project you are working on right now, not from an empty workspace.",
      step3Title: "Enter next action and deadline",
      step3Desc: "Just define the next step and when it needs to be completed.",
      ctaPrimary: "Start Setup",
      ctaSecondary: "Skip for now",
      linkFullGuide: "View full guide",
      cardTitle: "Start from 1 active project",
      cardStep1: "Select role",
      cardStep2: "Add project",
      cardStep3: "Add next action"
    }
  },
  id: {
    // Bahasa Indonesia
    save: "Simpan",
    saveProfile: "Simpan Profil",
    cancel: "Batal",
    delete: "Hapus",
    close: "Tutup",
    edit: "Edit",
    add: "Tambah",
    back: "Kembali",
    confirm: "Konfirmasi",
    ok: "OK",
    search: "Cari...",
    sortBy: "Urutkan berdasarkan",
    all: "Semua",
    none: "Tidak ada",
    tbd: "Belum Ditentukan",
    comingSoon: "Segera Hadir",
    history: "Riwayat",
    currency: "Mata Uang",
    projectCurrency: "Mata Uang Project",
    invoiceCurrency: "Mata Uang Invoice",
    paymentCurrency: "Mata Uang Pembayaran",
    amountDue: "Sisa Pembayaran",
    amountPaid: "Jumlah Dibayar",
    currencyMismatchWarning: "Mata uang invoice berbeda dengan mata uang project.",
    paymentCurrencyMismatchWarning: "Mata uang pembayaran berbeda dengan mata uang invoice. Perhitungan sisa pembayaran dihentikan sementara.",
    totalsGroupedHelper: "Total dikelompokkan berdasarkan mata uang.",
    toast: {
      langUpdated: "Bahasa berhasil diperbarui.",
      profileUpdated: "Profil berhasil diperbarui.",
      defaultCurrencyUpdated: "Mata uang default berhasil diperbarui.",
      backupExported: "File cadangan workspace berhasil diekspor",
      backupImported: "Workspace berhasil dipulihkan dari cadangan",
      backupImportFailed: "Pemeriksaan struktur gagal. Format cadangan tidak valid.",
      workspaceReset: "Workspace telah diatur ulang ke default awal",
      accessResetConfirm: "Apakah Anda yakin ingin mengatur ulang akses? Anda perlu memasukkan kata sandi akses kembali.",
      promptCopied: "AI Prompt berhasil disalin ke clipboard!",
      messageCopied: "Pesan berhasil disalin ke clipboard!",
      summaryCopied: "Ringkasan internal berhasil disalin ke clipboard!",
      copyFailed: "Gagal menyalin teks ke clipboard.",
      clientNameEmpty: "Nama client tidak boleh kosong.",
      clientCreated: "Client baru berhasil dibuat dan dihubungkan.",
      invoiceApprovalWarning: "Invoice sebaiknya dikirim setelah persetujuan client.",
      projectCompleted: "Project dipindahkan ke Selesai.",
      projectReviewing: "Meninjau detail project.",
      stageUpdated: "Tahap diperbarui menjadi: {stage}",
      revisionLimitReached: "Batas revisi telah tercapai.",
      projectReturnInProgress: "Project dikembalikan ke Sedang Dikerjakan untuk pengerjaan revisi.",
      approvalUpdated: "Status persetujuan diperbarui menjadi: {status}",
      invoiceNumberEmpty: "Nomor invoice tidak boleh kosong.",
      invoiceSentWaitingPayment: "Invoice dikirim. Project dipindahkan ke Menunggu Pembayaran.",
      projectReopened: "Project dibuka kembali.",
      rawFileSaved: "Link pengiriman file mentah disimpan!",
      projectMovedInvoiceSent: "Project dipindahkan ke tahap Invoice Terkirim.",
      projectMovedWaitingPayment: "Project dipindahkan ke tahap Menunggu Pembayaran.",
      invoiceFollowUpCopied: "Follow-up invoice berhasil disalin.",
      copyMessageFailed: "Gagal menyalin pesan.",
      deliveryMessageCopied: "Pesan pengiriman berhasil disalin.",
      projectResumed: "Project dilanjutkan (Sedang Dikerjakan).",
      projectMovedClientReview: "Project dipindahkan ke Review Client.",
      deliverableLinked: "File pengiriman berhasil ditautkan.",
      generatedDraftInvoice: "Draft invoice berhasil dibuat.",
      projectRemoved: "Project berhasil dihapus.",
      clientMemoryPromptCopied: "Prompt memori client berhasil disalin.",
      promptHistoryCannotCopy: "Tampilan riwayat prompt tidak dapat disalin secara langsung.",
      itemCopied: "{item} berhasil disalin.",
      deliverableSentRevisionIncremented: "Pekerjaan dikirim! Putaran revisi bertambah.",
      deliverableApproved: "Pekerjaan disetujui!",
      availabilitySaved: "Ketersediaan jam kerja berhasil disimpan!",
      timezoneUpdated: "Zona waktu diperbarui ke lokal: {timezone}",
      unavailableDateAdded: "Menambahkan tanggal libur/tidak tersedia: {date}",
      unavailableDateRemoved: "Menghapus tanggal libur/tidak tersedia: {date}",
      clientRecordsUpdated: "Data direktori client berhasil diperbarui.",
      clientRegistered: "Client baru berhasil terdaftar.",
      clientRemoved: "Client berhasil dihapus",
      removeClientConfirm: "Hapus \"{name}\" dari direktori?\nIndeks tagihan proyek yang ada akan tetap dipertahankan.",
      templateApplied: "Template berhasil diterapkan!",
      templateApplyFailed: "Gagal menerapkan template."
    },
    // Sidebar
    sidebar: {
      dashboard: "Dasbor",
      workspaceBoard: "Papan Kerja",
      plannerHub: "Pusat Jadwal",
      weeklyFocus: "Fokus Mingguan",
      clientHub: "Portal Workspace Client",
      invoiceLedger: "Ledger Invoice",
      quotations: "Penawaran",
      portfolioSandbox: "Sandbox Portofolio",
      settings: "Pengaturan",
      freelancerProfile: "Profil Freelancer",
      tagline: "Kelola project freelance dari lead hingga lunas."
    },
    // Workspace Board (Kanban)
    kanban: {
      searchPlaceholder: "Cari project, client, atau tag...",
      sortBy: "Urutkan berdasarkan",
      viewSimple: "Sederhana",
      viewDetailed: "Detail",
      collapseAll: "Ciutkan Semua",
      expandAll: "Bentangkan Semua",
      addProject: "Tambah Project",
      templates: "Template",
      emptyStateTitle: "Mulai dengan template freelancer",
      emptyStateDesc: "Pilih jenis pekerjaan freelance Anda dan AlurKarya akan membuat contoh alur kerja dari client hingga dibayar.",
      chooseTemplate: "Pilih Template",
      createProject: "Buat Project",
      noProjects: "Tidak ada project di tahap ini",
      emptyBoard: "Project tidak ditemukan. Gunakan Template atau Tambah Project untuk mulai.",
      stages: {
        new_lead: "Lead Baru",
        proposal_sent: "Antrean",
        in_progress: "Sedang Dikerjakan",
        client_review: "Review Client",
        revision: "Revisi",
        invoice_sent: "Invoice Terkirim",
        waiting_payment: "Menunggu Pembayaran",
        on_hold: "Ditunda",
        completed: "Selesai"
      }
    },
    // Project Modal
    projectModal: {
      setup: "Pengaturan Project",
      client: "Client",
      stage: "Tahap",
      priority: "Prioritas",
      category: "Kategori",
      customCategory: "Kategori Kustom",
      nextAction: "Langkah Berikutnya",
      deadline: "Tenggat Waktu",
      meetingNotesTitle: "Catatan Rapat",
      deliveryCenter: "Pusat Pengiriman",
      invoicePayment: "Invoice & Pembayaran",
      clientMemorySnapshot: "Ringkasan Memori Client",
      aiPromptHelpers: "AI Prompt Helper",
      saveProject: "Simpan Project",
      deleteProject: "Hapus Project",
      budget: "Anggaran",
      description: "Deskripsi",
      tags: "Tag",
      lockedStageWarning: "Untuk mengubah detail project ini, pindahkan kembali ke Antrean.",
      completedHighlight: "Project selesai dan semua pembayaran telah diterima.",
      reopenProject: "Buka Kembali Project",
      rawFileLink: "Link Pengiriman File Mentah / Source Code",
      rawFileLinkDesc: "Unggah link file mentah/source code untuk dikirim atau diunduh oleh client.",
      saveLink: "Simpan Link",
      clientRiskNotes: "Catatan Risiko Client",
      internalNotes: "Catatan Internal",
      paymentNotes: "Catatan Internal Pembayaran",
      preferredChannel: "Saluran Pilihan",
      communicationStyle: "Gaya Komunikasi",
      tonePreference: "Preferensi Nada Bicara",
      approvalStyle: "Gaya Persetujuan",
      revisionPattern: "Pola Revisi",
      paymentBehavior: "Perilaku Pembayaran",
      paymentReminderStyle: "Gaya Pengingat Pembayaran",
      deliveryPreference: "Preferensi Pengiriman",
      filePreference: "Preferensi File",
      clientVisibleNotes: "Catatan Terlihat oleh Client",
      relationshipStatus: "Status Hubungan",
      importantNotes: "Catatan Penting",
      lastMeetingSummary: "Ringkasan Rapat Terakhir",
      lastProjectSummary: "Ringkasan Project Terakhir",
      clientPreference: "Preferensi Client",
      clientPreferencePlaceholder: "misal: Menyukai update di hari Senin",
      communicationStylePlaceholder: "misal: Hanya WhatsApp, telepon langsung",
      paymentBehaviorPlaceholder: "misal: Butuh 1 kali follow-up pengingat",
      revisionPatternPlaceholder: "misal: Biasanya meminta putaran ekstra",
      deliveryPreferencePlaceholder: "misal: Figma + Google Drive SVG",
      clientRiskNotesPlaceholder: "misal: Rentan terhadap penambahan lingkup kerja",
      importantNotesPlaceholder: "Preferensi penting lainnya...",
      lastProjectSummaryPlaceholder: "Ringkasan pekerjaan sebelumnya...",
      lastMeetingSummaryPlaceholder: "Catatan dari rapat sebelumnya...",
      noClientAssociated: "Tidak ada client yang terhubung dengan project ini. Pilih client di sidebar untuk mengaktifkan Memori Client.",
      clientVisibleNotesDesc: "Catatan ini dapat muncul di Portal Workspace Client.",
      addCustomDeliveryStep: "Tambah langkah pengiriman kustom...",
      addStep: "Tambah Langkah",
      copyDeliveryMsg: "Salin Pesan Pengiriman",
      handoverNotesPrompt: "Prompt Catatan Handover",
      revisionSummaryMsg: "Pesan Ringkasan Revisi",
      finalChecklistPrompt: "Prompt Checklist Final",
      selectTemplate: "Pilih Template",
      selectTone: "Pilih Nada Bicara",
      clientSafePrivacyShield: "Perisai privasi aman-client",
      clientSafePrivacyShieldDesc: "Sembunyikan catatan risiko internal & kolom strategi pribadi",
      missingContextHelper: "⚠️ Beberapa detail project belum lengkap. Prompt akan menggunakan placeholder aman.",
      reviewContentBeforeCopying: "🔒 Tinjau konten sebelum menyalin",
      regenerate: "Buat Ulang",
      copyPromptToClipboard: "Salin Prompt ke Clipboard",
      lockedStageWarningHtml: "💡 Untuk mengubah detail project ini, pindahkan kembali ke <strong>Antrean</strong>.",
      deliveryCompletionChecklist: "Checklist Penyelesaian Pengiriman",
      clientApproved: "Client menyetujui",
      invoiceSentCheck: "Invoice terkirim",
      paymentReceivedCheck: "Pembayaran diterima",
      finalFilesSentCheck: "File final dikirim",
      revisionTracking: "🔄 Pelacakan Revisi",
      workOnRevision: "🛠️ Kerjakan Revisi",
      revisions: "Revisi",
      paymentReminder: "💳 Pengingat Pembayaran",
      paymentReminderDesc: "Tahap ini digunakan sebagai pengingat pembayaran, bukan untuk pengerjaan project.",
      paymentDueDate: "Tenggat Waktu Pembayaran",
      clientApprovalStatus: "Status Persetujuan Client",
      projectStageStatus: "Status Tahap Project",
      onHoldProject: "⏸️ Project Ditunda",
      onHoldProjectDesc: "Project ini ditunda sementara. Tambahkan alasan penundaan agar project tidak luput dari pelacakan. Atur tanggal follow-up untuk mengingatkan kapan project perlu diperiksa kembali.",
      holdReason: "Alasan Ditunda",
      holdReasonPlaceholder: "Contoh: Menunggu keputusan anggaran dari client...",
      holdDate: "Tanggal Ditunda",
      nextFollowUp: "Follow Up Berikutnya",
      resumeProject: "Lanjutkan Project",
      waitingClient: "Menunggu Client",
      clientNameCompany: "Nama Client / Perusahaan",
      noClientSelected: "-- Belum ada client terpilih --",
      registerNewClient: "+ Daftarkan Client Baru",
      clientTypeLabel: "Tipe",
      corporate: "Perusahaan",
      general: "Umum",
      newClientName: "Nama Client Baru",
      newClientNamePlaceholder: "Contoh: Sarah Connor",
      clientType: "Tipe Client",
      clientTypeGeneral: "Umum (Freelancer / Individu)",
      clientTypeCorporate: "Korporat (Perusahaan / Grup)",
      saveConnectClient: "Simpan & Hubungkan Client",
      estimatedValue: "Estimasi Nilai",
      deadlineTooltip: "Tenggat waktu penyelesaian untuk melacak status terlambat.",
      clientMemorySnapshotTitle: "🧠 Ringkasan Memori Client",
      noClientSelectedSnapshot: "Belum ada client terpilih.",
      noClientMemoryAdded: "Belum ada memori client yang ditambahkan.",
      addMemoryContext: "Tambah konteks memori",
      openFullClientMemory: "Buka Memori Client Lengkap",
      paymentTracking: "Pelacakan Pembayaran",
      paymentStatusTooltip: "Status pelacakan pembayaran saat ini untuk memonitor arus kas.",
      notInvoiced: "Belum Di-invoice",
      nextActionTooltip: "Tugas konkret terdekat untuk memajukan project.",
      nextActionPlaceholder: "Apa tugas berikutnya?",
      additionalInfo: "Info Tambahan",
      additionalInfoDesc: "Catatan internal, link rapat, dan termin pembayaran",
      viewDetails: "Lihat Detail",
      liveMeetingPortal: "Portal Rapat Langsung",
      meetLinkPlaceholder: "https://meet.google.com/abc-defg",
      meetNotesPlaceholder: "Kata sandi, catatan...",
      quotationReference: "Referensi Penawaran",
      meetPlatform: "Platform",
      meetLink: "Link Rapat URL",
      meetNotes: "Catatan Sesi",
      files: "File & Link Pengiriman",
      briefLink: "Link Brief / Spesifikasi",
      refLink: "Link Folder Aset Referensi",
      meetDate: "Tanggal Rapat",
      meetTime: "Jam Rapat",
      meetPlatformType: "Platform / Jenis Rapat",
      meetRoomLink: "Link Ruang Rapat",
      invoicePaymentDesc: "Lacak detail invoice, tenggat waktu pembayaran, pengingat follow-up, dan konfirmasi pembayaran.",
      invoicePaymentTitle: "Invoice & Pembayaran",
      outputLanguage: "Bahasa Output",
      useAppLang: "Gunakan Bahasa Aplikasi"
    },
    category: {
      design: "Desain",
      development: "Pengembangan",
      production: "Produksi",
      marketing: "Pemasaran",
      consulting: "Konsultasi",
      copywriting: "Copywriting",
      addCustom: "Tambah kategori kustom..."
    },
    // Priority levels
    priority: {
      low: "Rendah",
      medium: "Sedang",
      high: "Tinggi",
      urgent: "Mendesak",
      tbd: "Belum Ditentukan"
    },
    // Access Gate
    access: {
      welcome: "Selamat Datang di AlurKarya",
      tagline: "Kelola project freelance dari lead hingga lunas.",
      passwordLabel: "Kata Sandi Akses",
      passwordPlaceholder: "Masukkan kata sandi Anda",
      submitBtn: "Masuk ke Workspace",
      hasNoAccess: "Belum punya akses? Masukkan kode aktivasi",
      successMsg: "Akses diberikan. Menyiapkan workspace Anda…",
      activationLabel: "Kode Aktivasi",
      activationPlaceholder: "Masukkan kode aktivasi Anda",
      activateBtn: "Aktifkan Akses",
      backToLogin: "Kembali ke login",
      footerNote: "Akses pribadi untuk pengguna awal AlurKarya.",
      errorEmptyPassword: "Mohon masukkan kata sandi Anda.",
      errorInvalidPassword: "Kata sandi salah. Silakan coba lagi.",
      errorEmptyCode: "Mohon masukkan kode aktivasi Anda.",
      errorInvalidCode: "Kode aktivasi tidak valid. Silakan hubungi dukungan pelanggan."
    },
    // Delivery Center
    delivery: {
      status: "Status Pengiriman",
      previewLink: "Link Preview",
      draftLink: "Link Draft",
      reviewLink: "Link Review",
      fileFolderLink: "Link Folder File",
      finalFileLink: "Link File Final",
      rawSourceLink: "Link File Mentah / Source Code",
      deliveryDate: "Tanggal Pengiriman",
      handoverNotes: "Catatan Handover",
      clientVisibleNotes: "Catatan Terlihat oleh Client",
      checklist: "Checklist Pengiriman",
      confirmedDelivery: "Client mengonfirmasi pengiriman final",
      copyDeliveryMessage: "Salin Pesan Pengiriman"
    },
    // Invoicing
    invoice: {
      status: "Status Invoice",
      paymentStatus: "Status Pembayaran",
      number: "Nomor Invoice",
      amount: "Jumlah Invoice",
      dueDate: "Tenggat Waktu Invoice",
      amountPaid: "Jumlah Dibayarkan",
      amountDue: "Jumlah Harus Dibayar",
      paymentMethod: "Metode Pembayaran",
      lastFollowUp: "Tanggal Follow-up Terakhir",
      nextFollowUp: "Tanggal Follow-up Berikutnya",
      receiptLink: "Link Bukti / Resi Transfer",
      copyFollowUp: "Salin Follow-up Invoice",
      paymentOverdue: "Pembayaran Terlambat",
      date: "Tanggal Invoice",
      paymentDueDate: "Tenggat Waktu Pembayaran"
    },
    // Status display mappings
    status: {
      delivery: {
        not_submitted: "Belum Dikirim",
        draft_submitted: "Draft Dikirim",
        waiting_feedback: "Menunggu Feedback",
        revision_needed: "Perlu Revisi",
        approved: "Disetujui",
        final_delivered: "File Final Dikirim",
        handover_complete: "Handover Selesai"
      },
      invoice: {
        not_created: "Belum Dibuat",
        draft: "Draft",
        sent: "Terkirim",
        waiting_payment: "Menunggu Pembayaran",
        overdue: "Terlambat",
        paid: "Lunas",
        cancelled: "Dibatalkan"
      },
      payment: {
        not_started: "Belum Dimulai",
        waiting_payment: "Menunggu Pembayaran",
        dp_paid: "DP Dibayar",
        partially_paid: "Dibayar Sebagian",
        payment_received: "Pembayaran Diterima",
        fully_paid: "Lunas",
        overdue: "Terlambat",
        cancelled: "Dibatalkan"
      },
      approval: {
        not_submitted: "Belum Dikirim",
        pending_review: "Menunggu Review",
        approved: "Disetujui",
        needs_revision: "Perlu Revisi"
      },
      relationship: {
        new_client: "Client Baru",
        active_client: "Client Aktif",
        repeat_client: "Client Repeat",
        vip_client: "Client VIP",
        at_risk: "Perlu Perhatian",
        dormant: "Tidak Aktif"
      }
    },
    // Planner Hub
    planner: {
      calendar: "Kalender Perencana",
      weekly: "Mingguan",
      monthly: "Bulanan",
      upcomingMeetings: "Rapat Mendatang",
      followUpNeeded: "Perlu Follow-up",
      dueSoon: "Segera Jatuh Tempo",
      workingHours: "Jam Kerja & Ketersediaan",
      workingHoursSubtitle: "Atur hari kerja, jam kerja, zona waktu, dan tanggal libur Anda. Pertemuan di luar jam ini akan memicu peringatan.",
      useLocalTimezone: "Gunakan Zona Waktu Lokal",
      unavailableDates: "Tanggal Tidak Tersedia / Hari Libur",
      outsideHoursWarning: "Di luar jam kerja Anda.",
      introText: "Kelola rapat client, tenggat waktu, follow-up invoice, dan ketersediaan jam kerja Anda dalam satu dasbor yang terhubung.",
      timezone: "Zona Waktu",
      timezoneDesc: "Terdeteksi dari perangkat Anda. Anda dapat mengubahnya secara manual kapan saja.",
      startTime: "Jam Mulai",
      endTime: "Jam Selesai",
      workingDays: "Hari Kerja",
      noUnavailableDates: "Belum ada tanggal libur ditambahkan",
      addUnavailableDate: "Tambah Tanggal Libur",
      meeting: "Rapat",
      followUp: "Follow-up",
      invoiceDue: "Invoice Jatuh Tempo",
      paymentFollowUp: "Follow-up Pembayaran",
      receiptCheck: "Periksa Bukti Transfer",
      review: "Review",
      gcalSync: "Sinkronisasi Google Calendar",
      noMeetings: "Tidak ada rapat terjadwal",
      noFollowUpNeeded: "Tidak ada tindak lanjut yang diperlukan",
      noUrgentDeadlines: "Tidak ada tenggat waktu mendesak",
      onHoldFollowUp: "Tindak Lanjut Proyek Ditunda",
      noHoldProjects: "Tidak ada proyek ditunda dengan tindak lanjut",
      checkInDate: "Tanggal periksa",
      meetingNotesSummary: "Ringkasan Catatan Rapat",
      noMeetingNotes: "Tidak ada catatan rapat yang dicatat",
      noSummaryText: "Tidak ada teks ringkasan",
      openFullNotes: "Buka Catatan Lengkap",
      nextFollowUp: "Tindak Lanjut Berikutnya"
    },
    // Client view portal
    clientView: {
      projectStatus: "Status Project",
      timeline: "Timeline Client-ke-Bayar",
      submittedWork: "Pekerjaan Dikirim",
      approvalFeedback: "Persetujuan & Feedback",
      invoicePayment: "Invoice & Pembayaran",
      finalDelivery: "Pengiriman Final",
      copyUpdate: "Salin Update Client",
      emptyStateTitle: "Tidak ada project",
      emptyStateDesc: "Tambah client atau buat project terlebih dahulu untuk melihat preview portal client.",
      freelancerPreviewMode: "Mode Preview Freelancer",
      previewModeDesc: "Pratinjau bagaimana client melihat status project, pekerjaan dikirim, catatan revisi, persetujuan, status invoice, dan pengiriman final.",
      selectClient: "Pilih Client",
      selectProject: "Pilih Project",
      onHoldDesc: "Project ini ditunda sementara. Freelancer Anda akan mem-follow up jika sudah siap dilanjutkan.",
      noSubmittedWork: "Belum ada link pekerjaan yang ditambahkan.",
      openPreview: "Buka Pratinjau",
      waitingFeedback: "Menunggu feedback client.",
      approvedByClient: "Disetujui oleh client.",
      revisionInProgress: "Revisi sedang dikerjakan.",
      handoverNotesTitle: "Catatan Handover & Panduan Setup",
      clientConfirmation: "Konfirmasi Client",
      confirmedDesc: "Pengiriman telah diterima secara resmi oleh client.",
      waitingConfirmationDesc: "Menunggu client mengonfirmasi penerimaan hasil pekerjaan final.",
      confirmed: "Diterima",
      pending: "Menunggu",
      portfolioWebsite: "Website Portofolio",
      noInvoiceSent: "Belum ada invoice dikirim."
    },
    // Client memory
    clientMemory: {
      title: "Memori Client",
      titleShort: "Memori",
      communication: "Komunikasi",
      reviewRevision: "Review & Revisi",
      paymentBehavior: "Perilaku Pembayaran",
      deliveryPreference: "Preferensi Pengiriman",
      relationshipNotes: "Catatan Hubungan",
      clientFacingNotes: "Catatan Terlihat oleh Client",
      saveMemory: "Simpan Memori Client",
      copySummary: "Salin Ringkasan Client",
      extractMemory: "Ekstrak Memori Client"
    },
    // AI Prompts
    aiPrompts: {
      title: "AI Prompt Helper",
      clientCommunication: "Komunikasi Client",
      meetingMemory: "Rapat & Memori",
      delivery: "Pengiriman",
      invoicePayment: "Invoice & Pembayaran",
      portfolioReview: "Portofolio & Review",
      planning: "Perencanaan",
      readyMessage: "Pesan Siap Kirim",
      aiPrompt: "AI Prompt",
      internalSummary: "Ringkasan Internal",
      copyPrompt: "Salin Prompt",
      copyMessage: "Salin Pesan",
      copySummary: "Salin Ringkasan",
      clientSafeMode: "Mode aman client",
      subtitle: "Hasilkan prompt siap-pakai dan pesan untuk client dari konteks project, client, pengiriman, invoice, dan rapat Anda."
    },
    // Onboarding Templates
    templates: {
      title: "Mulai dengan Template Freelancer",
      subtitle: "Mulai lebih cepat dengan template alur kerja yang dirancang untuk jenis pekerjaan freelance Anda.",
      chooseTemplate: "Pilih Template",
      useThisTemplate: "Gunakan Template Ini",
      addTemplateProjects: "Tambah project template",
      warningText: "Project yang sudah ada tidak akan dihapus.",
      designer: "Desainer",
      designer_desc: "Untuk project brand identity, desain media sosial, landing page, logo, dan presentasi.",
      video_editor: "Editor Video",
      video_editor_desc: "Untuk project reels, edit YouTube, review potongan client, dan ekspor final.",
      copywriter: "Penulis Konten",
      copywriter_desc: "Untuk landing page copy, email beruntun, ad copy, sales page, dan naskah konten.",
      web_developer: "Pengembang Web",
      web_developer_desc: "Untuk landing page build, website company profile, prototipe web app, pemeliharaan, dan perbaikan bug.",
      social_media_manager: "Manajer Media Sosial",
      social_media_manager_desc: "Untuk kalender konten bulanan, caption bulanan, laporan berkala, dan koordinasi persetujuan posting.",
      ai_consultant: "Konsultan AI",
      ai_consultant_desc: "Untuk audit alur kerja AI, setup otomatisasi, sistem prompt, sesi pelatihan, dan serah terima teknis.",
      general: "Freelancer Umum",
      general_desc: "Untuk alur kerja fleksibel: review client, revisi, invoice, dan pengiriman pekerjaan.",
      addTemplateProjectsQuestion: "Tambah project template?",
      templateAlreadyApplied: "Template telah diterapkan",
      duplicateWarningText: "Template ini sudah ditambahkan sebelumnya. Apakah Anda ingin menambahkan salinan lainnya?",
      addAnotherCopy: "Tambah Salinan Lagi",
      seededVia: "Dibuat melalui alur kerja template {template}.",
      sampleProjectDesc: "Proyek sampel untuk alur kerja {template}.\n\nAturan Revisi: {rule}",
      standardLimit: "Batas standar."
    },
    days: {
      mon: "Sen",
      tue: "Sel",
      wed: "Rab",
      thu: "Kam",
      fri: "Jum",
      sat: "Sab",
      sun: "Min",
      monday: "Senin",
      tuesday: "Selasa",
      wednesday: "Rabu",
      thursday: "Kamis",
      friday: "Jumat",
      saturday: "Sabtu",
      sunday: "Minggu"
    },
    tone: {
      professional: "Profesional",
      friendly: "Ramah",
      firm: "Tegas",
      warm: "Hangat",
      concise: "Singkat"
    },
    clientHub: {
      introText: "Lacak client, project aktif, dan total nilai project Anda di satu tempat. Buat catatan, catat detail WhatsApp, dan lacak follow-up.",
      searchPlaceholder: "Cari nama, brand, WhatsApp, atau email...",
      allStatuses: "-- Semua Status --",
      allChannels: "-- Semua Saluran --",
      whatsapp: "WhatsApp",
      email: "Email",
      slack: "Slack",
      zoom: "Zoom",
      meet: "Google Meet",
      directCall: "Telepon Langsung",
      other: "Lainnya",
      addClient: "Tambah Client",
      noClientsTitle: "Tidak ada client di direktori",
      noClientsDesc: "Tambah client pertama Anda untuk mulai membuat penawaran kustom dan alur kerja invoice.",
      registerClient: "Daftarkan Client",
      colName: "Nama Client & Bisnis",
      colContact: "Detail Kontak",
      colStatus: "Status Client",
      colFollowUp: "Follow-Up Client",
      colProjects: "Project Aktif",
      colValue: "Total Nilai Project",
      colActions: "Aksi",
      needsReminder: "Perlu pengingat",
      personalContract: "Kontrak Pribadi Freelance",
      noEmail: "Email tidak tercatat",
      noFollowUp: "Follow-up tidak tercatat",
      editClientInfo: "Edit Info Client",
      registerNewClient: "Daftarkan Client Baru",
      fullName: "Nama Lengkap Client",
      businessBrandName: "Nama Bisnis / Brand",
      contactEmail: "Email Kontak",
      phoneWhatsApp: "Telepon atau WhatsApp",
      lastFollowUpDate: "Tanggal Follow-Up Client Terakhir",
      clientStatus: "Status Client",
      statusLead: "Lead (Prospek)",
      statusActive: "Client Aktif",
      statusCompleted: "Client Selesai",
      statusInactive: "Client Tidak Aktif",
      businessBrandPlaceholder: "misal: Cyberdyne Systems",
      clientNotesPlaceholder: "Tambah ringkasan kontak, detail permintaan khusus...",
      clientNotes: "Catatan Client",
      clientMemoryFields: "Kolom Memori Client",
      saveClientDirectory: "Simpan Direktori Client"
    },
    profile: {
      title: "Profil Freelancer",
      subtitle: "Atur detail pribadi, spesialisasi, bio, lokasi, dan link portofolio Anda. Data ini disinkronkan dengan kartu profil sidebar dan Portal Workspace Client.",
      sectionBranding: "Workspace Branding Pribadi",
      fullName: "Nama Lengkap",
      specialty: "Spesialisasi / Peran",
      email: "Alamat Email",
      location: "Lokasi",
      bio: "Bio Singkat",
      portfolioUrl: "URL Portofolio",
      avatarUrl: "URL Foto Avatar",
      initials: "Inisial Kustom (Opsional)",
      language: "Bahasa / Language",
      defaultCurrency: "Mata Uang Default",
      defaultCurrencyHelper: "Digunakan sebagai mata uang default untuk project dan invoice baru.",
      openClientView: "Buka Portal Client"
    },
    promptTemplates: {
      clientUpdate: {
        name: "Pesan Update Client",
        description: "Buat pesan update kemajuan mingguan yang menyoroti pencapaian dan langkah berikutnya."
      },
      revisionBoundary: {
        name: "Pesan Batas Revisi",
        description: "Informasikan dengan sopan kepada client bahwa mereka telah mencapai batas revisi dan jelaskan biayanya."
      },
      scopeChange: {
        name: "Pesan Perubahan Ruang Lingkup",
        description: "Informasikan dengan sopan kepada client bahwa permintaan mereka berada di luar lingkup project awal."
      },
      testimonialRequest: {
        name: "Permintaan Testimoni",
        description: "Minta testimoni atau ulasan secara sopan dari client setelah project selesai."
      },
      proposalDraft: {
        name: "Prompt Draft Proposal",
        description: "Buat proposal freelance formal dan terstruktur untuk ditawarkan kepada lead."
      },
      scopeChecker: {
        name: "Prompt Pemeriksa Ruang Lingkup",
        description: "Periksa permintaan client terhadap lingkup awal Anda untuk menandai potensi penambahan lingkup."
      },
      meetingSummary: {
        name: "Prompt Ringkasan Rapat",
        description: "Hasilkan catatan terstruktur, deliverables, dan action items dari catatan rapat mentah."
      },
      clientMemoryExtraction: {
        name: "Prompt Ekstraksi Memori Client",
        description: "Hasilkan prompt untuk mengekstrak preferensi client dan gaya komunikasi dari catatan rapat."
      },
      clientRelationshipSummary: {
        name: "Ringkasan Hubungan Client",
        description: "Hasilkan ringkasan internal strategis tentang kesehatan hubungan, risiko, dan langkah berikutnya."
      },
      deliveryMessage: {
        name: "Pesan Pengiriman",
        description: "Draft pesan serah terima yang ramah dan profesional untuk menyertai pekerjaan akhir."
      },
      handoverNotesPrompt: {
        name: "Prompt Catatan Handover",
        description: "Buat panduan setup terstruktur, dokumentasi, atau catatan instalasi untuk serah terima client."
      },
      revisionSummary: {
        name: "Ringkasan Revisi",
        description: "Rangkum poin-poin feedback dengan sopan dan bagaimana poin tersebut diselesaikan untuk persetujuan client."
      },
      finalDeliveryChecklistPrompt: {
        name: "Prompt Checklist Pengiriman Final",
        description: "Buat daftar checklist untuk file final, format, dan tugas serah terima."
      },
      invoiceFollowupPrompt: {
        name: "Prompt Follow-up Invoice",
        description: "Draft pengingat invoice yang ramah dan profesional berdasarkan termin dan tenggat waktu."
      },
      overduePaymentReminder: {
        name: "Pengingat Pembayaran Terlambat",
        description: "Minta pembayaran invoice yang terlambat dengan sopan namun tegas."
      },
      paymentConfirmationMessage: {
        name: "Pesan Konfirmasi Pembayaran",
        description: "Draft konfirmasi tanda terima pembayaran profesional dan ucapan terima kasih."
      },
      receiptRequestMessage: {
        name: "Pesan Permintaan Bukti Bayar",
        description: "Minta bukti pembayaran atau resi transfer secara sopan kepada client."
      },
      paymentSummaryPrompt: {
        name: "Prompt Ringkasan Pembayaran",
        description: "Buat ringkasan internal tentang pembayaran diterima, milestone tertunda, dan total."
      },
      portfolioCaseStudy: {
        name: "Studi Kasus Portofolio",
        description: "Ubah pencapaian project, deliverables, dan hasil akhir menjadi studi kasus terstruktur."
      },
      projectCompletionSummary: {
        name: "Ringkasan Penyelesaian Project",
        description: "Hasilkan ringkasan internal tentang pencapaian project, statistik timeline, dan langkah berikutnya."
      },
      nextActionRecommendation: {
        name: "Rekomendasi Langkah Berikutnya",
        description: "Hasilkan prompt internal untuk memutuskan langkah berikutnya berdasarkan tahap, tenggat waktu, dan memori."
      },
      weeklyFocusSummary: {
        name: "Ringkasan Fokus Mingguan",
        description: "Hasilkan ringkasan internal dari project yang segera jatuh tempo, terlambat, dan menunggu review."
      }
    },
    viewGuide: "Panduan Lengkap",
    viewGuideTitle: "Lihat Panduan Lengkap",
    onboarding: {
      modalTitle: "Mulai dari 1 project aktif",
      modalSubtitle: "Jangan setup semuanya sekaligus. Pilih satu project client yang sedang berjalan, lalu isi alurnya pelan-pelan.",
      step1Title: "Pilih jenis kerja Anda",
      step1Desc: "Designer, video editor, copywriter, web developer, social media manager, AI consultant, atau general freelancer.",
      step2Title: "Tambahkan 1 project aktif",
      step2Desc: "Mulai dari project yang sedang Anda kerjakan sekarang, bukan dari workspace kosong.",
      step3Title: "Isi next action dan deadline",
      step3Desc: "Cukup tentukan apa langkah berikutnya dan kapan harus selesai.",
      ctaPrimary: "Mulai Setup",
      ctaSecondary: "Lewati dulu",
      linkFullGuide: "Lihat panduan lengkap",
      cardTitle: "Mulai dari 1 project aktif",
      cardStep1: "Pilih role",
      cardStep2: "Tambah project",
      cardStep3: "Isi next action"
    }
  }
};

/**
 * Returns the currently active language, defaulting to 'en'
 * @returns {string} 'en' or 'id'
 */
export function getLanguage() {
  const lang = localStorage.getItem('alurkarya_language');
  if (lang === 'id' || lang === 'en') {
    return lang;
  }
  return 'en';
}

/**
 * Sets the active language in localStorage and triggers app re-render if window.app is defined.
 * @param {string} lang - 'en' or 'id'
 */
export function setLanguage(lang) {
  if (lang === 'id' || lang === 'en') {
    localStorage.setItem('alurkarya_language', lang);
    if (window.app && typeof window.app.reRenderApp === 'function') {
      window.app.reRenderApp();
    }
  }
}

/**
 * Helper to translate a dot-notated string key. Falls back to English, then back to fallback string.
 * Never displays undefined or null.
 * @param {string} path - e.g. "sidebar.dashboard"
 * @param {string} [fallback] - default return if both translations are missing
 * @returns {string} translated text or fallback
 */
export function t(path, fallback = '') {
  const currentLang = getLanguage();
  
  const getNestedValue = (obj, p) => {
    return p.split('.').reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  };

  // 1. Try active language
  const translation = getNestedValue(translations[currentLang], path);
  if (translation !== undefined && translation !== null) {
    return translation;
  }

  // 2. Try English fallback
  if (currentLang !== 'en') {
    const enTranslation = getNestedValue(translations['en'], path);
    if (enTranslation !== undefined && enTranslation !== null) {
      return enTranslation;
    }
  }

  // 3. Try manual fallback string
  return fallback !== undefined && fallback !== null ? fallback : path;
}

/**
 * Helper to get user-facing name for a language value.
 * @param {string} lang
 * @returns {string}
 */
export function getLanguageLabel(lang) {
  if (lang === 'id') return 'Bahasa Indonesia';
  return 'English';
}
