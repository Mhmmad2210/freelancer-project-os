/* ==========================================================================
   FREELANCER PROJECT OS - KANBAN BOARD VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, getDueDateStatus } from '../utils.js';

export class KanbanBoard {
  /**
   * @param {HTMLElement} container - Target content mounting box
   * @param {object} store - Unified data store reference
   * @param {function} onCardClick - Trigger detailed details modal
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onCardClick, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onCardClick = onCardClick;
    this.onTriggerToast = onTriggerToast;
    this.searchQuery = '';
    
    // Bind Drag & Drop contexts
    this.draggedCardId = null;
  }

  update() {
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = q.toLowerCase().trim();
    this.renderBoardOnly();
  }

  render() {
    this.container.innerHTML = '';

    const dashboardEl = document.createElement('div');
    dashboardEl.className = 'dashboard-viewport';

    // Renders Stats Metrics Row
    const statsEl = this.createStatsSection();
    dashboardEl.appendChild(statsEl);

    // Renders Action Control Ribbon (Search + Add)
    const controlRibbon = document.createElement('div');
    controlRibbon.className = 'grid-controls';
    
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper';
    searchWrapper.innerHTML = `
      ${getIcon('search', 'search-icon', 18)}
      <input type="text" id="board-search" placeholder="Search projects, tags, or clients..." value="${this.searchQuery}">
    `;
    const searchInput = searchWrapper.querySelector('input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderBoardOnly();
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = `${getIcon('plus', '', 18)} Add Project`;
    addBtn.addEventListener('click', () => this.showNewProjectDrawer());

    controlRibbon.appendChild(searchWrapper);
    controlRibbon.appendChild(addBtn);
    dashboardEl.appendChild(controlRibbon);

    // Scroll Hint Helper
    const scrollHint = document.createElement('div');
    scrollHint.id = 'kanban-scroll-hint';
    scrollHint.style.cssText = 'font-size: 0.72rem; color: var(--text-muted); display: none; align-items: center; gap: 6px; margin: -8px 0 12px 4px; padding: 2px 4px;';
    scrollHint.innerHTML = `
      <span style="display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 4px; color: var(--color-secondary);">
        ${getIcon('externalLink', '', 12)}
      </span>
      <span>Scroll sideways to see all workflow stages.</span>
    `;
    dashboardEl.appendChild(scrollHint);

    // Board container canvas
    const boardWrapper = document.createElement('div');
    boardWrapper.className = 'kanban-container';
    boardWrapper.id = 'kanban-board-canvas';
    dashboardEl.appendChild(boardWrapper);

    this.container.appendChild(dashboardEl);
    
    // Check overflow on resize
    window.addEventListener('resize', () => {
      const hint = document.getElementById('kanban-scroll-hint');
      const canvas = document.getElementById('kanban-board-canvas');
      if (hint && canvas) {
        if (canvas.scrollWidth > canvas.clientWidth) {
          hint.style.display = 'flex';
        } else {
          hint.style.display = 'none';
        }
      }
    });

    // Load board lanes
    this.renderBoardOnly();
  }

  createStatsSection() {
    const state = this.store.getState();
    const { projects, invoices } = state;

    // Active Projects Count (everything except Completed/New Lead)
    const activeCount = projects.filter(p => !['new_lead', 'completed'].includes(p.stage)).length;

    // Total Project Value (Sum across all projects except Completed)
    const pipelineSum = projects
      .filter(p => p.stage !== 'completed')
      .reduce((sum, p) => sum + p.budget, 0);

    // Unpaid Invoices (Sent & Overdue Invoices sum)
    const receivablesSum = invoices
      .filter(inv => ['Sent', 'Overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Average Revision Rounds
    const measuredProjects = projects.filter(p => !['new_lead'].includes(p.stage));
    const avgRevisions = measuredProjects.length > 0
      ? (measuredProjects.reduce((sum, p) => sum + p.revisionRound, 0) / measuredProjects.length).toFixed(1)
      : '0.0';

    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'metrics-grid';
    metricsGrid.innerHTML = `
      <div class="stat-card primary">
        <div class="stat-header">
          <span class="stat-title">Active Projects</span>
          <div class="stat-icon">${getIcon('layers', '', 16)}</div>
        </div>
        <span class="stat-value">${activeCount}</span>
        <span class="stat-subtext">Active freelance work</span>
      </div>
      <div class="stat-card secondary">
        <div class="stat-header">
          <span class="stat-title">Total Project Value</span>
          <div class="stat-icon">${getIcon('briefcase', '', 16)}</div>
        </div>
        <span class="stat-value">${formatCurrency(pipelineSum)}</span>
        <span class="stat-subtext">All active projects value</span>
      </div>
      <div class="stat-card success">
        <div class="stat-header">
          <span class="stat-title">Unpaid Invoices</span>
          <div class="stat-icon">${getIcon('fileText', '', 16)}</div>
        </div>
        <span class="stat-value">${formatCurrency(receivablesSum)}</span>
        <span class="stat-subtext">Pending client payments</span>
      </div>
      <div class="stat-card warning">
        <div class="stat-header">
          <span class="stat-title">Avg. Revisions</span>
          <div class="stat-icon">${getIcon('refresh', '', 16)}</div>
        </div>
        <span class="stat-value">${avgRevisions}</span>
        <span class="stat-subtext">Revision rounds per project</span>
      </div>
    `;
    return metricsGrid;
  }

  renderBoardOnly() {
    const canvas = document.getElementById('kanban-board-canvas');
    if (!canvas) return;

    canvas.innerHTML = '';

    // Freelancer 8-stage pipeline
    const columns = [
      { id: 'new_lead', label: 'New Lead' },
      { id: 'proposal_sent', label: 'Proposal Sent' },
      { id: 'in_progress', label: 'In Progress' },
      { id: 'client_review', label: 'Client Review' },
      { id: 'revision', label: 'Revision' },
      { id: 'invoice_sent', label: 'Invoice Sent' },
      { id: 'waiting_payment', label: 'Waiting Payment' },
      { id: 'completed', label: 'Completed' }
    ];

    const state = this.store.getState();
    
    // Check if there are no projects in database
    if (state.projects.length === 0) {
      canvas.style.display = 'block';
      canvas.innerHTML = `
        <div class="empty-state-box" style="margin-top: 24px;">
          ${getIcon('briefcase', '', 48)}
          <h3>No projects yet</h3>
          <p>Add your first freelance project and track it from lead to paid.</p>
          <button class="btn btn-primary" id="btn-empty-add-project">${getIcon('plus', '', 16)} Create Project</button>
        </div>
      `;
      canvas.querySelector('#btn-empty-add-project').addEventListener('click', () => this.showNewProjectDrawer());
      return;
    }

    canvas.style.display = 'flex';

    const filteredProjects = state.projects.filter(p => {
      if (!this.searchQuery) return true;
      return (
        p.title.toLowerCase().includes(this.searchQuery) ||
        p.clientName.toLowerCase().includes(this.searchQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
      );
    });

    columns.forEach(col => {
      const colProjects = filteredProjects.filter(p => p.stage === col.id);
      const colBudget = colProjects.reduce((sum, p) => sum + p.budget, 0);

      const colEl = document.createElement('div');
      colEl.className = 'kanban-column';
      colEl.dataset.stageId = col.id;

      colEl.innerHTML = `
        <div class="column-header">
          <div class="column-title-box">
            <span class="column-title" title="${col.label}">${col.label}</span>
            <span class="column-badge">${colProjects.length}</span>
          </div>
          <span class="column-budget-sum" style="font-size: 0.65rem;">${formatCurrency(colBudget)}</span>
        </div>
        <div class="column-cards-list" id="list-${col.id.replace(/\s+/g, '-')}"></div>
      `;

      const listEl = colEl.querySelector(`.column-cards-list`);

      // Fill Column Projects
      colProjects.forEach(p => {
        const card = this.createProjectCard(p);
        listEl.appendChild(card);
      });

      if (colProjects.length === 0) {
        listEl.innerHTML = `
          <div style="flex: 1; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(255,255,255,0.03); border-radius: var(--border-radius-md); padding: 16px; text-align: center; min-height: 70px;">
            <span style="font-size: 0.68rem; color: var(--text-muted);">Drop cards here</span>
          </div>
        `;
      }

      // Drag over effect handlers
      colEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        colEl.classList.add('drag-over');
      });

      colEl.addEventListener('dragleave', () => {
        colEl.classList.remove('drag-over');
      });

      colEl.addEventListener('drop', (e) => {
        e.preventDefault();
        colEl.classList.remove('drag-over');
        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) {
          const oldProject = state.projects.find(x => x.id === cardId);
          if (oldProject && oldProject.stage !== col.id) {
            const updates = { stage: col.id };
            if (col.id === 'completed') {
              updates.paymentStatus = 'Paid';
            }
            this.store.updateProject(cardId, updates);
            this.onTriggerToast(`Moved to: ${col.label}`);
            this.update();
          }
        }
      });

      canvas.appendChild(colEl);
    });

    // Check overflow after columns are rendered
    setTimeout(() => {
      const hint = document.getElementById('kanban-scroll-hint');
      if (hint && canvas) {
        if (canvas.scrollWidth > canvas.clientWidth) {
          hint.style.display = 'flex';
        } else {
          hint.style.display = 'none';
        }
      }
    }, 100);
  }

  createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('draggable', 'true');
    card.dataset.projectId = project.id;

    // Progress Bar percentage math
    const totalChecklist = project.checklist ? project.checklist.length : 0;
    const completedChecklist = project.checklist ? project.checklist.filter(c => c.completed).length : 0;
    const progressPercent = totalChecklist > 0 
      ? Math.round((completedChecklist / totalChecklist) * 100) 
      : 0;

    // Due Date alert logic
    const dueDateMeta = getDueDateStatus(project.dueDate);
    const dateWarningClass = dueDateMeta.isOverdue ? 'due-soon text-danger' : '';
    const dateIconMarkup = getIcon('clock', dueDateMeta.isOverdue ? 'text-danger' : 'text-muted', 12);

    // Dynamic Tag Coloring
    const primaryTag = project.tags[0] || 'Design';
    const tagClass = primaryTag.toLowerCase();

    // Priority badges layout
    let priorityMarkup = '';
    if (project.priority === 'High') priorityMarkup = `<span class="priority-badge priority-high">High</span>`;
    if (project.priority === 'Medium') priorityMarkup = `<span class="priority-badge priority-medium">Medium</span>`;
    if (project.priority === 'Low') priorityMarkup = `<span class="priority-badge priority-low">Low</span>`;

    // Payment Status colors
    let paymentPillClass = 'status-completed';
    if (project.paymentStatus === 'Paid') paymentPillClass = 'status-active text-success';
    if (project.paymentStatus === 'DP paid') paymentPillClass = 'status-active text-success';
    if (project.paymentStatus === 'Invoice overdue') paymentPillClass = 'status-lead text-danger';
    if (project.paymentStatus === 'Waiting payment') paymentPillClass = 'status-active text-warning';

    let displayPaymentStatus = project.paymentStatus || 'Not invoiced yet';
    if (displayPaymentStatus === 'None') displayPaymentStatus = 'Not invoiced yet';

    card.innerHTML = `
      <div class="card-header-tags">
        <span class="card-tag ${tagClass}">${primaryTag}</span>
        ${priorityMarkup}
      </div>
      
      <h4 class="card-title">${project.title}</h4>
      
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div class="card-client">
          ${getIcon('user', '', 11)}
          <span>${project.clientName}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="card-budget">${formatCurrency(project.budget)}</span>
          <span class="client-status-badge ${paymentPillClass}" style="font-size: 0.65rem; padding: 1px 6px;">${displayPaymentStatus}</span>
        </div>
      </div>

      <div class="card-progress-section">
        <div class="progress-info">
          <span>Tasks</span>
          <span>${completedChecklist}/${totalChecklist} (${progressPercent}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width: ${progressPercent}%"></div>
        </div>
      </div>

      ${project.nextAction ? `
        <div class="card-next-action" title="Next Action: ${project.nextAction}">
          <strong>Next:</strong> ${project.nextAction}
        </div>
      ` : ''}

      <div class="card-footer">
        <div class="card-footer-item ${dateWarningClass}">
          ${dateIconMarkup}
          <span style="font-size: 0.68rem;">${dueDateMeta.text}</span>
        </div>
        <div class="card-footer-item revisions">
          ${getIcon('refresh', '', 12)}
          <span style="font-size: 0.68rem;">Rev: ${project.revisionRound}/${project.maxRevisionRounds}</span>
        </div>
      </div>
    `;

    // HTML5 Drag Listeners
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      this.draggedCardId = project.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', project.id);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this.draggedCardId = null;
    });

    // Handle modal opens
    card.addEventListener('click', () => {
      this.onCardClick(project.id);
    });

    return card;
  }

  showNewProjectDrawer() {
    const clients = this.store.getState().clients;
    
    let drawerOverlay = document.getElementById('new-project-drawer');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'drawer-overlay';
      drawerOverlay.id = 'new-project-drawer';
      document.body.appendChild(drawerOverlay);
    }

    const clientOptions = clients.map(c => `<option value="${c.id}">${c.name} (${c.businessName || 'Personal'})</option>`).join('');

    drawerOverlay.innerHTML = `
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3>Create New Project</h3>
          <button class="modal-close-btn" id="close-drawer">&times;</button>
        </div>
        <div class="drawer-body">
          <form id="new-project-form">
            <div class="form-group">
              <label for="p-title">Project Title</label>
              <input type="text" id="p-title" class="form-control" placeholder="e.g. Landing Page Copywriting" required>
            </div>
            
            <div class="form-group">
              <label for="p-client-select">Select Client</label>
              <select id="p-client-select" class="form-control">
                <option value="">-- Select Client Directory --</option>
                ${clientOptions}
                <option value="NEW_CLIENT">+ Register New Client</option>
              </select>
            </div>

            <div class="form-group d-none" id="new-client-name-group">
              <label for="p-new-client-name">New Client Name</label>
              <input type="text" id="p-new-client-name" class="form-control" placeholder="e.g. Sarah Connor">
            </div>

            <div class="form-group d-none" id="new-client-business-group">
              <label for="p-new-client-business">Business/Brand Name</label>
              <input type="text" id="p-new-client-business" class="form-control" placeholder="e.g. Cyberdyne Systems">
            </div>

            <div class="form-group d-none" id="new-client-email-group">
              <label for="p-new-client-email">Client Email</label>
              <input type="email" id="p-new-client-email" class="form-control" placeholder="e.g. client@brand.com">
            </div>

            <div class="form-group">
              <label for="p-budget">Project Value (IDR)</label>
              <input type="number" id="p-budget" class="form-control" placeholder="e.g. 5000000" min="0" required>
            </div>

            <div class="form-group">
              <label for="p-due">Deadline Date</label>
              <input type="date" id="p-due" class="form-control" required>
            </div>

            <div class="form-group">
              <label for="p-priority">Priority</label>
              <select id="p-priority" class="form-control">
                <option value="Low">Low Priority</option>
                <option value="Medium" selected>Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div class="form-group">
              <label for="p-category">Category</label>
              <select id="p-category" class="form-control">
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Copywriting">Copywriting</option>
              </select>
            </div>

            <div class="form-group">
              <label for="p-revs">Max Revisions Round</label>
              <input type="number" id="p-revs" class="form-control" value="3" min="1" max="10" required>
            </div>

            <div class="form-group">
              <label for="p-action">Next Action Tag</label>
              <input type="text" id="p-action" class="form-control" value="Draft and email proposal" required>
            </div>

            <div class="form-group">
              <label for="p-desc">Scope Description</label>
              <textarea id="p-desc" class="form-control" placeholder="Detail deliverables..."></textarea>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0 0; border: none;">
              <button type="button" class="btn btn-secondary" id="cancel-drawer">Cancel</button>
              <button type="submit" class="btn btn-primary">Launch Project</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const select = drawerOverlay.querySelector('#p-client-select');
    const newClientGroup = drawerOverlay.querySelector('#new-client-name-group');
    const newClientBusinessGroup = drawerOverlay.querySelector('#new-client-business-group');
    const newClientEmailGroup = drawerOverlay.querySelector('#new-client-email-group');
    
    select.addEventListener('change', (e) => {
      if (e.target.value === 'NEW_CLIENT') {
        newClientGroup.classList.remove('d-none');
        newClientBusinessGroup.classList.remove('d-none');
        newClientEmailGroup.classList.remove('d-none');
        drawerOverlay.querySelector('#p-new-client-name').setAttribute('required', 'true');
      } else {
        newClientGroup.classList.add('d-none');
        newClientBusinessGroup.classList.add('d-none');
        newClientEmailGroup.classList.add('d-none');
        drawerOverlay.querySelector('#p-new-client-name').removeAttribute('required');
      }
    });

    setTimeout(() => drawerOverlay.classList.add('active'), 50);

    const closeActions = () => {
      drawerOverlay.classList.remove('active');
      setTimeout(() => drawerOverlay.remove(), 300);
    };

    drawerOverlay.querySelector('#close-drawer').addEventListener('click', closeActions);
    drawerOverlay.querySelector('#cancel-drawer').addEventListener('click', closeActions);

    const form = drawerOverlay.querySelector('#new-project-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = form.querySelector('#p-title').value;
      const budget = Number(form.querySelector('#p-budget').value);
      const dueDate = form.querySelector('#p-due').value;
      const priority = form.querySelector('#p-priority').value;
      const category = form.querySelector('#p-category').value;
      const maxRevisions = Number(form.querySelector('#p-revs').value);
      const nextAction = form.querySelector('#p-action').value;
      const description = form.querySelector('#p-desc').value;

      let clientId = select.value;
      let clientName = '';

      if (clientId === 'NEW_CLIENT') {
        const newName = form.querySelector('#p-new-client-name').value;
        const newBusiness = form.querySelector('#p-new-client-business').value;
        const newEmail = form.querySelector('#p-new-client-email').value;
        
        const client = this.store.addClient({
          name: newName,
          businessName: newBusiness,
          email: newEmail,
          status: 'Active'
        });
        clientId = client.id;
        clientName = client.name + (client.businessName ? ` (${client.businessName})` : '');
      } else {
        const selectedClient = clients.find(c => c.id === clientId);
        if (selectedClient) {
          clientName = selectedClient.name + (selectedClient.businessName ? ` (${selectedClient.businessName})` : '');
        } else {
          clientId = '';
          clientName = 'Independent Account';
        }
      }

      this.store.addProject({
        title,
        clientId,
        clientName,
        budget,
        stage: 'new_lead',
        dueDate,
        priority,
        tags: [category],
        maxRevisionRounds: maxRevisions,
        nextAction,
        description
      });

      this.onTriggerToast('Launched project successfully');
      closeActions();
      this.update();
    });
  }
}
