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
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
        <div class="sidebar-logo" style="display: flex; align-items: center; gap: 10px;">
          <svg width="24" height="20" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: var(--text-primary); flex-shrink: 0;">
            <path d="M16 0H32L16 40H0L16 0Z" fill="currentColor"/>
            <path d="M26 20H35L48 40H20L26 20Z" fill="currentColor"/>
          </svg>
          <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.88rem; font-weight: 800; letter-spacing: 0.25em; color: var(--text-primary); text-transform: uppercase; line-height: 1; margin-left: 2px;">ΛLURKΛRYΛ</span>
        </div>
        <span style="font-size: 0.62rem; font-weight: 500; color: var(--text-muted); line-height: 1.3; font-family: 'Plus Jakarta Sans', sans-serif; display: block; letter-spacing: 0.01em;">
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
      { id: 'planner', label: 'Planner Hub', icon: 'calendar' },
      { id: 'focus', label: 'Weekly Focus', icon: 'clock' },
      { id: 'clients', label: 'Client Hub', icon: 'user' },
      { id: 'invoices', label: 'Invoice Ledger', icon: 'fileText' },
      { id: 'quotations', label: 'Quotations', icon: 'briefcase' },
      { id: 'portfolio', label: 'Portfolio Sandbox', icon: 'folder' }
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

    // Footer section with profile summary acting as Profile Freelancer
    const footerEl = document.createElement('div');
    footerEl.className = 'sidebar-footer';
    footerEl.style.cursor = 'pointer';
    footerEl.innerHTML = `
      <div class="user-profile ${this.activeTab === 'client-view' ? 'active' : ''}" style="transition: all var(--transition-fast); display: flex; align-items: center; width: 100%; border: 1px solid transparent; border-radius: var(--border-radius-md);">
        <div class="user-avatar">JD</div>
        <div class="user-info" style="flex: 1; margin-left: 12px;">
          <span class="user-name">Jane Doe</span>
          <span class="user-role">Creative Freelancer</span>
        </div>
        <div class="profile-preview-btn" style="color: var(--text-secondary); display: flex; align-items: center; padding: 4px;" title="Preview Client View">
          ${getIcon('externalLink', '', 14)}
        </div>
      </div>
    `;

    footerEl.querySelector('.user-profile').addEventListener('click', () => {
      this.onTabChange('client-view');
      
      // Auto-close sidebar on mobile after clicking
      if (window.app && typeof window.app.closeMobileMenu === 'function') {
        window.app.closeMobileMenu();
      } else {
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) sidebar.classList.remove('active');
      }
    });

    sidebarEl.appendChild(headerEl);
    sidebarEl.appendChild(menuEl);
    sidebarEl.appendChild(footerEl);
    
    this.container.appendChild(sidebarEl);
  }
}
