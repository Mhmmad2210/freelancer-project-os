/* ==========================================================================
   FREELANCER PROJECT OS - ROLE-BASED TEMPLATES DATA & UTILITY
   ========================================================================== */

import { generateId } from '../utils.js';
import { templatesData } from '../data/freelancerTemplates.js';
import { t } from '../i18n.js';

export { templatesData };

/**
 * Loads template projects non-destructively into the store
 * @param {object} store - Workspace central store reference
 * @param {string} roleName - Selected freelancer template role (normalized to key ID)
 */
export function applyTemplateProjects(store, roleName) {
  if (!roleName) return false;

  // Normalize string to match templatesData keys (e.g. "Video Editor" -> "video_editor")
  const templateId = roleName.toLowerCase().replace(/\s+/g, '_');
  const template = templatesData[templateId];
  if (!template) {
    console.error(`Template not found for normalized ID: ${templateId}`);
    return false;
  }

  const today = new Date();
  const defaultCurrency = localStorage.getItem('alurkarya_default_currency') || 'IDR';
  const formatDateOffset = (days) => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Add sample projects
  template.sampleProjects.forEach((proj, index) => {
    // 1. Client profile deduplication (Normalized match by name)
    const clientName = proj.clientName || 'Partner Client';
    const state = store.getState();
    const existingClients = state.clients || [];
    const normalizedNewName = clientName.trim().toLowerCase();
    
    let clientObj = existingClients.find(c => c.name.trim().toLowerCase() === normalizedNewName);
    
    const mapId = template.id === 'general_freelancer' ? 'general' : template.id;
    const templateLabel = t('templates.' + mapId, template.label);

    if (!clientObj) {
      // Create new client if matching one does not exist
      const clientData = {
        name: clientName,
        businessName: clientName,
        email: `contact@${clientName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: "+62 812-9999-8888",
        status: "Active",
        notes: t('templates.seededVia', 'Seeded via {template} template workflow.').replace('{template}', templateLabel),
        revisionPattern: proj.revisionRule || ""
      };
      clientObj = store.addClient(clientData);
    }

    // Offset due dates so they don't pile up on the same day
    const offsetDays = (index * 4) + 5; 

    // Build project payload with custom template fields
    const projData = {
      title: proj.title,
      clientId: clientObj.id,
      clientName: clientObj.name,
      budget: proj.budget || 3000000,
      currency: "IDR",
      projectCurrency: defaultCurrency,
      invoiceCurrency: defaultCurrency,
      paymentCurrency: defaultCurrency,
      stage: proj.stage || "new_lead",
      description: t('templates.sampleProjectDesc', 'Sample project for {template} workflow.\n\nRevision Rule: {rule}')
        .replace('{template}', templateLabel)
        .replace('{rule}', proj.revisionRule || t('templates.standardLimit', 'Standard limit.')),
      dueDate: formatDateOffset(offsetDays),
      priority: proj.priority || "Medium",
      tags: [templateLabel, proj.category || "General"],
      nextAction: proj.nextAction || "Contact client",
      checklist: (proj.deliveryChecklist || []).map(item => ({
        id: 'chk_' + Math.random().toString(36).substring(2, 9),
        text: item,
        completed: false
      })),
      deliveryChecklist: (proj.deliveryChecklist || []).map(item => ({
        id: 'del_' + Math.random().toString(36).substring(2, 9),
        label: item,
        completed: false,
        clientVisible: true
      })),
      
      // Keep payment values structured:
      downPaymentPercent: 50,
      downPaymentAmount: Math.round((proj.budget || 3000000) * 0.5),
      finalPaymentAmount: (proj.budget || 3000000) - Math.round((proj.budget || 3000000) * 0.5),
      remainingBalance: (proj.budget || 3000000) - Math.round((proj.budget || 3000000) * 0.5),
      paymentStatus: proj.stage === "new_lead" ? "Not invoiced" : "DP paid",

      // Add safe template metadata (Guardrail #3)
      templateRole: templateId,
      templateSource: "role_based_template",

      // Store specific copy script templates safely
      invoiceReminderExample: proj.invoiceReminderExample || "",
      portfolioCaseStudyPrompt: proj.portfolioCaseStudyPrompt || "",
      revisionRule: proj.revisionRule || ""
    };

    store.addProject(projData);
  });

  return true;
}
