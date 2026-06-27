/* ==========================================================================
   ALURKARYA - CLIENT DASHBOARD / PROJECT UPDATE VIEW V1
   ========================================================================== */

import { getIcon } from '../icons.js';
import { formatCurrency, formatMoney, formatDate, isValidImageUrl } from '../utils.js';
import { promptTemplates } from './AIPromptHelpers.js';
import { t, getLanguage } from '../i18n.js';
import { buildClientDashboardData } from '../utils/clientSafeData.js';

export class ClientProjectView {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - Unified data store reference
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onTriggerToast = onTriggerToast;
    this.selectedClientId = '';
    this.selectedProjectId = '';
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const state = this.store.getState();
    const clients = state.clients || [];
    const projects = state.projects || [];
    const isClientMode = localStorage.getItem('alurkarya_entry_mode') === 'client';
    const lang = getLanguage();
    const isIndo = lang === 'id';

    // Align client selection with project selection if project is set
    if (isClientMode && !this.selectedProjectId && projects.length > 0) {
      this.selectedProjectId = projects[0].id;
      this.selectedClientId = projects[0].clientId || '';
    }

    if (this.selectedProjectId) {
      const proj = projects.find(p => p.id === this.selectedProjectId);
      if (proj && proj.clientId) {
        this.selectedClientId = proj.clientId;
      }
    }

    // Default selections
    if (!this.selectedClientId && clients.length > 0) {
      const clientWithProjects = clients.find(c => projects.some(p => p.clientId === c.id));
      this.selectedClientId = clientWithProjects ? clientWithProjects.id : clients[0].id;
    }

    const filteredProjects = projects.filter(p => p.clientId === this.selectedClientId);
    const activeClient = clients.find(c => c.id === this.selectedClientId);

    if (!this.selectedProjectId && filteredProjects.length > 0) {
      this.selectedProjectId = filteredProjects[0].id;
    }

    const activeProject = projects.find(p => p.id === this.selectedProjectId);

    // Whitelist-based client-safe data fetch
    const safeData = activeProject ? buildClientDashboardData(activeProject, activeClient, state.freelancerProfile, { language: lang }) : null;

    const viewEl = document.createElement('div');
    viewEl.className = 'client-portal-viewport';
    viewEl.style.padding = '10px 0';

    if (isClientMode) {
      const clientHeader = document.createElement('div');
      clientHeader.className = 'top-header';
      clientHeader.style.cssText = 'padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 60px; border-bottom: 1px solid var(--border-subtle); background: rgba(0, 0, 0, 0.2); margin-bottom: 24px; border-radius: var(--border-radius-md); width: 100%; box-sizing: border-box;';
      clientHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 20px;">
            <path d="M12 2L2 22h20L12 2zm0 4l6.5 13H5.5L12 6z" fill="var(--color-primary)" />
            <text x="28" y="18" fill="var(--text-light)" font-family="Space Grotesk" font-weight="800" font-size="16">AlurKarya</text>
          </svg>
          <span style="font-size: 0.72rem; background: rgba(139, 92, 246, 0.15); color: var(--color-primary); padding: 3px 10px; border-radius: 99px; font-weight: 600; border: 1px solid rgba(139, 92, 246, 0.3);">
            ${isIndo ? 'Tampilan Client' : 'Client View'}
          </span>
        </div>
        <button class="btn btn-secondary" id="btn-client-mode-back" style="font-size: 0.75rem; padding: 6px 12px; font-weight: 600; background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); border-radius: 6px;">
          ${t('entryMode.backToSelection', 'Back to mode selection')}
        </button>
      `;
      viewEl.appendChild(clientHeader);
      
      clientHeader.querySelector('#btn-client-mode-back').addEventListener('click', () => {
        localStorage.removeItem('alurkarya_entry_mode');
        window.location.reload();
      });
    }

    // Renders Client and Project Selectors at the top
    const selectorBox = document.createElement('div');
    selectorBox.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 16px 20px; border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px;';
    
    const clientOptions = [
      `<option value="">-- ${t('projectModal.noClientSelected', 'Select Client')} --</option>`,
      ...clients.map(c => `<option value="${c.id}" ${c.id === this.selectedClientId ? 'selected' : ''}>${c.name} ${c.businessName ? `(${c.businessName})` : ''}</option>`)
    ].join('');

    const projectOptions = [
      `<option value="">-- ${t('clientView.selectProject', 'Select Project')} --</option>`,
      ...filteredProjects.map(p => `<option value="${p.id}" ${p.id === this.selectedProjectId ? 'selected' : ''}>${p.title}</option>`)
    ].join('');

    // Generate update message text based strictly on safeData to prevent private data leakage
    const clientUpdateText = safeData ? promptTemplates.clientUpdate.generate(activeProject, null, 'Professional', state.freelancerProfile, lang) : '';

    // Generate snapshot link & message
    let briefingLink = '';
    let briefingTooLong = false;
    let briefingLinkErrorMsg = '';
    let briefingMessageText = '';

    if (safeData) {
      const payload = {
        v: "1",
        lang: lang,
        projectTitle: safeData.project.title,
        clientName: safeData.client.name,
        category: safeData.project.category,
        deadline: safeData.project.deadline,
        lastUpdated: safeData.project.lastUpdated,
        freelancer: safeData.freelancer,
        bigPicture: safeData.bigPicture,
        delivery: safeData.delivery,
        invoice: safeData.invoice,
        timestamp: new Date().toISOString()
      };

      try {
        const jsonStr = JSON.stringify(payload);
        const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
        
        const origin = window.location.origin;
        const path = window.location.pathname.replace('index.html', '');
        const base = (origin.includes('localhost') || origin.includes('127.0.0.1'))
          ? origin + path
          : 'https://alurkarya.onrender.com' + path;

        briefingLink = `${base}client-briefing.html#snapshot=${encoded}`;
        
        if (briefingLink.length > 2048) {
          briefingTooLong = true;
          briefingLinkErrorMsg = t('clientView.briefingTooLarge', "Snapshot is too large for a link. Copy briefing summary instead.");
        }
      } catch (e) {
        console.error(e);
        briefingLink = '';
      }

