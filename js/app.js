/* ==========================================================================
   FREELANCER PROJECT OS - MASTER ENTRYPOINT & ROUTER MODULE
   ========================================================================== */

import { store } from './store.js';
import { getIcon } from './icons.js';
import { SidebarNav } from './components/Sidebar.js';
import { KanbanBoard } from './components/KanbanBoard.js';
import { ProjectModal } from './components/ProjectModal.js';
import { WeeklyFocusView } from './components/WeeklyFocus.js';
import { ClientsView } from './components/ClientsView.js';
import { InvoicesView } from './components/InvoicesView.js';
import { PortfolioView } from './components/PortfolioView.js';
import { QuotationsView } from './components/QuotationsView.js';
import { ClientProjectView } from './components/ClientView.js';
import { AccessGate } from './components/AccessGate.js';
import { PlannerHub } from './components/PlannerHub.js';

class FreelancerApp {
  constructor() {
    this.activeTab = 'kanban'; // Initial default view
    this.sidebar = null;
    this.currentView = null;
    this.projectModal = null;

    // Toast Timer reference
    this.toastTimer = null;
  }

  openMobileMenu() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  closeMobileMenu() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  init() {
    this.renderShell();
    this.mountViews();
    this.bindGlobalEvents();

    // Subscribe to central state changes to refresh views dynamically
    store.subscribe(() => {
      this.refreshActiveView();
    });
  }

  renderShell() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.className = 'app-container';
    
    // Mobile sidebar drawer backdrop element
    const backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    root.appendChild(backdrop);
    
    // 1. Lateral Sidebar Anchor
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'sidebar-mount-box';
    root.appendChild(sidebarContainer);

    // 2. Main content canvas
    const mainCanvas = document.createElement('div');
    mainCanvas.className = 'main-canvas';
    
    // Top Bar Ribbon with freelancer friendly branding
    const topHeader = document.createElement('header');
    topHeader.className = 'top-header';
    topHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px;">
        <button class="btn btn-secondary d-none" id="mobile-hamburger-btn" style="padding: 8px;">
          ${getIcon('menu', '', 16)}
        </button>
        <div class="header-title-container" style="display: flex; align-items: center; gap: 10px;">
          <h1 id="header-viewport-title" style="font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif;">Workspace Board</h1>
          <button class="btn btn-text" id="btn-reopen-onboarding" style="font-size: 0.75rem; color: var(--text-secondary); padding: 4px 8px; display: none; align-items: center; gap: 4px; border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); background: var(--bg-surface);" title="Buka Panduan Quick Start">
            ${getIcon('help', '', 12)} Lihat Panduan
          </button>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" id="btn-backup-export" title="Export workspace backup file">
          ${getIcon('download', '', 14)} Export Backup
        </button>
        <button class="btn btn-secondary" id="btn-backup-import" title="Import workspace backup file">
          ${getIcon('upload', '', 14)} Import Backup
        </button>
        <input type="file" id="backup-file-picker" style="display: none;" accept=".json">
        
        <button class="btn btn-text" id="btn-access-reset" style="font-size: 0.8rem; color: var(--color-warning);" title="Reset access screen status">
          Reset Akses
        </button>
        
