import { getIcon } from '../icons.js';
import { getLanguage, setLanguage, t } from '../i18n.js';

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

    // Create entry selection wrapper matching access gate styles
    const wrapper = document.createElement('div');
    wrapper.className = 'access-page';

    const activeLang = getLanguage();

    wrapper.innerHTML = `
      <div class="access-card" style="align-items: center; text-align: center; display: flex; flex-direction: column; gap: 24px;">
        <!-- Top Language Switcher -->
        <div style="position: absolute; top: 16px; right: 20px; display: flex; align-items: center; gap: 6px; z-index: 10;">
          <span style="font-size: 0.7rem; opacity: 0.8;">🌐</span>
          <select id="entry-lang-select" style="font-size: 0.68rem; padding: 2px 6px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); color: var(--text-primary); border-radius: 4px; outline: none; cursor: pointer;">
            <option value="en" ${activeLang === 'en' ? 'selected' : ''}>English</option>
            <option value="id" ${activeLang === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
          </select>
        </div>

        <!-- Logo Area -->
        <div style="margin-top: 10px;">
          <svg viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="height: 32px; width: auto;">
            <path d="M12 2L2 22h20L12 2zm0 4l6.5 13H5.5L12 6z" fill="var(--color-primary)" />
            <text x="28" y="18" fill="#ffffff" font-family="Space Grotesk" font-weight="800" font-size="16">AlurKarya</text>
          </svg>
        </div>

        <!-- Header -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h2 style="font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1.45rem; color: #ffffff; letter-spacing: -0.02em; margin: 0;">
            ${t('entryMode.title', 'How would you like to continue?')}
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55; max-width: 380px; margin: 0 auto;">
            ${t('entryMode.desc', 'Choose Freelancer to manage your workspace, or Client to view a shared project page.')}
          </p>
        </div>

        <!-- Actions -->
        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; margin-top: 10px;">
          <button class="btn btn-primary" id="btn-mode-freelancer" style="width: 100%; justify-content: center; font-size: 0.9rem; padding: 14px 20px; border-radius: 12px; font-weight: 700; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25); display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.15);">
            💼 ${t('entryMode.freelancer', 'As Freelancer')}
          </button>
          
          <button class="btn btn-secondary" id="btn-mode-client" style="width: 100%; justify-content: center; font-size: 0.9rem; padding: 14px 20px; border-radius: 12px; font-weight: 700; background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06); color: #ffffff; display: flex; align-items: center; gap: 8px;">
            👤 ${t('entryMode.client', 'As Client')}
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(wrapper);

    // Event Listeners
    wrapper.querySelector('#entry-lang-select').addEventListener('change', (e) => {
      setLanguage(e.target.value);
      this.render();
    });

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
