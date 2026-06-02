/* ==========================================================================
   FREELANCER PROJECT OS - WEEKLY FOCUS VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate, getDueDateStatus } from '../utils.js';

export class WeeklyFocusView {
  /**
   * @param {HTMLElement} container - Target content mounting box
   * @param {object} store - Workspace central store reference
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onTriggerToast = onTriggerToast;
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const viewEl = document.createElement('div');
    viewEl.className = 'client-hub-viewport';

    // Page Intro with warm freelancer friendly copywriting
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.innerHTML = `
      <h2>Weekly Focus</h2>
      <p>See your priority projects, upcoming deadlines, pending revisions, and client follow-ups for this week.</p>
    `;
    viewEl.appendChild(introBox);

    // Master Focus Grid
    const gridEl = document.createElement('div');
    gridEl.className = 'focus-grid-layout';
    viewEl.appendChild(gridEl);

    this.container.appendChild(viewEl);

    this.renderFocusGrid(gridEl);
  }

  renderFocusGrid(gridEl) {
    const state = this.store.getState();
    const { projects, invoices, weeklyReflections } = state;

    // 1. Top 3 Priorities: High priority, incomplete projects
    const topPriorities = projects
      .filter(p => p.stage !== 'completed' && p.priority === 'High')
      .slice(0, 3);

    // 2. Deadlines This Week: Due dates within next 7 days, or overdue, incomplete
    const deadlinesThisWeek = projects.filter(p => {
      if (p.stage === 'completed') return false;
      const status = getDueDateStatus(p.dueDate);
      return status.isOverdue || (status.daysDiff >= 0 && status.daysDiff <= 7);
    });

    // 3. Waiting for Client Review: Projects in stage "client_review"
    const clientReviews = projects.filter(p => p.stage === 'client_review');

    // 4. Revisions to Finish: Projects in stage "revision"
    const revisionsToComplete = projects.filter(p => p.stage === 'revision');

    // 5. Invoices to Send: Projects in active stages (in_progress, client_review, revision) with NO invoices drafted or sent
    const invoicesToSend = projects.filter(p => 
      ['in_progress', 'client_review', 'revision'].includes(p.stage) && 
      (!p.invoices || p.invoices.length === 0)
    );

    // 6. Payments to Follow Up: Invoices that are Sent or Overdue
    const overduePayments = invoices.filter(inv => ['Sent', 'Overdue'].includes(inv.status));

    // 7. Stuck Projects: Projects overdue or in revision rounds exceeding max revision round limit
    const stuckProjects = projects.filter(p => {
      if (p.stage === 'completed') return false;
      const due = getDueDateStatus(p.dueDate);
      const isRevisionStuck = p.stage === 'revision' && p.revisionRound >= p.maxRevisionRounds;
      return due.isOverdue || isRevisionStuck;
    });

    // --- RENDER COLUMNS ---

    // Column Left: Priorities & Reflections Journal
    const colLeft = document.createElement('div');
    colLeft.style.display = 'flex';
    colLeft.style.flexDirection = 'column';
    colLeft.style.gap = '20px';

    // A. Priorities Widget
    const prioritiesBox = document.createElement('div');
    prioritiesBox.className = 'focus-module-box';
    prioritiesBox.innerHTML = `
      <h3 style="font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('layers', 'text-danger', 18)} Top 3 Priority Projects
      </h3>
      <div class="focus-row-list" id="focus-priorities-list"></div>
    `;
    const prioritiesList = prioritiesBox.querySelector('#focus-priorities-list');
    
    if (topPriorities.length === 0) {
      prioritiesList.innerHTML = `
        <span class="stat-subtext" style="display: block; padding: 16px 0; text-align: center;">
          No high priority projects logged this week. Awesome job!
        </span>
      `;
    } else {
      topPriorities.forEach(p => {
        const item = document.createElement('div');
        item.className = 'focus-item-row';
        item.innerHTML = `
          <div>
            <span class="focus-item-title">${p.title}</span>
            <span class="focus-item-meta">Client: ${p.clientName} | Budget: ${formatCurrency(p.budget, p.currency)}</span>
          </div>
          <span class="priority-badge priority-high">High</span>
        `;
        prioritiesList.appendChild(item);
      });
    }
    colLeft.appendChild(prioritiesBox);

    // B. Reflections Journal Box
    const reflectionsBox = document.createElement('div');
    reflectionsBox.className = 'focus-module-box';
    reflectionsBox.innerHTML = `
      <h3 style="font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('edit', 'text-success', 18)} Weekly Reflection Notes
      </h3>
      <span class="stat-subtext" style="margin-top: -8px; display: block;">
        Journal your wins, challenges, and client learnings to grow your freelance business. (Auto-saves on blur)
      </span>
      <textarea class="reflections-input" id="weekly-journal" placeholder="How is your freelance week going? Write down learnings, achievements...">${weeklyReflections}</textarea>
    `;
    const journalTextarea = reflectionsBox.querySelector('#weekly-journal');
    
    journalTextarea.addEventListener('blur', (e) => {
      this.store.updateWeeklyReflections(e.target.value);
      this.onTriggerToast('Reflection journal saved', 'text-success');
    });
    
    colLeft.appendChild(reflectionsBox);
    gridEl.appendChild(colLeft);

    // Column Right: Action checklist modules
    const colRight = document.createElement('div');
    colRight.style.display = 'flex';
    colRight.style.flexDirection = 'column';
    colRight.style.gap = '20px';

    const createFocusModule = (title, icon, listData, emptyMsg, renderItemFn, iconColorClass = '') => {
      const box = document.createElement('div');
      box.className = 'focus-module-box';
      box.innerHTML = `
        <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          ${getIcon(icon, iconColorClass, 16)} ${title}
          <span class="column-badge" style="font-size: 0.65rem;">${listData.length}</span>
        </h3>
        <div class="focus-row-list"></div>
      `;
      const listContainer = box.querySelector('.focus-row-list');
      
      if (listData.length === 0) {
        listContainer.innerHTML = `
          <span class="stat-subtext" style="display: block; padding: 4px 0;">
            ${emptyMsg}
          </span>
        `;
      } else {
        listData.forEach(item => {
          const row = renderItemFn(item);
          listContainer.appendChild(row);
        });
      }
      return box;
    };

    // 1. Deadlines widget
    const deadlinesMod = createFocusModule(
      'Deadlines This Week',
      'clock',
      deadlinesThisWeek,
      'No tight project deadlines this week.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        const dueStatus = getDueDateStatus(p.dueDate);
        const warning = dueStatus.isOverdue ? 'text-danger' : 'text-warning';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Client: ${p.clientName}</span>
          </div>
          <span class="stat-subtext ${warning}" style="font-weight: 700; font-size: 0.72rem;">${dueStatus.text}</span>
        `;
        return row;
      },
      'text-danger'
    );
    colRight.appendChild(deadlinesMod);

    // 2. Client Review widget
    const reviewsMod = createFocusModule(
      'Waiting for Client Review',
      'user',
      clientReviews,
      'No deliverables waiting under client review.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Next action: ${p.nextAction || 'Wait for review'}</span>
          </div>
          <span class="client-status-badge status-active" style="font-size: 0.65rem;">Reviewing</span>
        `;
        return row;
      },
      'text-warning'
    );
    colRight.appendChild(reviewsMod);

    // 3. Revisions to Finish
    const revisionsMod = createFocusModule(
      'Revisions to Finish',
      'refresh',
      revisionsToComplete,
      'Nice! No project revision notes logged.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Notes: ${p.revisionNotes || 'Typography adjustments'}</span>
          </div>
          <span class="client-status-badge status-lead text-danger" style="font-size: 0.65rem;">Rev: ${p.revisionRound}/${p.maxRevisionRounds}</span>
        `;
        return row;
      },
      'text-danger'
    );
    colRight.appendChild(revisionsMod);

    // 4. Invoices to Send
    const invoicesToSendMod = createFocusModule(
      'Invoices to Send',
      'fileText',
      invoicesToSend,
      'All active projects are fully billed. Good tracking!',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Client: ${p.clientName} | Budget: ${formatCurrency(p.budget, p.currency)}</span>
          </div>
          <span class="client-status-badge status-completed" style="font-size: 0.65rem;">Bill Draft</span>
        `;
        return row;
      },
      'text-success'
    );
    colRight.appendChild(invoicesToSendMod);

    // 5. Payments to Follow Up
    const followUpPaymentsMod = createFocusModule(
      'Payments to Follow Up',
      'fileText',
      overduePayments,
      'No unpaid invoices overdue. Cashflow is clear!',
      (inv) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        const color = inv.status === 'Overdue' ? 'status-lead text-danger' : 'status-active';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${inv.invoiceNumber} - ${inv.projectName}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Value: ${formatCurrency(inv.amount, inv.currency)} | Due: ${formatDate(inv.dueDate)}</span>
          </div>
          <span class="client-status-badge ${color}" style="font-size: 0.65rem;">${inv.status}</span>
        `;
        return row;
      },
      'text-danger'
    );
    colRight.appendChild(followUpPaymentsMod);

    // 6. Stuck Projects
    const stuckMod = createFocusModule(
      'Stuck Projects',
      'alert',
      stuckProjects,
      'Awesome! No blocked projects.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Next action: ${p.nextAction || 'Email client'}</span>
          </div>
          <span class="priority-badge priority-high">Stuck</span>
        `;
        return row;
      },
      'text-danger'
    );
    colRight.appendChild(stuckMod);

    gridEl.appendChild(colRight);
  }
}
