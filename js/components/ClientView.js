/* ==========================================================================
   FREELANCER PROJECT OS - CLIENT WORKSPACE PORTAL V1 (CLIENT VIEW PREVIEW)
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatMoney, formatDate, getDeliveryLabels } from '../utils.js';
import { promptTemplates, copyPromptToClipboard } from './AIPromptHelpers.js';
import { t, getLanguage } from '../i18n.js';

export class ClientProjectView {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - Unified data store reference
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onTriggerToast = onTriggerToast;
    this.selectedClientId = '';
    this.selectedProjectId = '';
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const state = this.store.getState();
    const clients = state.clients || [];
    const projects = state.projects || [];

    // Align client selection with project selection if project is set
    if (this.selectedProjectId) {
      const proj = projects.find(p => p.id === this.selectedProjectId);
      if (proj && proj.clientId) {
        this.selectedClientId = proj.clientId;
      }
    }

    // Fallbacks and initial selection rules:
    // If no client selected, default to the first client with active projects, or the first client
    if (!this.selectedClientId && clients.length > 0) {
      const clientWithProjects = clients.find(c => projects.some(p => p.clientId === c.id));
      this.selectedClientId = clientWithProjects ? clientWithProjects.id : clients[0].id;
    }

    // Filter projects for the selected client
    const filteredProjects = projects.filter(p => p.clientId === this.selectedClientId);
    const activeClient = clients.find(c => c.id === this.selectedClientId);
    const clientMemory = activeClient ? activeClient.clientMemory : null;

    // If no project selected, default to the first filtered project
    if (!this.selectedProjectId && filteredProjects.length > 0) {
      this.selectedProjectId = filteredProjects[0].id;
    }

    // Find the currently selected project
    const activeProject = filteredProjects.find(p => p.id === this.selectedProjectId);

    const viewEl = document.createElement('div');
    viewEl.className = 'client-portal-viewport';
    viewEl.style.padding = '10px 0';

    // Renders Client and Project Selectors at the top
    const selectorBox = document.createElement('div');
    selectorBox.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 16px 20px; border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;';
    
    const clientOptions = [
      `<option value="">-- ${t('projectModal.noClientSelected', 'Select Client')} --</option>`,
      ...clients.map(c => `<option value="${c.id}" ${c.id === this.selectedClientId ? 'selected' : ''}>${c.name} ${c.businessName ? `(${c.businessName})` : ''}</option>`)
    ].join('');

    const projectOptions = [
      `<option value="">-- ${t('clientView.selectProject', 'Select Project')} --</option>`,
      ...filteredProjects.map(p => `<option value="${p.id}" ${p.id === this.selectedProjectId ? 'selected' : ''}>${p.title}</option>`)
    ].join('');

    selectorBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-warning); letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            ${getIcon('alert', 'text-warning', 14)} ${t('clientView.freelancerPreviewMode', 'Freelancer Preview Mode')}:
          </span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
          ${t('clientView.previewModeDesc', 'Preview how your client will see project status, submitted work, revision notes, approval state, invoice status, and final delivery.')}
        </div>
      </div>
      
      <div style="display: flex; gap: 16px; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px;">
        <div class="form-group" style="margin-bottom: 0; min-width: 220px; flex: 1;">
          <label style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('clientView.selectClient', 'Select Client')}</label>
          <select class="form-control" id="portal-client-select" style="width: 100%; padding: 6px 12px; font-size: 0.82rem; background: var(--card-bg); border-color: rgba(255,255,255,0.1);">
            ${clientOptions}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0; min-width: 220px; flex: 1;">
          <label style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('clientView.selectProject', 'Select Project')}</label>
          <select class="form-control" id="portal-project-select" style="width: 100%; padding: 6px 12px; font-size: 0.82rem; background: var(--card-bg); border-color: rgba(255,255,255,0.1);">
            ${projectOptions}
          </select>
        </div>
      </div>
      
      <!-- Freelancer Update Generator Card -->
      ${activeProject ? `
        <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 8px; padding: 12px; margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.78rem; color: #a78bfa; display: flex; align-items: center; gap: 6px;">
              📢 ${t('clientView.freelancerPreviewMode', 'Freelancer Tool')}: ${t('clientView.copyUpdate', 'Client Update Message')}
            </strong>
          </div>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">
            ${t('aiPrompts.subtitle', 'Generate and copy a professional status message for your client based on the current project progress.')}
          </p>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button type="button" class="btn btn-secondary btn-xs" id="btn-portal-copy-update" style="font-size: 0.72rem; padding: 4px 10px;">
              ${getIcon('copy', '', 12)} ${t('clientView.copyUpdate', 'Copy Client Update')}
            </button>
            <span id="portal-update-status" style="font-size: 0.7rem; color: var(--color-success); display: none;">${t('toast.itemCopied', 'Copied!').replace('{item}', '')}</span>
          </div>
        </div>
      ` : ''}
    `;

    // Listeners for selection changes
    selectorBox.querySelector('#portal-client-select').addEventListener('change', (e) => {
      this.selectedClientId = e.target.value;
      this.selectedProjectId = ''; // reset project when client changes
      this.render();
    });

    selectorBox.querySelector('#portal-project-select').addEventListener('change', (e) => {
      this.selectedProjectId = e.target.value;
      this.render();
    });

    // Click listener for copy update button
    const copyUpdateBtn = selectorBox.querySelector('#btn-portal-copy-update');
    if (copyUpdateBtn && activeProject) {
      copyUpdateBtn.addEventListener('click', () => {
        const flProfile = state.freelancerProfile;
        const toneVal = (clientMemory && clientMemory.tonePreference) || 'Professional';
        const targetLang = getLanguage();
        const safeMemory = clientMemory ? {
          ...clientMemory,
          clientRiskNotes: "",
          importantNotes: "",
          lastMeetingSummary: "",
          paymentBehavior: "",
          paymentReminderStyle: "",
          relationshipStatus: ""
        } : null;
        const text = promptTemplates.clientUpdate.generate(activeProject, safeMemory, toneVal, flProfile, targetLang);
        
        copyPromptToClipboard(text, null, 'clientUpdate', activeProject.id);
        
        const statusSpan = selectorBox.querySelector('#portal-update-status');
        if (statusSpan) {
          statusSpan.style.display = 'inline';
          setTimeout(() => {
            statusSpan.style.display = 'none';
          }, 2000);
        }
        this.onTriggerToast(t('toast.messageCopied', "Client update message copied."), "text-success");
      });
    }

    viewEl.appendChild(selectorBox);

    // Empty State Check: No Clients Exist
    if (clients.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state-box';
      emptyState.innerHTML = `
        ${getIcon('briefcase', '', 48)}
        <h3>${t('clientHub.noClientsTitle', 'No clients found')}</h3>
        <p>${t('clientView.emptyStateDesc', 'Add a client or create a project first to preview the client workspace.')}</p>
      `;
      viewEl.appendChild(emptyState);
      this.container.appendChild(viewEl);
      return;
    }

    // Empty State Check: Client or Project selector is empty/none selected
    if (!this.selectedClientId || !this.selectedProjectId || !activeProject) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state-box';
      emptyState.innerHTML = `
        ${getIcon('briefcase', '', 48)}
        <h3>${t('clientView.emptyStateTitle', 'No project selected yet.')}</h3>
        <p>${t('clientView.emptyStateDesc', 'Please select a client and project from the preview filter toolbar at the top.')}</p>
      `;
      viewEl.appendChild(emptyState);
      this.container.appendChild(viewEl);
      return;
    }

    // Mappings and Client Friendly Translators
    const stageLabels = {
      new_lead: t('kanban.stages.new_lead', 'New Lead'),
      proposal_sent: t('kanban.stages.proposal_sent', 'Queue'),
      in_progress: t('kanban.stages.in_progress', 'In Progress'),
      client_review: t('kanban.stages.client_review', 'Client Review'),
      revision: t('kanban.stages.revision', 'Revision'),
      invoice_sent: t('kanban.stages.invoice_sent', 'Invoice Sent'),
      waiting_payment: t('kanban.stages.waiting_payment', 'Waiting Payment'),
      completed: t('kanban.stages.completed', 'Completed'),
      on_hold: t('kanban.stages.on_hold', 'On Hold')
    };

    const isIndo = getLanguage() === 'id';

    const priorityLabels = {
      High: t('priority.high', 'High') + ' ' + (isIndo ? 'Prioritas' : 'Priority'),
      Medium: (isIndo ? 'Prioritas Standar' : 'Standard Priority'),
      Low: t('priority.low', 'Low') + ' ' + (isIndo ? 'Prioritas' : 'Priority'),
      Urgent: t('priority.urgent', 'Urgent') + ' ' + (isIndo ? 'Prioritas' : 'Priority')
    };

    const approvalLabels = {
      'Pending Review': t('status.approval.pending_review', 'Waiting for client review.'),
      'Approved': t('status.approval.approved', 'Project has been approved.'),
      'Needs Revision': t('status.approval.needs_revision', 'Revision requested.'),
      'Not Submitted Yet': t('status.approval.not_submitted', 'Work has not been submitted for review yet.')
    };

    const paymentStatusLabels = {
      'None': t('clientView.noInvoiceSent', 'No invoice has been sent yet.'),
      'Not invoiced': t('clientView.noInvoiceSent', 'No invoice has been sent yet.'),
      'Invoice Sent': t('status.invoice.sent', 'Invoice Sent'),
      'Waiting Payment': t('status.payment.waiting_payment', 'Waiting Payment'),
      'Payment Received': t('status.payment.payment_received', 'Payment Received'),
      'Overdue': t('status.payment.overdue', 'Overdue'),
      'Cancelled': t('status.payment.cancelled', 'Cancelled'),
      'DP paid': t('status.payment.dp_paid', 'Deposit Paid')
    };

    // Client-facing stage mapping styles
    let statusClass = 'status-completed';
    if (activeProject.stage === 'new_lead') statusClass = 'status-lead';
    if (activeProject.stage === 'proposal_sent') statusClass = 'status-active';
    if (activeProject.stage === 'in_progress') statusClass = 'status-completed';
    if (activeProject.stage === 'client_review') statusClass = 'status-active';
    if (activeProject.stage === 'revision') statusClass = 'status-lead text-danger';
    if (activeProject.stage === 'invoice_sent') statusClass = 'status-active';
    if (activeProject.stage === 'waiting_payment') statusClass = 'status-lead text-danger';
    if (activeProject.stage === 'completed') statusClass = 'status-completed';
    if (activeProject.stage === 'on_hold') statusClass = 'status-lead text-danger';

    // Main Columns Grid Layout
    const columnsGrid = document.createElement('div');
    columnsGrid.style.cssText = 'display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px;';

    // Responsive behavior
    const checkViewport = () => {
      if (window.innerWidth <= 840) {
        columnsGrid.style.gridTemplateColumns = '1fr';
      } else {
        columnsGrid.style.gridTemplateColumns = '1.6fr 1fr';
      }
    };
    window.addEventListener('resize', checkViewport);
    setTimeout(checkViewport, 50);

    // ==========================================
    // LEFT COLUMN (Main Client Workspace Summary)
    // ==========================================
    const colLeft = document.createElement('div');
    colLeft.style.cssText = 'display: flex; flex-direction: column; gap: 24px;';

    // A. Project Status Overview Card
    const overviewCard = document.createElement('div');
    overviewCard.className = 'focus-module-box';
    overviewCard.style.padding = '24px';
    
    const pClientCleanName = activeProject.clientName ? activeProject.clientName.split('(')[0].trim() : 'Client';
    const pStageFriendly = stageLabels[activeProject.stage] || activeProject.stage;
    const pPriorityFriendly = priorityLabels[activeProject.priority] || activeProject.priority || 'Standard';
    const pApprovalFriendly = approvalLabels[activeProject.approvalStatus] || 'Pending Review';

    overviewCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
        <div>
          <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-secondary); font-weight: 700;">${t('sidebar.clientHub', 'Client Workspace Portal')}</span>
          <h2 style="font-size: 1.5rem; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: var(--text-primary); margin: 6px 0 2px 0;">${activeProject.title}</h2>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">${t('projectModal.client', 'Client')}: <strong>${pClientCleanName}</strong></span>
        </div>
        <span class="client-status-badge ${statusClass}" style="font-size: 0.8rem; padding: 4px 12px; border-radius: 99px;">${pStageFriendly}</span>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px;">
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${t('projectModal.stage', 'Stage')}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px;">${pStageFriendly}</span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${t('projectModal.deadline', 'Deadline')}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            ${getIcon('clock', 'text-muted', 13)} ${formatDate(activeProject.dueDate)}
          </span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${t('projectModal.priority', 'Priority')}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px;">${pPriorityFriendly}</span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${t('projectModal.clientApprovalStatus', 'Approval Status')}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px;">${activeProject.approvalStatus || 'Pending Review'}</span>
        </div>
      </div>

      ${activeProject.nextAction ? `
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.04);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${t('projectModal.nextAction', 'Next Action')}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-primary); display: block; margin-top: 4px;">
            ${activeProject.nextAction}
          </span>
        </div>
      ` : ''}

      ${activeProject.clientVisibleNotes ? `
        <div style="margin-top: 16px; padding: 12px; background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.1); border-radius: var(--border-radius-md); font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary);">
          <strong style="color: var(--text-primary); display: block; margin-bottom: 4px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">${t('projectModal.clientVisibleNotes', 'Message from Freelancer:')}</strong>
          ${activeProject.clientVisibleNotes}
        </div>
      ` : ''}
    `;
    colLeft.appendChild(overviewCard);

    // B. Client-to-Paid Timeline Card
    const timelineCard = document.createElement('div');
    timelineCard.className = 'focus-module-box';
    timelineCard.style.padding = '20px';

    const stages = [
      { id: 'new_lead', label: t('kanban.stages.new_lead', 'New Lead') },
      { id: 'proposal_sent', label: t('kanban.stages.proposal_sent', 'Queue') },
      { id: 'in_progress', label: t('kanban.stages.in_progress', 'In Progress') },
      { id: 'client_review', label: t('kanban.stages.client_review', 'Client Review') },
      { id: 'revision', label: t('kanban.stages.revision', 'Revision') },
      { id: 'invoice_sent', label: t('kanban.stages.invoice_sent', 'Invoice Sent') },
      { id: 'waiting_payment', label: t('kanban.stages.waiting_payment', 'Waiting Payment') },
      { id: 'completed', label: t('kanban.stages.completed', 'Completed') }
    ];

    let activeStepIdx = stages.findIndex(x => x.id === activeProject.stage);
    if (activeProject.stage === 'on_hold') {
      // Find where it was or keep default in progress for indicator
      activeStepIdx = 2;
    }

    const stepsHtml = stages.map((s, idx) => {
      const isCompleted = idx < activeStepIdx;
      const isActive = idx === activeStepIdx;
      
      let indicatorClass = 'timeline-dot-pending';
      if (isCompleted) indicatorClass = 'timeline-dot-completed';
      if (isActive) indicatorClass = 'timeline-dot-active';

      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; min-width: 80px; text-align: center;">
          <div class="timeline-dot ${indicatorClass}" style="width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2;">
            ${isCompleted ? getIcon('check', '', 8) : ''}
          </div>
          <span style="font-size: 0.65rem; font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? 'var(--color-secondary)' : (isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)')}; margin-top: 6px; display: block; white-space: nowrap;">${s.label}</span>
        </div>
      `;
    }).join('');

    timelineCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 20px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('layers', '', 14)} ${t('clientView.timeline', 'Client-to-Paid Timeline')}
      </h3>
      <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; overflow-x: auto; padding: 8px 0; gap: 8px;">
        <div style="position: absolute; top: 14px; left: 6%; right: 6%; height: 2px; background: rgba(255,255,255,0.03); z-index: 1;"></div>
        <div style="position: absolute; top: 14px; left: 6%; width: ${((activeStepIdx) / (stages.length - 1)) * 88}%; height: 2px; background: var(--color-secondary); z-index: 1;"></div>
        ${stepsHtml}
      </div>

      ${activeProject.stage === 'on_hold' ? `
        <div style="margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; display: flex; align-items: flex-start; gap: 10px;">
          <span class="client-status-badge status-lead text-danger" style="font-weight: 700; padding: 2px 8px; border-radius: 4px;">${t('kanban.stages.on_hold', 'On Hold')}</span>
          <p style="font-size: 0.78rem; color: var(--text-primary); margin: 0; line-height: 1.4;">
            ${t('clientView.onHoldDesc', 'This project is currently paused. Your freelancer will follow up when it is ready to continue.')}
          </p>
        </div>
      ` : ''}
    `;
    colLeft.appendChild(timelineCard);

    // C. Submitted Work Card
    const submittedWorkCard = document.createElement('div');
    submittedWorkCard.className = 'focus-module-box';
    submittedWorkCard.style.padding = '20px';

    const customLabels = getDeliveryLabels(activeProject.templateRole);
    const candidateLinks = [
      { key: 'previewLink', label: customLabels.preview },
      { key: 'draftLink', label: 'Draft Link' },
      { key: 'reviewLink', label: 'Review Link' },
      { key: 'fileFolderLink', label: 'File Folder Link' },
      { key: 'stagingLink', label: 'Staging Link' },
      { key: 'firstCutLink', label: 'First Cut Link' },
      { key: 'designPreviewLink', label: 'Design Preview Link' }
    ];

    const activeLinks = candidateLinks
      .map(lnk => ({ label: lnk.label, url: activeProject[lnk.key] }))
      .filter(x => x.url);

    let linksHtml = '';
    if (activeLinks.length === 0) {
      linksHtml = `
        <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 0.78rem; font-style: italic; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: var(--border-radius-md);">
          ${t('clientView.noSubmittedWork', 'No submitted work link added yet.')}
        </div>
      `;
    } else {
      linksHtml = activeLinks.map(lnk => `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--border-radius-md); gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(255,255,255,0.02); padding: 6px; border-radius: 6px; color: var(--color-secondary); display: flex; align-items: center; justify-content: center;">
              ${getIcon('externalLink', '', 14)}
            </div>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${lnk.label}</span>
          </div>
          <a href="${lnk.url}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; border-radius: 4px;">
            ${t('clientView.openPreview', 'Open Preview')}
          </a>
        </div>
      `).join('');
    }

    submittedWorkCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('folder', 'text-success', 14)} ${t('clientView.submittedWork', 'Submitted Work')}
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${linksHtml}
      </div>
    `;
    colLeft.appendChild(submittedWorkCard);

    // D. Feedback & Approval Card
    const feedbackApprovalCard = document.createElement('div');
    feedbackApprovalCard.className = 'focus-module-box';
    feedbackApprovalCard.style.padding = '20px';

    const revisionCount = activeProject.revisionCount !== undefined ? activeProject.revisionCount : (activeProject.revisionRound || 0);
    const maxRevision = activeProject.maxRevision !== undefined ? activeProject.maxRevision : (activeProject.maxRevisionRounds || 3);
    
    let revStatusLabel = t('clientView.waitingFeedback', 'Waiting for client feedback.');
    let revBadgeClass = 'status-active';
    if (activeProject.approvalStatus === 'Approved') {
      revStatusLabel = t('clientView.approvedByClient', 'Approved by client.');
      revBadgeClass = 'status-completed';
    } else if (activeProject.approvalStatus === 'Needs Revision' || activeProject.stage === 'revision') {
      revStatusLabel = t('clientView.revisionInProgress', 'Revision in progress.');
      revBadgeClass = 'status-lead text-danger';
    }
    if (revisionCount >= maxRevision && activeProject.approvalStatus !== 'Approved') {
      revStatusLabel = t('toast.revisionLimitReached', 'Revision limit reached.');
      revBadgeClass = 'status-lead text-danger';
    }

    const clientFeedbackText = activeProject.clientFeedbackSummary || (isIndo ? 'Belum ada umpan balik yang dicatat.' : 'No feedback recorded yet.');
    
    // Check if revision policy rule exists
    const revRuleText = activeProject.revisionRule || (activeProject.templateRole ? `Workflow Template Rules apply.` : '');

    feedbackApprovalCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('edit', 'text-warning', 14)} ${t('clientView.approvalFeedback', 'Feedback & Revision Summary')}
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">${t('projectModal.clientApprovalStatus', 'Approval Status')}</span>
          <span class="client-status-badge ${activeProject.approvalStatus === 'Approved' ? 'status-completed' : (activeProject.approvalStatus === 'Needs Revision' ? 'status-lead text-danger' : 'status-active')}" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; display: inline-block;">
            ${activeProject.approvalStatus || 'Pending Review'}
          </span>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            ${pApprovalFriendly}
          </p>
        </div>
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">${t('projectModal.revisionTracking', 'Revision Counter')}</span>
          <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif;">
            ${revisionCount} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">/ ${maxRevision} ${t('projectModal.revisions', 'rounds')}</span>
          </span>
          <span class="client-status-badge ${revBadgeClass}" style="font-size: 0.65rem; padding: 1px 6px; border-radius: 4px; margin-left: 6px; display: inline-block; vertical-align: middle;">
            ${revStatusLabel}
          </span>
          ${revRuleText ? `
            <p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 6px; line-height: 1.3; font-style: italic;">
              ${revRuleText}
            </p>
          ` : ''}
        </div>
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">${t('delivery.status', 'Delivery Status')}</span>
          <span class="client-status-badge" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; display: inline-block; background: rgba(139, 92, 246, 0.15); color: #c4b5fd;">
            ${activeProject.deliveryStatus || 'Not Submitted'}
          </span>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; line-height: 1.3;">
            ${t('clientView.currentHandoverProgress', 'Current handover progress.')}
          </p>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('delivery.clientVisibleNotes', 'Client Feedback Summary')}</span>
          <div style="font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary); white-space: pre-line;">
            ${clientFeedbackText}
          </div>
        </div>

        ${(activeProject.clientVisibleNotes || (clientMemory && clientMemory.clientVisibleNotes)) ? `
          <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
            <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('projectModal.clientVisibleNotes', 'Public Notes / Instructions')}</span>
            <div style="font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary); white-space: pre-line; display: flex; flex-direction: column; gap: 8px;">
              ${activeProject.clientVisibleNotes ? `<div>${activeProject.clientVisibleNotes}</div>` : ''}
              ${(clientMemory && clientMemory.clientVisibleNotes) ? `
                <div style="border-top: 1px dashed rgba(255,255,255,0.04); padding-top: 8px; margin-top: 4px;">
                  <strong style="font-size: 0.65rem; text-transform: uppercase; color: var(--color-secondary); display: block; margin-bottom: 4px;">${t('projectModal.clientPreference', 'Client Workspace Preferences:')}</strong>
                  ${clientMemory.clientVisibleNotes}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    colLeft.appendChild(feedbackApprovalCard);

    // Client-visible Handover Preferences Card
    // Client Memory is internal by default. Do not expose private memory fields in Client Workspace Portal.
    if (clientMemory && clientMemory.shareDeliveryPref) {
      const deliveryPrefCard = document.createElement('div');
      deliveryPrefCard.className = 'focus-module-box';
      deliveryPrefCard.style.padding = '20px';
      deliveryPrefCard.style.marginTop = '16px';
      
      deliveryPrefCard.innerHTML = `
        <h4 style="margin: 0 0 12px 0; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          ${getIcon('folder', '', 14)} ${t('clientView.handoverNotesTitle', 'Handover & Delivery Details')}
        </h4>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.78rem; color: var(--text-secondary);">
          ${clientMemory.filePreference ? `<div><strong style="color: var(--text-muted);">${t('projectModal.filePreference', 'Preferred Formats')}:</strong> ${clientMemory.filePreference}</div>` : ''}
          ${clientMemory.folderLinkMethod ? `<div><strong style="color: var(--text-muted);">${t('projectModal.deliveryPreference', 'Delivery Method')}:</strong> ${clientMemory.folderLinkMethod}</div>` : ''}
          ${clientMemory.deliveryPreference ? `<div><strong style="color: var(--text-muted);">${t('clientView.handoverNotesTitle', 'Handover Style')}:</strong> ${clientMemory.deliveryPreference}</div>` : ''}
          ${clientMemory.handoverPreference ? `<div style="border-top: 1px dashed rgba(255,255,255,0.04); padding-top: 8px; margin-top: 4px;"><strong style="color: var(--text-muted);">${t('clientView.handoverNotesTitle', 'Setup Instructions')}:</strong> ${clientMemory.handoverPreference}</div>` : ''}
        </div>
      `;
      colLeft.appendChild(deliveryPrefCard);
    }

    // E. Final Delivery Card
    const finalDeliveryCard = document.createElement('div');
    finalDeliveryCard.className = 'focus-module-box';
    finalDeliveryCard.style.padding = '20px';

    const checklistItems = (() => {
      if (activeProject.deliveryChecklist) {
        if (Array.isArray(activeProject.deliveryChecklist)) return activeProject.deliveryChecklist;
        try {
          const parsed = JSON.parse(activeProject.deliveryChecklist);
          if (Array.isArray(parsed)) return parsed;
        } catch(e) {}
          return activeProject.deliveryChecklist.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      }
      return [];
    })();

    const clientChecklist = checklistItems.filter(item => item && typeof item === 'object' && item.clientVisible === true);
    const hasFinalFiles = activeProject.finalFileLink || activeProject.finalDeliveryLink;
    const hasRawFiles = activeProject.rawFileLink;
    
    let deliveryHtml = '';
    if (!hasFinalFiles && !hasRawFiles && !activeProject.handoverNotes && clientChecklist.length === 0 && activeProject.stage !== 'completed') {
      deliveryHtml = `
        <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 0.78rem; font-style: italic; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: var(--border-radius-md);">
          ${t('clientView.noSubmittedWork', 'Final delivery has not been added yet.')}
        </div>
      `;
    } else {
      deliveryHtml = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${activeProject.stage === 'completed' ? `
            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 12px 14px; margin-bottom: 4px; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.2rem; color: var(--color-success);">🎉</span>
              <p style="font-size: 0.78rem; color: var(--text-primary); margin: 0; font-weight: 600;">
                ${t('toast.projectCompleted', 'Project completed and final files delivered.')}
              </p>
            </div>
          ` : ''}

          ${activeProject.finalFileLink || activeProject.finalDeliveryLink ? `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--border-radius-md);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem; color: var(--color-success);">💾</span>
                <div>
                  <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: block;">${customLabels.final}</span>
                  ${activeProject.deliveryDate ? `<span style="font-size: 0.65rem; color: var(--text-muted);">${t('delivery.deliveryDate', 'Delivered on')}: ${formatDate(activeProject.deliveryDate)}</span>` : ''}
                </div>
              </div>
              <a href="${activeProject.finalFileLink || activeProject.finalDeliveryLink}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.72rem; border-radius: 4px;">
                ${t('clientView.downloadMaster', 'Download Master')}
              </a>
            </div>
          ` : ''}

          ${activeProject.rawFileLink ? `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--border-radius-md);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem; color: var(--color-primary);">📦</span>
                <div>
                  <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: block;">${customLabels.raw}</span>
                </div>
              </div>
              <a href="${activeProject.rawFileLink}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.72rem; border-radius: 4px;">
                ${t('clientView.openPreview', 'Open Folder')}
              </a>
            </div>
          ` : ''}

          ${activeProject.handoverNotes ? `
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md); margin-top: 4px;">
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('clientView.handoverNotesTitle', 'Handover & Installation Notes')}</span>
              <div style="font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary); white-space: pre-line;">
                ${activeProject.handoverNotes}
              </div>
            </div>
          ` : ''}

          <div style="background: ${activeProject.clientConfirmedDelivery ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)'}; border: 1px solid ${activeProject.clientConfirmedDelivery ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-subtle)'}; padding: 14px; border-radius: var(--border-radius-md); margin-top: 4px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.1rem;">${activeProject.clientConfirmedDelivery ? '✅' : '⏳'}</span>
              <div>
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: block;">${t('clientView.clientConfirmation', 'Client Confirmation')}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">
                  ${activeProject.clientConfirmedDelivery ? t('clientView.confirmedDesc', 'Delivery has been formally accepted by the client.') : t('clientView.waitingConfirmationDesc', 'Waiting for client to confirm receipt of final deliverables.')}
                </span>
              </div>
            </div>
            <span class="client-status-badge ${activeProject.clientConfirmedDelivery ? 'status-completed' : 'status-active'}" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px;">
              ${activeProject.clientConfirmedDelivery ? t('clientView.confirmed', 'Confirmed') : t('clientView.pending', 'Pending')}
            </span>
          </div>

          ${clientChecklist.length > 0 ? `
            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md); margin-top: 4px;">
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 600;">${t('delivery.checklist', 'Delivery Checklist')}</span>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${clientChecklist.map(item => `
                  <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: ${item.completed ? 'var(--text-secondary)' : 'var(--text-muted)'};">
                    <span style="color: ${item.completed ? 'var(--color-success)' : 'var(--text-muted)'}; font-weight: 700;">
                      ${item.completed ? '✓' : '○'}
                    </span>
                    <span style="${item.completed ? 'text-decoration: line-through; opacity: 0.75;' : ''}">${item.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    finalDeliveryCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('checkSquare', 'text-success', 14)} ${t('clientView.finalDelivery', 'Final Delivery')}
      </h3>
      ${deliveryHtml}
    `;
    colLeft.appendChild(finalDeliveryCard);
    columnsGrid.appendChild(colLeft);

    // ==========================================
    // RIGHT COLUMN (Sidebar metadata & actions)
    // ==========================================
    const colRight = document.createElement('div');
    colRight.style.cssText = 'display: flex; flex-direction: column; gap: 24px;';

    // 1. Freelancer Profile Header Card
    const profile = this.store.getFreelancerProfile();
    const flName = profile.freelancerName || 'Your Name';
    const flRole = profile.freelancerRole || 'Freelancer';
    const flEmail = profile.freelancerEmail || '';
    const flLoc = profile.freelancerLocation || '';
    const flBio = profile.freelancerBio || '';
    const flPort = profile.freelancerPortfolioLink || '';
    const flInitials = profile.freelancerInitials || this.store.getInitials(flName) || 'YK';
    
    const avatarHtml = profile.freelancerAvatar ?
      `<img src="${profile.freelancerAvatar}" alt="${flName}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(255,255,255,0.1);">` :
      `<div class="user-avatar" style="width: 48px; height: 48px; border-radius: 50%; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; font-weight: 700; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); color: #fff; border: 1.5px solid rgba(255,255,255,0.1);">${flInitials}</div>`;

    const freelancerCard = document.createElement('div');
    freelancerCard.className = 'focus-module-box';
    freelancerCard.style.padding = '20px';
    freelancerCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('user', 'text-primary', 14)} ${t('profile.title', 'Freelancer Profile')}
      </h3>
      <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--border-radius-md);">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${avatarHtml}
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0;">${flName}</h4>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${flRole}</span>
          </div>
        </div>
        
        ${flBio ? `
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin: 4px 0 0 0; white-space: pre-line; font-style: italic;">"${flBio}"</p>
        ` : ''}
        
        <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px; margin-top: 4px;">
          ${flLoc ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
              <span style="font-size: 0.8rem;">📍</span> <span>${flLoc}</span>
            </div>
          ` : ''}
          ${flEmail ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
              <span style="font-size: 0.8rem;">✉️</span> <a href="mailto:${flEmail}" style="color: var(--text-secondary); text-decoration: none;">${flEmail}</a>
            </div>
          ` : ''}
          ${flPort ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
              ${getIcon('externalLink', '', 12)} <a href="${flPort}" target="_blank" style="color: var(--color-secondary); text-decoration: none; font-weight: 600;">${t('clientView.portfolioWebsite', 'Portfolio Website')}</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    colRight.appendChild(freelancerCard);

    // 2. Invoice & Payment Summary Card (Strict Money Visibility Rules applied)
    const invoicePaymentCard = document.createElement('div');
    invoicePaymentCard.className = 'focus-module-box';
    invoicePaymentCard.style.padding = '20px';

    const isPaymentStage = ['invoice_sent', 'waiting_payment', 'completed'].includes(activeProject.stage);
    
    let billingHtml = '';
    if (!isPaymentStage) {
      billingHtml = `
        <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 0.78rem; font-style: italic; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: var(--border-radius-md);">
          ${t('clientView.noInvoiceSent', 'No invoice has been sent yet.')}
        </div>
      `;
    } else {
      const invNum = activeProject.invoiceNumber || 'Pending Allocation';
      const invAmt = activeProject.invoiceAmount || activeProject.budget;
      const invDueDate = activeProject.invoiceDueDate || activeProject.dueDate;
      const invStatus = activeProject.invoiceStatus || 'Not Created';
      const payStatus = activeProject.paymentStatus || 'Not Started';
      const proofLink = activeProject.receiptLink || activeProject.paymentReceiptLink;
      
      let invStatusBadgeClass = 'status-active';
      if (invStatus === 'Paid') invStatusBadgeClass = 'status-completed';
      if (invStatus === 'Overdue') invStatusBadgeClass = 'status-lead text-danger';

      let payStatusBadgeClass = 'status-active';
      if (payStatus === 'Fully Paid' || payStatus === 'Payment Received') payStatusBadgeClass = 'status-completed';

      billingHtml = `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('invoice.status', 'Invoice Status')}</span>
            <span class="client-status-badge ${invStatusBadgeClass}" style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">
              ${invStatus}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('invoice.number', 'Invoice Number')}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif;">${invNum}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('invoice.amount', 'Invoice Amount')}</span>
            <span style="font-size: 0.95rem; font-weight: 800; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif;">${formatMoney(invAmt, activeProject.invoiceCurrency || activeProject.projectCurrency || 'IDR')}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('invoice.amountDue', 'Amount Due')}</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-danger); font-family: 'Space Grotesk', sans-serif;">${formatMoney(activeProject.amountDue !== undefined ? activeProject.amountDue : (invAmt - (activeProject.amountPaid || 0)), activeProject.invoiceCurrency || activeProject.projectCurrency || 'IDR')}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('invoice.dueDate', 'Invoice Due Date')}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">${formatDate(invDueDate)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${t('invoice.paymentStatus', 'Payment Status')}</span>
            <span class="client-status-badge ${payStatusBadgeClass}" style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">
              ${payStatus}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px;">
            ${activeProject.invoiceFileLink ? `
              <div style="text-align: right;">
                <a href="${activeProject.invoiceFileLink}" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--color-secondary); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  ${getIcon('fileText', '', 12)} ${t('clientView.openInvoice', 'Open Invoice')}
                </a>
              </div>
            ` : ''}

            ${proofLink ? `
              <div style="text-align: right;">
                <a href="${proofLink}" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--color-secondary); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  ${getIcon('fileText', '', 12)} ${t('clientView.viewPaymentProof', 'View Payment Proof')}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    invoicePaymentCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('fileText', 'text-success', 14)} ${t('clientView.invoicePayment', 'Invoice & Payment')}
      </h3>
      ${billingHtml}
    `;
    colRight.appendChild(invoicePaymentCard);

    // 3. Client Update Message Generator Card
    const messageGeneratorCard = document.createElement('div');
    messageGeneratorCard.className = 'focus-module-box';
    messageGeneratorCard.style.padding = '20px';
    
    // Generate text message:
    const clientUpdateText = (() => {
      const clientName = activeProject.clientName ? activeProject.clientName.split('(')[0].trim() : 'Client';
      const projectName = activeProject.title;
      const stageLabel = stageLabels[activeProject.stage] || activeProject.stage;
      const nextAction = activeProject.nextAction || 'None';
      const previewLink = activeProject.previewLink || activeProject.draftFileLink || activeProject.briefLink || '[Preview Link]';

      if (getLanguage() === 'id') {
        if (activeProject.stage === 'waiting_payment') {
          return `Halo ${clientName}, proyek "${projectName}" telah dikirimkan dan invoice saat ini sedang menunggu pembayaran. Harap beri tahu saya setelah pembayaran diproses.`;
        }
        if (activeProject.stage === 'completed') {
          return `Halo ${clientName}, proyek "${projectName}" telah selesai dan file akhir telah dikirimkan. Terima kasih telah bekerja sama dalam proyek ini.`;
        }
        return `Halo ${clientName}, berikut adalah perkembangan terbaru untuk "${projectName}". Proyek saat ini berada di tahap [${stageLabel}]. Langkah berikutnya saat ini: ${nextAction}. Anda dapat meninjau hasil pekerjaan yang dikirimkan di sini: ${previewLink}. Silakan beri tahu saya jika Anda memiliki masukan atau persetujuan.`;
      } else {
        if (activeProject.stage === 'waiting_payment') {
          return `Hi ${clientName}, the project "${projectName}" has been delivered and the invoice is currently waiting for payment. Please let me know once payment has been processed.`;
        }
        if (activeProject.stage === 'completed') {
          return `Hi ${clientName}, the project "${projectName}" has been completed and the final files have been delivered. Thank you for working together on this project.`;
        }
        return `Hi ${clientName}, here is the latest update for "${projectName}". The project is currently in stage [${stageLabel}]. Current next action: ${nextAction}. You can review the submitted work here: ${previewLink}. Please let me know if you have feedback or approval.`;
      }
    })();

    messageGeneratorCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('layers', 'text-warning', 14)} ${t('promptTemplates.clientUpdate.name', 'Client Update Message')}
      </h3>
      <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
        ${t('aiPrompts.subtitle', 'Generate and copy a professional status message for your client based on the current project progress.')}
      </p>
      
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--border-radius-md); font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; max-height: 100px; overflow-y: auto; margin-bottom: 14px; white-space: pre-wrap;">${clientUpdateText}</div>
      
      <button class="btn btn-primary" id="btn-copy-client-update" style="width: 100%; justify-content: center; font-size: 0.78rem;">
        ${getIcon('check', '', 14)} ${t('clientView.copyUpdate', 'Copy Client Update')}
      </button>
    `;

    messageGeneratorCard.querySelector('#btn-copy-client-update').addEventListener('click', () => {
      navigator.clipboard.writeText(clientUpdateText).then(() => {
        this.onTriggerToast(t('toast.messageCopied', 'Client update message copied.'));
      }).catch(err => {
        console.error('Failed to copy update message to clipboard: ', err);
        this.onTriggerToast(t('toast.copyFailed', 'Failed to copy to clipboard'), 'text-danger');
      });
    });

    colRight.appendChild(messageGeneratorCard);

    // 4. Project Metadata Sidebar Card
    const metadataCard = document.createElement('div');
    metadataCard.className = 'focus-module-box';
    metadataCard.style.padding = '20px';
    metadataCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('clock', '', 14)} ${t('projectModal.additionalInfo', 'Project Metadata')}
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.75rem; color: var(--text-secondary);">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.03); padding-bottom: 6px;">
          <span style="color: var(--text-muted);">${t('invoice.date', 'Date Started')}</span>
          <span style="font-weight: 600; color: var(--text-primary);">${formatDate(activeProject.createdAt || new Date())}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.03); padding-bottom: 6px;">
          <span style="color: var(--text-muted);">${t('projectModal.priority', 'Priority Target')}</span>
          <span style="font-weight: 600; color: var(--text-primary);">${pPriorityFriendly}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.03); padding-bottom: 6px;">
          <span style="color: var(--text-muted);">${t('status.approval.approved', 'Approved Date')}</span>
          <span style="font-weight: 600; color: var(--text-primary);">${activeProject.approvedAt ? formatDate(activeProject.approvedAt) : (isIndo ? 'Menunggu persetujuan' : 'Pending approval')}</span>
        </div>
        ${activeProject.templateRole ? `
          <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.03); padding-bottom: 6px;">
            <span style="color: var(--text-muted);">${t('templates.title', 'Workflow Template')}</span>
            <span style="font-weight: 600; color: var(--color-primary); text-transform: capitalize;">${activeProject.templateRole} Template</span>
          </div>
        ` : ''}
      </div>
    `;
    colRight.appendChild(metadataCard);

    columnsGrid.appendChild(colRight);
    
    // Assemble Everything in Viewport
    const portalContainer = document.createElement('div');
    portalContainer.style.display = 'flex';
    portalContainer.style.flexDirection = 'column';
    portalContainer.style.gap = '24px';
    portalContainer.appendChild(columnsGrid);

    viewEl.appendChild(portalContainer);
    this.container.appendChild(viewEl);
  }
}
