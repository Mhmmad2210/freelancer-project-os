/* ==========================================================================
   FREELANCER PROJECT OS - WEEKLY FOCUS VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate, getDueDateStatus, getLocalizedDueDateStatus, isOutsideWorkingHours } from '../utils.js';

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
      <p>Lihat prioritas project, tenggat waktu terdekat, revisi pending, dan pengingat follow-up klien minggu ini.</p>
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

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Determine selected week from localStorage
    let selectedWeekStart = localStorage.getItem('alurkarya_selected_week');
    if (!selectedWeekStart) {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(today.setDate(diff));
      mon.setHours(0,0,0,0);
      selectedWeekStart = mon.toISOString().split('T')[0];
      localStorage.setItem('alurkarya_selected_week', selectedWeekStart);
    }
    const weekStartObj = new Date(selectedWeekStart);
    const weekEndObj = new Date(weekStartObj);
    weekEndObj.setDate(weekStartObj.getDate() + 6);
    weekEndObj.setHours(23, 59, 59, 999);
    const weekEndStr = weekEndObj.toISOString().split('T')[0];

    // Priority score calculator
    const getPriorityScore = (p) => {
      const isOverdue = p.dueDate && p.dueDate < todayStr;
      const isDueThisWeek = p.dueDate && p.dueDate >= selectedWeekStart && p.dueDate <= weekEndStr;
      const hasMeetingThisWeek = p.meetingDate && p.meetingDate >= selectedWeekStart && p.meetingDate <= weekEndStr;
      const hasInvoiceFollowUpThisWeek = p.invoiceDueDate && p.invoiceDueDate >= selectedWeekStart && p.invoiceDueDate <= weekEndStr;
      const isOnHoldFollowUpThisWeek = p.stage === 'on_hold' && p.holdFollowUpDate && p.holdFollowUpDate >= selectedWeekStart && p.holdFollowUpDate <= weekEndStr;
      const isHighUrgent = p.priority === 'High' || p.priority === 'Urgent';
      const hasNextAction = !!p.nextAction;

      if (isOverdue) return 100;
      if (isDueThisWeek) return 90;
      if (hasMeetingThisWeek) return 80;
      if (hasInvoiceFollowUpThisWeek) return 70;
      if (isOnHoldFollowUpThisWeek) return 60;
      if (isHighUrgent) return 50;
      if (hasNextAction) return 40;
      return 10;
    };

    // Filter projects for weekly focus main checklist
    const focusProjects = projects.filter(p => {
      if (p.stage === 'completed') return false;

      const isOverdue = p.dueDate && p.dueDate < todayStr;
      const isDueThisWeek = p.dueDate && p.dueDate >= selectedWeekStart && p.dueDate <= weekEndStr;
      const hasMeetingThisWeek = p.meetingDate && p.meetingDate >= selectedWeekStart && p.meetingDate <= weekEndStr;
      const hasInvoiceFollowUpThisWeek = p.invoiceDueDate && p.invoiceDueDate >= selectedWeekStart && p.invoiceDueDate <= weekEndStr;
      const isOnHoldFollowUpThisWeek = p.stage === 'on_hold' && p.holdFollowUpDate && p.holdFollowUpDate >= selectedWeekStart && p.holdFollowUpDate <= weekEndStr;
      const isHighUrgent = p.priority === 'High' || p.priority === 'Urgent';
      const hasNextAction = !!p.nextAction;

      return isOverdue || isDueThisWeek || hasMeetingThisWeek || hasInvoiceFollowUpThisWeek || isOnHoldFollowUpThisWeek || isHighUrgent || hasNextAction;
    });

    focusProjects.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

    // Deadlines This Week: Due dates within selected week, or overdue, incomplete
    const deadlinesThisWeek = projects.filter(p => {
      if (p.stage === 'completed' || p.stage === 'on_hold') return false;
      const status = getLocalizedDueDateStatus(p.dueDate);
      const isOverdue = status.status === 'overdue';
      const isThisWeek = p.dueDate && p.dueDate >= selectedWeekStart && p.dueDate <= weekEndStr;
      return isOverdue || isThisWeek;
    });

    // Waiting for Client Review: Projects in stage "client_review"
    const clientReviews = projects.filter(p => p.stage === 'client_review');

    // Revisions to Finish: Projects in stage "revision"
    const revisionsToComplete = projects.filter(p => p.stage === 'revision');

    // Invoices to Send: Projects in active stages (in_progress, client_review, revision) with NO invoices drafted or sent
    const invoicesToSend = projects.filter(p => 
      ['in_progress', 'client_review', 'revision'].includes(p.stage) && 
      (!p.invoices || p.invoices.length === 0)
    );

    // Payments to Follow Up: Invoices that are Sent or Overdue
    const overduePayments = invoices.filter(inv => ['Sent', 'Overdue'].includes(inv.status));

    // Stuck Projects: Projects overdue or in revision rounds exceeding max revision round limit
    const stuckProjects = projects.filter(p => {
      if (p.stage === 'completed') return false;
      const due = getLocalizedDueDateStatus(p.dueDate);
      const isRevisionStuck = p.stage === 'revision' && p.revisionRound >= p.maxRevisionRounds;
      return due.status === 'overdue' || isRevisionStuck;
    });

    // --- RENDER COLUMNS ---

    // Column Left: Priorities & Reflections Journal
    const colLeft = document.createElement('div');
    colLeft.style.display = 'flex';
    colLeft.style.flexDirection = 'column';
    colLeft.style.gap = '20px';

    // A. Priorities Widget (Fokus Minggu Ini)
    const prioritiesBox = document.createElement('div');
    prioritiesBox.className = 'focus-module-box';
    prioritiesBox.innerHTML = `
      <h3 style="font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
        ${getIcon('layers', 'text-danger', 18)} Fokus Minggu Ini
      </h3>
      <span class="stat-subtext" style="margin-top: -8px; display: block; margin-bottom: 12px; font-size: 0.72rem; line-height: 1.45; color: var(--text-secondary);">
        💡 <strong>Tips Mentor:</strong> Weekly Focus membantumu memilah project mana yang harus disentuh duluan minggu ini agar cashflow tetap aman.
      </span>
      <div class="focus-row-list" id="focus-priorities-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
    `;
    const prioritiesList = prioritiesBox.querySelector('#focus-priorities-list');
    
    if (focusProjects.length === 0) {
      prioritiesList.innerHTML = `
        <span class="stat-subtext" style="display: block; padding: 16px 0; text-align: center;">
          Tidak ada project aktif yang perlu diperhatikan minggu ini. Kerja bagus!
        </span>
      `;
    } else {
      focusProjects.forEach(p => {
        const item = document.createElement('div');
        item.className = 'focus-item-row';
        item.style.cssText = 'padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px; background: rgba(255,255,255,0.01);';
        
        const dueStatus = getLocalizedDueDateStatus(p.dueDate);
        let dateWarningClass = 'text-muted';
        if (dueStatus.status === 'overdue' || dueStatus.status === 'today') {
          dateWarningClass = 'text-danger';
        } else if (dueStatus.status === 'soon') {
          dateWarningClass = 'text-warning';
        }

        const priorityVal = p.priority || 'TBD';
        let priorityClass = 'priority-tbd';
        if (priorityVal === 'Low') priorityClass = 'priority-low';
        else if (priorityVal === 'Medium') priorityClass = 'priority-medium';
        else if (priorityVal === 'High') priorityClass = 'priority-high';
        else if (priorityVal === 'Urgent') priorityClass = 'priority-urgent';

        // Set Next Action Label and hold followup notification
        let nextActionLabel = p.nextAction || 'TBD';
        if (p.stage === 'on_hold') {
          const isFollowUpThisWeek = p.holdFollowUpDate && p.holdFollowUpDate >= selectedWeekStart && p.holdFollowUpDate <= weekEndStr;
          if (isFollowUpThisWeek) {
            nextActionLabel = 'Follow up On Hold Project';
          }
        }
        
        // Stage labeling
        const stageMap = {
          'new_lead': 'New Lead',
          'proposal_sent': 'Proposal Sent',
          'in_progress': 'In Progress',
          'client_review': 'Client Review',
          'revision': 'Revision',
          'invoice_sent': 'Invoice Sent',
          'waiting_payment': 'Waiting Payment',
          'on_hold': 'On Hold'
        };
        const stageLabel = stageMap[p.stage] || p.stage;

        let focusDetailsMarkup = '';
        const availability = this.store.getState().availability;
        if (p.meetingDate && p.meetingDate >= selectedWeekStart && p.meetingDate <= weekEndStr) {
          const isOutside = isOutsideWorkingHours(p.meetingDate, p.meetingTime, availability);
          const outsideWarning = isOutside ? ' <span style="color: var(--color-danger); font-size: 0.6rem; font-weight: 700; border: 1px solid var(--color-danger); border-radius: 4px; padding: 1px 4px; margin-left: 4px;">Di luar jam kerja</span>' : '';
          focusDetailsMarkup += `
            <div style="margin-top: 2px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; color: var(--color-secondary);">
              <span class="manual-label" style="color: var(--color-secondary);">MEETING:</span>
              <span style="font-weight: 600;">${formatDate(p.meetingDate)} at ${p.meetingTime || 'TBD'} (${p.meetingType || 'Meet'})${outsideWarning}</span>
            </div>
          `;
        }
        if (p.invoiceDueDate && p.invoiceDueDate >= selectedWeekStart && p.invoiceDueDate <= weekEndStr) {
          focusDetailsMarkup += `
            <div style="margin-top: 2px; display: flex; align-items: center; gap: 4px; color: var(--color-success);">
              <span class="manual-label" style="color: var(--color-success);">INVOICE DUE:</span>
              <span style="font-weight: 600;">${formatDate(p.invoiceDueDate)}</span>
            </div>
          `;
        }
        if (p.stage === 'on_hold' && p.holdFollowUpDate && p.holdFollowUpDate >= selectedWeekStart && p.holdFollowUpDate <= weekEndStr) {
          focusDetailsMarkup += `
            <div style="margin-top: 2px; display: flex; align-items: center; gap: 4px; color: var(--text-muted);">
              <span class="manual-label" style="color: var(--text-muted);">ON HOLD FOLLOW UP:</span>
              <span style="font-weight: 600;">${formatDate(p.holdFollowUpDate)}</span>
            </div>
          `;
        }

        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.88rem; font-weight: 700; color: var(--text-primary);">${p.title}</h4>
              <span style="font-size: 0.7rem; color: var(--text-secondary); display: block; margin-top: 2px;">Klien: ${p.clientName || 'Belum pilih client'} | Stage: ${stageLabel}</span>
            </div>
            <span class="priority-badge ${priorityClass}">${priorityVal}</span>
          </div>
          
          <div style="font-size: 0.7rem; display: flex; flex-direction: column; gap: 4px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 8px; border-radius: 6px;">
            <div>
              <span class="manual-label" style="color: var(--color-primary);">NEXT:</span>
              <span style="color: var(--text-secondary); font-weight: 500;">${nextActionLabel}</span>
            </div>
            <div style="margin-top: 2px; display: flex; align-items: center; gap: 4px;">
              <span class="manual-label ${dateWarningClass}">DUE:</span>
              <span class="${dateWarningClass}" style="font-weight: 600;">${dueStatus.text}</span>
            </div>
            ${focusDetailsMarkup}
          </div>
        `;
        prioritiesList.appendChild(item);
      });
    }
    colLeft.appendChild(prioritiesBox);

    // B. Reflections Journal Box
    const reflectionsBox = document.createElement('div');
    reflectionsBox.className = 'focus-module-box';
    reflectionsBox.innerHTML = `
      <h3 style="font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
        ${getIcon('edit', 'text-success', 18)} Catatan Refleksi Mingguan
      </h3>
      <span class="stat-subtext" style="margin-top: -8px; display: block;">
        Tulis keberhasilan, tantangan, dan pembelajaran klien minggu ini untuk mengembangkan bisnismu. (Auto-save)
      </span>
      <textarea class="reflections-input" id="weekly-journal" placeholder="Bagaimana jalannya freelance minggu ini? Catat pembelajaran, pencapaian...">${weeklyReflections}</textarea>
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
        <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
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
      'Tenggat Waktu Minggu Ini',
      'clock',
      deadlinesThisWeek,
      'Tidak ada deadline project yang mendesak minggu ini.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        const dueStatus = getLocalizedDueDateStatus(p.dueDate);
        let warning = 'text-muted';
        if (dueStatus.status === 'overdue' || dueStatus.status === 'today') {
          warning = 'text-danger';
        } else if (dueStatus.status === 'soon') {
          warning = 'text-warning';
        }
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
      'Menunggu Review Client',
      'user',
      clientReviews,
      'Tidak ada deliverable yang sedang ditinjau klien.',
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
      'Revisi yang Harus Dikerjakan',
      'refresh',
      revisionsToComplete,
      'Bagus! Tidak ada catatan revisi project saat ini.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Notes: ${p.revisionNotes || 'Penyesuaian desain'}</span>
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
      'Invoice yang Perlu Dikirim',
      'fileText',
      invoicesToSend,
      'Semua project aktif telah ditagih. Pencatatan yang bagus!',
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
      'Follow Up Pembayaran',
      'fileText',
      overduePayments,
      'Tidak ada tagihan yang terlambat. Arus kas lancar!',
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
      'Project yang Macet (Stuck)',
      'alert',
      stuckProjects,
      'Luar biasa! Tidak ada project yang terhambat.',
      (p) => {
        const row = document.createElement('div');
        row.className = 'focus-item-row';
        row.style.padding = '8px 12px';
        row.innerHTML = `
          <div>
            <span class="focus-item-title" style="font-size: 0.85rem;">${p.title}</span>
            <span class="focus-item-meta" style="font-size: 0.72rem;">Next action: ${p.nextAction || 'Hubungi klien'}</span>
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