        <button class="btn btn-text text-danger" id="btn-workspace-reset" style="font-size: 0.8rem;" title="Reset workspace back to seed defaults">
          Wipe & Reset
        </button>
      </div>
    `;
    mainCanvas.appendChild(topHeader);

    // Viewport Scrollable container
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'content-wrapper';
    contentWrapper.id = 'viewport-mount-box';
    mainCanvas.appendChild(contentWrapper);

    root.appendChild(mainCanvas);

    // Toast element anchor
    const toastBox = document.createElement('div');
    toastBox.className = 'toast-box';
    toastBox.id = 'global-toast-box';
    toastBox.innerHTML = `
      <span class="toast-message" id="global-toast-message"></span>
    `;
    document.body.appendChild(toastBox);
  }

  mountViews() {
    const sidebarAnchor = document.getElementById('sidebar-mount-box');

    // Instantiates navigation sidebar controls
    this.sidebar = new SidebarNav(
      sidebarAnchor, 
      this.activeTab, 
      (nextTab) => this.switchView(nextTab)
    );
    this.sidebar.render();

    // Instantiates project details modals
    this.projectModal = new ProjectModal(
      store,
      () => this.refreshActiveView(),
      (msg, c) => this.triggerToast(msg, c)
    );

    // Load active view controller
    this.switchView(this.activeTab);
  }

  switchView(tabId, extraData = null) {
    this.activeTab = tabId;
    this.sidebar.update(tabId);

    const viewportAnchor = document.getElementById('viewport-mount-box');
    const headerTitle = document.getElementById('header-viewport-title');

    // Responsive Mobile sidebar toggle helpers
    this.closeMobileMenu();

    // Control onboarding guide helper button visibility
    const reopenBtn = document.getElementById('btn-reopen-onboarding');
    if (reopenBtn) {
      if (tabId === 'kanban') {
        reopenBtn.style.display = 'inline-flex';
      } else {
        reopenBtn.style.display = 'none';
      }
    }

    // View switching router mapping
    switch (tabId) {
      case 'kanban':
        headerTitle.textContent = 'Workspace Board';
        this.currentView = new KanbanBoard(
          viewportAnchor,
          store,
          (projId) => this.projectModal.open(projId),
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'planner':
        headerTitle.textContent = 'Planner Hub';
        this.currentView = new PlannerHub(
          viewportAnchor,
          store,
          (projId) => this.projectModal.open(projId),
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'focus':
        headerTitle.textContent = 'Weekly Focus Journal';
        this.currentView = new WeeklyFocusView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'clients':
        headerTitle.textContent = 'Client Directory';
        this.currentView = new ClientsView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'invoices':
        headerTitle.textContent = 'Invoice Ledger';
        this.currentView = new InvoicesView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'portfolio':
        headerTitle.textContent = 'Portfolio Staging Sandbox';
        this.currentView = new PortfolioView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'quotations':
        headerTitle.textContent = 'Quotations Ledger';
        this.currentView = new QuotationsView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'client-view':
        headerTitle.textContent = 'Client Workspace Portal';
        const clientPortal = new ClientProjectView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        if (extraData) {
          clientPortal.selectedProjectId = extraData;
        }
        this.currentView = clientPortal;
        break;
    }

    this.currentView.render();
  }

  refreshActiveView() {
    if (this.currentView) {
      this.currentView.update();
    }
  }

  bindGlobalEvents() {
    // 1. Backup Export
    document.getElementById('btn-backup-export').addEventListener('click', () => {
      const dataStr = store.exportBackup();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataUri);
      downloadAnchor.setAttribute('download', `freelancer_os_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      this.triggerToast('Workspace backup file exported successfully', 'text-success');
    });

    // 2. Backup Import triggers
    const picker = document.getElementById('backup-file-picker');
    document.getElementById('btn-backup-import').addEventListener('click', () => {
      picker.click();
    });

    picker.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = store.importBackup(event.target.result);
        if (result) {
          this.triggerToast('Workspace restored successfully from backup', 'text-success');
          picker.value = '';
          this.switchView(this.activeTab); // Reload active views
        } else {
          this.triggerToast('Structural check failed. Invalid workspace backup format.', 'text-danger');
        }
      };
      reader.readAsText(file);
    });

    // 3. Reset Workspace Data
    document.getElementById('btn-workspace-reset').addEventListener('click', () => {
      if (confirm('Warning: This will clear all your custom contracts, checklist revisions, invoice items, and reflection notes, reloading the default sample workspace.\nAre you sure you want to proceed?')) {
        store.resetToDefaults();
        this.triggerToast('Workspace reset to baseline defaults');
        this.switchView('kanban'); // Back to main Kanban board
      }
    });

    // 3.5 Reset Access Password Status
    const resetAccessBtn = document.getElementById('btn-access-reset');
    if (resetAccessBtn) {
      resetAccessBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin melakukan reset akses? Anda harus memasukkan password akses kembali.')) {
          localStorage.removeItem('alurkarya_access_granted');
          window.location.reload();
        }
      });
    }

    // 4. Mobile Hamburger Button trigger
    const hamburger = document.getElementById('mobile-hamburger-btn');
    if (hamburger) {
      const adjustHamburgerVisibility = () => {
        if (window.innerWidth <= 1024) {
          hamburger.classList.remove('d-none');
        } else {
          hamburger.classList.add('d-none');
        }
      };

      window.addEventListener('resize', adjustHamburgerVisibility);
      adjustHamburgerVisibility(); // Initial run

      hamburger.addEventListener('click', () => {
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
          this.closeMobileMenu();
        } else {
          this.openMobileMenu();
        }
      });
    }

    // 4.5 Mobile Backdrop click listener
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // 4.6 Keyboard Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });

    // 4.7 Reopen Onboarding Guide listener
    const reopenOnboardingBtn = document.getElementById('btn-reopen-onboarding');
    if (reopenOnboardingBtn) {
      reopenOnboardingBtn.addEventListener('click', () => {
        localStorage.removeItem('alurkarya_onboarding_dismissed');
        this.triggerToast('Panduan onboarding dibuka kembali.');
        if (this.activeTab === 'kanban' && this.currentView) {
          this.currentView.update();
        }
      });
    }
  }

  /**
   * Triggers a sliding HSL toast alert.
   * @param {string} message
   * @param {string} [className] - Optional visual styling classes
   */
  triggerToast(message, className = '') {
    const toast = document.getElementById('global-toast-box');
    const toastMsg = document.getElementById('global-toast-message');
    if (!toast || !toastMsg) return;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      toast.classList.remove('active');
    }

    toastMsg.textContent = message;
    
    toast.className = 'toast-box';
    if (className) {
      toast.classList.add(className);
    }

    toast.classList.add('active');

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
}

// Instantiate and launch app on DOM complete load
document.addEventListener('DOMContentLoaded', () => {
  const isGranted = localStorage.getItem('alurkarya_access_granted') === 'true';
  const root = document.getElementById('app-root');

  if (isGranted) {
    window.app = new FreelancerApp();
    window.app.init();
  } else {
    const gate = new AccessGate(root, () => {
      window.location.reload();
    });
    gate.render();
  }
});
