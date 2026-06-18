/* ==========================================================================
   FREELANCER PROJECT OS - AI PROMPT HELPER PACK
   ========================================================================== */

export const promptTemplates = {
  meetingSummary: {
    name: "Meeting Summary Prompt",
    description: "Generate structured notes, deliverables, and action items from raw meeting scribbles.",
    generate: (proj) => `Help me summarize this client meeting into a freelancer project workflow.

Project:
${proj.title || 'Untitled Project'}

Client:
${proj.clientName || 'No Client Selected'}

Meeting Notes to Process:
${proj.meetingNotes || '[Paste your raw notes here]'}

Please generate:
1. Meeting Summary
2. Client Needs & Main Focus
3. Key Decisions Made
4. Action Items for Me (Freelancer)
5. Action Items for the Client
6. Potential Scope Creep Warnings
7. Suggested Next Action
8. Draft follow-up message to client

Use clear professional English.`
  },

  proposalDraft: {
    name: "Proposal Draft Prompt",
    description: "Create a formal, structured freelance proposal to pitch to a lead.",
    generate: (proj) => `Generate a professional freelance project proposal.

Project Name:
${proj.title || 'Untitled Project'}

Client Name:
${proj.clientName || 'No Client Selected'}

Project Scope & Description:
${proj.description || 'No description available.'}

Project Budget:
${proj.budget ? 'Rp ' + proj.budget.toLocaleString('id-ID') : 'TBD'}

Please draft a persuasive, high-value proposal including:
1. Introduction & Understanding of Client Needs
2. Proposed Solution & Architecture
3. Key Milestones & Estimated Schedule (Target Deadline: ${proj.dueDate || 'TBD'})
4. Investment Details (Budget and payment terms: 50% deposit, 50% final hand-off)
5. Revision Terms (Max revisions allowed: ${proj.maxRevision || 3} rounds)
6. Next Steps to kick off project

Maintain a confident, premium, and professional tone suitable for a digital freelancer.`
  },

  scopeChecker: {
    name: "Scope Checker Prompt",
    description: "Check a client request against your original scope to flag potential scope creep.",
    generate: (proj) => `Evaluate this client request for potential scope creep based on our project scope.

Project Details:
- Title: ${proj.title || 'Untitled Project'}
- Scope / Description: ${proj.description || 'No description.'}
- Target Deadline: ${proj.dueDate || 'TBD'}
- Current Stage: ${proj.stage || 'Queue'}

New Client Request:
${proj.clientRequest || '[Paste client request or feedback here]'}

Please analyze:
1. Is this request within the original project scope?
2. If outside scope, why? (Flag specific areas like coding extra pages, adding new features, extra revisions)
3. Estimate of additional complexity/hours.
4. Draft a polite, professional reply to the client explaining that this is an out-of-scope addition and offering to quote it separately.`
  },

  revisionBoundary: {
    name: "Revision Boundary Script",
    description: "Politely inform the client that they have reached the revision limit and explain fees.",
    generate: (proj) => `Draft a polite message to the client explaining that they have reached their project revision limit.

Project:
${proj.title || 'Untitled Project'}

Client Name:
${proj.clientName || 'No Client Selected'}

Revision Details:
- Current revision round: ${proj.revisionCount || 0}
- Maximum included revisions: ${proj.maxRevision || 3}
- Current revision feedback: ${proj.revisionNotes || 'No notes saved.'}

Requirements for the message:
1. Acknowledge and validate their feedback.
2. Politely remind them that this completes the ${proj.maxRevision || 3} rounds of revisions included in the original agreement.
3. State clearly that any further changes will be billed as out-of-scope additions (recommend drafting a minor supplemental invoice).
4. Keep the tone friendly, collaborative, and professional, ensuring they feel supported but clear on boundaries.`
  },

  invoiceFollowUp: {
    name: "Invoice Follow-up Prompt",
    description: "Draft a polite yet firm follow-up email for an unpaid invoice.",
    generate: (proj) => `Draft a polite, professional email reminder to a client regarding an unpaid invoice.

Project Details:
- Project Title: ${proj.title || 'Untitled Project'}
- Client: ${proj.clientName || 'No Client'}
- Invoice Number: ${proj.invoiceNumber || 'TBD'}
- Invoice Amount: ${proj.invoiceAmount ? 'Rp ' + proj.invoiceAmount.toLocaleString('id-ID') : 'TBD'}
- Due Date: ${proj.invoiceDueDate || 'TBD'}
- Current Payment Status: ${proj.paymentStatus || 'Waiting Payment'}

Please generate three versions of the message:
1. Friendly Reminder (2 days past due)
2. Firm Follow-up (7 days past due, reminding of stop-work/delivery terms)
3. Final Notice (14+ days past due, requesting immediate bank transfer settlement)

Keep it professional, direct, and non-aggressive, yet clear on payment expectations.`
  },

  clientUpdate: {
    name: "Client Update Message",
    description: "Generate a weekly progress update message that highlights wins and next steps.",
    generate: (proj) => `Generate a weekly project status update message to send to the client.

Project:
${proj.title || 'Untitled Project'}

Client Name:
${proj.clientName || 'No Client Selected'}

Current Status:
- Project Stage: ${proj.stage || 'In Progress'}
- Next Action: ${proj.nextAction || 'No next action logged.'}
- Target Deadline: ${proj.dueDate || 'TBD'}

Please generate a concise progress update including:
1. High-level wins or what was completed this week.
2. Current focus and what is being worked on next.
3. Any inputs or assets needed from the client.
4. Polite check-in on the schedule.

Keep it easy to scan (use bullet points), friendly, and professional (perfect for WhatsApp or Slack).`
  },

  finalDelivery: {
    name: "Final Delivery Message",
    description: "Draft a premium final delivery message containing source files and case study invites.",
    generate: (proj) => `Draft a professional project hand-off and delivery message.

Project Name:
${proj.title || 'Untitled Project'}

Client:
${proj.clientName || 'No Client'}

Deliverables & Links:
- Raw/Source Files Download Link: ${proj.rawFileDownloadLink || '[Insert download link]'}
- Final output: ${proj.finalDeliveryLink || '[Insert live/final view link]'}

Please draft a message that:
1. Announces the successful completion of the project.
2. Provides the links to download source files and deliverables.
3. Asks the client for a brief testimonial about the collaboration.
4. Suggests a future project or retainer partnership based on what was delivered.
5. Expresses gratitude for the collaboration.

Keep the tone premium, celebratory, and professional.`
  },

  portfolioCaseStudy: {
    name: "Portfolio Case Study Prompt",
    description: "Draft a high-impact case study outline for your portfolio to display to future clients.",
    generate: (proj) => `Write a compelling case study outline for my digital freelancing portfolio based on this project.

Project Name:
${proj.title || 'Untitled Project'}

Client Business/Brand:
${proj.clientName || 'No Client'}

Project Scope:
${proj.description || 'No description.'}

Portfolio Notes:
${proj.portfolioDescription || 'No portfolio notes.'}

Please draft a structured case study layout including:
1. Hook Title (Action-oriented, highlighting results)
2. Client Problem & Context (The challenge they faced)
3. Solution Delivered (Our process, tools, and creative decisions)
4. Deliverables Checklist
5. Visual Outcomes & Key Results (e.g., speed, conversions, aesthetics)
6. Social Media / Instagram Portfolio Caption (Friendly, engaging, with relevant hashtags)

Focus on high-value results and professional creative execution.`
  }
};

/**
 * Copies prompt content to clipboard and triggers a toast notification
 * @param {string} text - The generated prompt text
 * @param {function} toastCallback - The app global toast trigger
 */
export function copyPromptToClipboard(text, toastCallback) {
  navigator.clipboard.writeText(text)
    .then(() => {
      if (toastCallback) {
        toastCallback("AI Prompt successfully copied to clipboard!", "text-success");
      }
    })
    .catch(err => {
      console.error("Clipboard copy failed", err);
      if (toastCallback) {
        toastCallback("Failed to copy prompt to clipboard.", "text-danger");
      }
    });
}
