/* ==========================================================================
   FREELANCER PROJECT OS - PLANNER HUB VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate, isOutsideWorkingHours, formatTimeForTimezone, formatDateRange, convertDateTimeTimezone } from '../utils.js';
import { t, getLanguage } from '../i18n.js';

export class PlannerHub {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - Workspace central store
   * @param {function} onCardClick - Callback to open project detail modal
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onCardClick, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onCardClick = onCardClick;
    this.onTriggerToast = onTriggerToast;

    // View mode: 'week' or 'month'
    this.viewMode = localStorage.getItem('alurkarya_calendar_view_mode') || 'week';
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const viewEl = document.createElement('div');
    viewEl.className = 'planner-viewport';
    viewEl.style.cssText = 'display: flex; flex-direction: column; gap: 20px; height: 100%;';

    // Page Intro with spaceship manual title
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.innerHTML = `
      <h2>${t('sidebar.plannerHub', 'Planner Hub')}</h2>
      <p>${t('planner.introText', 'Manage client meetings, deadlines, invoice follow-ups, and your working availability in one connected dashboard.')}</p>
    `;
    viewEl.appendChild(introBox);

    // Main Layout Grid
    const mainGrid = document.createElement('div');
    mainGrid.className = 'planner-grid-layout';
    mainGrid.style.cssText = 'display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start;';
    viewEl.appendChild(mainGrid);

    this.container.appendChild(viewEl);

    // Render left column (Calendar) and right column (Widgets)
    const leftCol = document.createElement('div');
    leftCol.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';
    mainGrid.appendChild(leftCol);

    const rightCol = document.createElement('div');
    rightCol.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';
    mainGrid.appendChild(rightCol);

    this.renderCalendarBox(leftCol);
    this.renderWidgetsBox(rightCol);
  }

  renderCalendarBox(container) {
    const calendarBox = document.createElement('div');
    calendarBox.className = 'focus-module-box';
    calendarBox.style.padding = '20px';

    const mode = this.viewMode;
    const today = new Date();

    // Init week
    let selectedWeekStart = localStorage.getItem('alurkarya_selected_week');
    if (!selectedWeekStart) {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(today.setDate(diff));
      mon.setHours(0,0,0,0);
      selectedWeekStart = mon.toISOString().split('T')[0];
      localStorage.setItem('alurkarya_selected_week', selectedWeekStart);
    }

    // Init month
    let selectedMonth = localStorage.getItem('alurkarya_selected_month');
    if (!selectedMonth) {
      selectedMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
      localStorage.setItem('alurkarya_selected_month', selectedMonth);
    }

    calendarBox.innerHTML = `
      <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; gap: 8px;">
            📅 ${t('planner.calendar', 'Planner Calendar')}
          </h3>
          <div class="calendar-switch" style="display: flex; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); padding: 2px;">
            <button class="cal-switch-btn ${mode === 'week' ? 'active' : ''}" id="cal-switch-week" style="font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: ${mode === 'week' ? 'var(--text-primary)' : 'var(--text-muted)'}; background: ${mode === 'week' ? 'rgba(255,255,255,0.05)' : 'transparent'}; cursor: pointer; transition: all var(--transition-fast);">${t('planner.weekly', 'Weekly')}</button>
            <button class="cal-switch-btn ${mode === 'month' ? 'active' : ''}" id="cal-switch-month" style="font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: ${mode === 'month' ? 'var(--text-primary)' : 'var(--text-muted)'}; background: ${mode === 'month' ? 'rgba(255,255,255,0.05)' : 'transparent'}; cursor: pointer; transition: all var(--transition-fast);">${t('planner.monthly', 'Monthly')}</button>
          </div>
          <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 4px 8px; cursor: not-allowed; opacity: 0.5; height: auto; display: flex; align-items: center; gap: 4px;" title="${t('planner.gcalSync', 'Google Calendar Sync')} (${t('comingSoon', 'Coming Soon')})" disabled>
            <span>🔄 ${t('planner.gcalSync', 'Google Calendar Sync')} (${t('comingSoon', 'Coming Soon')})</span>
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn btn-secondary" id="cal-prev-btn" style="padding: 4px 8px; font-size: 0.75rem; height: auto;">&lt;</button>
          <span id="cal-range-display" style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); min-width: 140px; text-align: center;"></span>
          <button class="btn btn-secondary" id="cal-next-btn" style="padding: 4px 8px; font-size: 0.75rem; height: auto;">&gt;</button>
        </div>
      </div>
      <div id="calendar-grid-container" style="flex: 1; min-height: 180px;"></div>
    `;

    const rangeDisplay = calendarBox.querySelector('#cal-range-display');
    const gridContainer = calendarBox.querySelector('#calendar-grid-container');

    const state = this.store.getState();
    const projects = state.projects;
    const invoices = state.invoices;
    const availability = state.availability || {};

    if (mode === 'week') {
      const getFormattedRange = (monStr) => {
        const mon = new Date(monStr);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        const sunStr = sun.toISOString().split('T')[0];
        return formatDateRange(monStr, sunStr, availability.timezone);
      };

      rangeDisplay.textContent = getFormattedRange(selectedWeekStart);
      this.renderWeekGrid(gridContainer, selectedWeekStart, projects, invoices);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      const lang = getLanguage();
      const monthNamesId = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthNamesEn = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthNames = lang === 'id' ? monthNamesId : monthNamesEn;
      rangeDisplay.textContent = `${monthNames[m - 1]} ${y}`;
      this.renderMonthGrid(gridContainer, selectedMonth, projects, invoices);
    }

    // Switch view listeners
    calendarBox.querySelector('#cal-switch-week').addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewMode = 'week';
      localStorage.setItem('alurkarya_calendar_view_mode', 'week');
      this.update();
    });

    calendarBox.querySelector('#cal-switch-month').addEventListener('click', (e) => {
      e.stopPropagation();
      this.viewMode = 'month';
      localStorage.setItem('alurkarya_calendar_view_mode', 'month');
      this.update();
    });

    // Navigation listeners
    calendarBox.querySelector('#cal-prev-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (mode === 'week') {
        const date = new Date(selectedWeekStart);
        date.setDate(date.getDate() - 7);
        localStorage.setItem('alurkarya_selected_week', date.toISOString().split('T')[0]);
      } else {
        const [y, m] = selectedMonth.split('-').map(Number);
        const prevDate = new Date(y, m - 2, 1);
        const prevMonthStr = prevDate.getFullYear() + '-' + String(prevDate.getMonth() + 1).padStart(2, '0');
        localStorage.setItem('alurkarya_selected_month', prevMonthStr);
      }
      this.update();
    });

    calendarBox.querySelector('#cal-next-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (mode === 'week') {
        const date = new Date(selectedWeekStart);
        date.setDate(date.getDate() + 7);
        localStorage.setItem('alurkarya_selected_week', date.toISOString().split('T')[0]);
      } else {
        const [y, m] = selectedMonth.split('-').map(Number);
        const nextDate = new Date(y, m, 1);
        const nextMonthStr = nextDate.getFullYear() + '-' + String(nextDate.getMonth() + 1).padStart(2, '0');
        localStorage.setItem('alurkarya_selected_month', nextMonthStr);
      }
      this.update();
    });

    container.appendChild(calendarBox);
  }

  renderWeekGrid(container, selectedWeekStart, projects, invoices) {
    container.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;';

    const dayNames = [
      t('days.monday', 'Monday'),
      t('days.tuesday', 'Tuesday'),
      t('days.wednesday', 'Wednesday'),
      t('days.thursday', 'Thursday'),
      t('days.friday', 'Friday'),
      t('days.saturday', 'Saturday'),
      t('days.sunday', 'Sunday')
    ];
    
    const start = new Date(selectedWeekStart);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + i);
      days.push(dayDate);
    }

    days.forEach((day, index) => {
      const dayStr = day.toISOString().split('T')[0];
      const dayCol = document.createElement('div');
      dayCol.className = 'calendar-day-col';
      dayCol.style.cssText = 'background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); padding: 8px; min-height: 200px; display: flex; flex-direction: column; gap: 6px;';

      const isToday = new Date().toISOString().split('T')[0] === dayStr;

      dayCol.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; margin-bottom: 4px;">
          <span style="font-size: 0.72rem; font-weight: 700; color: ${isToday ? 'var(--color-primary)' : 'var(--text-secondary)'};">${dayNames[index]}</span>
          <span style="font-size: 0.72rem; font-weight: 700; background: ${isToday ? 'var(--color-primary-glow)' : 'none'}; color: ${isToday ? 'var(--text-primary)' : 'var(--text-muted)'}; padding: 1px 4px; border-radius: 4px;">${day.getDate()}</span>
        </div>
        <div class="calendar-day-items" style="display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto;"></div>
      `;

      const itemsContainer = dayCol.querySelector('.calendar-day-items');
      const dayItems = this.getCalendarItemsForDate(dayStr, projects, invoices);

      dayItems.forEach(item => {
        const itemMarkup = this.createCalendarItemMarkup(item);
        itemsContainer.appendChild(itemMarkup);
      });

      grid.appendChild(dayCol);
    });

    container.appendChild(grid);
  }

  renderMonthGrid(container, selectedMonth, projects, invoices) {
    container.innerHTML = '';
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    
    let startDayIndex = firstDay.getDay();
    startDayIndex = (startDayIndex === 0) ? 6 : startDayIndex - 1;

    const numDays = new Date(year, month, 0).getDate();

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;';

    const dayNames = [
      t('days.mon', 'Mon'),
      t('days.tue', 'Tue'),
      t('days.wed', 'Wed'),
      t('days.thu', 'Thu'),
      t('days.fri', 'Fri'),
      t('days.sat', 'Sat'),
      t('days.sun', 'Sun')
    ];
    dayNames.forEach(name => {
      const header = document.createElement('div');
      header.style.cssText = 'text-align: center; font-size: 0.72rem; font-weight: 700; color: var(--text-muted); padding-bottom: 4px;';
      header.textContent = name;
      grid.appendChild(header);
    });

    for (let i = 0; i < startDayIndex; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = 'background: rgba(255,255,255,0.002); border: 1px solid transparent; min-height: 100px;';
      grid.appendChild(cell);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= numDays; d++) {
      const cellDateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = todayStr === cellDateStr;

      const cell = document.createElement('div');
      cell.style.cssText = `background: rgba(255,255,255,0.01); border: 1px solid ${isToday ? 'var(--color-primary)' : 'var(--border-subtle)'}; border-radius: var(--border-radius-sm); padding: 4px; min-height: 100px; display: flex; flex-direction: column; gap: 4px;`;

      cell.innerHTML = `
        <div style="text-align: right; font-size: 0.68rem; font-weight: 700; color: ${isToday ? 'var(--color-primary)' : 'var(--text-muted)'};">${d}</div>
        <div class="month-cell-items" style="display: flex; flex-direction: column; gap: 3px; flex: 1; overflow-y: auto;"></div>
      `;

      const itemsContainer = cell.querySelector('.month-cell-items');
      const dayItems = this.getCalendarItemsForDate(cellDateStr, projects, invoices);

      dayItems.forEach(item => {
        const itemMarkup = this.createCalendarItemMarkup(item);
        itemMarkup.style.fontSize = '0.58rem';
        itemMarkup.style.padding = '3px';
        itemsContainer.appendChild(itemMarkup);
      });

      grid.appendChild(cell);
    }

    container.appendChild(grid);
  }

  getCalendarItemsForDate(dateStr, projects, invoices) {
    const items = [];
    const availability = this.store.getState().availability || {};
    const targetTz = availability.timezone || 'Asia/Jakarta';
    
    projects.forEach(p => {
      if (p.dueDate === dateStr && p.stage !== 'completed' && p.stage !== 'on_hold') {
        items.push({ type: 'deadline', label: 'Deadline', title: p.title, project: p });
      }
      if (p.meetingDate) {
        const converted = convertDateTimeTimezone(p.meetingDate, p.meetingTime, p.meetingTimezone, targetTz);
        if (converted.dateStr === dateStr) {
          const displayTime = p.meetingTime ? formatTimeForTimezone(converted.timeStr, targetTz) : 'TBD';
          items.push({ type: 'meeting', label: 'Meeting', title: `${p.title} (${displayTime})`, project: p });
        }
      }
      if (p.nextFollowUpDate === dateStr && p.stage !== 'completed') {
        items.push({ type: 'follow-up', label: 'Follow-up', title: p.title, project: p });
      }
      if (p.clientReviewDate === dateStr && p.stage !== 'completed') {
        items.push({ type: 'review', label: 'Review', title: p.title, project: p });
      }
      if (p.finalDeliveryDate === dateStr && p.stage !== 'completed') {
        items.push({ type: 'deadline', label: 'Delivery', title: p.title, project: p });
      }
      if (p.stage === 'on_hold' && p.holdFollowUpDate === dateStr) {
        items.push({ type: 'on_hold', label: 'On Hold', title: p.title, project: p });
      }

      // Invoice & Payment events
      const isPaid = ['Fully Paid', 'Payment Received', 'Paid'].includes(p.paymentStatus);
      if (p.invoiceDueDate === dateStr && !isPaid) {
        items.push({ type: 'invoice-due', label: 'Invoice Due', title: `Invoice Due: ${p.invoiceNumber || 'Invoice'} (${p.title})`, project: p });
      }
      if (p.nextFollowUpDate === dateStr && !isPaid) {
        items.push({ type: 'payment-followup', label: 'Payment Follow-up', title: `Follow-up: ${p.invoiceNumber || 'Invoice'} (${p.title})`, project: p });
      }
      const isReceiptMissing = ['Waiting Payment', 'Fully Paid', 'Payment Received'].includes(p.paymentStatus) && !p.receiptLink && !p.paymentReceiptLink;
      if (isReceiptMissing && (p.nextFollowUpDate === dateStr || (!p.nextFollowUpDate && p.invoiceDueDate === dateStr))) {
        items.push({ type: 'receipt-check', label: 'Receipt Check', title: `Receipt Check: ${p.title}`, project: p });
      }
    });

    invoices.forEach(inv => {
      if (inv.dueDate === dateStr && inv.status !== 'Paid') {
        items.push({ type: 'invoice', label: 'Invoice', title: `${inv.invoiceNumber} (${inv.projectName})`, invoice: inv });
      }
    });

    return items;
  }

  createCalendarItemMarkup(item) {
    const el = document.createElement('div');
    el.style.cssText = 'padding: 4px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 600; cursor: pointer; display: flex; flex-direction: column; gap: 1px; transition: all var(--transition-fast);';

    let bg = 'var(--bg-surface)';
    let border = '1px solid var(--border-subtle)';
    let color = 'var(--text-primary)';

    switch (item.type) {
      case 'deadline':
        bg = 'rgba(239, 68, 68, 0.08)';
        border = '1px solid rgba(239, 68, 68, 0.25)';
        color = 'var(--color-danger)';
        break;
      case 'meeting':
        bg = 'rgba(139, 92, 246, 0.08)';
        border = '1px solid rgba(139, 92, 246, 0.25)';
        color = 'var(--color-primary)';
        break;
      case 'follow-up':
        bg = 'rgba(6, 182, 212, 0.08)';
        border = '1px solid rgba(6, 182, 212, 0.25)';
        color = 'var(--color-secondary)';
        break;
      case 'invoice':
      case 'invoice-due':
        bg = 'rgba(239, 68, 68, 0.08)';
        border = '1px solid rgba(239, 68, 68, 0.25)';
        color = 'var(--color-danger)';
        break;
      case 'payment-followup':
        bg = 'rgba(6, 182, 212, 0.08)';
        border = '1px solid rgba(6, 182, 212, 0.25)';
        color = 'var(--color-secondary)';
        break;
      case 'receipt-check':
        bg = 'rgba(167, 139, 250, 0.08)';
        border = '1px solid rgba(167, 139, 250, 0.25)';
        color = '#a78bfa';
        break;
      case 'review':
        bg = 'rgba(245, 158, 11, 0.08)';
        border = '1px solid rgba(245, 158, 11, 0.25)';
        color = 'var(--color-warning)';
        break;
      case 'on_hold':
        bg = 'rgba(100, 116, 139, 0.08)';
        border = '1px solid rgba(100, 116, 139, 0.25)';
        color = 'var(--text-secondary)';
        break;
    }

    el.style.backgroundColor = bg;
    el.style.border = border;
    el.style.color = color;

    let label = item.label;
    if (item.type === 'deadline') label = t('projectModal.deadline', 'Deadline');
    else if (item.type === 'meeting') label = t('planner.meeting', 'Meeting');
    else if (item.type === 'follow-up') label = t('planner.followUp', 'Follow-up');
    else if (item.type === 'invoice-due' || item.type === 'invoice') label = t('planner.invoiceDue', 'Invoice Due');
    else if (item.type === 'payment-followup') label = t('planner.paymentFollowUp', 'Payment Follow-up');
    else if (item.type === 'receipt-check') label = t('planner.receiptCheck', 'Receipt Check');
    else if (item.type === 'review') label = t('planner.review', 'Review');
    else if (item.type === 'on_hold') label = t('kanban.stages.on_hold', 'On Hold');

    el.innerHTML = `
      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${item.title}">${item.title}</span>
      <span style="font-size: 0.52rem; opacity: 0.8; text-transform: uppercase; font-weight: 700;">${label}</span>
    `;

    if (item.project) {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onCardClick(item.project.id);
      });
    }

    return el;
  }

  renderWidgetsBox(container) {
    const state = this.store.getState();
    const { projects = [], invoices = [], availability } = state;
    const todayStr = new Date().toISOString().split('T')[0];

    const activeProjects = projects.filter(p => p.stage !== 'completed');

    // 1. Upcoming Meetings
    const upcomingMeetings = [];
    activeProjects.forEach(p => {
      if (p.meetingDate && p.meetingDate >= todayStr) {
        upcomingMeetings.push(p);
      }
    });
    upcomingMeetings.sort((a, b) => (a.meetingDate + 'T' + (a.meetingTime || '00:00')).localeCompare(b.meetingDate + 'T' + (b.time || '00:00')));

    // 2. Follow-up Needed
    const followUps = [];
    activeProjects.forEach(p => {
      if (p.nextFollowUpDate) {
        followUps.push({ type: 'project', title: p.title, date: p.nextFollowUpDate, pId: p.id, label: t('planner.nextFollowUp', 'Next Follow-up') });
      }
    });
    invoices.forEach(inv => {
      if (inv.status === 'Overdue' || (inv.dueDate < todayStr && inv.status !== 'Paid')) {
        followUps.push({ type: 'invoice', title: `Invoice: ${inv.invoiceNumber}`, date: inv.dueDate, label: t('invoice.paymentOverdue', 'Invoice Overdue') });
      }
    });
    followUps.sort((a, b) => a.date.localeCompare(b.date));

    // 3. Due Soon
    const dueSoon = [];
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split('T')[0];
    activeProjects.forEach(p => {
      if (p.dueDate && p.dueDate >= todayStr && p.dueDate <= sevenDaysLaterStr && p.stage !== 'on_hold') {
        dueSoon.push(p);
      }
    });
    dueSoon.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    // 4. On Hold Follow-up
    const onHolds = activeProjects.filter(p => p.stage === 'on_hold' && p.holdFollowUpDate);
    onHolds.sort((a, b) => a.holdFollowUpDate.localeCompare(b.holdFollowUpDate));

    // 5. Meeting Notes Summary list
    const notesSummary = activeProjects.filter(p => 
      p.meetingNotes || p.clientRequest || p.keyDiscussionPoints || p.decisionMade || p.actionItems
    );

    // --- WIDGET RENDER ---

    // A. Upcoming Meetings Widget
    const meetingsWidget = document.createElement('div');
    meetingsWidget.className = 'focus-module-box';
    meetingsWidget.innerHTML = `
      <h3 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('calendar', 'text-success', 16)} ${t('planner.upcomingMeetings', 'Upcoming Meetings')} (${upcomingMeetings.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${upcomingMeetings.length === 0 ? `<span style="font-size: 0.72rem; color: var(--text-muted);">${t('planner.noMeetings', 'No scheduled meetings')}</span>` : upcomingMeetings.map(p => {
          const isOutside = isOutsideWorkingHours(p.meetingDate, p.meetingTime, availability, p.meetingTimezone);
          const outsideWarning = isOutside ? `<div style="color: var(--color-danger); font-size: 0.65rem; font-weight: 700; margin-top: 2px;">⚠️ ${t('planner.outsideHoursWarning', 'Outside your working hours.')}</div>` : '';
          const converted = convertDateTimeTimezone(p.meetingDate, p.meetingTime, p.meetingTimezone, availability.timezone);
          const displayDate = formatDate(converted.dateStr);
          const displayTime = p.meetingTime ? formatTimeForTimezone(converted.timeStr, availability.timezone) : 'TBD';
          return `
            <div class="focus-item-row" style="padding: 10px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
              <div style="flex: 1; min-width: 0;">
                <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${displayDate} at ${displayTime} (${availability.timezone})</span>
                ${outsideWarning}
              </div>
              ${p.meetingLink ? `
                <a href="${p.meetingLink}" target="_blank" onclick="event.stopPropagation();" style="color: var(--color-secondary); padding: 4px;" title="Join Room">
                  ${getIcon('externalLink', '', 14)}
                </a>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(meetingsWidget);

    // B. Follow-up Needed Widget
    const followUpWidget = document.createElement('div');
    followUpWidget.className = 'focus-module-box';
    followUpWidget.innerHTML = `
      <h3 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('clock', 'text-warning', 16)} ${t('planner.followUpNeeded', 'Follow-up Needed')} (${followUps.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${followUps.length === 0 ? `<span style="font-size: 0.72rem; color: var(--text-muted);">${t('planner.noFollowUpNeeded', 'No follow-up needed')}</span>` : followUps.map(item => `
          <div class="focus-item-row" style="padding: 10px; cursor: ${item.pId ? 'pointer' : 'default'};" ${item.pId ? `onclick="window.app.projectModal.open('${item.pId}')"` : ''}>
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${item.label}: ${formatDate(item.date)}</span>
            </div>
            <span class="priority-badge priority-high" style="font-size: 0.58rem; transform: scale(0.9);">${t('planner.followUp', 'Followup')}</span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(followUpWidget);

    // C. Due Soon Widget
    const dueWidget = document.createElement('div');
    dueWidget.className = 'focus-module-box';
    dueWidget.innerHTML = `
      <h3 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('alert', 'text-danger', 16)} ${t('planner.dueSoon', 'Due Soon')} (${dueSoon.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${dueSoon.length === 0 ? `<span style="font-size: 0.72rem; color: var(--text-muted);">${t('planner.noUrgentDeadlines', 'No urgent deadlines')}</span>` : dueSoon.map(p => `
          <div class="focus-item-row" style="padding: 10px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
              <span style="font-size: 0.7rem; color: var(--color-danger); font-weight: 600;">${t('projectModal.deadline', 'Deadline')}: ${formatDate(p.dueDate)}</span>
            </div>
            <span class="priority-badge priority-urgent" style="font-size: 0.58rem;">${t('planner.dueSoon', 'Soon')}</span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(dueWidget);

    // D. On Hold Follow-up Widget
    const onHoldWidget = document.createElement('div');
    onHoldWidget.className = 'focus-module-box';
    onHoldWidget.innerHTML = `
      <h3 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('layers', 'text-muted', 16)} ${t('planner.onHoldFollowUp', 'On Hold Follow-up')} (${onHolds.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${onHolds.length === 0 ? `<span style="font-size: 0.72rem; color: var(--text-muted);">${t('planner.noHoldProjects', 'No hold projects with follow-ups')}</span>` : onHolds.map(p => `
          <div class="focus-item-row" style="padding: 10px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${t('planner.checkInDate', 'Check-in date')}: ${formatDate(p.holdFollowUpDate)}</span>
            </div>
            <span class="priority-badge priority-low" style="font-size: 0.58rem;">${t('kanban.stages.on_hold', 'On Hold')}</span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(onHoldWidget);

    // E. Meeting Notes Summary Widget
    const notesWidget = document.createElement('div');
    notesWidget.className = 'focus-module-box';
    notesWidget.innerHTML = `
      <h3 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('fileText', 'text-secondary', 16)} ${t('planner.meetingNotesSummary', 'Meeting Notes Summary')} (${notesSummary.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px;" class="widget-list">
        ${notesSummary.length === 0 ? `<span style="font-size: 0.72rem; color: var(--text-muted);">${t('planner.noMeetingNotes', 'No meeting notes logged')}</span>` : notesSummary.map(p => {
          const notesText = p.actionItems || p.decisionMade || p.keyDiscussionPoints || p.clientRequest || p.meetingNotes || '';
          const snippet = notesText.length > 80 ? notesText.substring(0, 80) + '...' : notesText;
          return `
            <div class="focus-item-row" style="padding: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
              <strong style="font-size: 0.8rem; display: block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
              <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0; line-height: 1.45; width: 100%;">${snippet || `<span style="font-style: italic;">${t('planner.noSummaryText', 'No summary text')}</span>`}</p>
              <span style="font-size: 0.58rem; color: var(--color-primary); font-weight: 700; text-transform: uppercase;">${t('planner.openFullNotes', 'Open Full Notes')} &rarr;</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(notesWidget);

    // F. Availability Settings Widget
    const availabilityWidget = this.createAvailabilityWidget(availability);
    container.appendChild(availabilityWidget);
  }

  createAvailabilityWidget(availability) {
    const box = document.createElement('div');
    box.className = 'focus-module-box';

    const workingDays = availability.workingDays || [1,2,3,4,5];
    const isChecked = (day) => workingDays.includes(day) ? 'checked' : '';

    box.innerHTML = `
      <h3 style="font-size: 0.9rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('clock', '', 16)} ${t('planner.workingHours', 'Working Hours & Availability')}
      </h3>
      <span class="stat-subtext" style="display: block; margin-top: -8px; font-size: 0.72rem; color: var(--text-muted);">
        ${t('planner.workingHoursSubtitle', 'Configure your working days, hours, timezone, and unavailable dates. Meetings outside these hours will trigger a gentle warning.')}
      </span>
      <form id="availability-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px;">
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">${t('planner.workingDays', 'Working Days')}</label>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="1" ${isChecked(1)}> ${t('days.mon', 'Mon')}</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="2" ${isChecked(2)}> ${t('days.tue', 'Tue')}</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="3" ${isChecked(3)}> ${t('days.wed', 'Wed')}</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="4" ${isChecked(4)}> ${t('days.thu', 'Thu')}</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="5" ${isChecked(5)}> ${t('days.fri', 'Fri')}</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="6" ${isChecked(6)}> ${t('days.sat', 'Sat')}</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="0" ${isChecked(0)}> ${t('days.sun', 'Sun')}</label>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label style="font-size: 0.72rem;">${t('planner.startTime', 'Start Time')}</label>
            <input type="time" name="start" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${availability.workingHoursStart || '09:00'}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem;">${t('planner.endTime', 'End Time')}</label>
            <input type="time" name="end" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${availability.workingHoursEnd || '17:00'}">
          </div>
        </div>
        <div class="form-group">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <label style="font-size: 0.72rem; margin-bottom: 0;">${t('planner.timezone', 'Timezone')}</label>
            <button type="button" id="btn-use-local-tz" class="btn btn-secondary" style="padding: 2px 6px; font-size: 0.62rem; border-radius: 4px; height: auto; line-height: 1;">${t('planner.useLocalTimezone', 'Use Local Timezone')}</button>
          </div>
          <input type="text" name="tz" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${availability.timezone || 'Asia/Jakarta'}" placeholder="Asia/Jakarta">
          <span style="font-size: 0.62rem; color: var(--text-muted); display: block; margin-top: 2px;">
            ${t('planner.timezoneDesc', 'Detected from your device. You can change it manually anytime.')}
          </span>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 10px;">
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">${t('planner.unavailableDates', 'Unavailable Dates / Holidays')}</label>
          <div id="unavailable-dates-list" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px;">
            ${(availability.unavailableDates || []).length === 0 ? `
              <span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">${t('planner.noUnavailableDates', 'No unavailable dates added')}</span>
            ` : (availability.unavailableDates || []).map(d => `
              <span class="card-tag" style="font-size: 0.62rem; display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--color-danger);">
                ${d} <button type="button" class="btn-remove-date" data-date="${d}" style="color: var(--color-danger); padding: 0; font-size: 0.65rem; font-weight: 800;">&times;</button>
              </span>
            `).join('')}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 0.72rem; color: var(--text-muted);">${t('planner.addUnavailableDate', 'Add Unavailable Date')}</label>
            <div style="display: flex; gap: 6px;">
              <input type="date" id="add-unavailable-date" class="form-control" style="font-size: 0.75rem; padding: 4px 6px; flex: 1;">
              <button type="button" class="btn btn-secondary" id="btn-add-unavailable-date" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px;">${t('add', 'Add')}</button>
            </div>
          </div>
        </div>
      </form>
    `;

    // Bind forms changes for auto-save
    const form = box.querySelector('#availability-form');
    const saveAvailabilityForm = () => {
      const days = [];
      box.querySelectorAll('input[name="day"]:checked').forEach(cb => {
        days.push(Number(cb.value));
      });
      const start = form.querySelector('input[name="start"]').value;
      const end = form.querySelector('input[name="end"]').value;
      const tz = form.querySelector('input[name="tz"]').value.trim();

      this.store.updateAvailability({
        workingDays: days,
        workingHoursStart: start,
        workingHoursEnd: end,
        timezone: tz
      });
      this.onTriggerToast(t('toast.availabilitySaved', 'Availability configuration saved!'), 'text-success');
    };

    box.querySelectorAll('input[type="checkbox"], input[type="time"], input[name="tz"]').forEach(el => {
      el.addEventListener('change', saveAvailabilityForm);
    });
    form.querySelector('input[name="tz"]').addEventListener('blur', saveAvailabilityForm);

    // Bind Use Local Timezone button
    const btnUseLocalTz = box.querySelector('#btn-use-local-tz');
    if (btnUseLocalTz) {
      btnUseLocalTz.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const localTz = this.store.getBrowserTimezone();
        form.querySelector('input[name="tz"]').value = localTz;
        this.store.updateAvailability({ timezone: localTz });
        this.onTriggerToast(t('toast.timezoneUpdated', `Timezone updated to local: ${localTz}`).replace('{timezone}', localTz), 'text-success');
        this.update();
      });
    }

    // Add unavailable date
    box.querySelector('#btn-add-unavailable-date').addEventListener('click', () => {
      const input = box.querySelector('#add-unavailable-date');
      const val = input.value;
      if (val) {
        const currentDates = availability.unavailableDates || [];
        if (!currentDates.includes(val)) {
          currentDates.push(val);
          this.store.updateAvailability({ unavailableDates: currentDates });
          this.onTriggerToast(t('toast.unavailableDateAdded', `Added unavailable date: ${val}`).replace('{date}', val), 'text-success');
          input.value = '';
          this.update();
        }
      }
    });

    // Remove unavailable date
    box.querySelectorAll('.btn-remove-date').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dateToRemove = btn.getAttribute('data-date');
        let currentDates = availability.unavailableDates || [];
        currentDates = currentDates.filter(d => d !== dateToRemove);
        this.store.updateAvailability({ unavailableDates: currentDates });
        this.onTriggerToast(t('toast.unavailableDateRemoved', `Removed unavailable date: ${dateToRemove}`).replace('{date}', dateToRemove), 'text-success');
        this.update();
      });
    });

    return box;
  }
}
