import { getIcon } from '../icons.js';
import { getLanguage, t } from '../i18n.js';

export class WorkspaceProfileSelection {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - Store reference
   * @param {function} onSelected - Callback when workspace is successfully selected & unlocked
   */
  constructor(container, store, onSelected) {
    this.container = container;
    this.store = store;
    this.onSelected = onSelected;
    this.showCreateForm = false;
    this.pinPromptWorkspace = null; // workspace object currently prompting for PIN
    this.pinError = '';
    this.version = 'workspace-selection-v2';
  }

  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  render() {
    this.container.innerHTML = '';
    const activeLang = getLanguage();
    const isIndo = activeLang === 'id';

    const wrapper = document.createElement('div');
    wrapper.className = 'access-page';

    // Embedded styling for Workspace selection screen
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .access-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: radial-gradient(circle at 50% 50%, hsl(224, 45%, 6%) 0%, hsl(224, 60%, 2%) 100%);
        color: #f8fafc;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        box-sizing: border-box;
        width: 100%;
      }
      .access-card {
        width: min(92vw, 560px);
        background: rgba(11, 17, 32, 0.45);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45), 0 0 40px rgba(139, 92, 246, 0.03);
        padding: 40px 36px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }
      .access-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #6D5DFB, #9B5CFF);
      }
      .access-brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;
      }
      .access-sub {
        font-size: 0.8rem;
        color: #94a3b8;
        line-height: 1.5;
        max-width: 440px;
        margin-top: 4px;
      }
      .workspace-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
        max-height: 280px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .workspace-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 16px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .workspace-item:hover {
        background: rgba(139, 92, 246, 0.08);
        border-color: rgba(139, 92, 246, 0.4);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(139, 92, 246, 0.1);
      }
      .workspace-item:hover .ws-arrow {
        transform: translateX(4px);
        color: var(--color-primary);
      }
      .workspace-meta {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .workspace-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .workspace-date {
        font-size: 0.72rem;
        color: #64748b;
      }
      .ws-arrow {
        transition: all 0.2s ease;
        color: #475569;
        font-weight: bold;
      }
      .ws-btn-group {
        display: flex;
        gap: 12px;
        justify-content: center;
        width: 100%;
        margin-top: 8px;
      }
      .ws-btn-group button {
        flex: 1;
        padding: 12px 18px;
        font-size: 0.8rem;
        font-weight: 600;
        border-radius: 12px;
      }
      .workspace-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: rgba(255, 255, 255, 0.01);
        border: 1px solid rgba(255, 255, 255, 0.04);
        padding: 20px;
        border-radius: 18px;
      }
      .pin-note {
        font-size: 0.7rem;
        color: #94a3b8;
        line-height: 1.45;
      }
      .safety-notice {
        background: rgba(239, 68, 68, 0.03);
        border: 1px solid rgba(239, 68, 68, 0.15);
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 0.72rem;
        color: #f87171;
        line-height: 1.5;
        text-align: left;
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
    `;
    wrapper.appendChild(styleEl);

    const workspaces = this.store.getWorkspaces();

    // Render contents depending on mode (PIN prompt vs. Workspace Selection)
    if (this.pinPromptWorkspace) {
      this.renderPinPrompt(wrapper, isIndo);
    } else if (this.showCreateForm) {
      this.renderCreateForm(wrapper, isIndo);
    } else if (workspaces.length === 0) {
      this.renderEmptyOnboardingCard(wrapper, isIndo);
    } else {
      this.renderSelection(wrapper, workspaces, isIndo);
    }

    this.container.appendChild(wrapper);
    this.bindEvents(wrapper, workspaces);
  }

  renderEmptyOnboardingCard(wrapper, isIndo) {
    const title = isIndo ? 'Buat Workspace Pribadi' : 'Create Personal Workspace';
    const subHeader = isIndo
      ? 'AlurKarya adalah aplikasi berbasis lokal-first. Seluruh data project, invoice, dan client disimpan langsung di perangkat Anda secara aman dan tidak pernah diunggah ke server cloud.'
      : 'AlurKarya is a local-first application. All project, invoice, and client data is saved securely on your local device and is never uploaded to cloud servers.';
    const body = isIndo
      ? 'Mulai dengan membuat workspace lokal baru untuk mengelola workflow client-to-paid Anda.'
      : 'Get started by creating a new local workspace to manage your client-to-paid workflow.';
    const ctaLabel = isIndo ? 'Buat Workspace Baru' : 'Create New Workspace';
    const secondaryCtaLabel = isIndo ? 'Impor Backup' : 'Import Backup';
    const safetyNote = isIndo
      ? '<strong>Pemberitahuan Penting:</strong> Menghapus cache browser secara permanen (Clear Site Data) dapat menghapus data workspace lokal Anda. Pastikan untuk selalu mengekspor file backup secara berkala.'
      : '<strong>Important Notice:</strong> Clearing browser cache permanently (Clear Site Data) will erase your local workspace data. Always export a backup file regularly.';
    const securityNote = isIndo
      ? 'PIN workspace membantu melindungi akses kasual di browser ini. Ini bukan akun cloud atau enkripsi file.'
      : 'A workspace PIN helps protect casual access in this browser. It is not a cloud account or file encryption.';

    wrapper.innerHTML += `
      <div class="access-card">
        <div class="access-brand">
          <img src="assets/brand/alurkarya-logo-secondary-white.svg" alt="AlurKarya" style="width: 140px; margin-bottom: 12px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin: 0; font-family: 'Space Grotesk', sans-serif;">${title}</h2>
          <p class="access-sub">${subHeader}</p>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin: 0; text-align: center;">
          ${body}
        </p>

        <div class="safety-notice">
          <span style="font-size: 1.1rem; line-height: 1;">⚠️</span>
          <span>${safetyNote}</span>
        </div>

        <p style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.45; text-align: center; margin: 0 auto; max-width: 440px;">
          ℹ️ ${securityNote}
        </p>

        <div class="ws-btn-group" style="flex-direction: column; gap: 10px;">
          <button class="btn btn-primary" id="btn-show-create-empty" style="width: 100%; padding: 14px;">
            ${getIcon('plus', '', 14)} ${ctaLabel}
          </button>
          <button class="btn btn-secondary" id="btn-import-backup-empty" style="width: 100%; padding: 14px; border-color: rgba(255,255,255,0.08);">
            ${getIcon('download', '', 14)} ${secondaryCtaLabel}
          </button>
        </div>

        <input type="file" id="ws-backup-file-input-empty" accept=".json" style="display: none;" />
      </div>
    `;
  }

  renderSelection(wrapper, workspaces, isIndo) {
    const title = isIndo ? 'Pilih Workspace' : 'Select Workspace';
    const subHeader = isIndo
      ? 'AlurKarya adalah aplikasi berbasis lokal-first. Seluruh data project, invoice, dan client disimpan langsung di perangkat Anda secara aman dan tidak pernah diunggah ke server cloud.'
      : 'AlurKarya is a local-first application. All project, invoice, and client data is saved securely on your local device and is never uploaded to cloud servers.';
    const createBtnLabel = isIndo ? 'Buat Workspace Baru' : 'Create New Workspace';
    const importBtnLabel = isIndo ? 'Impor Backup' : 'Import Backup';
    const safetyNote = isIndo
      ? '<strong>Pemberitahuan Penting:</strong> Menghapus cache browser secara permanen (Clear Site Data) dapat menghapus data workspace lokal Anda. Pastikan untuk selalu mengekspor file backup secara berkala.'
      : '<strong>Important Notice:</strong> Clearing browser cache permanently (Clear Site Data) will erase your local workspace data. Always export a backup file regularly.';

    let listHtml = '';
    listHtml = workspaces.map(w => {
      const hasPin = !!w.workspacePinHash;
      const lastOpened = w.lastOpenedAt 
        ? new Date(w.lastOpenedAt).toLocaleDateString(isIndo ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '-';
      return `
        <div class="workspace-item" data-id="${w.workspaceId}">
          <div class="workspace-meta">
            <span class="workspace-title">
              ${getIcon('folder', '', 15)}
              ${w.workspaceName}
              ${hasPin ? `<span style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.15); color: var(--color-warning); margin-left: 6px; display: inline-flex; align-items: center; gap: 4px;">🔒 PIN</span>` : ''}
            </span>
            <span class="workspace-date">${isIndo ? 'Terakhir dibuka' : 'Last opened'}: ${lastOpened}</span>
          </div>
          <span class="ws-arrow" style="font-size: 1.1rem;">&rarr;</span>
        </div>
      `;
    }).join('');

    wrapper.innerHTML += `
      <div class="access-card">
        <div class="access-brand">
          <img src="assets/brand/alurkarya-logo-secondary-white.svg" alt="AlurKarya" style="width: 140px; margin-bottom: 12px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin: 0; font-family: 'Space Grotesk', sans-serif;">${title}</h2>
          <p class="access-sub">${subHeader}</p>
        </div>
        
        <div class="workspace-list">
          ${listHtml}
        </div>

        <div class="ws-btn-group">
          <button class="btn btn-primary" id="btn-show-create">
            ${getIcon('plus', '', 14)} ${createBtnLabel}
          </button>
          <button class="btn btn-secondary" id="btn-import-backup" style="border-color: rgba(255,255,255,0.08);">
            ${getIcon('download', '', 14)} ${importBtnLabel}
          </button>
        </div>

        <div class="safety-notice">
          <span style="font-size: 1.1rem; line-height: 1;">⚠️</span>
          <span>${safetyNote}</span>
        </div>
        
        <input type="file" id="ws-backup-file-input" accept=".json" style="display: none;" />
      </div>
    `;
  }

  renderCreateForm(wrapper, isIndo) {
    const title = isIndo ? 'Buat Workspace Baru' : 'Create New Workspace';
    const nameLabel = isIndo ? 'Nama Workspace' : 'Workspace Name';
    const enablePinLabel = isIndo ? 'Lindungi workspace ini dengan PIN' : 'Protect this workspace with a PIN';
    const pinLabel = isIndo ? 'PIN Workspace' : 'Workspace PIN';
    const pinConfirmLabel = isIndo ? 'Konfirmasi PIN' : 'Confirm PIN';
    const createBtnLabel = isIndo ? 'Buat Sekarang' : 'Create Now';
    const cancelBtnLabel = isIndo ? 'Batal' : 'Cancel';
    
    const bodyText = isIndo
      ? 'Buat workspace lokal baru di browser ini. Data Anda akan disimpan sepenuhnya secara lokal.'
      : 'Create a new local workspace in this browser. Your data will be stored entirely locally.';

    const helperText = isIndo
      ? 'PIN membantu melindungi akses kasual di browser ini, terutama jika laptop dipakai bersama.'
      : 'A PIN helps protect casual access in this browser, especially when a laptop is shared.';

    const securityNoteText = isIndo
      ? 'PIN ini bukan akun cloud atau enkripsi file.'
      : 'This PIN is not a cloud account or file encryption.';

    wrapper.innerHTML += `
      <div class="access-card">
        <div class="access-brand">
          <img src="assets/brand/alurkarya-logo-secondary-white.svg" alt="AlurKarya" style="width: 140px; margin-bottom: 12px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin: 0; font-family: 'Space Grotesk', sans-serif;">${title}</h2>
          <p class="access-sub">${bodyText}</p>
        </div>

        <form id="create-workspace-form" class="workspace-form">
          <div class="form-group">
            <label style="font-size: 0.75rem; display: block; margin-bottom: 6px; color: #cbd5e1; font-weight: 600;">${nameLabel}</label>
            <input type="text" id="ws-name-input" class="form-control" placeholder="e.g. Design Studio" required style="font-size: 0.85rem; padding: 12px;" />
          </div>

          <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 4px; user-select: none;">
            <input type="checkbox" id="ws-enable-pin-check" style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--color-primary);" />
            <label for="ws-enable-pin-check" style="font-size: 0.78rem; color: #cbd5e1; cursor: pointer; font-weight: 500;">${enablePinLabel}</label>
          </div>
          
          <div id="ws-pin-fields-container" style="display: none; flex-direction: column; gap: 16px;">
            <div class="form-group">
              <label style="font-size: 0.75rem; display: block; margin-bottom: 6px; color: #cbd5e1; font-weight: 600;">${pinLabel}</label>
              <div style="position: relative; width: 100%;">
                <input type="password" id="ws-pin-input" class="form-control" placeholder="e.g. 1234" maxlength="8" style="font-size: 0.85rem; padding: 12px; padding-right: 42px; width: 100%; box-sizing: border-box;" />
                <button type="button" id="ws-pin-toggle-btn" aria-label="${isIndo ? 'Tampilkan PIN' : 'Show PIN'}" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 4px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; z-index: 10;">
                  ${getIcon('eye', '', 16)}
                </button>
              </div>
              <small style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 4px;">${helperText}</small>
            </div>

            <div class="form-group">
              <label style="font-size: 0.75rem; display: block; margin-bottom: 6px; color: #cbd5e1; font-weight: 600;">${pinConfirmLabel}</label>
              <div style="position: relative; width: 100%;">
                <input type="password" id="ws-pin-confirm-input" class="form-control" placeholder="${isIndo ? 'Konfirmasi PIN' : 'Confirm PIN'}" maxlength="8" style="font-size: 0.85rem; padding: 12px; padding-right: 42px; width: 100%; box-sizing: border-box;" />
                <button type="button" id="ws-pin-confirm-toggle-btn" aria-label="${isIndo ? 'Tampilkan PIN' : 'Show PIN'}" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 4px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; z-index: 10;">
                  ${getIcon('eye', '', 16)}
                </button>
              </div>
            </div>

            <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: 10px; border-radius: 8px; font-size: 0.68rem; color: #f59e0b; line-height: 1.4;">
              <strong>${isIndo ? 'Catatan Keamanan:' : 'Security Note:'}</strong> ${securityNoteText}
            </div>
          </div>

          <div id="ws-create-error" style="color: #ef4444; font-size: 0.75rem; text-align: center; font-weight: 600; display: none; margin-bottom: 4px; line-height: 1.45;"></div>

          <div style="display: flex; gap: 12px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-create" style="flex: 1; padding: 12px; font-size: 0.8rem; font-weight: 600;">
              ${cancelBtnLabel}
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 0.8rem; font-weight: 600;">
              ${createBtnLabel}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderPinPrompt(wrapper, isIndo) {
    const title = isIndo ? 'Masukkan PIN Workspace' : 'Enter Workspace PIN';
    const unlockBtnLabel = isIndo ? 'Buka Kunci' : 'Unlock';
    const cancelBtnLabel = isIndo ? 'Kembali' : 'Back';
    const forgotPinLabel = isIndo ? 'Lupa PIN?' : 'Forgot PIN?';
    
    const forgotPinWarning = isIndo
      ? 'Jika lupa PIN, gunakan backup untuk restore atau reset workspace lokal ini.'
      : 'If you forgot the PIN, restore from backup or reset this local workspace.';

    wrapper.innerHTML += `
      <div class="access-card">
        <div class="access-brand">
          <img src="assets/brand/alurkarya-logo-secondary-white.svg" alt="AlurKarya" style="width: 140px; margin-bottom: 12px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin: 0; font-family: 'Space Grotesk', sans-serif;">${title}</h2>
          <small style="color: var(--color-primary); font-weight: 700; margin-top: 6px; font-size: 0.9rem;">${this.pinPromptWorkspace.workspaceName}</small>
        </div>

        <form id="pin-unlock-form" style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px;">
          <div class="form-group" style="position: relative;">
            <div style="position: relative; width: 100%;">
              <input type="password" id="ws-unlock-pin" class="form-control" required autofocus maxlength="8" placeholder="PIN" style="font-size: 1.2rem; padding: 14px; padding-right: 48px; text-align: center; letter-spacing: 6px; width: 100%; box-sizing: border-box; font-weight: 700;" />
              <button type="button" id="ws-unlock-pin-toggle-btn" aria-label="${isIndo ? 'Tampilkan PIN' : 'Show PIN'}" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; padding: 4px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; justify-content: center; z-index: 10;">
                ${getIcon('eye', '', 18)}
              </button>
            </div>
          </div>

          <div id="ws-unlock-error" style="color: #ef4444; font-size: 0.75rem; text-align: center; font-weight: 600; display: ${this.pinError ? 'block' : 'none'}; line-height: 1.45;">
            ${this.pinError ? '⚠️ ' + this.pinError : ''}
          </div>

          <div style="display: flex; gap: 12px; margin-top: 6px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-pin" style="flex: 1; padding: 12px; font-size: 0.8rem; font-weight: 600;">
              ${cancelBtnLabel}
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 1; padding: 12px; font-size: 0.8rem; font-weight: 600;">
              ${unlockBtnLabel}
            </button>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 10px; text-align: center;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-warning); display: block; margin-bottom: 6px;">${forgotPinLabel}</span>
            <small style="font-size: 0.7rem; color: var(--text-muted); line-height: 1.5; display: block; max-width: 320px; margin: 0 auto;">
              ${forgotPinWarning}
            </small>
          </div>
        </form>
      </div>
    `;
  }

  bindEvents(wrapper, workspaces) {
    // 0. Empty State Card Events
    const createEmptyBtn = wrapper.querySelector('#btn-show-create-empty');
    if (createEmptyBtn) {
      createEmptyBtn.addEventListener('click', () => {
        this.showCreateForm = true;
        this.render();
      });
    }

    const importEmptyBtn = wrapper.querySelector('#btn-import-backup-empty');
    const backupEmptyInput = wrapper.querySelector('#ws-backup-file-input-empty');
    if (importEmptyBtn && backupEmptyInput) {
      importEmptyBtn.addEventListener('click', () => {
        backupEmptyInput.click();
      });
      backupEmptyInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = this.store.importBackup(event.target.result);
          if (result) {
            window.location.reload();
          } else {
            alert(getLanguage() === 'id' ? 'Gagal mengimpor file backup' : 'Failed to parse backup file');
          }
        };
        reader.readAsText(file);
      });
    }

    // 1. Selection Screen Events
    const createBtn = wrapper.querySelector('#btn-show-create');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showCreateForm = true;
        this.render();
      });
    }

    const importBtn = wrapper.querySelector('#btn-import-backup');
    const backupInput = wrapper.querySelector('#ws-backup-file-input');
    if (importBtn && backupInput) {
      importBtn.addEventListener('click', () => {
        backupInput.click();
      });
      backupInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = this.store.importBackup(event.target.result);
          if (result) {
            window.location.reload();
          } else {
            alert(getLanguage() === 'id' ? 'Gagal mengimpor file backup' : 'Failed to parse backup file');
          }
        };
        reader.readAsText(file);
      });
    }

    const workspaceItems = wrapper.querySelectorAll('.workspace-item');
    workspaceItems.forEach(item => {
      item.addEventListener('click', () => {
        const wsId = item.getAttribute('data-id');
        const ws = workspaces.find(w => w.workspaceId === wsId);
        if (ws) {
          if (ws.workspacePinHash) {
            this.pinPromptWorkspace = ws;
            this.pinError = '';
            this.render();
          } else {
            this.selectWorkspace(ws);
          }
        }
      });
    });

    // 2. Create Workspace Form Events
    const createForm = wrapper.querySelector('#create-workspace-form');
    if (createForm) {
      const pinCheck = createForm.querySelector('#ws-enable-pin-check');
      const pinFieldsContainer = createForm.querySelector('#ws-pin-fields-container');
      const pinInput = createForm.querySelector('#ws-pin-input');
      const pinConfirmInput = createForm.querySelector('#ws-pin-confirm-input');

      if (pinCheck && pinFieldsContainer) {
        pinCheck.addEventListener('change', () => {
          if (pinCheck.checked) {
            pinFieldsContainer.style.display = 'flex';
            pinInput.setAttribute('required', 'true');
            pinConfirmInput.setAttribute('required', 'true');
          } else {
            pinFieldsContainer.style.display = 'none';
            pinInput.removeAttribute('required');
            pinConfirmInput.removeAttribute('required');
            pinInput.value = '';
            pinConfirmInput.value = '';
          }
        });
      }

      const pinToggle = createForm.querySelector('#ws-pin-toggle-btn');
      if (pinToggle && pinInput) {
        pinToggle.addEventListener('click', () => {
          const isIndo = getLanguage() === 'id';
          const isPassword = pinInput.type === 'password';
          pinInput.type = isPassword ? 'text' : 'password';
          pinToggle.innerHTML = isPassword ? getIcon('eyeOff', '', 16) : getIcon('eye', '', 16);
          const showText = isIndo ? 'Tampilkan PIN' : 'Show PIN';
          const hideText = isIndo ? 'Sembunyikan PIN' : 'Hide PIN';
          pinToggle.setAttribute('aria-label', isPassword ? hideText : showText);
        });
      }

      const confirmToggle = createForm.querySelector('#ws-pin-confirm-toggle-btn');
      if (confirmToggle && pinConfirmInput) {
        confirmToggle.addEventListener('click', () => {
          const isIndo = getLanguage() === 'id';
          const isPassword = pinConfirmInput.type === 'password';
          pinConfirmInput.type = isPassword ? 'text' : 'password';
          confirmToggle.innerHTML = isPassword ? getIcon('eyeOff', '', 16) : getIcon('eye', '', 16);
          const showText = isIndo ? 'Tampilkan PIN' : 'Show PIN';
          const hideText = isIndo ? 'Sembunyikan PIN' : 'Hide PIN';
          confirmToggle.setAttribute('aria-label', isPassword ? hideText : showText);
        });
      }

      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameVal = createForm.querySelector('#ws-name-input').value.trim();
        const errorEl = createForm.querySelector('#ws-create-error');
        const isIndo = getLanguage() === 'id';

        if (errorEl) {
          errorEl.style.display = 'none';
          errorEl.textContent = '';
        }

        let pinHash = null;
        if (pinCheck && pinCheck.checked) {
          const pinVal = pinInput.value;
          const confirmVal = pinConfirmInput.value;

          if (!pinVal) {
            const errMsg = isIndo ? 'PIN wajib diisi jika Anda mengaktifkan proteksi PIN.' : 'PIN is required when PIN protection is enabled.';
            if (errorEl) {
              errorEl.textContent = '⚠️ ' + errMsg;
              errorEl.style.display = 'block';
            } else {
              alert(errMsg);
            }
            return;
          }
          if (pinVal.length < 4) {
            const errMsg = isIndo ? 'PIN minimal 4 karakter.' : 'PIN must be at least 4 characters.';
            if (errorEl) {
              errorEl.textContent = '⚠️ ' + errMsg;
              errorEl.style.display = 'block';
            } else {
              alert(errMsg);
            }
            return;
          }
          if (pinVal !== confirmVal) {
            const errMsg = isIndo ? 'PIN tidak cocok. Cek kembali PIN dan konfirmasinya.' : 'PIN does not match. Check the PIN and confirmation.';
            if (errorEl) {
              errorEl.textContent = '⚠️ ' + errMsg;
              errorEl.style.display = 'block';
            } else {
              alert(errMsg);
            }
            return;
          }
          pinHash = await this.sha256(pinVal);
        }

        const newWs = this.store.createWorkspace(nameVal, pinHash);
        
        // Save success toast & newly created flag to sessionStorage
        const successMsg = isIndo ? "Workspace berhasil dibuat." : "Workspace created.";
        sessionStorage.setItem('alurkarya_toast_pending', successMsg);
        sessionStorage.setItem('alurkarya_new_workspace_created', 'true');

        this.selectWorkspace(newWs);
      });

      wrapper.querySelector('#btn-cancel-create').addEventListener('click', () => {
        this.showCreateForm = false;
        this.render();
      });
    }

    // 3. PIN Prompt Events
    const pinForm = wrapper.querySelector('#pin-unlock-form');
    if (pinForm) {
      const unlockPinInput = pinForm.querySelector('#ws-unlock-pin');
      const unlockPinToggle = pinForm.querySelector('#ws-unlock-pin-toggle-btn');
      
      if (unlockPinToggle && unlockPinInput) {
        unlockPinToggle.addEventListener('click', () => {
          const isIndo = getLanguage() === 'id';
          const isPassword = unlockPinInput.type === 'password';
          unlockPinInput.type = isPassword ? 'text' : 'password';
          unlockPinToggle.innerHTML = isPassword ? getIcon('eyeOff', '', 18) : getIcon('eye', '', 18);
          const showText = isIndo ? 'Tampilkan PIN' : 'Show PIN';
          const hideText = isIndo ? 'Sembunyikan PIN' : 'Hide PIN';
          unlockPinToggle.setAttribute('aria-label', isPassword ? hideText : showText);
        });
      }

      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredPin = unlockPinInput.value;
        const hash = await this.sha256(enteredPin);
        const isIndo = getLanguage() === 'id';
        
        if (hash === this.pinPromptWorkspace.workspacePinHash) {
          this.selectWorkspace(this.pinPromptWorkspace);
        } else {
          this.pinError = isIndo 
            ? 'PIN Workspace belum sesuai. Coba lagi.' 
            : 'Workspace PIN does not match. Try again.';
          this.render();
        }
      });

      wrapper.querySelector('#btn-cancel-pin').addEventListener('click', () => {
        this.pinPromptWorkspace = null;
        this.pinError = '';
        this.render();
      });
    }
  }

  selectWorkspace(ws) {
    // Set active workspace details in sessionStorage
    sessionStorage.setItem('alurkarya_active_workspace_id', ws.workspaceId);
    sessionStorage.setItem('alurkarya_session_unlocked', 'true');

    // Update lastOpenedAt timestamp in index
    const index = this.store.getWorkspaces();
    const item = index.find(w => w.workspaceId === ws.workspaceId);
    if (item) {
      item.lastOpenedAt = new Date().toISOString();
      this.store.saveWorkspaces(index);
    }

    if (this.onSelected) {
      this.onSelected(ws.workspaceId);
    }
  }
}
