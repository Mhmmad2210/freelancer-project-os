/* ==========================================================================
   FREELANCER PROJECT OS - CLIENT VIEW PREVIEW PORTAL
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate } from '../utils.js';

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
    this.selectedProjectId = '';
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const state = this.store.getState();
    const projects = state.projects || [];

    // Fallback: If no project is selected yet, choose the first one
    if (!this.selectedProjectId && projects.length > 0) {
      this.selectedProjectId = projects[0].id;
    }

    const activeProject = projects.find(p => p.id === this.selectedProjectId);

    const viewEl = document.createElement('div');
    viewEl.className = 'client-portal-viewport';
    viewEl.style.padding = '10px 0';

    // Renders Selector at the top so freelancers can toggle previews
    const selectorBox = document.createElement('div');
    selectorBox.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 12px 20px; border-radius: var(--border-radius-md); display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;';
    
    const projectOptions = projects.map(p => `<option value="${p.id}" ${p.id === this.selectedProjectId ? 'selected' : ''}>${p.title} (${p.clientName})</option>`).join('');

    selectorBox.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
          ${getIcon('alert', 'text-warning', 14)} Freelancer Preview Mode:
        </span>
        <select class="form-control" id="portal-project-select" style="width: 260px; padding: 6px 12px; font-size: 0.82rem; background: var(--card-bg); border-color: rgba(255,255,255,0.1);">
          ${projects.length > 0 ? projectOptions : '<option value="">-- No Active Projects --</option>'}
        </select>
      </div>
      <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
        Showing client-facing view mockup for project deliverables.
      </div>
    `;

    if (projects.length > 0) {
      selectorBox.querySelector('#portal-project-select').addEventListener('change', (e) => {
        this.selectedProjectId = e.target.value;
        this.render();
      });
    }

    viewEl.appendChild(selectorBox);

    if (!activeProject) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state-box';
      emptyState.innerHTML = `
        ${getIcon('briefcase', '', 48)}
        <h3>No projects found</h3>
        <p>Please create or convert a project in your main workspace board first to preview the client workspace portal.</p>
      `;
      viewEl.appendChild(emptyState);
      this.container.appendChild(viewEl);
      return;
    }

    // Portal Main Body
    const portalBody = document.createElement('div');
    portalBody.style.display = 'flex';
    portalBody.style.flexDirection = 'column';
    portalBody.style.gap = '24px';

    // 1. Portal Heading & Header card
    const portalHeader = document.createElement('div');
    portalHeader.style.cssText = 'background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-lg); padding: 24px; position: relative; overflow: hidden;';
    
    // Status Badge mappings
    let statusClass = 'status-completed';
    let statusLabel = 'In Progress';
    if (activeProject.stage === 'new_lead') { statusClass = 'status-lead'; statusLabel = 'New Lead'; }
    if (activeProject.stage === 'proposal_sent') { statusClass = 'status-active'; statusLabel = 'Proposal Sent'; }
    if (activeProject.stage === 'in_progress') { statusClass = 'status-completed'; statusLabel = 'In Progress'; }
    if (activeProject.stage === 'client_review') { statusClass = 'status-active'; statusLabel = 'Ready for client review'; }
    if (activeProject.stage === 'revision') { statusClass = 'status-lead text-danger'; statusLabel = 'Revision in progress'; }
    if (activeProject.stage === 'invoice_sent') { statusClass = 'status-active'; statusLabel = 'Invoice Sent'; }
    if (activeProject.stage === 'waiting_payment') { statusClass = 'status-lead text-danger'; statusLabel = 'Waiting payment'; }
    if (activeProject.stage === 'completed') { statusClass = 'status-completed'; statusLabel = 'Completed'; }

    portalHeader.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-secondary); font-weight: 700;">Client Workspace Portal</span>
          <h2 style="font-size: 1.6rem; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${activeProject.title}</h2>
          <span class="stat-subtext" style="font-size: 0.85rem; margin-top: 2px; display: block;">Prepared for: <strong>${activeProject.clientName}</strong></span>
        </div>
        <span class="client-status-badge ${statusClass}" style="font-size: 0.82rem; padding: 4px 12px; border-radius: 99px;">${statusLabel}</span>
      </div>
      
      <div style="display: flex; gap: 24px; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 16px; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">Project Status</span>
          <span class="client-status-badge ${statusClass}" style="font-size: 0.82rem; padding: 4px 12px; border-radius: 99px; display: inline-block; margin-top: 4px;">${statusLabel}</span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">Deadline</span>
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; margin-top: 6px;">
            ${getIcon('clock', 'text-muted', 13)} ${formatDate(activeProject.dueDate)}
          </span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">Payment Status</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: flex; flex-direction: column; gap: 2px; margin-top: 6px;">
            ${(() => {
              if (!activeProject.paymentStatus || activeProject.paymentStatus === 'None' || activeProject.paymentStatus === 'Not invoiced') {
                return 'No payment recorded yet';
              }
              if (activeProject.paymentStatus === 'DP paid') {
                return `<span>DP paid: ${formatCurrency(activeProject.downPaymentAmount)}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">Remaining balance: ${formatCurrency(activeProject.remainingBalance)}</span>`;
              }
              return activeProject.paymentStatus;
            })()}
          </span>
        </div>
        ${activeProject.nextAction ? `
          <div style="flex: 1; min-width: 200px;">
            <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">Next Action</span>
            <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-primary); display: block; margin-top: 6px;">
              ${activeProject.nextAction}
            </span>
          </div>
        ` : ''}
      </div>
    `;
    portalBody.appendChild(portalHeader);

    // 2. Timeline Progress Indicator
    const timelineBox = document.createElement('div');
    timelineBox.className = 'focus-module-box';
    
    const steps = [
      { id: 'new_lead', label: 'Lead Setup' },
      { id: 'proposal_sent', label: 'Proposal' },
      { id: 'in_progress', label: 'Development' },
      { id: 'client_review', label: 'Client Feedback' },
      { id: 'revision', label: 'Revisions' },
      { id: 'invoice_sent', label: 'Billed' },
      { id: 'waiting_payment', label: 'Pending Transfer' },
      { id: 'completed', label: 'Completed' }
    ];

    let activeStepIdx = steps.findIndex(x => x.id === activeProject.stage);
    if (activeStepIdx === -1) activeStepIdx = 2; // default in progress

    let stepsHtml = steps.map((s, idx) => {
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
          <span style="font-size: 0.65rem; font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? 'var(--color-secondary)' : (isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)')}; margin-top: 6px;">${s.label}</span>
        </div>
      `;
    }).join('');

    timelineBox.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 20px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('layers', '', 14)} Service Delivery Workflow Status
      </h3>
      <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; overflow-x: auto; padding: 8px 0;">
        <div style="position: absolute; top: 14px; left: 6%; right: 6%; height: 2px; background: rgba(255,255,255,0.03); z-index: 1;"></div>
        <div style="position: absolute; top: 14px; left: 6%; width: ${((activeStepIdx) / (steps.length - 1)) * 88}%; height: 2px; background: var(--color-secondary); z-index: 1;"></div>
        ${stepsHtml}
      </div>
    `;
    portalBody.appendChild(timelineBox);

    // 3. Horizontal layout: Left panel (Deliverables, Meetings), Right panel (Payment terms, Quotations)
    const columnsGrid = document.createElement('div');
    columnsGrid.style.cssText = 'display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;';
    
    // Media Query style hack for responsive grid
    const checkViewport = () => {
      if (window.innerWidth <= 840) {
        columnsGrid.style.gridTemplateColumns = '1fr';
      } else {
        columnsGrid.style.gridTemplateColumns = '1.2fr 1fr';
      }
    };
    window.addEventListener('resize', checkViewport);
    setTimeout(checkViewport, 50);

    // LEFT COLUMN
    const colLeft = document.createElement('div');
    colLeft.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';

    // A. File Delivery links
    const fileBox = document.createElement('div');
    fileBox.className = 'focus-module-box';
    
    const linksList = [
      { key: 'briefLink', label: 'Creative / Tech Brief File', icon: 'briefcase', desc: 'Project specs, requirements description mapping' },
      { key: 'rawFileLink', label: 'Source File Folder (Raw)', icon: 'folder', desc: 'Vector designs, raw code, high-res catalog clips' },
      { key: 'draftFileLink', label: 'Staging Sandbox / Draft V1', icon: 'edit', desc: 'Mockups staging URL, draft copy PDF, edit link' },
      { key: 'finalDeliveryLink', label: 'Final Master Delivery', icon: 'checkSquare', desc: 'Final approved vectors, deployed codebase package' },
      { key: 'referenceFolderLink', label: 'Reference Assets Box', icon: 'layers', desc: 'Client logos, visual guides, custom scripts' }
    ];

    const filesHtml = linksList.map(lnk => {
      const url = activeProject[lnk.key];
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: var(--border-radius-md); gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: ${url ? 'var(--color-secondary)' : 'var(--text-muted)'};">
              ${getIcon(lnk.icon, '', 14)}
            </div>
            <div>
              <span style="font-size: 0.8rem; font-weight: 600; color: ${url ? 'var(--text-primary)' : 'var(--text-muted)'}; display: block;">${lnk.label}</span>
              <span style="font-size: 0.68rem; color: var(--text-muted); display: block; margin-top: 1px;">${lnk.desc}</span>
            </div>
          </div>
          ${url ? `
            <a href="${url}" target="_blank" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; border-radius: 4px;">
              ${getIcon('externalLink', '', 12)} Access File
            </a>
          ` : `
            <span style="font-size: 0.68rem; color: var(--text-muted); font-style: italic; background: rgba(255,255,255,0.01); padding: 4px 8px; border-radius: 4px; border: 1px dashed rgba(255,255,255,0.05);">
              ${lnk.key === 'finalDeliveryLink' ? 'No final file delivered yet' : 'Pending delivery'}
            </span>
          `}
        </div>
      `;
    }).join('');

    fileBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        ${getIcon('folder', 'text-success', 16)} File Deliverables
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${filesHtml}
      </div>
    `;
    colLeft.appendChild(fileBox);

    // B. Meetings Room
    const meetBox = document.createElement('div');
    meetBox.className = 'focus-module-box';
    meetBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        ${getIcon('clock', 'text-warning', 16)} Meeting Link
      </h3>
      ${activeProject.meetingLink ? `
        <div style="display: flex; gap: 14px; align-items: flex-start; background: rgba(139, 92, 246, 0.03); border: 1px solid rgba(139, 92, 246, 0.15); padding: 14px; border-radius: var(--border-radius-md);">
          <div style="background: rgba(139, 92, 246, 0.1); padding: 10px; border-radius: 8px; color: #a78bfa; display: flex; align-items: center; justify-content: center;">
            ${getIcon('clock', '', 18)}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${activeProject.meetingPlatform || 'Google Meet'} Room</span>
              <span class="client-status-badge status-active" style="font-size: 0.6rem; padding: 1px 6px;">Room Active</span>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">
              <strong>Notes:</strong> ${activeProject.meetingNotes || 'Click below to enter the live call. Session notes or links are prepared.'}
            </p>
            <a href="${activeProject.meetingLink}" target="_blank" class="btn btn-primary" style="margin-top: 10px; padding: 6px 12px; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px; border-radius: 4px;">
              ${getIcon('externalLink', '', 12)} Enter Call Room
            </a>
          </div>
        </div>
      ` : `
        <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: var(--border-radius-md);">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No meeting link added yet</span>
        </div>
      `}
    `;
    colLeft.appendChild(meetBox);
    columnsGrid.appendChild(colLeft);

    // RIGHT COLUMN
    const colRight = document.createElement('div');
    colRight.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';

    // C. Payment Outline terms grid
    const payBox = document.createElement('div');
    payBox.className = 'focus-module-box';

    const dpPercentage = activeProject.downPaymentPercent || 50;
    const dpVal = activeProject.downPaymentAmount || 0;
    const mileVal = activeProject.milestonePaymentAmount || 0;
    const finalVal = activeProject.finalPaymentAmount || 0;
    const balance = activeProject.remainingBalance || 0;

    payBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        ${getIcon('layers', 'text-success', 16)} Payment Terms
      </h3>
      
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 12px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.02); padding-bottom: 8px;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary); display: block;">Initiation Deposit (${dpPercentage}%)</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px;">Paid prior to beginning project kickoff</span>
          </div>
          <span style="font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--color-secondary); font-size: 0.9rem;">${formatCurrency(dpVal)}</span>
        </div>

        ${mileVal > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.02); padding-bottom: 8px;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary); display: block;">Milestone Stage Payment</span>
              <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px;">Upon wireframe mockup feedback approvals</span>
            </div>
            <span style="font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--color-secondary); font-size: 0.9rem;">${formatCurrency(mileVal)}</span>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.02); padding-bottom: 8px;">
          <div>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-primary); display: block;">Final Completion Payment</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px;">Transferred upon full code deployment handover</span>
          </div>
          <span style="font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--color-secondary); font-size: 0.9rem;">${formatCurrency(finalVal)}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
          <div>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); display: block;">Total Project Payout (IDR)</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px;">Payment Method: <strong>${activeProject.paymentMethod || 'Bank Transfer'}</strong></span>
          </div>
          <span style="font-weight: 800; font-family: 'Space Grotesk', sans-serif; color: var(--color-primary); font-size: 1.05rem;">${formatCurrency(activeProject.budget)}</span>
        </div>

        <div style="background: rgba(239, 68, 68, 0.02); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 6px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span style="font-size: 0.72rem; color: var(--color-danger); font-weight: 600;">Outstanding Remaining Balance:</span>
          <span style="font-weight: 700; color: var(--color-danger); font-size: 0.85rem; font-family: 'Space Grotesk', sans-serif;">${formatCurrency(balance)}</span>
        </div>

        ${(!activeProject.paymentStatus || activeProject.paymentStatus === 'None') ? `
          <div style="text-align: center; padding: 6px; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.03); border-radius: 4px; font-size: 0.7rem; color: var(--text-muted); font-style: italic;">
            No payment recorded yet
          </div>
        ` : ''}

      </div>
    `;
    colRight.appendChild(payBox);

    // D. Financials Invoices & Estimates list
    const finBox = document.createElement('div');
    finBox.className = 'focus-module-box';

    const projInvoices = activeProject.invoices || [];

    const invoicesListHtml = projInvoices.map(inv => {
      let statusBadge = 'status-completed';
      if (inv.status === 'Sent') statusBadge = 'status-active';
      if (inv.status === 'Paid') statusBadge = 'status-active text-success';
      if (inv.status === 'Overdue') statusBadge = 'status-lead text-danger';

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 8px 12px; border-radius: 6px;">
          <div>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block;">${inv.invoiceNumber}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px;">Due date: ${formatDate(inv.dueDate)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-weight: 700; font-size: 0.82rem; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif;">${formatCurrency(inv.amount, inv.currency)}</span>
            <span class="client-status-badge ${statusBadge}" style="font-size: 0.6rem; padding: 1px 5px;">${inv.status}</span>
          </div>
        </div>
      `;
    }).join('');

    finBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
        ${getIcon('fileText', 'text-success', 16)} Billing Invoices list
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${projInvoices.length > 0 ? invoicesListHtml : '<span style="font-size: 0.75rem; color: var(--text-muted); text-align: center; display: block; padding: 16px 0; border: 1px dashed rgba(255,255,255,0.03); border-radius: 6px;">No invoice created yet</span>'}
      </div>
    `;
    colRight.appendChild(finBox);
    columnsGrid.appendChild(colRight);

    portalBody.appendChild(columnsGrid);
    viewEl.appendChild(portalBody);
    this.container.appendChild(viewEl);
  }
}
