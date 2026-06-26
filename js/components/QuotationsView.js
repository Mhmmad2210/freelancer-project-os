/* ==========================================================================
   FREELANCER PROJECT OS - QUOTATIONS LEDGER COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate } from '../utils.js';
import { t, getLanguage } from '../i18n.js';

export class QuotationsView {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - Unified workspace store
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

    // Header Intro
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.innerHTML = `
      <h2>${t('quotations.title', 'Quotation Manager')}</h2>
      <p>${t('quotations.subtitle', 'Create project quotations, track client approval, define payment terms, and convert approved quotations into active projects.')}</p>
    `;
    viewEl.appendChild(introBox);

    // Render Stats Metrics Card Grid
    const summaryCards = this.createSummaryWidgets();
    viewEl.appendChild(summaryCards);

    // Controls Ribbon: Filter Status Select + Create Custom Quotation
    const controls = document.createElement('div');
    controls.className = 'grid-controls';

    const filterWrapper = document.createElement('div');
    filterWrapper.style.display = 'flex';
    filterWrapper.style.gap = '10px';
    filterWrapper.innerHTML = `
      <select class="form-control" id="quotation-status-filter" style="width: 180px;">
        <option value="ALL">${t('quotations.all', 'All Quotations')}</option>
        <option value="Draft">${t('status.draft', 'Drafts')}</option>
        <option value="Sent">${t('invoiceLedger.sentPending', 'Sent (Pending)')}</option>
        <option value="Accepted">${t('status.accepted', 'Accepted')}</option>
        <option value="Rejected">${t('status.rejected', 'Rejected')}</option>
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
    addBtn.innerHTML = `${getIcon('plus', '', 18)} ${t('quotations.add', 'Add Quotation')}`;
    addBtn.addEventListener('click', () => this.showQuotationDrawer());

    controls.appendChild(filterWrapper);
    controls.appendChild(addBtn);
    viewEl.appendChild(controls);

    // Ledger Container
    const ledgerEl = document.createElement('div');
    ledgerEl.className = 'invoice-list-container';
    ledgerEl.id = 'quotation-cards-canvas';
    viewEl.appendChild(ledgerEl);

    this.container.appendChild(viewEl);
    this.renderLedgerOnly();
  }

  createSummaryWidgets() {
    const quotations = this.store.getState().quotations || [];

    const draftVal = quotations.filter(q => q.status === 'Draft').reduce((s, q) => s + q.totalValue, 0);
    const sentVal = quotations.filter(q => q.status === 'Sent').reduce((s, q) => s + q.totalValue, 0);
    const acceptedVal = quotations.filter(q => q.status === 'Accepted').reduce((s, q) => s + q.totalValue, 0);
    const rejectedVal = quotations.filter(q => q.status === 'Rejected').reduce((s, q) => s + q.totalValue, 0);

    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'invoices-summary-grid';
    summaryGrid.innerHTML = `
      <div class="stat-card primary" style="padding: 14px 18px;">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem;">${t('quotations.draft', 'Draft Quotations')}</span>
          <div class="stat-icon">${getIcon('fileText', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem;">${formatCurrency(draftVal)}</span>
      </div>
      <div class="stat-card warning" style="padding: 14px 18px;">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem;">${t('quotations.sent', 'Sent Quotations')}</span>
          <div class="stat-icon">${getIcon('clock', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem;">${formatCurrency(sentVal)}</span>
      </div>
      <div class="stat-card success" style="padding: 14px 18px;">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem;">${t('quotations.approvedValue', 'Approved Value')}</span>
          <div class="stat-icon">${getIcon('checkSquare', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem;">${formatCurrency(acceptedVal)}</span>
      </div>
      <div class="stat-card" style="padding: 14px 18px; border-color: rgba(239, 68, 68, 0.25);">
        <div class="stat-header">
          <span class="stat-title" style="font-size: 0.72rem; color: var(--color-danger);">${t('quotations.rejected', 'Rejected Quotations')}</span>
          <div class="stat-icon" style="background: var(--color-danger-bg);">${getIcon('alert', '', 14)}</div>
        </div>
        <span class="stat-value" style="font-size: 1.35rem; color: var(--color-danger);">${formatCurrency(rejectedVal)}</span>
      </div>
    `;
    return summaryGrid;
  }

  renderLedgerOnly() {
    const canvas = document.getElementById('quotation-cards-canvas');
    if (!canvas) return;

    canvas.innerHTML = '';

    const state = this.store.getState();
    const quotations = state.quotations || [];

    const filteredQuotations = quotations.filter(q => {
      if (this.filterStatus === 'ALL') return true;
      return q.status === this.filterStatus;
    });

    if (filteredQuotations.length === 0) {
      canvas.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state-box">
          ${getIcon('briefcase', '', 48)}
          <h3>${t('quotations.noQuotationsTitle', 'No quotations in catalog')}</h3>
          <p>${t('quotations.noQuotationsDesc', 'Draft professional itemized service proposals. Add custom discount lines and convert approved quotations instantly.')}</p>
          <button class="btn btn-secondary" id="btn-empty-q-add">${getIcon('plus', '', 14)} ${t('quotations.add', 'Add Quotation')}</button>
        </div>
      `;
      canvas.querySelector('#btn-empty-q-add').addEventListener('click', () => this.showQuotationDrawer());
      return;
    }

    filteredQuotations.forEach(q => {
      const card = document.createElement('div');
      card.className = 'invoice-item-card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.justifyContent = 'space-between';

      // Status styling
      let statusBadge = 'status-completed';
      if (q.status === 'Sent') statusBadge = 'status-active';
      if (q.status === 'Accepted') statusBadge = 'status-active text-success';
      if (q.status === 'Rejected') statusBadge = 'status-lead text-danger';

      // Render Itemized Rows preview
      const itemsListHtml = (q.serviceItems || []).map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary); border-bottom: 1px dashed rgba(255,255,255,0.02); padding: 4px 0;">
          <span style="flex: 1; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.description} (x${item.qty})</span>
          <span style="font-weight: 500;">${formatCurrency(item.price * item.qty - (item.discount || 0))}</span>
        </div>
      `).join('');

      card.innerHTML = `
        <div class="invoice-header-box">
          <div>
            <span class="invoice-number-label">${q.quotationNumber}</span>
            <h4 style="margin-top: 2px; font-size: 0.95rem; font-family: 'Space Grotesk', sans-serif;">${q.projectTitle}</h4>
            <span class="stat-subtext" style="font-size: 0.72rem; display: block; margin-top: 2px;">${t('labels.client', 'Client')}: ${q.clientName}</span>
          </div>
          <span class="client-status-badge ${statusBadge}">${t('status.' + q.status.toLowerCase(), q.status)}</span>
        </div>

        <div style="margin: 12px 0;">
          <div style="max-height: 80px; overflow-y: auto; margin-bottom: 6px;">
            ${itemsListHtml}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; border-top: 1px solid var(--border-subtle); padding-top: 6px;">
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${t('quotations.totalEstimate', 'Total Estimate')}:</span>
            <span class="invoice-amount-text" style="font-size: 1.15rem; color: var(--color-secondary);">${formatCurrency(q.totalValue)}</span>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 4px;">
          ${q.paymentTerms ? `<div class="invoice-due-tracker" style="font-size: 0.72rem; color: var(--text-muted);"><span style="font-weight: 600;">${t('quotations.terms', 'Terms')}:</span> ${q.paymentTerms}</div>` : ''}
          <span class="stat-subtext" style="font-size: 0.68rem;">${t('labels.created', 'Created')}: ${formatDate(q.createdAt)}</span>
        </div>

        <div class="invoice-actions-footer" style="margin-top: 12px;">
          ${q.status === 'Draft' ? `
            <button class="invoice-btn-small send-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${getIcon('send', '', 12)} ${t('labels.send', 'Send')}
            </button>
          ` : ''}
          ${q.status === 'Sent' ? `
            <button class="invoice-btn-small accept-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${getIcon('check', '', 12)} ${t('quotations.accept', 'Accept')}
            </button>
            <button class="invoice-btn-small reject-trigger text-danger" style="display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${getIcon('alert', '', 12)} ${t('quotations.reject', 'Reject')}
            </button>
          ` : ''}
          ${q.status === 'Accepted' ? `
            <button class="invoice-btn-small convert-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: rgba(139, 92, 246, 0.15); color: #a78bfa; border-color: rgba(139, 92, 246, 0.3);">
              ${getIcon('layers', '', 12)} ${t('quotations.launchProject', 'Launch Project')}
            </button>
          ` : ''}
          <button class="invoice-btn-small edit-trigger" style="padding: 6px;">
            ${getIcon('edit', '', 12)}
          </button>
          <button class="invoice-btn-small delete-trigger text-danger" style="flex: 0 0 auto; padding: 6px;">
            ${getIcon('trash', '', 12)}
          </button>
        </div>
      `;

      // Event Listeners
      if (q.status === 'Draft') {
        card.querySelector('.send-trigger').addEventListener('click', () => {
          this.store.updateQuotation(q.id, { status: 'Sent' });
          this.onTriggerToast(t('quotations.toastMarkedSent', 'Quotation marked as Sent').replace('{num}', q.quotationNumber));
          this.update();
        });
      }

      if (q.status === 'Sent') {
        card.querySelector('.accept-trigger').addEventListener('click', () => {
          this.store.updateQuotation(q.id, { status: 'Accepted' });
          this.onTriggerToast(t('quotations.toastMarkedAccepted', 'Quotation approved! Mark as Accepted'), 'text-success');
          this.update();
        });

        card.querySelector('.reject-trigger').addEventListener('click', () => {
          this.store.updateQuotation(q.id, { status: 'Rejected' });
          this.onTriggerToast(t('quotations.toastMarkedRejected', 'Quotation Rejected').replace('{num}', q.quotationNumber), 'text-danger');
          this.update();
        });
      }

      if (q.status === 'Accepted') {
        card.querySelector('.convert-trigger').addEventListener('click', () => {
          const proj = this.store.convertQuotationToProject(q.id);
          if (proj) {
            this.onTriggerToast(t('quotations.toastProjectLaunched', 'Project created successfully on Kanban Board!'), 'text-success');
            window.app.switchView('kanban');
          }
        });
      }

      card.querySelector('.edit-trigger').addEventListener('click', () => {
        this.showQuotationDrawer(q);
      });

      card.querySelector('.delete-trigger').addEventListener('click', () => {
        if (confirm(t('quotations.removeConfirm', `Remove quotation ${q.quotationNumber} permanently?`).replace('{num}', q.quotationNumber))) {
          this.store.deleteQuotation(q.id);
          this.onTriggerToast(t('quotations.toastDeleted', 'Quotation successfully deleted'));
          this.update();
        }
      });

      canvas.appendChild(card);
    });
  }

  showQuotationDrawer(existingQuotation = null) {
    const clients = this.store.getState().clients || [];
    let drawerOverlay = document.getElementById('quotation-add-drawer');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'drawer-overlay';
      drawerOverlay.id = 'quotation-add-drawer';
      document.body.appendChild(drawerOverlay);
    }

    const modeTitle = existingQuotation ? t('quotations.editDetailsTitle', 'Edit Quotation Details') : t('quotations.createProposalTitle', 'Create Quotation Proposal');
    const qNum = existingQuotation ? existingQuotation.quotationNumber : `QT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const qTitle = existingQuotation ? existingQuotation.projectTitle : '';
    const qClientId = existingQuotation ? existingQuotation.clientId : '';
    const qTerms = existingQuotation ? existingQuotation.paymentTerms : '50% Down Payment upfront, 50% Final Delivery transfer';
    const qNotes = existingQuotation ? existingQuotation.notes : '';
    const qStatus = existingQuotation ? existingQuotation.status : 'Draft';
    const items = existingQuotation ? existingQuotation.serviceItems : [{ description: '', qty: 1, price: 0, discount: 0 }];

    const clientOptions = clients.map(c => `<option value="${c.id}" ${c.id === qClientId ? 'selected' : ''}>${c.name} (${c.businessName || 'Personal'})</option>`).join('');

    drawerOverlay.innerHTML = `
      <div class="drawer-panel" style="max-width: 600px;">
        <div class="drawer-header">
          <h3>${modeTitle}</h3>
          <button class="modal-close-btn" id="close-q-drawer">&times;</button>
        </div>
        <div class="drawer-body">
          <form id="quotation-drawer-form">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label for="q-number">${t('quotations.numberLabel', 'Quotation Number')}</label>
                <input type="text" id="q-number" class="form-control" value="${qNum}" required readonly>
              </div>
              <div class="form-group">
                <label for="q-status">${t('quotations.statusLabel', 'Status')}</label>
                <select id="q-status" class="form-control">
                  <option value="Draft" ${qStatus === 'Draft' ? 'selected' : ''}>${t('status.draft', 'Draft')}</option>
                  <option value="Sent" ${qStatus === 'Sent' ? 'selected' : ''}>${t('status.sent', 'Sent')}</option>
                  <option value="Accepted" ${qStatus === 'Accepted' ? 'selected' : ''}>${t('status.accepted', 'Accepted')}</option>
                  <option value="Rejected" ${qStatus === 'Rejected' ? 'selected' : ''}>${t('status.rejected', 'Rejected')}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="q-client-select">${t('quotations.referenceClientLabel', 'Reference Client')}</label>
              <select id="q-client-select" class="form-control" required>
                <option value="">${t('quotations.chooseClientOption', '-- Choose Client --')}</option>
                ${clientOptions}
              </select>
            </div>

            <div class="form-group">
              <label for="q-title">${t('quotations.proposedTitleLabel', 'Proposed Project Title')}</label>
              <input type="text" id="q-title" class="form-control" value="${qTitle}" placeholder="${t('quotations.proposedTitlePlaceholder', 'e.g. Website Redesign retainer')}" required>
            </div>

            <!-- Itemized list header -->
            <div style="margin-top: 18px; display: flex; align-items: center; justify-content: space-between;">
              <h4 style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">${t('quotations.lineItemsLabel', 'Line Items (IDR)')}</h4>
              <button type="button" class="btn btn-secondary" id="btn-q-add-row" style="padding: 4px 8px; font-size: 0.72rem;">${t('quotations.addServiceItemButton', '+ Add Service Item')}</button>
            </div>

            <div id="quotation-rows-container" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px; max-height: 180px; overflow-y: auto;">
              <!-- Rows added dynamically -->
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; background: rgba(255,255,255,0.01); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--border-subtle);">
              <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${t('quotations.quotationTotalLabel', 'Quotation Total:')}</span>
              <span id="quotation-running-total" style="font-weight: 700; color: var(--color-secondary); font-size: 1.1rem;">Rp0</span>
            </div>

            <div class="form-group" style="margin-top: 16px;">
              <label for="q-terms">${t('quotations.paymentTermsLabel', 'Payment Terms Description')}</label>
              <input type="text" id="q-terms" class="form-control" value="${qTerms}" placeholder="${t('quotations.paymentTermsPlaceholder', 'e.g. 50% Down Payment upfront, 50% Final Delivery')}" required>
            </div>

            <div class="form-group">
              <label for="q-notes">${t('quotations.scopeNotesLabel', 'Quotation Scope & Notes')}</label>
              <textarea id="q-notes" class="form-control" placeholder="${t('quotations.scopeNotesPlaceholder', 'Define exclusions, revisions bounds, specific terms...')}">${qNotes}</textarea>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0 0; border: none;">
              <button type="button" class="btn btn-secondary" id="cancel-q-drawer">${t('cancel', 'Cancel')}</button>
              <button type="submit" class="btn btn-primary">${t('quotations.saveProposalButton', 'Save Proposal')}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const container = drawerOverlay.querySelector('#quotation-rows-container');
    const runningTotalSpan = drawerOverlay.querySelector('#quotation-running-total');

    const recalculateTotal = () => {
      let sum = 0;
      const rows = container.querySelectorAll('.quotation-item-row');
      rows.forEach(row => {
        const qty = Number(row.querySelector('.q-item-qty').value) || 0;
        const price = Number(row.querySelector('.q-item-price').value) || 0;
        const disc = Number(row.querySelector('.q-item-disc').value) || 0;
        sum += (qty * price - disc);
      });
      runningTotalSpan.textContent = formatCurrency(sum);
    };

    const addRow = (itemData = { description: '', qty: 1, price: 0, discount: 0 }) => {
      const row = document.createElement('div');
      row.className = 'quotation-item-row';
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '2.2fr 0.6fr 1.2fr 1fr auto';
      row.style.gap = '8px';
      row.style.alignItems = 'center';

      row.innerHTML = `
        <input type="text" class="form-control q-item-desc" placeholder="${t('quotations.serviceDescPlaceholder', 'Service description...')}" value="${itemData.description}" required style="padding: 6px 8px; font-size: 0.78rem;">
        <input type="number" class="form-control q-item-qty" placeholder="${t('quotations.qtyPlaceholder', 'Qty')}" value="${itemData.qty}" min="1" required style="padding: 6px 4px; font-size: 0.78rem; text-align: center;">
        <input type="number" class="form-control q-item-price" placeholder="${t('quotations.pricePlaceholder', 'Price')}" value="${itemData.price}" min="0" required style="padding: 6px 8px; font-size: 0.78rem;">
        <input type="number" class="form-control q-item-disc" placeholder="${t('quotations.discPlaceholder', 'Disc')}" value="${itemData.discount}" min="0" style="padding: 6px 8px; font-size: 0.78rem;">
        <button type="button" class="checklist-delete-btn q-row-del" style="opacity:1; padding: 6px; flex:0 0 auto;">&times;</button>
      `;

      row.querySelector('.q-row-del').addEventListener('click', () => {
        row.remove();
        recalculateTotal();
      });

      row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', recalculateTotal);
      });

      container.appendChild(row);
      recalculateTotal();
    };

    // Pre-populate items
    items.forEach(it => addRow(it));

    drawerOverlay.querySelector('#btn-q-add-row').addEventListener('click', () => {
      addRow({ description: '', qty: 1, price: 0, discount: 0 });
    });

    setTimeout(() => drawerOverlay.classList.add('active'), 50);

    const closeActions = () => {
      drawerOverlay.classList.remove('active');
      setTimeout(() => drawerOverlay.remove(), 300);
    };

    drawerOverlay.querySelector('#close-q-drawer').addEventListener('click', closeActions);
    drawerOverlay.querySelector('#cancel-q-drawer').addEventListener('click', closeActions);

    const form = drawerOverlay.querySelector('#quotation-drawer-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const quotationNumber = form.querySelector('#q-number').value;
      const status = form.querySelector('#q-status').value;
      const clientId = form.querySelector('#q-client-select').value;
      const projectTitle = form.querySelector('#q-title').value.trim();
      const paymentTerms = form.querySelector('#q-terms').value.trim();
      const notes = form.querySelector('#q-notes').value.trim();

      const selectedClient = clients.find(c => c.id === clientId);
      const clientName = selectedClient ? (selectedClient.name + (selectedClient.businessName ? ` (${selectedClient.businessName})` : '')) : 'Independent account';

      // Parse rows
      const serviceItems = [];
      container.querySelectorAll('.quotation-item-row').forEach(row => {
        const description = row.querySelector('.q-item-desc').value.trim();
        const qty = Number(row.querySelector('.q-item-qty').value) || 1;
        const price = Number(row.querySelector('.q-item-price').value) || 0;
        const discount = Number(row.querySelector('.q-item-disc').value) || 0;
        serviceItems.push({ description, qty, price, discount });
      });

      if (serviceItems.length === 0) {
        alert(t('quotations.alertEmptyItems', 'Please add at least one line item to the quotation estimate.'));
        return;
      }

      const qFields = {
        quotationNumber,
        clientId,
        clientName,
        projectTitle,
        serviceItems,
        paymentTerms,
        notes,
        status
      };

      if (existingQuotation) {
        this.store.updateQuotation(existingQuotation.id, qFields);
        this.onTriggerToast(t('quotations.toastUpdated', 'Quotation {num} updated successfully').replace('{num}', quotationNumber));
      } else {
        this.store.addQuotation(qFields);
        this.onTriggerToast(t('quotations.toastSaved', 'Quotation proposal {num} saved successfully').replace('{num}', quotationNumber));
      }

      closeActions();
      this.update();
    });
  }
}
