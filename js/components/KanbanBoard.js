/* ==========================================================================
   FREELANCER PROJECT OS - KANBAN BOARD VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatMoney, getDueDateStatus, getLocalizedDueDateStatus, formatDate, showCompletionWarningModal } from '../utils.js';
import { t, getLanguage } from '../i18n.js';
import { TemplatesModal } from './TemplatesModal.js';

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
    this.minimizedCardIds = new Set(JSON.parse(localStorage.getItem('alurkarya_minimized_cards') || '[]'));
    
    // Columns collapsed state (default all collapsed/peek mode on load)
    this.collapsedColumns = new Set(['new_lead', 'proposal_sent', 'in_progress', 'client_review', 'revision', 'invoice_sent', 'waiting_payment', 'completed']);
    localStorage.setItem('alurkarya_kanban_columns_collapsed', JSON.stringify(Array.from(this.collapsedColumns)));
    this.version = 'kanban-sync-v2';
  }

  showTemplatesModal() {
    const modal = new TemplatesModal(this.store, () => this.update(), this.onTriggerToast);
    modal.open();
  }

  getProjectHealth(project) {
    const dueDateMeta = getDueDateStatus(project.dueDate);
    if (project.stage === 'completed' || project.paymentStatus === 'Paid') {
      return { label: 'Paid', class: 'health-paid', color: 'var(--color-success)' };
    }
    if (dueDateMeta.isOverdue) {
      return { label: 'Overdue', class: 'health-overdue', color: 'var(--color-danger)' };
    }
    if (['client_review', 'revision', 'waiting_payment'].includes(project.stage) || project.paymentStatus === 'Waiting payment') {
      return { label: 'Waiting Client', class: 'health-waiting', color: 'var(--color-warning)' };
    }
    if (['new_lead', 'proposal_sent'].includes(project.stage) || project.paymentStatus === 'Invoice overdue') {
      return { label: 'Need Action', class: 'health-need-action', color: 'var(--color-accent)' };
    }
    if (!project.paymentStatus || project.paymentStatus === 'None') {
      return { label: 'Not Invoiced', class: 'health-not-invoiced', color: 'var(--text-muted)' };
    }
    return { label: 'On Track', class: 'health-on-track', color: 'var(--color-secondary)' };
  }

  getPreviewProject(colProjects) {
    if (colProjects.length === 0) return null;

    // 1. Overdue projects
    const today = new Date();
    today.setHours(0,0,0,0);
    const overdueProj = colProjects.find(p => p.dueDate && new Date(p.dueDate) < today && p.stage !== 'completed' && p.stage !== 'on_hold');
    if (overdueProj) return overdueProj;

    // 2. Need Action projects (health is Need Action)
    const needActionProj = colProjects.find(p => {
      const h = this.getProjectHealth(p);
      return h.label === 'Need Action';
    });
    if (needActionProj) return needActionProj;

    // 3. Urgent / High priority
    const priorityProj = colProjects.find(p => p.priority === 'Urgent' || p.priority === 'High');
    if (priorityProj) return priorityProj;

    // 4. Nearest deadline
    const deadlineProj = [...colProjects].filter(p => p.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
    if (deadlineProj) return deadlineProj;

    // 5. Highest value
    const valueProj = [...colProjects].sort((a, b) => b.budget - a.budget)[0];
    if (valueProj) return valueProj;

    // 6. First project in the column
    return colProjects[0];
  }

  createOnboardingSection() {
    const onboardingEl = document.createElement('div');
    onboardingEl.className = 'onboarding-panel';
    onboardingEl.style.cssText = 'background: var(--glass-bg); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-lg); padding: 18px; margin-bottom: 16px;';
    onboardingEl.innerHTML = `
      <div class="onboarding-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.15rem;">🚀</span>
          <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 800; color: var(--text-primary);">${t('onboarding.cardTitle', 'Mulai dari 1 project aktif')}</h4>
        </div>
        <button class="onboarding-close-btn" style="color: var(--text-muted); background: none; border: none; font-size: 1.2rem; line-height: 1; cursor: pointer; padding: 4px;" title="Dismiss Onboarding">&times;</button>
      </div>
      
      <div class="onboarding-steps" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 16px;">
        <div class="onboarding-step" style="display: flex; flex-direction: column; gap: 4px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.02); padding: 12px; border-radius: 8px;">
          <span style="font-size: 0.72rem; color: var(--color-primary); font-weight: 700; text-transform: uppercase;">1. ${t('onboarding.cardStep1', 'Pilih role')}</span>
        </div>
        <div class="onboarding-step" style="display: flex; flex-direction: column; gap: 4px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.02); padding: 12px; border-radius: 8px;">
          <span style="font-size: 0.72rem; color: var(--color-secondary); font-weight: 700; text-transform: uppercase;">2. ${t('onboarding.cardStep2', 'Tambah project')}</span>
        </div>
        <div class="onboarding-step" style="display: flex; flex-direction: column; gap: 4px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.02); padding: 12px; border-radius: 8px;">
          <span style="font-size: 0.72rem; color: var(--color-accent); font-weight: 700; text-transform: uppercase;">3. ${t('onboarding.cardStep3', 'Isi next action')}</span>
        </div>
      </div>

      <div class="onboarding-footer" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary btn-sm" id="onboarding-btn-setup" style="padding: 6px 12px; font-size: 0.75rem; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">${t('onboarding.ctaPrimary', 'Mulai Setup')}</button>
        <a href="alurpandu-guided-start.html" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size: 0.75rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
          ${getIcon('help', '', 12)} ${t('viewGuide', 'View Guide')}
        </a>
      </div>
    `;

    // Event listeners
    onboardingEl.querySelector('#onboarding-btn-setup').addEventListener('click', () => {
      this.showTemplatesModal();
    });

    onboardingEl.querySelector('.onboarding-close-btn').addEventListener('click', () => {
      onboardingEl.style.display = 'none';
      localStorage.setItem('alurkarya_onboarding_dismissed', 'true');
    });

    return onboardingEl;
  }



  createDiagnoseResultCard(result) {
    const card = document.createElement('div');
    card.className = 'diagnose-result-panel';
    card.style.cssText = 'background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: var(--border-radius-lg); padding: 18px; margin-bottom: 16px; position: relative;';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
          ⚡ Diagnose Results: ${result.freelancerType} Workspace
        </h4>
        <button class="diagnose-close-btn" style="color: var(--text-muted); background: none; border: none; font-size: 1.2rem; line-height: 1; cursor: pointer; padding: 0 4px;" title="Clear Diagnose Result">&times;</button>
      </div>
      <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">
        Your main bottleneck is <strong>${result.bottleneck}</strong>. Recommendation: ${result.recommendation}
      </p>
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 0.72rem; color: var(--text-muted);">
          🎯 Suggested Next Action: <span style="color: var(--color-primary); font-weight: 600;">${result.nextAction}</span>
        </span>
        <button class="btn btn-secondary btn-sm" id="btn-diagnose-apply-template" style="padding: 4px 10px; font-size: 0.7rem;">
          Load ${result.template} Template
        </button>
      </div>
    `;

    card.querySelector('.diagnose-close-btn').addEventListener('click', () => {
      localStorage.removeItem('alurkarya_workflow_diagnose_result');
      this.update();
    });

    card.querySelector('#btn-diagnose-apply-template').addEventListener('click', async () => {
      if (confirm(`This will add sample projects for the "${result.template}" template. Existing projects will not be deleted. Proceed?`)) {
        const { applyTemplateProjects } = await import('./FreelancerTemplates.js');
        applyTemplateProjects(this.store, result.template);
        this.onTriggerToast(`${result.template} template loaded successfully.`, "text-success");
        this.update();
      }
    });

    return card;
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

    // Renders Onboarding Section if not dismissed
    const onboardingDismissed = localStorage.getItem('alurkarya_onboarding_dismissed') === 'true';
    if (!onboardingDismissed) {
      const onboardingEl = this.createOnboardingSection();
      dashboardEl.appendChild(onboardingEl);
    }

    // Renders Diagnose Result Card if exists
    const diagnoseResultStr = localStorage.getItem('alurkarya_workflow_diagnose_result');
    if (diagnoseResultStr) {
      try {
        const diagnoseResult = JSON.parse(diagnoseResultStr);
        const diagnoseCard = this.createDiagnoseResultCard(diagnoseResult);
        dashboardEl.appendChild(diagnoseCard);
      } catch (e) {
        console.error(e);
      }
    }

    // Renders Stats Metrics Row
    const statsEl = this.createStatsSection();
    dashboardEl.appendChild(statsEl);

    // Renders Dashboard Summary (Today, This Week, Upcoming Meeting, Due Soon, Follow-up Needed)
    const summaryEl = this.createDashboardSummary();
    dashboardEl.appendChild(summaryEl);

    // Renders Action Control Ribbon (Search + Add + View Mode Switcher)
    const controlRibbon = document.createElement('div');
    controlRibbon.className = 'grid-controls';
    
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper';
    searchWrapper.innerHTML = `
      ${getIcon('search', 'search-icon', 18)}
      <input type="text" id="board-search" placeholder="${t('kanban.searchPlaceholder', 'Search projects, clients, or tags...')}" value="${this.searchQuery}">
    `;
    const searchInput = searchWrapper.querySelector('input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderBoardOnly();
    });

    const activeViewMode = localStorage.getItem('alurkarya_board_view_mode') || 'simple';
    const activeSortMode = localStorage.getItem('alurkarya_board_sort_mode') || 'default';

    const rightControls = document.createElement('div');
    rightControls.className = 'right-controls';
    rightControls.style.cssText = 'display: flex; align-items: center; gap: 12px; flex-wrap: wrap;';

    const sortSelector = document.createElement('div');
    sortSelector.className = 'sort-selector';
    sortSelector.style.cssText = 'display: flex; align-items: center; gap: 6px;';
    sortSelector.innerHTML = `
      <span style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600;">${t('sortBy', 'Sort by')}:</span>
      <select class="form-control" id="board-sort-select" style="font-size: 0.75rem; padding: 4px 10px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); color: var(--text-secondary); cursor: pointer; height: auto;">
        <option value="default" ${activeSortMode === 'default' ? 'selected' : ''}>${t('all', 'Default')}</option>
        <option value="dueDate" ${activeSortMode === 'dueDate' ? 'selected' : ''}>${t('projectModal.deadline', 'Due Date')}</option>
        <option value="value" ${activeSortMode === 'value' ? 'selected' : ''}>${t('projectModal.budget', 'Value')}</option>
        <option value="submitDate" ${activeSortMode === 'submitDate' ? 'selected' : ''}>${t('delivery.deliveryDate', 'Submit Date')}</option>
      </select>
    `;

    sortSelector.querySelector('#board-sort-select').addEventListener('change', (e) => {
      localStorage.setItem('alurkarya_board_sort_mode', e.target.value);
      this.renderBoardOnly();
    });

    const viewModeSelector = document.createElement('div');
    viewModeSelector.className = 'view-mode-selector';
    viewModeSelector.innerHTML = `
      <button class="view-mode-btn ${activeViewMode === 'simple' ? 'active' : ''}" id="view-mode-simple">${t('kanban.viewSimple', 'Simple')}</button>
      <button class="view-mode-btn ${activeViewMode === 'detail' ? 'active' : ''}" id="view-mode-detail">${t('kanban.viewDetailed', 'Detailed')}</button>
    `;

    viewModeSelector.querySelector('#view-mode-simple').addEventListener('click', () => {
      localStorage.setItem('alurkarya_board_view_mode', 'simple');
      viewModeSelector.querySelector('#view-mode-simple').classList.add('active');
      viewModeSelector.querySelector('#view-mode-detail').classList.remove('active');
      this.renderBoardOnly();
    });

    viewModeSelector.querySelector('#view-mode-detail').addEventListener('click', () => {
      localStorage.setItem('alurkarya_board_view_mode', 'detail');
      viewModeSelector.querySelector('#view-mode-detail').classList.add('active');
      viewModeSelector.querySelector('#view-mode-simple').classList.remove('active');
      this.renderBoardOnly();
    });

    const templatesBtn = document.createElement('button');
    templatesBtn.className = 'btn btn-secondary';
    templatesBtn.style.cssText = 'font-size: 0.78rem; padding: 8px 14px; border-radius: var(--border-radius-sm); font-weight: 600; display: inline-flex; align-items: center; gap: 6px;';
    templatesBtn.innerHTML = `${getIcon('layers', '', 14)} ${t('kanban.templates', 'Templates')}`;
    templatesBtn.addEventListener('click', () => this.showTemplatesModal());

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = `${getIcon('plus', '', 18)} ${t('kanban.addProject', 'Add Project')}`;
    addBtn.addEventListener('click', () => this.showNewProjectDrawer());

    // Global Expand/Collapse All controls
    const globalToggles = document.createElement('div');
    globalToggles.className = 'view-mode-selector';
    globalToggles.innerHTML = `
      <button class="view-mode-btn" id="btn-collapse-all" style="font-size: 0.75rem; padding: 6px 10px;" title="${t('kanban.collapseAll', 'Collapse All Columns')}">${t('kanban.collapseAll', 'Collapse All')}</button>
      <button class="view-mode-btn" id="btn-expand-all" style="font-size: 0.75rem; padding: 6px 10px;" title="${t('kanban.expandAll', 'Expand All Columns')}">${t('kanban.expandAll', 'Expand All')}</button>
    `;

    globalToggles.querySelector('#btn-collapse-all').addEventListener('click', () => {
      this.collapsedColumns = new Set(['new_lead', 'proposal_sent', 'in_progress', 'client_review', 'revision', 'invoice_sent', 'waiting_payment', 'completed']);
      localStorage.setItem('alurkarya_kanban_columns_collapsed', JSON.stringify(Array.from(this.collapsedColumns)));
      this.renderBoardOnly();
    });

    globalToggles.querySelector('#btn-expand-all').addEventListener('click', () => {
      this.collapsedColumns.clear();
      localStorage.setItem('alurkarya_kanban_columns_collapsed', JSON.stringify(Array.from(this.collapsedColumns)));
      this.renderBoardOnly();
    });

    rightControls.appendChild(sortSelector);
    rightControls.appendChild(viewModeSelector);
    rightControls.appendChild(globalToggles);
    rightControls.appendChild(templatesBtn);
    rightControls.appendChild(addBtn);

    controlRibbon.appendChild(searchWrapper);
    controlRibbon.appendChild(rightControls);
    dashboardEl.appendChild(controlRibbon);

    // Scroll Hint Helper
    const scrollHint = document.createElement('div');
    scrollHint.id = 'kanban-scroll-hint';
    scrollHint.style.cssText = 'font-size: 0.72rem; color: var(--text-muted); display: none; align-items: center; gap: 6px; margin: -8px 0 12px 4px; padding: 2px 4px;';
    scrollHint.innerHTML = `
      <span style="display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 4px; color: var(--color-secondary);">
        ${getIcon('externalLink', '', 12)}
      </span>
      <span>${t('kanban.scrollSideways', 'Scroll sideways to see all workflow stages.')}</span>
    `;
    dashboardEl.appendChild(scrollHint);

    // Board container canvas
    const boardWrapper = document.createElement('div');
    boardWrapper.className = 'kanban-scroll-shell';
    boardWrapper.id = 'kanban-board-canvas';
    dashboardEl.appendChild(boardWrapper);

    // On Hold mount container
    const onHoldMount = document.createElement('div');
    onHoldMount.id = 'on-hold-projects-mount';
    dashboardEl.appendChild(onHoldMount);

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
    const state = this.store.getState() || {};
    const projects = Array.isArray(state.projects) ? state.projects : [];
    const invoices = Array.isArray(state.invoices) ? state.invoices : [];

    // Active Projects Count (everything except Completed/New Lead)
    const activeCount = projects.filter(p => !['new_lead', 'completed'].includes(p.stage || 'new_lead')).length;

    // Total Project Value (Sum across all projects except Completed, grouped by projectCurrency)
    const pipelineGroups = {};
    projects
      .filter(p => (p.stage || 'new_lead') !== 'completed')
      .forEach(p => {
        const cur = p.projectCurrency || localStorage.getItem('alurkarya_default_currency') || 'IDR';
        if (!pipelineGroups[cur]) pipelineGroups[cur] = 0;
        pipelineGroups[cur] += Number(p.budget) || 0;
      });

    // Unpaid Invoices (Sent & Overdue Invoices sum, grouped by inv.currency)
    const receivablesGroups = {};
    invoices
      .filter(inv => ['Sent', 'Overdue'].includes(inv.status))
      .forEach(inv => {
        const cur = inv.currency || 'IDR';
        if (!receivablesGroups[cur]) receivablesGroups[cur] = 0;
        receivablesGroups[cur] += Number(inv.amount) || 0;
      });

    // Helper to format grouped values
    const formatGrouped = (groups) => {
      const currencies = Object.keys(groups);
      if (currencies.length === 0) {
        const def = localStorage.getItem('alurkarya_default_currency') || 'IDR';
        return {
          text: formatMoney(0, def),
          isMulti: false
        };
      }
      if (currencies.length === 1) {
        return {
          text: formatMoney(groups[currencies[0]], currencies[0]),
          isMulti: false
        };
      }
      
      const formattedList = currencies.map(cur => formatMoney(groups[cur], cur));
      return {
        text: formattedList.join(' + '),
        isMulti: true
      };
    };

    const formattedPipeline = formatGrouped(pipelineGroups);
    const formattedReceivables = formatGrouped(receivablesGroups);

    // Average Revision Rounds
    const measuredProjects = projects.filter(p => !['new_lead'].includes(p.stage || 'new_lead'));
    const avgRevisions = measuredProjects.length > 0
      ? (measuredProjects.reduce((sum, p) => sum + (p.revisionRound || 0), 0) / measuredProjects.length).toFixed(1)
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
        <span class="stat-value" style="font-size: ${formattedPipeline.isMulti ? '1.1rem' : '1.35rem'}; word-break: break-all;">${formattedPipeline.text}</span>
        <span class="stat-subtext">${formattedPipeline.isMulti ? t('totalsGroupedHelper', 'Totals are grouped by currency.') : 'All active projects value'}</span>
      </div>
      <div class="stat-card success">
        <div class="stat-header">
          <span class="stat-title">Unpaid Invoices</span>
          <div class="stat-icon">${getIcon('fileText', '', 16)}</div>
        </div>
        <span class="stat-value" style="font-size: ${formattedReceivables.isMulti ? '1.1rem' : '1.35rem'}; word-break: break-all;">${formattedReceivables.text}</span>
        <span class="stat-subtext">${formattedReceivables.isMulti ? t('totalsGroupedHelper', 'Totals are grouped by currency.') : 'Pending client payments'}</span>
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
      { id: 'new_lead', label: t('kanban.stages.new_lead', 'New Lead') },
      { id: 'proposal_sent', label: t('kanban.stages.proposal_sent', 'Queue') },
      { id: 'in_progress', label: t('kanban.stages.in_progress', 'In Progress') },
      { id: 'client_review', label: t('kanban.stages.client_review', 'Client Review') },
      { id: 'revision', label: t('kanban.stages.revision', 'Revision') },
      { id: 'invoice_sent', label: t('kanban.stages.invoice_sent', 'Invoice Sent') },
      { id: 'waiting_payment', label: t('kanban.stages.waiting_payment', 'Waiting Payment') },
      { id: 'completed', label: t('kanban.stages.completed', 'Completed') }
    ];

    const state = this.store.getState() || {};
    const projects = Array.isArray(state.projects) ? state.projects : [];

    const hasMalformedData = projects.some(p => (!p.title && !p.projectName) || !p.stage);
    if (hasMalformedData) {
      const warningBanner = document.createElement('div');
      warningBanner.style.cssText = 'background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--border-radius-sm); padding: 12px 16px; margin: 0 0 16px 0; font-size: 0.75rem; color: #f87171; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; width: 100%; box-sizing: border-box;';
      const warningText = getLanguage() === 'id'
        ? 'Ada data project yang perlu diperbaiki. Buka Diagnosa untuk detail.'
        : 'Some project data needs recovery. Open Diagnosis for details.';
      warningBanner.innerHTML = `⚠️ ${warningText}`;
      warningBanner.addEventListener('click', () => {
        if (window.app) {
          window.app.sidebar.setActiveTab('diagnose');
        }
      });
      canvas.appendChild(warningBanner);
    }

    const onHoldMount = document.getElementById('on-hold-projects-mount');

    // Check if there are no projects in database
    if (projects.length === 0) {
      if (onHoldMount) onHoldMount.style.display = 'none';
      const emptyStateBox = document.createElement('div');
      emptyStateBox.className = 'empty-state-box';
      emptyStateBox.style.cssText = 'margin: 0 0 24px 0; padding: 32px 20px; text-align: center; background: var(--glass-bg); border: 1px dashed var(--glass-border); border-radius: var(--border-radius-lg); backdrop-filter: var(--glass-backdrop); width: 100%;';
      
      const lang = getLanguage();
      const emptyTitle = lang === 'id' 
        ? 'Belum ada project.' 
        : 'No projects yet.';
      const emptyDesc = lang === 'id' 
        ? 'Tambahkan project pertama atau impor backup jika kamu sudah punya data sebelumnya untuk mulai mengelola workflow client-to-paid.'
        : 'Add your first project or import a backup if you already have saved data to start managing your client-to-paid workflow.';
      const addText = lang === 'id' ? 'Tambah Project' : 'Add Project';
      const panduText = lang === 'id' ? 'Buat Project Pertama lewat AlurPandu' : 'Create First Project with AlurPandu';
      
      emptyStateBox.innerHTML = `
        <div style="font-size: 2.2rem; margin-bottom: 12px; color: var(--color-primary-glow); filter: drop-shadow(0 2px 8px rgba(139,92,246,0.3));">💼</div>
        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">${emptyTitle}</h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
          ${emptyDesc}
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; align-items: center;">
          <button class="btn btn-primary btn-sm" id="btn-empty-add-project" style="padding: 8px 18px; font-weight: 600;">${getIcon('plus', '', 14)} ${addText}</button>
          <a href="alurpandu-guided-start.html#setup-checklist" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="padding: 8px 18px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            ${getIcon('externalLink', '', 14)} <span>${panduText}</span>
          </a>
        </div>
      `;
      canvas.appendChild(emptyStateBox);
      emptyStateBox.querySelector('#btn-empty-add-project').addEventListener('click', () => this.showNewProjectDrawer());
      return;
    }

    const filteredProjects = projects.filter(p => {
      if (!this.searchQuery) return true;
      const title = (p.title || '').toLowerCase();
      const projectName = (p.projectName || '').toLowerCase();
      const clientName = (p.clientName || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const nextAction = (p.nextAction || '').toLowerCase();
      const notes = (p.notes || p.internalNotes || p.description || '').toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags : [];

      return (
        title.includes(this.searchQuery) ||
        projectName.includes(this.searchQuery) ||
        clientName.includes(this.searchQuery) ||
        category.includes(this.searchQuery) ||
        nextAction.includes(this.searchQuery) ||
        notes.includes(this.searchQuery) ||
        tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
      );
    });

    // If all projects are hidden by filters/search
    if (filteredProjects.length === 0) {
      if (onHoldMount) onHoldMount.style.display = 'none';
      const filterEmptyBox = document.createElement('div');
      filterEmptyBox.className = 'empty-state-box';
      filterEmptyBox.style.cssText = 'margin: 0 0 24px 0; padding: 32px 24px; text-align: center; background: var(--glass-bg); border: 1px dashed var(--glass-border); border-radius: var(--border-radius-lg); width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px;';
      
      const lang = getLanguage();
      const filterText = lang === 'id' 
        ? 'Tidak ada project yang cocok dengan filter saat ini.' 
        : 'No projects match the current filter.';
      const clearText = lang === 'id' ? 'Bersihkan Filter' : 'Clear Filter';
      
      filterEmptyBox.innerHTML = `
        <span style="font-size: 0.82rem; color: var(--text-muted); display: block;">${filterText}</span>
        <button class="btn btn-secondary btn-sm" id="btn-clear-filter" style="padding: 6px 14px; font-size: 0.72rem; font-weight: 600;">
          ${clearText}
        </button>
      `;
      canvas.appendChild(filterEmptyBox);

      const clearBtn = filterEmptyBox.querySelector('#btn-clear-filter');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          this.searchQuery = '';
          const searchEl = document.getElementById('board-search');
          if (searchEl) {
            searchEl.value = '';
          }
          this.renderBoardOnly();
        });
      }
      return;
    }

    canvas.style.display = 'block';
    let track = canvas.querySelector('.kanban-scroll-track');
    if (!track) {
      track = document.createElement('div');
      track.className = 'kanban-scroll-track';
      track.id = 'kanban-board-track';
      canvas.appendChild(track);
    } else {
      track.innerHTML = '';
    }

    const activeSortMode = localStorage.getItem('alurkarya_board_sort_mode') || 'default';

    columns.forEach(col => {
      let colProjects = filteredProjects.filter(p => {
        let stage = p.stage || 'new_lead';
        if (stage === 'Queue') stage = 'proposal_sent';
        return stage === col.id;
      });

      // Apply sorting based on activeSortMode
      if (activeSortMode === 'dueDate') {
        colProjects.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
      } else if (activeSortMode === 'value') {
        colProjects.sort((a, b) => (b.budget || 0) - (a.budget || 0));
      } else if (activeSortMode === 'submitDate') {
        colProjects.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      }

      const colBudgetGroups = {};
      colProjects.forEach(p => {
        const cur = p.projectCurrency || localStorage.getItem('alurkarya_default_currency') || 'IDR';
        if (!colBudgetGroups[cur]) colBudgetGroups[cur] = 0;
        colBudgetGroups[cur] += Number(p.budget) || 0;
      });

      const colCurrencies = Object.keys(colBudgetGroups);
      let colBudgetFormatted = '';
      if (colCurrencies.length === 0) {
        const def = localStorage.getItem('alurkarya_default_currency') || 'IDR';
        colBudgetFormatted = formatMoney(0, def);
      } else {
        colBudgetFormatted = colCurrencies.map(cur => formatMoney(colBudgetGroups[cur], cur)).join(' + ');
      }

      const isColCollapsed = this.collapsedColumns.has(col.id);

      const colEl = document.createElement('div');
      colEl.className = `kanban-column${isColCollapsed ? ' collapsed' : ''}`;
      colEl.dataset.stageId = col.id;

      const isPaymentStage = ['invoice_sent', 'waiting_payment', 'completed'].includes(col.id);
      let budgetMarkup = '';
      if (isPaymentStage) {
        let suffix = '';
        if (col.id === 'invoice_sent') suffix = ' pending';
        else if (col.id === 'waiting_payment') suffix = ' awaiting payment';
        else if (col.id === 'completed') suffix = ' paid';
        budgetMarkup = `<span class="column-budget-sum" style="font-size: 0.65rem; color: var(--text-secondary);" title="${colCurrencies.length > 1 ? t('totalsGroupedHelper', 'Totals are grouped by currency.') : ''}">${colBudgetFormatted}${suffix}</span>`;
      }

      colEl.innerHTML = `
        <div class="column-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <div class="column-title-box" style="display: flex; align-items: center; gap: 8px;">
            <span class="column-title" title="${col.label}">${col.label}</span>
            <span class="column-badge">${colProjects.length}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${budgetMarkup}
            <button type="button" class="col-toggle-btn" style="background: none; border: none; padding: 4px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: all var(--transition-fast);" title="${isColCollapsed ? 'Expand column' : 'Collapse column'}">
              ${getIcon(isColCollapsed ? 'chevronRight' : 'chevronDown', '', 14)}
            </button>
          </div>
        </div>
        <div class="column-cards-list" id="list-${col.id.replace(/\s+/g, '-')}"></div>
      `;

      const listEl = colEl.querySelector(`.column-cards-list`);

      if (isColCollapsed) {
        listEl.style.display = 'none';
        
        // Render preview project
        const previewProj = this.getPreviewProject(colProjects);
        if (previewProj) {
          const previewCard = this.createProjectCard(previewProj, true);
          previewCard.style.marginTop = '10px';
          colEl.appendChild(previewCard);
        } else {
          const emptyPreviewEl = document.createElement('div');
          emptyPreviewEl.style.cssText = 'border: 1px dashed rgba(255,255,255,0.03); border-radius: var(--border-radius-sm); padding: 10px; text-align: center; margin-top: 10px; font-size: 0.68rem; color: var(--text-muted);';
          emptyPreviewEl.textContent = 'Empty';
          colEl.appendChild(emptyPreviewEl);
        }
      } else {
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
      }

      // Column level expand/collapse toggle action
      const toggleBtn = colEl.querySelector('.col-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.collapsedColumns.has(col.id)) {
            this.collapsedColumns.delete(col.id);
          } else {
            this.collapsedColumns.add(col.id);
          }
          localStorage.setItem('alurkarya_kanban_columns_collapsed', JSON.stringify(Array.from(this.collapsedColumns)));
          this.renderBoardOnly();
        });
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
            if (col.id === 'invoice_sent' && oldProject.clientApprovalStatus !== 'Approved') {
              this.onTriggerToast(t('toast.invoiceApprovalWarning', 'Invoice should be sent after client approval.'), 'text-danger');
              return;
            }
            if (col.id === 'completed') {
              const lacksApproval = (oldProject.approvalStatus !== 'Approved' && oldProject.clientApprovalStatus !== 'Approved');
              const lacksFinalFiles = !oldProject.finalFileLink;
              const lacksPaidStatus = (oldProject.paymentStatus !== 'Fully Paid' && oldProject.paymentStatus !== 'Payment Received');
              
              if (lacksApproval || lacksFinalFiles || lacksPaidStatus) {
                let warningParams = {};
                if (lacksPaidStatus) {
                  warningParams = {
                    title: t('kanban.completionWarning.title', 'Complete this project?'),
                    message: t('kanban.completionWarning.messagePayment', 'Payment confirmation may still be missing. You can complete this project anyway or review the invoice details first.'),
                    confirmText: t('kanban.completionWarning.confirmText', 'Move to Completed Anyway'),
                    cancelText: t('kanban.completionWarning.cancelTextInvoice', 'Review Invoice')
                  };
                } else {
                  warningParams = {
                    title: t('kanban.completionWarning.title', 'Complete this project?'),
                    message: t('kanban.completionWarning.message', 'Some completion items may still be missing: client approval, final delivery, or payment confirmation.'),
                    confirmText: t('kanban.completionWarning.confirmText', 'Move to Completed Anyway'),
                    cancelText: t('kanban.completionWarning.cancelText', 'Review Project')
                  };
                }
                
                showCompletionWarningModal({
                  ...warningParams,
                  onConfirm: () => {
                    const updates = { stage: 'completed' };
                    this.store.updateProject(cardId, updates);
                    this.onTriggerToast(t('toast.stageUpdated', 'Stage updated to: {stage}').replace('{stage}', col.label));
                    this.update();
                  },
                  onReview: () => {
                    this.onCardClick(cardId);
                  }
                });
                return;
              }
            }
            const updates = { stage: col.id };
            this.store.updateProject(cardId, updates);
            this.onTriggerToast(t('toast.stageUpdated', 'Stage updated to: {stage}').replace('{stage}', col.label));
            this.update();
          }
        }
      });

      track.appendChild(colEl);
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

    // Render On Hold Projects
    this.renderOnHoldSection();
  }

  createProjectCard(project, isPreview = false) {
    const card = document.createElement('div');
    const isMinimized = !isPreview && this.minimizedCardIds.has(project.id);
    card.className = `project-card${isMinimized ? ' minimized' : ''}${isPreview ? ' column-preview-card' : ''}`;
    card.setAttribute('draggable', isPreview ? 'false' : 'true');
    card.dataset.projectId = project.id;

    // Load active view mode (simple or detail)
    const viewMode = localStorage.getItem('alurkarya_board_view_mode') || 'simple';

    // Apply Project Health left border
    const health = this.getProjectHealth(project);
    card.style.borderLeft = `4px solid ${health.color}`;

    // Progress Bar percentage math
    const totalChecklist = project.checklist ? project.checklist.length : 0;
    const completedChecklist = project.checklist ? project.checklist.filter(c => c.completed).length : 0;
    const progressPercent = totalChecklist > 0 
      ? Math.round((completedChecklist / totalChecklist) * 100) 
      : 0;

    // Due Date alert logic
    const dueDateMeta = getLocalizedDueDateStatus(project.dueDate);
    let dateWarningClass = '';
    let dateIconColor = 'text-muted';
    if (dueDateMeta.status === 'overdue' || dueDateMeta.status === 'today') {
      dateWarningClass = 'due-soon text-danger';
      dateIconColor = 'text-danger';
    } else if (dueDateMeta.status === 'soon') {
      dateWarningClass = 'due-soon text-warning';
      dateIconColor = 'text-warning';
    } else if (dueDateMeta.status === 'none') {
      dateWarningClass = 'text-muted';
      dateIconColor = 'text-muted';
    }
    const dateIconMarkup = getIcon('clock', dateIconColor, 12);

    // Dynamic Tag Coloring
    const primaryTag = project.tags && project.tags[0] ? project.tags[0] : 'Design';
    const tagClass = primaryTag.toLowerCase();

    // Priority badges layout & styling
    const priorityVal = project.priority || 'TBD';
    let priorityClass = 'priority-tbd';
    if (priorityVal === 'Low') priorityClass = 'priority-low';
    else if (priorityVal === 'Medium') priorityClass = 'priority-medium';
    else if (priorityVal === 'High') priorityClass = 'priority-high';
    else if (priorityVal === 'Urgent') priorityClass = 'priority-urgent';

    // Payment Status colors
    let paymentPillClass = 'status-completed';
    if (project.paymentStatus === 'Paid' || project.paymentStatus === 'Fully Paid') paymentPillClass = 'status-active text-success';
    else if (project.paymentStatus === 'DP paid' || project.paymentStatus === 'DP Paid') paymentPillClass = 'status-active text-success';
    else if (project.paymentStatus === 'Invoice overdue' || project.paymentStatus === 'Overdue') paymentPillClass = 'status-lead text-danger';
    else if (project.paymentStatus === 'Waiting payment' || project.paymentStatus === 'Waiting Payment') paymentPillClass = 'status-active text-warning';

    let displayPaymentStatus = project.paymentStatus || 'Not Invoiced';
    if (displayPaymentStatus === 'None') displayPaymentStatus = 'Not Invoiced';

    // Map stages to Indonesian/English clean label
    const stageMap = {
      'new_lead': t('kanban.stages.new_lead', 'New Lead'),
      'proposal_sent': t('kanban.stages.proposal_sent', 'Queue'),
      'in_progress': t('kanban.stages.in_progress', 'In Progress'),
      'client_review': t('kanban.stages.client_review', 'Client Review'),
      'revision': t('kanban.stages.revision', 'Revision'),
      'invoice_sent': t('kanban.stages.invoice_sent', 'Invoice Sent'),
      'waiting_payment': t('kanban.stages.waiting_payment', 'Waiting Payment'),
      'completed': t('kanban.stages.completed', 'Completed')
    };
    const colName = stageMap[project.stage || project.status] || project.stage || project.status || 'Unknown';

    // Client Name & Type Fallback
    const hasClient = !!(project.clientName || project.customClientName);
    const clientNameStr = project.clientName || project.customClientName || 'No client selected';
    const clientTypeStr = (hasClient && project.clientType) ? ` · ${project.clientType}` : '';
    const fullClientIdentity = `${clientNameStr}${clientTypeStr}`;

    const projectTitleStr = project.title || project.name || 'Untitled Project';

    // Overdue check
    let isOverdue = false;
    if (project.invoiceDueDate && !['Fully Paid', 'Payment Received', 'Paid'].includes(project.paymentStatus)) {
      const dueDate = new Date(project.invoiceDueDate);
      dueDate.setHours(0,0,0,0);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (dueDate < today) {
        isOverdue = true;
      }
    }
    
    let overdueBadge = '';
    if (isOverdue && ['invoice_sent', 'waiting_payment'].includes(project.stage)) {
      overdueBadge = `
        <span class="client-status-badge" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; background: rgba(245, 158, 11, 0.15); color: #fde047; border: 1px solid rgba(245, 158, 11, 0.3);">
          ⚠️ Overdue
        </span>
      `;
    }

    let cardBody = '';

    // Header segment
    let deliveryBadge = '';
    const deliveryStages = ['client_review', 'revision', 'completed', 'waiting_payment'];
    if (deliveryStages.includes(project.stage || project.status)) {
      const delStatus = project.deliveryStatus || 'Not Submitted';
      let delColorStyle = 'background: rgba(139, 92, 246, 0.15); color: #c4b5fd;';
      if (delStatus === 'Not Submitted') {
        delColorStyle = 'background: rgba(255, 255, 255, 0.05); color: var(--text-muted);';
      } else if (delStatus === 'Draft Submitted') {
        delColorStyle = 'background: rgba(59, 130, 246, 0.15); color: #93c5fd;';
      } else if (delStatus === 'Waiting Feedback') {
        delColorStyle = 'background: rgba(245, 158, 11, 0.15); color: #fde047;';
      } else if (delStatus === 'Revision Requested' || delStatus === 'Revision Needed') {
        delColorStyle = 'background: rgba(239, 68, 68, 0.15); color: #fca5a5;';
      } else if (delStatus === 'Approved') {
        delColorStyle = 'background: rgba(16, 185, 129, 0.15); color: #6ee7b7;';
      } else if (delStatus === 'Final Delivered') {
        delColorStyle = 'background: rgba(16, 185, 129, 0.15); color: #6ee7b7;';
      } else if (delStatus === 'Handover Complete') {
        delColorStyle = 'background: rgba(139, 92, 246, 0.2); color: #d8b4fe; border: 1px solid rgba(139, 92, 246, 0.3);';
      }
      deliveryBadge = `
        <span class="client-status-badge" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; ${delColorStyle}">
          ${getIcon('folder', '', 10)} Delivery: ${delStatus}
        </span>
      `;
    }

    if (viewMode === 'detail') {
      cardBody += `
        <div class="card-header-tags" style="display: flex; gap: 6px; margin-bottom: 8px; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="card-tag ${tagClass}">${primaryTag}</span>
            ${deliveryBadge}
            ${overdueBadge}
          </div>
          <div style="display: flex; gap: 4px; align-items: center;">
            <span class="health-indicator-dot" style="width: 6px; height: 6px; border-radius: 50%; background-color: ${health.color};" title="Health: ${health.label}"></span>
            <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">${health.label}</span>
          </div>
        </div>
      `;
    } else {
      cardBody += `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div style="display: flex; gap: 4px; align-items: center;">
            <span class="health-indicator-dot" style="width: 6px; height: 6px; border-radius: 50%; background-color: ${health.color};"></span>
            <span style="font-size: 0.62rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${health.label}</span>
            ${overdueBadge}
          </div>
          ${deliveryBadge}
        </div>
      `;
    }

    // Title & Client with Minimize Toggle
    const state = this.store.getState();
    const clientObj = state.clients ? state.clients.find(c => c.id === project.clientId) : null;
    let clientMemoryBadges = '';
    if (viewMode === 'detail' && clientObj && clientObj.clientMemory) {
      const memory = clientObj.clientMemory;
      const badges = [];
      
      if (memory.preferredChannel) {
        badges.push(memory.preferredChannel);
      }
      if (memory.paymentReminderStyle) {
        badges.push(memory.paymentReminderStyle);
      } else if (memory.paymentBehavior && memory.paymentBehavior.toLowerCase().includes('reminder')) {
        badges.push('Needs reminder');
      }
      if (memory.revisionPattern) {
        const shortRev = memory.revisionPattern.length > 20 
          ? memory.revisionPattern.substring(0, 17) + '...' 
          : memory.revisionPattern;
        badges.push(shortRev);
      }
      
      if (badges.length > 0) {
        clientMemoryBadges = `
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; margin-bottom: 6px;">
            ${badges.slice(0, 2).map(b => `
              <span class="client-status-badge" style="font-size: 0.6rem; padding: 1px 4px; border-radius: 3px; background: rgba(139, 92, 246, 0.05); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.15);">
                🧠 ${b}
              </span>
            `).join('')}
          </div>
        `;
      }
    }

    cardBody += `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <h4 class="card-title" style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; font-family: 'Plus Jakarta Sans', sans-serif; flex: 1; margin-top: 0; line-height: 1.2;">${projectTitleStr}</h4>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button type="button" class="card-client-view-btn" style="background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: ${isPreview ? 'none' : 'flex'}; align-items: center; justify-content: center; border-radius: 4px; transition: all var(--transition-fast);" title="Preview Client Dashboard">
            ${getIcon('externalLink', '', 12)}
          </button>
          <button type="button" class="card-minimize-btn" style="background: none; border: none; padding: 2px; color: var(--text-muted); cursor: pointer; display: ${isPreview ? 'none' : 'flex'}; align-items: center; justify-content: center; border-radius: 4px; transition: all var(--transition-fast);" title="Minimize / Expand">
            ${getIcon(isMinimized ? 'chevronRight' : 'chevronDown', '', 14)}
          </button>
        </div>
      </div>
      
      <div class="card-client" style="font-size: 0.72rem; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
        <span class="manual-label">CLIENT:</span>
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;">${fullClientIdentity}</span>
      </div>
      ${clientMemoryBadges}
    `;

    // Collapsible Details wrapper
    cardBody += `<div class="card-collapsible-details">`;

    // Priority & Status Table block
    cardBody += `
      <div class="card-meta-row" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; font-size: 0.72rem; border-top: 1px solid rgba(255,255,255,0.02); padding-top: 6px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="manual-label">${t('projectModal.priority', 'PRIORITY')}:</span>
          <span class="priority-badge ${priorityClass}">${t('priority.' + priorityVal.toLowerCase(), priorityVal)}</span>
        </div>
        ${isPreview ? '' : `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="manual-label">${t('projectModal.stage', 'STAGE')}:</span>
          <span style="font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.02em;">${colName}</span>
        </div>
        `}
      </div>
    `;

    // Next Action
    const displayNextAction = project.nextAction || 'No next action';
    const isNextActionPlaceholder = !project.nextAction;
    cardBody += `
      <div class="card-next-action" style="font-size: 0.7rem; background: ${isNextActionPlaceholder ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)'}; border: 1px ${isNextActionPlaceholder ? 'dashed' : 'solid'} rgba(255,255,255,0.04); border-radius: 6px; padding: 6px 8px; color: var(--text-secondary); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="Next: ${displayNextAction}">
        <span class="manual-label" style="color: ${isNextActionPlaceholder ? 'var(--text-muted)' : 'var(--color-secondary)'};">NEXT:</span> ${displayNextAction}
      </div>
    `;

    // Stage-specific Invoice & Payment layouts
    if (project.stage === 'waiting_payment') {
      const payStatus = project.paymentStatus || 'Not Started';
      const invoiceDueStr = project.invoiceDueDate ? formatDate(project.invoiceDueDate) : 'No due date';
      const nextFollowUpStr = project.nextFollowUpDate ? formatDate(project.nextFollowUpDate) : 'None';
      const amountPaidVal = project.amountPaid || 0;
      const amountDueVal = project.amountDue || 0;
      const invAmtVal = project.invoiceAmount || 0;
      const hasReceipt = !!(project.receiptLink || project.paymentReceiptLink);
      
      if (viewMode === 'simple') {
        cardBody += `
          <div class="waiting-payment-compact" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; font-size: 0.7rem; color: var(--text-secondary); background: rgba(255,255,255,0.01); padding: 6px 8px; border-radius: 6px; border: 1px dashed rgba(255,255,255,0.04);">
            <div><strong style="color: var(--text-muted);">Status:</strong> ${payStatus}</div>
            <div><strong style="color: var(--text-muted);">Due Date:</strong> ${invoiceDueStr}</div>
            <div><strong style="color: var(--text-muted);">Next Follow-up:</strong> ${nextFollowUpStr}</div>
          </div>
        `;
      } else { // detail view
        cardBody += `
          <div class="waiting-payment-detail" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; font-size: 0.7rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
            <div><strong style="color: var(--text-muted);">Status:</strong> ${payStatus}</div>
            <div><strong style="color: var(--text-muted);">Due Date:</strong> ${invoiceDueStr}</div>
            <div><strong style="color: var(--text-muted);">Next Follow-up:</strong> ${nextFollowUpStr}</div>
            <div style="border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 6px; margin-top: 6px; display: grid; grid-template-columns: 1fr; gap: 2px;">
              <div><strong style="color: var(--text-muted);">Invoice #:</strong> ${project.invoiceNumber || 'N/A'}</div>
              <div><strong style="color: var(--text-muted);">Inv Amount:</strong> ${formatCurrency(invAmtVal)}</div>
              <div><strong style="color: var(--text-muted);">Amt Due:</strong> ${formatCurrency(amountDueVal)}</div>
              <div><strong style="color: var(--text-muted);">Receipt Proof:</strong> ${hasReceipt ? `<span style="color: var(--color-success); font-weight: 600;">Viewable</span>` : `<span style="color: var(--color-warning);">Missing</span>`}</div>
            </div>
          </div>
        `;
      }
    } else if (project.stage === 'invoice_sent') {
      const invFileMarkup = project.invoiceFileLink 
        ? `<a href="${project.invoiceFileLink}" target="_blank" rel="noopener noreferrer" style="color: var(--color-secondary); text-decoration: none; font-weight: 600;" onclick="event.stopPropagation();">Open Invoice</a>` 
        : '<span style="color: var(--text-muted);">None</span>';
      
      cardBody += `
        <div class="invoice-sent-detail" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; font-size: 0.7rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px; border: 1px solid var(--border-subtle);">
          <div><strong style="color: var(--text-muted);">Inv #:</strong> ${project.invoiceNumber || 'N/A'}</div>
          <div><strong style="color: var(--text-muted);">Inv Date:</strong> ${project.invoiceDate ? formatDate(project.invoiceDate) : 'N/A'}</div>
          <div><strong style="color: var(--text-muted);">Due Date:</strong> ${project.invoiceDueDate ? formatDate(project.invoiceDueDate) : 'N/A'}</div>
          <div><strong style="color: var(--text-muted);">Terms:</strong> ${project.paymentTerms || 'N/A'}</div>
          <div><strong style="color: var(--text-muted);">Invoice File:</strong> ${invFileMarkup}</div>
          
          <div style="display: flex; gap: 6px; margin-top: 6px;" class="card-ctas">
            <button type="button" class="btn btn-primary btn-card-cta-mark" style="font-size: 0.65rem; padding: 2px 6px; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25); flex: 1;">
              Mark Waiting
            </button>
            <button type="button" class="btn btn-secondary btn-card-cta-follow" style="font-size: 0.65rem; padding: 2px 6px; background: rgba(255,255,255,0.03); color: #fff; border-color: rgba(255,255,255,0.06); flex: 1;">
              Follow Up
            </button>
          </div>
        </div>
      `;
    }

    // Extra details (for Detail view mode)
    if (viewMode === 'detail') {
      // Progress Bar
      cardBody += `
        <div class="card-progress-section" style="margin-bottom: 8px; background: rgba(255,255,255,0.01); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.02);">
          <div class="progress-info" style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px;">
            <span>Tasks</span>
            <span>${completedChecklist}/${totalChecklist} (${progressPercent}%)</span>
          </div>
          <div class="progress-track" style="height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
            <div class="progress-bar" style="width: ${progressPercent}%; height: 100%; background: var(--color-primary); transition: width 0.3s ease;"></div>
          </div>
        </div>
      `;

      // Revision counts, meeting indicators, invoice logs count
      const hasFiles = project.briefLink || project.rawFileLink || project.draftFileLink || project.finalDeliveryLink;
      const hasMeeting = project.meetingLink;
      const hasInvoice = project.invoiceNumber || (project.invoices && project.invoices.length > 0);
      
      let indicatorIcons = '';
      if (hasFiles) indicatorIcons += `<span title="Has file links" style="color: var(--color-secondary); margin-left: 4px;">${getIcon('folder', '', 12)}</span>`;
      if (hasMeeting) indicatorIcons += `<span title="Has meeting link" style="color: var(--color-accent); margin-left: 4px;">${getIcon('clock', '', 12)}</span>`;
      if (hasInvoice) indicatorIcons += `<span title="Has invoices" style="color: var(--color-success); margin-left: 4px;">${getIcon('fileText', '', 12)}</span>`;

      // Client Approval Status Badge
      const approvalVal = project.clientApprovalStatus || 'Pending Review';
      let approvalDotColor = 'var(--color-warning)';
      let approvalTextColor = 'var(--text-secondary)';
      if (approvalVal === 'Approved') {
        approvalDotColor = 'var(--color-success)';
        approvalTextColor = 'var(--text-success)';
      } else if (approvalVal === 'Needs Revision') {
        approvalDotColor = 'var(--color-danger)';
        approvalTextColor = 'var(--color-danger)';
      }

      cardBody += `
        <div class="card-indicators-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 0.7rem; color: var(--text-muted); background: rgba(255,255,255,0.01); padding: 4px 6px; border-radius: 4px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            ${getIcon('refresh', '', 11)}
            <span>Revision: ${project.revisionCount || 0}/${project.maxRevision || 'TBD'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="client-status-badge" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; color: ${approvalTextColor}; display: inline-flex; align-items: center;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background-color: ${approvalDotColor}; display: inline-block; margin-right: 4px; flex-shrink: 0;"></span>
              ${approvalVal}
            </span>
            <div style="display: flex; align-items: center; gap: 2px; margin-left: 2px;">
              ${indicatorIcons}
            </div>
          </div>
        </div>
      `;
    }

    // Budget and footer
    let paymentLabel = project.paymentStatus || 'None';
    if (paymentLabel === 'None' || paymentLabel === 'Not invoiced') paymentLabel = 'Not Invoiced';
    else if (paymentLabel === 'DP paid' || paymentLabel === 'DP Paid') paymentLabel = 'DP Paid';
    else if (paymentLabel === 'Invoice overdue' || paymentLabel === 'Overdue') paymentLabel = 'Overdue';
    else if (paymentLabel === 'Waiting payment' || paymentLabel === 'Waiting Payment') paymentLabel = 'Waiting Payment';
    else if (paymentLabel === 'Paid' || paymentLabel === 'Fully Paid') paymentLabel = 'Paid';

    const isPaymentStage = ['invoice_sent', 'waiting_payment', 'completed'].includes(project.stage);
    let footerRightMarkup = '';

    if (isPaymentStage) {
      if (project.stage === 'completed') {
        footerRightMarkup = `
          <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: normal; margin-right: 2px;">Paid: ${formatMoney(project.budget, project.projectCurrency || 'IDR')}</span>
          <span class="client-status-badge ${paymentPillClass}" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px;">
            ${paymentLabel}
          </span>
        `;
      } else {
        const amountToDisplay = project.invoiceAmount || project.budget;
        const amountLabel = project.stage === 'invoice_sent' ? 'Invoice' : 'Due';
        const curToUse = project.invoiceAmount ? (project.invoiceCurrency || project.projectCurrency || 'IDR') : (project.projectCurrency || 'IDR');
        footerRightMarkup = `
          <span style="font-weight: 700; color: var(--text-primary); font-size: 0.72rem; font-family: 'Plus Jakarta Sans', sans-serif; margin-right: 2px;">${amountLabel}: ${formatMoney(amountToDisplay, curToUse)}</span>
          <span class="client-status-badge ${paymentPillClass}" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px;">
            ${paymentLabel}
          </span>
        `;
      }
    } else {
      if (viewMode === 'detail') {
        footerRightMarkup = `
          <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: normal; margin-right: 2px;">Est: ${formatMoney(project.budget, project.projectCurrency || 'IDR')}</span>
        `;
      } else {
        footerRightMarkup = '';
      }
    }

    cardBody += `
      <div class="card-footer" style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px; margin-top: 4px; font-size: 0.68rem;">
        <div class="card-footer-item ${dateWarningClass}" style="display: flex; align-items: center; gap: 4px; cursor: help;" title="Due Date">
          <span class="manual-label" style="margin-right: 2px;">DUE:</span>
          <span style="font-size: 0.68rem; font-weight: 600;">${dueDateMeta.text}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          ${footerRightMarkup}
        </div>
      </div>
    `;

    cardBody += `</div>`; // end of card-collapsible-details

    card.innerHTML = cardBody;

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

    // Mark as Waiting CTA
    const btnMark = card.querySelector('.btn-card-cta-mark');
    if (btnMark) {
      btnMark.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.updateProject(project.id, { stage: 'waiting_payment', paymentStatus: 'Waiting Payment' });
        if (window.app && window.app.triggerToast) {
          window.app.triggerToast("Project marked as Waiting Payment.", "text-success");
        }
        this.update();
      });
    }

    // Follow Up CTA
    const btnFollow = card.querySelector('.btn-card-cta-follow');
    if (btnFollow) {
      btnFollow.addEventListener('click', (e) => {
        e.stopPropagation();
        const invNum = project.invoiceNumber || 'N/A';
        const invAmt = project.invoiceAmount ? 'Rp ' + project.invoiceAmount.toLocaleString('id-ID') : '0';
        const dueDate = project.invoiceDueDate || 'N/A';
        const payMethod = project.paymentMethod || 'Bank Transfer';

        const msg = `Hi ${project.clientName || 'Client'},\n\nI hope you're having a great day. Just a quick reminder that invoice ${invNum} of ${invAmt} is currently awaiting payment. It is scheduled to be due on ${dueDate}.\n\nYou can complete the payment via ${payMethod}. Once done, please share the transfer receipt for verification.\n\nThanks so much,\n[Your Name]`;
        
        navigator.clipboard.writeText(msg)
          .then(() => {
            if (window.app && window.app.triggerToast) {
              window.app.triggerToast("Invoice follow-up copied.", "text-success");
            }
          })
          .catch(err => {
            console.error("Clipboard copy failed, using fallback:", err);
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = msg;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            try {
              document.execCommand('copy');
              if (window.app && window.app.triggerToast) {
                window.app.triggerToast("Invoice follow-up copied.", "text-success");
              }
            } catch (e2) {
              if (window.app && window.app.triggerToast) {
                window.app.triggerToast("Failed to copy message.", "text-danger");
              }
            }
            document.body.removeChild(tempTextarea);
          });
      });
    }

    // Handle Client View preview
    const clientViewBtn = card.querySelector('.card-client-view-btn');
    if (clientViewBtn) {
      clientViewBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening the project modal
        window.app.switchView('client-view', project.id);
      });
    }

    // Handle card minimize button toggle
    const minimizeBtn = card.querySelector('.card-minimize-btn');
    if (minimizeBtn && !isPreview) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening the project modal
        card.classList.toggle('minimized');
        const nowMinimized = card.classList.contains('minimized');
        if (nowMinimized) {
          this.minimizedCardIds.add(project.id);
        } else {
          this.minimizedCardIds.delete(project.id);
        }
        localStorage.setItem('alurkarya_minimized_cards', JSON.stringify(Array.from(this.minimizedCardIds)));
        minimizeBtn.innerHTML = getIcon(nowMinimized ? 'chevronRight' : 'chevronDown', '', 14);
      });
    }

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
                <option value="">-- Choose Client --</option>
                ${clientOptions}
                <option value="NEW_CLIENT">+ Register New Client</option>
              </select>
            </div>

            <div class="form-group d-none" id="new-client-name-group">
              <label for="p-new-client-name">New Client Name</label>
              <input type="text" id="p-new-client-name" class="form-control" placeholder="e.g. Sarah Connor">
            </div>

            <div class="form-group d-none" id="new-client-type-group">
              <label for="p-new-client-type">Client Type</label>
              <select id="p-new-client-type" class="form-control">
                <option value="General">General (Freelancer / Individual)</option>
                <option value="Corporate">Corporate (Company / Group)</option>
              </select>
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

            <div class="form-group tooltip-trigger">
              <label for="p-due">Deadline Date</label>
              <span class="tooltip-box">Nearest deadline to keep project on track.</span>
              <input type="date" id="p-due" class="form-control" required>
            </div>

            <div class="form-group">
              <label for="p-priority">Priority</label>
              <select id="p-priority" class="form-control">
                <option value="Low">Low Priority</option>
                <option value="Medium" selected>Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="TBD">TBD</option>
              </select>
            </div>

            <div class="form-group">
              <label for="p-category">Category</label>
              <select id="p-category" class="form-control">
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Production">Production</option>
                <option value="Marketing">Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Copywriting">Copywriting</option>
                <option value="CUSTOM_CATEGORY">Add custom category...</option>
              </select>
            </div>

            <div class="form-group d-none" id="custom-category-group">
              <label for="p-custom-category">Custom Category</label>
              <input type="text" id="p-custom-category" class="form-control" placeholder="e.g. Video Editing">
            </div>

            <div class="form-group">
              <label for="p-revs">Max Revisions Round</label>
              <input type="number" id="p-revs" class="form-control" value="3" min="1" max="10" required>
            </div>

            <div class="form-group tooltip-trigger">
              <label for="p-action">Next Action Tag</label>
              <span class="tooltip-box">Next action you need to perform.</span>
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
    const newClientTypeGroup = drawerOverlay.querySelector('#new-client-type-group');
    const newClientBusinessGroup = drawerOverlay.querySelector('#new-client-business-group');
    const newClientEmailGroup = drawerOverlay.querySelector('#new-client-email-group');
    
    select.addEventListener('change', (e) => {
      if (e.target.value === 'NEW_CLIENT') {
        newClientGroup.classList.remove('d-none');
        newClientTypeGroup.classList.remove('d-none');
        newClientBusinessGroup.classList.remove('d-none');
        newClientEmailGroup.classList.remove('d-none');
        drawerOverlay.querySelector('#p-new-client-name').setAttribute('required', 'true');
      } else {
        newClientGroup.classList.add('d-none');
        newClientTypeGroup.classList.add('d-none');
        newClientBusinessGroup.classList.add('d-none');
        newClientEmailGroup.classList.add('d-none');
        drawerOverlay.querySelector('#p-new-client-name').removeAttribute('required');
      }
    });

    const categorySelect = drawerOverlay.querySelector('#p-category');
    const customCategoryGroup = drawerOverlay.querySelector('#custom-category-group');
    categorySelect.addEventListener('change', (e) => {
      if (e.target.value === 'CUSTOM_CATEGORY') {
        customCategoryGroup.classList.remove('d-none');
        drawerOverlay.querySelector('#p-custom-category').setAttribute('required', 'true');
      } else {
        customCategoryGroup.classList.add('d-none');
        drawerOverlay.querySelector('#p-custom-category').removeAttribute('required');
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
      const maxRevisions = Number(form.querySelector('#p-revs').value);
      const nextAction = form.querySelector('#p-action').value;
      const description = form.querySelector('#p-desc').value;

      let clientId = select.value;
      let clientName = '';
      let clientType = 'General';

      if (clientId === 'NEW_CLIENT') {
        const newName = form.querySelector('#p-new-client-name').value.trim();
        const newType = form.querySelector('#p-new-client-type').value;
        const newBusiness = form.querySelector('#p-new-client-business').value.trim();
        const newEmail = form.querySelector('#p-new-client-email').value.trim();
        
        const client = this.store.addClient({
          name: newName,
          businessName: newBusiness,
          email: newEmail,
          status: 'Active',
          notes: `Type: ${newType}`
        });
        client.clientType = newType;
        this.store.saveState();

        clientId = client.id;
        clientName = client.name + (client.businessName ? ` (${client.businessName})` : '');
        clientType = newType;
      } else if (clientId) {
        const selectedClient = clients.find(c => c.id === clientId);
        if (selectedClient) {
          clientName = selectedClient.name + (selectedClient.businessName ? ` (${selectedClient.businessName})` : '');
          clientType = selectedClient.clientType || 'General';
        }
      }

      let category = form.querySelector('#p-category').value;
      let customCategory = '';
      if (category === 'CUSTOM_CATEGORY') {
        customCategory = form.querySelector('#p-custom-category').value.trim();
        category = customCategory || 'Custom';
      }

      this.store.addProject({
        title,
        clientId,
        clientName,
        clientType,
        customClientName: clientId === 'NEW_CLIENT' ? form.querySelector('#p-new-client-name').value.trim() : '',
        customCategory,
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

  createDashboardSummary() {
    const summarySection = document.createElement('div');
    summarySection.className = 'dashboard-summary-section';
    summarySection.style.cssText = 'background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 12px; backdrop-filter: var(--glass-backdrop); margin-bottom: 24px;';

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate start/end of current week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0,0,0,0);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

    // Restore today date object
    const currentToday = new Date();

    const state = this.store.getState();
    const { projects = [], invoices = [] } = state;

    // Filter projects & meetings & invoices
    const activeProjects = projects.filter(p => p.stage !== 'completed');

    // 1. Today
    const todayItems = [];
    activeProjects.forEach(p => {
      if (p.dueDate === todayStr && p.stage !== 'on_hold') {
        todayItems.push({ type: 'deadline', label: 'Deadline', title: p.title, projId: p.id });
      }
      if (p.meetingDate === todayStr) {
        todayItems.push({ type: 'meeting', label: 'Meeting', title: `${p.title} (${p.meetingTime || 'TBD'})`, projId: p.id });
      }
    });
    invoices.forEach(inv => {
      if (inv.dueDate === todayStr && inv.status !== 'Paid') {
        todayItems.push({ type: 'invoice', label: 'Invoice due', title: `${inv.invoiceNumber} (${inv.projectName})` });
      }
    });

    // 2. This Week
    const thisWeekItems = [];
    activeProjects.forEach(p => {
      if (p.dueDate && p.dueDate >= startOfWeekStr && p.dueDate <= endOfWeekStr && p.stage !== 'on_hold') {
        thisWeekItems.push({ type: 'deadline', label: 'Deadline', title: p.title, projId: p.id });
      }
      if (p.meetingDate && p.meetingDate >= startOfWeekStr && p.meetingDate <= endOfWeekStr) {
        thisWeekItems.push({ type: 'meeting', label: 'Meeting', title: `${p.title} (${p.meetingDate.split('-')[2]}/${p.meetingDate.split('-')[1]})`, projId: p.id });
      }
    });
    invoices.forEach(inv => {
      if (inv.dueDate && inv.dueDate >= startOfWeekStr && inv.dueDate <= endOfWeekStr && inv.status !== 'Paid') {
        thisWeekItems.push({ type: 'invoice', label: 'Invoice due', title: `${inv.invoiceNumber}` });
      }
    });

    // 3. Upcoming Meeting
    const upcomingMeetings = [];
    activeProjects.forEach(p => {
      if (p.meetingDate && p.meetingDate >= todayStr) {
        upcomingMeetings.push({
          date: p.meetingDate,
          time: p.meetingTime,
          title: p.title,
          projId: p.id,
          desc: `${p.meetingDate.split('-')[2]}/${p.meetingDate.split('-')[1]} @ ${p.meetingTime || 'TBD'}`
        });
      }
    });
    upcomingMeetings.sort((a, b) => (a.date + 'T' + (a.time || '00:00')).localeCompare(b.date + 'T' + (b.time || '00:00')));

    // 4. Due Soon
    const dueSoonItems = [];
    const sevenDaysLater = new Date(currentToday);
    sevenDaysLater.setDate(currentToday.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];
    activeProjects.forEach(p => {
      if (p.dueDate && p.dueDate >= todayStr && p.dueDate <= sevenDaysLaterStr && p.stage !== 'on_hold') {
        dueSoonItems.push({
          title: p.title,
          projId: p.id,
          desc: `Due ${p.dueDate.split('-')[2]}/${p.dueDate.split('-')[1]}`
        });
      }
    });

    // 5. Follow-up Needed
    const followUpNeededItems = [];
    // Overdue invoices
    invoices.forEach(inv => {
      if (inv.status === 'Overdue' || (inv.dueDate < todayStr && inv.status !== 'Paid')) {
        followUpNeededItems.push({
          type: 'invoice',
          title: `Overdue: ${inv.invoiceNumber}`,
          desc: `${inv.projectName}`
        });
      }
    });
    // On hold or projects with next follow up date overdue
    activeProjects.forEach(p => {
      if (p.stage === 'on_hold' && p.holdFollowUpDate && p.holdFollowUpDate <= todayStr) {
        followUpNeededItems.push({
          type: 'on_hold',
          title: `Hold: ${p.title}`,
          projId: p.id,
          desc: `Follow-up was ${p.holdFollowUpDate.split('-')[2]}/${p.holdFollowUpDate.split('-')[1]}`
        });
      } else if (p.nextFollowUpDate && p.nextFollowUpDate <= todayStr) {
        followUpNeededItems.push({
          type: 'general',
          title: `Follow-up: ${p.title}`,
          projId: p.id,
          desc: `Scheduled ${p.nextFollowUpDate.split('-')[2]}/${p.nextFollowUpDate.split('-')[1]}`
        });
      }
    });

    // 6. Waiting Payment
    const waitingPaymentItems = [];
    activeProjects.forEach(p => {
      if (p.stage === 'waiting_payment') {
        waitingPaymentItems.push({
          type: 'project',
          title: p.title,
          projId: p.id,
          desc: 'Awaiting payment kickoff',
          date: p.dueDate || '',
          value: p.budget || 0,
          nextFollowUpDate: p.nextFollowUpDate || '',
          isOverdue: false
        });
      }
    });
    invoices.forEach(inv => {
      if (inv.status === 'Sent' || inv.status === 'Overdue') {
        const isOverdue = inv.status === 'Overdue' || (inv.dueDate && inv.dueDate < todayStr);
        waitingPaymentItems.push({
          type: 'invoice',
          title: `Inv: ${inv.invoiceNumber}`,
          projId: inv.projectId,
          desc: `${inv.projectName}`,
          date: inv.dueDate || '',
          value: inv.amount || 0,
          nextFollowUpDate: '',
          isOverdue: isOverdue
        });
      }
    });

    // Priority Sort:
    // 1. Overdue invoices first
    // 2. Nearest due invoices (invoices with due dates)
    // 3. Projects with next follow-up date
    // 4. Highest value unpaid items (budget/amount descending)
    waitingPaymentItems.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      const aIsInvWithDate = a.type === 'invoice' && a.date;
      const bIsInvWithDate = b.type === 'invoice' && b.date;
      if (aIsInvWithDate && bIsInvWithDate) {
        return a.date.localeCompare(b.date);
      }
      if (aIsInvWithDate && !bIsInvWithDate) return -1;
      if (!aIsInvWithDate && bIsInvWithDate) return 1;

      const aHasFollowUp = a.type === 'project' && a.nextFollowUpDate;
      const bHasFollowUp = b.type === 'project' && b.nextFollowUpDate;
      if (aHasFollowUp && bHasFollowUp) {
        return a.nextFollowUpDate.localeCompare(b.nextFollowUpDate);
      }
      if (aHasFollowUp && !bHasFollowUp) return -1;
      if (!aHasFollowUp && bHasFollowUp) return 1;

      return b.value - a.value;
    });

    // Dynamic descriptions for each column
    let todayDesc = 'All caught up today';
    if (todayItems.length > 0) {
      const dCount = todayItems.filter(i => i.type === 'deadline').length;
      const mCount = todayItems.filter(i => i.type === 'meeting').length;
      const iCount = todayItems.filter(i => i.type === 'invoice').length;
      const parts = [];
      if (dCount > 0) parts.push(`${dCount} deadline${dCount > 1 ? 's' : ''}`);
      if (mCount > 0) parts.push(`${mCount} meeting${mCount > 1 ? 's' : ''}`);
      if (iCount > 0) parts.push(`${iCount} invoice${iCount > 1 ? 's' : ''}`);
      todayDesc = parts.join(', ');
    }

    let thisWeekDesc = 'No deadlines';
    if (thisWeekItems.length > 0) {
      const dCount = thisWeekItems.filter(i => i.type === 'deadline').length;
      const mCount = thisWeekItems.filter(i => i.type === 'meeting').length;
      const iCount = thisWeekItems.filter(i => i.type === 'invoice').length;
      const parts = [];
      if (dCount > 0) parts.push(`${dCount} deadline${dCount > 1 ? 's' : ''}`);
      if (mCount > 0) parts.push(`${mCount} meeting${mCount > 1 ? 's' : ''}`);
      if (iCount > 0) parts.push(`${iCount} invoice${iCount > 1 ? 's' : ''}`);
      thisWeekDesc = parts.join(', ');
    }

    let meetingsDesc = upcomingMeetings.length === 0 ? 'No meetings' : `${upcomingMeetings.length} session${upcomingMeetings.length > 1 ? 's' : ''} scheduled`;
    let dueSoonDesc = dueSoonItems.length === 0 ? 'No urgent deadlines' : `${dueSoonItems.length} project${dueSoonItems.length > 1 ? 's' : ''} due soon`;

    let followUpDesc = 'No actions required';
    if (followUpNeededItems.length > 0) {
      const overdueInvoices = followUpNeededItems.filter(i => i.type === 'invoice').length;
      const otherFollowUps = followUpNeededItems.filter(i => i.type !== 'invoice').length;
      if (overdueInvoices > 0 && otherFollowUps > 0) {
        followUpDesc = `${overdueInvoices} inv overdue, ${otherFollowUps} checks`;
      } else if (overdueInvoices > 0) {
        followUpDesc = `${overdueInvoices} invoice${overdueInvoices > 1 ? 's' : ''} overdue`;
      } else {
        followUpDesc = `${otherFollowUps} follow-up${otherFollowUps > 1 ? 's' : ''} due`;
      }
    }

    let waitingPaymentDesc = 'No pending payments';
    if (waitingPaymentItems.length > 0) {
      const invCount = waitingPaymentItems.filter(i => i.type === 'invoice').length;
      const projCount = waitingPaymentItems.filter(i => i.type === 'project').length;
      if (invCount > 0 && projCount > 0) {
        waitingPaymentDesc = `${invCount} inv, ${projCount} proj pending`;
      } else if (invCount > 0) {
        waitingPaymentDesc = `${invCount} invoice${invCount > 1 ? 's' : ''} pending`;
      } else {
        waitingPaymentDesc = `${projCount} project${projCount > 1 ? 's' : ''} pending`;
      }
    }

    // Helper function to generate standardized footer links
    const makeFooter = (extraCount, viewName, label) => {
      if (extraCount > 0) {
        return `
          <div class="summary-col-footer">
            <span class="summary-col-footer-link" onclick="window.app.switchView('${viewName}')">
              +${extraCount} more • View ${label}
            </span>
          </div>
        `;
      } else {
        return `
          <div class="summary-col-footer">
            <span class="summary-col-footer-link" onclick="window.app.switchView('${viewName}')">
              Open ${label}
            </span>
          </div>
        `;
      }
    };

    const todayFooter = makeFooter(todayItems.length - 3, 'planner', 'Planner');
    const thisWeekFooter = makeFooter(thisWeekItems.length - 3, 'planner', 'Planner');
    const meetingsFooter = makeFooter(upcomingMeetings.length - 3, 'planner', 'Planner');
    const dueSoonFooter = makeFooter(dueSoonItems.length - 3, 'planner', 'Planner');
    const followUpFooter = makeFooter(followUpNeededItems.length - 3, 'planner', 'Planner');
    const waitingPaymentFooter = makeFooter(waitingPaymentItems.length - 3, 'invoices', 'Ledger');

    summarySection.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 0.9rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; gap: 8px;">
          📊 Agenda & Schedule Summary
        </h3>
        <span style="font-size: 0.7rem; color: var(--text-muted);">Tip: More details can be accessed in the Planner Hub tab.</span>
      </div>
      <div class="dashboard-summary-grid">
        <!-- Column 1: Today -->
        <div class="summary-col">
          <span class="summary-col-title">Today</span>
          <span class="summary-col-desc" title="${todayDesc}">${todayDesc}</span>
          <div class="summary-col-items">
            ${todayItems.length === 0 ? '<span style="font-size: 0.68rem; color: var(--text-muted);">Clear</span>' : todayItems.slice(0, 3).map(item => `
              <div class="summary-item" ${item.projId ? `onclick="window.app.projectModal.open('${item.projId}')" style="cursor: pointer;"` : ''}>
                <strong>${item.title}</strong>
                <span>${item.label}</span>
              </div>
            `).join('')}
          </div>
          ${todayFooter}
        </div>

        <!-- Column 2: This Week -->
        <div class="summary-col">
          <span class="summary-col-title">This Week</span>
          <span class="summary-col-desc" title="${thisWeekDesc}">${thisWeekDesc}</span>
          <div class="summary-col-items">
            ${thisWeekItems.length === 0 ? '<span style="font-size: 0.68rem; color: var(--text-muted);">No deadlines</span>' : thisWeekItems.slice(0, 3).map(item => `
              <div class="summary-item" ${item.projId ? `onclick="window.app.projectModal.open('${item.projId}')" style="cursor: pointer;"` : ''}>
                <strong>${item.title}</strong>
                <span>${item.label}</span>
              </div>
            `).join('')}
          </div>
          ${thisWeekFooter}
        </div>

        <!-- Column 3: Meetings -->
        <div class="summary-col">
          <span class="summary-col-title">Meetings</span>
          <span class="summary-col-desc" title="${meetingsDesc}">${meetingsDesc}</span>
          <div class="summary-col-items">
            ${upcomingMeetings.length === 0 ? '<span style="font-size: 0.68rem; color: var(--text-muted);">No meetings</span>' : upcomingMeetings.slice(0, 3).map(item => `
              <div class="summary-item" onclick="window.app.projectModal.open('${item.projId}')" style="cursor: pointer;">
                <strong>${item.title}</strong>
                <span style="color: var(--color-secondary);">${item.desc}</span>
              </div>
            `).join('')}
          </div>
          ${meetingsFooter}
        </div>

        <!-- Column 4: Due Soon -->
        <div class="summary-col">
          <span class="summary-col-title">Due Soon</span>
          <span class="summary-col-desc" title="${dueSoonDesc}">${dueSoonDesc}</span>
          <div class="summary-col-items">
            ${dueSoonItems.length === 0 ? '<span style="font-size: 0.68rem; color: var(--text-muted);">Clear</span>' : dueSoonItems.slice(0, 3).map(item => `
              <div class="summary-item" onclick="window.app.projectModal.open('${item.projId}')" style="cursor: pointer;">
                <strong>${item.title}</strong>
                <span style="color: var(--color-warning);">${item.desc}</span>
              </div>
            `).join('')}
          </div>
          ${dueSoonFooter}
        </div>

        <!-- Column 5: Follow-up -->
        <div class="summary-col">
          <span class="summary-col-title">Follow-up</span>
          <span class="summary-col-desc" title="${followUpDesc}">${followUpDesc}</span>
          <div class="summary-col-items">
            ${followUpNeededItems.length === 0 ? '<span style="font-size: 0.68rem; color: var(--text-muted);">Clear</span>' : followUpNeededItems.slice(0, 3).map(item => `
              <div class="summary-item" ${item.projId ? `onclick="window.app.projectModal.open('${item.projId}')" style="cursor: pointer;"` : ''}>
                <strong>${item.title}</strong>
                <span style="color: var(--color-danger);">${item.desc}</span>
              </div>
            `).join('')}
          </div>
          ${followUpFooter}
        </div>

        <!-- Column 6: Waiting Payment -->
        <div class="summary-col">
          <span class="summary-col-title">Waiting Payment</span>
          <span class="summary-col-desc" title="${waitingPaymentDesc}">${waitingPaymentDesc}</span>
          <div class="summary-col-items">
            ${waitingPaymentItems.length === 0 ? '<span style="font-size: 0.68rem; color: var(--text-muted);">Clear</span>' : waitingPaymentItems.slice(0, 3).map(item => `
              <div class="summary-item" ${item.projId ? `onclick="window.app.projectModal.open('${item.projId}')" style="cursor: pointer;"` : ''}>
                <strong>${item.title}</strong>
                <span style="color: var(--color-success);">${item.desc}</span>
              </div>
            `).join('')}
          </div>
          ${waitingPaymentFooter}
        </div>
      </div>
    `;

    return summarySection;
  }

  renderOnHoldSection() {
    const onHoldMount = document.getElementById('on-hold-projects-mount');
    if (!onHoldMount) return;

    onHoldMount.innerHTML = '';

    const state = this.store.getState();
    const onHoldProjects = state.projects.filter(p => p.stage === 'on_hold');

    if (onHoldProjects.length === 0) {
      onHoldMount.style.display = 'none';
      return;
    }

    onHoldMount.style.display = 'block';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'margin-top: 24px; background: rgba(30, 41, 59, 0.15); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-lg); padding: 16px; display: flex; flex-direction: column; gap: 12px;';

    const isCollapsed = localStorage.getItem('alurkarya_onhold_collapsed') === 'true';

    wrapper.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;" id="onhold-header-toggle">
        <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          ⏸️ On Hold Projects <span class="column-badge" style="font-size: 0.65rem;">${onHoldProjects.length}</span>
        </h3>
        <span style="font-size: 0.72rem; color: var(--text-muted);" id="onhold-toggle-label">${isCollapsed ? 'View Details' : 'Hide Details'}</span>
      </div>
      <div id="onhold-projects-list-container" style="display: ${isCollapsed ? 'none' : 'flex'}; flex-direction: column; gap: 10px;">
        <span class="stat-subtext" style="display: block; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 4px;">
          This project is temporarily on hold. Add a hold reason so the project does not get lost from tracking. Set a follow-up date to remind you when the project needs to be checked again.
        </span>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px;" id="onhold-grid"></div>
      </div>
    `;

    const toggle = wrapper.querySelector('#onhold-header-toggle');
    toggle.addEventListener('click', () => {
      const container = wrapper.querySelector('#onhold-projects-list-container');
      const label = wrapper.querySelector('#onhold-toggle-label');
      const collapsed = container.style.display === 'none';
      container.style.display = collapsed ? 'flex' : 'none';
      label.textContent = collapsed ? 'Hide Details' : 'View Details';
      localStorage.setItem('alurkarya_onhold_collapsed', String(!collapsed));
    });

    const grid = wrapper.querySelector('#onhold-grid');

    onHoldProjects.forEach(p => {
      const card = this.createOnHoldCard(p);
      grid.appendChild(card);
    });

    onHoldMount.appendChild(wrapper);
  }

  createOnHoldCard(project) {
    const card = document.createElement('div');
    card.className = 'focus-item-row';
    card.style.cssText = 'padding: 14px; border-radius: var(--border-radius-md); background: var(--bg-surface); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 10px; cursor: pointer; transition: all var(--transition-fast);';

    card.addEventListener('click', () => this.onCardClick(project.id));

    const title = project.title || project.name || 'Untitled Project';
    const clientName = project.clientName || project.customClientName || 'No client selected';
    const holdReason = project.holdReason || 'No hold reason';
    const holdDate = project.holdDate ? formatDate(project.holdDate) : 'TBD';
    const holdFollowUpDate = project.holdFollowUpDate ? formatDate(project.holdFollowUpDate) : 'TBD';
    const deadline = project.dueDate ? formatDate(project.dueDate) : 'No deadline';
    const priority = project.priority || 'TBD';
    
    let priorityClass = 'priority-tbd';
    if (priority === 'Low') priorityClass = 'priority-low';
    else if (priority === 'Medium') priorityClass = 'priority-medium';
    else if (priority === 'High') priorityClass = 'priority-high';
    else if (priority === 'Urgent') priorityClass = 'priority-urgent';

    let paymentLabel = project.paymentStatus || 'None';
    if (paymentLabel === 'None' || paymentLabel === 'Not invoiced') paymentLabel = 'Not Invoiced';
    else if (paymentLabel === 'Paid' || paymentLabel === 'Fully Paid') paymentLabel = 'Paid';
    else if (paymentLabel === 'DP paid' || paymentLabel === 'DP Paid') paymentLabel = 'DP Paid';
    else if (paymentLabel === 'Invoice overdue' || paymentLabel === 'Overdue') paymentLabel = 'Overdue';
    else if (paymentLabel === 'Waiting payment' || paymentLabel === 'Waiting Payment') paymentLabel = 'Waiting Payment';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
        <div>
          <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">${title}</h4>
          <span style="font-size: 0.72rem; color: var(--text-secondary); display: block; margin-top: 2px;">Client: ${clientName}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          <span class="priority-badge ${priorityClass}" style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px;">${t('priority.' + priority.toLowerCase(), priority)}</span>
        </div>
      </div>

      <div style="font-size: 0.72rem; color: var(--text-secondary); background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 8px; display: flex; flex-direction: column; gap: 4px;">
        <div>
          <strong style="color: var(--color-primary);">Hold Reason:</strong>
          <span style="color: var(--text-secondary); font-weight: 500;">${holdReason}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.02); padding-top: 4px;">
          <div><strong style="color: var(--text-muted);">Hold Date:</strong> <span style="color: var(--text-secondary);">${holdDate}</span></div>
          <div><strong style="color: var(--text-muted);">Follow Up:</strong> <span style="color: var(--text-secondary);">${holdFollowUpDate}</span></div>
          <div><strong style="color: var(--text-muted);">Deadline:</strong> <span style="color: var(--text-secondary);">${deadline}</span></div>
          <div><strong style="color: var(--text-muted);">Payment:</strong> <span style="color: var(--text-secondary);">${paymentLabel}</span></div>
        </div>
      </div>

      <div style="display: flex; gap: 8px;" class="onhold-actions-wrapper">
        <button type="button" class="btn btn-primary btn-sm" id="btn-resume-project-card" style="flex: 1; padding: 4px; font-size: 0.72rem; justify-content: center; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
          Resume Project
        </button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-wait-client-project-card" style="flex: 1; padding: 4px; font-size: 0.72rem; justify-content: center;">
          Waiting Client
        </button>
      </div>
    `;

    // Add action buttons logic
    const resumeBtn = card.querySelector('#btn-resume-project-card');
    const moveBtn = card.querySelector('#btn-wait-client-project-card');

    resumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.updateProject(project.id, { stage: 'in_progress' });
      this.onTriggerToast(t('toast.projectResumed', 'Project resumed (In Progress).'), 'text-success');
      this.update();
    });

    moveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.updateProject(project.id, { stage: 'client_review' });
      this.onTriggerToast(t('toast.projectMovedClientReview', 'Project moved to Client Review.'), 'text-success');
      this.update();
    });

    return card;
  }
}
