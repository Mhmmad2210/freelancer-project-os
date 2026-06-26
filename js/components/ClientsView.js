/* ==========================================================================
   FREELANCER PROJECT OS - CLIENT HUBS VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatMoney, formatDate } from '../utils.js';
import { ClientMemoryPanel } from './ClientMemoryPanel.js';
import { t } from '../i18n.js';

export class ClientsView {
  /**
   * @param {HTMLElement} container - Target mount canvas
   * @param {object} store - Workspace central store reference
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onTriggerToast = onTriggerToast;
    this.searchQuery = '';
    this.filterRelationship = '';
    this.filterChannel = '';
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const viewEl = document.createElement('div');
    viewEl.className = 'client-hub-viewport';

    // Renders header description with freelancer friendly copywriting
    const headerIntro = document.createElement('div');
    headerIntro.className = 'portfolio-intro-box';
    headerIntro.innerHTML = `
      <h2>${t('sidebar.clientHub', 'Client Hub')}</h2>
      <p>${t('clientHub.introText', 'Track your clients, active projects, and total project value in one place. Keep notes, log WhatsApp details, and track follow-ups.')}</p>
    `;
    viewEl.appendChild(headerIntro);

    // Controls: Search + Add Client
    const controls = document.createElement('div');
    controls.className = 'grid-controls';

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper';
    searchWrapper.innerHTML = `
      ${getIcon('search', 'search-icon', 18)}
      <input type="text" id="client-search" placeholder="${t('clientHub.searchPlaceholder', 'Search name, brand, WhatsApp, or email...')}" value="${this.searchQuery}">
    `;
    const searchInput = searchWrapper.querySelector('input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderTableOnly();
    });

    const filtersWrapper = document.createElement('div');
    filtersWrapper.style.display = 'flex';
    filtersWrapper.style.gap = '8px';
    filtersWrapper.style.alignItems = 'center';
    filtersWrapper.style.flexWrap = 'wrap';
    filtersWrapper.innerHTML = `
      <select id="filter-relationship" class="form-control" style="font-size: 0.8rem; padding: 6px 12px; min-width: 145px; background: var(--card-bg); border-color: rgba(255,255,255,0.1); cursor: pointer; color: var(--text-primary);">
        <option value="">${t('clientHub.allStatuses', '-- All Statuses --')}</option>
        <option value="New Client" ${this.filterRelationship === 'New Client' ? 'selected' : ''}>${t('status.relationship.new_client', 'New Client')}</option>
        <option value="Active Client" ${this.filterRelationship === 'Active Client' ? 'selected' : ''}>${t('status.relationship.active_client', 'Active Client')}</option>
        <option value="Repeat Client" ${this.filterRelationship === 'Repeat Client' ? 'selected' : ''}>${t('status.relationship.repeat_client', 'Repeat Client')}</option>
        <option value="VIP Client" ${this.filterRelationship === 'VIP Client' ? 'selected' : ''}>${t('status.relationship.vip_client', 'VIP Client')}</option>
        <option value="At Risk" ${this.filterRelationship === 'At Risk' ? 'selected' : ''}>${t('status.relationship.at_risk', 'At Risk')}</option>
        <option value="Dormant" ${this.filterRelationship === 'Dormant' ? 'selected' : ''}>${t('status.relationship.dormant', 'Dormant')}</option>
      </select>
      <select id="filter-channel" class="form-control" style="font-size: 0.8rem; padding: 6px 12px; min-width: 145px; background: var(--card-bg); border-color: rgba(255,255,255,0.1); cursor: pointer; color: var(--text-primary);">
        <option value="">${t('clientHub.allChannels', '-- All Channels --')}</option>
        <option value="WhatsApp" ${this.filterChannel === 'WhatsApp' ? 'selected' : ''}>${t('clientHub.whatsapp', 'WhatsApp')}</option>
        <option value="Email" ${this.filterChannel === 'Email' ? 'selected' : ''}>${t('clientHub.email', 'Email')}</option>
        <option value="Slack" ${this.filterChannel === 'Slack' ? 'selected' : ''}>${t('clientHub.slack', 'Slack')}</option>
        <option value="Zoom" ${this.filterChannel === 'Zoom' ? 'selected' : ''}>${t('clientHub.zoom', 'Zoom')}</option>
        <option value="Google Meet" ${this.filterChannel === 'Google Meet' ? 'selected' : ''}>${t('clientHub.meet', 'Google Meet')}</option>
        <option value="Call" ${this.filterChannel === 'Call' ? 'selected' : ''}>${t('clientHub.directCall', 'Direct Call')}</option>
        <option value="Other" ${this.filterChannel === 'Other' ? 'selected' : ''}>${t('clientHub.other', 'Other')}</option>
      </select>
    `;
    
    filtersWrapper.querySelector('#filter-relationship').addEventListener('change', (e) => {
      this.filterRelationship = e.target.value;
      this.renderTableOnly();
    });
    
    filtersWrapper.querySelector('#filter-channel').addEventListener('change', (e) => {
      this.filterChannel = e.target.value;
      this.renderTableOnly();
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = `${getIcon('plus', '', 18)} ${t('clientHub.addClient', 'Add Client')}`;
    addBtn.addEventListener('click', () => this.showClientDrawer());

    controls.appendChild(searchWrapper);
    controls.appendChild(filtersWrapper);
    controls.appendChild(addBtn);
    viewEl.appendChild(controls);

    // Table container layout
    const tableContainer = document.createElement('div');
    tableContainer.className = 'hub-table-wrapper';
    tableContainer.id = 'client-table-canvas';
    viewEl.appendChild(tableContainer);

    this.container.appendChild(viewEl);
    this.renderTableOnly();
  }

  renderTableOnly() {
    const canvas = document.getElementById('client-table-canvas');
    if (!canvas) return;

    const state = this.store.getState();
    const { clients, projects, invoices } = state;

    // Filter list
    const filteredClients = clients.filter(c => {
      const matchesSearch = !this.searchQuery ? true : (
        c.name.toLowerCase().includes(this.searchQuery) ||
        (c.businessName || '').toLowerCase().includes(this.searchQuery) ||
        (c.email || '').toLowerCase().includes(this.searchQuery) ||
        (c.phone || '').toLowerCase().includes(this.searchQuery)
      );

      const memory = c.clientMemory || {};
      const relStatus = memory.relationshipStatus || '';
      const matchesRel = !this.filterRelationship ? true : (relStatus === this.filterRelationship);

      const prefChan = memory.preferredChannel || '';
      const matchesChan = !this.filterChannel ? true : (prefChan === this.filterChannel);

      return matchesSearch && matchesRel && matchesChan;
    });

    if (filteredClients.length === 0) {
      canvas.innerHTML = `
        <div class="empty-state-box" style="border: none; background: none; padding: 64px 24px;">
          ${getIcon('user', '', 48)}
          <h3>${t('clientHub.noClientsTitle', 'No clients in directory')}</h3>
          <p>${t('clientHub.noClientsDesc', 'Add your first client to start launching custom proposals and invoicing workflows.')}</p>
          <button class="btn btn-primary" id="btn-empty-add-client">${getIcon('plus', '', 16)} ${t('clientHub.registerClient', 'Register Client')}</button>
        </div>
      `;
      canvas.querySelector('#btn-empty-add-client').addEventListener('click', () => this.showClientDrawer());
      return;
    }

    canvas.innerHTML = `
      <table class="hub-table">
        <thead>
          <tr>
            <th>${t('clientHub.colName', 'Client & Business Name')}</th>
            <th>${t('clientHub.colContact', 'Contact Details')}</th>
            <th>${t('clientHub.colStatus', 'Client Status')}</th>
            <th>${t('clientHub.colFollowUp', 'Client Follow-Up')}</th>
            <th>${t('clientHub.colProjects', 'Active Projects')}</th>
            <th>${t('clientHub.colValue', 'Total Project Value')}</th>
            <th style="text-align: right;">${t('clientHub.colActions', 'Actions')}</th>
          </tr>
        </thead>
        <tbody id="client-rows"></tbody>
      </table>
    `;

    const tbody = canvas.querySelector('#client-rows');

    filteredClients.forEach(c => {
      // Calculate Associated Projects
      const clientProjects = projects.filter(p => p.clientId === c.id);
      const projectCount = clientProjects.length;

      // Group budgets by currency to prevent mixed currency sum bugs
      const clientBudgetGroups = {};
      clientProjects.forEach(p => {
        const cur = p.projectCurrency || localStorage.getItem('alurkarya_default_currency') || 'IDR';
        if (!clientBudgetGroups[cur]) clientBudgetGroups[cur] = 0;
        clientBudgetGroups[cur] += Number(p.budget) || 0;
      });
      const clientCurrencies = Object.keys(clientBudgetGroups);
      let totalProjectValFormatted = '';
      if (clientCurrencies.length === 0) {
        const def = localStorage.getItem('alurkarya_default_currency') || 'IDR';
        totalProjectValFormatted = formatMoney(0, def);
      } else {
        totalProjectValFormatted = clientCurrencies.map(cur => formatMoney(clientBudgetGroups[cur], cur)).join(' + ');
      }

      // Status pill coloring logic
      let pillClass = 'status-lead';
      if (c.status === 'Active') pillClass = 'status-active';
      if (c.status === 'Completed') pillClass = 'status-completed';
      if (c.status === 'Inactive') pillClass = 'status-lead text-danger';

      const getStatusLabel = (status) => {
        if (status === 'Lead') return t('clientHub.statusLead', 'Lead (Prospect)');
        if (status === 'Active') return t('clientHub.statusActive', 'Active Client');
        if (status === 'Completed') return t('clientHub.statusCompleted', 'Completed Client');
        if (status === 'Inactive') return t('clientHub.statusInactive', 'Inactive Client');
        return status;
      };

      // 2-3 Useful Client Memory Indicators
      let memoryIndicators = '';
      if (c.clientMemory) {
        const mem = c.clientMemory;
        const indicators = [];
        if (mem.preferredChannel) {
          const channelMap = {
            'WhatsApp': t('clientHub.whatsapp', 'WhatsApp'),
            'Email': t('clientHub.email', 'Email'),
            'Slack': t('clientHub.slack', 'Slack'),
            'Zoom': t('clientHub.zoom', 'Zoom'),
            'Google Meet': t('clientHub.meet', 'Google Meet'),
            'Call': t('clientHub.directCall', 'Direct Call'),
            'Other': t('clientHub.other', 'Other')
          };
          const chLabel = channelMap[mem.preferredChannel] || mem.preferredChannel;
          indicators.push(`💬 ${chLabel}`);
        }
        if (mem.paymentReminderStyle) {
          indicators.push(`💳 ${mem.paymentReminderStyle}`);
        } else if (mem.paymentBehavior && mem.paymentBehavior.toLowerCase().includes('reminder')) {
          indicators.push('💳 ' + t('clientHub.needsReminder', 'Needs reminder'));
        }
        if (mem.revisionPattern) {
          const revWords = mem.revisionPattern.split(' ');
          const shortRev = revWords.length > 2 ? revWords.slice(0, 2).join(' ') + '...' : mem.revisionPattern;
          indicators.push(`🔄 ${shortRev}`);
        }
        
        if (indicators.length > 0) {
          memoryIndicators = `
            <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">
              ${indicators.slice(0, 3).map(ind => `
                <span class="client-status-badge" style="font-size: 0.6rem; padding: 1px 4px; border-radius: 3px; background: rgba(139, 92, 246, 0.05); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.15); display: inline-flex; align-items: center; font-weight: normal;">
                  ${ind}
                </span>
              `).join('')}
            </div>
          `;
        }
      }

      // Relationship Status badge
      let relBadge = '';
      if (c.clientMemory && c.clientMemory.relationshipStatus) {
        const relStatus = c.clientMemory.relationshipStatus;
        let relPillClass = 'status-lead';
        if (relStatus === 'VIP Client') relPillClass = 'status-active';
        else if (relStatus === 'Active Client') relPillClass = 'status-active';
        else if (relStatus === 'Repeat Client') relPillClass = 'status-completed';
        else if (relStatus === 'At Risk') relPillClass = 'status-lead text-warning';
        else if (relStatus === 'Dormant') relPillClass = 'status-lead';
        else if (relStatus === 'New Client') relPillClass = 'status-lead';

        const getRelationshipStatusLabel = (rel) => {
          if (rel === 'New Client') return t('status.relationship.new_client', 'New Client');
          if (rel === 'Active Client') return t('status.relationship.active_client', 'Active Client');
          if (rel === 'Repeat Client') return t('status.relationship.repeat_client', 'Repeat Client');
          if (rel === 'VIP Client') return t('status.relationship.vip_client', 'VIP Client');
          if (rel === 'At Risk') return t('status.relationship.at_risk', 'At Risk');
          if (rel === 'Dormant') return t('status.relationship.dormant', 'Dormant');
          return rel;
        };

        relBadge = `<span class="client-status-badge ${relPillClass}" style="margin-top: 4px; display: inline-flex; align-items: center; gap: 2px;">🤝 ${getRelationshipStatusLabel(relStatus)}</span>`;
      }

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-weight: 600; color: var(--text-primary);">${c.name}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${c.businessName || t('clientHub.personalContract', 'Freelance Personal Contract')}</span>
            ${memoryIndicators}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">${c.email || t('clientHub.noEmail', 'No email logged')}</span>
            ${c.phone ? `<span style="font-size: 0.78rem; color: var(--color-secondary); display: flex; align-items: center; gap: 4px;">${t('clientHub.whatsapp', 'WhatsApp')}: ${c.phone}</span>` : ''}
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span class="client-status-badge ${pillClass}">${getStatusLabel(c.status)}</span>
            ${relBadge}
          </div>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">${c.lastFollowUpDate ? formatDate(c.lastFollowUpDate) : t('clientHub.noFollowUp', 'No follow-up logged')}</span>
        </td>
        <td>
          <span style="font-weight: 600; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;">${projectCount}</span>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;">${totalProjectValFormatted}</span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
            <button class="invoice-btn-small memory-trigger" style="padding: 4px 8px; display: inline-flex; align-items: center; gap: 2px;">🧠 ${t('clientMemory.titleShort', 'Memory')}</button>
            <button class="invoice-btn-small edit-trigger" style="padding: 4px 8px;">${t('edit', 'Edit')}</button>
            <button class="invoice-btn-small delete-trigger text-danger" style="padding: 4px 8px; flex: 0 0 auto;">${getIcon('trash', '', 12)}</button>
          </div>
        </td>
      `;

      row.querySelector('.memory-trigger').addEventListener('click', () => {
        ClientMemoryPanel.open(c.id, this.store, this.onTriggerToast, () => this.update());
      });
      row.querySelector('.edit-trigger').addEventListener('click', () => this.showClientDrawer(c));
      
      row.querySelector('.delete-trigger').addEventListener('click', () => {
        const confirmMsg = t('toast.removeClientConfirm', 'Remove "{name}" from directory?\nExisting project billing indexes will be preserved.').replace('{name}', c.name);
        if (confirm(confirmMsg)) {
          this.store.clients = state.clients.filter(x => x.id !== c.id);
          this.store.saveState();
          this.onTriggerToast(t('toast.clientRemoved', 'Client successfully removed'));
          this.update();
        }
      });

      tbody.appendChild(row);
    });
  }

  showClientDrawer(existingClient = null) {
    let drawerOverlay = document.getElementById('client-edit-drawer');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'drawer-overlay';
      drawerOverlay.id = 'client-edit-drawer';
      document.body.appendChild(drawerOverlay);
    }

    const modeTitle = existingClient ? 'Edit Client Info' : 'Register New Client';
    const nameVal = existingClient ? existingClient.name : '';
    const businessVal = existingClient ? existingClient.businessName : '';
    const emailVal = existingClient ? existingClient.email : '';
    const phoneVal = existingClient ? existingClient.phone : '';
    const followUpVal = existingClient ? existingClient.lastFollowUpDate : new Date().toISOString().split('T')[0];
    const notesVal = existingClient ? existingClient.notes : '';
    const statusVal = existingClient ? existingClient.status : 'Lead';

    drawerOverlay.innerHTML = `
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3>${modeTitle}</h3>
          <button class="modal-close-btn" id="close-c-drawer">&times;</button>
        </div>
        <div class="drawer-body">
          <form id="client-drawer-form">
            <div class="form-group">
              <label for="c-name">${t('clientHub.fullName', 'Full Client Name')}</label>
              <input type="text" id="c-name" class="form-control" value="${nameVal}" placeholder="${t('projectModal.newClientNamePlaceholder', 'e.g. Sarah Connor')}" required>
            </div>

            <div class="form-group">
              <label for="c-business">${t('clientHub.businessBrandName', 'Business / Brand Name')}</label>
              <input type="text" id="c-business" class="form-control" value="${businessVal}" placeholder="${t('clientHub.businessBrandPlaceholder', 'e.g. Cyberdyne Systems')}">
            </div>

            <div class="form-group">
              <label for="c-email">${t('clientHub.contactEmail', 'Contact Email')}</label>
              <input type="email" id="c-email" class="form-control" value="${emailVal}" placeholder="e.g. sconnor@cyberdyne.io" required>
            </div>

            <div class="form-group">
              <label for="c-phone">${t('clientHub.phoneWhatsApp', 'Phone or WhatsApp')}</label>
              <input type="text" id="c-phone" class="form-control" value="${phoneVal}" placeholder="e.g. +62 812-3456-7890">
            </div>

            <div class="form-group">
              <label for="c-followup">${t('clientHub.lastFollowUpDate', 'Last Client Follow-Up Date')}</label>
              <input type="date" id="c-followup" class="form-control" value="${followUpVal}">
            </div>

            <div class="form-group">
              <label for="c-status">${t('clientHub.clientStatus', 'Client Status')}</label>
              <select id="c-status" class="form-control">
                <option value="Lead" ${statusVal === 'Lead' ? 'selected' : ''}>${t('clientHub.statusLead', 'Lead (Prospect)')}</option>
                <option value="Active" ${statusVal === 'Active' ? 'selected' : ''}>${t('clientHub.statusActive', 'Active Client')}</option>
                <option value="Completed" ${statusVal === 'Completed' ? 'selected' : ''}>${t('clientHub.statusCompleted', 'Completed Client')}</option>
                <option value="Inactive" ${statusVal === 'Inactive' ? 'selected' : ''}>${t('clientHub.statusInactive', 'Inactive Client')}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="c-notes">${t('clientHub.clientNotes', 'Client Notes')}</label>
              <textarea id="c-notes" class="form-control" placeholder="${t('clientHub.clientNotesPlaceholder', 'Add contact summaries, specific request details...')}">${notesVal}</textarea>
            </div>

            <!-- Client Memory Section (Collapsible) -->
            <div class="collapsible-section collapsed" id="section-client-drawer-memory" style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
              <h4 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">
                <span>🧠 ${t('clientHub.clientMemoryFields', 'Client Memory Fields')}</span>
                <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
              </h4>
              <div class="collapsible-content" style="display: flex; flex-direction: column; gap: 10px;">
                <div class="form-group">
                  <label for="c-preference">${t('projectModal.clientPreference', 'Client Preference')}</label>
                  <textarea id="c-preference" class="form-control" placeholder="${t('projectModal.clientPreferencePlaceholder', 'e.g. Prefers Monday updates')}">${existingClient ? existingClient.clientPreference || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-comm-style">${t('projectModal.communicationStyle', 'Communication Style')}</label>
                  <textarea id="c-comm-style" class="form-control" placeholder="${t('projectModal.communicationStylePlaceholder', 'e.g. WhatsApp only, direct call')}">${existingClient ? existingClient.communicationStyle || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-payment-behavior">${t('projectModal.paymentBehavior', 'Payment Behavior')}</label>
                  <textarea id="c-payment-behavior" class="form-control" placeholder="${t('projectModal.paymentBehaviorPlaceholder', 'e.g. Needs 1 reminder follow-up')}">${existingClient ? existingClient.paymentBehavior || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-revision-pattern">${t('projectModal.revisionPattern', 'Revision Pattern')}</label>
                  <textarea id="c-revision-pattern" class="form-control" placeholder="${t('projectModal.revisionPatternPlaceholder', 'e.g. Usually asks for extra rounds')}">${existingClient ? existingClient.revisionPattern || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-delivery-preference">${t('projectModal.deliveryPreference', 'Delivery Preference')}</label>
                  <textarea id="c-delivery-preference" class="form-control" placeholder="${t('projectModal.deliveryPreferencePlaceholder', 'e.g. Figma + Google Drive SVGs')}">${existingClient ? existingClient.deliveryPreference || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-risk-notes">${t('projectModal.clientRiskNotes', 'Client Risk Notes')}</label>
                  <textarea id="c-risk-notes" class="form-control" placeholder="${t('projectModal.clientRiskNotesPlaceholder', 'e.g. Prone to scope additions')}">${existingClient ? existingClient.clientRiskNotes || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-important-notes">${t('projectModal.importantNotes', 'Important Notes')}</label>
                  <textarea id="c-important-notes" class="form-control" placeholder="${t('projectModal.importantNotesPlaceholder', 'Other critical preferences...')}">${existingClient ? existingClient.importantNotes || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-last-proj-summary">${t('projectModal.lastProjectSummary', 'Last Project Summary')}</label>
                  <textarea id="c-last-proj-summary" class="form-control" placeholder="${t('projectModal.lastProjectSummaryPlaceholder', 'Summary of previous work...')}">${existingClient ? existingClient.lastProjectSummary || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-last-meet-summary">${t('projectModal.lastMeetingSummary', 'Last Meeting Summary')}</label>
                  <textarea id="c-last-meet-summary" class="form-control" placeholder="${t('projectModal.lastMeetingSummaryPlaceholder', 'Notes from previous meeting...')}">${existingClient ? existingClient.lastMeetingSummary || '' : ''}</textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0 0; border: none;">
              <button type="button" class="btn btn-secondary" id="cancel-c-drawer">${t('cancel', 'Cancel')}</button>
              <button type="submit" class="btn btn-primary">${t('clientHub.saveClientDirectory', 'Save Client Directory')}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    setTimeout(() => drawerOverlay.classList.add('active'), 50);

    const closeActions = () => {
      drawerOverlay.classList.remove('active');
      setTimeout(() => drawerOverlay.remove(), 300);
    };

    drawerOverlay.querySelector('#close-c-drawer').addEventListener('click', closeActions);
    drawerOverlay.querySelector('#cancel-c-drawer').addEventListener('click', closeActions);

    // Collapsible drawer memory toggle
    const drawerCollapsibleHeader = drawerOverlay.querySelector('#section-client-drawer-memory .collapsible-header');
    if (drawerCollapsibleHeader) {
      drawerCollapsibleHeader.addEventListener('click', () => {
        const section = drawerCollapsibleHeader.closest('.collapsible-section');
        if (section) {
          const isCollapsed = section.classList.toggle('collapsed');
          const toggleIcon = drawerCollapsibleHeader.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.innerHTML = getIcon(isCollapsed ? 'chevronRight' : 'chevronDown', '', 14);
          }
        }
      });
    }

    const form = drawerOverlay.querySelector('#client-drawer-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#c-name').value.trim();
      const businessName = form.querySelector('#c-business').value.trim();
      const email = form.querySelector('#c-email').value.trim();
      const phone = form.querySelector('#c-phone').value.trim();
      const lastFollowUpDate = form.querySelector('#c-followup').value;
      const status = form.querySelector('#c-status').value;
      const notes = form.querySelector('#c-notes').value.trim();

      const clientPreference = form.querySelector('#c-preference').value.trim();
      const communicationStyle = form.querySelector('#c-comm-style').value.trim();
      const paymentBehavior = form.querySelector('#c-payment-behavior').value.trim();
      const revisionPattern = form.querySelector('#c-revision-pattern').value.trim();
      const deliveryPreference = form.querySelector('#c-delivery-preference').value.trim();
      const clientRiskNotes = form.querySelector('#c-risk-notes').value.trim();
      const importantNotes = form.querySelector('#c-important-notes').value.trim();
      const lastProjectSummary = form.querySelector('#c-last-proj-summary').value.trim();
      const lastMeetingSummary = form.querySelector('#c-last-meet-summary').value.trim();

      const clientMemory = {
        communicationStyle,
        preferredChannel: existingClient && existingClient.clientMemory ? existingClient.clientMemory.preferredChannel : '',
        preferredUpdateFrequency: existingClient && existingClient.clientMemory ? existingClient.clientMemory.preferredUpdateFrequency : '',
        decisionMaker: existingClient && existingClient.clientMemory ? existingClient.clientMemory.decisionMaker : '',
        approvalStyle: existingClient && existingClient.clientMemory ? existingClient.clientMemory.approvalStyle : '',
        revisionPattern,
        paymentBehavior,
        paymentReminderStyle: existingClient && existingClient.clientMemory ? existingClient.clientMemory.paymentReminderStyle : '',
        deliveryPreference,
        filePreference: existingClient && existingClient.clientMemory ? existingClient.clientMemory.filePreference : '',
        tonePreference: existingClient && existingClient.clientMemory ? existingClient.clientMemory.tonePreference : '',
        importantNotes,
        clientRiskNotes,
        lastProjectSummary,
        lastMeetingSummary,
        relationshipStatus: existingClient && existingClient.clientMemory ? existingClient.clientMemory.relationshipStatus : '',
        clientVisibleNotes: existingClient && existingClient.clientMemory ? existingClient.clientMemory.clientVisibleNotes : '',
        shareDeliveryPref: existingClient && existingClient.clientMemory ? existingClient.clientMemory.shareDeliveryPref : false,
        commonFeedbackNotes: existingClient && existingClient.clientMemory ? existingClient.clientMemory.commonFeedbackNotes : '',
        revisionBoundaryNotes: existingClient && existingClient.clientMemory ? existingClient.clientMemory.revisionBoundaryNotes : '',
        usualPaymentTiming: existingClient && existingClient.clientMemory ? existingClient.clientMemory.usualPaymentTiming : '',
        paymentNotes: existingClient && existingClient.clientMemory ? existingClient.clientMemory.paymentNotes : '',
        folderLinkMethod: existingClient && existingClient.clientMemory ? existingClient.clientMemory.folderLinkMethod : '',
        handoverPreference: existingClient && existingClient.clientMemory ? existingClient.clientMemory.handoverPreference : ''
      };

      const fields = { 
        name, businessName, email, phone, lastFollowUpDate, status, notes,
        clientPreference, communicationStyle, paymentBehavior, revisionPattern,
        deliveryPreference, clientRiskNotes, importantNotes, lastProjectSummary, lastMeetingSummary,
        clientMemory
      };

      if (existingClient) {
        this.store.updateClient(existingClient.id, fields);
        this.onTriggerToast(t('toast.clientRecordsUpdated', 'Client directory records updated'));
      } else {
        this.store.addClient(fields);
        this.onTriggerToast(t('toast.clientRegistered', 'Client successfully registered'));
      }

      closeActions();
      this.update();
    });
  }
}
