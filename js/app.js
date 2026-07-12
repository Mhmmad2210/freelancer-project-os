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
import { WorkflowDiagnose } from './components/WorkflowDiagnose.js';
import { FreelancerProfile } from './components/FreelancerProfile.js';
import { TemplatesModal } from './components/TemplatesModal.js';
import { EntryModeSelector } from './components/EntryModeSelector.js';
import { WorkspaceProfileSelection } from './components/WorkspaceProfileSelection.js';
import { getLanguage, setLanguage, t } from './i18n.js';

window.ALURKARYA_BUILD_ID = '__ALURKARYA_BUILD_ID__';

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

  openDiagnoseModal() {
    const modal = new WorkflowDiagnose((selectedTemplate) => {
      if (selectedTemplate) {
        if (confirm(`This will add sample projects for the "${selectedTemplate}" template. Existing projects will not be deleted. Proceed?`)) {
          store.loadTemplateProjects(selectedTemplate);
          this.triggerToast(`${selectedTemplate} template loaded successfully.`, "text-success");
          this.switchView(this.activeTab);
        }
      } else {
        this.switchView(this.activeTab);
      }
    });
    modal.open();
  }

  init() {
    this.renderShell();
    this.mountViews();
    this.bindGlobalEvents();
    
    // Bind public AlurKaryaActions API for AlurPandu child windows
    window.AlurKaryaActions = {
      lockWorkspace: () => {
        this.lockWorkspace('manual');
      },
      openWorkspaceSwitcher: () => {
        this.switchWorkspace();
      },
      exportBackup: () => {
        const backupBtn = document.getElementById('btn-backup-export');
        if (backupBtn) {
          backupBtn.click();
        } else {
          try {
            const dataStr = store.exportBackup();
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute('href', dataUri);
            downloadAnchor.setAttribute('download', `freelancer_os_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            
            const wsId = sessionStorage.getItem('alurkarya_active_workspace_id');
            if (wsId) {
              const workspaces = store.getWorkspaces() || [];
              const currentWs = workspaces.find(w => w.workspaceId === wsId);
              if (currentWs) {
                currentWs.lastBackupAt = new Date().toISOString();
                store.saveWorkspaces(workspaces);
              }
            }
            localStorage.setItem('alurkarya_backup_exported', 'true');
          } catch (e) {
            console.error("AlurKaryaActions exportBackup programmatically failed:", e);
          }
        }
      },
      saveProjectLinks: (projectId, links) => {
        const projects = store.projects || [];
        const projectExists = projects.some(p => p.id === projectId);
        if (!projectExists) {
          console.error("AlurKaryaActions.saveProjectLinks: Project ID not found:", projectId);
          return;
        }
        
        const safeLinks = {};
        const urlFields = ['briefLink', 'previewLink', 'reviewLink', 'finalFileLink', 'deliveryLink', 'sourceFileLink', 'stagingLink', 'fileFolderLink'];
        urlFields.forEach(field => {
          if (links[field] !== undefined) {
            safeLinks[field] = String(links[field]).trim();
          }
        });
        
        store.updateProject(projectId, safeLinks);
        store.saveState();
        this.refreshActiveView();
      }
    };
    
    // Check for pending success toast
    const pendingToast = sessionStorage.getItem('alurkarya_toast_pending');
    if (pendingToast) {
      sessionStorage.removeItem('alurkarya_toast_pending');
      setTimeout(() => this.triggerToast(pendingToast, "text-success"), 100);
    }

    // Check if new workspace onboarding is triggered
    if (sessionStorage.getItem('alurkarya_new_workspace_created') === 'true') {
      sessionStorage.removeItem('alurkarya_new_workspace_created');
      setTimeout(() => this.showNewWorkspaceOnboardingModal(), 200);
    } else {
      this.checkGuidedStartModal();
    }

    // Start inactivity and tab visibility listeners
    this.WORKSPACE_IDLE_LOCK_MINUTES = 15;
    this.idleTimer = null;
    this.lastActivityTime = Date.now();
    this.setupInactivityListeners();
    this.setupVisibilityListeners();

    // Subscribe to central state changes to refresh views dynamically
    store.subscribe(() => {
      this.refreshActiveView();
    });
  }

  renderShell() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = '';
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
          <h1 id="header-viewport-title" style="font-size: 1.25rem; font-family: 'Space Grotesk', sans-serif;">${t('sidebar.workspaceBoard', 'Workspace Board')}</h1>
          <button class="btn btn-text" id="btn-reopen-onboarding" style="font-size: 0.75rem; color: var(--text-secondary); padding: 4px 8px; display: none; align-items: center; gap: 4px; border: 1px solid var(--border-subtle); border-radius: var(--border-radius-sm); background: var(--bg-surface);" title="${t('viewGuideTitle', 'Open Quick Start Guide')}">
            ${getIcon('help', '', 12)} ${t('viewGuide', 'View Guide')}
          </button>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" id="btn-workflow-diagnose" title="${t('app.diagnoseTitle', 'Start Workflow Diagnosis')}" style="background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
          🧠 ${t('app.diagnose', 'Diagnose')}
        </button>
        <button class="btn btn-secondary" id="btn-backup-export" title="${t('app.exportBackupTitle', 'Export workspace backup file')}">
          ${getIcon('download', '', 14)} ${t('app.exportBackup', 'Export Backup')}
        </button>
        <button class="btn btn-secondary" id="btn-backup-import" title="${t('app.importBackupTitle', 'Import workspace backup file')}">
          ${getIcon('upload', '', 14)} ${t('app.importBackup', 'Import Backup')}
        </button>
        <input type="file" id="backup-file-picker" style="display: none;" accept=".json">
        
        <button class="btn btn-text" id="btn-access-reset" style="font-size: 0.8rem; color: var(--color-warning);" title="${t('app.resetAccessTitle', 'Reset access screen status')}">
          ${t('app.resetAccess', 'Reset Access')}
        </button>
        
        <button class="btn btn-text text-danger" id="btn-workspace-reset" style="font-size: 0.8rem;" title="${t('app.wipeResetTitle', 'Reset workspace back to seed defaults')}">
          ${t('app.wipeReset', 'Wipe & Reset')}
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
        headerTitle.textContent = t('sidebar.workspaceBoard', 'Workspace Board');
        this.currentView = new KanbanBoard(
          viewportAnchor,
          store,
          (projId) => this.projectModal.open(projId),
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'planner':
        headerTitle.textContent = t('sidebar.plannerHub', 'Planner Hub');
        this.currentView = new PlannerHub(
          viewportAnchor,
          store,
          (projId) => this.projectModal.open(projId),
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'focus':
        headerTitle.textContent = t('sidebar.weeklyFocus', 'Weekly Focus');
        this.currentView = new WeeklyFocusView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'clients':
        headerTitle.textContent = t('sidebar.clientHub', 'Client Hub');
        this.currentView = new ClientsView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'invoices':
        headerTitle.textContent = t('sidebar.invoiceLedger', 'Invoice Ledger');
        this.currentView = new InvoicesView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'portfolio':
        headerTitle.textContent = t('sidebar.portfolioSandbox', 'Portfolio Sandbox');
        this.currentView = new PortfolioView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'quotations':
        headerTitle.textContent = t('sidebar.quotations', 'Quotations');
        this.currentView = new QuotationsView(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
        break;
      case 'client-view':
        headerTitle.textContent = t('clientView.projectStatus', 'Client Workspace Portal');
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
      case 'profile':
        headerTitle.textContent = t('sidebar.freelancerProfile', 'Freelancer Profile');
        this.currentView = new FreelancerProfile(
          viewportAnchor,
          store,
          (msg, c) => this.triggerToast(msg, c)
        );
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
    this.bindDOMEvents();

    if (this.globalEventsBound) return;

    // Window/global events that persist across page re-renders:
    window.addEventListener('resize', () => {
      const hamburger = document.getElementById('mobile-hamburger-btn');
      if (hamburger) {
        if (window.innerWidth <= 1024) {
          hamburger.classList.remove('d-none');
        } else {
          hamburger.classList.add('d-none');
        }
      }
    });

    // Intercept clicks on alurpandu links to maintain opener access and sync session storage
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href').includes('alurpandu-guided-start.html')) {
        e.preventDefault();
        const activeWs = sessionStorage.getItem('alurkarya_active_workspace_id') || '';
        const unlocked = sessionStorage.getItem('alurkarya_session_unlocked') === 'true';
        window.open(`alurpandu-guided-start.html?workspace_id=${activeWs}&session_unlocked=${unlocked}`, '_blank');
      }
    });

    // Handle external state updates (e.g. project creation from AlurPandu tab)
    window.addEventListener('alurkarya:workspace-state-updated', (e) => {
      console.log("[App] Workspace state updated externally:", e.detail);
      store.loadState();
      this.refreshActiveView();
      if (this.sidebar) {
        this.sidebar.update(this.activeTab);
      }
    });

    this.globalEventsBound = true;
  }

  bindDOMEvents() {
    // 1. Backup Export
    const btnBackupExport = document.getElementById('btn-backup-export');
    if (btnBackupExport) {
      btnBackupExport.addEventListener('click', () => {
        const dataStr = store.exportBackup();
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataUri);
        downloadAnchor.setAttribute('download', `freelancer_os_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        // Save lastBackupAt timestamp on active workspace details:
        const wsId = sessionStorage.getItem('alurkarya_active_workspace_id');
        if (wsId) {
          try {
            const workspaces = store.getWorkspaces() || [];
            const currentWs = workspaces.find(w => w.workspaceId === wsId);
            if (currentWs) {
              currentWs.lastBackupAt = new Date().toISOString();
              store.saveWorkspaces(workspaces);
            }
          } catch(err) {
            console.error("Failed to save backup timestamp in workspace index:", err);
          }
        }
        localStorage.setItem('alurkarya_backup_exported', 'true');

        this.triggerToast(t('toast.backupExported', 'Workspace backup file exported successfully'), 'text-success');
      });
    }
    // 2. Backup Import triggers
    const picker = document.getElementById('backup-file-picker');
    const btnBackupImport = document.getElementById('btn-backup-import');
    if (btnBackupImport && picker) {
      btnBackupImport.addEventListener('click', () => {
        picker.click();
      });
    }

    if (picker) {
      picker.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const isIndo = getLanguage() === 'id';
          const confirmText = isIndo
            ? 'Ingin mengimpor backup ini ke dalam workspace saat ini?\n\nKlik OK untuk mengimpor ke workspace saat ini, atau Cancel untuk membuat workspace baru dari backup ini.'
            : 'Import this backup into your current active workspace?\n\nClick OK to import into current workspace, or Cancel to create a new workspace from this backup.';
          
          const importIntoCurrent = confirm(confirmText);
          let result;
          if (importIntoCurrent) {
            result = store.importBackup(event.target.result);
          } else {
            result = store.importBackup(event.target.result, 'NEW_WORKSPACE');
          }

          if (result) {
            this.triggerToast(t('toast.backupImported', 'Workspace restored successfully from backup'), 'text-success');
            picker.value = '';
            setTimeout(() => window.location.reload(), 1000);
          } else {
            this.triggerToast(t('toast.backupImportFailed', 'Structural check failed. Invalid workspace backup format.'), 'text-danger');
          }
        };
        reader.readAsText(file);
      });
    }

    // 3. Reset Workspace Data
    const btnWorkspaceReset = document.getElementById('btn-workspace-reset');
    if (btnWorkspaceReset) {
      btnWorkspaceReset.addEventListener('click', () => {
        const warnText = getLanguage() === 'id' ? 
          'Peringatan: Ini akan menghapus semua kontrak kustom Anda, revisi checklist, item invoice, dan catatan refleksi, memuat ulang default workspace.\nApakah Anda yakin ingin melanjutkan?' :
          'Warning: This will clear all your custom contracts, checklist revisions, invoice items, and reflection notes, reloading the default sample workspace.\nAre you sure you want to proceed?';
        if (confirm(warnText)) {
          store.resetToDefaults();
          this.triggerToast(t('toast.workspaceReset', 'Workspace reset to baseline defaults'));
          this.switchView('kanban'); // Back to main Kanban board
        }
      });
    }

    // 3.5 Reset Access Password Status
    const resetAccessBtn = document.getElementById('btn-access-reset');
    if (resetAccessBtn) {
      resetAccessBtn.addEventListener('click', () => {
        if (confirm(t('toast.accessResetConfirm', 'Are you sure you want to reset access? You will need to enter the access password again.'))) {
          this.lockWorkspace('manual');
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

    // 4.7 Reopen Onboarding Guide listener
    const reopenOnboardingBtn = document.getElementById('btn-reopen-onboarding');
    if (reopenOnboardingBtn) {
      reopenOnboardingBtn.addEventListener('click', () => {
        const activeWs = sessionStorage.getItem('alurkarya_active_workspace_id') || '';
        const unlocked = sessionStorage.getItem('alurkarya_session_unlocked') === 'true';
        window.open(`alurpandu-guided-start.html?workspace_id=${activeWs}&session_unlocked=${unlocked}`, '_blank');
      });
    }

    // 4.8 Workflow Diagnose Button listener
    const diagnoseBtn = document.getElementById('btn-workflow-diagnose');
    if (diagnoseBtn) {
      diagnoseBtn.addEventListener('click', () => {
        const report = this.runWorkflowDiagnosis();
        const alertMsg = getLanguage() === 'id'
          ? `Diagnosa AlurKarya:\n` +
            `- App Runtime Version: ${report.appRuntimeVersion}\n` +
            `- Profile UI Version: ${report.profileUiVersion}\n` +
            `- Kanban Sync Version: ${report.kanbanSyncVersion}\n` +
            `- Workspace Selection Version: ${report.workspaceSelectionVersion}\n` +
            `- AlurPandu UI Version: ${report.alurpanduUiVersion}\n` +
            `- Access Gate Version: ${report.accessGateVersion}\n` +
            `- Active Workspace ID: ${report.activeWorkspaceId}\n` +
            `- Jumlah Project di State: ${report.projectCount}\n` +
            `- Jumlah Project Agenda: ${report.agendaProjectCount}\n` +
            `- Jumlah Project Kanban: ${report.kanbanProjectCount}\n` +
            `- Jumlah Project Terlihat di Kanban: ${report.visibleKanbanProjectCount}\n` +
            `- Project per Stage: ${JSON.stringify(report.projectsByStage)}\n` +
            `- Kata Kunci Pencarian: "${report.activeSearchQuery}"\n` +
            `- Filter Aktif: View Mode: ${report.activeFilters.viewMode}, Sort: ${report.activeFilters.sortMode}\n` +
            `- Stage Tidak Valid: ${report.invalidStageCount}\n` +
            `- Project Tanpa Judul/Nama: ${report.missingTitleCount}\n` +
            `- Sumber Data Sinkron: ${report.sameStateSource}\n` +
            `- Bahasa: ${report.selectedLanguage}\n` +
            `- Mata Uang Default: ${report.defaultCurrency}\n` +
            `- Halaman Aktif: ${report.activeView}\n` +
            `- Status Parse Storage: ${report.localStorageParseStatus}\n` +
            `- Status Sesi: ${report.migrationStatus}\n\nMembuka kuesioner alur kerja...`
          : `AlurKarya Diagnostics:\n` +
            `- App Runtime Version: ${report.appRuntimeVersion}\n` +
            `- Profile UI Version: ${report.profileUiVersion}\n` +
            `- Kanban Sync Version: ${report.kanbanSyncVersion}\n` +
            `- Workspace Selection Version: ${report.workspaceSelectionVersion}\n` +
            `- AlurPandu UI Version: ${report.alurpanduUiVersion}\n` +
            `- Access Gate Version: ${report.accessGateVersion}\n` +
            `- Active Workspace ID: ${report.activeWorkspaceId}\n` +
            `- Project Count in State: ${report.projectCount}\n` +
            `- Agenda Project Count: ${report.agendaProjectCount}\n` +
            `- Kanban Project Count: ${report.kanbanProjectCount}\n` +
            `- Visible Kanban Project Count: ${report.visibleKanbanProjectCount}\n` +
            `- Projects by Stage: ${JSON.stringify(report.projectsByStage)}\n` +
            `- Active Search Query: "${report.activeSearchQuery}"\n` +
            `- Active Filters: View Mode: ${report.activeFilters.viewMode}, Sort: ${report.activeFilters.sortMode}\n` +
            `- Invalid Stages: ${report.invalidStageCount}\n` +
            `- Missing Title/ProjectName Count: ${report.missingTitleCount}\n` +
            `- Same State Source: ${report.sameStateSource}\n` +
            `- Selected Language: ${report.selectedLanguage}\n` +
            `- Default Currency: ${report.defaultCurrency}\n` +
            `- Active View: ${report.activeView}\n` +
            `- Storage Parse Status: ${report.localStorageParseStatus}\n` +
            `- Session Status: ${report.migrationStatus}\n\nOpening workflow questionnaire...`;
        alert(alertMsg);
        this.openDiagnoseModal();
      });
    }
  }

  runWorkflowDiagnosis() {
    let lsParseStatus = 'OK';
    let localData = null;
    try {
      const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
      if (activeWorkspaceId) {
        const stored = localStorage.getItem(`alurkarya_workspace_${activeWorkspaceId}_state`);
        if (stored) {
          localData = JSON.parse(stored);
        }
      }
    } catch (e) {
      lsParseStatus = 'Error: ' + e.message;
    }

    const state = store.getState() || {};
    const projects = Array.isArray(state.projects) ? state.projects : [];
    const clients = Array.isArray(state.clients) ? state.clients : [];
    const lang = localStorage.getItem('alurkarya_language') || 'en';
    const currency = localStorage.getItem('alurkarya_default_currency') || 'IDR';
    const activeView = this.activeTab || 'kanban';
    
    // Active filters
    const searchVal = this.currentView && this.currentView.searchQuery ? this.currentView.searchQuery : '';
    const activeFilters = {
      search: searchVal,
      viewMode: localStorage.getItem('alurkarya_board_view_mode') || 'simple',
      sortMode: localStorage.getItem('alurkarya_board_sort_mode') || 'default'
    };

    // Stage keys found
    const stagesFound = [...new Set(projects.map(p => p.stage || 'undefined'))];

    // Projects by stage
    const projectsByStage = {};
    projects.forEach(p => {
      const s = p.stage || 'undefined';
      projectsByStage[s] = (projectsByStage[s] || 0) + 1;
    });

    // Invalid stages check
    const knownStages = ['new_lead', 'proposal_sent', 'in_progress', 'client_review', 'revision', 'invoice_sent', 'waiting_payment', 'completed', 'on_hold'];
    const invalidStageCount = projects.filter(p => !knownStages.includes(p.stage)).length;

    // Missing titles check
    const missingTitleCount = projects.filter(p => !p.title || !p.projectName).length;

    // Total visible project cards
    const visibleCount = document.querySelectorAll('.project-card:not(.column-preview-card)').length;

    // Whether Kanban columns rendered
    const kanbanCanvas = document.getElementById('kanban-board-canvas');
    const colsRendered = kanbanCanvas ? kanbanCanvas.querySelectorAll('.kanban-column').length : 0;

    const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id') || 'None';
    const mainScript = document.querySelector('script[src*="js/app.js"]')?.src || 'Unknown';
    const stylesheetHref = document.querySelector('link[href*="style.css"]')?.href || 'Unknown';

    const report = {
      appRuntimeVersion: 'runtime-baseline-v1',
      appBuildId: '__ALURKARYA_BUILD_ID__',
      profileUiVersion: 'profile-form-v2',
      kanbanSyncVersion: 'kanban-sync-v2',
      workspaceSelectionVersion: 'workspace-selection-v2',
      alurpanduUiVersion: 'alurpandu-i18n-v2',
      accessGateVersion: 'access-gate-clarity-v1',
      activeWorkspaceId: activeWorkspaceId,
      activeWorkspaceIdPresent: activeWorkspaceId !== 'None' ? 'yes' : 'no',
      profileNamespaceKey: activeWorkspaceId !== 'None' ? `alurkarya_workspace_${activeWorkspaceId}_profile` : 'None',
      profileLoadStatus: store.getFreelancerProfile() ? 'Loaded' : 'Failed',
      profileFormRendered: document.getElementById('freelancer-profile-form') ? 'yes' : 'no',
      sidebarProfileSyncStatus: (window.app && window.app.sidebar) ? 'Synchronized' : 'Not Setup',
      mainScriptUrl: mainScript,
      stylesheetUrl: stylesheetHref,
      serviceWorkerStatus: 'NO SERVICE WORKER CACHE',
      cacheDiagnosisResult: (mainScript.includes('?v=') && stylesheetHref.includes('?v=')) ? 'Busted/Fresh' : 'Risk of Caching',
      projectCount: projects.length,
      agendaProjectCount: projects.length,
      kanbanProjectCount: projects.length,
      visibleKanbanProjectCount: visibleCount,
      projectsByStage: projectsByStage,
      invalidStageCount: invalidStageCount,
      missingTitleCount: missingTitleCount,
      sameStateSource: 'Yes (Shared store)',
      clientCount: clients.length,
      selectedLanguage: lang,
      defaultCurrency: currency,
      activeView: activeView,
      activeFilters: activeFilters,
      activeSearchQuery: searchVal,
      stageKeysFound: stagesFound,
      localStorageParseStatus: lsParseStatus,
      migrationStatus: sessionStorage.getItem('alurkarya_session_unlocked') ? 'Unlocked' : 'Locked',
      kanbanColumnsRendered: colsRendered
    };

    console.info('=== ALURKARYA WORKFLOW DIAGNOSTIC REPORT ===', report);
    return report;
  }

  reRenderApp() {
    this.renderShell();
    
    const sidebarAnchor = document.getElementById('sidebar-mount-box');
    this.sidebar = new SidebarNav(
      sidebarAnchor, 
      this.activeTab, 
      (nextTab) => this.switchView(nextTab)
    );
    this.sidebar.render();
    
    this.projectModal = new ProjectModal(
      store,
      () => this.refreshActiveView(),
      (msg, c) => this.triggerToast(msg, c)
    );
    
    this.switchView(this.activeTab);
    this.bindDOMEvents();
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

  checkGuidedStartModal() {
    const seen = localStorage.getItem('alurkarya_guided_start_seen');
    if (!seen) {
      const state = store.getState();
      const isWorkspaceEmpty = !state.projects || state.projects.length <= 1;
      if (isWorkspaceEmpty) {
        this.openGuidedStartModal();
      } else {
        localStorage.setItem('alurkarya_guided_start_seen', 'true');
      }
    }
  }

  openTemplatesModal() {
    try {
      const modal = new TemplatesModal(store, () => this.refreshActiveView(), (msg, c) => this.triggerToast(msg, c));
      modal.open();
    } catch (e) {
      console.error('TemplatesModal loading failed, falling back to manual project creation:', e);
      // Fallback: trigger "Create Project Manually" drawer/modal
      const addBtn = document.getElementById('btn-empty-add-project');
      if (addBtn) {
        addBtn.click();
      } else if (this.currentView && typeof this.currentView.showNewProjectDrawer === 'function') {
        this.currentView.showNewProjectDrawer();
      } else {
        this.triggerToast(t('toast.templateApplyFailed', 'Failed to start setup. Please add a project manually.'), 'text-danger');
      }
    }
  }

  openGuidedStartModal() {
    let overlay = document.getElementById('guided-start-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'guided-start-modal-overlay';
      document.body.appendChild(overlay);
    }

    const t_title = t('onboarding.modalTitle', 'Mulai dari 1 project aktif');
    const t_subtitle = t('onboarding.modalSubtitle', 'Jangan setup semuanya sekaligus. Pilih satu project client yang sedang berjalan, lalu isi alurnya pelan-pelan.');
    const t_step1 = t('onboarding.step1Title', 'Pilih jenis kerja Anda');
    const t_step1Desc = t('onboarding.step1Desc', 'Designer, video editor, copywriter, web developer, social media manager, AI consultant, atau general freelancer.');
    const t_step2 = t('onboarding.step2Title', 'Tambahkan 1 project aktif');
    const t_step2Desc = t('onboarding.step2Desc', 'Mulai dari project yang sedang Anda kerjakan sekarang, bukan dari workspace kosong.');
    const t_step3 = t('onboarding.step3Title', 'Isi next action dan deadline');
    const t_step3Desc = t('onboarding.step3Desc', 'Cukup tentukan apa langkah berikutnya dan kapan harus selesai.');
    const t_ctaPrimary = t('onboarding.ctaPrimary', 'Mulai Setup');
    const t_ctaSecondary = t('onboarding.ctaSecondary', 'Lewati dulu');
    const t_linkFullGuide = t('onboarding.linkFullGuide', 'Lihat panduan lengkap');

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 520px; border-radius: var(--border-radius-lg); background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: var(--glass-backdrop); -webkit-backdrop-filter: var(--glass-backdrop); box-shadow: var(--shadow-premium), 0 0 40px rgba(139, 92, 246, 0.15);">
        <div class="modal-body" style="padding: 30px; display: flex; flex-direction: column; gap: 20px;">
          
          <div style="text-align: center; margin-bottom: 8px;">
            <div style="font-size: 2.2rem; margin-bottom: 12px; color: var(--color-primary-glow); filter: drop-shadow(0 2px 8px rgba(139,92,246,0.3));">🚀</div>
            <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0; background: linear-gradient(135deg, #fff 30%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${t_title}</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; margin: 0; max-width: 440px; margin-left: auto; margin-right: auto;">${t_subtitle}</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Step 1 -->
            <div style="display: flex; gap: 12px; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.03); padding: 12px; border-radius: var(--border-radius-md); transition: all var(--transition-fast);">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--color-primary); flex-shrink: 0; margin-top: 2px;">1</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; font-weight: 700; color: var(--text-primary);">${t_step1}</h4>
                <p style="margin: 0; font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4;">${t_step1Desc}</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div style="display: flex; gap: 12px; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.03); padding: 12px; border-radius: var(--border-radius-md); transition: all var(--transition-fast);">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--color-secondary); flex-shrink: 0; margin-top: 2px;">2</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; font-weight: 700; color: var(--text-primary);">${t_step2}</h4>
                <p style="margin: 0; font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4;">${t_step2Desc}</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div style="display: flex; gap: 12px; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.03); padding: 12px; border-radius: var(--border-radius-md); transition: all var(--transition-fast);">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(236, 72, 153, 0.15); border: 1px solid rgba(236, 72, 153, 0.3); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--color-accent); flex-shrink: 0; margin-top: 2px;">3</div>
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; font-weight: 700; color: var(--text-primary);">${t_step3}</h4>
                <p style="margin: 0; font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4;">${t_step3Desc}</p>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 8px;">
            <div style="display: flex; gap: 12px; width: 100%;">
              <button class="btn btn-secondary" id="guided-start-skip-btn" style="flex: 1; justify-content: center; font-weight: 600; padding: 10px 16px; border-radius: var(--border-radius-md); font-size: 0.8rem;">
                ${t_ctaSecondary}
              </button>
              <button class="btn btn-primary" id="guided-start-setup-btn" style="flex: 1; justify-content: center; font-weight: 600; padding: 10px 16px; border-radius: var(--border-radius-md); font-size: 0.8rem; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
                ${t_ctaPrimary}
              </button>
            </div>
            <a href="alurpandu-guided-start.html" target="_blank" rel="noopener noreferrer" id="guided-start-guide-link" style="font-size: 0.72rem; color: var(--text-muted); text-decoration: none; transition: color var(--transition-fast); border-bottom: 1px dotted var(--border-subtle); padding-bottom: 2px;">
              ${t_linkFullGuide}
            </a>
          </div>

        </div>
      </div>
    `;

    overlay.classList.add('active');

    const closeModal = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#guided-start-skip-btn').addEventListener('click', () => {
      localStorage.setItem('alurkarya_guided_start_seen', 'true');
      closeModal();
    });

    overlay.querySelector('#guided-start-setup-btn').addEventListener('click', () => {
      localStorage.setItem('alurkarya_guided_start_seen', 'true');
      closeModal();
      this.openTemplatesModal();
    });

    const guideLink = overlay.querySelector('#guided-start-guide-link');
    guideLink.addEventListener('mouseenter', () => guideLink.style.color = 'var(--color-primary)');
    guideLink.addEventListener('mouseleave', () => guideLink.style.color = 'var(--text-muted)');
    guideLink.addEventListener('click', () => {
      localStorage.setItem('alurkarya_guided_start_seen', 'true');
      closeModal();
    });
  }

  lockWorkspace(reason = 'manual') {
    // 1. Set the lock reason in sessionStorage
    sessionStorage.setItem('alurkarya_lock_reason', reason);
    // 2. Remove the session unlock flag
    sessionStorage.removeItem('alurkarya_session_unlocked');
    // 3. Clear active workspace ID
    sessionStorage.removeItem('alurkarya_active_workspace_id');
    
    // 4. Close open project modals and cleanup any dialogs
    if (this.projectModal && typeof this.projectModal.close === 'function') {
      this.projectModal.close();
    }
    
    const openModals = document.querySelectorAll('.modal-overlay, .modal, .custom-modal');
    openModals.forEach(m => m.remove());
    
    // 5. Force reload page to re-render in locked state (AccessGate)
    window.location.reload();
  }

  switchWorkspace() {
    sessionStorage.removeItem('alurkarya_active_workspace_id');

    if (this.projectModal && typeof this.projectModal.close === 'function') {
      this.projectModal.close();
    }
    const openModals = document.querySelectorAll('.modal-overlay, .modal, .custom-modal');
    openModals.forEach(m => m.remove());

    window.location.reload();
  }

  setupInactivityListeners() {
    const lockAction = () => {
      this.lockWorkspace('idle');
    };

    const resetTimer = () => {
      const now = Date.now();
      // Throttle: only reset timer if last activity was more than 1 second ago
      if (now - this.lastActivityTime > 1000) {
        this.lastActivityTime = now;
        if (this.idleTimer) clearTimeout(this.idleTimer);
        const ms = this.WORKSPACE_IDLE_LOCK_MINUTES * 60 * 1000;
        this.idleTimer = setTimeout(lockAction, ms);
      }
    };

    // Register active user events
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(e => {
      window.addEventListener(e, resetTimer, { passive: true });
    });

    // Initial timer start
    const ms = this.WORKSPACE_IDLE_LOCK_MINUTES * 60 * 1000;
    this.idleTimer = setTimeout(lockAction, ms);
  }

  setupVisibilityListeners() {
    let hiddenAt = 0;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hiddenAt = Date.now();
      } else {
        if (hiddenAt > 0) {
          const elapsedMs = Date.now() - hiddenAt;
          const elapsedMin = elapsedMs / 1000 / 60;
          if (elapsedMin >= 10) {
            this.lockWorkspace('hidden_timeout');
          }
        }
        hiddenAt = 0;
      }
    });

    // Custom event listener for custom locking triggers
    window.addEventListener('alurkarya:lock-workspace', (e) => {
      const reason = e.detail && e.detail.reason ? e.detail.reason : 'manual';
      this.lockWorkspace(reason);
    });

    window.addEventListener('alurkarya:switch-workspace', () => {
      this.switchWorkspace();
    });
  }

  showNewWorkspaceOnboardingModal() {
    const isIndo = getLanguage() === 'id';
    
    let overlay = document.getElementById('new-workspace-onboarding-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'new-workspace-onboarding-overlay';
      document.body.appendChild(overlay);
    }

    const title = isIndo ? 'Workspace berhasil dibuat' : 'Workspace created';
    const bodyText = isIndo
      ? 'Workspace ini menyimpan data AlurKarya di browser ini. Untuk keamanan, gunakan PIN jika laptop dipakai bersama, kunci workspace setelah selesai, dan ekspor backup secara berkala.'
      : 'This workspace stores your AlurKarya data in this browser. For safer shared-device use, add a PIN, lock your workspace when finished, and export backups regularly.';
    
    // Backup Education
    const backupTitle = isIndo ? 'Lindungi Data Anda (Backup)' : 'Protect Your Data (Backup)';
    const backupBody = isIndo
      ? 'Data workspace disimpan di browser ini. Gunakan Ekspor Backup agar data bisa dipulihkan atau dipindahkan ke device lain.'
      : 'Workspace data is stored in this browser. Use Export Backup so your data can be restored or moved to another device.';
    const backupCta = isIndo ? 'Ekspor Backup' : 'Export Backup';
    
    // Onboarding Polish / AlurPandu Integration
    const panduTitle = isIndo ? 'Setup dengan AlurPandu' : 'Setup with AlurPandu';
    const panduCta = isIndo ? 'Lanjut Setup dengan AlurPandu' : 'Continue Setup with AlurPandu';
    const startExploringLabel = isIndo ? 'Mulai Jelajahi Board' : 'Start Exploring Board';

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 520px; border-radius: var(--border-radius-lg); background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 24px 64px rgba(0,0,0,0.6); padding: 24px; color: #f8fafc; font-family: inherit;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 3rem; margin-bottom: 10px; color: #10b981; filter: drop-shadow(0 2px 8px rgba(16,185,129,0.3));">🎉</div>
          <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0;">${title}</h3>
        </div>

        <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0; text-align: center;">
          ${bodyText}
        </p>

        <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
          <!-- Onboarding / AlurPandu Card -->
          <div style="background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.15); padding: 14px 16px; border-radius: 12px;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: #fff; margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">
              🧭 ${panduTitle}
            </h4>
            <a href="alurpandu-guided-start.html" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" id="btn-onboarding-pandu-cta" style="font-size: 0.72rem; padding: 10px; display: inline-flex; align-items: center; gap: 4px; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25); text-decoration: none; width: 100%; justify-content: center; font-weight: 600;">
              ${panduCta}
            </a>
          </div>

          <!-- Backup Education Card -->
          <div style="background: rgba(245, 158, 11, 0.04); border: 1px solid rgba(245, 158, 11, 0.15); padding: 14px 16px; border-radius: 12px;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: #fff; margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">
              💾 ${backupTitle}
            </h4>
            <p style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.5; margin: 0 0 12px 0;">
              ${backupBody}
            </p>
            <button class="btn btn-secondary btn-sm" id="btn-onboarding-backup-cta" style="font-size: 0.72rem; padding: 8px 12px; display: inline-flex; align-items: center; gap: 4px; width: 100%; justify-content: center; font-weight: 600; border-color: rgba(255,255,255,0.08);">
              ${getIcon('download', '', 12)} ${backupCta}
            </button>
          </div>
        </div>

        <div style="display: flex; justify-content: center;">
          <button class="btn btn-secondary" id="btn-close-onboarding-modal" style="font-size: 0.8rem; padding: 8px 24px; font-weight: 600; width: 100%;">
            ${startExploringLabel}
          </button>
        </div>
      </div>
    `;

    // Bind event listeners
    overlay.querySelector('#btn-close-onboarding-modal').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.querySelector('#btn-onboarding-backup-cta').addEventListener('click', () => {
      // Trigger the export backup action
      const backupBtn = document.getElementById('btn-backup-export');
      if (backupBtn) {
        backupBtn.click();
      }
    });

    const panduLink = overlay.querySelector('#btn-onboarding-pandu-cta');
    if (panduLink) {
      panduLink.addEventListener('click', () => {
        overlay.remove();
      });
    }
  }
}

// Instantiate and launch app on DOM complete load
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Migration from localStorage to sessionStorage
  if (localStorage.getItem('alurkarya_access_granted') === 'true') {
    sessionStorage.setItem('alurkarya_session_unlocked', 'true');
    localStorage.removeItem('alurkarya_access_granted');
  }

  const mode = localStorage.getItem('alurkarya_entry_mode');

  if (!mode) {
    // 1. Show Entry Mode Selector
    const selector = new EntryModeSelector(root, (selectedMode) => {
      window.location.reload();
    });
    selector.render();
  } else if (mode === 'freelancer') {
    // 2. Freelancer Mode - Check Access Gate
    const isGranted = sessionStorage.getItem('alurkarya_session_unlocked') === 'true';
    if (isGranted) {
      const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
      if (activeWorkspaceId) {
        window.app = new FreelancerApp();
        window.app.init();
      } else {
        const workspaceSelection = new WorkspaceProfileSelection(root, store, () => {
          window.location.reload();
        });
        workspaceSelection.render();
      }
    } else {
      const gate = new AccessGate(root, () => {
        window.location.reload();
      });
      gate.render();
    }
  } else if (mode === 'client') {
    // 3. Client Mode - Render Client view directly without sidebar/header
    root.innerHTML = '';
    root.className = 'client-portal-page';
    root.style.cssText = 'min-height: 100vh; background: radial-gradient(circle at 50% 50%, hsl(224, 45%, 6%) 0%, hsl(224, 60%, 2%) 100%); color: #f8fafc; font-family: \'Plus Jakarta Sans\', sans-serif; display: flex; justify-content: center; padding: 20px; box-sizing: border-box; width: 100%;';
    
    // Add client-side toast support
    const toastBox = document.createElement('div');
    toastBox.className = 'toast-box';
    toastBox.id = 'client-toast-box';
    toastBox.innerHTML = '<span class="toast-message" id="client-toast-message"></span>';
    document.body.appendChild(toastBox);

    let toastTimer = null;
    const triggerToast = (message, className = '') => {
      const toast = document.getElementById('client-toast-box');
      const toastMsg = document.getElementById('client-toast-message');
      if (!toast || !toastMsg) return;
      if (toastTimer) {
        clearTimeout(toastTimer);
        toast.classList.remove('active');
      }
      toastMsg.textContent = message;
      toast.className = 'toast-box';
      if (className) toast.classList.add(className);
      toast.classList.add('active');
      toastTimer = setTimeout(() => {
        toast.classList.remove('active');
      }, 3000);
    };

    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = 'width: min(94vw, 1000px); display: flex; flex-direction: column; gap: 20px;';
    root.appendChild(contentWrapper);

    const clientView = new ClientProjectView(contentWrapper, store, triggerToast);
    clientView.render();
  }
});
