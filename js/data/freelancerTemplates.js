/* ==========================================================================
   ALURKARYA - FREELANCER ROLE-BASED TEMPLATE DEFINITIONS
   ========================================================================== */

export const templatesData = {
  designer: {
    id: "designer",
    label: "Designer",
    icon: "🎨",
    description: "For brand, social media, presentation, and visual design projects.",
    defaultCategories: ["Brand Identity", "Social Media Design", "Landing Page Design", "Logo Design", "Presentation Design"],
    sampleProjects: [
      {
        title: "Brand Identity Design",
        stage: "in_progress",
        clientName: "Nova Studio",
        nextAction: "Send first concept to client",
        priority: "High",
        category: "Brand Identity",
        budget: 5000000,
        revisionRule: "Include up to 2 revision rounds before additional work is quoted.",
        deliveryChecklist: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
        invoiceReminderExample: "Hi Nova Studio, just checking in on the invoice for Brand Identity Design. Let me know if you need anything from my side.",
        portfolioCaseStudyPrompt: "Turn this design project into a short portfolio case study with problem, process, solution, and final outcome."
      },
      {
        title: "Instagram Feed Package",
        stage: "client_review",
        clientName: "Bloom Cafe",
        nextAction: "Wait for client feedback",
        priority: "Medium",
        category: "Social Media Design",
        budget: 3500000,
        revisionRule: "Include up to 2 revision rounds before additional work is quoted.",
        deliveryChecklist: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
        invoiceReminderExample: "Hi Bloom Cafe, just checking in on the invoice for Instagram Feed Package. Let me know if you need anything from my side.",
        portfolioCaseStudyPrompt: "Turn this design project into a short portfolio case study with problem, process, solution, and final outcome."
      },
      {
        title: "Logo Revision",
        stage: "revision",
        clientName: "Arcadia Labs",
        nextAction: "Apply revision notes",
        priority: "Medium",
        category: "Logo Design",
        budget: 2000000,
        revisionRule: "Include up to 2 revision rounds before additional work is quoted.",
        deliveryChecklist: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
        invoiceReminderExample: "Hi Arcadia Labs, just checking in on the invoice for Logo Revision. Let me know if you need anything from my side.",
        portfolioCaseStudyPrompt: "Turn this design project into a short portfolio case study with problem, process, solution, and final outcome."
      },
      {
        title: "Brand Guideline Invoice",
        stage: "waiting_payment",
        clientName: "Nara Beauty",
        nextAction: "Follow up payment",
        priority: "High",
        category: "Brand Identity",
        budget: 4500000,
        revisionRule: "Include up to 2 revision rounds before additional work is quoted.",
        deliveryChecklist: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
        invoiceReminderExample: "Hi Nara Beauty, just checking in on the invoice for Brand Guideline Invoice. Let me know if you need anything from my side.",
        portfolioCaseStudyPrompt: "Turn this design project into a short portfolio case study with problem, process, solution, and final outcome."
      }
    ]
  },
  video_editor: {
    id: "video_editor",
    label: "Video Editor",
    icon: "🎬",
    description: "For reels, YouTube edits, client review cuts, and final exports.",
    defaultCategories: ["Short-form Video", "YouTube Edit", "Reels Package", "Motion Graphics", "Ads Creative"],
    sampleProjects: [
      {
        title: "Reels Editing Package",
        stage: "proposal_sent", // Mapped internally to Queue
        clientName: "FitCore",
        nextAction: "Request raw footage",
        priority: "Medium",
        category: "Reels Package",
        budget: 4000000,
        revisionRule: "Ask for timestamped feedback to avoid unclear revision requests.",
        deliveryChecklist: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
        invoiceReminderExample: "Hi FitCore, the final video has been delivered. Just following up on the remaining payment for Reels Editing Package.",
        portfolioCaseStudyPrompt: "Create a portfolio case study for this video editing project, including objective, editing approach, creative decisions, and final result."
      },
      {
        title: "YouTube Long-form Edit",
        stage: "in_progress",
        clientName: "EduSpark",
        nextAction: "Send first cut",
        priority: "High",
        category: "YouTube Edit",
        budget: 6000000,
        revisionRule: "Ask for timestamped feedback to avoid unclear revision requests.",
        deliveryChecklist: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
        invoiceReminderExample: "Hi EduSpark, the final video has been delivered. Just following up on the remaining payment for YouTube Long-form Edit.",
        portfolioCaseStudyPrompt: "Create a portfolio case study for this video editing project, including objective, editing approach, creative decisions, and final result."
      },
      {
        title: "Client Review Cut",
        stage: "client_review",
        clientName: "Bright Agency",
        nextAction: "Collect timestamped feedback",
        priority: "High",
        category: "Short-form Video",
        budget: 2500000,
        revisionRule: "Ask for timestamped feedback to avoid unclear revision requests.",
        deliveryChecklist: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
        invoiceReminderExample: "Hi Bright Agency, the final video has been delivered. Just following up on the remaining payment for Client Review Cut.",
        portfolioCaseStudyPrompt: "Create a portfolio case study for this video editing project, including objective, editing approach, creative decisions, and final result."
      },
      {
        title: "Final Export Delivery",
        stage: "completed",
        clientName: "UrbanWear",
        nextAction: "Upload final files",
        priority: "Medium",
        category: "Ads Creative",
        budget: 3500000,
        revisionRule: "Ask for timestamped feedback to avoid unclear revision requests.",
        deliveryChecklist: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
        invoiceReminderExample: "Hi UrbanWear, the final video has been delivered. Just following up on the remaining payment for Final Export Delivery.",
        portfolioCaseStudyPrompt: "Create a portfolio case study for this video editing project, including objective, editing approach, creative decisions, and final result."
      }
    ]
  },
  copywriter: {
    id: "copywriter",
    label: "Copywriter",
    icon: "✍️",
    description: "For landing pages, ad copy, emails, sales pages, and content scripts.",
    defaultCategories: ["Landing Page Copy", "Email Sequence", "Ad Copy", "Sales Page", "Content Script"],
    sampleProjects: [
      {
        title: "Landing Page Copywriting",
        stage: "in_progress",
        clientName: "GrowthLab",
        nextAction: "Draft hero section",
        priority: "High",
        category: "Landing Page Copy",
        budget: 3000000,
        revisionRule: "Separate copy revision from offer or strategy change.",
        deliveryChecklist: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
        invoiceReminderExample: "Hi GrowthLab, just following up on the invoice for the copywriting project. Please let me know once payment has been processed.",
        portfolioCaseStudyPrompt: "Convert this copywriting project into a case study showing the offer, audience, messaging strategy, and final copy direction."
      },
      {
        title: "Email Sequence Draft",
        stage: "proposal_sent", // Queue
        clientName: "SkillPath",
        nextAction: "Confirm offer angle",
        priority: "Medium",
        category: "Email Sequence",
        budget: 2500000,
        revisionRule: "Separate copy revision from offer or strategy change.",
        deliveryChecklist: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
        invoiceReminderExample: "Hi SkillPath, just following up on the invoice for the copywriting project. Please let me know once payment has been processed.",
        portfolioCaseStudyPrompt: "Convert this copywriting project into a case study showing the offer, audience, messaging strategy, and final copy direction."
      },
      {
        title: "Ad Copy Review",
        stage: "client_review",
        clientName: "Karya Digital",
        nextAction: "Wait for approval",
        priority: "Medium",
        category: "Ad Copy",
        budget: 1500000,
        revisionRule: "Separate copy revision from offer or strategy change.",
        deliveryChecklist: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
        invoiceReminderExample: "Hi Karya Digital, just following up on the invoice for the copywriting project. Please let me know once payment has been processed.",
        portfolioCaseStudyPrompt: "Convert this copywriting project into a case study showing the offer, audience, messaging strategy, and final copy direction."
      },
      {
        title: "Sales Page Invoice",
        stage: "invoice_sent",
        clientName: "MentorHub",
        nextAction: "Send invoice follow-up",
        priority: "High",
        category: "Sales Page",
        budget: 5000000,
        revisionRule: "Separate copy revision from offer or strategy change.",
        deliveryChecklist: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
        invoiceReminderExample: "Hi MentorHub, just following up on the invoice for the copywriting project. Please let me know once payment has been processed.",
        portfolioCaseStudyPrompt: "Convert this copywriting project into a case study showing the offer, audience, messaging strategy, and final copy direction."
      }
    ]
  },
  web_developer: {
    id: "web_developer",
    label: "Web Developer",
    icon: "💻",
    description: "For landing pages, websites, web app prototypes, bug fixes, and handovers.",
    defaultCategories: ["Landing Page", "Company Profile Website", "Web App Prototype", "Website Maintenance", "Bug Fix"],
    sampleProjects: [
      {
        title: "Landing Page Build",
        stage: "in_progress",
        clientName: "LaunchBase",
        nextAction: "Build hero section",
        priority: "High",
        category: "Landing Page",
        budget: 8000000,
        revisionRule: "Separate design revision, content change, and technical bug fix.",
        deliveryChecklist: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
        invoiceReminderExample: "Hi LaunchBase, the website has been delivered and approved. Just following up on the final payment for Landing Page Build.",
        portfolioCaseStudyPrompt: "Create a web development portfolio case study with project goal, tech stack, build process, key features, and final result."
      },
      {
        title: "Company Profile Website",
        stage: "proposal_sent", // Queue
        clientName: "Sagara Group",
        nextAction: "Request content and assets",
        priority: "Medium",
        category: "Company Profile Website",
        budget: 15000000,
        revisionRule: "Separate design revision, content change, and technical bug fix.",
        deliveryChecklist: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
        invoiceReminderExample: "Hi Sagara Group, the website has been delivered and approved. Just following up on the final payment for Company Profile Website.",
        portfolioCaseStudyPrompt: "Create a web development portfolio case study with project goal, tech stack, build process, key features, and final result."
      },
      {
        title: "Staging Review",
        stage: "client_review",
        clientName: "Finlite",
        nextAction: "Share staging link",
        priority: "High",
        category: "Web App Prototype",
        budget: 25000000,
        revisionRule: "Separate design revision, content change, and technical bug fix.",
        deliveryChecklist: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
        invoiceReminderExample: "Hi Finlite, the website has been delivered and approved. Just following up on the final payment for Staging Review.",
        portfolioCaseStudyPrompt: "Create a web development portfolio case study with project goal, tech stack, build process, key features, and final result."
      },
      {
        title: "Website Final Payment",
        stage: "waiting_payment",
        clientName: "Daya Studio",
        nextAction: "Follow up final payment",
        priority: "High",
        category: "Website Maintenance",
        budget: 3000000,
        revisionRule: "Separate design revision, content change, and technical bug fix.",
        deliveryChecklist: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
        invoiceReminderExample: "Hi Daya Studio, the website has been delivered and approved. Just following up on the final payment for Website Final Payment.",
        portfolioCaseStudyPrompt: "Create a web development portfolio case study with project goal, tech stack, build process, key features, and final result."
      }
    ]
  },
  social_media_manager: {
    id: "social_media_manager",
    label: "Social Media Manager",
    icon: "📱",
    description: "For content calendars, monthly retainers, caption batches, reports, and approvals.",
    defaultCategories: ["Monthly Retainer", "Content Calendar", "Caption Writing", "Design Batch", "Monthly Report"],
    sampleProjects: [
      {
        title: "Monthly Content Calendar",
        stage: "in_progress",
        clientName: "Glow Beauty",
        nextAction: "Prepare weekly content plan",
        priority: "High",
        category: "Content Calendar",
        budget: 4500000,
        revisionRule: "Set approval deadline before posting schedule begins.",
        deliveryChecklist: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
        invoiceReminderExample: "Hi Glow Beauty, just following up on this month’s retainer invoice. Please let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a social media management case study with content strategy, posting plan, execution, and monthly result summary."
      },
      {
        title: "Caption Writing",
        stage: "client_review",
        clientName: "Kopi Selatan",
        nextAction: "Wait for caption approval",
        priority: "Medium",
        category: "Caption Writing",
        budget: 2000000,
        revisionRule: "Set approval deadline before posting schedule begins.",
        deliveryChecklist: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
        invoiceReminderExample: "Hi Kopi Selatan, just following up on this month’s retainer invoice. Please let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a social media management case study with content strategy, posting plan, execution, and monthly result summary."
      },
      {
        title: "Monthly Report",
        stage: "proposal_sent", // Queue
        clientName: "Fit Daily",
        nextAction: "Collect analytics data",
        priority: "Medium",
        category: "Monthly Report",
        budget: 1500000,
        revisionRule: "Set approval deadline before posting schedule begins.",
        deliveryChecklist: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
        invoiceReminderExample: "Hi Fit Daily, just following up on this month’s retainer invoice. Please let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a social media management case study with content strategy, posting plan, execution, and monthly result summary."
      },
      {
        title: "Retainer Invoice",
        stage: "invoice_sent",
        clientName: "Local Brand Co",
        nextAction: "Send monthly invoice",
        priority: "High",
        category: "Monthly Retainer",
        budget: 5000000,
        revisionRule: "Set approval deadline before posting schedule begins.",
        deliveryChecklist: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
        invoiceReminderExample: "Hi Local Brand Co, just following up on this month’s retainer invoice. Please let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a social media management case study with content strategy, posting plan, execution, and monthly result summary."
      }
    ]
  },
  ai_consultant: {
    id: "ai_consultant",
    label: "AI Consultant",
    icon: "🧠",
    description: "For AI workflow audits, automation setup, prompt systems, training, and handover.",
    defaultCategories: ["AI Workflow Audit", "Automation Setup", "Prompt System", "Training Session", "AI Dashboard"],
    sampleProjects: [
      {
        title: "AI Workflow Audit",
        stage: "new_lead",
        clientName: "OpsFlow",
        nextAction: "Schedule discovery call",
        priority: "High",
        category: "AI Workflow Audit",
        budget: 12000000,
        revisionRule: "Clarify whether changes are prompt tuning, workflow change, or new scope.",
        deliveryChecklist: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"],
        invoiceReminderExample: "Hi OpsFlow, just checking in on the invoice for the AI workflow project. Let me know if anything else is needed.",
        portfolioCaseStudyPrompt: "Turn this AI consulting project into a case study showing the manual workflow, AI-assisted workflow, implementation, and business outcome."
      },
      {
        title: "Prompt System Setup",
        stage: "in_progress",
        clientName: "EduCreator",
        nextAction: "Build first prompt workflow",
        priority: "Medium",
        category: "Prompt System",
        budget: 8000000,
        revisionRule: "Clarify whether changes are prompt tuning, workflow change, or new scope.",
        deliveryChecklist: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"],
        invoiceReminderExample: "Hi EduCreator, just checking in on the invoice for the AI workflow project. Let me know if anything else is needed.",
        portfolioCaseStudyPrompt: "Turn this AI consulting project into a case study showing the manual workflow, AI-assisted workflow, implementation, and business outcome."
      },
      {
        title: "Automation Review",
        stage: "client_review",
        clientName: "AdminPro",
        nextAction: "Collect client feedback",
        priority: "High",
        category: "Automation Setup",
        budget: 15000000,
        revisionRule: "Clarify whether changes are prompt tuning, workflow change, or new scope.",
        deliveryChecklist: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"],
        invoiceReminderExample: "Hi AdminPro, just checking in on the invoice for the AI workflow project. Let me know if anything else is needed.",
        portfolioCaseStudyPrompt: "Turn this AI consulting project into a case study showing the manual workflow, AI-assisted workflow, implementation, and business outcome."
      },
      {
        title: "AI Consulting Invoice",
        stage: "waiting_payment",
        clientName: "SmartSeller",
        nextAction: "Follow up payment",
        priority: "High",
        category: "Training Session",
        budget: 6000000,
        revisionRule: "Clarify whether changes are prompt tuning, workflow change, or new scope.",
        deliveryChecklist: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"],
        invoiceReminderExample: "Hi SmartSeller, just checking in on the invoice for the AI workflow project. Let me know if anything else is needed.",
        portfolioCaseStudyPrompt: "Turn this AI consulting project into a case study showing the manual workflow, AI-assisted workflow, implementation, and business outcome."
      }
    ]
  },
  general_freelancer: {
    id: "general_freelancer",
    label: "General Freelancer",
    icon: "💼",
    description: "For flexible client projects with review, revision, invoice, and delivery flow.",
    defaultCategories: ["Client Project", "Review", "Revision", "Invoice", "Delivery"],
    sampleProjects: [
      {
        title: "New Client Project",
        stage: "new_lead",
        clientName: "Example Client",
        nextAction: "Request brief",
        priority: "Medium",
        category: "Client Project",
        budget: 3000000,
        revisionRule: "Define revision limit before starting the work.",
        deliveryChecklist: ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"],
        invoiceReminderExample: "Hi Example Client, just following up on the invoice for New Client Project. Let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a simple portfolio case study for this client project with problem, process, deliverable, and result."
      },
      {
        title: "Active Client Work",
        stage: "in_progress",
        clientName: "Example Studio",
        nextAction: "Continue main deliverable",
        priority: "High",
        category: "Client Project",
        budget: 6000000,
        revisionRule: "Define revision limit before starting the work.",
        deliveryChecklist: ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"],
        invoiceReminderExample: "Hi Example Studio, just following up on the invoice for Active Client Work. Let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a simple portfolio case study for this client project with problem, process, deliverable, and result."
      },
      {
        title: "Review & Approval",
        stage: "client_review",
        clientName: "Example Brand",
        nextAction: "Ask for approval",
        priority: "Medium",
        category: "Review",
        budget: 4500000,
        revisionRule: "Define revision limit before starting the work.",
        deliveryChecklist: ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"],
        invoiceReminderExample: "Hi Example Brand, just following up on the invoice for Review & Approval. Let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a simple portfolio case study for this client project with problem, process, deliverable, and result."
      },
      {
        title: "Waiting Payment",
        stage: "waiting_payment",
        clientName: "Example Business",
        nextAction: "Follow up invoice",
        priority: "High",
        category: "Invoice",
        budget: 5000000,
        revisionRule: "Define revision limit before starting the work.",
        deliveryChecklist: ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"],
        invoiceReminderExample: "Hi Example Business, just following up on the invoice for Waiting Payment. Let me know once it has been processed.",
        portfolioCaseStudyPrompt: "Create a simple portfolio case study for this client project with problem, process, deliverable, and result."
      }
    ]
  }
};
