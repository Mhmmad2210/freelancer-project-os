/* ==========================================================================
   ALURKARYA - FREELANCER TEMPLATES SELECTION MODAL COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { templatesData } from '../data/freelancerTemplates.js';
import { applyTemplateProjects } from './FreelancerTemplates.js';
import { t } from '../i18n.js';

export class TemplatesModal {
  /**
   * @param {object} store - Unified data store reference
   * @param {function} onComplete - Callback after applying template
   * @param {function} onTriggerToast - Notify users
   */
  constructor(store, onComplete, onTriggerToast) {
    this.store = store;
    this.onComplete = onComplete;
    this.onTriggerToast = onTriggerToast;
  }

  open() {
    this.renderModal();
  }

  renderModal() {
    let overlay = document.getElementById('templates-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'templates-modal-overlay';
      document.body.appendChild(overlay);
    }

    const state = this.store.getState();

    const cardsMarkup = Object.values(templatesData).map(tpl => {
      const mapId = tpl.id === 'general_freelancer' ? 'general' : tpl.id;
      return `
        <div class="template-card" style="background: rgba(255, 255, 255, 0.015); border: 1px solid var(--border-subtle); padding: 18px; border-radius: var(--border-radius-md); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: all var(--transition-fast);">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span style="font-size: 1.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${tpl.icon}</span>
              <h4 style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 800; color: var(--text-primary);">${t('templates.' + mapId, tpl.label)}</h4>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">${t('templates.' + mapId + '_desc', tpl.description)}</p>
          </div>
          <button class="btn btn-primary btn-sm btn-use-template" data-template-id="${tpl.id}" style="width: 100%; justify-content: center; font-size: 0.72rem; padding: 6px 12px; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
            ${t('templates.useThisTemplate', 'Use This Template')}
          </button>
        </div>
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 760px; border-radius: var(--border-radius-lg); overflow: hidden; background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: var(--glass-backdrop);">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-subtle); padding: 18px 20px;">
          <div>
            <h3 style="font-size: 1.1rem; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; gap: 8px; margin: 0; color: var(--text-primary);">
              💼 ${t('templates.title', 'Start with a Freelancer Template')}
            </h3>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin: 4px 0 0 0;">
              ${t('templates.subtitle', 'Start faster with a workflow template designed for your type of freelance work.')}
            </p>
          </div>
          <button class="modal-close-btn" id="close-templates-modal" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; padding: 4px;">&times;</button>
        </div>
        <div class="modal-body" style="padding: 24px; max-height: 70vh; overflow-y: auto;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px;">
            ${cardsMarkup}
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    // Close listeners
    overlay.querySelector('#close-templates-modal').addEventListener('click', () => this.close());
    
    // Clicking outside modal container closes it
    overlay.addEventListener('mousedown', (e) => {
      const container = overlay.querySelector('.modal-container');
      if (container && !container.contains(e.target)) {
        this.close();
      }
    });

    // Use Template buttons click listeners
    overlay.querySelectorAll('.btn-use-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const templateId = btn.dataset.templateId;
        this.handleSelectTemplate(templateId);
      });
    });
  }

  close() {
    const overlay = document.getElementById('templates-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  handleSelectTemplate(templateId) {
    const tpl = templatesData[templateId];
    if (!tpl) return;

    const state = this.store.getState();
    const existingProjects = state.projects || [];
    const hasProjects = existingProjects.length > 0;

    // Check if duplicate template is already applied
    const alreadyApplied = existingProjects.some(p => p.templateRole === templateId);

    if (alreadyApplied) {
      this.showDuplicateWarningModal(templateId);
    } else if (hasProjects) {
      this.showConfirmationModal(templateId);
    } else {
      this.applyTemplate(templateId);
    }
  }

  showConfirmationModal(templateId) {
    const overlay = document.getElementById('templates-modal-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 440px; border-radius: var(--border-radius-lg); overflow: hidden; background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: var(--glass-backdrop); padding: 28px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
        <div style="font-size: 2.8rem; margin-bottom: 16px; color: var(--color-warning); filter: drop-shadow(0 2px 8px rgba(245,158,11,0.25));">⚠️</div>
        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 12px 0;">${t('templates.addTemplateProjectsQuestion', 'Add template projects?')}</h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.55; margin: 0 0 24px 0;">
          ${t('templates.warningText', 'This will add sample projects to your workspace. Existing projects will not be deleted.')}
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" id="btn-confirm-cancel" style="padding: 8px 18px; font-size: 0.8rem; border-radius: 6px; font-weight: 600;">${t('cancel', 'Cancel')}</button>
          <button class="btn btn-primary" id="btn-confirm-accept" style="padding: 8px 22px; font-size: 0.8rem; border-radius: 6px; font-weight: 600; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">${t('templates.addTemplateProjects', 'Add Template Projects')}</button>
        </div>
      </div>
    `;

    overlay.querySelector('#btn-confirm-cancel').addEventListener('click', () => this.renderModal());
    overlay.querySelector('#btn-confirm-accept').addEventListener('click', () => this.applyTemplate(templateId));
  }

  showDuplicateWarningModal(templateId) {
    const overlay = document.getElementById('templates-modal-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 440px; border-radius: var(--border-radius-lg); overflow: hidden; background: var(--glass-bg); border: 1px solid var(--glass-border); backdrop-filter: var(--glass-backdrop); padding: 28px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
        <div style="font-size: 2.8rem; margin-bottom: 16px; color: var(--color-warning); filter: drop-shadow(0 2px 8px rgba(245,158,11,0.25));">⚠️</div>
        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0 0 12px 0;">${t('templates.templateAlreadyApplied', 'Template already applied')}</h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.55; margin: 0 0 24px 0;">
          ${t('templates.duplicateWarningText', 'This template has already been added before. Do you want to add another copy?')}
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" id="btn-duplicate-cancel" style="padding: 8px 18px; font-size: 0.8rem; border-radius: 6px; font-weight: 600;">${t('cancel', 'Cancel')}</button>
          <button class="btn btn-primary" id="btn-duplicate-accept" style="padding: 8px 22px; font-size: 0.8rem; border-radius: 6px; font-weight: 600; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">${t('templates.addAnotherCopy', 'Add Another Copy')}</button>
        </div>
      </div>
    `;

    overlay.querySelector('#btn-duplicate-cancel').addEventListener('click', () => this.renderModal());
    overlay.querySelector('#btn-duplicate-accept').addEventListener('click', () => this.applyTemplate(templateId));
  }

  applyTemplate(templateId) {
    const success = applyTemplateProjects(this.store, templateId);
    if (success) {
      localStorage.setItem('alurkarya_selected_freelancer_template', templateId);
      this.onTriggerToast(t('toast.templateApplied', 'Template applied successfully!'), 'text-success');
      this.close();
      if (this.onComplete) this.onComplete(templateId);
    } else {
      this.onTriggerToast(t('toast.templateApplyFailed', 'Failed to apply template.'), 'text-danger');
    }
  }
}
