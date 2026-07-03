/* ==========================================================================
   FREELANCER PROJECT OS - SIDEBAR NAVIGATION COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { store } from '../store.js';
import { getLanguage, setLanguage, t } from '../i18n.js';
import { isValidImageUrl } from '../utils.js';

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
      <div style="display: flex; flex-direction: column; width: 100%;">
        <div class="brand-logo">
          <img src="./assets/brand/alurkarya-logo-secondary-white.svg?v=20260626" alt="AlurKarya" class="brand-logo-img" />
        </div>
        <span class="sidebar-tagline">
          ${t('sidebar.tagline', 'Manage freelance projects from client to paid.')}
        </span>
      </div>
    `;

    // Navigation menus
    const menuEl = document.createElement('nav');
    menuEl.className = 'sidebar-menu';
    menuEl.style.padding = '16px 12px';

    const menuItems = [
      { id: 'kanban', label: t('sidebar.workspaceBoard', 'Workspace Board'), icon: 'layers' },
      { id: 'planner', label: t('sidebar.plannerHub', 'Planner Hub'), icon: 'calendar' },
      { id: 'focus', label: t('sidebar.weeklyFocus', 'Weekly Focus'), icon: 'clock' },
      { id: 'clients', label: t('sidebar.clientHub', 'Client Hub'), icon: 'user' },
      { id: 'invoices', label: t('sidebar.invoiceLedger', 'Invoice Ledger'), icon: 'fileText' },
      { id: 'quotations', label: t('sidebar.quotations', 'Quotations'), icon: 'briefcase' },
      { id: 'portfolio', label: t('sidebar.portfolioSandbox', 'Portfolio Sandbox'), icon: 'folder' }
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
    
    const profile = store.getFreelancerProfile();
    const name = profile.freelancerName || 'Your Name';
    const role = profile.freelancerRole || 'Freelancer';
    const initials = profile.freelancerInitials || store.getInitials(name);
    
    const avatarHtml = (profile.freelancerAvatar && isValidImageUrl(profile.freelancerAvatar)) ?
      `<img src="${profile.freelancerAvatar}" alt="${name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.outerHTML='${initials}'">` :
      initials;

    const activeLang = getLanguage();
    const langSwitcherHtml = `
      <div class="lang-switcher-sidebar" style="padding: 0 12px 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px; width: 100%;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;">
          <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">
            ${t('sidebar.settings', 'Language')}
          </span>
          <select id="sidebar-lang-select" style="font-size: 0.68rem; padding: 2px 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); color: var(--text-primary); border-radius: 4px; outline: none; cursor: pointer;">
            <option value="en" ${activeLang === 'en' ? 'selected' : ''}>English</option>
            <option value="id" ${activeLang === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 2px; width: 100%;">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${getIcon('help', '', 12)}
              <a href="alurpandu-guided-start.html" target="_blank" rel="noopener noreferrer" style="font-size: 0.7rem; color: var(--text-muted); text-decoration: none; transition: color var(--transition-fast);" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'">
                ${t('viewGuide', 'View Guide')}
              </a>
            </div>
            <button id="btn-sidebar-lock" style="background: none; border: none; padding: 0; color: var(--text-muted); font-size: 0.7rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color var(--transition-fast);" onmouseover="this.style.color='var(--color-danger)'" onmouseout="this.style.color='var(--text-muted)'" title="${t('privacy.lockWorkspace', 'Lock Workspace')}">
              ${getIcon('lock', '', 12)}
              <span>${t('privacy.lockWorkspace', 'Lock Workspace')}</span>
            </button>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; width: 100%;">
            <button id="btn-sidebar-switch-ws" style="background: none; border: none; padding: 0; color: var(--text-muted); font-size: 0.7rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: color var(--transition-fast);" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='var(--text-muted)'" title="${activeLang === 'id' ? 'Ganti Workspace' : 'Switch Workspace'}">
              🔄
              <span>${activeLang === 'id' ? 'Ganti Workspace' : 'Switch Workspace'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    footerEl.innerHTML = `
      ${langSwitcherHtml}
      <div class="user-profile ${this.activeTab === 'profile' ? 'active' : ''}" style="transition: all var(--transition-fast); display: flex; align-items: center; width: 100%; border: 1px solid transparent; border-radius: var(--border-radius-md); cursor: pointer;">
        <div class="user-avatar" id="sidebar-avatar-box">
          ${avatarHtml}
        </div>
        <div class="user-info" style="flex: 1; margin-left: 12px;">
          <span class="user-name" id="sidebar-freelancer-name">${name}</span>
          <span class="user-role" id="sidebar-freelancer-role">${role}</span>
        </div>
        <div class="profile-preview-btn" style="color: var(--text-secondary); display: flex; align-items: center; padding: 4px; cursor: pointer;" title="${t('clientView.timeline', 'Client Workspace Portal')}">
          ${getIcon('externalLink', '', 14)}
        </div>
      </div>
    `;

    const langSelect = footerEl.querySelector('#sidebar-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
      });
    }

    const lockBtn = footerEl.querySelector('#btn-sidebar-lock');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        if (window.app && typeof window.app.lockWorkspace === 'function') {
          window.app.lockWorkspace('manual');
        } else {
          window.dispatchEvent(new CustomEvent('alurkarya:lock-workspace', { detail: { reason: 'manual' } }));
        }
      });
    }

    const switchWsBtn = footerEl.querySelector('#btn-sidebar-switch-ws');
    if (switchWsBtn) {
      switchWsBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('alurkarya:switch-workspace'));
      });
    }

    const userProfileEl = footerEl.querySelector('.user-profile');
    userProfileEl.addEventListener('click', (e) => {
      const previewBtn = e.target.closest('.profile-preview-btn');
      if (previewBtn) {
        e.stopPropagation();
        this.onTabChange('client-view');
      } else {
        this.onTabChange('profile');
      }
      
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
