/* ==========================================================================
   FREELANCER PROJECT OS - PLANNER HUB VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate, isOutsideWorkingHours } from '../utils.js';

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
      <h2>Planner Hub</h2>
      <p>Kelola jadwal meeting klien, tenggat waktu, follow-up invoice, dan ketersediaan jam kerja harianmu di satu dashboard terpadu.</p>
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
            📅 Kalender Perencanaan
          </h3>
          <div class="calendar-switch" style="display: flex; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); padding: 2px;">
            <button class="cal-switch-btn ${mode === 'week' ? 'active' : ''}" id="cal-switch-week" style="font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: ${mode === 'week' ? 'var(--text-primary)' : 'var(--text-muted)'}; background: ${mode === 'week' ? 'rgba(255,255,255,0.05)' : 'transparent'}; cursor: pointer; transition: all var(--transition-fast);">Mingguan</button>
            <button class="cal-switch-btn ${mode === 'month' ? 'active' : ''}" id="cal-switch-month" style="font-size: 0.72rem; padding: 4px 8px; border-radius: 4px; font-weight: 600; color: ${mode === 'month' ? 'var(--text-primary)' : 'var(--text-muted)'}; background: ${mode === 'month' ? 'rgba(255,255,255,0.05)' : 'transparent'}; cursor: pointer; transition: all var(--transition-fast);">Bulanan</button>
          </div>
          <button class="btn btn-secondary" style="font-size: 0.65rem; padding: 4px 8px; cursor: not-allowed; opacity: 0.5; height: auto; display: flex; align-items: center; gap: 4px;" title="Integrasi Google Calendar (TODO_AFTER_LAUNCH)" disabled>
            <span>🔄 Sync GCal (TODO_AFTER_LAUNCH)</span>
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

    if (mode === 'week') {
      const getFormattedRange = (monStr) => {
        const mon = new Date(monStr);
        const sun = new Date(mon);
        sun.setDate(mon.getDate() + 6);
        const format = (d) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        };
        return `${format(mon)} - ${format(sun)}`;
      };

      rangeDisplay.textContent = getFormattedRange(selectedWeekStart);
      this.renderWeekGrid(gridContainer, selectedWeekStart, projects, invoices);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
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

    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
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

    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
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
    
    projects.forEach(p => {
      if (p.dueDate === dateStr && p.stage !== 'completed' && p.stage !== 'on_hold') {
        items.push({ type: 'deadline', label: 'Deadline', title: p.title, project: p });
      }
      if (p.meetingDate === dateStr) {
        items.push({ type: 'meeting', label: 'Meeting', title: `${p.title} (${p.meetingTime || 'TBD'})`, project: p });
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
        bg = 'rgba(16, 185, 129, 0.08)';
        border = '1px solid rgba(16, 185, 129, 0.25)';
        color = 'var(--color-success)';
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

    el.innerHTML = `
      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;" title="${item.title}">${item.title}</span>
      <span style="font-size: 0.52rem; opacity: 0.8; text-transform: uppercase; font-weight: 700;">${item.label}</span>
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
        followUps.push({ type: 'project', title: p.title, date: p.nextFollowUpDate, pId: p.id, label: 'Next Follow-up' });
      }
    });
    invoices.forEach(inv => {
      if (inv.status === 'Overdue' || (inv.dueDate < todayStr && inv.status !== 'Paid')) {
        followUps.push({ type: 'invoice', title: `Invoice: ${inv.invoiceNumber}`, date: inv.dueDate, label: 'Invoice Overdue' });
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
        ${getIcon('calendar', 'text-success', 16)} Upcoming Meetings (${upcomingMeetings.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${upcomingMeetings.length === 0 ? '<span style="font-size: 0.72rem; color: var(--text-muted);">Tidak ada meeting terjadwal</span>' : upcomingMeetings.map(p => {
          const isOutside = isOutsideWorkingHours(p.meetingDate, p.meetingTime, availability);
          const outsideWarning = isOutside ? `<div style="color: var(--color-danger); font-size: 0.65rem; font-weight: 700; margin-top: 2px;">⚠️ Di luar jam kerja kamu</div>` : '';
          return `
            <div class="focus-item-row" style="padding: 10px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
              <div style="flex: 1; min-width: 0;">
                <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${formatDate(p.meetingDate)} pukul ${p.meetingTime || 'TBD'} (${p.meetingType})</span>
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
        ${getIcon('clock', 'text-warning', 16)} Follow-up Needed (${followUps.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${followUps.length === 0 ? '<span style="font-size: 0.72rem; color: var(--text-muted);">Semua tindak lanjut aman</span>' : followUps.map(item => `
          <div class="focus-item-row" style="padding: 10px; cursor: ${item.pId ? 'pointer' : 'default'};" ${item.pId ? `onclick="window.app.projectModal.open('${item.pId}')"` : ''}>
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${item.label}: ${formatDate(item.date)}</span>
            </div>
            <span class="priority-badge priority-high" style="font-size: 0.58rem; transform: scale(0.9);">Followup</span>
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
        ${getIcon('alert', 'text-danger', 16)} Due Soon (${dueSoon.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${dueSoon.length === 0 ? '<span style="font-size: 0.72rem; color: var(--text-muted);">Tidak ada deadline mendesak</span>' : dueSoon.map(p => `
          <div class="focus-item-row" style="padding: 10px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
              <span style="font-size: 0.7rem; color: var(--color-danger); font-weight: 600;">Deadline: ${formatDate(p.dueDate)}</span>
            </div>
            <span class="priority-badge priority-urgent" style="font-size: 0.58rem;">Soon</span>
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
        ${getIcon('layers', 'text-muted', 16)} On Hold Follow-up (${onHolds.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;" class="widget-list">
        ${onHolds.length === 0 ? '<span style="font-size: 0.72rem; color: var(--text-muted);">Tidak ada proyek hold dengan follow-up</span>' : onHolds.map(p => `
          <div class="focus-item-row" style="padding: 10px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
            <div style="flex: 1; min-width: 0;">
              <strong style="font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
              <span style="font-size: 0.7rem; color: var(--text-muted);">Check-in date: ${formatDate(p.holdFollowUpDate)}</span>
            </div>
            <span class="priority-badge priority-low" style="font-size: 0.58rem;">On Hold</span>
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
        ${getIcon('fileText', 'text-secondary', 16)} Ringkasan Meeting Notes (${notesSummary.length})
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px;" class="widget-list">
        ${notesSummary.length === 0 ? '<span style="font-size: 0.72rem; color: var(--text-muted);">Belum ada catatan rapat</span>' : notesSummary.map(p => {
          const notesText = p.actionItems || p.decisionMade || p.keyDiscussionPoints || p.clientRequest || p.meetingNotes || '';
          const snippet = notesText.length > 80 ? notesText.substring(0, 80) + '...' : notesText;
          return `
            <div class="focus-item-row" style="padding: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; cursor: pointer;" onclick="window.app.projectModal.open('${p.id}')">
              <strong style="font-size: 0.8rem; display: block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</strong>
              <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0; line-height: 1.45; width: 100%;">${snippet || '<span style="font-style: italic;">Tidak ada ringkasan teks</span>'}</p>
              <span style="font-size: 0.58rem; color: var(--color-primary); font-weight: 700; text-transform: uppercase;">Buka Catatan Lengkap &rarr;</span>
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
        ${getIcon('clock', '', 16)} Jam Kerja & Ketersediaan (Availability)
      </h3>
      <span class="stat-subtext" style="display: block; margin-top: -8px; font-size: 0.72rem; color: var(--text-muted);">
        Atur hari dan jam kerja freelance kamu di sini. Pertemuan di luar jam kerja ini akan memicu peringatan warning otomatis.
      </span>
      <form id="availability-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px;">
        <div>
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">Hari Kerja</label>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="1" ${isChecked(1)}> Sen</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="2" ${isChecked(2)}> Sel</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="3" ${isChecked(3)}> Rab</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="4" ${isChecked(4)}> Kam</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="5" ${isChecked(5)}> Jum</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="6" ${isChecked(6)}> Sab</label>
            <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-secondary); cursor: pointer;"><input type="checkbox" name="day" value="0" ${isChecked(0)}> Min</label>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label style="font-size: 0.72rem;">Jam Mulai Kerja</label>
            <input type="time" name="start" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${availability.workingHoursStart || '09:00'}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem;">Jam Selesai Kerja</label>
            <input type="time" name="end" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${availability.workingHoursEnd || '17:00'}">
          </div>
        </div>
        <div class="form-group">
          <label style="font-size: 0.72rem;">Zona Waktu (Timezone)</label>
          <input type="text" name="tz" class="form-control" style="font-size: 0.75rem; padding: 4px 6px;" value="${availability.timezone || 'Asia/Jakarta'}" placeholder="Asia/Jakarta">
          <span style="font-size: 0.62rem; color: var(--text-muted); display: block; margin-top: 2px;">
            * Advanced timezone conversion (TODO_AFTER_LAUNCH)
          </span>
        </div>
        <div style="border-top: 1px solid rgba(255,255,255,0.03); padding-top: 10px;">
          <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">Tanggal Libur / Unavailable</label>
          <div id="unavailable-dates-list" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px;">
            ${(availability.unavailableDates || []).map(d => `
              <span class="card-tag" style="font-size: 0.62rem; display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--color-danger);">
                ${d} <button type="button" class="btn-remove-date" data-date="${d}" style="color: var(--color-danger); padding: 0; font-size: 0.65rem; font-weight: 800;">&times;</button>
              </span>
            `).join('')}
          </div>
          <div style="display: flex; gap: 6px;">
            <input type="date" id="add-unavailable-date" class="form-control" style="font-size: 0.75rem; padding: 4px 6px; flex: 1;">
            <button type="button" class="btn btn-secondary" id="btn-add-unavailable-date" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px;">Tambah</button>
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
      this.onTriggerToast('Availability configuration saved!', 'text-success');
    };

    box.querySelectorAll('input[type="checkbox"], input[type="time"], input[name="tz"]').forEach(el => {
      el.addEventListener('change', saveAvailabilityForm);
    });
    form.querySelector('input[name="tz"]').addEventListener('blur', saveAvailabilityForm);

    // Add unavailable date
    box.querySelector('#btn-add-unavailable-date').addEventListener('click', () => {
      const input = box.querySelector('#add-unavailable-date');
      const val = input.value;
      if (val) {
        const currentDates = availability.unavailableDates || [];
        if (!currentDates.includes(val)) {
          currentDates.push(val);
          this.store.updateAvailability({ unavailableDates: currentDates });
          this.onTriggerToast(`Added unavailable date: ${val}`, 'text-success');
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
        this.onTriggerToast(`Removed unavailable date: ${dateToRemove}`, 'text-success');
        this.update();
      });
    });

    return box;
  }
}
