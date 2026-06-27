import { getLanguage, t } from '../i18n.js';

export class EntryModeSelector {
  /**
   * @param {HTMLElement} container - Target mount element (usually app-root)
   * @param {function} onSelect - Callback when mode is selected
   */
  constructor(container, onSelect) {
    this.container = container;
    this.onSelect = onSelect;
  }

  render() {
    this.container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'role-selection-screen';

    const activeLang = getLanguage();
    const isIndo = activeLang === 'id';
    const freelancerLabel = isIndo ? 'Sebagai Freelancer' : 'As Freelancer';
    const clientLabel = isIndo ? 'Sebagai Client' : 'As Client';

    wrapper.innerHTML = `
      <div class="role-selection-inner">
        <img src="assets/brand/alurkarya-logo-secondary-white.svg" alt="AlurKarya" class="role-selection-logo">
        <div class="role-selection-actions">
          <button class="role-selection-btn" id="btn-mode-freelancer">
            ${freelancerLabel}
          </button>
          <button class="role-selection-btn" id="btn-mode-client">
            ${clientLabel}
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(wrapper);

    // Event Listeners
    wrapper.querySelector('#btn-mode-freelancer').addEventListener('click', () => {
      localStorage.setItem('alurkarya_entry_mode', 'freelancer');
      if (this.onSelect) this.onSelect('freelancer');
    });

    wrapper.querySelector('#btn-mode-client').addEventListener('click', () => {
      localStorage.setItem('alurkarya_entry_mode', 'client');
      if (this.onSelect) this.onSelect('client');
    });
  }
}
