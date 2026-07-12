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
    const activeLang = getLanguage();
    const isIndo = activeLang === 'id';

    const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
    if (!activeWorkspaceId) {
      const titleText = isIndo ? "Pilih workspace terlebih dahulu" : "Select a workspace first";
      const bodyText = isIndo 
        ? "Profil freelancer disimpan untuk setiap workspace. Pilih atau buat workspace agar kamu bisa mengatur profilmu."
        : "Freelancer profiles are stored separately for each workspace. Select or create a workspace to manage your profile.";
      const ctaText = isIndo ? "Pilih Workspace" : "Select Workspace";

      const blockerEl = document.createElement('div');
      blockerEl.className = 'focus-module-box';
      blockerEl.style.cssText = 'max-width: 500px; padding: 40px; margin: 80px auto; text-align: center; border: 1px solid rgba(139, 92, 246, 0.2); background: rgba(139, 92, 246, 0.02); border-radius: var(--border-radius-lg); display: flex; flex-direction: column; align-items: center; gap: 20px;';
      blockerEl.innerHTML = `
        <div style="font-size: 3rem; filter: drop-shadow(0 4px 12px rgba(139,92,246,0.3));">💼</div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0;">${titleText}</h2>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.6;">${bodyText}</p>
        <button type="button" class="btn btn-primary" id="btn-recovery-select-workspace" style="font-size: 0.8rem; padding: 10px 24px; border-radius: 8px; font-weight: 700; margin-top: 8px;">
          ${ctaText}
        </button>
      `;
      this.container.appendChild(blockerEl);
      
      const btn = blockerEl.querySelector('#btn-recovery-select-workspace');
      if (btn) {
        btn.addEventListener('click', () => {
          sessionStorage.removeItem('alurkarya_active_workspace_id');
          window.location.reload();
        });
      }
      return;
    }

    const profile = this.store.getFreelancerProfile();
    const defaultCurrency = window.getDefaultCurrency ? window.getDefaultCurrency() : 'IDR';

    const viewEl = document.createElement('div');
    viewEl.className = 'profile-viewport';
    viewEl.style.cssText = 'display: flex; flex-direction: column; gap: 24px; height: 100%;';

    // Page Intro matching premium aesthetics
    const introBox = document.createElement('div');
    introBox.className = 'portfolio-intro-box';
    introBox.style.cssText = 'max-width: 1100px; margin: 0 auto 8px auto; width: 100%; box-sizing: border-box;';
    
    const headerTitle = isIndo ? 'Profil Freelancer' : 'Freelancer Profile';
    const headerDesc = isIndo 
      ? 'Atur detail pribadi, spesialisasi, bio, lokasi, dan link portfolio Anda. Data ini disinkronkan dengan kartu profil sidebar dan Client Dashboard.'
      : 'Manage your personal details, specialization, bio, location, and portfolio link. This data syncs with the sidebar profile card and Client Dashboard.';
      
    introBox.innerHTML = `
      <h2>${headerTitle}</h2>
      <p style="margin-top: 6px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${headerDesc}</p>
    `;
    viewEl.appendChild(introBox);

    // Responsive Grid layout for Form and Preview
    const gridLayout = document.createElement('div');
    gridLayout.className = 'profile-layout-grid';
    gridLayout.style.cssText = 'display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 1100px; width: 100%; margin: 0 auto; align-items: start;';

    // Embed media query styling for desktop double column
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @media (min-width: 900px) {
        .profile-layout-grid {
          grid-template-columns: 1.25fr 0.75fr !important;
        }
      }
      .profile-viewport .form-control {
        background: rgba(0, 0, 0, 0.2) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #fff !important;
        border-radius: 8px !important;
        transition: all 0.2s ease !important;
      }
      .profile-viewport .form-control:focus {
        border-color: #8b5cf6 !important;
        background: rgba(0, 0, 0, 0.35) !important;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
      }
    `;
    viewEl.appendChild(styleEl);

    // Left Column: Profile Form Card (Detail Profil)
    const formBox = document.createElement('div');
    formBox.className = 'focus-module-box';
    formBox.style.cssText = 'padding: 24px; display: flex; flex-direction: column; gap: 16px; width: 100%; box-sizing: border-box;';

    const formTitle = isIndo ? 'Detail Profil' : 'Profile Details';
    const saveBtnText = isIndo ? 'Simpan Profil' : 'Save Profile';

    formBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0 0 4px 0;">
        ${getIcon('user', 'text-primary', 16)} ${formTitle}
      </h3>
      <form id="freelancer-profile-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Nama Freelancer' : 'Freelancer Name'}</label>
            <input type="text" name="name" class="form-control" style="font-size: 0.8rem; padding: 10px;" value="${profile.freelancerName || ''}" placeholder="e.g. Aris Aulia" required />
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Role / Spesialisasi' : 'Role / Specialization'}</label>
            <input type="text" name="role" class="form-control" style="font-size: 0.8rem; padding: 10px;" value="${profile.freelancerRole || ''}" placeholder="e.g. Creative Freelancer" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Email' : 'Email'}</label>
            <input type="email" name="email" class="form-control" style="font-size: 0.8rem; padding: 10px;" value="${profile.freelancerEmail || ''}" placeholder="e.g. hello@arisaulia.com" required />
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Lokasi' : 'Location'}</label>
            <input type="text" name="location" class="form-control" style="font-size: 0.8rem; padding: 10px;" value="${profile.freelancerLocation || ''}" placeholder="e.g. Bandung, Indonesia" required />
          </div>
        </div>

        <div class="form-group">
          <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Bio Singkat' : 'Short Bio'}</label>
          <textarea name="bio" class="form-control" style="font-size: 0.8rem; padding: 10px; min-height: 80px; resize: vertical;" placeholder="Tell your clients a little bit about what you specialize in..." required>${profile.freelancerBio || ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Link Portfolio' : 'Portfolio Link'}</label>
            <input type="url" name="portfolio" class="form-control" style="font-size: 0.8rem; padding: 10px;" value="${profile.freelancerPortfolioLink || ''}" placeholder="e.g. https://dribbble.com/arisaulia" required />
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Foto / Avatar' : 'Photo / Avatar'}</label>
            <input type="url" name="avatar" class="form-control" style="font-size: 0.8rem; padding: 10px;" value="${profile.freelancerAvatar || ''}" placeholder="e.g. https://images.unsplash.com/..." />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${isIndo ? 'Initial' : 'Initials'}</label>
            <input type="text" name="initials" class="form-control" style="font-size: 0.8rem; padding: 10px; text-transform: uppercase;" value="${profile.freelancerInitials || ''}" maxlength="3" placeholder="Auto-generated if empty" />
          </div>
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${t('profile.language', 'Language / Bahasa')}</label>
            <select class="form-control" id="profile-lang-select" style="font-size: 0.8rem; padding: 10px; cursor: pointer;">
              <option value="en" ${activeLang === 'en' ? 'selected' : ''}>English</option>
              <option value="id" ${activeLang === 'id' ? 'selected' : ''}>Bahasa Indonesia</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="font-size: 0.72rem; display: block; margin-bottom: 4px; color: #cbd5e1;">${t('profile.defaultCurrency', 'Default Currency')}</label>
            <select class="form-control" id="profile-currency-select" style="font-size: 0.8rem; padding: 10px; cursor: pointer;">
              <option value="IDR" ${defaultCurrency === 'IDR' ? 'selected' : ''}>IDR - Indonesian Rupiah</option>
              <option value="USD" ${defaultCurrency === 'USD' ? 'selected' : ''}>USD - US Dollar</option>
              <option value="SGD" ${defaultCurrency === 'SGD' ? 'selected' : ''}>SGD - Singapore Dollar</option>
              <option value="AUD" ${defaultCurrency === 'AUD' ? 'selected' : ''}>AUD - Australian Dollar</option>
              <option value="EUR" ${defaultCurrency === 'EUR' ? 'selected' : ''}>EUR - Euro</option>
            </select>
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
            ${saveBtnText}
          </button>
        </div>
      </form>
    `;
    gridLayout.appendChild(formBox);

    // Right Column: Profile Preview Card (Preview Profil)
    const previewBox = document.createElement('div');
    previewBox.className = 'focus-module-box';
    previewBox.style.cssText = 'padding: 24px; display: flex; flex-direction: column; gap: 16px; width: 100%; box-sizing: border-box;';

    const previewTitle = isIndo ? 'Preview Profil' : 'Profile Preview';
    previewBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
        ${getIcon('user', 'text-primary', 16)} ${previewTitle}
      </h3>
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 24px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; box-sizing: border-box; width: 100%;">
        <!-- Avatar circle -->
        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; color: #fff; border: 2px solid rgba(255,255,255,0.1); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" id="preview-avatar-container">
          ${profile.freelancerAvatar 
            ? `<img src="${profile.freelancerAvatar}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; document.getElementById('preview-avatar-initials').style.display='flex';" />`
            : ''}
          <span id="preview-avatar-initials" style="display: ${profile.freelancerAvatar ? 'none' : 'flex'};">${profile.freelancerInitials || 'AK'}</span>
        </div>
        <!-- Info -->
        <div>
          <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #f8fafc;" id="preview-name">${profile.freelancerName || (isIndo ? 'Nama Belum Diatur' : 'Name Not Set')}</h4>
          <span style="font-size: 0.8rem; color: #a78bfa; font-weight: 600; display: block; margin-top: 4px;" id="preview-role">${profile.freelancerRole || (isIndo ? 'Role Belum Diatur' : 'Role Not Set')}</span>
        </div>
        <!-- Bio -->
        <p style="margin: 0; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5; max-width: 100%; word-break: break-word;" id="preview-bio">
          ${profile.freelancerBio || (isIndo ? 'Belum ada bio singkat.' : 'No short bio yet.')}
        </p>
        <!-- Contact Info -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px; font-size: 0.75rem; text-align: left; color: var(--text-secondary);">
          <div style="display: flex; align-items: center; gap: 8px; word-break: break-all;">
            <span>📧</span> <span id="preview-email">${profile.freelancerEmail || '-'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>📍</span> <span id="preview-location">${profile.freelancerLocation || '-'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; word-break: break-all;">
            <span>🔗</span> <span id="preview-portfolio">${profile.freelancerPortfolioLink ? `<a href="${profile.freelancerPortfolioLink}" target="_blank" style="color: #60a5fa; text-decoration: none;">${profile.freelancerPortfolioLink}</a>` : '-'}</span>
          </div>
        </div>
      </div>
    </div>
    `;
    gridLayout.appendChild(previewBox);
    viewEl.appendChild(gridLayout);

    // Workspace Data Settings Card (below the form & preview)
    const settingsBox = document.createElement('div');
    settingsBox.className = 'focus-module-box';
    settingsBox.style.cssText = 'max-width: 1100px; padding: 24px; display: flex; flex-direction: column; gap: 16px; margin: 0 auto; width: 100%; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box;';

    const settingsTitle = t('privacy.dangerZone', 'Workspace Data Settings');
    const settingsDesc = isIndo
      ? 'Atur backup, penguncian, dan penghapusan data workspace yang tersimpan di browser ini.'
      : 'Manage backup, lock, and deletion settings for workspace data stored in this browser.';
    const advancedLabel = t('profile.advancedActions', 'Advanced Actions');

    settingsBox.innerHTML = `
      <h3 style="font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0;">
        ${getIcon('settings', '', 16)} ${settingsTitle}
      </h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.45;">
        ${settingsDesc}
      </p>

      <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 8px;">
        <h4 style="font-size: 0.82rem; font-weight: 600; color: #ef4444; margin: 0 0 12px 0;">${advancedLabel}</h4>
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Delete Active Workspace option -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 16px;">
            <div style="flex: 1; min-width: 250px;">
              <span style="font-size: 0.82rem; font-weight: 600; color: #f8fafc; display: block; margin-bottom: 4px;">
                ${t('profile.deleteWorkspace', 'Delete This Workspace')}
              </span>
              <small style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.45; display: block;">
                ${t('profile.deleteWorkspaceDesc', 'Deletes only the active workspace. Other workspaces in this browser will not be deleted.')}
              </small>
            </div>
            <button type="button" class="btn btn-secondary text-danger" id="btn-delete-workspace" style="font-size: 0.75rem; padding: 8px 16px; border-radius: 6px; border-color: rgba(239,68,68,0.25); background: transparent;">
              ${t('profile.deleteWorkspace', 'Delete This Workspace')}
            </button>
          </div>

          <!-- Delete All Local Data option -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div style="flex: 1; min-width: 250px;">
              <span style="font-size: 0.82rem; font-weight: 600; color: #f8fafc; display: block; margin-bottom: 4px;">
                ${t('profile.deleteAllData', 'Delete All Data in This Browser')}
              </span>
              <small style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.45; display: block;">
                ${t('profile.deleteAllDataDesc', 'Deletes all AlurKarya workspaces stored in this browser. Use this only if you already have a backup or truly want to start over.')}
              </small>
            </div>
            <button type="button" class="btn btn-secondary text-danger" id="btn-delete-all-local" style="font-size: 0.75rem; padding: 8px 16px; border-radius: 6px; border-color: rgba(239,68,68,0.25); background: transparent;">
              ${t('profile.deleteAllData', 'Delete All Data in This Browser')}
            </button>
          </div>
        </div>
      </div>
    `;
    viewEl.appendChild(settingsBox);

    const versionMarker = document.createElement('div');
    versionMarker.style.cssText = 'font-size: 0.6rem; color: var(--text-muted); text-align: center; margin-top: 16px; opacity: 0.3;';
    versionMarker.textContent = 'Profile UI Version: profile-form-v2';
    viewEl.appendChild(versionMarker);

    this.container.appendChild(viewEl);

    // Form Change / Type Realtime Preview Sync
    const form = viewEl.querySelector('#freelancer-profile-form');
    const inputs = {
      name: form.querySelector('input[name="name"]'),
      role: form.querySelector('input[name="role"]'),
      email: form.querySelector('input[name="email"]'),
      location: form.querySelector('input[name="location"]'),
      bio: form.querySelector('textarea[name="bio"]'),
      portfolio: form.querySelector('input[name="portfolio"]'),
      avatar: form.querySelector('input[name="avatar"]'),
      initials: form.querySelector('input[name="initials"]')
    };

    const updatePreview = () => {
      const name = inputs.name.value.trim();
      const role = inputs.role.value.trim();
      const bio = inputs.bio.value.trim();
      const email = inputs.email.value.trim();
      const location = inputs.location.value.trim();
      const portfolio = inputs.portfolio.value.trim();
      const avatar = inputs.avatar.value.trim();
      const initials = inputs.initials.value.trim().toUpperCase();

      const calculatedInitials = initials || (name ? name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase() : 'AK');

      const nameEl = viewEl.querySelector('#preview-name');
      const roleEl = viewEl.querySelector('#preview-role');
      const bioEl = viewEl.querySelector('#preview-bio');
      const emailEl = viewEl.querySelector('#preview-email');
      const locationEl = viewEl.querySelector('#preview-location');
      const portfolioEl = viewEl.querySelector('#preview-portfolio');
      const avatarContainer = viewEl.querySelector('#preview-avatar-container');

      if (nameEl) nameEl.textContent = name || (isIndo ? 'Nama Belum Diatur' : 'Name Not Set');
      if (roleEl) roleEl.textContent = role || (isIndo ? 'Role Belum Diatur' : 'Role Not Set');
      if (bioEl) bioEl.textContent = bio || (isIndo ? 'Belum ada bio singkat.' : 'No short bio yet.');
      if (emailEl) emailEl.textContent = email || '-';
      if (locationEl) locationEl.textContent = location || '-';
      
      if (portfolioEl) {
        portfolioEl.innerHTML = portfolio 
          ? `<a href="${portfolio}" target="_blank" style="color: #60a5fa; text-decoration: none;">${portfolio}</a>`
          : '-';
      }

      if (avatarContainer) {
        avatarContainer.innerHTML = '';
        if (avatar) {
          const img = document.createElement('img');
          img.src = avatar;
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          const spanInitials = document.createElement('span');
          spanInitials.style.cssText = 'display: none;';
          spanInitials.textContent = calculatedInitials;
          img.onerror = () => {
            img.style.display = 'none';
            spanInitials.style.display = 'flex';
          };
          avatarContainer.appendChild(img);
          avatarContainer.appendChild(spanInitials);
        } else {
          const spanInitials = document.createElement('span');
          spanInitials.textContent = calculatedInitials;
          avatarContainer.appendChild(spanInitials);
        }
      }
    };

    Object.values(inputs).forEach(input => {
      if (input) {
        input.addEventListener('input', updatePreview);
      }
    });

    // Form Submission Handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = inputs.name.value.trim();
      const roleVal = inputs.role.value.trim();
      const emailVal = inputs.email.value.trim();
      const locVal = inputs.location.value.trim();
      const bioVal = inputs.bio.value.trim();
      const portVal = inputs.portfolio.value.trim();
      const avVal = inputs.avatar.value.trim();
      let initVal = inputs.initials.value.trim();

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
      if (window.setDefaultCurrency) {
        window.setDefaultCurrency(newCurrency);
      } else {
        localStorage.setItem('alurkarya_default_currency', newCurrency);
      }
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

    // Destructive Actions Handlers
    viewEl.querySelector('#btn-delete-workspace').addEventListener('click', () => {
      const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
      if (!activeWorkspaceId) return;

      const warningText = t('profile.confirmDeleteWorkspace');
      const confirmVal = prompt(warningText);
      const expected = isIndo ? 'HAPUS' : 'DELETE';
      
      if (confirmVal === expected) {
        this.store.deleteWorkspace(activeWorkspaceId);
        sessionStorage.removeItem('alurkarya_active_workspace_id');
        sessionStorage.removeItem('alurkarya_session_unlocked');
        this.onTriggerToast(t('profile.workspaceDeleted', 'Workspace deleted successfully.'), 'text-success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        this.onTriggerToast(t('profile.deletionCancelled', 'Deletion cancelled.'), 'text-muted');
      }
    });

    viewEl.querySelector('#btn-delete-all-local').addEventListener('click', () => {
      const warningText = t('profile.confirmDeleteAllData');
      const confirmVal = prompt(warningText);
      const expected = isIndo ? 'HAPUS' : 'DELETE';

      if (confirmVal === expected) {
        this.store.deleteAllLocalData();
        this.onTriggerToast(t('profile.allDataCleared', 'All local data cleared successfully.'), 'text-success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        this.onTriggerToast(t('profile.deletionCancelled', 'Deletion cancelled.'), 'text-muted');
      }
    });
  }
}
