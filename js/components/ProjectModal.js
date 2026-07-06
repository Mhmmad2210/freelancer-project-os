/* ==========================================================================
   FREELANCER PROJECT OS - PROJECT DETAILS MODAL COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatMoney, formatDate, isOutsideWorkingHours, getDeliveryLabels, normalizeLink, showCompletionWarningModal, getDeliveryMessageText, showGenericConfirmationModal } from '../utils.js';
import { promptTemplates, copyPromptToClipboard } from './AIPromptHelpers.js';
import { ClientMemoryPanel } from './ClientMemoryPanel.js';
import { t, getLanguage } from '../i18n.js';

export class ProjectModal {
  /**
   * @param {object} store - Unified data store reference
   * @param {function} onStateChange - Refresh page components callback
   * @param {function} onTriggerToast - Notify users
   */
  constructor(store, onStateChange, onTriggerToast) {
    this.store = store;
    this.onStateChange = onStateChange;
    this.onTriggerToast = onTriggerToast;
    this.activeProjectId = null;
  }

  open(projectId) {
    this.activeProjectId = projectId;
    this.render();
  }

  close() {
    const modalOverlay = document.getElementById('project-detail-overlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 300);
    }
    this.activeProjectId = null;
  }

  checkMeetingAvailabilityWarning(projectId) {
    const project = this.store.getState().projects.find(p => p.id === projectId);
    if (!project) return;
    const availability = this.store.getState().availability;
    const warningEl = document.getElementById('m-p-meet-warning');
    if (warningEl) {
      const isOutside = isOutsideWorkingHours(project.meetingDate, project.meetingTime, availability, project.meetingTimezone);
      warningEl.style.display = isOutside ? 'flex' : 'none';
    }
  }

  render() {
    const state = this.store.getState();
    const project = state.projects.find(p => p.id === this.activeProjectId);
    if (!project) return;

    const clientObj = state.clients.find(c => c.id === project.clientId);

    const defaultCategories = ['Design', 'Development', 'Production', 'Marketing', 'Consulting', 'Copywriting'];
    const projectCategory = project.tags[0] || 'Design';
    const isCustomCategory = !defaultCategories.includes(projectCategory);
    
    let categoryOptions = defaultCategories
      .map(tag => `<option value="${tag}" ${projectCategory === tag ? 'selected' : ''}>${t('category.' + tag.toLowerCase(), tag)}</option>`)
      .join('');
    categoryOptions += `<option value="CUSTOM_CATEGORY" ${isCustomCategory ? 'selected' : ''}>${t('category.addCustom', 'Add custom category...')}</option>`;

    const clients = state.clients || [];
    const clientOptions = clients.map(c => `<option value="${c.id}" ${project.clientId === c.id ? 'selected' : ''}>${c.name} (${c.businessName || 'Personal'})</option>`).join('');

    const isLockedStage = ['in_progress', 'client_review', 'revision', 'invoice_sent', 'waiting_payment', 'completed'].includes(project.stage);

    let modalOverlay = document.getElementById('project-detail-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.id = 'project-detail-overlay';
      document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 860px; max-height: 90vh;">
        <div class="modal-header">
          <div style="flex: 1; margin-right: 20px;">
            <span class="manual-label">${t('projectModal.setup', 'Project Details')}</span>
            <input type="text" id="m-p-title" class="form-control" value="${project.title}" style="background: none; border: none; font-size: 1.25rem; font-weight: 800; padding: 2px 0; color: var(--text-primary); font-family: 'Plus Jakarta Sans', sans-serif;" required>
          </div>
          <button class="modal-close-btn" id="close-modal">&times;</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <div class="detail-drawer-grid">
            
            <!-- Left Main Column -->
            <div class="drawer-column-main">
              
              <!-- Category and Priority Row -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div class="form-group">
                  <label>${t('projectModal.category', 'Project Category')}</label>
                  <select class="form-control" id="m-p-category">${categoryOptions}</select>
                </div>
                <div class="form-group ${isCustomCategory ? '' : 'd-none'}" id="m-p-custom-category-group">
                  <label>${t('projectModal.customCategory', 'Custom Category')}</label>
                  <input type="text" id="m-p-custom-category" class="form-control" value="${isCustomCategory ? projectCategory : ''}" placeholder="e.g. Video Editing">
                </div>
                <div class="form-group">
                  <label>${t('projectModal.priority', 'Priority')}</label>
                  <select class="form-control" id="m-p-priority">
                    <option value="Low" ${project.priority === 'Low' ? 'selected' : ''}>${t('priority.low', 'Low Priority')}</option>
                    <option value="Medium" ${project.priority === 'Medium' ? 'selected' : ''}>${t('priority.medium', 'Medium Priority')}</option>
                    <option value="High" ${project.priority === 'High' ? 'selected' : ''}>${t('priority.high', 'High Priority')}</option>
                    <option value="Urgent" ${project.priority === 'Urgent' ? 'selected' : ''}>${t('priority.urgent', 'Urgent Priority')}</option>
                    <option value="TBD" ${project.priority === 'TBD' ? 'selected' : ''}>${t('priority.tbd', 'TBD')}</option>
                  </select>
                </div>
              </div>

              <!-- Scope Description & Notes (Collapsible) -->
              <div class="collapsible-section" id="section-description">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('fileText', '', 16)} ${t('projectModal.description', 'Description & Scope of Work')}</span>
                  <span class="toggle-icon">${getIcon('chevronDown', '', 14)}</span>
                </h4>
                <div class="collapsible-content">
                  <div class="form-group" style="margin: 0;">
                    <textarea class="form-control" id="m-p-desc" style="min-height: 80px;" placeholder="${t('projectModal.description', 'Write details of scope, brief, or job description...')}">${project.description || ''}</textarea>
                  </div>
                </div>
              </div>

              <!-- File & Delivery Links (Collapsible) -->
              <div class="collapsible-section" id="section-files">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('folder', '', 16)} ${t('projectModal.files', 'Files & Delivery Links')}</span>
                  <span class="toggle-icon">${getIcon('chevronDown', '', 14)}</span>
                </h4>
                <div class="collapsible-content">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                      <label>${t('projectModal.briefLink', 'Brief / Specification Link')}</label>
                      <input type="url" id="m-p-brief-url" class="form-control" value="${project.briefLink || ''}" placeholder="Link to Figma, brief document, etc...">
                    </div>
                    <div class="form-group">
                      <label>${t('delivery.rawSourceLink', 'Source / Raw Folder Link')}</label>
                      <input type="url" id="m-p-raw-url" class="form-control" value="${project.rawFileLink || ''}" placeholder="Link to Google Drive raw files folder...">
                    </div>
                    <div class="form-group">
                      <label>${t('delivery.draftLink', 'Draft / Staging Link')}</label>
                      <input type="url" id="m-p-draft-url" class="form-control" value="${project.draftFileLink || ''}" placeholder="Link to mockup, staging website, etc...">
                    </div>
                    <div class="form-group">
                      <label>${t('delivery.finalFileLink', 'Final Delivery Link')}</label>
                      <input type="url" id="m-p-final-url" class="form-control" value="${project.finalDeliveryLink || ''}" placeholder="Link to approved final file package...">
                    </div>
                    <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                      <label>${t('projectModal.refLink', 'Reference Asset Folder Link')}</label>
                      <input type="url" id="m-p-ref-url" class="form-control" value="${project.referenceFolderLink || ''}" placeholder="Link to logos, brand guidelines, reference folders...">
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Meeting & Client Notes (Collapsible) -->
              <div class="collapsible-section collapsed" id="section-meeting-notes">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('calendar', '', 16)} ${t('projectModal.meetingNotesTitle', 'Meeting & Client Notes')}</span>
                  <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
                </h4>
                <div class="collapsible-content">
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
                    <div class="form-group">
                      <label>${t('projectModal.meetDate', 'Meeting Date')}</label>
                      <input type="date" id="m-p-meet-date" class="form-control" value="${project.meetingDate || ''}">
                    </div>
                    <div class="form-group">
                      <label>${t('projectModal.meetTime', 'Meeting Time')}</label>
                      <input type="time" id="m-p-meet-time" class="form-control" value="${project.meetingTime || ''}">
                    </div>
                    <div class="form-group">
                      <label>${t('projectModal.meetPlatform', 'Meeting Platform / Type')}</label>
                      <input type="text" id="m-p-meet-type" class="form-control" value="${project.meetingType || 'Google Meet'}" placeholder="Google Meet, WhatsApp, Zoom...">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                      <label>${t('projectModal.meetLink', 'Meeting Room Link')}</label>
                      <input type="url" id="m-p-meet-link-val" class="form-control" value="${project.meetingLink || ''}" placeholder="https://meet.google.com/abc-defg-hij">
                    </div>
                    <div class="form-group">
                      <label>Meeting Timezone</label>
                      <input type="text" id="m-p-meet-timezone" class="form-control" value="${project.meetingTimezone || 'Asia/Jakarta'}" placeholder="EST, UTC, Asia/Jakarta...">
                    </div>
                  </div>
                  <div id="m-p-meet-warning" style="display: none; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--color-danger); border-radius: var(--border-radius-sm); padding: 8px; font-size: 0.75rem; color: var(--color-danger); font-weight: 700; margin-bottom: 12px; align-items: center; gap: 6px;">
                    ⚠️ Outside your working hours.
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div class="form-group">
                      <label>Client Request</label>
                      <textarea id="m-p-client-request" class="form-control" style="min-height: 80px;" placeholder="Notes on client requests...">${project.clientRequest || ''}</textarea>
                    </div>
                    <div class="form-group">
                      <label>Key Discussion Points</label>
                      <textarea id="m-p-key-discussion" class="form-control" style="min-height: 80px;" placeholder="Main points of discussion...">${project.keyDiscussionPoints || ''}</textarea>
                    </div>
                    <div class="form-group">
                      <label>Decisions Made</label>
                      <textarea id="m-p-decision-made" class="form-control" style="min-height: 80px;" placeholder="Decisions agreed upon...">${project.decisionMade || ''}</textarea>
                    </div>
                    <div class="form-group">
                      <label>Action Items (Freelancer Tasks)</label>
                      <textarea id="m-p-action-items" class="form-control" style="min-height: 80px;" placeholder="Freelancer tasks...">${project.actionItems || ''}</textarea>
                    </div>
                    <div class="form-group">
                      <label>Client Concern</label>
                      <textarea id="m-p-client-concern" class="form-control" style="min-height: 80px;" placeholder="Client concerns...">${project.clientConcern || ''}</textarea>
                    </div>
                    <div class="form-group">
                      <label>Client Expectation</label>
                      <textarea id="m-p-client-expectation" class="form-control" style="min-height: 80px;" placeholder="Client expectations...">${project.clientExpectation || ''}</textarea>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
                    <div class="form-group">
                      <label>Next Follow-Up Deadline</label>
                      <input type="date" id="m-p-next-followup" class="form-control" value="${project.nextFollowUpDate || ''}">
                    </div>
                    <div class="form-group">
                      <label>Client Review Date</label>
                      <input type="date" id="m-p-client-review-date" class="form-control" value="${project.clientReviewDate || ''}">
                    </div>
                    <div class="form-group">
                      <label>Final Delivery Date</label>
                      <input type="date" id="m-p-final-delivery-date" class="form-control" value="${project.finalDeliveryDate || ''}">
                    </div>
                  </div>

                  <div style="margin-top: 16px; border-top: 1px solid var(--border-subtle); padding-top: 12px; display: flex; justify-content: flex-end; align-items: center; gap: 12px; flex-wrap: wrap;">
                    <span style="font-size: 0.7rem; color: var(--text-muted);">
                      ${t('projectModal.aiNotetakerPlaceholder', '🎙️ Real AI Notetaker & Transcription (Coming Soon)')}
                    </span>
                    <button type="button" class="btn btn-secondary" id="btn-generate-ai-prompt" style="font-size: 0.78rem; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;">
                      ${getIcon('fileText', '', 14)} Copy AI Summary Prompt
                    </button>
                    <button type="button" class="btn btn-secondary" id="btn-extract-client-memory" style="font-size: 0.78rem; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px; background: rgba(139, 92, 246, 0.08); border-color: rgba(139, 92, 246, 0.25);">
                      🧠 Extract Client Memory
                    </button>
                  </div>
                </div>
              </div>

              <!-- Deliverables Checklist (Always Visible) -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px;">
                <h4 class="detail-section-title">${getIcon('checkSquare', '', 16)} Job Checklist (Deliverables)</h4>
                <div class="checklist-container" id="modal-checklist-list"></div>
                <form class="checklist-add-form" id="modal-checklist-form">
                  <input type="text" placeholder="Add task or deliverable..." class="checklist-input" required>
                  <button type="submit" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.8rem;">Add Task</button>
                </form>
              </div>

              <!-- Revisions & Reviews (Collapsible) -->
              <div class="collapsible-section collapsed" id="section-revisions">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('refresh', '', 16)} Revision & Review Tracking</span>
                  <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
                </h4>
                <div class="collapsible-content">
                  <!-- Revision Quota details -->
                  <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-size: 0.85rem; font-weight: 700;">
                        Revisions: ${project.revisionRound} / ${project.maxRevisionRounds || 'TBD'}
                      </span>
                    </div>
                    
                    <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
                      <div style="height: 100%; width: ${project.maxRevisionRounds ? Math.min(100, (project.revisionRound / project.maxRevisionRounds) * 100) : 0}%; background: ${project.revisionRound >= project.maxRevisionRounds ? 'var(--color-danger)' : 'var(--color-accent)'}; transition: width 0.3s ease;"></div>
                    </div>

                    ${project.revisionRound >= project.maxRevisionRounds ? `
                      <div style="color: var(--color-danger); font-size: 0.72rem; font-weight: 600; line-height: 1.3;">
                        ⚠️ Revision limit has been reached.
                      </div>
                      <div style="color: var(--text-muted); font-size: 0.68rem; margin-top: 2px; line-height: 1.3;">
                        Consider creating an additional quotation if revision is out of scope.
                      </div>
                    ` : ''}
                  </div>
                  
                  <div class="deliverables-box-list" id="modal-deliverables-list"></div>
                  
                  <form id="modal-deliverable-form" style="margin-top: 10px; display: grid; grid-template-columns: 1.2fr 1fr auto; gap: 6px;">
                    <input type="text" id="d-title" class="checklist-input" placeholder="Deliverable name..." required>
                    <input type="url" id="d-url" class="checklist-input" placeholder="Link URL..." required>
                    <button type="submit" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.8rem;">Link File</button>
                  </form>
                  
                  <div class="form-group" style="margin-top: 14px; margin-bottom: 0;">
                    <label>Revision Notes / Feedback</label>
                    <textarea class="form-control" id="m-p-rev-notes" style="min-height: 60px;" placeholder="Summarize client feedback and input here...">${project.revisionNotes || ''}</textarea>
                  </div>
                </div>
              </div>

              <!-- Invoice & Payment (Collapsible) -->
              <div class="collapsible-section collapsed" id="section-invoices">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('fileText', '', 16)} ${t('projectModal.invoicePayment', 'Invoice & Payment')}</span>
                  <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
                </h4>
                
                <div class="collapsible-content">
                  <span class="stat-subtext" style="display: block; margin-top: 4px; margin-bottom: 12px; font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">
                    ${t('projectModal.invoicePaymentDesc', 'Track invoice details, payment due date, follow-up reminders, and payment confirmation.')}
                  </span>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 8px;">
                    <!-- Invoice Status & Payment Status -->
                    <div class="form-group">
                      <label>${t('invoice.status', 'Invoice Status')}</label>
                      <select id="m-p-invoice-status" class="form-control">
                        <option value="Not Created" ${project.invoiceStatus === 'Not Created' ? 'selected' : ''}>${t('status.invoice.not_created', 'Not Created')}</option>
                        <option value="Draft" ${project.invoiceStatus === 'Draft' ? 'selected' : ''}>${t('status.invoice.draft', 'Draft')}</option>
                        <option value="Sent" ${project.invoiceStatus === 'Sent' ? 'selected' : ''}>${t('status.invoice.sent', 'Sent')}</option>
                        <option value="Paid" ${project.invoiceStatus === 'Paid' ? 'selected' : ''}>${t('status.invoice.paid', 'Paid')}</option>
                        <option value="Overdue" ${project.invoiceStatus === 'Overdue' ? 'selected' : ''}>${t('status.invoice.overdue', 'Overdue')}</option>
                      </select>
                    </div>
                    
                    <div class="form-group">
                      <label>${t('invoice.paymentStatus', 'Payment Status')}</label>
                      <select id="m-p-payment-status-select" class="form-control">
                        <option value="Not Started" ${project.paymentStatus === 'Not Started' ? 'selected' : ''}>${t('status.payment.not_started', 'Not Started')}</option>
                        <option value="Waiting Payment" ${project.paymentStatus === 'Waiting Payment' ? 'selected' : ''}>${t('status.payment.waiting_payment', 'Waiting Payment')}</option>
                        <option value="Fully Paid" ${project.paymentStatus === 'Fully Paid' ? 'selected' : ''}>${t('status.payment.fully_paid', 'Fully Paid')}</option>
                        <option value="Payment Received" ${project.paymentStatus === 'Payment Received' ? 'selected' : ''}>${t('status.payment.payment_received', 'Payment Received')}</option>
                      </select>
                      <div id="m-p-payment-suggestion" style="margin-top: 4px;"></div>
                    </div>

                    <!-- Invoice Number & Invoice Amount -->
                    <div class="form-group">
                      <label>${t('invoice.number', 'Invoice Number')}</label>
                      <input type="text" id="m-p-invoice-num" class="form-control" value="${project.invoiceNumber || ''}" placeholder="INV-001">
                    </div>
                    <div class="form-group">
                      <label>${t('invoice.amount', 'Invoice Amount')}</label>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <select id="m-p-invoice-currency" class="form-control" style="font-size: 0.75rem; padding: 6px; font-weight: 700; width: 80px;">
                          <option value="IDR" ${project.invoiceCurrency === 'IDR' ? 'selected' : ''}>IDR</option>
                          <option value="USD" ${project.invoiceCurrency === 'USD' ? 'selected' : ''}>USD</option>
                          <option value="SGD" ${project.invoiceCurrency === 'SGD' ? 'selected' : ''}>SGD</option>
                          <option value="AUD" ${project.invoiceCurrency === 'AUD' ? 'selected' : ''}>AUD</option>
                          <option value="EUR" ${project.invoiceCurrency === 'EUR' ? 'selected' : ''}>EUR</option>
                        </select>
                        <input type="number" id="m-p-invoice-amount" class="form-control" value="${project.invoiceAmount || 0}" placeholder="Amount" style="flex: 1;">
                      </div>
                    </div>

                    <!-- Invoice Date & Invoice Due Date -->
                    <div class="form-group">
                      <label>${t('invoice.date', 'Invoice Date')}</label>
                      <input type="date" id="m-p-invoice-date" class="form-control" value="${project.invoiceDate || ''}">
                    </div>
                    <div class="form-group">
                      <label>${t('invoice.dueDate', 'Invoice Due Date')}</label>
                      <input type="date" id="m-p-invoice-due" class="form-control" value="${project.invoiceDueDate || ''}">
                      <div id="m-p-overdue-suggestion" style="margin-top: 4px;"></div>
                    </div>

                    <!-- Payment Terms & Payment Method -->
                    <div class="form-group">
                      <label>${t('planner.workingHours', 'Payment Terms')}</label>
                      <input type="text" id="m-p-payment-terms" class="form-control" value="${project.paymentTerms || ''}" placeholder="Net 15, Net 30...">
                    </div>
                    <div class="form-group">
                      <label>${t('invoice.paymentMethod', 'Payment Method')}</label>
                      <input type="text" id="m-p-pay-method" class="form-control" value="${project.paymentMethod || ''}" placeholder="Bank Transfer, PayPal...">
                    </div>

                    <!-- Amount Paid & Amount Due -->
                    <!-- Amount Paid & Amount Due -->
                    <div class="form-group">
                      <label>${t('invoice.amountPaid', 'Amount Paid')}</label>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <select id="m-p-payment-currency" class="form-control" style="font-size: 0.75rem; padding: 6px; font-weight: 700; width: 80px;">
                          <option value="IDR" ${project.paymentCurrency === 'IDR' ? 'selected' : ''}>IDR</option>
                          <option value="USD" ${project.paymentCurrency === 'USD' ? 'selected' : ''}>USD</option>
                          <option value="SGD" ${project.paymentCurrency === 'SGD' ? 'selected' : ''}>SGD</option>
                          <option value="AUD" ${project.paymentCurrency === 'AUD' ? 'selected' : ''}>AUD</option>
                          <option value="EUR" ${project.paymentCurrency === 'EUR' ? 'selected' : ''}>EUR</option>
                        </select>
                        <input type="number" id="m-p-amount-paid" class="form-control" value="${project.amountPaid || 0}" placeholder="Amount Paid" style="flex: 1;">
                      </div>
                    </div>
                    <div class="form-group">
                      <label>${t('invoice.amountDue', 'Amount Due (Calculated)')}</label>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span id="m-p-amount-due-currency" style="font-size: 0.75rem; font-weight: 700; width: 80px; text-align: center; color: var(--text-muted);">
                          ${project.paymentCurrency || project.invoiceCurrency || 'IDR'}
                        </span>
                        <input type="number" id="m-p-amount-due" class="form-control" value="${project.amountDue || 0}" readonly disabled style="opacity: 0.7; flex: 1;">
                      </div>
                    </div>

                    <div class="form-group" style="grid-column: span 2; margin-top: -8px; margin-bottom: 4px;">
                      <div id="m-p-currency-mismatch-helper" style="font-size: 0.68rem; color: var(--color-warning); display: none;"></div>
                      <div id="m-p-payment-currency-mismatch-helper" style="font-size: 0.68rem; color: var(--color-warning); display: none;"></div>
                    </div>

                    <!-- Last Follow-up Date & Next Follow-up Date -->
                    <div class="form-group">
                      <label>${t('invoice.lastFollowUp', 'Last Follow-up Date')}</label>
                      <input type="date" id="m-p-last-followup" class="form-control" value="${project.lastFollowUpDate || ''}">
                    </div>
                    <div class="form-group">
                      <label>${t('invoice.nextFollowUp', 'Next Follow-up Date')}</label>
                      <input type="date" id="m-p-next-followup" class="form-control" value="${project.nextFollowUpDate || ''}">
                    </div>

                    <!-- Receipt / Payment Proof Link & Invoice File Link -->
                    <div class="form-group" style="grid-column: span 2;">
                      <label>Receipt / Payment Proof Link</label>
                      <input type="url" id="m-p-payment-receipt" class="form-control" value="${project.receiptLink || project.paymentReceiptLink || ''}" placeholder="https://...">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                      <label>Invoice File Link</label>
                      <input type="url" id="m-p-invoice-url" class="form-control" value="${project.invoiceFileLink || ''}" placeholder="https://...">
                    </div>

                    <!-- Payment Notes -->
                    <div class="form-group" style="grid-column: span 2; margin-bottom: 0;">
                      <label>Payment Notes</label>
                      <textarea id="m-p-payment-notes" class="form-control" placeholder="Internal payment notes, transaction references..." style="min-height: 60px;">${project.paymentNotes || ''}</textarea>
                    </div>

                    <!-- Invoice AI Helpers Grid -->
                    <div style="grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                      <button type="button" class="btn btn-secondary btn-sm" id="btn-invoice-ai-followup" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                        ${getIcon('copy', '', 12)} Follow-up Msg
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" id="btn-invoice-ai-overdue" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                        ${getIcon('alertTriangle', '', 12)} Overdue Reminder
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" id="btn-invoice-ai-confirm" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                        ${getIcon('check', '', 12)} Payment Confirm
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm" id="btn-invoice-ai-receipt" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                        ${getIcon('fileText', '', 12)} Receipt Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Client Memory (Collapsible) -->
              <div class="collapsible-section collapsed" id="section-client-memory">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('user', '', 16)} ${t('projectModal.clientMemorySnapshot', 'Client Memory & Project History')}</span>
                  <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
                </h4>
                <div class="collapsible-content">
                  <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
                    ${t('projectModal.clientMemoryDesc', 'Capture important client context so you do not lose project history across chats, meetings, and files.')}
                  </p>
                  ${clientObj ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                      <div class="form-group">
                        <label>${t('projectModal.clientPreference', 'Client Preference')}</label>
                        <textarea id="m-c-preference" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.clientPreferencePlaceholder', 'e.g. Prefers Monday updates')}">${clientObj.clientPreference || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.communicationStyle', 'Communication Style')}</label>
                        <textarea id="m-c-comm-style" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.communicationStylePlaceholder', 'e.g. WhatsApp only, direct call')}">${clientObj.communicationStyle || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.paymentBehavior', 'Payment Behavior')}</label>
                        <textarea id="m-c-payment-behavior" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.paymentBehaviorPlaceholder', 'e.g. Needs 1 reminder follow-up')}">${clientObj.paymentBehavior || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.revisionPattern', 'Revision Pattern')}</label>
                        <textarea id="m-c-revision-pattern" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.revisionPatternPlaceholder', 'e.g. Usually asks for extra rounds')}">${clientObj.revisionPattern || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.deliveryPreference', 'Delivery Preference')}</label>
                        <textarea id="m-c-delivery-preference" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.deliveryPreferencePlaceholder', 'e.g. Figma + Google Drive SVGs')}">${clientObj.deliveryPreference || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.clientRiskNotes', 'Client Risk Notes')}</label>
                        <textarea id="m-c-risk-notes" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.clientRiskNotesPlaceholder', 'e.g. Scope creep prone')}">${clientObj.clientRiskNotes || ''}</textarea>
                      </div>
                      <div class="form-group" style="grid-column: span 2;">
                        <label>${t('projectModal.importantNotes', 'Important Notes')}</label>
                        <textarea id="m-c-important-notes" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.importantNotesPlaceholder', 'Other critical preferences...')}">${clientObj.importantNotes || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.lastProjectSummary', 'Last Project Summary')}</label>
                        <textarea id="m-c-last-proj-summary" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.lastProjectSummaryPlaceholder', 'Summary of previous work...')}">${clientObj.lastProjectSummary || ''}</textarea>
                      </div>
                      <div class="form-group">
                        <label>${t('projectModal.lastMeetingSummary', 'Last Meeting Summary')}</label>
                        <textarea id="m-c-last-meet-summary" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.lastMeetingSummaryPlaceholder', 'Notes from previous meeting...')}">${clientObj.lastMeetingSummary || ''}</textarea>
                      </div>
                    </div>
                  ` : `
                    <div style="background: rgba(255,255,255,0.01); border: 1px dashed var(--border-subtle); padding: 16px; text-align: center; border-radius: 8px; font-size: 0.82rem; color: var(--text-muted);">
                      ${t('projectModal.noClientAssociated', 'No client associated with this project. Select a client in the sidebar to enable Client Memory.')}
                    </div>
                  `}
                </div>
              </div>

              <!-- Delivery Center (Collapsible) -->
              <div class="collapsible-section collapsed" id="section-delivery-center">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>${getIcon('checkSquare', '', 16)} ${t('projectModal.deliveryCenter', 'Delivery Center')}</span>
                  <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
                </h4>
                <div class="collapsible-content">
                  <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
                    ${t('projectModal.deliveryCenterDesc', 'Organize preview links, final files, source files, approval status, and handover notes before marking a project as completed.')}
                  </p>
                  
                  <div style="background: rgba(255, 255, 255, 0.015); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px 12px; border-radius: 8px; font-size: 0.7rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 14px;">
                    ℹ️ <strong>${getLanguage() === 'id' ? 'Disclaimer File:' : 'File Disclaimer:'}</strong>
                    ${getLanguage() === 'id'
                      ? 'AlurKarya tidak menyimpan file asli. File tetap berada di Google Drive, Figma, Canva, Dropbox, atau platform pilihanmu. AlurKarya hanya menyimpan link untuk membantu mengatur review, delivery, invoice, dan payment. Keamanan file mengikuti permission di platform asal.'
                      : 'AlurKarya does not store your actual files. Your files stay in Google Drive, Figma, Canva, Dropbox, or your preferred platform. AlurKarya only stores links to help manage review, delivery, invoice, and payment flow. File security follows the permissions set on the original platform.'}
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                    <div class="form-group">
                      <label>${t('delivery.status', 'Delivery Status')}</label>
                      <select class="form-control" id="m-p-delivery-status-select-val" style="font-size: 0.75rem;">
                        <option value="Not Submitted" ${project.deliveryStatus === 'Not Submitted' ? 'selected' : ''}>${t('status.delivery.not_submitted', 'Not Submitted')}</option>
                        <option value="Draft Submitted" ${project.deliveryStatus === 'Draft Submitted' ? 'selected' : ''}>${t('status.delivery.draft_submitted', 'Draft Submitted')}</option>
                        <option value="Waiting Feedback" ${project.deliveryStatus === 'Waiting Feedback' ? 'selected' : ''}>${t('status.delivery.waiting_feedback', 'Waiting Feedback')}</option>
                        <option value="Revision Needed" ${project.deliveryStatus === 'Revision Needed' ? 'selected' : ''}>${t('status.delivery.revision_needed', 'Revision Needed')}</option>
                        <option value="Approved" ${project.deliveryStatus === 'Approved' ? 'selected' : ''}>${t('status.delivery.approved', 'Approved')}</option>
                        <option value="Final Delivered" ${project.deliveryStatus === 'Final Delivered' ? 'selected' : ''}>${t('status.delivery.final_delivered', 'Final Delivered')}</option>
                        <option value="Handover Complete" ${project.deliveryStatus === 'Handover Complete' ? 'selected' : ''}>${t('status.delivery.handover_complete', 'Handover Complete')}</option>
                      </select>
                      <span style="font-size: 0.68rem; color: var(--text-muted); font-style: italic; display: block; margin-top: 4px;" id="suggested-delivery-status-label">${t('projectModal.suggested', 'Suggested')}: ${t('status.delivery.not_submitted', 'Not Submitted')}</span>
                    </div>
                    
                    <div class="form-group">
                      <label>${t('delivery.deliveryDate', 'Delivery Date')}</label>
                      <input type="date" id="m-p-delivery-date-val" class="form-control" value="${project.deliveryDate || ''}" style="font-size: 0.75rem;">
                    </div>
                    
                    <div class="form-group">
                      <label>${getDeliveryLabels(project.templateRole).preview}</label>
                      <input type="url" id="m-p-preview-link-val" class="form-control" value="${project.previewLink || ''}" placeholder="${t('projectModal.previewPlaceholder', 'Live link for client review...')}">
                    </div>
                    
                    <div class="form-group">
                      <label>${t('delivery.draftLink', 'Draft Link')}</label>
                      <input type="url" id="m-p-draft-link-val" class="form-control" value="${project.draftLink || ''}" placeholder="${t('projectModal.draftPlaceholder', 'Optional draft document/file...')}">
                    </div>

                    <div class="form-group">
                      <label>${t('delivery.reviewLink', 'Review Link')}</label>
                      <input type="url" id="m-p-review-link-val" class="form-control" value="${project.reviewLink || ''}" placeholder="${t('projectModal.reviewPlaceholder', 'Optional review panel link...')}">
                    </div>
                    
                    <div class="form-group">
                      <label>${t('delivery.fileFolderLink', 'File Folder Link')}</label>
                      <input type="url" id="m-p-file-folder-link-val" class="form-control" value="${project.fileFolderLink || ''}" placeholder="${t('projectModal.fileFolderPlaceholder', 'Link to Figma, Drive, Dropbox...')}">
                    </div>
                    
                    <div class="form-group">
                      <label>${getDeliveryLabels(project.templateRole).final}</label>
                      <input type="url" id="m-p-final-file-link-val" class="form-control" value="${project.finalFileLink || ''}" placeholder="${t('projectModal.finalPlaceholder', 'Link to final delivered master...')}">
                    </div>
                    
                    <div class="form-group">
                      <label>${getDeliveryLabels(project.templateRole).raw}</label>
                      <input type="url" id="m-p-raw-file-link-val" class="form-control" value="${project.rawFileLink || ''}" placeholder="${t('projectModal.rawPlaceholder', 'Link to raw/editable source...')}">
                    </div>

                    <div class="form-group" style="grid-column: span 2;">
                      <label>${t('projectModal.clientFeedbackSummary', 'Client Feedback Summary')}</label>
                      <textarea id="m-p-client-feedback-summary" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.clientFeedbackPlaceholder', 'Summary of feedback provided by the client...')}">${project.clientFeedbackSummary || ''}</textarea>
                    </div>

                    <div class="form-group" style="grid-column: span 2;">
                      <label>${t('delivery.handoverNotes', 'Handover Notes')}</label>
                      <textarea id="m-p-handover-notes-val" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.handoverNotesPlaceholder', 'Delivery and handover notes for the client...')}">${project.handoverNotes || ''}</textarea>
                    </div>
                    
                    <div class="form-group" style="grid-column: span 2;">
                      <label>${t('delivery.clientVisibleNotes', 'Client Visible Notes')}</label>
                      <textarea id="m-p-client-visible-notes" class="form-control" style="min-height: 50px;" placeholder="${t('projectModal.clientVisibleNotesPlaceholder', 'Public project notes visible to the client...')}">${project.clientVisibleNotes || ''}</textarea>
                      <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px;">${t('projectModal.clientVisibleNotesDesc', 'These notes may appear in the Client Dashboard.')}</span>
                    </div>

                    <div class="form-group" style="grid-column: span 2; display: flex; align-items: center; gap: 8px; margin-bottom: 0;">
                      <input type="checkbox" id="m-p-client-confirmed-delivery" ${project.clientConfirmedDelivery ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;">
                      <label for="m-p-client-confirmed-delivery" style="margin-bottom: 0; font-size: 0.8rem; cursor: pointer; font-weight: 600; color: var(--text-primary);">${t('delivery.confirmedDelivery', 'Client confirmed final delivery')}</label>
                    </div>
                  </div>

                  <!-- Delivery Checklist (Role-aware & Editable) -->
                  <div style="border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 14px; margin-top: 14px;">
                    <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; display: block; margin-bottom: 8px;">${t('delivery.checklist', 'Delivery Checklist')}</span>
                    <div id="modal-delivery-checklist-list"></div>
                    <div style="display: flex; gap: 8px; margin-top: 10px;">
                      <input type="text" id="m-p-delivery-chk-new-label" class="form-control" style="font-size: 0.75rem; padding: 4px 8px;" placeholder="${t('projectModal.addCustomDeliveryStep', 'Add custom delivery step...')}">
                      <button class="btn btn-secondary" id="m-btn-delivery-chk-add" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 4px;">
                        Add Step
                      </button>
                    </div>
                  </div>

                  <!-- Delivery AI Helpers Grid -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px;">
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-delivery-ai-msg" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                      ${getIcon('mail', '', 12)} ${t('projectModal.copyDeliveryMsg', 'Copy Delivery Msg')}
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-delivery-ai-handover" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                      ${getIcon('code', '', 12)} ${t('projectModal.handoverNotesPrompt', 'Handover Notes Prompt')}
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-delivery-ai-revsummary" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                      ${getIcon('list', '', 12)} ${t('projectModal.revisionSummaryMsg', 'Revision Summary Msg')}
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-delivery-ai-checklist" style="font-size: 0.72rem; padding: 6px; justify-content: center; display: inline-flex; align-items: center; gap: 4px;">
                      ${getIcon('checkSquare', '', 12)} ${t('projectModal.finalChecklistPrompt', 'Final Checklist Prompt')}
                    </button>
                  </div>
                </div>
              </div>

              <!-- AI Prompt Helpers (Collapsible) -->
              <div class="collapsible-section collapsed" id="section-ai-prompts">
                <h4 class="detail-section-title collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                  <span>🤖 ${t('projectModal.aiPromptHelpers', 'AI Prompt Helpers')}</span>
                  <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
                </h4>
                <div class="collapsible-content" style="display: flex; flex-direction: column; gap: 12px;">
                  <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 4px;">
                    ${t('aiPrompts.subtitle', 'Generate copy-ready prompts and client messages from your project, client, delivery, invoice, and meeting context.')}
                  </p>

                  <!-- Category Tabs -->
                  <div class="ai-prompt-categories" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 4px;" id="ai-categories-bar">
                    <button type="button" class="btn btn-secondary btn-xs active" data-cat="client_communication" style="padding: 4px 8px; font-size: 0.65rem;">${t('aiPrompts.clientCommunication', 'Communication')}</button>
                    <button type="button" class="btn btn-secondary btn-xs" data-cat="meeting_memory" style="padding: 4px 8px; font-size: 0.65rem;">${t('aiPrompts.meetingMemory', 'Meeting & Memory')}</button>
                    <button type="button" class="btn btn-secondary btn-xs" data-cat="delivery" style="padding: 4px 8px; font-size: 0.65rem;">${t('aiPrompts.delivery', 'Delivery')}</button>
                    <button type="button" class="btn btn-secondary btn-xs" data-cat="invoice_payment" style="padding: 4px 8px; font-size: 0.65rem;">${t('aiPrompts.invoicePayment', 'Invoice & Pay')}</button>
                    <button type="button" class="btn btn-secondary btn-xs" data-cat="portfolio_review" style="padding: 4px 8px; font-size: 0.65rem;">${t('aiPrompts.portfolioReview', 'Portfolio')}</button>
                    <button type="button" class="btn btn-secondary btn-xs" data-cat="planning" style="padding: 4px 8px; font-size: 0.65rem;">${t('aiPrompts.planning', 'Planning')}</button>
                    <button type="button" class="btn btn-secondary btn-xs" data-cat="history" style="padding: 4px 8px; font-size: 0.65rem;">${t('history', 'History')}</button>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <!-- Prompt Selector -->
                    <div class="form-group" style="margin-bottom: 0;">
                      <label style="font-size: 0.68rem; color: var(--text-muted);">${t('projectModal.selectTemplate', 'Select Template')}</label>
                      <select class="form-control" id="ai-prompt-selector" style="font-size: 0.78rem; padding: 6px 10px;"></select>
                    </div>

                    <!-- Tone Selector -->
                    <div class="form-group" style="margin-bottom: 0;">
                      <label style="font-size: 0.68rem; color: var(--text-muted);">${t('projectModal.selectTone', 'Select Tone')}</label>
                      <select class="form-control" id="ai-tone-selector" style="font-size: 0.78rem; padding: 6px 10px;">
                        <option value="Professional">${t('tone.professional', 'Professional')}</option>
                        <option value="Friendly">${t('tone.friendly', 'Friendly')}</option>
                        <option value="Firm">${t('tone.firm', 'Firm')}</option>
                        <option value="Warm">${t('tone.warm', 'Warm')}</option>
                        <option value="Concise">${t('tone.concise', 'Concise')}</option>
                      </select>
                    </div>

                    <!-- Output Language Selector -->
                    <div class="form-group" style="margin-bottom: 0;">
                      <label style="font-size: 0.68rem; color: var(--text-muted);">${t('projectModal.outputLanguage', 'Output Language')}</label>
                      <select class="form-control" id="ai-lang-selector" style="font-size: 0.78rem; padding: 6px 10px;">
                        <option value="app">${t('projectModal.useAppLang', 'Use App Language')}</option>
                        <option value="en">English</option>
                        <option value="id">Bahasa Indonesia</option>
                      </select>
                    </div>
                  </div>

                  <!-- Client Safe Mode Toggle -->
                  <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px;">
                    <div style="display: flex; flex-direction: column;">
                      <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary);">${t('projectModal.clientSafePrivacyShield', 'Client-safe privacy shield')}</span>
                      <span style="font-size: 0.65rem; color: var(--text-muted);">${t('projectModal.clientSafePrivacyShieldDesc', 'Hides internal risk notes & private strategy fields')}</span>
                    </div>
                    <input type="checkbox" id="ai-client-safe-toggle" checked style="width: 16px; height: 16px; cursor: pointer;">
                  </div>

                  <!-- Missing Fields Alert -->
                  <div id="ai-missing-context-helper" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 6px; padding: 8px 10px; font-size: 0.68rem; color: var(--color-warning); display: none;">
                    ${t('projectModal.missingContextHelper', '⚠️ Some project details are missing. The prompt will use safe placeholders.')}
                  </div>

                  <!-- Output Mode Type Indicator -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                    <span id="ai-output-type-badge" style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: rgba(139, 92, 246, 0.15); color: #a78bfa;">${t('aiPrompts.aiPrompt', 'AI Prompt')}</span>
                    <span style="font-size: 0.65rem; color: var(--text-muted); font-style: italic;">${t('projectModal.reviewContentBeforeCopying', '🔒 Review content before copying')}</span>
                  </div>

                  <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 12px; font-family: monospace; font-size: 0.72rem; color: var(--text-secondary); max-height: 220px; overflow-y: auto; white-space: pre-wrap;" id="ai-prompt-preview"></div>

                  <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-secondary" id="btn-ai-regenerate" style="font-size: 0.78rem; padding: 8px; justify-content: center; flex: 1;">
                      ${getIcon('refresh', '', 14)} ${t('projectModal.regenerate', 'Regenerate')}
                    </button>
                    <button type="button" class="btn btn-primary" id="btn-copy-ai-prompt" style="font-size: 0.78rem; padding: 8px; justify-content: center; flex: 2; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
                      ${getIcon('copy', '', 14)} ${t('projectModal.copyPromptToClipboard', 'Copy Prompt to Clipboard')}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Sidebar Columns -->
            <div class="drawer-column-sidebar">
              <!-- Helper locked stage warning message banner -->
              ${isLockedStage ? `
                <div class="locked-helper-banner" style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); padding: 10px 14px; border-radius: 6px; font-size: 0.75rem; color: var(--color-accent); margin-bottom: 16px;">
                  💡 To change details of this project, move it back to <strong>Queue</strong>.
                </div>
              ` : ''}

              <!-- Completed stage Highlight Card -->
              ${project.stage === 'completed' ? `
                <div class="form-group" style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 16px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
                  <span style="font-size: 1.5rem; display: block; margin-bottom: 6px;">🎉</span>
                  <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-success); display: block; margin-bottom: 6px;">
                    Project completed and all payments received.
                  </span>
                  <button class="btn btn-secondary btn-sm" id="m-btn-reopen-project" style="margin: 0 auto; padding: 4px 12px; font-size: 0.72rem; justify-content: center; width: 100%;">
                    Reopen Project
                  </button>
                </div>
              ` : ''}

              <!-- Prominent Raw File Delivery Area (Always visible in Completed, else hidden/secondary) -->
              ${project.stage === 'completed' ? `
                <div class="form-group" style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.25); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                  <label class="drawer-meta-title" style="color: var(--color-primary); font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                    ${getIcon('upload', '', 14)} Link to Send Raw / Source File
                  </label>
                  <p style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;">
                    Upload the raw/source file link to be sent or downloaded by the client.
                  </p>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <input type="url" id="m-p-raw-download-link" class="form-control" style="font-size: 0.78rem;" value="${project.rawFileDownloadLink || ''}" placeholder="Example: Google Drive link">
                    <button type="button" class="btn btn-primary btn-sm" id="m-btn-save-raw-download" style="padding: 6px 12px; font-size: 0.72rem; justify-content: center; width: 100%; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
                      Save Link
                    </button>
                  </div>
                </div>

                <!-- Completed checklist -->
                <div class="form-group" style="background: var(--bg-secondary); border: 1px solid var(--border-subtle); padding: 14px; border-radius: 8px; margin-bottom: 16px;">
                  <label class="drawer-meta-title" style="margin-bottom: 8px;">Delivery Completion Checklist</label>
                  <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.78rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="color: var(--color-success);">${getIcon('check', '', 12)}</span>
                      <span>Client approved</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="color: var(--color-success);">${getIcon('check', '', 12)}</span>
                      <span>Invoice sent</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="color: var(--color-success);">${getIcon('check', '', 12)}</span>
                      <span>Payment received</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="color: var(--color-success);">${getIcon('check', '', 12)}</span>
                      <span>Final files sent</span>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Revision stage CTA & Quota Control -->
              ${project.stage === 'revision' ? `
                <div class="form-group" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.25); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                  <span style="font-size: 0.7rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; display: block; margin-bottom: 8px;">
                    🔄 Revision Tracking
                  </span>
                  
                  <button class="btn btn-primary" id="btn-work-revision" style="background: var(--color-accent); border-color: rgba(245,158,11,0.25); width: 100%; justify-content: center; margin-bottom: 12px; font-size: 0.78rem;">
                    🛠️ Work on Revision
                  </button>

                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-size: 0.75rem; font-weight: 700;">Revisions: ${project.revisionRound} / ${project.maxRevisionRounds || 'TBD'}</span>
                    <div style="display: flex; gap: 6px;">
                      <button class="invoice-btn-small" id="m-p-rev-dec" style="padding: 2px 8px; font-weight: 800;">-</button>
                      <button class="invoice-btn-small" id="m-p-rev-inc" style="padding: 2px 8px; font-weight: 800;" ${project.maxRevisionRounds && project.revisionRound >= project.maxRevisionRounds ? 'disabled' : ''}>+</button>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Waiting Payment Reminder Card -->
              ${project.stage === 'waiting_payment' ? `
                <div class="form-group" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                  <span style="font-size: 0.7rem; font-weight: 700; color: var(--color-accent); text-transform: uppercase; display: block; margin-bottom: 8px;">
                    💳 Payment Reminder
                  </span>
                  <p style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px;">
                    This stage is used as a payment reminder, not for working on the project.
                  </p>
                  
                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Payment Status</label>
                    <select class="form-control" id="m-p-payment-status-select-sidebar" style="font-size: 0.75rem; padding: 4px 6px;">
                      <option value="Waiting Payment" ${project.paymentStatus === 'Waiting Payment' || project.paymentStatus === 'Waiting payment' ? 'selected' : ''}>Waiting Payment</option>
                      <option value="DP Paid" ${project.paymentStatus === 'DP Paid' || project.paymentStatus === 'DP paid' ? 'selected' : ''}>DP Paid</option>
                      <option value="Fully Paid" ${project.paymentStatus === 'Fully Paid' || project.paymentStatus === 'Paid' ? 'selected' : ''}>Fully Paid</option>
                      <option value="Overdue" ${project.paymentStatus === 'Overdue' || project.paymentStatus === 'Invoice overdue' ? 'selected' : ''}>Overdue</option>
                      <option value="Cancelled" ${project.paymentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Payment Due Date</label>
                    <input type="date" id="m-p-payment-due-sidebar" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.paymentDueDate || ''}">
                  </div>
                  
                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Last Follow-up Date</label>
                    <input type="date" id="m-p-last-followup-sidebar" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.lastFollowUpDate || ''}">
                  </div>

                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Next Follow-up Date</label>
                    <input type="date" id="m-p-next-followup-sidebar" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.nextFollowUpDate || ''}">
                  </div>

                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Payment Receipt Link</label>
                    <input type="url" id="m-p-payment-receipt-sidebar" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.paymentReceiptLink || ''}" placeholder="Google Drive link of proof of payment...">
                  </div>

                  <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Reminder Notes</label>
                    <textarea id="m-p-reminder-note-sidebar" class="form-control" style="font-size: 0.75rem; padding: 4px 6px; min-height: 40px;" placeholder="Follow-up notes...">${project.reminderNote || ''}</textarea>
                  </div>
                </div>
              ` : ''}

              <!-- Client Approval Status (Visible starting from Client Review) -->
              ${['client_review', 'revision', 'invoice_sent', 'waiting_payment', 'completed'].includes(project.stage) ? `
                <div class="form-group" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                  <label class="drawer-meta-title" style="color: var(--color-success); font-weight: 700;">Client Approval Status</label>
                  <select class="form-control" id="m-p-approval-status-select" style="font-size: 0.75rem; padding: 4px 6px;">
                    <option value="Pending Review" ${project.clientApprovalStatus === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                    <option value="Approved" ${project.clientApprovalStatus === 'Approved' ? 'selected' : ''}>Approved</option>
                    <option value="Needs Revision" ${project.clientApprovalStatus === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
                  </select>
                </div>
              ` : ''}

              <!-- Main Stage Selection -->
              <div class="form-group">
                <label class="drawer-meta-title">Project Stage Status</label>
                <select class="form-control" id="m-p-stage">
                  <option value="new_lead" ${project.stage === 'new_lead' ? 'selected' : ''}>New Lead</option>
                  <option value="proposal_sent" ${project.stage === 'proposal_sent' ? 'selected' : ''}>Queue</option>
                  <option value="in_progress" ${project.stage === 'in_progress' ? 'selected' : ''}>In Progress</option>
                  <option value="client_review" ${project.stage === 'client_review' ? 'selected' : ''}>Client Review</option>
                  <option value="revision" ${project.stage === 'revision' ? 'selected' : ''}>Revision</option>
                  <option value="invoice_sent" ${project.stage === 'invoice_sent' ? 'selected' : ''}>Invoice Sent</option>
                  <option value="waiting_payment" ${project.stage === 'waiting_payment' ? 'selected' : ''}>Waiting Payment</option>
                  <option value="completed" ${project.stage === 'completed' ? 'selected' : ''}>Completed</option>
                  <option value="on_hold" ${project.stage === 'on_hold' ? 'selected' : ''}>On Hold</option>
                </select>
              </div>

              <!-- Preview Client Dashboard Button -->
              <div style="margin-bottom: 16px;">
                <button type="button" class="btn btn-secondary" id="btn-modal-preview-client" style="width: 100%; justify-content: center; gap: 6px; padding: 8px; font-size: 0.78rem;">
                  ${getIcon('externalLink', '', 14)} ${t('clientView.previewClientDashboard', 'Preview Client Dashboard')}
                </button>
              </div>

              <!-- On Hold Project detail card -->
              ${project.stage === 'on_hold' ? `
                <div class="form-group" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                  <span style="font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 4px;">
                    ⏸️ On Hold Project
                  </span>
                  <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;">
                    This project is temporarily on hold. Add a hold reason so the project does not get lost from tracking. Set a follow-up date to remind you when the project needs to be checked again.
                  </p>
                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Hold Reason</label>
                    <input type="text" id="m-p-hold-reason" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.holdReason || ''}" placeholder="Example: Waiting for client budget decision...">
                  </div>
                  <div class="form-group" style="margin-bottom: 8px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Hold Date</label>
                    <input type="date" id="m-p-hold-date" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.holdDate || ''}">
                  </div>
                  <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Next Follow Up</label>
                    <input type="date" id="m-p-hold-followup" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${project.holdFollowUpDate || ''}">
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn btn-primary btn-sm" id="m-btn-resume-hold" style="flex: 1; padding: 6px; font-size: 0.72rem; justify-content: center; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
                      Resume Project
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" id="m-btn-waiting-client-hold" style="flex: 1; padding: 6px; font-size: 0.72rem; justify-content: center;">
                      Waiting Client
                    </button>
                  </div>
                </div>
              ` : ''}

              <!-- Project Setup Card Wrapper -->
              <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                <h4 style="margin: 0; font-size: 0.82rem; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  ${getIcon('settings', '', 14)} Project Setup
                </h4>

                <!-- Client Dropdown Selection -->
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="drawer-meta-title">Client Name / Company</label>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <select class="form-control" id="m-p-client-select" style="font-size: 0.75rem; padding: 4px 6px;">
                      <option value="">-- No client selected --</option>
                      ${clientOptions}
                      <option value="NEW_CLIENT">+ Register New Client</option>
                    </select>
                    
                    <div id="m-p-client-details-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <span class="client-status-badge status-active" id="m-p-client-type-badge" style="font-size: 0.65rem; padding: 2px 6px;">
                        Type: ${project.clientType || 'General'}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Register New Client inline inputs -->
                <div id="m-p-new-client-inline-group" class="d-none" style="background: rgba(255,255,255,0.01); border: 1px dashed var(--border-subtle); padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px;">
                  <div class="form-group" style="margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">New Client Name</label>
                    <input type="text" id="m-p-new-client-name" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" placeholder="Example: Sarah Connor">
                  </div>
                  <div class="form-group" style="margin: 0;">
                    <label style="font-size: 0.7rem; color: var(--text-muted);">Client Type</label>
                    <select id="m-p-new-client-type" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;">
                      <option value="General">General (Freelancer / Individual)</option>
                      <option value="Corporate">Corporate (Company / Group)</option>
                    </select>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" id="m-btn-save-client-inline" style="padding: 4px 8px; font-size: 0.7rem; justify-content: center; width: 100%;">
                    Save & Connect Client
                  </button>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label class="drawer-meta-title" style="margin: 0;">${t('labels.estimatedValue', 'Estimated Value')}</label>
                     <span id="m-p-budget-formatted" style="font-size: 0.82rem; font-weight: 700; color: var(--color-secondary); font-family: 'Plus Jakarta Sans', sans-serif;">${formatMoney(project.budget, project.projectCurrency || 'IDR')}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                     <select id="m-p-project-currency" class="form-control" style="font-size: 0.75rem; padding: 6px; font-weight: 700; width: 80px; color: var(--color-secondary);">
                       <option value="IDR" ${project.projectCurrency === 'IDR' ? 'selected' : ''}>IDR</option>
                       <option value="USD" ${project.projectCurrency === 'USD' ? 'selected' : ''}>USD</option>
                       <option value="SGD" ${project.projectCurrency === 'SGD' ? 'selected' : ''}>SGD</option>
                       <option value="AUD" ${project.projectCurrency === 'AUD' ? 'selected' : ''}>AUD</option>
                       <option value="EUR" ${project.projectCurrency === 'EUR' ? 'selected' : ''}>EUR</option>
                     </select>
                     <input type="number" class="form-control" id="m-p-budget" value="${project.budget}" style="padding: 6px 10px; font-weight: 700; color: var(--color-secondary); font-family: 'Plus Jakarta Sans', sans-serif; flex: 1;" min="0">
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                  <label class="drawer-meta-title tooltip-trigger">
                    Deadline
                    <span class="tooltip-box">Deadline for completion to track overdue status.</span>
                  </label>
                  <input type="date" class="form-control" id="m-p-due" value="${project.dueDate}" style="font-size: 0.8rem; padding: 6px 8px;">
                </div>
              </div>

              <!-- Client Memory Snapshot Card Wrapper -->
              <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
                <h4 style="margin: 0; font-size: 0.82rem; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
                  <span style="display: flex; align-items: center; gap: 6px;">🧠 Client Memory Snapshot</span>
                </h4>
                
                ${(() => {
                  if (!project.clientId) {
                    return `<span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">No client selected.</span>`;
                  }
                  
                  const clientObj = state.clients.find(c => c.id === project.clientId);
                  if (!clientObj) {
                    return `<span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">No client selected.</span>`;
                  }
                  
                  const memory = clientObj.clientMemory;
                  if (!memory || (!memory.preferredChannel && !memory.communicationStyle && !memory.revisionPattern && !memory.paymentBehavior && !memory.deliveryPreference && !memory.importantNotes)) {
                    return `
                      <div style="display: flex; flex-direction: column; gap: 8px;">
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">No client memory added yet.</span>
                        <a href="#" id="m-btn-open-memory-modal" style="font-size: 0.7rem; color: var(--color-primary); font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 4px;">
                          ${getIcon('plus', '', 12)} Add memory context
                        </a>
                      </div>
                    `;
                  }
                  
                  return `
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.72rem; color: var(--text-secondary);">
                      ${memory.preferredChannel ? `<div><strong style="color: var(--text-muted);">Channel:</strong> ${memory.preferredChannel}</div>` : ''}
                      ${memory.communicationStyle ? `<div><strong style="color: var(--text-muted);">Comm Style:</strong> ${memory.communicationStyle}</div>` : ''}
                      ${memory.revisionPattern ? `<div><strong style="color: var(--text-muted);">Revision:</strong> ${memory.revisionPattern}</div>` : ''}
                      ${memory.paymentBehavior ? `<div><strong style="color: var(--text-muted);">Payment:</strong> ${memory.paymentBehavior}</div>` : ''}
                      ${memory.deliveryPreference ? `<div><strong style="color: var(--text-muted);">Delivery:</strong> ${memory.deliveryPreference}</div>` : ''}
                      ${memory.importantNotes ? `<div style="border-top: 1px dashed rgba(255,255,255,0.04); padding-top: 6px; margin-top: 2px;"><strong style="color: var(--text-muted);">Note:</strong> ${memory.importantNotes}</div>` : ''}
                      
                      <a href="#" id="m-btn-open-memory-modal" style="font-size: 0.7rem; color: var(--color-primary); font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                        Open Full Client Memory &rarr;
                      </a>
                    </div>
                  `;
                })()}
              </div>

              <!-- Payment Tracking Card Wrapper -->
              <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                <h4 style="margin: 0; font-size: 0.82rem; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  ${getIcon('creditCard', '', 14)} Payment Tracking
                </h4>

                <div class="form-group" style="margin-bottom: 0;">
                  <label class="drawer-meta-title tooltip-trigger">
                    Payment Status
                    <span class="tooltip-box">Current payment tracking state for cash flow monitoring.</span>
                  </label>
                  <select class="form-control" id="m-p-payment-status">
                    <option value="None" ${project.paymentStatus === 'None' ? 'selected' : ''}>Not Invoiced</option>
                    <option value="DP paid" ${project.paymentStatus === 'DP paid' ? 'selected' : ''}>DP Paid</option>
                    <option value="Invoice overdue" ${project.paymentStatus === 'Invoice overdue' ? 'selected' : ''}>Overdue</option>
                    <option value="Waiting payment" ${project.paymentStatus === 'Waiting payment' ? 'selected' : ''}>Waiting Payment</option>
                    <option value="Paid" ${project.paymentStatus === 'Paid' ? 'selected' : ''}>Paid</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title tooltip-trigger">
                  Next Action
                  <span class="tooltip-box">The immediate concrete task to move the project forward.</span>
                </label>
                <input type="text" class="form-control" id="m-p-next-action" value="${project.nextAction || ''}" placeholder="What is the next task?">
              </div>

              <!-- Info Tambahan Container -->
              <div class="collapsible-section collapsed" id="section-info-tambahan" style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" id="header-info-tambahan">
                  <div>
                    <h4 class="drawer-meta-title" style="margin: 0; font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">Additional Info</h4>
                    <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px;">Internal notes, meeting link, and payment terms</span>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-info-tambahan" style="padding: 4px 8px; font-size: 0.7rem;">View Details</button>
                </div>
                <div class="collapsible-content" id="content-info-tambahan" style="margin-top: 12px; display: none; flex-direction: column; gap: 12px;">
                  
                  <!-- Meeting Hub -->
                  <div class="collapsible-section collapsed" id="section-meeting" style="border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
                    <h5 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 0.75rem; color: var(--text-secondary);">
                      <span>${getIcon('clock', '', 12)} Live Meeting Portal</span>
                      <span class="toggle-icon">${getIcon('chevronRight', '', 12)}</span>
                    </h5>
                    <div class="collapsible-content" style="margin-top: 8px;">
                      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px;">
                        <div class="form-group" style="margin-bottom: 8px;">
                          <label style="font-size: 0.68rem;">Platform</label>
                          <select class="form-control" id="m-p-meet-platform" style="font-size: 0.72rem; padding: 4px 6px;">
                            <option value="Google Meet" ${project.meetingPlatform === 'Google Meet' ? 'selected' : ''}>Google Meet</option>
                            <option value="Zoom" ${project.meetingPlatform === 'Zoom' ? 'selected' : ''}>Zoom</option>
                            <option value="Microsoft Teams" ${project.meetingPlatform === 'Microsoft Teams' ? 'selected' : ''}>Teams</option>
                            <option value="Slack Call" ${project.meetingPlatform === 'Slack Call' ? 'selected' : ''}>Slack</option>
                            <option value="WhatsApp" ${project.meetingPlatform === 'WhatsApp' ? 'selected' : ''}>WhatsApp Call</option>
                            <option value="Other" ${project.meetingPlatform === 'Other' ? 'selected' : ''}>Other</option>
                          </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 8px;">
                          <label style="font-size: 0.68rem;">Meeting Link URL</label>
                          <input type="url" id="m-p-meet-link" class="form-control" style="font-size: 0.72rem; padding: 4px 6px;" value="${project.meetingLink || ''}" placeholder="https://meet.google.com/abc-defg">
                        </div>
                      </div>
                      <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 0.68rem;">Session Notes</label>
                        <input type="text" id="m-p-meet-notes" class="form-control" style="font-size: 0.72rem; padding: 4px 6px;" value="${project.meetingNotes || ''}" placeholder="Password, notes...">
                      </div>
                    </div>
                  </div>

                  <!-- Referensi Quotation -->
                  <div class="collapsible-section collapsed" id="section-quotation-ref" style="border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
                    <h5 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 0.75rem; color: var(--text-secondary);">
                      <span>Quotation Reference</span>
                      <span class="toggle-icon">${getIcon('chevronRight', '', 12)}</span>
                    </h5>
                    <div class="collapsible-content" style="margin-top: 8px;">
                      <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-secondary);">
                          ${project.quotationId ? `Connected (QT-${project.quotationId.substring(0,3)})` : 'No reference'}
                        </span>
                        <span class="client-status-badge ${project.quotationId ? 'status-active text-success' : 'status-completed'}" style="font-size: 0.62rem; padding: 1px 6px;">
                          ${project.quotationStatus || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Termin & Metode Pembayaran -->
                  <div class="collapsible-section collapsed" id="section-payment-terms" style="border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
                    <h5 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 0.75rem; color: var(--text-secondary);">
                      <span>Payment Terms & Methods</span>
                      <span class="toggle-icon">${getIcon('chevronRight', '', 12)}</span>
                    </h5>
                    <div class="collapsible-content" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
                       <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <label style="font-size: 0.72rem; color: var(--text-secondary); margin: 0;">Down Payment / DP (%)</label>
                        <input type="number" class="form-control" id="m-p-dp-percent" value="${project.downPaymentPercent}" style="width: 70px; padding: 4px 6px; font-size: 0.72rem; text-align: center;" min="0" max="100">
                      </div>
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span style="font-size: 0.72rem; color: var(--text-secondary);">DP Amount</span>
                        <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted);" id="m-p-dp-amount-lbl">${formatCurrency(project.downPaymentAmount)}</span>
                      </div>
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <label style="font-size: 0.72rem; color: var(--text-secondary); margin: 0;">Milestone Payment Amount (Rp)</label>
                        <input type="number" class="form-control" id="m-p-mile-amount" value="${project.milestonePaymentAmount}" style="width: 100px; padding: 4px 6px; font-size: 0.72rem; text-align: right;" min="0">
                      </div>
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span style="font-size: 0.72rem; color: var(--text-secondary);">Final Payment</span>
                        <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-muted);" id="m-p-final-amount-lbl">${formatCurrency(project.finalPaymentAmount)}</span>
                      </div>
                      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span style="font-size: 0.72rem; color: var(--color-danger); font-weight: 600;">Remaining Balance</span>
                        <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-danger);" id="m-p-remaining-lbl">${formatCurrency(project.remainingBalance)}</span>
                      </div>
                      <div class="form-group" style="margin-top: 6px; margin-bottom: 0;">
                        <label style="font-size: 0.68rem;">Payment Method</label>
                        <select class="form-control" id="m-p-pay-method" style="font-size: 0.72rem; padding: 4px 6px;">
                          <option value="Bank Transfer" ${project.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                          <option value="E-Wallet" ${project.paymentMethod === 'E-Wallet' ? 'selected' : ''}>E-Wallet</option>
                          <option value="PayPal" ${project.paymentMethod === 'PayPal' ? 'selected' : ''}>PayPal</option>
                          <option value="Wise" ${project.paymentMethod === 'Wise' ? 'selected' : ''}>Wise Transfer</option>
                          <option value="Manual Payment" ${project.paymentMethod === 'Manual Payment' ? 'selected' : ''}>Manual cash/cheque</option>
                          <option value="Other" ${project.paymentMethod === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Catatan Internal -->
                  <div class="collapsible-section collapsed" id="section-internal-notes" style="border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
                    <h5 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 0.75rem; color: var(--text-secondary);">
                      <span>Internal Notes (Private)</span>
                      <span class="toggle-icon">${getIcon('chevronRight', '', 12)}</span>
                    </h5>
                    <div class="collapsible-content" style="margin-top: 8px;">
                      <div class="form-group" style="margin: 0;">
                        <textarea class="form-control" id="m-p-internal-notes" style="min-height: 60px; font-size: 0.75rem;" placeholder="Private client notes, login info, etc...">${project.internalNotes || ''}</textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Portfolio Showcase Settings -->
                  <div class="collapsible-section collapsed" id="section-portfolio-settings" style="border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: 6px;">
                    <h5 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 0.75rem; color: var(--text-secondary);">
                      <span>Portfolio Settings</span>
                      <span class="toggle-icon">${getIcon('chevronRight', '', 12)}</span>
                    </h5>
                    <div class="collapsible-content" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
                      <div class="switch-control-row" style="margin-top: 4px; padding: 4px 6px;">
                        <span class="switch-control-label" style="font-size: 0.75rem;">Show Publicly</span>
                        <label class="switch-widget">
                          <input type="checkbox" id="m-p-portfolio" ${project.portfolioShowcase ? 'checked' : ''}>
                          <span class="switch-slider"></span>
                        </label>
                      </div>
                      <div class="form-group ${project.portfolioShowcase ? '' : 'd-none'}" id="portfolio-desc-wrapper" style="margin-top: 8px; margin-bottom: 0;">
                        <label style="font-size: 0.68rem;">Case Study</label>
                        <textarea class="form-control" id="m-p-portfolio-desc" style="font-size: 0.75rem; min-height: 50px;" placeholder="Write a summary of the case study...">${project.portfolioDescription || ''}</textarea>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: auto;">
                <button class="btn btn-secondary" id="m-btn-delete" style="width: 100%; border-color: rgba(239, 68, 68, 0.2); color: var(--color-danger); justify-content: center; gap: 4px; padding: 8px;">
                  ${getIcon('trash', '', 13)} ${t('projectModal.deleteProject', 'Delete Project')}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => modalOverlay.classList.add('active'), 50);

    this.renderChecklist(project);
    this.renderDeliverables(project);
    this.renderInvoices(project);
    this.renderDeliveryChecklist(project);
    this.updateSuggestedDeliveryStatus(project);

    // Dynamic helper to safely add event listeners without crashing if elements are conditionally omitted
    const addListener = (selector, event, handler) => {
      const el = modalOverlay.querySelector(selector);
      if (el) {
        el.addEventListener(event, handler);
      }
    };

    // Collapsible header toggles
    modalOverlay.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.collapsible-section');
        if (section) {
          const isCollapsed = section.classList.toggle('collapsed');
          const toggleIcon = header.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.innerHTML = getIcon(isCollapsed ? 'chevronRight' : 'chevronDown', '', 14);
          }
        }
      });
    });

    // Close button and overlay click saves
    addListener('#close-modal', 'click', () => {
      this.saveGeneralMetadata();
      this.close();
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.saveGeneralMetadata();
        this.close();
      }
    });

    // Basic Fields change listeners
    addListener('#m-p-title', 'blur', (e) => {
      this.store.updateProject(project.id, { title: e.target.value.trim() });
      this.onStateChange();
    });

    // Client Selection & Inline Client Creation
    addListener('#m-p-client-select', 'change', (e) => {
      const inlineGroup = modalOverlay.querySelector('#m-p-new-client-inline-group');
      if (e.target.value === 'NEW_CLIENT') {
        if (inlineGroup) inlineGroup.classList.remove('d-none');
      } else {
        if (inlineGroup) inlineGroup.classList.add('d-none');
        const clientId = e.target.value;
        let clientName = '';
        let clientType = 'General';
        if (clientId) {
          const stateClients = this.store.getState().clients || [];
          const selectedClient = stateClients.find(c => c.id === clientId);
          if (selectedClient) {
            clientName = selectedClient.name + (selectedClient.businessName ? ` (${selectedClient.businessName})` : '');
            clientType = selectedClient.clientType || 'General';
          }
        }
        this.store.updateProject(project.id, { clientId, clientName, clientType });
        this.onStateChange();
        this.render();
      }
    });

    modalOverlay.addEventListener('click', (e) => {
      const openMemBtn = e.target.closest('#m-btn-open-memory-modal');
      if (openMemBtn) {
        e.preventDefault();
        if (project.clientId) {
          ClientMemoryPanel.open(project.clientId, this.store, this.onTriggerToast, () => {
            this.onStateChange();
            this.render();
          });
        }
      }
    });

    addListener('#m-btn-save-client-inline', 'click', () => {
      const newNameEl = modalOverlay.querySelector('#m-p-new-client-name');
      const newTypeEl = modalOverlay.querySelector('#m-p-new-client-type');
      const newName = newNameEl ? newNameEl.value.trim() : '';
      const newType = newTypeEl ? newTypeEl.value : 'General';
      if (!newName) {
        this.onTriggerToast('Client name cannot be empty.', 'text-warning');
        return;
      }

      const newClient = this.store.addClient({
        name: newName,
        status: 'Active',
        notes: `Type: ${newType}`
      });
      newClient.clientType = newType;
      this.store.saveState();

      this.store.updateProject(project.id, {
        clientId: newClient.id,
        clientName: newClient.name,
        clientType: newType
      });
      this.onTriggerToast('New client successfully created and linked.', 'text-success');
      this.onStateChange();
      this.render();
    });

    // Custom Category Input handling
    addListener('#m-p-category', 'change', (e) => {
      const customGroup = modalOverlay.querySelector('#m-p-custom-category-group');
      if (e.target.value === 'CUSTOM_CATEGORY') {
        if (customGroup) customGroup.classList.remove('d-none');
      } else {
        if (customGroup) customGroup.classList.add('d-none');
        this.store.updateProject(project.id, { tags: [e.target.value], customCategory: '' });
        this.onStateChange();
        this.render();
      }
    });

    addListener('#m-p-custom-category', 'blur', (e) => {
      const customVal = e.target.value.trim();
      if (customVal) {
        this.store.updateProject(project.id, { tags: [customVal], customCategory: customVal });
        this.onStateChange();
      }
    });

    addListener('#m-p-priority', 'change', (e) => {
      this.store.updateProject(project.id, { priority: e.target.value });
      this.onStateChange();
    });

    // Stage updates with locking validations (e.g. approval required for invoice_sent)
    addListener('#m-p-stage', 'change', (e) => {
      const nextStage = e.target.value;
      if (nextStage === 'invoice_sent') {
        if (project.clientApprovalStatus !== 'Approved') {
          e.target.value = project.stage; // Revert selection
          this.onTriggerToast('Invoice should be sent after client approval.', 'text-danger');
          return;
        }
      }
      if (nextStage === 'completed') {
        const lacksApproval = project.approvalStatus !== 'Approved' && project.clientApprovalStatus !== 'Approved';
        const lacksFinalFile = !project.finalFileLink && !project.finalDeliveryLink;
        const lacksPayment = !['Payment Received', 'Fully Paid', 'Paid'].includes(project.paymentStatus);

        if (lacksApproval || lacksFinalFile || lacksPayment) {
          e.target.value = project.stage; // Revert selection
          showCompletionWarningModal({
            onConfirm: () => {
              const updates = { stage: 'completed' };
              this.store.updateProject(project.id, updates);
              this.onTriggerToast('Project moved to Completed.');
              this.onStateChange();
              this.render();
            },
            onReview: () => {
              this.onTriggerToast('Reviewing project details.');
            }
          });
          return;
        }
      }
      const updates = { stage: nextStage };
      if (nextStage === 'completed') {
        updates.paymentStatus = 'Paid';
      }
      this.store.updateProject(project.id, updates);
      this.onTriggerToast(`Updated stage to: ${nextStage}`);
      this.onStateChange();
      this.render();
    });

    addListener('#m-p-payment-status', 'change', (e) => {
      this.store.updateProject(project.id, { paymentStatus: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-next-action', 'blur', (e) => {
      this.store.updateProject(project.id, { nextAction: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-internal-notes', 'blur', (e) => {
      this.store.updateProject(project.id, { internalNotes: e.target.value.trim() });
    });

    addListener('#m-p-rev-notes', 'blur', (e) => {
      this.store.updateProject(project.id, { revisionNotes: e.target.value.trim() });
    });

    addListener('#m-p-brief-url', 'blur', (e) => {
      this.store.updateProject(project.id, { briefLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-raw-url', 'blur', (e) => {
      this.store.updateProject(project.id, { rawFileLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-draft-url', 'blur', (e) => {
      this.store.updateProject(project.id, { draftFileLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-final-url', 'blur', (e) => {
      this.store.updateProject(project.id, { finalDeliveryLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-ref-url', 'blur', (e) => {
      this.store.updateProject(project.id, { referenceFolderLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-meet-platform', 'change', (e) => {
      this.store.updateProject(project.id, { meetingPlatform: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-meet-link', 'blur', (e) => {
      this.store.updateProject(project.id, { meetingLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-meet-notes', 'blur', (e) => {
      this.store.updateProject(project.id, { meetingNotes: e.target.value.trim() });
    });

    const recalculateTerms = () => {
      const budget = Number(modalOverlay.querySelector('#m-p-budget').value) || 0;
      const dpPct = Number(modalOverlay.querySelector('#m-p-dp-percent').value) || 0;
      const mileAmt = Number(modalOverlay.querySelector('#m-p-mile-amount').value) || 0;
      const projCurrEl = modalOverlay.querySelector('#m-p-project-currency');
      const projCurr = projCurrEl ? projCurrEl.value : (project.projectCurrency || 'IDR');

      const dpAmt = Math.round(budget * (dpPct / 100));
      const finalAmt = budget - dpAmt - mileAmt;
      const remainingVal = budget - dpAmt;

      const formattedBudget = modalOverlay.querySelector('#m-p-budget-formatted');
      if (formattedBudget) {
        formattedBudget.textContent = formatMoney(budget, projCurr);
      }

      modalOverlay.querySelector('#m-p-dp-amount-lbl').textContent = formatMoney(dpAmt, projCurr);
      modalOverlay.querySelector('#m-p-final-amount-lbl').textContent = formatMoney(finalAmt, projCurr);
      modalOverlay.querySelector('#m-p-remaining-lbl').textContent = formatMoney(remainingVal, projCurr);

      this.store.updateProject(project.id, {
        budget: budget,
        downPaymentPercent: dpPct,
        downPaymentAmount: dpAmt,
        milestonePaymentAmount: mileAmt,
        finalPaymentAmount: finalAmt,
        remainingBalance: remainingVal
      });
      this.onStateChange();
    };

    addListener('#m-p-budget', 'change', recalculateTerms);
    addListener('#m-p-dp-percent', 'change', recalculateTerms);
    addListener('#m-p-mile-amount', 'change', recalculateTerms);

    addListener('#m-p-pay-method', 'change', (e) => {
      this.store.updateProject(project.id, { paymentMethod: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-due', 'change', (e) => {
      this.store.updateProject(project.id, { dueDate: e.target.value });
      this.onStateChange();
    });

    // Client view preview button navigation listener (guarded)
    addListener('#btn-modal-preview-client', 'click', () => {
      this.saveGeneralMetadata();
      this.close();
      window.app.switchView('client-view', project.id);
    });

    // Revision details inc/dec controls
    addListener('#m-p-rev-dec', 'click', () => {
      if (project.revisionCount > 0) {
        const val = project.revisionCount - 1;
        this.store.updateProject(project.id, { revisionCount: val, revisionRound: val });
        this.onStateChange();
        this.render();
      }
    });

    addListener('#m-p-rev-inc', 'click', () => {
      const maxVal = project.maxRevision;
      const hasLimit = maxVal !== 'TBD' && maxVal !== '';
      if (!hasLimit || project.revisionCount < Number(maxVal)) {
        const val = project.revisionCount + 1;
        this.store.updateProject(project.id, { revisionCount: val, revisionRound: val });
        this.onStateChange();
        this.render();
      } else {
        this.onTriggerToast('Revision limit has been reached.', 'text-warning');
      }
    });

    // Revision CTA
    addListener('#btn-work-revision', 'click', () => {
      this.store.updateProject(project.id, { stage: 'in_progress' });
      this.onTriggerToast('Project returned to In Progress for revision work.', 'text-success');
      this.onStateChange();
      this.render();
    });

    // Client Approval Status dropdown
    addListener('#m-p-approval-status-select', 'change', (e) => {
      const nextApproval = e.target.value;
      const updates = { clientApprovalStatus: nextApproval, approvalStatus: nextApproval };
      if (nextApproval === 'Needs Revision') {
        updates.stage = 'revision';
      } else if (nextApproval === 'Approved') {
        updates.approvedAt = new Date().toISOString().split('T')[0];
      }
      this.store.updateProject(project.id, updates);
      this.onTriggerToast(`Approval status updated to: ${nextApproval}`);
      this.onStateChange();
      this.render();
    });

    // Invoices and Billing Action buttons
    addListener('#m-btn-send-invoice', 'click', () => {
      const invoiceNumber = modalOverlay.querySelector('#m-p-invoice-num').value.trim();
      const invoiceAmount = Number(modalOverlay.querySelector('#m-p-invoice-amount').value) || 0;
      const invoiceDate = modalOverlay.querySelector('#m-p-invoice-date').value;
      const invoiceDueDate = modalOverlay.querySelector('#m-p-invoice-due').value;
      const invoiceFileLink = modalOverlay.querySelector('#m-p-invoice-url').value.trim();
      const paymentTerms = modalOverlay.querySelector('#m-p-payment-terms').value.trim();

      if (!invoiceNumber) {
        this.onTriggerToast('Invoice number cannot be empty.', 'text-warning');
        return;
      }

      this.store.addInvoice({
        projectId: project.id,
        amount: invoiceAmount || project.budget,
        invoiceNumber: invoiceNumber,
        dueDate: invoiceDueDate || project.dueDate,
        status: 'Sent'
      });

      this.store.updateProject(project.id, {
        invoiceNumber,
        invoiceAmount,
        invoiceDate,
        invoiceDueDate,
        invoiceFileLink,
        paymentTerms,
        stage: 'waiting_payment',
        paymentStatus: 'Waiting payment'
      });

      this.onTriggerToast('Invoice sent. Project moved to Waiting Payment.', 'text-success');
      this.onStateChange();
      this.render();
    });

    // Reopen Project CTA (Completed stage)
    addListener('#m-btn-reopen-project', 'click', () => {
      if (confirm('Are you sure you want to reopen this project?')) {
        this.store.updateProject(project.id, { stage: 'in_progress', paymentStatus: 'DP paid' });
        this.onTriggerToast('Project reopened.', 'text-success');
        this.onStateChange();
        this.render();
      }
    });

    // Save Raw File Download link (Completed stage)
    addListener('#m-btn-save-raw-download', 'click', () => {
      const rawLinkVal = modalOverlay.querySelector('#m-p-raw-download-link').value.trim();
      this.store.updateProject(project.id, { rawFileDownloadLink: rawLinkVal });
      this.onTriggerToast('Raw file delivery link saved!', 'text-success');
      this.onStateChange();
    });

    // Invoice & Payment section field listeners
    
    // Live calculation and suggestions
    const checkCurrencyMismatch = () => {
      const projCurr = modalOverlay.querySelector('#m-p-project-currency')?.value || project.projectCurrency || 'IDR';
      const invCurr = modalOverlay.querySelector('#m-p-invoice-currency')?.value || project.invoiceCurrency || 'IDR';
      const mismatchHelper = modalOverlay.querySelector('#m-p-currency-mismatch-helper');
      if (mismatchHelper) {
        if (projCurr !== invCurr) {
          mismatchHelper.textContent = t('currencyMismatchWarning', 'Invoice currency differs from project currency.');
          mismatchHelper.style.display = 'block';
        } else {
          mismatchHelper.style.display = 'none';
        }
      }
    };

    const checkPaymentCurrencyMismatch = () => {
      const invCurr = modalOverlay.querySelector('#m-p-invoice-currency')?.value || project.invoiceCurrency || 'IDR';
      const payCurr = modalOverlay.querySelector('#m-p-payment-currency')?.value || project.paymentCurrency || 'IDR';
      const mismatchHelper = modalOverlay.querySelector('#m-p-payment-currency-mismatch-helper');
      if (mismatchHelper) {
        if (invCurr !== payCurr) {
          mismatchHelper.textContent = t('paymentCurrencyMismatchWarning', 'Payment currency differs from invoice currency. Amount due calculation is paused.');
          mismatchHelper.style.display = 'block';
        } else {
          mismatchHelper.style.display = 'none';
        }
      }
    };

    const updateDueFieldAndSuggestions = () => {
      const amtEl = modalOverlay.querySelector('#m-p-invoice-amount');
      const paidEl = modalOverlay.querySelector('#m-p-amount-paid');
      const dueEl = modalOverlay.querySelector('#m-p-amount-due');
      if (amtEl && paidEl && dueEl) {
        const amt = Number(amtEl.value) || 0;
        const paid = Number(paidEl.value) || 0;
        
        const invCurr = modalOverlay.querySelector('#m-p-invoice-currency')?.value || project.invoiceCurrency || 'IDR';
        const payCurr = modalOverlay.querySelector('#m-p-payment-currency')?.value || project.paymentCurrency || 'IDR';
        
        if (invCurr === payCurr) {
          const due = Math.max(0, amt - paid);
          dueEl.value = due;
        }
      }
      renderSuggestions();
    };

    const renderSuggestions = () => {
      const paymentSuggestionEl = modalOverlay.querySelector('#m-p-payment-suggestion');
      const overdueSuggestionEl = modalOverlay.querySelector('#m-p-overdue-suggestion');
      if (!paymentSuggestionEl || !overdueSuggestionEl) return;
      
      paymentSuggestionEl.innerHTML = '';
      overdueSuggestionEl.innerHTML = '';
      
      const amtEl = modalOverlay.querySelector('#m-p-invoice-amount');
      const paidEl = modalOverlay.querySelector('#m-p-amount-paid');
      const dueEl = modalOverlay.querySelector('#m-p-invoice-due');
      const paySelect = modalOverlay.querySelector('#m-p-payment-status-select');
      
      const amt = amtEl ? (Number(amtEl.value) || 0) : 0;
      const paid = paidEl ? (Number(paidEl.value) || 0) : 0;
      const dueDateStr = dueEl ? dueEl.value : '';
      const payStatus = paySelect ? paySelect.value : '';
      
      // Fully Paid suggestion
      if (paid >= amt && amt > 0 && payStatus !== 'Fully Paid' && payStatus !== 'Payment Received') {
        paymentSuggestionEl.innerHTML = `
          <button type="button" class="btn btn-secondary" style="font-size: 0.7rem; padding: 2px 6px; background: rgba(16, 185, 129, 0.15); color: var(--color-success); border-color: rgba(16, 185, 129, 0.3); margin-top: 4px;" id="btn-suggest-paid">
            Suggested: Fully Paid
          </button>
        `;
        paymentSuggestionEl.querySelector('#btn-suggest-paid').addEventListener('click', () => {
          if (paySelect) {
            paySelect.value = 'Fully Paid';
            paySelect.dispatchEvent(new Event('change'));
          }
        });
      }
      
      // Overdue suggestion
      if (dueDateStr && payStatus !== 'Fully Paid' && payStatus !== 'Payment Received') {
        const dueDate = new Date(dueDateStr);
        dueDate.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (dueDate < today) {
          overdueSuggestionEl.innerHTML = `
            <button type="button" class="btn btn-secondary" style="font-size: 0.7rem; padding: 2px 6px; background: rgba(245, 158, 11, 0.15); color: var(--color-warning); border-color: rgba(245, 158, 11, 0.3); margin-top: 4px;" id="btn-suggest-overdue">
              Suggested: Overdue
            </button>
          `;
          overdueSuggestionEl.querySelector('#btn-suggest-overdue').addEventListener('click', () => {
            const statusEl = modalOverlay.querySelector('#m-p-invoice-status');
            if (statusEl) {
              statusEl.value = 'Overdue';
              statusEl.dispatchEvent(new Event('change'));
            }
          });
        }
      }
    };

    // Run suggestions render initially
    renderSuggestions();
    checkCurrencyMismatch();
    checkPaymentCurrencyMismatch();

    addListener('#m-p-invoice-amount', 'input', updateDueFieldAndSuggestions);
    addListener('#m-p-amount-paid', 'input', updateDueFieldAndSuggestions);
    addListener('#m-p-invoice-due', 'change', updateDueFieldAndSuggestions);

    addListener('#m-p-invoice-status', 'change', (e) => {
      const newVal = e.target.value;
      const oldVal = project.invoiceStatus || 'Not Created';
      this.store.updateProject(project.id, { invoiceStatus: newVal });
      this.onStateChange();
      
      if (newVal === 'Sent' && oldVal !== 'Sent' && project.stage !== 'invoice_sent') {
        showGenericConfirmationModal({
          title: "Move this project to Invoice Sent?",
          message: "Would you like to move this project to the Invoice Sent stage of the workspace board?",
          confirmText: "Move Stage",
          cancelText: "Keep Current Stage",
          onConfirm: () => {
            this.store.updateProject(project.id, { stage: 'invoice_sent' });
            this.onTriggerToast("Project moved to Invoice Sent stage.", "text-success");
            this.onStateChange();
            this.render();
          }
        });
      }
    });

    const handlePaymentStatusChange = (newVal, oldVal, selectEl) => {
      const applyPaymentChange = () => {
        this.store.updateProject(project.id, { paymentStatus: newVal });
        this.onStateChange();
        
        if (newVal === 'Waiting Payment' && oldVal !== 'Waiting Payment' && project.stage !== 'waiting_payment') {
          showGenericConfirmationModal({
            title: "Move this project to Waiting Payment?",
            message: "Would you like to move this project to the Waiting Payment stage of the workspace board?",
            confirmText: "Move Stage",
            cancelText: "Keep Current Stage",
            onConfirm: () => {
              this.store.updateProject(project.id, { stage: 'waiting_payment' });
              this.onTriggerToast("Project moved to Waiting Payment stage.", "text-success");
              this.onStateChange();
              this.render();
            }
          });
        }
      };

      if ((newVal === 'Fully Paid' || newVal === 'Payment Received') && oldVal !== 'Fully Paid' && oldVal !== 'Payment Received') {
        showGenericConfirmationModal({
          title: "Mark payment as received?",
          message: "Are you sure you want to mark this project's payment as received?",
          confirmText: "Confirm Paid",
          cancelText: "Cancel",
          onConfirm: () => {
            applyPaymentChange();
          },
          onCancel: () => {
            if (selectEl) selectEl.value = oldVal;
          }
        });
      } else {
        applyPaymentChange();
      }
    };

    addListener('#m-p-payment-status-select', 'change', (e) => {
      handlePaymentStatusChange(e.target.value, project.paymentStatus || 'Not Started', e.target);
    });

    addListener('#m-p-payment-status-select-sidebar', 'change', (e) => {
      handlePaymentStatusChange(e.target.value, project.paymentStatus || 'Not Started', e.target);
    });

    addListener('#m-p-invoice-num', 'blur', (e) => {
      this.store.updateProject(project.id, { invoiceNumber: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-invoice-amount', 'blur', (e) => {
      const val = Number(e.target.value) || 0;
      const invCurr = modalOverlay.querySelector('#m-p-invoice-currency')?.value || project.invoiceCurrency || 'IDR';
      const payCurr = modalOverlay.querySelector('#m-p-payment-currency')?.value || project.paymentCurrency || 'IDR';
      let due = project.amountDue;
      if (invCurr === payCurr) {
        due = Math.max(0, val - (Number(project.amountPaid) || 0));
      }
      this.store.updateProject(project.id, { invoiceAmount: val, amountDue: due });
      this.onStateChange();
    });

    addListener('#m-p-invoice-date', 'change', (e) => {
      this.store.updateProject(project.id, { invoiceDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-invoice-due', 'change', (e) => {
      this.store.updateProject(project.id, { invoiceDueDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-payment-terms', 'blur', (e) => {
      this.store.updateProject(project.id, { paymentTerms: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-pay-method', 'blur', (e) => {
      this.store.updateProject(project.id, { paymentMethod: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-amount-paid', 'blur', (e) => {
      const val = Number(e.target.value) || 0;
      const invCurr = modalOverlay.querySelector('#m-p-invoice-currency')?.value || project.invoiceCurrency || 'IDR';
      const payCurr = modalOverlay.querySelector('#m-p-payment-currency')?.value || project.paymentCurrency || 'IDR';
      let due = project.amountDue;
      if (invCurr === payCurr) {
        due = Math.max(0, (Number(project.invoiceAmount) || 0) - val);
      }
      this.store.updateProject(project.id, { amountPaid: val, amountDue: due });
      this.onStateChange();
    });

    addListener('#m-p-project-currency', 'change', (e) => {
      const val = e.target.value;
      this.store.updateProject(project.id, { projectCurrency: val });
      this.onStateChange();
      checkCurrencyMismatch();
      recalculateTerms();
    });

    addListener('#m-p-invoice-currency', 'change', (e) => {
      const val = e.target.value;
      const payCurrEl = modalOverlay.querySelector('#m-p-payment-currency');
      const updates = { invoiceCurrency: val };
      
      if (payCurrEl) {
        payCurrEl.value = val;
        updates.paymentCurrency = val;
      }
      
      const dueCurrEl = modalOverlay.querySelector('#m-p-amount-due-currency');
      if (dueCurrEl) {
        dueCurrEl.textContent = val;
      }
      
      const amtEl = modalOverlay.querySelector('#m-p-invoice-amount');
      const paidEl = modalOverlay.querySelector('#m-p-amount-paid');
      const dueEl = modalOverlay.querySelector('#m-p-amount-due');
      if (amtEl && paidEl && dueEl) {
        const amt = Number(amtEl.value) || 0;
        const paid = Number(paidEl.value) || 0;
        const due = Math.max(0, amt - paid);
        dueEl.value = due;
        updates.amountDue = due;
      }
      
      this.store.updateProject(project.id, updates);
      this.onStateChange();
      checkCurrencyMismatch();
      checkPaymentCurrencyMismatch();
    });

    addListener('#m-p-payment-currency', 'change', (e) => {
      const val = e.target.value;
      const updates = { paymentCurrency: val };
      
      const dueCurrEl = modalOverlay.querySelector('#m-p-amount-due-currency');
      if (dueCurrEl) {
        dueCurrEl.textContent = val;
      }
      
      const invCurrEl = modalOverlay.querySelector('#m-p-invoice-currency');
      const invCurr = invCurrEl ? invCurrEl.value : (project.invoiceCurrency || 'IDR');
      
      if (invCurr === val) {
        const amtEl = modalOverlay.querySelector('#m-p-invoice-amount');
        const paidEl = modalOverlay.querySelector('#m-p-amount-paid');
        const dueEl = modalOverlay.querySelector('#m-p-amount-due');
        if (amtEl && paidEl && dueEl) {
          const amt = Number(amtEl.value) || 0;
          const paid = Number(paidEl.value) || 0;
          const due = Math.max(0, amt - paid);
          dueEl.value = due;
          updates.amountDue = due;
        }
      }
      
      this.store.updateProject(project.id, updates);
      this.onStateChange();
      checkPaymentCurrencyMismatch();
    });

    addListener('#m-p-last-followup', 'change', (e) => {
      this.store.updateProject(project.id, { lastFollowUpDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-next-followup', 'change', (e) => {
      this.store.updateProject(project.id, { nextFollowUpDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-last-followup-sidebar', 'change', (e) => {
      this.store.updateProject(project.id, { lastFollowUpDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-next-followup-sidebar', 'change', (e) => {
      this.store.updateProject(project.id, { nextFollowUpDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-payment-due-sidebar', 'change', (e) => {
      this.store.updateProject(project.id, { paymentDueDate: e.target.value });
      this.onStateChange();
    });

    addListener('#m-p-payment-receipt', 'blur', (e) => {
      const val = e.target.value.trim();
      this.store.updateProject(project.id, { receiptLink: val, paymentReceiptLink: val });
      this.onStateChange();
    });

    addListener('#m-p-payment-receipt-sidebar', 'blur', (e) => {
      const val = e.target.value.trim();
      this.store.updateProject(project.id, { receiptLink: val, paymentReceiptLink: val });
      this.onStateChange();
    });

    addListener('#m-p-invoice-url', 'blur', (e) => {
      this.store.updateProject(project.id, { invoiceFileLink: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-payment-notes', 'blur', (e) => {
      this.store.updateProject(project.id, { paymentNotes: e.target.value.trim() });
      this.onStateChange();
    });

    addListener('#m-p-reminder-note-sidebar', 'blur', (e) => {
      this.store.updateProject(project.id, { reminderNote: e.target.value.trim() });
      this.onStateChange();
    });

    // Copy follow-up message logic
    addListener('#m-btn-copy-followup', 'click', () => {
      const invStatus = project.invoiceStatus || 'Not Created';
      const payStatus = project.paymentStatus || 'Not Started';
      const invNum = project.invoiceNumber || 'N/A';
      const invAmt = project.invoiceAmount ? 'Rp ' + project.invoiceAmount.toLocaleString('id-ID') : '0';
      const amtPaid = project.amountPaid ? 'Rp ' + project.amountPaid.toLocaleString('id-ID') : '0';
      const amtDue = project.amountDue ? 'Rp ' + project.amountDue.toLocaleString('id-ID') : '0';
      const dueDate = project.invoiceDueDate || 'N/A';
      const payMethod = project.paymentMethod || 'Bank Transfer';

      let msg = '';
      if (payStatus === 'Fully Paid' || payStatus === 'Payment Received') {
        msg = `Hi ${project.clientName || 'Client'},\n\nWe have received your payment of ${invAmt} for invoice ${invNum}. Thank you so much for the prompt settlement! It has been a pleasure working with you on this project. Let me know if you need anything else.\n\nBest regards,\n[Your Name]`;
      } else if (invStatus === 'Overdue' || (dueDate !== 'N/A' && new Date(dueDate) < new Date())) {
        msg = `Hi ${project.clientName || 'Client'},\n\nI hope you're doing well. This is a gentle reminder that invoice ${invNum} of ${invAmt} was due on ${dueDate} and is now overdue. The outstanding balance is ${amtDue}.\n\nPlease settle the payment via ${payMethod} at your earliest convenience. If you have already sent the payment, please share the receipt so I can verify.\n\nThank you,\n[Your Name]`;
      } else if (payStatus === 'Waiting Payment') {
        msg = `Hi ${project.clientName || 'Client'},\n\nI hope you're having a great day. Just a quick reminder that invoice ${invNum} of ${invAmt} is currently awaiting payment. It is scheduled to be due on ${dueDate}.\n\nYou can complete the payment via ${payMethod}. Once done, please share the transfer receipt for verification.\n\nThanks so much,\n[Your Name]`;
      } else { // Invoice Sent / Default
        msg = `Hi ${project.clientName || 'Client'},\n\nI have successfully sent invoice ${invNum} for our project. The total amount is ${invAmt}, due by ${dueDate}.\n\nPlease review the invoice details and complete the transfer via ${payMethod}. Let me know if you have any questions.\n\nBest regards,\n[Your Name]`;
      }

      navigator.clipboard.writeText(msg)
        .then(() => {
          this.onTriggerToast("Invoice follow-up copied.", "text-success");
        })
        .catch(err => {
          console.error("Clipboard copy failed, using fallback:", err);
          const tempTextarea = document.createElement('textarea');
          tempTextarea.value = msg;
          document.body.appendChild(tempTextarea);
          tempTextarea.select();
          try {
            document.execCommand('copy');
            this.onTriggerToast("Invoice follow-up copied.", "text-success");
          } catch (e) {
            this.onTriggerToast("Failed to copy message.", "text-danger");
          }
          document.body.removeChild(tempTextarea);
        });
    });

    // On Hold fields blur/change listeners
    addListener('#m-p-hold-reason', 'blur', (e) => {
      this.store.updateProject(project.id, { holdReason: e.target.value.trim() });
    });

    // Client-facing setting field listeners
    addListener('#m-p-preview-link-val', 'blur', (e) => {
      this.store.updateProject(project.id, { previewLink: normalizeLink(e.target.value) });
      this.updateSuggestedDeliveryStatus(project);
    });
    addListener('#m-p-client-feedback-summary', 'blur', (e) => {
      this.store.updateProject(project.id, { clientFeedbackSummary: e.target.value.trim() });
    });
    addListener('#m-p-client-visible-notes', 'blur', (e) => {
      this.store.updateProject(project.id, { clientVisibleNotes: e.target.value.trim() });
    });
    addListener('#m-p-final-file-link-val', 'blur', (e) => {
      this.store.updateProject(project.id, { finalFileLink: normalizeLink(e.target.value) });
      this.updateSuggestedDeliveryStatus(project);
    });
    addListener('#m-p-raw-file-link-val', 'blur', (e) => {
      this.store.updateProject(project.id, { rawFileLink: normalizeLink(e.target.value) });
      this.updateSuggestedDeliveryStatus(project);
    });
    addListener('#m-p-handover-notes-val', 'blur', (e) => {
      this.store.updateProject(project.id, { handoverNotes: e.target.value.trim() });
      this.updateSuggestedDeliveryStatus(project);
    });
    addListener('#m-p-approval-status-select-val', 'change', (e) => {
      const nextApproval = e.target.value;
      const updates = { approvalStatus: nextApproval, clientApprovalStatus: nextApproval };
      if (nextApproval === 'Needs Revision') {
        updates.stage = 'revision';
      } else if (nextApproval === 'Approved') {
        updates.approvedAt = new Date().toISOString().split('T')[0];
      }
      this.store.updateProject(project.id, updates);
      this.onTriggerToast(`Client approval status updated to: ${nextApproval}`);
      this.onStateChange();
      this.render();
    });

    // Delivery Center new listeners
    addListener('#m-p-delivery-status-select-val', 'change', (e) => {
      this.store.updateProject(project.id, { deliveryStatus: e.target.value });
      this.onStateChange();
    });
    addListener('#m-p-delivery-date-val', 'change', (e) => {
      this.store.updateProject(project.id, { deliveryDate: e.target.value });
      this.onStateChange();
    });
    addListener('#m-p-draft-link-val', 'blur', (e) => {
      this.store.updateProject(project.id, { draftLink: normalizeLink(e.target.value) });
    });
    addListener('#m-p-review-link-val', 'blur', (e) => {
      this.store.updateProject(project.id, { reviewLink: normalizeLink(e.target.value) });
    });
    addListener('#m-p-file-folder-link-val', 'blur', (e) => {
      this.store.updateProject(project.id, { fileFolderLink: normalizeLink(e.target.value) });
    });
    addListener('#m-p-client-confirmed-delivery', 'change', (e) => {
      this.store.updateProject(project.id, { clientConfirmedDelivery: e.target.checked });
      this.onStateChange();
      this.updateSuggestedDeliveryStatus(project);
    });
    addListener('#m-btn-delivery-chk-add', 'click', () => {
      const inputEl = modalOverlay.querySelector('#m-p-delivery-chk-new-label');
      const label = inputEl ? inputEl.value.trim() : '';
      if (!label) return;
      const newItem = {
        id: 'del_' + Math.random().toString(36).substring(2, 9),
        label,
        completed: false,
        clientVisible: true
      };
      const deliveryChecklist = [...(project.deliveryChecklist || []), newItem];
      this.store.updateProject(project.id, { deliveryChecklist });
      this.onStateChange();
      this.renderDeliveryChecklist(project);
      this.updateSuggestedDeliveryStatus(project);
      if (inputEl) inputEl.value = '';
    });
    addListener('#btn-copy-delivery-msg', 'click', () => {
      const text = getDeliveryMessageText(project);
      navigator.clipboard.writeText(text).then(() => {
        this.onTriggerToast('Delivery message copied.');
      }).catch(err => {
        console.error('Failed to copy delivery message: ', err);
        this.onTriggerToast('Failed to copy to clipboard', 'text-danger');
      });
    });
    addListener('#m-p-hold-date', 'change', (e) => {
      this.store.updateProject(project.id, { holdDate: e.target.value });
    });
    addListener('#m-p-hold-followup', 'change', (e) => {
      this.store.updateProject(project.id, { holdFollowUpDate: e.target.value });
    });

    addListener('#m-btn-resume-hold', 'click', () => {
      this.store.updateProject(project.id, { stage: 'in_progress' });
      this.onTriggerToast('Project resumed (In Progress).', 'text-success');
      this.onStateChange();
      this.render();
    });
    addListener('#m-btn-waiting-client-hold', 'click', () => {
      this.store.updateProject(project.id, { stage: 'client_review' });
      this.onTriggerToast('Project moved to Client Review.', 'text-success');
      this.onStateChange();
      this.render();
    });

    // Info Tambahan toggles
    const toggleInfoTambahan = () => {
      const wrapper = modalOverlay.querySelector('#section-info-tambahan');
      const content = modalOverlay.querySelector('#content-info-tambahan');
      const btn = modalOverlay.querySelector('#btn-toggle-info-tambahan');
      if (wrapper && content && btn) {
        const isCollapsed = wrapper.classList.toggle('collapsed');
        if (isCollapsed) {
          content.style.display = 'none';
          btn.textContent = 'View Details';
        } else {
          content.style.display = 'flex';
          btn.textContent = 'Hide Details';
        }
      }
    };
    addListener('#header-info-tambahan', 'click', toggleInfoTambahan);
    addListener('#btn-toggle-info-tambahan', 'click', (e) => {
      e.stopPropagation();
      toggleInfoTambahan();
    });

    // Portfolio display toggle overrides
    const portToggle = modalOverlay.querySelector('#m-p-portfolio');
    const portDescWrapper = modalOverlay.querySelector('#portfolio-desc-wrapper');
    if (portToggle) {
      portToggle.addEventListener('change', (e) => {
        const active = e.target.checked;
        this.store.updateProject(project.id, { portfolioShowcase: active });
        if (active) {
          if (portDescWrapper) portDescWrapper.classList.remove('d-none');
        } else {
          if (portDescWrapper) portDescWrapper.classList.add('d-none');
        }
        this.onStateChange();
      });
    }

    addListener('#m-p-portfolio-desc', 'blur', (e) => {
      this.store.updateProject(project.id, { portfolioDescription: e.target.value.trim() });
    });

    // Checklist & deliverables forms submission
    const checklistForm = modalOverlay.querySelector('#modal-checklist-form');
    if (checklistForm) {
      checklistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = checklistForm.querySelector('input');
        const text = input.value.trim();
        if (text) {
          const newItem = { id: Math.random().toString(36).substring(2, 9), text, completed: false };
          const checklist = [...(project.checklist || []), newItem];
          this.store.updateProject(project.id, { checklist });
          input.value = '';
          this.renderChecklist(project);
          this.onStateChange();
        }
      });
    }

    const deliverableForm = modalOverlay.querySelector('#modal-deliverable-form');
    if (deliverableForm) {
      deliverableForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dTitle = deliverableForm.querySelector('#d-title').value.trim();
        const dUrl = deliverableForm.querySelector('#d-url').value.trim();

        const newDeliv = {
          id: Math.random().toString(36).substring(2, 9),
          title: dTitle,
          linkUrl: dUrl,
          version: 1,
          status: 'Draft'
        };

        const deliverables = [...(project.deliverables || []), newDeliv];
        this.store.updateProject(project.id, { deliverables });

        deliverableForm.reset();
        this.renderDeliverables(project);
        this.onTriggerToast('Deliverable file linked');
        this.onStateChange();
      });
    }

    addListener('#m-btn-invoice-add', 'click', () => {
      const rnd = Math.floor(100 + Math.random() * 900);
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 15); // Net 15
      const dateStr = defaultDate.toISOString().split('T')[0];

      this.store.addInvoice({
        projectId: project.id,
        amount: project.budget,
        invoiceNumber: `INV-2026-${rnd}`,
        dueDate: dateStr,
        status: 'Draft'
      });

      this.renderInvoices(project);
      this.onTriggerToast('Generated draft invoice');
      this.onStateChange();
    });

    addListener('#m-btn-delete', 'click', () => {
      if (confirm(`Remove "${project.title}"?`)) {
        this.store.deleteProject(project.id);
        this.onTriggerToast('Project successfully removed');
        this.onStateChange();
        this.close();
      }
    });

    // Locked stages/completed stage input elements blocking
    const isCompleted = project.stage === 'completed';
    const isLocked = ['in_progress', 'client_review', 'revision', 'invoice_sent', 'waiting_payment', 'completed'].includes(project.stage);

    if (isCompleted) {
      const inputs = modalOverlay.querySelectorAll('input, select, textarea, button');
      inputs.forEach(input => {
        const id = input.id;
        if (id !== 'm-btn-reopen-project' && id !== 'm-p-raw-download-link' && id !== 'm-btn-save-raw-download' && id !== 'close-modal') {
          input.disabled = true;
          if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
            input.style.cursor = 'not-allowed';
            input.style.opacity = '0.7';
          }
        }
      });
    } else if (isLocked) {
      const lockedSelectors = [
        '#m-p-title', '#m-p-client-select', '#m-p-category', '#m-p-custom-category',
        '#m-p-priority', '#m-p-budget', '#m-p-due', '#m-p-dp-percent', '#m-p-mile-amount',
        '#m-p-pay-method', '#m-btn-save-client-inline', '#m-p-new-client-name', '#m-p-new-client-type'
      ];
      lockedSelectors.forEach(sel => {
        const el = modalOverlay.querySelector(sel);
        if (el) {
          el.disabled = true;
          el.style.cursor = 'not-allowed';
          el.style.opacity = '0.7';
        }
      });
    }

    // Meeting Notes inputs blur/change listeners
    const fieldsToBind = [
      '#m-p-meet-date', '#m-p-meet-time', '#m-p-meet-type', '#m-p-meet-link-val',
      '#m-p-meet-timezone', '#m-p-client-request', '#m-p-key-discussion',
      '#m-p-decision-made', '#m-p-action-items', '#m-p-client-concern',
      '#m-p-client-expectation', '#m-p-client-review-date', '#m-p-final-delivery-date'
    ];

    fieldsToBind.forEach(sel => {
      addListener(sel, 'blur', () => {
        this.saveGeneralMetadata();
        this.checkMeetingAvailabilityWarning(project.id);
      });
      addListener(sel, 'change', () => {
        this.saveGeneralMetadata();
        this.checkMeetingAvailabilityWarning(project.id);
      });
    });

    // AI summary prompt generator copy listener
    addListener('#btn-generate-ai-prompt', 'click', () => {
      const p = this.store.getState().projects.find(x => x.id === project.id) || project;
      const templateText = promptTemplates.meetingSummary.generate(p);
      copyPromptToClipboard(templateText, this.onTriggerToast);
    });

    addListener('#btn-extract-client-memory', 'click', () => {
      const p = this.store.getState().projects.find(x => x.id === project.id) || project;
      const extractPrompt = `Please analyze the following meeting notes and client context, then extract structured client memory parameters:

Meeting Notes:
- Platform/Type: ${p.meetingType || 'Not specified'}
- Link: ${p.meetingLink || 'None'}
- Date: ${p.meetingDate || 'N/A'}
- Time: ${p.meetingTime || 'N/A'}
- Session Notes: ${p.meetingNotes || 'None'}

Client Context:
- Client Request: ${p.clientRequest || 'None'}
- Key Discussion Points: ${p.keyDiscussionPoints || 'None'}
- Decisions Made: ${p.decisionMade || 'None'}
- Client Concern: ${p.clientConcern || 'None'}
- Client Expectation: ${p.clientExpectation || 'None'}

Please extract and format as a clean bulleted list containing:
1. Communication preference (preferred channels, style, frequency)
2. Decision maker (primary stakeholder / approver)
3. Concerns (specific issues, anxieties, or pain points raised)
4. Expectations (standards, deliverables quality, target goals)
5. Revision style (how they give feedback, edit rounds preferences)
6. Delivery preference (file preferences, folder/sharing structure)
7. Payment/follow-up clues (billing preferences, reminder styles, timelines)
8. Important notes (general relationship remarks)
9. Recommended next action`;

      navigator.clipboard.writeText(extractPrompt)
        .then(() => {
          this.onTriggerToast('Client memory prompt copied.', 'text-success');
        })
        .catch(err => {
          console.error("Failed to copy extract prompt", err);
          this.onTriggerToast('Failed to copy prompt to clipboard.', 'text-danger');
        });
    });

    // Upgraded AI Prompt Helpers Navigation & Logic
    const promptSelector = modalOverlay.querySelector('#ai-prompt-selector');
    const toneSelector = modalOverlay.querySelector('#ai-tone-selector');
    const clientSafeToggle = modalOverlay.querySelector('#ai-client-safe-toggle');
    const langSelector = modalOverlay.querySelector('#ai-lang-selector');
    const missingContextHelper = modalOverlay.querySelector('#ai-missing-context-helper');
    const outputTypeBadge = modalOverlay.querySelector('#ai-output-type-badge');
    const promptPreview = modalOverlay.querySelector('#ai-prompt-preview');
    const copyPromptBtn = modalOverlay.querySelector('#btn-copy-ai-prompt');
    const regenerateBtn = modalOverlay.querySelector('#btn-ai-regenerate');
    const categoriesBar = modalOverlay.querySelector('#ai-categories-bar');

    let currentCategory = 'client_communication';

    const getActiveClientAndMemory = () => {
      const state = this.store.getState();
      const client = state.clients.find(c => c.id === project.clientId);
      return { client, clientMemory: client ? client.clientMemory : null };
    };

    const checkRequiredFields = (key) => {
      const template = promptTemplates[key];
      if (!template || !template.requiredContext) return false;
      return template.requiredContext.some(field => {
        const mappings = {
          projectTitle: 'title',
          clientName: 'clientName',
          stage: 'stage',
          nextAction: 'nextAction',
          revisionCount: 'revisionCount',
          maxRevision: 'maxRevision',
          revisionRule: 'revisionRule',
          clientRequest: 'clientRequest',
          invoiceNumber: 'invoiceNumber',
          invoiceAmount: 'invoiceAmount',
          invoiceDueDate: 'invoiceDueDate',
          amountDue: 'amountDue',
          amountPaid: 'amountPaid',
          deliveryStatus: 'deliveryStatus',
          previewLink: 'previewLink',
          finalFileLink: 'finalFileLink',
          sourceFileLink: 'rawFileLink',
          clientFeedbackSummary: 'clientFeedbackSummary'
        };
        const projField = mappings[field] || field;
        const val = project[projField];
        return val === undefined || val === null || val === "";
      });
    };

    const updatePromptPreview = () => {
      if (!promptPreview) return;

      const targetLang = (langSelector && langSelector.value !== 'app') ? langSelector.value : getLanguage();

      if (currentCategory === 'history') {
        const history = window.getPromptHistory ? window.getPromptHistory() : [];
        if (history.length === 0) {
          promptPreview.textContent = targetLang === 'id' ? "Belum ada riwayat prompt yang tercatat." : "No prompt history recorded yet.";
        } else {
          promptPreview.textContent = history.map((h, i) => {
            return `${i+1}. [${new Date(h.generatedAt).toLocaleTimeString()}] Type: ${h.promptType}\n   Preview: "${h.copiedTextPreview}"`;
          }).join('\n\n');
        }
        if (outputTypeBadge) {
          outputTypeBadge.textContent = "History";
          outputTypeBadge.style.background = "rgba(100, 116, 139, 0.15)";
          outputTypeBadge.style.color = "#94a3b8";
        }
        if (missingContextHelper) missingContextHelper.style.display = 'none';
        return;
      }

      if (!promptSelector) return;
      const key = promptSelector.value;
      if (!key) {
        promptPreview.textContent = "Please select a template.";
        return;
      }
      const template = promptTemplates[key];
      if (!template) {
        promptPreview.textContent = "Template not found.";
        return;
      }

      const { clientMemory } = getActiveClientAndMemory();
      const selectedTone = toneSelector ? toneSelector.value : 'Professional';
      const flProfile = this.store.getState().freelancerProfile;
      const isClientSafe = clientSafeToggle ? clientSafeToggle.checked : true;

      // Update badge
      if (outputTypeBadge) {
        outputTypeBadge.textContent = template.outputMode === 'client_message' 
          ? t('aiPrompts.readyMessage', 'Ready Message') 
          : (template.outputMode === 'internal_summary' ? t('aiPrompts.internalSummary', 'Internal Summary') : t('aiPrompts.aiPrompt', 'AI Prompt'));
        
        if (template.outputMode === 'client_message') {
          outputTypeBadge.style.background = "rgba(16, 185, 129, 0.15)";
          outputTypeBadge.style.color = "#34d399";
        } else if (template.outputMode === 'internal_summary') {
          outputTypeBadge.style.background = "rgba(245, 158, 11, 0.15)";
          outputTypeBadge.style.color = "#fbbf24";
        } else {
          outputTypeBadge.style.background = "rgba(139, 92, 246, 0.15)";
          outputTypeBadge.style.color = "#a78bfa";
        }
      }

      // Update copy button label dynamically
      if (copyPromptBtn) {
        let copyLabel = t('aiPrompts.copyPrompt', 'Copy Prompt');
        if (template.outputMode === 'client_message') {
          copyLabel = t('aiPrompts.copyMessage', 'Copy Message');
        } else if (template.outputMode === 'internal_summary') {
          copyLabel = t('aiPrompts.copySummary', 'Copy Summary');
        }
        copyPromptBtn.innerHTML = `${getIcon('copy', '', 14)} ${copyLabel}`;
      }

      // Check context
      if (missingContextHelper) {
        missingContextHelper.style.display = checkRequiredFields(key) ? 'block' : 'none';
      }

      // Pass privacy toggle to context options if needed or let templates use client-facing vs internal mode based on outputMode and toggle
      // If client-safe mode toggle is checked, we force safe mode for memory inputs
      const safeMemory = isClientSafe ? (clientMemory ? {
        ...clientMemory,
        clientRiskNotes: "",
        importantNotes: "",
        lastMeetingSummary: "",
        paymentBehavior: "",
        paymentReminderStyle: "",
        relationshipStatus: ""
      } : null) : clientMemory;

      const safeProject = isClientSafe ? {
        ...project,
        internalNotes: "",
        paymentNotes: "",
        notes: "",
        internalPaymentNotes: ""
      } : project;

      const text = template.generate(safeProject, safeMemory, selectedTone, flProfile, targetLang);
      promptPreview.textContent = text;
    };

    const populateTemplates = (category) => {
      if (!promptSelector) return;
      const targetLang = (langSelector && langSelector.value !== 'app') ? langSelector.value : getLanguage();
      if (category === 'history') {
        const historyOptText = targetLang === 'id' ? "Hanya Tampilan Riwayat" : "History View Only";
        promptSelector.innerHTML = `<option value="">${historyOptText}</option>`;
        if (toneSelector) toneSelector.disabled = true;
        if (clientSafeToggle) clientSafeToggle.disabled = true;
        updatePromptPreview();
        return;
      }

      if (toneSelector) toneSelector.disabled = false;
      if (clientSafeToggle) clientSafeToggle.disabled = false;

      const filtered = Object.entries(promptTemplates).filter(([k, t]) => {
        if (Array.isArray(t.category)) {
          return t.category.includes(category);
        }
        return t.category === category;
      });
      promptSelector.innerHTML = filtered.map(([k, t]) => `<option value="${k}">${t.name}</option>`).join('');
      
      if (filtered.length > 0) {
        const firstKey = filtered[0][0];
        const firstTemplate = filtered[0][1];
        if (clientSafeToggle) {
          clientSafeToggle.checked = firstTemplate.outputMode === 'client_message';
        }
        
        // Suggest tone if clientMemory has tonePreference
        const { clientMemory } = getActiveClientAndMemory();
        if (toneSelector && clientMemory && clientMemory.tonePreference) {
          const matchingTone = ['Professional', 'Friendly', 'Firm', 'Warm', 'Concise'].find(t => t.toLowerCase() === clientMemory.tonePreference.trim().toLowerCase());
          if (matchingTone) {
            toneSelector.value = matchingTone;
          } else {
            toneSelector.value = 'Professional';
          }
        }
      }
      updatePromptPreview();
    };

    if (categoriesBar) {
      categoriesBar.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          categoriesBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.dataset.cat;
          populateTemplates(currentCategory);
        });
      });
    }

    if (promptSelector) {
      promptSelector.addEventListener('change', () => {
        const key = promptSelector.value;
        const template = promptTemplates[key];
        if (template && clientSafeToggle) {
          clientSafeToggle.checked = template.outputMode === 'client_message';
        }
        updatePromptPreview();
      });
    }

    if (toneSelector) toneSelector.addEventListener('change', updatePromptPreview);
    if (clientSafeToggle) clientSafeToggle.addEventListener('change', updatePromptPreview);
    if (langSelector) langSelector.addEventListener('change', updatePromptPreview);
    if (regenerateBtn) regenerateBtn.addEventListener('click', updatePromptPreview);

    if (copyPromptBtn && promptSelector) {
      copyPromptBtn.addEventListener('click', () => {
        if (currentCategory === 'history') {
          this.onTriggerToast(t('toast.promptHistoryCannotCopy', 'Prompt history view cannot be copied directly.'), "text-warning");
          return;
        }
        const key = promptSelector.value;
        if (!key) return;
        const template = promptTemplates[key];
        if (template) {
          const text = promptPreview.textContent;
          let toastKey = 'promptCopied';
          if (template.outputMode === 'client_message') toastKey = 'messageCopied';
          else if (template.outputMode === 'internal_summary') toastKey = 'summaryCopied';
          
          copyPromptToClipboard(text, null, key, project.id);
          this.onTriggerToast(t(`toast.${toastKey}`), 'text-success');
        }
      });
    }

    // Dynamic wireups for direct section buttons
    const wireDirectBtn = (id, templateKey) => {
      const btn = modalOverlay.querySelector(id);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const { clientMemory } = getActiveClientAndMemory();
          const selectedTone = toneSelector ? toneSelector.value : 'Professional';
          const flProfile = this.store.getState().freelancerProfile;
          const template = promptTemplates[templateKey];
          if (template) {
            const isClientSafe = template.outputMode === 'client_message';
            const safeProject = isClientSafe ? {
              ...project,
              internalNotes: "",
              paymentNotes: "",
              notes: "",
              internalPaymentNotes: ""
            } : project;
            const safeMemory = isClientSafe ? (clientMemory ? {
              ...clientMemory,
              clientRiskNotes: "",
              importantNotes: "",
              lastMeetingSummary: "",
              paymentBehavior: "",
              paymentReminderStyle: "",
              relationshipStatus: ""
            } : null) : clientMemory;

            const targetLang = (langSelector && langSelector.value !== 'app') ? langSelector.value : getLanguage();
            const text = template.generate(safeProject, safeMemory, selectedTone, flProfile, targetLang);
            
            let toastKey = 'promptCopied';
            if (template.outputMode === 'client_message') toastKey = 'messageCopied';
            else if (template.outputMode === 'internal_summary') toastKey = 'summaryCopied';
            
            copyPromptToClipboard(text, null, templateKey, project.id);
            this.onTriggerToast(t(`toast.${toastKey}`), 'text-success');
          }
        });
      }
    };

    wireDirectBtn('#btn-delivery-ai-msg', 'deliveryMessage');
    wireDirectBtn('#btn-delivery-ai-handover', 'handoverNotes');
    wireDirectBtn('#btn-delivery-ai-revsummary', 'revisionSummary');
    wireDirectBtn('#btn-delivery-ai-checklist', 'deliveryChecklistGen');

    wireDirectBtn('#btn-invoice-ai-followup', 'invoiceFollowUp');
    wireDirectBtn('#btn-invoice-ai-overdue', 'overduePayment');
    wireDirectBtn('#btn-invoice-ai-confirm', 'paymentConfirmation');
    wireDirectBtn('#btn-invoice-ai-receipt', 'receiptRequest');

    populateTemplates(currentCategory);

    this.checkMeetingAvailabilityWarning(project.id);
  }

  saveGeneralMetadata() {
    const overlay = document.getElementById('project-detail-overlay');
    if (!overlay) return;

    const getVal = (selector, defaultVal = '') => {
      const el = overlay.querySelector(selector);
      return el ? el.value.trim() : defaultVal;
    };
    const getNum = (selector, defaultVal = 0) => {
      const el = overlay.querySelector(selector);
      return el ? (Number(el.value) || 0) : defaultVal;
    };

    const project = this.store.getState().projects.find(p => p.id === this.activeProjectId);
    if (!project) return;

    const titleVal = getVal('#m-p-title', project.title);
    const descVal = getVal('#m-p-desc', project.description || '');
    const budgetVal = getNum('#m-p-budget', project.budget || 0);
    const dueVal = getVal('#m-p-due', project.dueDate || '');
    const priorityVal = getVal('#m-p-priority', project.priority || 'Medium');
    const payStatusVal = overlay.querySelector('#m-p-payment-status-select') ? getVal('#m-p-payment-status-select') : getVal('#m-p-payment-status', project.paymentStatus || 'None');
    const nextActionVal = getVal('#m-p-next-action', project.nextAction || '');
    const internalVal = getVal('#m-p-internal-notes', project.internalNotes || '');
    const revNotesVal = getVal('#m-p-rev-notes', project.revisionNotes || '');

    const briefVal = getVal('#m-p-brief-url', project.briefLink || '');
    const rawVal = getVal('#m-p-raw-url', project.rawFileLink || '');
    const draftVal = getVal('#m-p-draft-url', project.draftFileLink || '');
    const finalVal = getVal('#m-p-final-url', project.finalDeliveryLink || '');
    const refVal = getVal('#m-p-ref-url', project.referenceFolderLink || '');

    const meetPlatform = getVal('#m-p-meet-platform', project.meetingPlatform || 'Google Meet');
    const meetLink = getVal('#m-p-meet-link', project.meetingLink || '');
    const meetNotes = getVal('#m-p-meet-notes', project.meetingNotes || '');

    const dpPct = getNum('#m-p-dp-percent', project.downPaymentPercent || 50);
    const mileAmt = getNum('#m-p-mile-amount', project.milestonePaymentAmount || 0);
    const dpAmt = Math.round(budgetVal * (dpPct / 100));
    const finalAmt = budgetVal - dpAmt - mileAmt;
    const remainingVal = budgetVal - dpAmt;
    const payMethodVal = getVal('#m-p-pay-method', project.paymentMethod || 'Bank Transfer');

    const clientSelect = overlay.querySelector('#m-p-client-select');
    let clientId = project.clientId;
    let clientName = project.clientName;
    let clientType = project.clientType || 'General';

    if (clientSelect && clientSelect.value !== 'NEW_CLIENT') {
      clientId = clientSelect.value;
      if (clientId) {
        const stateClients = this.store.getState().clients || [];
        const selectedClient = stateClients.find(c => c.id === clientId);
        if (selectedClient) {
          clientName = selectedClient.name + (selectedClient.businessName ? ` (${selectedClient.businessName})` : '');
          clientType = selectedClient.clientType || 'General';
        }
      } else {
        clientName = '';
        clientType = 'General';
      }
    }

    const categorySelect = overlay.querySelector('#m-p-category');
    let tags = project.tags;
    let customCategory = project.customCategory || '';
    if (categorySelect && categorySelect.value === 'CUSTOM_CATEGORY') {
      customCategory = getVal('#m-p-custom-category');
      if (customCategory) {
        tags = [customCategory];
      }
    } else if (categorySelect) {
      tags = [categorySelect.value];
      customCategory = '';
    }

    const approvalStatusVal = overlay.querySelector('#m-p-approval-status-select-val') ? getVal('#m-p-approval-status-select-val') : getVal('#m-p-approval-status-select', project.approvalStatus || project.clientApprovalStatus || 'Pending Review');
    let approvedAtVal = project.approvedAt || '';
    if (approvalStatusVal === 'Approved' && project.approvalStatus !== 'Approved') {
      approvedAtVal = new Date().toISOString().split('T')[0];
    }
    const clientApprovalStatus = approvalStatusVal;
    const invoiceStatus = getVal('#m-p-invoice-status', project.invoiceStatus || 'Not Created');
    const invoiceNumber = getVal('#m-p-invoice-num', project.invoiceNumber || '');
    const invoiceAmount = getNum('#m-p-invoice-amount', project.invoiceAmount || 0);
    const invoiceDate = getVal('#m-p-invoice-date', project.invoiceDate || '');
    const invoiceDueDate = getVal('#m-p-invoice-due', project.invoiceDueDate || '');
    const invoiceFileLink = getVal('#m-p-invoice-url', project.invoiceFileLink || '');
    const paymentTerms = getVal('#m-p-payment-terms', project.paymentTerms || '');

    const amountPaid = getNum('#m-p-amount-paid', project.amountPaid || 0);
    const amountDue = Math.max(0, invoiceAmount - amountPaid);
    const paymentMethod = getVal('#m-p-pay-method', project.paymentMethod || '');
    const paymentNotes = getVal('#m-p-payment-notes', project.paymentNotes || '');

    const paymentDueDate = getVal('#m-p-payment-due', project.paymentDueDate || '');
    const receiptLink = getVal('#m-p-payment-receipt', project.receiptLink || project.paymentReceiptLink || '');
    const paymentReceiptLink = receiptLink;
    const lastFollowUpDate = getVal('#m-p-last-followup', project.lastFollowUpDate || '');
    const nextFollowUpDate = getVal('#m-p-next-followup', project.nextFollowUpDate || '');
    const rawFileDownloadLink = getVal('#m-p-raw-download-link', project.rawFileDownloadLink || '');
    const holdReason = getVal('#m-p-hold-reason', project.holdReason || '');
    const holdDate = getVal('#m-p-hold-date', project.holdDate || '');
    const holdFollowUpDate = getVal('#m-p-hold-followup', project.holdFollowUpDate || '');

    // Planner Hub fields
    const meetDate = getVal('#m-p-meet-date', project.meetingDate || '');
    const meetTime = getVal('#m-p-meet-time', project.meetingTime || '');
    const meetType = getVal('#m-p-meet-type', project.meetingType || 'Google Meet');
    const meetLinkVal = getVal('#m-p-meet-link-val', getVal('#m-p-meet-link', project.meetingLink || ''));
    const meetTimezone = getVal('#m-p-meet-timezone', project.meetingTimezone || 'Asia/Jakarta');
    const clientRequest = getVal('#m-p-client-request', project.clientRequest || '');
    const keyDiscussion = getVal('#m-p-key-discussion', project.keyDiscussionPoints || '');
    const decisionMade = getVal('#m-p-decision-made', project.decisionMade || '');
    const actionItems = getVal('#m-p-action-items', project.actionItems || '');
    const clientConcern = getVal('#m-p-client-concern', project.clientConcern || '');
    const clientExpectation = getVal('#m-p-client-expectation', project.clientExpectation || '');
    const clientReviewDate = getVal('#m-p-client-review-date', project.clientReviewDate || '');
    const finalDeliveryDate = getVal('#m-p-final-delivery-date', project.finalDeliveryDate || '');

    const previewLinkVal = normalizeLink(getVal('#m-p-preview-link-val', project.previewLink || ''));
    const clientFeedbackSummaryVal = getVal('#m-p-client-feedback-summary', project.clientFeedbackSummary || '');
    const clientVisibleNotesVal = getVal('#m-p-client-visible-notes', project.clientVisibleNotes || '');
    const finalFileLinkVal = normalizeLink(getVal('#m-p-final-file-link-val', project.finalFileLink || ''));
    const rawFileLinkVal = normalizeLink(overlay.querySelector('#m-p-raw-file-link-val') ? getVal('#m-p-raw-file-link-val') : getVal('#m-p-raw-url', project.rawFileLink || ''));
    const handoverNotesVal = getVal('#m-p-handover-notes-val', project.handoverNotes || '');

    const deliveryStatusVal = getVal('#m-p-delivery-status-select-val', project.deliveryStatus || 'Not Submitted');
    const deliveryDateVal = getVal('#m-p-delivery-date-val', project.deliveryDate || '');
    const draftLinkVal = normalizeLink(getVal('#m-p-draft-link-val', project.draftLink || ''));
    const reviewLinkVal = normalizeLink(getVal('#m-p-review-link-val', project.reviewLink || ''));
    const fileFolderLinkVal = normalizeLink(getVal('#m-p-file-folder-link-val', project.fileFolderLink || ''));
    const clientConfirmedDeliveryEl = overlay.querySelector('#m-p-client-confirmed-delivery');
    const clientConfirmedDeliveryVal = clientConfirmedDeliveryEl ? clientConfirmedDeliveryEl.checked : (project.clientConfirmedDelivery || false);

    const updates = {
      title: titleVal,
      description: descVal,
      budget: budgetVal,
      dueDate: dueVal,
      priority: priorityVal,
      paymentStatus: payStatusVal,
      invoiceStatus,
      amountPaid,
      amountDue,
      paymentNotes,
      receiptLink,
      nextAction: nextActionVal,
      internalNotes: internalVal,
      revisionNotes: revNotesVal,
      briefLink: briefVal,
      rawFileLink: rawVal,
      draftFileLink: draftVal,
      finalDeliveryLink: finalVal,
      referenceFolderLink: refVal,
      holdReason,
      holdDate,
      holdFollowUpDate,
      meetingPlatform: meetPlatform,
      meetingLink: meetLinkVal,
      meetingNotes: meetNotes,
      downPaymentPercent: dpPct,
      downPaymentAmount: dpAmt,
      milestonePaymentAmount: mileAmt,
      finalPaymentAmount: finalAmt,
      remainingBalance: remainingVal,
      paymentMethod: paymentMethod,
      clientId,
      clientName,
      clientType,
      tags,
      customCategory,
      clientApprovalStatus,
      approvalStatus: approvalStatusVal,
      approvedAt: approvedAtVal,
      previewLink: previewLinkVal,
      clientFeedbackSummary: clientFeedbackSummaryVal,
      clientVisibleNotes: clientVisibleNotesVal,
      finalFileLink: finalFileLinkVal,
      rawFileLink: rawFileLinkVal,
      handoverNotes: handoverNotesVal,
      deliveryStatus: deliveryStatusVal,
      deliveryDate: deliveryDateVal,
      draftLink: draftLinkVal,
      reviewLink: reviewLinkVal,
      fileFolderLink: fileFolderLinkVal,
      clientConfirmedDelivery: clientConfirmedDeliveryVal,
      invoiceNumber,
      invoiceAmount,
      invoiceDate,
      invoiceDueDate,
      invoiceFileLink,
      paymentTerms,
      paymentDueDate,
      paymentReceiptLink,
      lastFollowUpDate,
      nextFollowUpDate,
      rawFileDownloadLink,
      meetingDate: meetDate,
      meetingTime: meetTime,
      meetingType: meetType,
      meetingTimezone: meetTimezone,
      clientRequest,
      keyDiscussionPoints: keyDiscussion,
      decisionMade,
      actionItems,
      clientConcern,
      clientExpectation,
      clientReviewDate,
      finalDeliveryDate
    };

    const showcase = overlay.querySelector('#m-p-portfolio');
    if (showcase && !showcase.disabled) {
      updates.portfolioShowcase = showcase.checked;
      updates.portfolioDescription = getVal('#m-p-portfolio-desc');
    }

    this.store.updateProject(this.activeProjectId, updates);

    // Save Client Memory fields if clientId is present and elements exist on screen
    if (clientId) {
      const clientPreference = getVal('#m-c-preference', null);
      if (clientPreference !== null) {
        const clientUpdates = {
          clientPreference,
          communicationStyle: getVal('#m-c-comm-style', ''),
          paymentBehavior: getVal('#m-c-payment-behavior', ''),
          revisionPattern: getVal('#m-c-revision-pattern', ''),
          deliveryPreference: getVal('#m-c-delivery-preference', ''),
          clientRiskNotes: getVal('#m-c-risk-notes', ''),
          importantNotes: getVal('#m-c-important-notes', ''),
          lastProjectSummary: getVal('#m-c-last-proj-summary', ''),
          lastMeetingSummary: getVal('#m-c-last-meet-summary', '')
        };
        this.store.updateClient(clientId, clientUpdates);
      }
    }

    this.onStateChange();
  }

  renderChecklist(project) {
    const listEl = document.getElementById('modal-checklist-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    
    if (!project.checklist || project.checklist.length === 0) {
      listEl.innerHTML = `<span class="stat-subtext" style="display: block; padding: 4px;">No checklist tasks logged.</span>`;
      return;
    }

    project.checklist.forEach(item => {
      const row = document.createElement('div');
      row.className = `checklist-row ${item.completed ? 'completed' : ''}`;
      row.innerHTML = `
        <input type="checkbox" class="checklist-checkbox" ${item.completed ? 'checked' : ''}>
        <span class="checklist-text">${item.text}</span>
        <button class="checklist-delete-btn">${getIcon('trash', '', 14)}</button>
      `;

      row.querySelector('.checklist-checkbox').addEventListener('change', (e) => {
        const checklist = project.checklist.map(x => x.id === item.id ? { ...x, completed: e.target.checked } : x);
        this.store.updateProject(project.id, { checklist });
        this.onStateChange();
        row.classList.toggle('completed', e.target.checked);
      });

      row.querySelector('.checklist-delete-btn').addEventListener('click', () => {
        const checklist = project.checklist.filter(x => x.id !== item.id);
        this.store.updateProject(project.id, { checklist });
        this.onStateChange();
        this.renderChecklist(project);
      });

      listEl.appendChild(row);
    });
  }

  renderDeliverables(project) {
    const listEl = document.getElementById('modal-deliverables-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (!project.deliverables || project.deliverables.length === 0) {
      listEl.innerHTML = `<span class="stat-subtext" style="display: block; padding: 4px;">No file deliverables linked.</span>`;
      return;
    }

    project.deliverables.forEach(deliv => {
      const row = document.createElement('div');
      row.className = 'deliverable-list-item';

      row.innerHTML = `
        <div class="deliverable-desc-box">
          <span class="deliverable-item-title">${deliv.title}</span>
          <div class="deliverable-item-meta">
            <span>Ver. ${deliv.version}</span>
            <a href="${deliv.linkUrl}" target="_blank">
              ${getIcon('externalLink', '', 12)} Visit Asset Link
            </a>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <select class="form-control" style="font-size: 0.72rem; padding: 4px 6px; width: 120px;">
            <option value="Draft" ${deliv.status === 'Draft' ? 'selected' : ''}>Draft</option>
            <option value="SentForReview" ${deliv.status === 'SentForReview' ? 'selected' : ''}>Sent for Review</option>
            <option value="Approved" ${deliv.status === 'Approved' ? 'selected' : ''}>Approved</option>
          </select>
          <button class="checklist-delete-btn" style="opacity: 1;">${getIcon('trash', '', 14)}</button>
        </div>
      `;

      const select = row.querySelector('select');
      select.addEventListener('change', (e) => {
        const nextStatus = e.target.value;
        let revInc = 0;

        if (nextStatus === 'SentForReview' && deliv.status === 'Draft') {
          revInc = 1;
        }

        const deliverables = project.deliverables.map(x => {
          if (x.id === deliv.id) {
            const nextDeliv = { ...x, status: nextStatus };
            if (revInc) nextDeliv.version += 1;
            return nextDeliv;
          }
          return x;
        });

        const updates = { deliverables };
        if (revInc && project.revisionRound < project.maxRevisionRounds) {
          updates.revisionRound = project.revisionRound + 1;
          this.onTriggerToast('Deliverable sent! Revision round incremented.');
        } else if (nextStatus === 'Approved') {
          this.onTriggerToast('Deliverable approved!', 'text-success');
        }

        this.store.updateProject(project.id, updates);
        this.onStateChange();
        this.render();
      });

      row.querySelector('.checklist-delete-btn').addEventListener('click', () => {
        const deliverables = project.deliverables.filter(x => x.id !== deliv.id);
        this.store.updateProject(project.id, { deliverables });
        this.onStateChange();
        this.renderDeliverables(project);
      });

      listEl.appendChild(row);
    });
  }

  renderInvoices(project) {
    const listEl = document.getElementById('modal-invoices-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    const projInvoices = project.invoices || [];

    if (projInvoices.length === 0) {
      listEl.innerHTML = `<span class="stat-subtext" style="display: block; padding: 4px;">No invoices created yet.</span>`;
      return;
    }

    projInvoices.forEach(inv => {
      const row = document.createElement('div');
      row.className = 'deliverable-list-item';
      row.style.padding = '8px 12px';

      let statusBadge = 'status-completed';
      if (inv.status === 'Sent') statusBadge = 'status-active';
      if (inv.status === 'Paid') statusBadge = 'status-active text-success';
      if (inv.status === 'Overdue') statusBadge = 'status-lead text-danger';

      row.innerHTML = `
        <div class="deliverable-desc-box">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.8rem; font-weight: 700;">${inv.invoiceNumber}</span>
            <span class="client-status-badge ${statusBadge}" style="font-size: 0.65rem; padding: 1px 5px;">${inv.status}</span>
          </div>
          <span class="stat-subtext" style="font-size: 0.68rem;">Due: ${formatDate(inv.dueDate)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--color-secondary);">${formatCurrency(inv.amount)}</span>
          <button class="checklist-delete-btn" style="opacity: 1;">${getIcon('trash', '', 14)}</button>
        </div>
      `;

      row.querySelector('.checklist-delete-btn').addEventListener('click', () => {
        if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
          this.store.deleteInvoice(inv.id);
          this.onStateChange();
          this.renderInvoices(project);
        }
      });

      listEl.appendChild(row);
    });
  }

  renderDeliveryChecklist(project) {
    const listEl = document.getElementById('modal-delivery-checklist-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    
    if (!project.deliveryChecklist || project.deliveryChecklist.length === 0) {
      listEl.innerHTML = `<span class="stat-subtext" style="display: block; padding: 4px; font-style: italic;">No checklist steps logged.</span>`;
      return;
    }

    project.deliveryChecklist.forEach(item => {
      const row = document.createElement('div');
      row.className = `checklist-row ${item.completed ? 'completed' : ''}`;
      row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; padding: 4px 8px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: 6px;';
      
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <input type="checkbox" class="delivery-chk-checkbox" ${item.completed ? 'checked' : ''} style="cursor: pointer;">
          <span class="checklist-text" style="font-size: 0.78rem; color: ${item.completed ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${item.completed ? 'line-through' : 'none'};">${item.label}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-secondary delivery-chk-visible-btn" style="padding: 2px 6px; font-size: 0.65rem; background: ${item.clientVisible ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)'}; border-color: ${item.clientVisible ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)'}; color: ${item.clientVisible ? 'var(--color-secondary)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 4px;" title="Toggle Client Visibility">
            ${item.clientVisible ? '👁 Client' : '🔒 Internal'}
          </button>
          <button class="checklist-delete-btn delivery-chk-delete-btn" style="padding: 4px; background: none; border: none; cursor: pointer; color: var(--text-muted);">${getIcon('trash', '', 14)}</button>
        </div>
      `;

      row.querySelector('.delivery-chk-checkbox').addEventListener('change', (e) => {
        const deliveryChecklist = project.deliveryChecklist.map(x => x.id === item.id ? { ...x, completed: e.target.checked } : x);
        this.store.updateProject(project.id, { deliveryChecklist });
        this.onStateChange();
        this.updateSuggestedDeliveryStatus(project);
        row.classList.toggle('completed', e.target.checked);
        const textSpan = row.querySelector('.checklist-text');
        if (textSpan) {
          textSpan.style.color = e.target.checked ? 'var(--text-muted)' : 'var(--text-primary)';
          textSpan.style.textDecoration = e.target.checked ? 'line-through' : 'none';
        }
      });

      row.querySelector('.delivery-chk-visible-btn').addEventListener('click', () => {
        const deliveryChecklist = project.deliveryChecklist.map(x => x.id === item.id ? { ...x, clientVisible: !x.clientVisible } : x);
        this.store.updateProject(project.id, { deliveryChecklist });
        this.onStateChange();
        this.renderDeliveryChecklist(project);
      });

      row.querySelector('.delivery-chk-delete-btn').addEventListener('click', () => {
        const deliveryChecklist = project.deliveryChecklist.filter(x => x.id !== item.id);
        this.store.updateProject(project.id, { deliveryChecklist });
        this.onStateChange();
        this.renderDeliveryChecklist(project);
        this.updateSuggestedDeliveryStatus(project);
      });

      listEl.appendChild(row);
    });
  }

  updateSuggestedDeliveryStatus(project) {
    const labelEl = document.getElementById('suggested-delivery-status-label');
    if (!labelEl) return;

    let suggested = 'Not Submitted';
    
    const lacksApproval = project.approvalStatus !== 'Approved' && project.clientApprovalStatus !== 'Approved';
    const lacksFinalFile = !project.finalFileLink && !project.finalDeliveryLink;
    const hasPreview = !!(project.previewLink || project.draftFileLink || project.briefLink);

    if (project.clientConfirmedDelivery) {
      suggested = 'Handover Complete';
    } else if (!lacksFinalFile && project.handoverNotes && project.deliveryChecklist && project.deliveryChecklist.every(item => item.completed)) {
      suggested = 'Handover Complete';
    } else if (!lacksFinalFile) {
      suggested = 'Final Delivered';
    } else if (project.approvalStatus === 'Approved' || project.clientApprovalStatus === 'Approved') {
      suggested = 'Approved';
    } else if (project.approvalStatus === 'Needs Revision' || project.clientApprovalStatus === 'Needs Revision' || project.stage === 'revision') {
      suggested = 'Revision Needed';
    } else if (hasPreview) {
      suggested = 'Waiting Feedback';
    }

    labelEl.textContent = `Suggested: ${suggested}`;
  }
}
