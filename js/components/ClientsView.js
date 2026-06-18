/* ==========================================================================
   FREELANCER PROJECT OS - CLIENT HUBS VIEW COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatDate } from '../utils.js';

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
      <h2>Client Hub</h2>
      <p>Track your clients, active projects, and total project value in one place. Keep notes, log WhatsApp details, and track follow-ups.</p>
    `;
    viewEl.appendChild(headerIntro);

    // Controls: Search + Add Client
    const controls = document.createElement('div');
    controls.className = 'grid-controls';

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-input-wrapper';
    searchWrapper.innerHTML = `
      ${getIcon('search', 'search-icon', 18)}
      <input type="text" id="client-search" placeholder="Search name, brand, WhatsApp, or email..." value="${this.searchQuery}">
    `;
    const searchInput = searchWrapper.querySelector('input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderTableOnly();
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.innerHTML = `${getIcon('plus', '', 18)} Add Client`;
    addBtn.addEventListener('click', () => this.showClientDrawer());

    controls.appendChild(searchWrapper);
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
      if (!this.searchQuery) return true;
      return (
        c.name.toLowerCase().includes(this.searchQuery) ||
        (c.businessName || '').toLowerCase().includes(this.searchQuery) ||
        (c.email || '').toLowerCase().includes(this.searchQuery) ||
        (c.phone || '').toLowerCase().includes(this.searchQuery)
      );
    });

    if (filteredClients.length === 0) {
      canvas.innerHTML = `
        <div class="empty-state-box" style="border: none; background: none; padding: 64px 24px;">
          ${getIcon('user', '', 48)}
          <h3>No clients in directory</h3>
          <p>Add your first client to start launching custom proposals and invoicing workflows.</p>
          <button class="btn btn-primary" id="btn-empty-add-client">${getIcon('plus', '', 16)} Register Client</button>
        </div>
      `;
      canvas.querySelector('#btn-empty-add-client').addEventListener('click', () => this.showClientDrawer());
      return;
    }

    canvas.innerHTML = `
      <table class="hub-table">
        <thead>
          <tr>
            <th>Client & Business Name</th>
            <th>Contact Details</th>
            <th>Client Status</th>
            <th>Client Follow-Up</th>
            <th>Active Projects</th>
            <th>Total Project Value</th>
            <th style="text-align: right;">Actions</th>
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

      // Calculate Total Project Value (budget sum across client's projects)
      const totalProjectVal = clientProjects.reduce((sum, p) => sum + p.budget, 0);

      // Status pill coloring logic
      let pillClass = 'status-lead';
      if (c.status === 'Active') pillClass = 'status-active';
      if (c.status === 'Completed') pillClass = 'status-completed';
      if (c.status === 'Inactive') pillClass = 'status-lead text-danger';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600; color: var(--text-primary);">${c.name}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${c.businessName || 'Freelance Personal Contract'}</span>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span style="font-size: 0.85rem; color: var(--text-secondary);">${c.email || 'No email logged'}</span>
            ${c.phone ? `<span style="font-size: 0.78rem; color: var(--color-secondary); display: flex; align-items: center; gap: 4px;">WhatsApp: ${c.phone}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="client-status-badge ${pillClass}">${c.status}</span>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">${c.lastFollowUpDate ? formatDate(c.lastFollowUpDate) : 'No follow-up logged'}</span>
        </td>
        <td>
          <span style="font-weight: 600; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;">${projectCount}</span>
        </td>
        <td>
          <span style="font-weight: 700; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;">${formatCurrency(totalProjectVal)}</span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="invoice-btn-small edit-trigger" style="padding: 4px 8px;">Edit</button>
            <button class="invoice-btn-small delete-trigger text-danger" style="padding: 4px 8px; flex: 0 0 auto;">${getIcon('trash', '', 12)}</button>
          </div>
        </td>
      `;

      row.querySelector('.edit-trigger').addEventListener('click', () => this.showClientDrawer(c));
      
      row.querySelector('.delete-trigger').addEventListener('click', () => {
        if (confirm(`Remove "${c.name}" from directory?\nExisting project billing indexes will be preserved.`)) {
          this.store.clients = state.clients.filter(x => x.id !== c.id);
          this.store.saveState();
          this.onTriggerToast('Client successfully removed');
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
              <label for="c-name">Full Client Name</label>
              <input type="text" id="c-name" class="form-control" value="${nameVal}" placeholder="e.g. Sarah Connor" required>
            </div>

            <div class="form-group">
              <label for="c-business">Business / Brand Name</label>
              <input type="text" id="c-business" class="form-control" value="${businessVal}" placeholder="e.g. Cyberdyne Systems">
            </div>

            <div class="form-group">
              <label for="c-email">Contact Email</label>
              <input type="email" id="c-email" class="form-control" value="${emailVal}" placeholder="e.g. sconnor@cyberdyne.io" required>
            </div>

            <div class="form-group">
              <label for="c-phone">Phone or WhatsApp</label>
              <input type="text" id="c-phone" class="form-control" value="${phoneVal}" placeholder="e.g. +62 812-3456-7890">
            </div>

            <div class="form-group">
              <label for="c-followup">Last Client Follow-Up Date</label>
              <input type="date" id="c-followup" class="form-control" value="${followUpVal}">
            </div>

            <div class="form-group">
              <label for="c-status">Client Status</label>
              <select id="c-status" class="form-control">
                <option value="Lead" ${statusVal === 'Lead' ? 'selected' : ''}>Lead (Prospect)</option>
                <option value="Active" ${statusVal === 'Active' ? 'selected' : ''}>Active Client</option>
                <option value="Completed" ${statusVal === 'Completed' ? 'selected' : ''}>Completed Client</option>
                <option value="Inactive" ${statusVal === 'Inactive' ? 'selected' : ''}>Inactive Client</option>
              </select>
            </div>

            <div class="form-group">
              <label for="c-notes">Client Notes</label>
              <textarea id="c-notes" class="form-control" placeholder="Add contact summaries, specific request details...">${notesVal}</textarea>
            </div>

            <!-- Client Memory Section (Collapsible) -->
            <div class="collapsible-section collapsed" id="section-client-drawer-memory" style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
              <h4 class="collapsible-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">
                <span>🧠 Client Memory Fields</span>
                <span class="toggle-icon">${getIcon('chevronRight', '', 14)}</span>
              </h4>
              <div class="collapsible-content" style="display: flex; flex-direction: column; gap: 10px;">
                <div class="form-group">
                  <label for="c-preference">Client Preference</label>
                  <textarea id="c-preference" class="form-control" placeholder="e.g. Prefers Monday updates">${existingClient ? existingClient.clientPreference || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-comm-style">Communication Style</label>
                  <textarea id="c-comm-style" class="form-control" placeholder="e.g. WhatsApp only, Slack">${existingClient ? existingClient.communicationStyle || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-payment-behavior">Payment Behavior</label>
                  <textarea id="c-payment-behavior" class="form-control" placeholder="e.g. Always pays within Net 14">${existingClient ? existingClient.paymentBehavior || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-revision-pattern">Revision Pattern</label>
                  <textarea id="c-revision-pattern" class="form-control" placeholder="e.g. Likes minimal edits">${existingClient ? existingClient.revisionPattern || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-delivery-preference">Delivery Preference</label>
                  <textarea id="c-delivery-preference" class="form-control" placeholder="e.g. Google Drive folder">${existingClient ? existingClient.deliveryPreference || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-risk-notes">Client Risk Notes</label>
                  <textarea id="c-risk-notes" class="form-control" placeholder="e.g. Prone to scope additions">${existingClient ? existingClient.clientRiskNotes || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-important-notes">Important Notes</label>
                  <textarea id="c-important-notes" class="form-control" placeholder="Other key preferences...">${existingClient ? existingClient.importantNotes || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-last-proj-summary">Last Project Summary</label>
                  <textarea id="c-last-proj-summary" class="form-control" placeholder="Previous project context...">${existingClient ? existingClient.lastProjectSummary || '' : ''}</textarea>
                </div>
                <div class="form-group">
                  <label for="c-last-meet-summary">Last Meeting Summary</label>
                  <textarea id="c-last-meet-summary" class="form-control" placeholder="Previous meeting context...">${existingClient ? existingClient.lastMeetingSummary || '' : ''}</textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0 0; border: none;">
              <button type="button" class="btn btn-secondary" id="cancel-c-drawer">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Client Directory</button>
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

      const fields = { 
        name, businessName, email, phone, lastFollowUpDate, status, notes,
        clientPreference, communicationStyle, paymentBehavior, revisionPattern,
        deliveryPreference, clientRiskNotes, importantNotes, lastProjectSummary, lastMeetingSummary
      };

      if (existingClient) {
        this.store.updateClient(existingClient.id, fields);
        this.onTriggerToast('Client directory records updated');
      } else {
        this.store.addClient(fields);
        this.onTriggerToast('Client successfully registered');
      }

      closeActions();
      this.update();
    });
  }
}
