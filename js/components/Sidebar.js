/* ==========================================================================
   FREELANCER PROJECT OS - SIDEBAR NAVIGATION COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';

export class SidebarNav {
  /**
   * @param {HTMLElement} container - Target mount element
   * @param {string} activeTab - Currently selected tab name
   * @param {function} onTabChange - Event listener callback for page routing
   */
  constructor(container, activeTab, onTabChange) {
    this.container = container;
    this.activeTab = activeTab;
    this.onTabChange = onTabChange;
  }

  update(activeTab) {
    this.activeTab = activeTab;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    
    // Create sidebar structure
    const sidebarEl = document.createElement('div');
    sidebarEl.className = 'sidebar';
    sidebarEl.id = 'app-sidebar';

    // Header logo area with upgraded brand name and tagline
    const headerEl = document.createElement('div');
    headerEl.className = 'sidebar-header';
    headerEl.style.height = 'auto';
    headerEl.style.padding = '20px 24px';
    headerEl.style.borderBottom = '1px solid var(--border-subtle)';
    headerEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div class="sidebar-logo" style="gap: 8px;">
          ${getIcon('briefcase', 'logo-icon', 20)}
          <span style="font-size: 1.02rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2;">AlurKarya</span>
        </div>
        <span style="font-size: 0.65rem; font-weight: 600; color: var(--text-muted); line-height: 1.3; font-family: sans-serif; display: block;">
          Manage freelance projects from lead to paid.
        </span>
      </div>
    `;

    // Navigation menus
    const menuEl = document.createElement('nav');
    menuEl.className = 'sidebar-menu';
    menuEl.style.padding = '16px 12px';

    const menuItems = [
      { id: 'kanban', label: 'Workspace Board', icon: 'layers' },
      { id: 'focus', label: 'Weekly Focus', icon: 'clock' },
      { id: 'clients', label: 'Client Hub', icon: 'user' },
      { id: 'invoices', label: 'Invoice Ledger', icon: 'fileText' },
      { id: 'quotations', label: 'Quotations', icon: 'briefcase' },
      { id: 'portfolio', label: 'Portfolio Sandbox', icon: 'folder' },
      { id: 'client-view', label: 'Client View Preview', icon: 'externalLink' }
    ];

    menuItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `menu-item ${this.activeTab === item.id ? 'active' : ''}`;
      btn.dataset.tabId = item.id;
      btn.style.padding = '10px 14px';
      btn.style.borderRadius = 'var(--border-radius-md)';
      btn.innerHTML = `
        ${getIcon(item.icon, 'menu-icon', 16)}
        <span style="font-size: 0.88rem; font-weight: 500;">${item.label}</span>
      `;
      btn.addEventListener('click', () => {
        this.onTabChange(item.id);
        
        // Auto-close sidebar on mobile after clicking
        if (window.app && typeof window.app.closeMobileMenu === 'function') {
          window.app.closeMobileMenu();
        } else {
          const sidebar = document.getElementById('app-sidebar');
          if (sidebar) sidebar.classList.remove('active');
        }
      });
      menuEl.appendChild(btn);
    });

    // Footer section with profile summary
    const footerEl = document.createElement('div');
    footerEl.className = 'sidebar-footer';
    footerEl.innerHTML = `
      <div class="user-profile">
        <div class="user-avatar">JD</div>
        <div class="user-info">
          <span class="user-name">Jane Doe</span>
          <span class="user-role">Creative Freelancer</span>
        </div>
      </div>
    `;

    sidebarEl.appendChild(headerEl);
    sidebarEl.appendChild(menuEl);
    sidebarEl.appendChild(footerEl);
    
    this.container.appendChild(sidebarEl);
  }
}
