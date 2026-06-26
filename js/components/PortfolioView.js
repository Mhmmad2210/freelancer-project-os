/* ==========================================================================
   FREELANCER PROJECT OS - PORTFOLIO SHOWCASE SANDBOX COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { promptTemplates, copyPromptToClipboard } from './AIPromptHelpers.js';
import { t } from '../i18n.js';

export class PortfolioView {
  /**
   * @param {HTMLElement} container - Target mount box
   * @param {object} store - Unified data store reference
   * @param {function} onTriggerToast - Notify users
   */
  constructor(container, store, onTriggerToast) {
    this.container = container;
    this.store = store;
    this.onTriggerToast = onTriggerToast;
  }

  update() {
    this.render();
  }

  render() {
    this.container.innerHTML = '';

    const viewEl = document.createElement('div');
    viewEl.className = 'portfolio-viewport';

    // Header Intro with warm, friendly copy
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 280px;">
          <h2>${t('portfolio.title', 'Portfolio Sandbox')}</h2>
          <p>${t('portfolio.subtitle', 'Organize your completed freelance work into polished case studies. Draft customer testimonials, record measurable results, and update showcase status options.')}</p>
        </div>
        <button class="btn btn-primary" id="btn-portfolio-add-work" style="gap: 6px;">
          ${getIcon('plus', '', 16)} ${t('portfolio.addCompleted', 'Add Completed Project')}
        </button>
      </div>
    `;
    
    introBox.querySelector('#btn-portfolio-add-work').addEventListener('click', () => this.showAddCompletedProjectDrawer());
    viewEl.appendChild(introBox);

    // Staging list container
    const gridEl = document.createElement('div');
    gridEl.className = 'portfolio-grid-layout';
    gridEl.id = 'portfolio-grid-canvas';
    viewEl.appendChild(gridEl);

    this.container.appendChild(viewEl);
    this.renderGridOnly();
  }

  getShowcaseStatusLabel(status) {
    if (!status) return t('status.draftCaseStudy', 'Draft Case Study');
    const map = {
      'Private': 'private',
      'Draft Case Study': 'draftCaseStudy',
      'Ready to Showcase': 'readyToShowcase',
      'Published': 'published'
    };
    const key = map[status] || status.toLowerCase();
    return t('status.' + key, status);
  }

  renderGridOnly() {
    const canvas = document.getElementById('portfolio-grid-canvas');
    if (!canvas) return;

    const state = this.store.getState();
    const { projects } = state;

    // Filter projects: Must have portfolioShowcase enabled
    const showcased = projects.filter(p => p.portfolioShowcase);

    if (showcased.length === 0) {
      canvas.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state-box">
          ${getIcon('folder', '', 48)}
          <h3>${t('portfolio.noStudiesTitle', 'No portfolio studies planned')}</h3>
          <p>${t('portfolio.noStudiesDesc', 'Showcase completed freelance projects to demonstrate visual outcomes and attract clients.')}</p>
          <button class="btn btn-secondary" id="btn-empty-portfolio-add">${getIcon('plus', '', 14)} ${t('portfolio.addCompleted', 'Add Completed Project')}</button>
        </div>
      `;
      canvas.querySelector('#btn-empty-portfolio-add').addEventListener('click', () => this.showAddCompletedProjectDrawer());
      return;
    }

    showcased.forEach(p => {
      const card = document.createElement('div');
      card.className = 'portfolio-card-item';

      const primaryTag = p.tags[0] || 'Design';
      const tagClass = primaryTag.toLowerCase();
      const defaultImg = p.portfolioImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
      const primaryTagLabel = t('category.' + tagClass, primaryTag);

      // Showcase status color
      let visibilityClass = 'status-completed';
      if (p.showcaseStatus === 'Published') visibilityClass = 'status-active text-success';
      if (p.showcaseStatus === 'Ready to Showcase') visibilityClass = 'status-active';
      if (p.showcaseStatus === 'Private') visibilityClass = 'status-lead text-danger';

      card.innerHTML = `
        <div class="portfolio-cover-mock">
          <img src="${defaultImg}" alt="Mockup of ${p.title}">
          <div class="portfolio-cover-overlay" style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
            <span class="card-tag ${tagClass}">${primaryTagLabel}</span>
            <span class="client-status-badge ${visibilityClass}" style="font-size: 0.65rem; padding: 2px 8px; backdrop-filter: blur(8px); background: rgba(0,0,0,0.5);">${this.getShowcaseStatusLabel(p.showcaseStatus)}</span>
          </div>
        </div>
        <div class="portfolio-card-content" style="gap: 12px;">
          <div>
            <h4 style="font-size: 0.95rem; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif;">${p.title}</h4>
            <span class="stat-subtext" style="font-size: 0.72rem;">${t('projectModal.client', 'Client')}: ${p.clientName}</span>
          </div>
          
          <div>
            <span class="drawer-meta-title" style="font-size: 0.65rem;">${t('portfolio.shortCaseSummary', 'Short Case Summary')}</span>
            <p class="portfolio-case-desc" style="font-size: 0.78rem;">
              ${p.portfolioDescription || `<em>${t('portfolio.noSummaryPlaceholder', 'No case study summary written yet. Click edit below to draft your outcomes.')}</em>`}
            </p>
          </div>

          ${p.resultDescription ? `
            <div style="background: rgba(255,255,255,0.02); padding: 8px 10px; border-left: 2px solid var(--color-secondary); border-radius: 0 4px 4px 0;">
              <span class="drawer-meta-title" style="font-size: 0.65rem; color: var(--color-secondary);">${t('portfolio.measurableResult', 'Measurable Result')}</span>
              <p style="font-size: 0.75rem; color: var(--text-secondary);">${p.resultDescription}</p>
            </div>
          ` : ''}

          ${p.testimonial ? `
            <div style="background: rgba(255,255,255,0.01); padding: 8px 10px; border-radius: 4px; border: 1px dashed var(--border-subtle);">
              <span class="drawer-meta-title" style="font-size: 0.65rem; color: var(--color-accent);">${t('portfolio.clientTestimonial', 'Client Testimonial')}</span>
              <p style="font-size: 0.75rem; font-style: italic; color: var(--text-secondary); line-height: 1.4;">${p.testimonial}</p>
            </div>
          ` : ''}

          <div class="portfolio-metadata-row" style="padding-top: 10px;">
            <button class="invoice-btn-small edit-case-trigger" style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 6px;">
              ${getIcon('edit', '', 12)} ${t('portfolio.editCaseStudy', 'Edit Case Study')}
            </button>
            <button class="invoice-btn-small remove-trigger text-danger" style="flex: 0 0 auto; padding: 6px;">
              ${getIcon('trash', '', 12)}
            </button>
          </div>
        </div>
      `;

      card.querySelector('.edit-case-trigger').addEventListener('click', () => this.showEditCaseStudyModal(p));
      
      card.querySelector('.remove-trigger').addEventListener('click', () => {
        if (confirm(t('portfolio.removeConfirm', 'Remove project from showcase index?'))) {
          this.store.updateProject(p.id, { portfolioShowcase: false });
          this.onTriggerToast(t('portfolio.toastRemoved', 'Project removed from portfolio'));
          this.render();
        }
      });

      canvas.appendChild(card);
    });
  }

  showEditCaseStudyModal(project) {
    let modalOverlay = document.getElementById('case-edit-modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
      modalOverlay.id = 'case-edit-modal-overlay';
      document.body.appendChild(modalOverlay);
    }

    const descVal = project.portfolioDescription || '';
    const resultVal = project.resultDescription || '';
    const testVal = project.testimonial || '';
    const statusVal = project.showcaseStatus || 'Draft Case Study';
    const imgVal = project.portfolioImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 560px; max-height: 85vh;">
        <div class="modal-header">
          <h3>${t('portfolio.editCaseStudyTitle', 'Edit Portfolio Case Study')}</h3>
          <button class="modal-close-btn" id="close-case-modal">&times;</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; padding: 16px 24px;">
          
          <div class="form-group">
            <label for="case-status-select">${t('portfolio.showcaseStatusLabel', 'Showcase Status')}</label>
            <select id="case-status-select" class="form-control">
              <option value="Private" ${statusVal === 'Private' ? 'selected' : ''}>${t('portfolio.privateOption', 'Private (Internal Staging Only)')}</option>
              <option value="Draft Case Study" ${statusVal === 'Draft Case Study' ? 'selected' : ''}>${t('status.draftCaseStudy', 'Draft Case Study')}</option>
              <option value="Ready to Showcase" ${statusVal === 'Ready to Showcase' ? 'selected' : ''}>${t('status.readyToShowcase', 'Ready to Showcase')}</option>
              <option value="Published" ${statusVal === 'Published' ? 'selected' : ''}>${t('portfolio.publishedOption', 'Published Live')}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="case-img-url">${t('portfolio.mockupCoverUrlLabel', 'Mockup Cover Image URL')}</label>
            <input type="url" id="case-img-url" class="form-control" value="${imgVal}" placeholder="${t('portfolio.mockupCoverUrlPlaceholder', 'Paste mockup image URL...')}">
          </div>

          <div class="form-group">
            <label for="case-summary-text">${t('portfolio.caseSummaryLabel', 'Short Case Study Summary')}</label>
            <textarea id="case-summary-text" class="form-control" style="min-height: 80px;" placeholder="${t('portfolio.caseSummaryPlaceholder', 'Summarize project goals, scope...')}">${descVal}</textarea>
          </div>

          <div class="form-group">
            <label for="case-result-text">${t('portfolio.resultDescLabel', 'Result Description')}</label>
            <textarea id="case-result-text" class="form-control" style="min-height: 60px;" placeholder="${t('portfolio.resultDescPlaceholder', 'Specific result details e.g., Boosted clickthroughs by 14%...')}">${resultVal}</textarea>
          </div>

          <div class="form-group">
            <label for="case-testimonial-text">${t('portfolio.clientTestimonialLabel', 'Client Testimonial')}</label>
            <textarea id="case-testimonial-text" class="form-control" style="min-height: 60px;" placeholder="${t('portfolio.clientTestimonialPlaceholder', 'What did the client say about your delivery?')}">${testVal}</textarea>
          </div>

        </div>
        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn-secondary" id="btn-portfolio-ai-prompt" style="font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;">
            🤖 ${t('portfolio.aiCaseStudyPromptButton', 'AI Case Study Prompt')}
          </button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="cancel-case-modal">${t('cancel', 'Cancel')}</button>
            <button class="btn btn-primary" id="save-case-modal">${t('portfolio.saveCaseStudyButton', 'Save Case Study')}</button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => modalOverlay.classList.add('active'), 50);

    const closeActions = () => {
      modalOverlay.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 300);
    };

    modalOverlay.querySelector('#close-case-modal').addEventListener('click', closeActions);
    modalOverlay.querySelector('#cancel-case-modal').addEventListener('click', closeActions);

    const aiBtn = modalOverlay.querySelector('#btn-portfolio-ai-prompt');
    if (aiBtn) {
      aiBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const state = this.store.getState();
        const client = state.clients.find(c => c.id === project.clientId);
        const clientMemory = client ? client.clientMemory : null;
        const flProfile = state.freelancerProfile;
        const template = promptTemplates.portfolioCaseStudy;
        if (template) {
          const text = template.generate(project, clientMemory, 'Professional', flProfile);
          copyPromptToClipboard(text, this.onTriggerToast, 'portfolioCaseStudy', project.id);
        }
      });
    }

    modalOverlay.querySelector('#save-case-modal').addEventListener('click', () => {
      const img = modalOverlay.querySelector('#case-img-url').value.trim();
      const desc = modalOverlay.querySelector('#case-summary-text').value.trim();
      const result = modalOverlay.querySelector('#case-result-text').value.trim();
      const testimonial = modalOverlay.querySelector('#case-testimonial-text').value.trim();
      const showcaseStatus = modalOverlay.querySelector('#case-status-select').value;

      this.store.updateProject(project.id, {
        portfolioImage: img,
        portfolioDescription: desc,
        resultDescription: result,
        testimonial,
        showcaseStatus
      });

      this.onTriggerToast(t('portfolio.toastSaved', 'Portfolio case study saved'), 'text-success');
      closeActions();
      this.render();
    });
  }

  showAddCompletedProjectDrawer() {
    const projects = this.store.getState().projects;
    
    // Filter projects: Completed stage and not showcased yet
    const completedList = projects.filter(p => p.stage === 'completed' && !p.portfolioShowcase);

    let drawerOverlay = document.getElementById('portfolio-add-drawer');
    if (!drawerOverlay) {
      drawerOverlay = document.createElement('div');
      drawerOverlay.className = 'drawer-overlay';
      drawerOverlay.id = 'portfolio-add-drawer';
      document.body.appendChild(drawerOverlay);
    }

    if (completedList.length === 0) {
      drawerOverlay.innerHTML = `
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3>${t('portfolio.addCompleted', 'Add Completed Project')}</h3>
            <button class="modal-close-btn" id="close-p-drawer">&times;</button>
          </div>
          <div class="drawer-body" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 16px; padding: 48px 24px;">
            ${getIcon('alert', '', 40)}
            <h4 style="color: var(--text-primary);">${t('portfolio.noCompletedTitle', 'No completed projects to add')}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
              ${t('portfolio.noCompletedDesc', 'Only projects in the Completed column can be staged as case studies. Complete active work on your board first!')}
            </p>
            <button class="btn btn-secondary" id="cancel-p-drawer-empty" style="margin-top: 10px;">${t('portfolio.gotItButton', 'Got it')}</button>
          </div>
        </div>
      `;

      setTimeout(() => drawerOverlay.classList.add('active'), 50);
      const closeAct = () => {
        drawerOverlay.classList.remove('active');
        setTimeout(() => drawerOverlay.remove(), 300);
      };
      drawerOverlay.querySelector('#close-p-drawer').addEventListener('click', closeAct);
      drawerOverlay.querySelector('#cancel-p-drawer-empty').addEventListener('click', closeAct);
      return;
    }

    const options = completedList
      .map(p => `<option value="${p.id}">${p.title} (${p.clientName})</option>`)
      .join('');

    drawerOverlay.innerHTML = `
      <div class="drawer-panel">
        <div class="drawer-header">
          <h3>${t('portfolio.addCompleted', 'Add Completed Project')}</h3>
          <button class="modal-close-btn" id="close-p-drawer">&times;</button>
        </div>
        <div class="drawer-body">
          <form id="portfolio-add-form">
            
            <div class="form-group">
              <label for="p-select-choice">${t('portfolio.selectCompletedLabel', 'Select Completed Work')}</label>
              <select id="p-select-choice" class="form-control" required>
                <option value="">${t('portfolio.chooseCompletedOption', '-- Choose Completed Project --')}</option>
                ${options}
              </select>
            </div>

            <div class="form-group">
              <label for="p-show-status">${t('portfolio.showcaseStatusLabel', 'Showcase Status')}</label>
              <select id="p-show-status" class="form-control">
                <option value="Draft Case Study" selected>${t('status.draftCaseStudy', 'Draft Case Study')}</option>
                <option value="Ready to Showcase">${t('status.readyToShowcase', 'Ready to Showcase')}</option>
                <option value="Published">${t('status.published', 'Published')}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="p-summary">${t('portfolio.caseSummaryLabel', 'Short Case Study Summary')}</label>
              <textarea id="p-summary" class="form-control" style="min-height: 80px;" placeholder="${t('portfolio.caseSummaryPlaceholder', 'Summarize project scope, what you built...')}"></textarea>
            </div>

            <div class="form-group">
              <label for="p-result">${t('portfolio.resultDescLabel', 'Result Description')}</label>
              <textarea id="p-result" class="form-control" style="min-height: 60px;" placeholder="${t('portfolio.resultDescPlaceholder', 'Specific result details e.g., Boosted clickthroughs by 14%...')}"></textarea>
            </div>

            <div class="form-group">
              <label for="p-testimonial">${t('portfolio.clientTestimonialLabel', 'Client Testimonial')}</label>
              <textarea id="p-testimonial" class="form-control" style="min-height: 60px;" placeholder="${t('portfolio.clientTestimonialPlaceholder', 'What did the client say?')}"></textarea>
            </div>

            <div class="modal-footer" style="padding: 16px 0 0 0; border: none;">
              <button type="button" class="btn btn-secondary" id="cancel-p-drawer">${t('cancel', 'Cancel')}</button>
              <button type="submit" class="btn btn-primary">${t('portfolio.stageCaseStudyButton', 'Stage Case Study')}</button>
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

    drawerOverlay.querySelector('#close-p-drawer').addEventListener('click', closeActions);
    drawerOverlay.querySelector('#cancel-p-drawer').addEventListener('click', closeActions);

    const form = drawerOverlay.querySelector('#portfolio-add-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const projId = form.querySelector('#p-select-choice').value;
      const summary = form.querySelector('#p-summary').value.trim();
      const result = form.querySelector('#p-result').value.trim();
      const testimonial = form.querySelector('#p-testimonial').value.trim();
      const showcaseStatus = form.querySelector('#p-show-status').value;

      this.store.updateProject(projId, {
        portfolioShowcase: true,
        portfolioDescription: summary,
        resultDescription: result,
        testimonial,
        showcaseStatus
      });

      this.onTriggerToast(t('portfolio.toastAdded', 'Project added to portfolio showcase'), 'text-success');
      closeActions();
      this.render();
    });
  }
}
