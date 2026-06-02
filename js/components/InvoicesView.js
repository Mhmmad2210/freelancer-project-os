/* ==========================================================================
   FREELANCER PROJECT OS - INVOICE LEDGERS COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate, getDueDateStatus, generateEmailReminder } from '../utils.js';

export class InvoicesView {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - central workspace data store
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onTriggerToast = onTriggerToast;
    this.filterStatus = 'ALL';
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const viewEl = document.createElement('div');
    viewEl.className = 'invoices-viewport';

    // Header Intro with warm, friendly copywriting
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.innerHTML = `
      <h2>Invoice Ledger</h2>
      <p>Track your payments and unpaid invoices in one place. Generate client email follow-up reminders and draft bills easily.</p>
    `;
    viewEl.appendChild(introBox);

    // Dynamic Invoice widgets
    const summaryCards = this.createSummaryWidgets();
    viewEl.appendChild(summaryCards);

    // Controls Ribbon: Filter Status Select + Create Custom Invoice
    const controls = document.createElement('div');
    controls.className = 'grid-controls';

    const filterWrapper = document.createElement('div');
    filterWrapper.style.display = 'flex';
    filterWrapper.style.gap = '10px';
    filterWrapper.innerHTML = `
      <select class="form-control" id="invoice-status-filter" style="width: 180px;">
        <option value="ALL">All Invoices</option>
        <option value="Draft">Drafts</option>
        <option value="Sent">Sent (Pending)</option>
        <option value="Paid">Paid (Earnings)</option>
        <option value="Overdue">Overdue</option>
      </select>
    `;
    const filterSelect = filterWrapper.querySelector('select');
    filterSelect.value = this.filterStatus;
    filterSelect.addEventListener('change', (e) => {
      this.filterStatus = e.target.value;
      this.renderLedgerOnly();
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = `${getIcon('plus', '', 18)} Add Invoice`;
    addBtn.addEventListener('click', () => this.showInvoiceDrawer());

    controls.appendChild(filterWrapper);
    controls.appendChild(addBtn);
    viewEl.appendChild(controls);

    // Ledger Container
    const ledgerEl = document.createElement('div');
    ledgerEl.className = 'invoice-list-container';
    ledgerEl.id = 'invoice-cards-canvas';
    viewEl.appendChild(ledgerEl);

    this.container.appendChild(viewEl);
    this.renderLedgerOnly();
  }

  createSummaryWidgets() {
    const invoices = this.store.getState().invoices;

    const paidVal = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
    const sentVal = invoices.filter(i => i.status === 'Sent').reduce((s, i) => s + i.amount, 0);
    const draftVal = invoices.filter(i => i.status === 'Draft').reduce((s, i) => s + i.amount, 0);
    const overdueVal = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);

    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'invoices-summary-grid';
    summaryGrid.innerHTML = `
      <div class="stat-card success" style="padding: 14px 18px;">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem;">Paid Earnings</span>
          <div class="stat-icon">${getIcon('checkSquare', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem;">${formatCurrency(paidVal)}</span>
      </div>
      <div class="stat-card primary" style="padding: 14px 18px;">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem;">Sent (Pending)</span>
          <div class="stat-icon">${getIcon('clock', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem;">${formatCurrency(sentVal)}</span>
      </div>
      <div class="stat-card warning" style="padding: 14px 18px;">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem;">Draft Invoices</span>
          <div class="stat-icon">${getIcon('fileText', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem;">${formatCurrency(draftVal)}</span>
      </div>
      <div class="stat-card" style="padding: 14px 18px; border-color: rgba(239, 68, 68, 0.25);">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem; color: var(--color-danger);">Overdue Invoices</span>
          <div class="stat-icon" style="background: var(--color-danger-bg);">${getIcon('alert', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem; color: var(--color-danger);">${formatCurrency(overdueVal)}</span>
      </div>
    `;
    return summaryGrid;
  }

  renderLedgerOnly() {
    const canvas = document.getElementById('invoice-cards-canvas');
    if (!canvas) return;

    canvas.innerHTML = '';

    const state = this.store.getState();
    const { invoices, projects, clients } = state;

    // Recalculates Overdue triggers before rendering
    invoices.forEach(inv => {
      if (inv.status === 'Sent') {
        const check = getDueDateStatus(inv.dueDate);
        if (check.isOverdue) {
          this.store.updateInvoice(inv.id, { status: 'Overdue' });
        }
      } else if (inv.status === 'Overdue') {
        const check = getDueDateStatus(inv.dueDate);
        if (!check.isOverdue) {
          this.store.updateInvoice(inv.id, { status: 'Sent' });
        }
      }
    });

    const filteredInvoices = invoices.filter(inv => {
      if (this.filterStatus === 'ALL') return true;
      return inv.status === this.filterStatus;
    });

    if (filteredInvoices.length === 0) {
      canvas.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state-box">
          ${getIcon('fileText', '', 48)}
          <h3>No invoices in ledger</h3>
          <p>You haven't generated any invoices mapping this stage filter. Draft invoices to manage outstanding client payouts.</p>
          <button class="btn btn-secondary" id="btn-empty-invoice-add">${getIcon('plus', '', 14)} Create Invoice</button>
        </div>
      `;
      canvas.querySelector('#btn-empty-invoice-add').addEventListener('click', () => this.showInvoiceDrawer());
      return;
    }

    filteredInvoices.forEach(inv => {
      const card = document.createElement('div');
      card.className = 'invoice-item-card';

      // Visual Red Warning Border & Shadows for Overdue Invoices
      if (inv.status === 'Overdue') {
        card.style.borderColor = 'var(--color-danger)';
        card.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.15)';
      }

      // Find client name referencing project
      const proj = projects.find(p => p.id === inv.projectId);
      const clientName = proj ? proj.clientName : 'Independent Account';

      let statusBadge = 'status-completed';
      if (inv.status === 'Sent') statusBadge = 'status-active';
      if (inv.status === 'Paid') statusBadge = 'status-active text-success';
      if (inv.status === 'Overdue') statusBadge = 'status-lead text-danger';

      const dueMeta = getDueDateStatus(inv.dueDate);
      const isDueUrgent = inv.status === 'Overdue' || (inv.status === 'Sent' && dueMeta.daysDiff <= 1);
      const dueWarningClass = isDueUrgent ? 'overdue' : '';

      card.innerHTML = `
        <div class="invoice-header-box">
          <div>
            <span class="invoice-number-label">${inv.invoiceNumber}</span>
            <h4 class="invoice-project-link" style="margin-top: 2px;">${inv.projectName}</h4>
            <span class="stat-subtext" style="font-size: 0.72rem; display: block; margin-top: 2px;">Client: ${clientName}</span>
          </div>
          <span class="client-status-badge ${statusBadge}">${inv.status}</span>
        </div>

        <div>
          <span class="invoice-amount-text">${formatCurrency(inv.amount)}</span>
        </div>

        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 4px;">
          <div class="invoice-due-tracker ${dueWarningClass}">
            ${getIcon('clock', '', 12)}
            <span>Due date: ${formatDate(inv.dueDate)}</span>
          </div>
          ${inv.sentDate ? `<span class="stat-subtext" style="font-size: 0.68rem;">Sent on: ${formatDate(inv.sentDate)}</span>` : ''}
          ${inv.paidDate ? `<span class="stat-subtext" style="font-size: 0.68rem;">Paid on: ${formatDate(inv.paidDate)}</span>` : ''}
        </div>

        <div class="invoice-actions-footer">
          ${inv.status === 'Draft' ? `
            <button class="invoice-btn-small send-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${getIcon('send', '', 12)} Mark Sent
            </button>
          ` : ''}
          ${['Sent', 'Overdue'].includes(inv.status) ? `
            <button class="invoice-btn-small pay-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${getIcon('check', '', 12)} Mark Paid
            </button>
            <button class="invoice-btn-small reminder-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${getIcon('alert', '', 12)} Reminder
            </button>
          ` : ''}
          <button class="invoice-btn-small delete-trigger text-danger" style="flex: 0 0 auto; padding: 6px;">
            ${getIcon('trash', '', 12)}
          </button>
        </div>
      `;

      // Event listeners
      if (inv.status === 'Draft') {
        card.querySelector('.send-trigger').addEventListener('click', () => {
          this.store.updateInvoice(inv.id, { status: 'Sent' });
          if (proj) {
            this.store.updateProject(proj.id, { paymentStatus: 'Unpaid' });
          }
          this.onTriggerToast(`Invoice ${inv.invoiceNumber} marked as sent`);
          this.update();
        });
      }

      if (['Sent', 'Overdue'].includes(inv.status)) {
        card.querySelector('.pay-trigger').addEventListener('click', () => {
          this.store.updateInvoice(inv.id, { status: 'Paid' });
          if (proj) {
            this.store.updateProject(proj.id, { paymentStatus: 'Paid' });
          }
          this.onTriggerToast(`Invoice ${inv.invoiceNumber} marked as fully paid!`, 'text-success');
          this.update();
        });

        card.querySelector('.reminder-trigger').addEventListener('click', () => {
          const client = proj ? clients.find(c => c.id === proj.clientId) : null;
          const defaultClient = client || { name: 'Client Lead', email: 'billing@clientbrand.com' };
          const defaultProject = proj || { title: inv.projectName };
          this.showReminderModal(inv, defaultClient, defaultProject);
        });
      }

      card.querySelector('.delete-trigger').addEventListener('click', () => {
        if (confirm(`Delete invoice ${inv.invoiceNumber} permanently?`)) {
          this.store.deleteInvoice(inv.id);
          this.onTriggerToast('Invoice successfully deleted');
          this.update();
        }
      });

      canvas.appendChild(card);
    });
  }

  showReminderModal(invoice, client, project) {
    const data = generateEmailReminder(invoice, client, project);

    let modalOverlay = document.getElementById('reminder-modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.id = 'reminder-modal-overlay';
      document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 580px;">
        <div class="modal-header">
          <h3>Generate Payment Reminder</h3>
          <button class="modal-close-btn" id="close-rem-modal">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
          
          <div class="form-group">
            <label>Recipient Client Email</label>
            <input type="text" class="form-control" value="${client.email || 'billing@brand.com'}" readonly>
          </div>

          <div class="form-group">
            <label>Email Subject</label>
            <input type="text" id="rem-subject" class="form-control" value="${data.subject}">
          </div>

          <div class="form-group">
            <label>Email Body Message</label>
            <textarea id="rem-body" class="form-control" style="min-height: 200px;">${data.body}</textarea>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-rem-modal">Cancel</button>
          <button class="btn btn-primary" id="copy-rem-modal" style="gap: 6px;">
            ${getIcon('check', '', 14)} Copy to Clipboard
          </button>
        </div>
      </div>
    `;

    setTimeout(() => modalOverlay.classList.add('active'), 50);

    const closeActions = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 300);
    };

    modalOverlay.querySelector('#close-rem-modal').addEventListener('click', closeActions);
    modalOverlay.querySelector('#cancel-rem-modal').addEventListener('click', closeActions);

    modalOverlay.querySelector('#copy-rem-modal').addEventListener('click', () => {
      const subject = modalOverlay.querySelector('#rem-subject').value;
      const body = modalOverlay.querySelector('#rem-body').value;
      const fullText = `Subject: ${subject}\n\n${body}`;

      navigator.clipboard.writeText(fullText)
        .then(() => {
          this.onTriggerToast('Email reminder copied to clipboard', 'text-success');
          closeActions();
        })
        .catch(err => {
          console.error('Failed to copy', err);
          this.onTriggerToast('Failed to copy', 'text-danger');
        });
    });
  }

  showInvoiceDrawer() {
    const projects = this.store.getState().projects;
    let drawerOverlay = document.getElementById('invoice-add-drawer');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'drawer-overlay';
      drawerOverlay.id = 'invoice-add-drawer';
      document.body.appendChild(drawerOverlay);
    }

    const projectOptions = projects
      .map(p => `<option value="${p.id}">${p.title} (${p.clientName})</option>`)
      .join('');

    drawerOverlay.innerHTML = `
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3>Create Custom Invoice</h3>
          <button class="modal-close-btn" id="close-i-drawer">&times;</button>
        </div>
        <div class="drawer-body">
          <form id="invoice-drawer-form">
            
            <div class="form-group">
              <label for="i-project-select">Reference Project</label>
              <select id="i-project-select" class="form-control" required>
                <option value="">-- Choose Project --</option>
                ${projectOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="i-number">Invoice Number</label>
              <input type="text" id="i-number" class="form-control" placeholder="e.g. INV-2026-801" required>
            </div>

            <div class="form-group">
              <label for="i-amount">Invoice Amount (IDR)</label>
              <input type="number" id="i-amount" class="form-control" placeholder="e.g. 5000000" min="0" required>
            </div>

            <div class="form-group">
              <label for="i-due">Due Date</label>
              <input type="date" id="i-due" class="form-control" required>
            </div>

            <div class="form-group">
              <label for="i-status">Billing Status</label>
              <select id="i-status" class="form-control">
                <option value="Draft">Draft</option>
                <option value="Sent">Sent (Pending)</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0 0; border: none;">
              <button type="button" class="btn btn-secondary" id="cancel-i-drawer">Cancel</button>
              <button type="submit" class="btn btn-primary">Generate Invoice</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const projectSelect = drawerOverlay.querySelector('#i-project-select');
    projectSelect.addEventListener('change', (e) => {
      const projId = e.target.value;
      const selectedProj = projects.find(p => p.id === projId);
      if (selectedProj) {
        drawerOverlay.querySelector('#i-amount').value = selectedProj.budget;
        drawerOverlay.querySelector('#i-number').value = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
      }
    });

    setTimeout(() => drawerOverlay.classList.add('active'), 50);

    const closeActions = () => {
      drawerOverlay.classList.remove('active');
      setTimeout(() => drawerOverlay.remove(), 300);
    };

    drawerOverlay.querySelector('#close-i-drawer').addEventListener('click', closeActions);
    drawerOverlay.querySelector('#cancel-i-drawer').addEventListener('click', closeActions);

    const form = drawerOverlay.querySelector('#invoice-drawer-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const projectId = form.querySelector('#i-project-select').value;
      const invoiceNumber = form.querySelector('#i-number').value.trim();
      const amount = Number(form.querySelector('#i-amount').value);
      const dueDate = form.querySelector('#i-due').value;
      const status = form.querySelector('#i-status').value;

      this.store.addInvoice({
        projectId,
        invoiceNumber,
        amount,
        dueDate,
        status
      });

      this.onTriggerToast(`Invoice ${invoiceNumber} logged successfully`);
      closeActions();
      this.update();
    });
  }
}