      if (isIndo) {
        briefingMessageText = `Halo ${safeData.client.name || '[Client]'},\n\n` +
          `Berikut adalah link briefing project kustom untuk project *${safeData.project.title}* kita sebelum meeting. Di halaman ini Anda dapat melihat progress terbaru, what's done, next steps, milestone berikutnya, serta detail invoice/payment:\n\n` +
          `${briefingTooLong ? '[Link Briefing Terlalu Panjang - Gunakan Ringkasan]' : briefingLink}\n\n` +
          `Terima kasih dan sampai jumpa di meeting!`;
      } else {
        briefingMessageText = `Hi ${safeData.client.name || '[Client]'},\n\n` +
          `Here is a custom client briefing link for our project *${safeData.project.title}* before our meeting. On this page, you can review the latest progress, what's done, next steps, the next milestone, and billing/invoice details:\n\n` +
          `${briefingTooLong ? '[Briefing Link Too Long - Use Summary]' : briefingLink}\n\n` +
          `Thank you, and see you at the meeting!`;
      }
    }

    selectorBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-warning); letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            ${getIcon('alert', 'text-warning', 14)} ${t('clientView.freelancerPreviewMode', 'Freelancer Preview Mode')}:
          </span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
          ${isIndo ? 'Pratinjau bagaimana client melihat status project, link review/delivery, langkah berikutnya, dan status pembayaran.' : 'Preview how your client will see project status, review/delivery links, next steps, and payment status.'}
        </div>
      </div>
      
      <div style="display: flex; gap: 16px; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px;">
        <div class="form-group" style="margin-bottom: 0; min-width: 220px; flex: 1;">
          <label style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('clientView.selectClient', 'Select Client')}</label>
          <select class="form-control" id="portal-client-select" style="width: 100%; padding: 6px 12px; font-size: 0.82rem; background: var(--card-bg); border-color: rgba(255,255,255,0.1);">
            ${clientOptions}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0; min-width: 220px; flex: 1;">
          <label style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 6px; font-weight: 600;">${t('clientView.selectProject', 'Select Project')}</label>
          <select class="form-control" id="portal-project-select" style="width: 100%; padding: 6px 12px; font-size: 0.82rem; background: var(--card-bg); border-color: rgba(255,255,255,0.1);">
            ${projectOptions}
          </select>
        </div>
      </div>
      
      <!-- Freelancer Tools Card -->
      ${safeData ? `
        <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 8px; padding: 16px; margin-top: 12px; display: flex; flex-direction: column; gap: 16px;">
          
          <!-- 1. Copy Client Update Section -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 0.78rem; color: #a78bfa; display: flex; align-items: center; gap: 6px;">
                📢 ${t('clientView.freelancerPreviewMode', 'Freelancer Tool')}: ${t('clientView.copyUpdate', 'Copy Client Update')}
              </strong>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">
              ${isIndo ? 'Salin pesan update kemajuan project kustom untuk dikirim secara manual ke WhatsApp atau email client.' : 'Copy a progress update message to manually send to your client via WhatsApp or email.'}
            </p>
            <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; font-size: 0.72rem; color: var(--text-secondary); white-space: pre-wrap; font-family: monospace; max-height: 80px; overflow-y: auto;">${clientUpdateText}</div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button type="button" class="btn btn-secondary btn-xs" id="btn-portal-copy-update" style="font-size: 0.72rem; padding: 4px 10px;">
                ${getIcon('copy', '', 12)} ${t('clientView.copyUpdate', 'Copy Client Update')}
              </button>
              <span id="portal-update-status" style="font-size: 0.7rem; color: var(--color-success); display: none;">${t('toast.itemCopied', 'Copied!').replace('{item}', '')}</span>
            </div>
          </div>

          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 0;" />

          <!-- 2. Share Client Briefing Snapshot Section -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <strong style="font-size: 0.78rem; color: #a78bfa; display: flex; align-items: center; gap: 6px;">
              🔗 ${t('clientView.shareSnapshot', 'Share Client Snapshot')}
            </strong>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0;">
              ${isIndo ? 'Buat link snapshot briefing aman client untuk dikirimkan sebelum meeting.' : 'Generate a client-safe snapshot briefing link to send before a meeting.'}
            </p>

            ${briefingTooLong ? `
              <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; padding: 8px; border-radius: 6px; font-size: 0.72rem;">
                ⚠️ ${briefingLinkErrorMsg}
              </div>
            ` : `
              <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 8px; border-radius: 6px; font-size: 0.72rem; color: var(--text-secondary); word-break: break-all; font-family: monospace; max-height: 80px; overflow-y: auto;">${briefingLink}</div>
            `}

            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              ${!briefingTooLong ? `
                <button type="button" class="btn btn-secondary btn-xs" id="btn-portal-copy-briefing-link" style="font-size: 0.72rem; padding: 4px 10px;">
                  ${getIcon('link', '', 12)} ${t('clientView.copyBriefingLink', 'Copy Briefing Link')}
                </button>
              ` : ''}
                <button type="button" class="btn btn-secondary btn-xs" id="btn-portal-copy-briefing-msg" style="font-size: 0.72rem; padding: 4px 10px;">
                  ${getIcon('copy', '', 12)} ${t('clientView.copyBriefingMessage', 'Copy Briefing Message')}
                </button>
              <span id="portal-briefing-status" style="font-size: 0.7rem; color: var(--color-success); display: none;">${t('toast.itemCopied', 'Copied!').replace('{item}', '')}</span>
            </div>
          </div>

        </div>
      ` : ''}
    `;

    // Listeners for selectors
    if (!isClientMode) {
      selectorBox.querySelector('#portal-client-select').addEventListener('change', (e) => {
        this.selectedClientId = e.target.value;
        this.selectedProjectId = '';
        this.render();
      });

      selectorBox.querySelector('#portal-project-select').addEventListener('change', (e) => {
        this.selectedProjectId = e.target.value;
        this.render();
      });

      // Copy Client Update Button Handler
      const copyUpdateBtn = selectorBox.querySelector('#btn-portal-copy-update');
      if (copyUpdateBtn && safeData) {
        copyUpdateBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(clientUpdateText).then(() => {
            const statusSpan = selectorBox.querySelector('#portal-update-status');
            if (statusSpan) {
              statusSpan.style.display = 'inline';
              setTimeout(() => {
                statusSpan.style.display = 'none';
              }, 2000);
            }
            this.onTriggerToast(isIndo ? 'Update project berhasil disalin.' : 'Project update copied to clipboard.', 'text-success');
          }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.onTriggerToast('Failed to copy', 'text-danger');
          });
        });
      }

      // Copy Briefing Link Handler
      const copyBriefingLinkBtn = selectorBox.querySelector('#btn-portal-copy-briefing-link');
      if (copyBriefingLinkBtn && safeData && !briefingTooLong) {
        copyBriefingLinkBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(briefingLink).then(() => {
            const statusSpan = selectorBox.querySelector('#portal-briefing-status');
            if (statusSpan) {
              statusSpan.textContent = t('clientView.briefingCopied', 'Briefing link copied!');
              statusSpan.style.display = 'inline';
              setTimeout(() => {
                statusSpan.style.display = 'none';
              }, 2000);
            }
            this.onTriggerToast(isIndo ? 'Link briefing berhasil disalin.' : 'Briefing link copied to clipboard.', 'text-success');
          }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.onTriggerToast('Failed to copy', 'text-danger');
          });
        });
      }

      // Copy Briefing Message Handler
      const copyBriefingMsgBtn = selectorBox.querySelector('#btn-portal-copy-briefing-msg');
      if (copyBriefingMsgBtn && safeData) {
        copyBriefingMsgBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(briefingMessageText).then(() => {
            const statusSpan = selectorBox.querySelector('#portal-briefing-status');
            if (statusSpan) {
              statusSpan.textContent = t('clientView.briefingMessageCopied', 'Briefing message copied!');
              statusSpan.style.display = 'inline';
              setTimeout(() => {
                statusSpan.style.display = 'none';
              }, 2000);
            }
            this.onTriggerToast(isIndo ? 'Pesan briefing berhasil disalin.' : 'Briefing message copied to clipboard.', 'text-success');
          }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.onTriggerToast('Failed to copy', 'text-danger');
          });
        });
      }

      viewEl.appendChild(selectorBox);
    }

    // Empty States
    if (isClientMode) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state-box';
      emptyState.style.marginTop = '60px';
      emptyState.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 20px; filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.3));">💼</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; line-height: 1.5; max-width: 480px; margin-left: auto; margin-right: auto;">
          ${isIndo ? 'Buka link briefing yang dikirim oleh freelancer untuk melihat update project.' : 'Paste or open the briefing link sent by your freelancer.'}
        </h3>
      `;
      viewEl.appendChild(emptyState);
      this.container.appendChild(viewEl);
      return;
    } else {
      if (clients.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-box';
        emptyState.innerHTML = `
          ${getIcon('briefcase', '', 48)}
          <h3>${isIndo ? 'Tidak ada client' : 'No clients found'}</h3>
          <p>${t('clientView.emptyStateDesc', 'Add a client or create a project first to preview the client dashboard.')}</p>
        `;
        viewEl.appendChild(emptyState);
        this.container.appendChild(viewEl);
        return;
      }

      if (!this.selectedClientId || !this.selectedProjectId || !safeData) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-box';
        emptyState.innerHTML = `
          ${getIcon('briefcase', '', 48)}
          <h3>${isIndo ? 'Project belum dipilih' : 'No project selected yet.'}</h3>
          <p>${isIndo ? 'Silakan hubungkan client ke project dan pilih project dari menu di atas.' : 'Please select a client and project from the toolbar above to preview the Client Dashboard.'}</p>
        `;
        viewEl.appendChild(emptyState);
        this.container.appendChild(viewEl);
        return;
      }
    }

    // Determine Status Badge Class
    let statusClass = 'status-completed';
    const stage = safeData.progress.currentStage;
    if (['new_lead', 'proposal_sent'].includes(stage)) statusClass = 'status-lead';
    else if (['in_progress', 'client_review', 'revision', 'invoice_sent'].includes(stage)) statusClass = 'status-active';
    else if (['waiting_payment', 'on_hold'].includes(stage)) statusClass = 'status-lead text-danger';

    // Timeline steps & progress math
    const timelineItems = safeData.progress.timelineItems;
    let activeStepIdx = timelineItems.findIndex(x => x.key === stage);
    if (activeStepIdx === -1) activeStepIdx = 1; // default fallback

    // GRID STRUCTURE
    const columnsGrid = document.createElement('div');
    columnsGrid.style.cssText = 'display: grid; grid-template-columns: 1.6fr 1fr; gap: 24px;';

    const checkViewport = () => {
      if (window.innerWidth <= 840) {
        columnsGrid.style.gridTemplateColumns = '1fr';
      } else {
        columnsGrid.style.gridTemplateColumns = '1.6fr 1fr';
      }
    };
    window.addEventListener('resize', checkViewport);
    setTimeout(checkViewport, 50);

    // ==========================================
    // LEFT COLUMN (Main Client Dashboard info)
    // ==========================================
    const colLeft = document.createElement('div');
    colLeft.style.cssText = 'display: flex; flex-direction: column; gap: 24px;';

    // 1. Header Card (Premium styling)
    const headerCard = document.createElement('div');
    headerCard.className = 'focus-module-box';
    headerCard.style.padding = '24px';
    headerCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; margin-bottom: 16px;">
        <div>
          <div class="brand-logo" style="margin-bottom: 8px;">
            <img src="./assets/brand/alurkarya-logo-secondary-white.svg" alt="AlurKarya Logo" style="width: 132px; height: auto; display: block;" />
          </div>
          <h2 style="font-size: 1.5rem; font-family: 'Space Grotesk', sans-serif; font-weight: 800; color: var(--text-primary); margin: 8px 0 2px 0;">${safeData.project.title}</h2>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">${isIndo ? 'Client' : 'Client'}: <strong>${safeData.client.name}</strong></span>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <span class="client-status-badge ${statusClass}" style="font-size: 0.8rem; padding: 4px 12px; border-radius: 99px;">
            ${safeData.project.stageLabel}
          </span>
          <span style="font-size: 0.65rem; color: var(--text-muted);">${isIndo ? 'Terakhir diupdate:' : 'Last updated:'} ${safeData.project.lastUpdated}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px;">
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${isIndo ? 'Status Project' : 'Project Status'}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px;">${safeData.project.stageLabel}</span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${isIndo ? 'Deadline' : 'Deadline'}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            ${getIcon('clock', 'text-muted', 13)} ${safeData.project.deadline}
          </span>
        </div>
        <div>
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block;">${isIndo ? 'Kategori' : 'Category'}</span>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-top: 4px;">${safeData.project.category}</span>
        </div>
      </div>
    `;
    colLeft.appendChild(headerCard);

    // 1.5. Big Picture Overview Card
    const bp = safeData.bigPicture;
    let badgeBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.03))';
    let badgeBorder = '1px solid rgba(16, 185, 129, 0.3)';
    let badgeText = '#34d399';

    if (bp.overallStatus === 'needs_client_review') {
      badgeBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.03))';
      badgeBorder = '1px solid rgba(245, 158, 11, 0.3)';
      badgeText = '#fbbf24';
    } else if (bp.overallStatus === 'in_revision') {
      badgeBg = 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.03))';
      badgeBorder = '1px solid rgba(99, 102, 241, 0.3)';
      badgeText = '#818cf8';
    } else if (bp.overallStatus === 'ready_for_delivery') {
      badgeBg = 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.03))';
      badgeBorder = '1px solid rgba(236, 72, 153, 0.3)';
      badgeText = '#f472b6';
    } else if (bp.overallStatus === 'invoice_sent') {
      badgeBg = 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.03))';
      badgeBorder = '1px solid rgba(14, 165, 233, 0.3)';
      badgeText = '#38bdf8';
    } else if (bp.overallStatus === 'waiting_payment') {
      badgeBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.03))';
      badgeBorder = '1px solid rgba(239, 68, 68, 0.3)';
      badgeText = '#f87171';
    } else if (bp.overallStatus === 'completed') {
      badgeBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))';
      badgeBorder = '1px solid rgba(16, 185, 129, 0.4)';
      badgeText = '#34d399';
    } else if (bp.overallStatus === 'needs_setup') {
      badgeBg = 'linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(100, 116, 139, 0.03))';
      badgeBorder = '1px solid rgba(100, 116, 139, 0.3)';
      badgeText = '#94a3b8';
    }

    // Callout box styling based on action owner/waitingFor
    let calloutBg = 'rgba(255,255,255,0.02)';
    let calloutBorder = 'rgba(255,255,255,0.05)';
    if (bp.overallStatus === 'needs_client_review' || bp.overallStatus === 'invoice_sent' || bp.overallStatus === 'waiting_payment') {
      calloutBg = 'rgba(245, 158, 11, 0.04)';
      calloutBorder = 'rgba(245, 158, 11, 0.15)';
    } else if (bp.overallStatus === 'completed') {
      calloutBg = 'rgba(16, 185, 129, 0.04)';
      calloutBorder = 'rgba(16, 185, 129, 0.15)';
    }

    const bigPictureCard = document.createElement('div');
    bigPictureCard.className = 'focus-module-box';
    bigPictureCard.style.cssText = 'padding: 24px; display: flex; flex-direction: column; gap: 20px;';

    // List items formatters
    const doneItemsHtml = bp.whatIsDone.map(item => `
      <li style="font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
        <span style="color: #34d399; font-weight: bold; margin-top: 1px;">✓</span>
        <span>${item}</span>
      </li>
    `).join('');

    const nextItemsHtml = bp.whatIsNext.map(item => `
      <li style="font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
        <span style="color: #818cf8; font-weight: bold; margin-top: 1px;">•</span>
        <span>${item}</span>
      </li>
    `).join('');

    bigPictureCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
        <h3 style="font-size: 1.1rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
          ✨ ${t('clientView.bigPictureOverview', 'Big Picture Overview')}
        </h3>
        <span style="font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 6px; background: ${badgeBg}; border: ${badgeBorder}; color: ${badgeText}; letter-spacing: 0.02em;">
          ${bp.overallStatusLabel}
        </span>
      </div>

      <p style="font-size: 0.82rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">
        ${bp.overviewSummary}
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        <div>
          <h4 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 10px 0; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            ${t('clientView.whatsDone', "What's Done")}
          </h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${doneItemsHtml}
          </ul>
        </div>
        <div>
          <h4 style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin: 0 0 10px 0; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px;">
            ${t('clientView.whatsNext', "What's Next")}
          </h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${nextItemsHtml}
          </ul>
        </div>
      </div>

      <div style="background: ${calloutBg}; border: 1px solid ${calloutBorder}; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
            ⏳ ${t('clientView.waitingFor', 'Waiting For')}: <strong style="color: var(--text-primary); font-weight: 700;">${bp.waitingFor}</strong>
          </span>
        </div>
        <div style="font-size: 0.8rem; line-height: 1.45; color: var(--text-secondary);">
          <strong>${t('clientView.decisionNeeded', 'Action Needed')}:</strong> ${bp.decisionNeeded}
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px; font-size: 0.75rem; color: var(--text-muted);">
        <span>🏁 ${t('clientView.nextMilestone', 'Next Milestone')}:</span>
        <span style="background: rgba(255,255,255,0.04); color: var(--text-secondary); padding: 2px 8px; border-radius: 4px; font-weight: 600;">
          ${bp.nextMilestone}
        </span>
      </div>
    `;

    colLeft.appendChild(bigPictureCard);

    // 2. Next Step Callout Card
    let nextStepTheme = 'background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2);';
    let nextStepOwnerText = isIndo ? 'Menunggu Freelancer' : 'Waiting for Freelancer';
    if (safeData.nextStep.actionOwner === 'client') {
      nextStepTheme = 'background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2);';
      nextStepOwnerText = isIndo ? 'Menunggu Review Client' : 'Waiting for Client Review';
    } else if (safeData.nextStep.actionOwner === 'none') {
      nextStepTheme = 'background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2);';
      nextStepOwnerText = isIndo ? 'Selesai' : 'Completed';
    }

    const nextStepCard = document.createElement('div');
    nextStepCard.className = 'focus-module-box';
    nextStepCard.style.cssText = `padding: 20px; ${nextStepTheme} border-radius: var(--border-radius-md);`;
    nextStepCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 10px;">
        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          🎯 ${isIndo ? 'Next Step' : 'Next Step'}
        </span>
        <span class="client-status-badge" style="font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--text-primary);">
          ${nextStepOwnerText}
        </span>
      </div>
      <h3 style="font-size: 1.05rem; font-weight: 700; margin: 0 0 6px 0; color: var(--text-primary);">${safeData.nextStep.label}</h3>
      <p style="font-size: 0.8rem; line-height: 1.45; color: var(--text-secondary); margin: 0;">${safeData.nextStep.description}</p>
    `;
    colLeft.appendChild(nextStepCard);

    // 3. Progress Timeline
    const timelineCard = document.createElement('div');
    timelineCard.className = 'focus-module-box';
    timelineCard.style.padding = '20px';

    const stepsHtml = timelineItems.map((s, idx) => {
      const isCompleted = idx < activeStepIdx;
      const isActive = idx === activeStepIdx;
      
      let indicatorClass = 'timeline-dot-pending';
      if (isCompleted) indicatorClass = 'timeline-dot-completed';
      if (isActive) indicatorClass = 'timeline-dot-active';

      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; min-width: 80px; text-align: center;">
          <div class="timeline-dot ${indicatorClass}" style="width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 2;">
            ${isCompleted ? getIcon('check', '', 8) : ''}
          </div>
          <span style="font-size: 0.65rem; font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? 'var(--color-secondary)' : (isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)')}; margin-top: 6px; display: block; white-space: nowrap;">${s.label}</span>
        </div>
      `;
    }).join('');

    timelineCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 20px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('layers', '', 14)} ${isIndo ? 'Timeline Progress' : 'Progress Timeline'}
      </h3>
      <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; overflow-x: auto; padding: 8px 0; gap: 8px;">
        <div style="position: absolute; top: 14px; left: 8%; right: 8%; height: 2px; background: rgba(255,255,255,0.03); z-index: 1;"></div>
        <div style="position: absolute; top: 14px; left: 8%; width: ${activeStepIdx === 0 ? 0 : ((activeStepIdx) / (timelineItems.length - 1)) * 84}%; height: 2px; background: var(--color-secondary); z-index: 1;"></div>
        ${stepsHtml}
      </div>
    `;
    colLeft.appendChild(timelineCard);

    // 4. Delivery & Review Links (Correct terminology used, no file hosting implied)
    const deliveryCard = document.createElement('div');
    deliveryCard.className = 'focus-module-box';
    deliveryCard.style.padding = '20px';

    const linksList = [];
    if (safeData.delivery.previewLink) {
      linksList.push({ label: isIndo ? 'Link Review / Preview' : 'Review / Preview Link', url: safeData.delivery.previewLink });
    }
    if (safeData.delivery.draftLink) {
      linksList.push({ label: 'Draft Link', url: safeData.delivery.draftLink });
    }
    if (safeData.delivery.reviewLink) {
      linksList.push({ label: 'Review Link', url: safeData.delivery.reviewLink });
    }
    if (safeData.delivery.finalFileLink) {
      linksList.push({ label: 'Final File Link', url: safeData.delivery.finalFileLink });
    }

    let linksHtml = '';
    if (linksList.length === 0) {
      linksHtml = `
        <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 0.78rem; font-style: italic; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: var(--border-radius-md);">
          ${t('clientView.noDeliveryLink', 'No delivery link has been added yet.')}
        </div>
      `;
    } else {
      linksHtml = linksList.map(lnk => `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 12px; border-radius: var(--border-radius-md); gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: rgba(255,255,255,0.02); padding: 6px; border-radius: 6px; color: var(--color-secondary); display: flex; align-items: center; justify-content: center;">
              ${getIcon('externalLink', '', 14)}
            </div>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${lnk.label}</span>
          </div>
          <a href="${lnk.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; border-radius: 4px;">
            ${isIndo ? 'Buka Link' : 'Open Link'}
          </a>
        </div>
      `).join('');
    }

    // Client visible checklist items
    const checklistItems = safeData.delivery.clientVisibleChecklist || [];
    let checklistHtml = '';
    if (checklistItems.length > 0) {
      checklistHtml = `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md); margin-top: 14px;">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 8px; font-weight: 600;">${isIndo ? 'Checklist Serah Terima' : 'Delivery Checklist'}</span>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${checklistItems.map(item => `
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: ${item.completed ? 'var(--text-secondary)' : 'var(--text-muted)'};">
                <span style="color: ${item.completed ? 'var(--color-success)' : 'var(--text-muted)'}; font-weight: 700;">
                  ${item.completed ? '✓' : '○'}
                </span>
                <span style="${item.completed ? 'text-decoration: line-through; opacity: 0.75;' : ''}">${item.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Notes
    const notesHtml = safeData.delivery.clientVisibleNotes ? `
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md); margin-top: 14px; font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary);">
        <strong style="color: var(--text-primary); display: block; margin-bottom: 4px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">${isIndo ? 'Catatan dari Freelancer' : 'Message from Freelancer'}</strong>
        ${safeData.delivery.clientVisibleNotes}
      </div>
    ` : '';

    deliveryCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('folder', 'text-success', 14)} ${isIndo ? 'Link Review & Delivery' : 'Review & Delivery Links'}
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${linksHtml}
      </div>
      ${checklistHtml}
      ${notesHtml}
    `;
    colLeft.appendChild(deliveryCard);

    // 5. Review & Approval
    const approvalCard = document.createElement('div');
    approvalCard.className = 'focus-module-box';
    approvalCard.style.padding = '20px';

    const revisionCount = safeData.project.revisionCount;
    const maxRevision = safeData.project.maxRevision;

    approvalCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('edit', 'text-warning', 14)} ${isIndo ? 'Review & Persetujuan' : 'Review & Approval'}
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">${isIndo ? 'Status Approval' : 'Approval Status'}</span>
          <span class="client-status-badge ${safeData.project.approvalStatus === 'Approved' ? 'status-completed' : 'status-active'}" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; display: inline-block;">
            ${safeData.project.approvalStatus}
          </span>
        </div>
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 4px;">${isIndo ? 'Putaran Revisi' : 'Revision Round'}</span>
          <span style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif;">
            ${revisionCount} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">/ ${maxRevision} ${isIndo ? 'kali' : 'rounds'}</span>
          </span>
        </div>
      </div>
    `;
    colLeft.appendChild(approvalCard);
    columnsGrid.appendChild(colLeft);

    // ==========================================
    // RIGHT COLUMN (Invoice & Profile)
    // ==========================================
    const colRight = document.createElement('div');
    colRight.style.cssText = 'display: flex; flex-direction: column; gap: 24px;';

    // 1. Freelancer Profile Header
    const fl = safeData.freelancer;
    const freelancerCard = document.createElement('div');
    freelancerCard.className = 'focus-module-box';
    freelancerCard.style.padding = '20px';
    
    // Initials fallback
    const getInitials = (name) => {
      return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
    };
    const flInitials = getInitials(fl.name);

    freelancerCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('user', 'text-primary', 14)} ${isIndo ? 'Profil Freelancer' : 'Freelancer Profile'}
      </h3>
      <div style="display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--border-radius-md);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="user-avatar" style="width: 48px; height: 48px; border-radius: 50%; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; font-weight: 700; background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%); color: #fff; border: 1.5px solid rgba(255,255,255,0.1); overflow: hidden;">
            ${(fl.avatar && isValidImageUrl(fl.avatar)) ?
              `<img src="${fl.avatar}" alt="${fl.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.outerHTML='${flInitials}'">` :
              flInitials
            }
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0;">${fl.name}</h4>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${fl.role}</span>
          </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 12px; margin-top: 4px;">
          ${fl.location ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
              <span style="font-size: 0.8rem;">📍</span> <span>${fl.location}</span>
            </div>
          ` : ''}
          ${fl.email ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
              <span style="font-size: 0.8rem;">✉️</span> <a href="mailto:${fl.email}" style="color: var(--text-secondary); text-decoration: none;">${fl.email}</a>
            </div>
          ` : ''}
          ${fl.portfolioLink ? `
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--text-muted);">
              ${getIcon('externalLink', '', 12)} <a href="${fl.portfolioLink}" target="_blank" rel="noopener noreferrer" style="color: var(--color-secondary); text-decoration: none; font-weight: 600;">${t('clientView.portfolioWebsite', 'Portfolio Website')}</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    colRight.appendChild(freelancerCard);

    // 2. Invoice & Payment Card (Using whitelisted safeData billing details only)
    const invoiceCard = document.createElement('div');
    invoiceCard.className = 'focus-module-box';
    invoiceCard.style.padding = '20px';

    const inv = safeData.invoice;
    const isPaymentStage = ['invoice_sent', 'waiting_payment', 'completed'].includes(stage);

    let billingHtml = '';
    if (!isPaymentStage && inv.invoiceAmountLabel === (isIndo ? "Belum ada" : "No invoice")) {
      billingHtml = `
        <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 0.78rem; font-style: italic; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: var(--border-radius-md);">
          ${t('clientView.noInvoiceAttached', 'No invoice has been attached to this project yet.')}
        </div>
      `;
    } else {
      let invStatusBadgeClass = 'status-active';
      if (inv.invoiceStatus === 'Paid') invStatusBadgeClass = 'status-completed';
      else if (inv.invoiceStatus === 'Overdue') invStatusBadgeClass = 'status-lead text-danger';

      let payStatusBadgeClass = 'status-active';
      if (['Fully Paid', 'Payment Received'].includes(inv.paymentStatus)) payStatusBadgeClass = 'status-completed';

      billingHtml = `
        <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--border-radius-md); display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Status Invoice' : 'Invoice Status'}</span>
            <span class="client-status-badge ${invStatusBadgeClass}" style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">
              ${inv.invoiceStatus}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Nomor Invoice' : 'Invoice Number'}</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif;">${inv.invoiceNumber}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Jumlah Tagihan' : 'Invoice Amount'}</span>
            <span style="font-size: 0.95rem; font-weight: 800; color: var(--color-secondary); font-family: 'Space Grotesk', sans-serif;">${inv.invoiceAmountLabel}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Jumlah Terbayar' : 'Amount Paid'}</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-success); font-family: 'Space Grotesk', sans-serif;">${inv.amountPaidLabel}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Sisa Payment' : 'Amount Due'}</span>
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-danger); font-family: 'Space Grotesk', sans-serif;">${inv.amountDueLabel}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Jatuh Tempo' : 'Invoice Due Date'}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">${inv.invoiceDueDate}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${isIndo ? 'Status Pembayaran' : 'Payment Status'}</span>
            <span class="client-status-badge ${payStatusBadgeClass}" style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px;">
              ${inv.paymentStatus}
            </span>
          </div>

          ${inv.invoiceFileLink ? `
            <div style="text-align: right; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px; margin-top: 4px;">
              <a href="${inv.invoiceFileLink}" target="_blank" rel="noopener noreferrer" style="font-size: 0.72rem; color: var(--color-secondary); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                ${getIcon('fileText', '', 12)} ${isIndo ? 'Buka Invoice' : 'Open Invoice Link'}
              </a>
            </div>
          ` : ''}
        </div>
      `;
    }

    invoiceCard.innerHTML = `
      <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        ${getIcon('fileText', 'text-success', 14)} ${isIndo ? 'Invoice & Pembayaran' : 'Invoice & Payment'}
      </h3>
      ${billingHtml}
    `;
    colRight.appendChild(invoiceCard);
    columnsGrid.appendChild(colRight);

    // Assemble Everything in Viewport
    const portalContainer = document.createElement('div');
    portalContainer.style.display = 'flex';
    portalContainer.style.flexDirection = 'column';
    portalContainer.style.gap = '24px';
    portalContainer.appendChild(columnsGrid);

    viewEl.appendChild(portalContainer);
    this.container.appendChild(viewEl);
  }
}
