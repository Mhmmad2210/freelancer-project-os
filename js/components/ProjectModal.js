/* ==========================================================================
   FREELANCER PROJECT OS - PROJECT DETAILS MODAL COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate } from '../utils.js';

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

  render() {
    const state = this.store.getState();
    const project = state.projects.find(p => p.id === this.activeProjectId);
    if (!project) return;

    const categoryOptions = ['Design', 'Development', 'Marketing', 'Consulting', 'Copywriting']
      .map(tag => `<option value="${tag}" ${project.tags.includes(tag) ? 'selected' : ''}>${tag}</option>`)
      .join('');

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
            <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 700;">Project Details</span>
            <input type="text" id="m-p-title" class="form-control" value="${project.title}" style="background: none; border: none; font-size: 1.25rem; font-weight: 800; padding: 2px 0; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif;" required>
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
                  <label>Project Category</label>
                  <select class="form-control" id="m-p-category">${categoryOptions}</select>
                </div>
                <div class="form-group">
                  <label>Priority</label>
                  <select class="form-control" id="m-p-priority">
                    <option value="Low" ${project.priority === 'Low' ? 'selected' : ''}>Low Priority</option>
                    <option value="Medium" ${project.priority === 'Medium' ? 'selected' : ''}>Medium Priority</option>
                    <option value="High" ${project.priority === 'High' ? 'selected' : ''}>High Priority</option>
                  </select>
                </div>
              </div>

              <!-- Scope Description -->
              <div class="form-group">
                <label>Project Description</label>
                <textarea class="form-control" id="m-p-desc" style="min-height: 80px;" placeholder="Add project outline briefs, files, client notes...">${project.description || ''}</textarea>
              </div>

              <!-- File and Delivery Links Group -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px;">
                <h4 class="detail-section-title">${getIcon('folder', '', 16)} Project File & Delivery Links</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="form-group">
                    <label>Brief / Specs Link</label>
                    <input type="url" id="m-p-brief-url" class="form-control" value="${project.briefLink || ''}" placeholder="Figma, Doc brief link...">
                  </div>
                  <div class="form-group">
                    <label>Raw Source Folder Link</label>
                    <input type="url" id="m-p-raw-url" class="form-control" value="${project.rawFileLink || ''}" placeholder="Google Drive raw folder URL...">
                  </div>
                  <div class="form-group">
                    <label>Draft / Staging URL</label>
                    <input type="url" id="m-p-draft-url" class="form-control" value="${project.draftFileLink || ''}" placeholder="Mockup link, staging URL...">
                  </div>
                  <div class="form-group">
                    <label>Final Deliverable Link</label>
                    <input type="url" id="m-p-final-url" class="form-control" value="${project.finalDeliveryLink || ''}" placeholder="Approved files package URL...">
                  </div>
                  <div class="form-group" style="grid-column: span 2;">
                    <label>Reference Assets Folder Link</label>
                    <input type="url" id="m-p-ref-url" class="form-control" value="${project.referenceFolderLink || ''}" placeholder="Logos, guides reference folder URL...">
                  </div>
                </div>
              </div>

              <!-- Meeting Hub Group -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px;">
                <h4 class="detail-section-title">${getIcon('clock', '', 16)} Live Meeting Portal Hub</h4>
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
                  <div class="form-group">
                    <label>Platform</label>
                    <select class="form-control" id="m-p-meet-platform">
                      <option value="Google Meet" ${project.meetingPlatform === 'Google Meet' ? 'selected' : ''}>Google Meet</option>
                      <option value="Zoom" ${project.meetingPlatform === 'Zoom' ? 'selected' : ''}>Zoom</option>
                      <option value="Microsoft Teams" ${project.meetingPlatform === 'Microsoft Teams' ? 'selected' : ''}>Teams</option>
                      <option value="Slack Call" ${project.meetingPlatform === 'Slack Call' ? 'selected' : ''}>Slack</option>
                      <option value="WhatsApp" ${project.meetingPlatform === 'WhatsApp' ? 'selected' : ''}>WhatsApp Call</option>
                      <option value="Other" ${project.meetingPlatform === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Meeting Link URL</label>
                    <input type="url" id="m-p-meet-link" class="form-control" value="${project.meetingLink || ''}" placeholder="https://meet.google.com/abc-defg">
                  </div>
                </div>
                <div class="form-group">
                  <label>Access Instructions / Session Notes</label>
                  <input type="text" id="m-p-meet-notes" class="form-control" value="${project.meetingNotes || ''}" placeholder="Password, meeting schedules, notes...">
                </div>
              </div>

              <!-- Checklist -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px;">
                <h4 class="detail-section-title">${getIcon('checkSquare', '', 16)} Deliverables Checklist</h4>
                <div class="checklist-container" id="modal-checklist-list"></div>
                <form class="checklist-add-form" id="modal-checklist-form">
                  <input type="text" placeholder="Add a project task..." class="checklist-input" required>
                  <button type="submit" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.8rem;">Add Task</button>
                </form>
              </div>

              <!-- Revisions Tracker Section -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
                <h4 class="detail-section-title">${getIcon('refresh', '', 16)} Revisions & Reviews</h4>
                <div class="deliverables-box-list" id="modal-deliverables-list"></div>
                
                <form id="modal-deliverable-form" style="margin-top: 10px; display: grid; grid-template-columns: 1.2fr 1fr auto; gap: 6px;">
                  <input type="text" id="d-title" class="checklist-input" placeholder="Deliverable name..." required>
                  <input type="url" id="d-url" class="checklist-input" placeholder="URL Link..." required>
                  <button type="submit" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.8rem;">Link File</button>
                </form>
                
                <div class="form-group" style="margin-top: 14px;">
                  <label>Revision Notes</label>
                  <textarea class="form-control" id="m-p-rev-notes" style="min-height: 60px;" placeholder="Summarize client feedback rounds here...">${project.revisionNotes || ''}</textarea>
                </div>
              </div>

              <!-- Billing Ledger Section -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
                <h4 class="detail-section-title">${getIcon('fileText', '', 16)} Invoices</h4>
                <div class="deliverables-box-list" id="modal-invoices-list" style="gap: 8px;"></div>
                <button class="btn btn-secondary" id="m-btn-invoice-add" style="margin-top: 8px; width: 100%; justify-content: center; font-size: 0.8rem;">
                  ${getIcon('plus', '', 14)} Add Custom Invoice
                </button>
              </div>

            </div>

            <!-- Right Sidebar Columns -->
            <div class="drawer-column-sidebar">
              
              <!-- Client portal view preview button -->
              <div style="margin-bottom: 14px;">
                <button class="btn btn-primary" id="btn-modal-preview-client" type="button" style="width: 100%; justify-content: center; gap: 6px; font-size: 0.8rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-color: rgba(16, 185, 129, 0.25);">
                  ${getIcon('externalLink', '', 14)} Open Client View Preview
                </button>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Project Stage</label>
                <select class="form-control" id="m-p-stage">
                  <option value="new_lead" ${project.stage === 'new_lead' ? 'selected' : ''}>New Lead</option>
                  <option value="proposal_sent" ${project.stage === 'proposal_sent' ? 'selected' : ''}>Proposal Sent</option>
                  <option value="in_progress" ${project.stage === 'in_progress' ? 'selected' : ''}>In Progress</option>
                  <option value="client_review" ${project.stage === 'client_review' ? 'selected' : ''}>Client Review</option>
                  <option value="revision" ${project.stage === 'revision' ? 'selected' : ''}>Revision</option>
                  <option value="invoice_sent" ${project.stage === 'invoice_sent' ? 'selected' : ''}>Invoice Sent</option>
                  <option value="waiting_payment" ${project.stage === 'waiting_payment' ? 'selected' : ''}>Waiting Payment</option>
                  <option value="completed" ${project.stage === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Client Name</label>
                <div class="drawer-meta-value">${project.clientName}</div>
              </div>

              <!-- Quotation Link Reference info -->
              <div class="form-group" style="border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 8px;">
                <label class="drawer-meta-title">Quotation Reference</label>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);">
                    ${project.quotationId ? `Linked (QT-${project.quotationId.substring(0,3)})` : 'None linked'}
                  </span>
                  <span class="client-status-badge ${project.quotationId ? 'status-active text-success' : 'status-completed'}" style="font-size: 0.62rem; padding: 1px 6px;">
                    ${project.quotationStatus || 'None'}
                  </span>
                </div>
              </div>

              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label class="drawer-meta-title" style="margin: 0;">Project Value (IDR)</label>
                  <span id="m-p-budget-formatted" style="font-size: 0.82rem; font-weight: 700; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif;">${formatCurrency(project.budget)}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                  <span style="font-size: 0.95rem; font-weight: 700; color: var(--color-secondary);">Rp</span>
                  <input type="number" class="form-control" id="m-p-budget" value="${project.budget}" style="padding: 6px 10px; font-weight: 700; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif;" min="0">
                </div>
              </div>

              <!-- Calculated Payment Terms -->
              <div style="border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 10px; margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
                <span class="drawer-meta-title" style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Payment Terms Tracking</span>
                
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <label style="font-size: 0.72rem; color: var(--text-secondary); margin: 0;">Down Payment (%)</label>
                  <input type="number" class="form-control" id="m-p-dp-percent" value="${project.downPaymentPercent}" style="width: 70px; padding: 4px 6px; font-size: 0.75rem; text-align: center;" min="0" max="100">
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <span style="font-size: 0.72rem; color: var(--text-secondary);">DP Amount</span>
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);" id="m-p-dp-amount-lbl">${formatCurrency(project.downPaymentAmount)}</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <label style="font-size: 0.72rem; color: var(--text-secondary); margin: 0;">Milestone Amount (Rp)</label>
                  <input type="number" class="form-control" id="m-p-mile-amount" value="${project.milestonePaymentAmount}" style="width: 100px; padding: 4px 6px; font-size: 0.75rem; text-align: right;" min="0">
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <span style="font-size: 0.72rem; color: var(--text-secondary);">Final Payment</span>
                  <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);" id="m-p-final-amount-lbl">${formatCurrency(project.finalPaymentAmount)}</span>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                  <span style="font-size: 0.72rem; color: var(--color-danger); font-weight: 600;">Remaining Balance</span>
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-danger);" id="m-p-remaining-lbl">${formatCurrency(project.remainingBalance)}</span>
                </div>

                <div class="form-group" style="margin-top: 6px;">
                  <label class="drawer-meta-title">Payment Method</label>
                  <select class="form-control" id="m-p-pay-method" style="font-size: 0.75rem; padding: 4px 6px;">
                    <option value="Bank Transfer" ${project.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                    <option value="E-Wallet" ${project.paymentMethod === 'E-Wallet' ? 'selected' : ''}>E-Wallet</option>
                    <option value="PayPal" ${project.paymentMethod === 'PayPal' ? 'selected' : ''}>PayPal</option>
                    <option value="Wise" ${project.paymentMethod === 'Wise' ? 'selected' : ''}>Wise Transfer</option>
                    <option value="Manual Payment" ${project.paymentMethod === 'Manual Payment' ? 'selected' : ''}>Manual cash/cheque</option>
                    <option value="Other" ${project.paymentMethod === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Project Deadline</label>
                <input type="date" class="form-control" id="m-p-due" value="${project.dueDate}" style="font-size: 0.8rem; padding: 6px 8px;">
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Revision Count</label>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <button class="invoice-btn-small" id="m-p-rev-dec" style="padding: 3px 8px; font-weight: 800;">-</button>
                  <span style="font-weight: 700; font-size: 0.9rem; width: 36px; text-align: center;">${project.revisionRound}/${project.maxRevisionRounds}</span>
                  <button class="invoice-btn-small" id="m-p-rev-inc" style="padding: 3px 8px; font-weight: 800;">+</button>
                </div>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Invoice Status</label>
                <div class="drawer-meta-value" style="font-weight: 700; color: var(--color-primary);">
                  ${project.invoices && project.invoices.length > 0 ? project.invoices[project.invoices.length - 1].status : 'None Generated'}
                </div>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Payment Status</label>
                <select class="form-control" id="m-p-payment-status">
                  <option value="None" ${project.paymentStatus === 'None' ? 'selected' : ''}>Not invoiced yet</option>
                  <option value="DP paid" ${project.paymentStatus === 'DP paid' ? 'selected' : ''}>DP paid</option>
                  <option value="Invoice overdue" ${project.paymentStatus === 'Invoice overdue' ? 'selected' : ''}>Invoice overdue</option>
                  <option value="Waiting payment" ${project.paymentStatus === 'Waiting payment' ? 'selected' : ''}>Waiting payment</option>
                  <option value="Paid" ${project.paymentStatus === 'Paid' ? 'selected' : ''}>Completed</option>
                </select>
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Next Action</label>
                <input type="text" class="form-control" id="m-p-next-action" value="${project.nextAction || ''}" placeholder="What is the next task?">
              </div>

              <div class="form-group">
                <label class="drawer-meta-title">Internal Notes</label>
                <textarea class="form-control" id="m-p-internal-notes" style="min-height: 70px; font-size: 0.8rem;" placeholder="Private client notes, logins...">${project.internalNotes || ''}</textarea>
              </div>

              <div style="border-top: 1px solid var(--border-subtle); padding-top: 14px;">
                <label class="drawer-meta-title">Portfolio Sandbox Settings</label>
                <div class="switch-control-row" style="margin-top: 4px; padding: 6px 8px;">
                  <span class="switch-control-label" style="font-size: 0.78rem;">Showcase Publicly</span>
                  <label class="switch-widget">
                    <input type="checkbox" id="m-p-portfolio" ${project.portfolioShowcase ? 'checked' : ''}>
                    <span class="switch-slider"></span>
                  </label>
                </div>
                
                <div class="form-group ${project.portfolioShowcase ? '' : 'd-none'}" id="portfolio-desc-wrapper" style="margin-top: 10px;">
                  <label class="drawer-meta-title" style="font-size: 0.7rem;">Staging case summary</label>
                  <textarea class="form-control" id="m-p-portfolio-desc" style="font-size: 0.8rem; min-height: 60px;" placeholder="Write a short case study summary...">${project.portfolioDescription || ''}</textarea>
                </div>
              </div>

              <div style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: auto;">
                <button class="btn btn-secondary" id="m-btn-delete" style="width: 100%; border-color: rgba(239, 68, 68, 0.2); color: var(--color-danger); justify-content: center; gap: 4px; padding: 8px;">
                  ${getIcon('trash', '', 13)} Delete Project
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

    modalOverlay.querySelector('#close-modal').addEventListener('click', () => {
      this.saveGeneralMetadata();
      this.close();
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        this.saveGeneralMetadata();
        this.close();
      }
    });

    modalOverlay.querySelector('#m-p-title').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { title: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-category').addEventListener('change', (e) => {
      this.store.updateProject(project.id, { tags: [e.target.value] });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-priority').addEventListener('change', (e) => {
      this.store.updateProject(project.id, { priority: e.target.value });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-stage').addEventListener('change', (e) => {
      const nextStage = e.target.value;
      const updates = { stage: nextStage };
      if (nextStage === 'completed') {
        updates.paymentStatus = 'Paid';
      }
      this.store.updateProject(project.id, updates);
      this.onTriggerToast(`Updated stage to: ${nextStage}`);
      this.onStateChange();
      this.render();
    });

    modalOverlay.querySelector('#m-p-payment-status').addEventListener('change', (e) => {
      this.store.updateProject(project.id, { paymentStatus: e.target.value });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-next-action').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { nextAction: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-internal-notes').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { internalNotes: e.target.value.trim() });
    });

    modalOverlay.querySelector('#m-p-rev-notes').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { revisionNotes: e.target.value.trim() });
    });

    modalOverlay.querySelector('#m-p-brief-url').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { briefLink: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-raw-url').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { rawFileLink: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-draft-url').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { draftFileLink: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-final-url').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { finalDeliveryLink: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-ref-url').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { referenceFolderLink: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-meet-platform').addEventListener('change', (e) => {
      this.store.updateProject(project.id, { meetingPlatform: e.target.value });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-meet-link').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { meetingLink: e.target.value.trim() });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-meet-notes').addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { meetingNotes: e.target.value.trim() });
    });

    const recalculateTerms = () => {
      const budget = Number(modalOverlay.querySelector('#m-p-budget').value) || 0;
      const dpPct = Number(modalOverlay.querySelector('#m-p-dp-percent').value) || 0;
      const mileAmt = Number(modalOverlay.querySelector('#m-p-mile-amount').value) || 0;

      const dpAmt = Math.round(budget * (dpPct / 100));
      const finalAmt = budget - dpAmt - mileAmt;
      const remainingVal = budget - dpAmt;

      const formattedBudget = modalOverlay.querySelector('#m-p-budget-formatted');
      if (formattedBudget) {
        formattedBudget.textContent = formatCurrency(budget);
      }

      modalOverlay.querySelector('#m-p-dp-amount-lbl').textContent = formatCurrency(dpAmt);
      modalOverlay.querySelector('#m-p-final-amount-lbl').textContent = formatCurrency(finalAmt);
      modalOverlay.querySelector('#m-p-remaining-lbl').textContent = formatCurrency(remainingVal);

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

    modalOverlay.querySelector('#m-p-budget').addEventListener('change', recalculateTerms);
    modalOverlay.querySelector('#m-p-dp-percent').addEventListener('change', recalculateTerms);
    modalOverlay.querySelector('#m-p-mile-amount').addEventListener('change', recalculateTerms);

    modalOverlay.querySelector('#m-p-pay-method').addEventListener('change', (e) => {
      this.store.updateProject(project.id, { paymentMethod: e.target.value });
      this.onStateChange();
    });

    modalOverlay.querySelector('#m-p-due').addEventListener('change', (e) => {
      this.store.updateProject(project.id, { dueDate: e.target.value });
      this.onStateChange();
    });

    // Client view preview button navigation listener
    modalOverlay.querySelector('#btn-modal-preview-client').addEventListener('click', () => {
      this.saveGeneralMetadata();
      this.close();
      window.app.switchView('client-view', project.id);
    });

    modalOverlay.querySelector('#m-p-rev-dec').addEventListener('click', () => {
      if (project.revisionRound > 0) {
        const val = project.revisionRound - 1;
        this.store.updateProject(project.id, { revisionRound: val });
        this.onStateChange();
        this.render();
      }
    });

    modalOverlay.querySelector('#m-p-rev-inc').addEventListener('click', () => {
      if (project.revisionRound < project.maxRevisionRounds) {
        const val = project.revisionRound + 1;
        this.store.updateProject(project.id, { revisionRound: val });
        this.onStateChange();
        this.render();
      } else {
        this.onTriggerToast('Max revision limits reached', 'text-warning');
      }
    });

    const portToggle = modalOverlay.querySelector('#m-p-portfolio');
    const portDescWrapper = modalOverlay.querySelector('#portfolio-desc-wrapper');
    portToggle.addEventListener('change', (e) => {
      const active = e.target.checked;
      this.store.updateProject(project.id, { portfolioShowcase: active });
      if (active) {
        portDescWrapper.classList.remove('d-none');
      } else {
        portDescWrapper.classList.add('d-none');
      }
      this.onStateChange();
    });

    const portDesc = modalOverlay.querySelector('#m-p-portfolio-desc');
    portDesc.addEventListener('blur', (e) => {
      this.store.updateProject(project.id, { portfolioDescription: e.target.value.trim() });
    });

    const checklistForm = modalOverlay.querySelector('#modal-checklist-form');
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

    const deliverableForm = modalOverlay.querySelector('#modal-deliverable-form');
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

    const invoiceBtn = modalOverlay.querySelector('#m-btn-invoice-add');
    invoiceBtn.addEventListener('click', () => {
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

    const deleteBtn = modalOverlay.querySelector('#m-btn-delete');
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Remove "${project.title}"?`)) {
        this.store.deleteProject(project.id);
        this.onTriggerToast('Project successfully removed');
        this.onStateChange();
        this.close();
      }
    });
  }

  saveGeneralMetadata() {
    const overlay = document.getElementById('project-detail-overlay');
    if (!overlay) return;

    const titleVal = overlay.querySelector('#m-p-title').value.trim();
    const descVal = overlay.querySelector('#m-p-desc').value.trim();
    const budgetVal = Number(overlay.querySelector('#m-p-budget').value) || 0;
    const dueVal = overlay.querySelector('#m-p-due').value;
    const priorityVal = overlay.querySelector('#m-p-priority').value;
    const payStatusVal = overlay.querySelector('#m-p-payment-status').value;
    const nextActionVal = overlay.querySelector('#m-p-next-action').value.trim();
    const internalVal = overlay.querySelector('#m-p-internal-notes').value.trim();
    const revNotesVal = overlay.querySelector('#m-p-rev-notes').value.trim();
    
    const briefVal = overlay.querySelector('#m-p-brief-url').value.trim();
    const rawVal = overlay.querySelector('#m-p-raw-url').value.trim();
    const draftVal = overlay.querySelector('#m-p-draft-url').value.trim();
    const finalVal = overlay.querySelector('#m-p-final-url').value.trim();
    const refVal = overlay.querySelector('#m-p-ref-url').value.trim();

    const meetPlatform = overlay.querySelector('#m-p-meet-platform').value;
    const meetLink = overlay.querySelector('#m-p-meet-link').value.trim();
    const meetNotes = overlay.querySelector('#m-p-meet-notes').value.trim();

    const dpPct = Number(overlay.querySelector('#m-p-dp-percent').value) || 0;
    const mileAmt = Number(overlay.querySelector('#m-p-mile-amount').value) || 0;
    const dpAmt = Math.round(budgetVal * (dpPct / 100));
    const finalAmt = budgetVal - dpAmt - mileAmt;
    const remainingVal = budgetVal - dpAmt;
    const payMethodVal = overlay.querySelector('#m-p-pay-method').value;

    const updates = {
      title: titleVal,
      description: descVal,
      budget: budgetVal,
      dueDate: dueVal,
      priority: priorityVal,
      paymentStatus: payStatusVal,
      nextAction: nextActionVal,
      internalNotes: internalVal,
      revisionNotes: revNotesVal,
      briefLink: briefVal,
      rawFileLink: rawVal,
      draftFileLink: draftVal,
      finalDeliveryLink: finalVal,
      referenceFolderLink: refVal,
      meetingPlatform: meetPlatform,
      meetingLink: meetLink,
      meetingNotes: meetNotes,
      downPaymentPercent: dpPct,
      downPaymentAmount: dpAmt,
      milestonePaymentAmount: mileAmt,
      finalPaymentAmount: finalAmt,
      remainingBalance: remainingVal,
      paymentMethod: payMethodVal
    };

    const showcase = overlay.querySelector('#m-p-portfolio');
    if (showcase && !showcase.disabled) {
      updates.portfolioShowcase = showcase.checked;
      updates.portfolioDescription = overlay.querySelector('#m-p-portfolio-desc').value.trim();
    }

    this.store.updateProject(this.activeProjectId, updates);
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
}
