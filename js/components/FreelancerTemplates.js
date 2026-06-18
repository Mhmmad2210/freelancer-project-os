/* ==========================================================================
   FREELANCER PROJECT OS - ROLE-BASED TEMPLATES DATA & UTILITY
   ========================================================================== */

import { generateId } from '../utils.js';

export const templatesData = {
  Designer: {
    title: "Designer Starter Pack",
    category: "Design",
    categories: ["Brand Identity", "Social Media Design", "Landing Page Design", "Logo Design"],
    nextActions: [
      "Request design brief",
      "Send first concept",
      "Ask for client approval",
      "Prepare final files",
      "Send invoice"
    ],
    sampleProjects: [
      {
        title: "Brand Identity Revamp",
        budget: 5000000,
        stage: "new_lead",
        description: "Creating a fresh logo, style guide, typography rules, and custom social assets.",
        dueDateOffset: 15,
        priority: "High",
        tags: ["Design", "Brand Identity"],
        nextAction: "Request design brief",
        checklist: [
          { text: "Send brand questionnaires outline", completed: false },
          { text: "Research visual identity moodboards", completed: false },
          { text: "Draft 3 distinct logo options", completed: false }
        ]
      },
      {
        title: "Landing Page Visual Design",
        budget: 3500000,
        stage: "in_progress",
        description: "High-fidelity Figma mockup for the client's SaaS checkout flow.",
        dueDateOffset: 7,
        priority: "Medium",
        tags: ["Design", "Landing Page Design"],
        nextAction: "Send first concept",
        checklist: [
          { text: "Wireframe layout structure", completed: true },
          { text: "Assemble style tiles and assets", completed: false },
          { text: "Design desktop and mobile layouts", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Prefers monday meetings and visual moodboards. Does not like orange colors.",
      communicationStyle: "WhatsApp for quick checks, email for official signoffs.",
      paymentBehavior: "Pays 50% deposit quickly, remaining 50% usually needs one reminder follow-up.",
      revisionPattern: "Asks for subtle spacing adjustments and text alterations.",
      deliveryPreference: "Figma link + packaged SVG files in Google Drive.",
      clientRiskNotes: "Can go silent if brief is not confirmed in writing first."
    }
  },

  Copywriter: {
    title: "Copywriting Toolkit",
    category: "Copywriting",
    categories: ["Website Copy", "SEO Article", "Email Newsletter", "Ad Campaign"],
    nextActions: [
      "Request copywriting brief",
      "Draft initial content outline",
      "Proofread for SEO keywords",
      "Deliver final copy document",
      "Submit invoice"
    ],
    sampleProjects: [
      {
        title: "SaaS Launch Email Sequence",
        budget: 2500000,
        stage: "new_lead",
        description: "5-part email series welcoming new signups and highlighting key automation features.",
        dueDateOffset: 10,
        priority: "Medium",
        tags: ["Copywriting", "Email Newsletter"],
        nextAction: "Request copywriting brief",
        checklist: [
          { text: "Define product core value statements", completed: false },
          { text: "Write draft sequence outlines", completed: false },
          { text: "Optimize subject line click rates", completed: false }
        ]
      },
      {
        title: "SEO-Optimized Product Reviews",
        budget: 3000000,
        stage: "client_review",
        description: "Detailed review articles with structured headings to rank high for digital products.",
        dueDateOffset: 4,
        priority: "High",
        tags: ["Copywriting", "SEO Article"],
        nextAction: "Proofread for SEO keywords",
        checklist: [
          { text: "Conduct keyword volume research", completed: true },
          { text: "Write first draft reviews text", completed: true },
          { text: "Verify readability & plagiarism checkers", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Likes concise headings, dislikes overly technical jargon.",
      communicationStyle: "Prefers Google Docs comments directly on the drafts.",
      paymentBehavior: "Always pays on time via bank transfer.",
      revisionPattern: "Often requests modifications to tone and call-to-actions.",
      deliveryPreference: "Shared Google Docs link with edit access.",
      clientRiskNotes: "Watch out for scope creep regarding landing page layout structure."
    }
  },

  VideoEditor: {
    title: "Video Editor Pipeline",
    category: "Production",
    categories: ["Short-form Video", "YouTube Edit", "Reels Package", "Motion Graphics"],
    nextActions: [
      "Request raw footage files",
      "Deliver first rough cut",
      "Apply sounds & transitions",
      "Export final rendering",
      "Mark as delivered"
    ],
    sampleProjects: [
      {
        title: "10x Reels Batch Edit",
        budget: 4000000,
        stage: "in_progress",
        description: "Adding hooks, templates, captions, and zoom cuts to 10 short-form reels.",
        dueDateOffset: 6,
        priority: "High",
        tags: ["Production", "Reels Package"],
        nextAction: "Deliver first rough cut",
        checklist: [
          { text: "Sort and cut raw footage clips", completed: true },
          { text: "Add dynamic titles & auto-subtitles", completed: false },
          { text: "Apply color grading LUTs", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Loves fast-paced edits, meme references, and pop sound effects.",
      communicationStyle: "WhatsApp voice notes for quick revision cycles.",
      paymentBehavior: "Standard net-30 bank transfers, usually pays within a week.",
      revisionPattern: "Always asks for subtitle style changes or alternative music choice.",
      deliveryPreference: "Frame.io links for review, final download links via WeTransfer.",
      clientRiskNotes: "Ensure raw footage files are received before starting the countdown timer."
    }
  },

  WebDeveloper: {
    title: "Web Developer Stack",
    category: "Development",
    categories: ["Landing Page", "Company Website", "Web App Prototype", "Maintenance"],
    nextActions: [
      "Request content and assets",
      "Confirm scope requirements",
      "Share staging link",
      "Request final approval",
      "Send invoice & migrate files"
    ],
    sampleProjects: [
      {
        title: "Company Profile Website",
        budget: 9000000,
        stage: "new_lead",
        description: "Responsive 5-page business site built using modular HTML/CSS/JS.",
        dueDateOffset: 20,
        priority: "Medium",
        tags: ["Development", "Company Website"],
        nextAction: "Confirm scope requirements",
        checklist: [
          { text: "Initialize git repository & setup build", completed: false },
          { text: "Code responsive header & footer templates", completed: false },
          { text: "Build contact form submission API", completed: false }
        ]
      },
      {
        title: "E-Commerce Checkout Customizer",
        budget: 12000000,
        stage: "client_review",
        description: "Shopify checkout script retooling to support local Indonesian payment gateways.",
        dueDateOffset: 5,
        priority: "High",
        tags: ["Development", "Web App Prototype"],
        nextAction: "Share staging link",
        checklist: [
          { text: "Study gateway API documentation", completed: true },
          { text: "Build payment webhook listener logic", completed: true },
          { text: "Conduct sandbox checkout simulator runs", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Needs clean, commented code. Prefers staging environments for previews.",
      communicationStyle: "Slack channels or structured email updates.",
      paymentBehavior: "Strict corporate invoice payment terms, pays Net 30.",
      revisionPattern: "Requests adjustments to mobile alignment or minor font sizes.",
      deliveryPreference: "GitHub repository access, zip file, and direct deploy to Vercel/Render.",
      clientRiskNotes: "Requires rigid scope definition to avoid free custom backend requests."
    }
  },

  SocialMediaManager: {
    title: "SMM Content Tracker",
    category: "Marketing",
    categories: ["Monthly Content Plan", "Instagram Grid", "Analytics Report", "Ad Campaign"],
    nextActions: [
      "Draft content calendar",
      "Schedule posts pipeline",
      "Review grid layout options",
      "Prepare weekly analytics",
      "Send billing statement"
    ],
    sampleProjects: [
      {
        title: "Instagram Feed Package (30 Days)",
        budget: 3500000,
        stage: "in_progress",
        description: "Grid visual curation, copy writing, and scheduling posts for the next month.",
        dueDateOffset: 12,
        priority: "Medium",
        tags: ["Marketing", "Instagram Grid"],
        nextAction: "Draft content calendar",
        checklist: [
          { text: "Perform target audience content audit", completed: true },
          { text: "Write 30 captions & select hashtags", completed: false },
          { text: "Arrange visual grid aesthetic", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Prefers pastel color themes and lifestyle photography. Likes emoji captions.",
      communicationStyle: "WhatsApp updates, weekly brief calls on Friday.",
      paymentBehavior: "Pays monthly retainer on the 1st of every month without reminders.",
      revisionPattern: "Occasionally asks for caption rewriting or keyword adjustments.",
      deliveryPreference: "Shared Google Drive folder with Google Sheets schedule tracker.",
      clientRiskNotes: "Client can be delayed in sending brand raw photo assets."
    }
  },

  AIConsultant: {
    title: "AI & Automation Suite",
    category: "Consulting",
    categories: ["AI Consultation", "Prompt Architecture", "AI Workflow Integration", "Automation Prototype"],
    nextActions: [
      "Conduct discovery audit workshop",
      "Draft AI prompt architecture",
      "Deploy automation agent",
      "Conduct employee training",
      "Verify system metrics"
    ],
    sampleProjects: [
      {
        title: "Make.com Automation Integration",
        budget: 15000000,
        stage: "new_lead",
        description: "Automating customer invoice logging from WhatsApp straight to Google Sheets and Xero.",
        dueDateOffset: 14,
        priority: "High",
        tags: ["Consulting", "AI Workflow Integration"],
        nextAction: "Conduct discovery audit workshop",
        checklist: [
          { text: "Map current manually-driven flow steps", completed: false },
          { text: "Design API integration diagram layout", completed: false },
          { text: "Build error fallback notification triggers", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Needs clean, commented code. Prefers staging environments for previews.",
      communicationStyle: "Slack channels or structured email updates.",
      paymentBehavior: "Strict corporate invoice payment terms, pays Net 30.",
      revisionPattern: "Requests adjustments to mobile alignment or minor font sizes.",
      deliveryPreference: "GitHub repository access, zip file, and direct deploy to Vercel/Render.",
      clientRiskNotes: "Requires rigid scope definition to avoid free custom backend requests."
    }
  },

  GeneralFreelancer: {
    title: "General Workspace Starter",
    category: "General",
    categories: ["General Project", "Consulting Support", "Custom Freelance Task"],
    nextActions: [
      "Agree on scope and timeline",
      "Kickoff initial project tasks",
      "Share progress status update",
      "Submit final deliverables",
      "Request payment settlement"
    ],
    sampleProjects: [
      {
        title: "Standard Deliverable Scope",
        budget: 3000000,
        stage: "proposal_sent",
        description: "General project setup covering milestones, briefs, and client reviews.",
        dueDateOffset: 10,
        priority: "Medium",
        tags: ["General", "General Project"],
        nextAction: "Agree on scope and timeline",
        checklist: [
          { text: "Confirm visual brief specifications", completed: true },
          { text: "Draft project outline spreadsheet", completed: false }
        ]
      }
    ],
    clientMemory: {
      clientPreference: "Varies. Keep communications simple and structured.",
      communicationStyle: "Email only to keep paper trail.",
      paymentBehavior: "Standard Net 14 payment terms.",
      revisionPattern: "Standard 2 rounds of review revisions.",
      deliveryPreference: "Zip package emailed directly.",
      clientRiskNotes: "Always confirm changes to original scope in email text."
    }
  }
};

/**
 * Loads template projects non-destructively into the store
 * @param {object} store - Workspace central store reference
 * @param {string} roleName - Selected freelancer template role
 */
export function applyTemplateProjects(store, roleName) {
  const template = templatesData[roleName];
  if (!template) return false;

  const today = new Date();
  const formatDateOffset = (days) => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Create a template client
  const clientData = {
    name: `${roleName} Client Representative`,
    businessName: `${roleName} Partner Brand`,
    email: `${roleName.toLowerCase()}-client@partner.com`,
    phone: "+62 809-1234-5678",
    status: "Active",
    lastFollowUpDate: today.toISOString().split('T')[0],
    notes: `Seeded via ${roleName} template starter pack.`,
    ...template.clientMemory
  };

  const newClient = store.addClient(clientData);

  // Add sample projects
  template.sampleProjects.forEach(proj => {
    const projData = {
      title: proj.title,
      clientId: newClient.id,
      clientName: `${newClient.name} (${newClient.businessName})`,
      budget: proj.budget,
      currency: "IDR",
      stage: proj.stage,
      description: proj.description,
      dueDate: formatDateOffset(proj.dueDateOffset),
      priority: proj.priority,
      tags: proj.tags,
      nextAction: proj.nextAction,
      checklist: proj.checklist.map(c => ({
        id: 'chk_' + Math.random().toString(36).substring(2, 9),
        text: c.text,
        completed: c.completed
      })),
      downPaymentPercent: 50,
      downPaymentAmount: Math.round(proj.budget * 0.5),
      finalPaymentAmount: proj.budget - Math.round(proj.budget * 0.5),
      remainingBalance: proj.budget - Math.round(proj.budget * 0.5),
      paymentStatus: proj.stage === "new_lead" ? "Not invoiced" : "DP paid"
    };

    store.addProject(projData);
  });

  return true;
}
