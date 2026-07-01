/* ==========================================================================
   FREELANCER PROJECT OS - FREELANCER PROFILE SETTINGS COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';
import { t, getLanguage, setLanguage } from '../i18n.js';

export class FreelancerProfile {
  /**
   * @param {HTMLElement} container - Target viewport mounting box
   * @param {object} store - Unified data store reference
   * @param {function} onTriggerToast - Notify users on actions
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

    const profile = this.store.getFreelancerProfile();
    const activeLang = getLanguage();
    const defaultCurrency = localStorage.getItem('alurkarya_default_currency') || 'IDR';

    const viewEl = document.createElement('div');
    viewEl.className = 'profile-viewport';
    viewEl.style.cssText = 'display: flex; flex-direction: column; gap: 20px; height: 100%;';

    // Page Intro matching premium aesthetics
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.innerHTML = `
      <h2>${t('profile.title', 'Freelancer Profile')}</h2>
      <p>${t('profile.subtitle', 'Configure your personal details, specialties, bio, location, and portfolio link. This data is synchronized with your sidebar profile card and the Client Workspace Portal.')}</p>
    `;
    viewEl.appendChild(introBox);

    // Profile Settings Form Box
    const formBox = document.createElement('div');
    formBox.className = 'focus-module-box';
    formBox.style.cssText = 'max-width: 640px; padding: 24px; display: flex; flex-direction: column; gap: 16px; margin: 0 auto; width: 100%;';

    formBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        ${getIcon('user', 'text-primary', 16)} ${t('profile.sectionBranding', 'Personal Workspace Branding')}
      </h3>
      <form id="freelancer-profile-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.fullName', 'Full Name')}</label>
            <input type="text" name="name" class="form-control" style="font-size: 0.75rem; padding: 6px 10px;" value="${profile.freelancerName || ''}" placeholder="e.g. Aris Aulia">
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.specialty', 'Specialty / Role')}</label>
            <input type="text" name="role" class="form-control" style="font-size: 0.75rem; padding: 6px 10px;" value="${profile.freelancerRole || ''}" placeholder="e.g. Creative Freelancer">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.email', 'Email Address')}</label>
            <input type="email" name="email" class="form-control" style="font-size: 0.75rem; padding: 6px 10px;" value="${profile.freelancerEmail || ''}" placeholder="e.g. hello@arisaulia.com">
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.location', 'Location')}</label>
            <input type="text" name="location" class="form-control" style="font-size: 0.75rem; padding: 6px 10px;" value="${profile.freelancerLocation || ''}" placeholder="e.g. Bandung, Indonesia">
          </div>
        </div>

        <div class="form-group">
          <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.bio', 'Brief Bio')}</label>
          <textarea name="bio" class="form-control" style="font-size: 0.75rem; padding: 8px 10px; min-height: 80px; resize: vertical;" placeholder="Tell your clients a little bit about what you specialize in...">${profile.freelancerBio || ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.portfolioUrl', 'Portfolio URL')}</label>
            <input type="url" name="portfolio" class="form-control" style="font-size: 0.75rem; padding: 6px 10px;" value="${profile.freelancerPortfolioLink || ''}" placeholder="e.g. https://dribbble.com/arisaulia">
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.avatarUrl', 'Avatar Image URL')}</label>
            <input type="url" name="avatar" class="form-control" style="font-size: 0.75rem; padding: 6px 10px;" value="${profile.freelancerAvatar || ''}" placeholder="e.g. https://images.unsplash.com/...">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.initials', 'Custom Initials (Optional)')}</label>
            <input type="text" name="initials" class="form-control" style="font-size: 0.75rem; padding: 6px 10px; width: 100%;" value="${profile.freelancerInitials || ''}" maxlength="3" placeholder="Auto-generated if empty">
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.language', 'Language / Bahasa')}</label>
            <select class="form-control" id="profile-lang-select" style="font-size: 0.75rem; padding: 6px 10px; width: 100%;">
              <option value="en" ${activeLang === 'en' ? 'selected' : ''}>English</option>
              <option value="id" ${activeLang === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px;">${t('profile.defaultCurrency', 'Default Currency')}</label>
            <select class="form-control" id="profile-currency-select" style="font-size: 0.75rem; padding: 6px 10px; width: 100%;">
              <option value="IDR" ${defaultCurrency === 'IDR' ? 'selected' : ''}>IDR - Indonesian Rupiah</option>
              <option value="USD" ${defaultCurrency === 'USD' ? 'selected' : ''}>USD - US Dollar</option>
              <option value="SGD" ${defaultCurrency === 'SGD' ? 'selected' : ''}>SGD - Singapore Dollar</option>
              <option value="AUD" ${defaultCurrency === 'AUD' ? 'selected' : ''}>AUD - Australian Dollar</option>
              <option value="EUR" ${defaultCurrency === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
            </select>
            <small style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px;">
              ${t('profile.defaultCurrencyHelper', 'Used as the default currency for new projects and invoices.')}
            </small>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 16px; margin-top: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-secondary" id="btn-switch-entry-mode" style="font-size: 0.75rem; padding: 8px 16px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; color: var(--color-warning); border-color: rgba(245,158,11,0.15);">
            🔄 ${t('entryMode.switchMode', 'Switch Entry Mode')}
          </button>
          <button type="button" class="btn btn-secondary" id="btn-open-portal" style="font-size: 0.75rem; padding: 8px 16px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px;">
            ${getIcon('externalLink', '', 12)} ${t('profile.openClientView', 'Open Client View')}
          </button>
          <button type="submit" class="btn btn-primary" style="font-size: 0.75rem; padding: 8px 20px; border-radius: 6px; font-weight: 600;">
            ${t('saveProfile', 'Save Profile')}
          </button>
        </div>
      </form>
    `;

    // Danger Zone / Zona Bahaya
    const dangerZoneBox = document.createElement('div');
    dangerZoneBox.className = 'focus-module-box';
    dangerZoneBox.style.cssText = 'max-width: 640px; padding: 24px; display: flex; flex-direction: column; gap: 16px; margin: 20px auto 0; width: 100%; border: 1px solid rgba(239, 68, 68, 0.25); background: rgba(239, 68, 68, 0.03);';
    dangerZoneBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--color-danger); margin: 0;">
        ${getIcon('alert', '', 16)} ${t('privacy.dangerZone', 'Danger Zone / Zona Bahaya')}
      </h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
        ${t('privacy.sharedDeviceNotice', 'Using a shared device? Lock your workspace when finished to protect client and project data. This helps protect privacy on shared devices.')}
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary text-danger" id="btn-clear-local-data" style="font-size: 0.75rem; padding: 8px 16px; border-radius: 6px; border-color: rgba(239,68,68,0.25); background: transparent;">
          ${t('privacy.clearLocalData', 'Clear Local Workspace Data')}
        </button>
      </div>
    `;
    viewEl.appendChild(dangerZoneBox);

    this.container.appendChild(viewEl);

    // Event Listeners
    const form = viewEl.querySelector('#freelancer-profile-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = form.querySelector('input[name="name"]').value.trim();
      const roleVal = form.querySelector('input[name="role"]').value.trim();
      const emailVal = form.querySelector('input[name="email"]').value.trim();
      const locVal = form.querySelector('input[name="location"]').value.trim();
      const bioVal = form.querySelector('textarea[name="bio"]').value.trim();
      const portVal = form.querySelector('input[name="portfolio"]').value.trim();
      const avVal = form.querySelector('input[name="avatar"]').value.trim();
      let initVal = form.querySelector('input[name="initials"]').value.trim();

      if (!initVal) {
        initVal = this.store.getInitials(nameVal);
      } else {
        initVal = initVal.toUpperCase().substring(0, 3);
      }

      this.store.updateFreelancerProfile({
        freelancerName: nameVal,
        freelancerRole: roleVal,
        freelancerEmail: emailVal,
        freelancerLocation: locVal,
        freelancerBio: bioVal,
        freelancerPortfolioLink: portVal,
        freelancerAvatar: avVal,
        freelancerInitials: initVal
      });

      this.onTriggerToast(t('toast.profileUpdated', 'Profile updated.'), 'text-success');
      this.update();
      
      // Force update the sidebar footer rendering
      if (window.app && window.app.sidebar) {
        window.app.sidebar.update(window.app.activeTab);
      }
    });

    viewEl.querySelector('#profile-lang-select').addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });

    viewEl.querySelector('#profile-currency-select').addEventListener('change', (e) => {
      const newCurrency = e.target.value;
      localStorage.setItem('alurkarya_default_currency', newCurrency);
      this.onTriggerToast(t('toast.defaultCurrencyUpdated', 'Default currency updated.'), 'text-success');
    });

    viewEl.querySelector('#btn-open-portal').addEventListener('click', () => {
      if (window.app) {
        window.app.switchView('client-view');
      }
    });

    viewEl.querySelector('#btn-switch-entry-mode').addEventListener('click', () => {
      localStorage.removeItem('alurkarya_entry_mode');
      window.location.reload();
    });

    viewEl.querySelector('#btn-clear-local-data').addEventListener('click', () => {
      const promptWarning = t('privacy.clearLocalDataWarning', 'This will delete AlurKarya workspace data stored in this browser. Export a backup first if needed.');
      const confirmVal = prompt(promptWarning + '\n\n' + (getLanguage() === 'id' ? 'Ketik HAPUS untuk mengonfirmasi:' : 'Type DELETE to confirm:'));
      if (confirmVal === 'DELETE' || confirmVal === 'HAPUS') {
        // Clear only AlurKarya local storage keys
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('alurkarya_') || key === 'freelancer_os_workspace')) {
            localStorage.removeItem(key);
          }
        }
        // Clear session storage keys
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('alurkarya_')) {
            sessionStorage.removeItem(key);
          }
        }
        window.location.reload();
      }
    });
  }
}
