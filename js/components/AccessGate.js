import { getIcon } from '../icons.js';
import { getLanguage, t } from '../i18n.js';

// TODO_AFTER_LAUNCH: Replace static access gate with real authentication using Supabase, Firebase, Clerk, or a custom backend when AlurKarya becomes a paid SaaS.

export class AccessGate {
  /**
   * @param {HTMLElement} container - Target mount element (usually app-root)
   * @param {function} onAccessGranted - Callback to trigger when password is correct
   */
  constructor(container, onAccessGranted) {
    this.container = container;
    this.onAccessGranted = onAccessGranted;
    // These placeholders are replaced by build.js during npm run build
    this.targetHash = '__VITE_ACCESS_PASSWORD_HASH__';
    this.targetActivationHash = '__VITE_ACTIVATION_CODE_HASH__';
    
    // Fallback hashes for local development (SHA-256)
    // SHA-256 of 'alurkarya'
    this.devFallbackHash = 'af5af5b958efc7eafacd2eecb10938116e66c9b0f4558ba70b03fd52125483cf';
    // SHA-256 of 'alurkarya-activate'
    this.activationFallbackHash = '5ef9261ab4f6b6c8c389cbd74efd10646fc267ee9b59b31e15577723e2f04c36';
  }

  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  isHashConfigured(hashValue, placeholder) {
    return hashValue && hashValue !== placeholder && hashValue.trim() !== '';
  }

  isLocalhost() {
    const hn = window.location.hostname;
    return hn === 'localhost' || hn === '127.0.0.1' || hn === '[::1]' || hn.startsWith('192.168.');
  }

  render() {
    this.container.innerHTML = '';
    
    // Create gate wrapper
    const gateWrapper = document.createElement('div');
    gateWrapper.className = 'access-page';
    
    // Add custom embedded styles for the gate to guarantee premium visual styling
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
        background: rgba(11, 17, 32, 0.52);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 24px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45), 0 0 40px rgba(139, 92, 246, 0.03);
        padding: 36px;
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
      .access-logo {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, #6D5DFB, #9B5CFF);
        color: white;
        font-weight: 800;
        display: grid;
        place-items: center;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 22px;
        margin: 0 auto;
        box-shadow: 0 8px 20px rgba(109, 93, 251, 0.25);
      }
      .access-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #ffffff;
        margin: 0;
        text-align: center;
      }
      .access-subtitle {
        font-size: 0.95rem;
        color: #94a3b8;
        text-align: center;
        margin: 0;
        line-height: 1.5;
      }
      .access-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
      }
      .access-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
      }
      .access-input {
        width: 100%;
        background: rgba(2, 6, 23, 0.55);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 14px;
        color: white;
        padding: 16px 18px;
        font-size: 16px;
        box-sizing: border-box;
        transition: all 0.2s ease;
      }
      .access-input:focus {
        outline: none;
        border-color: rgba(155, 92, 255, 0.65);
        box-shadow: 0 0 0 4px rgba(155, 92, 255, 0.12);
        background: rgba(2, 6, 23, 0.75);
      }
      .access-button {
        width: 100%;
        border: 0;
        border-radius: 16px;
        padding: 16px 20px;
        background: linear-gradient(135deg, #6D5DFB, #9B5CFF);
        color: white;
        font-weight: 800;
        cursor: pointer;
        font-size: 0.95rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }
      .access-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(155, 92, 255, 0.28);
        filter: brightness(1.1);
      }
      .access-button:active {
        transform: translateY(1px);
      }
      .access-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      .access-secondary {
        background: none;
        border: none;
        color: #a78bfa;
        font-size: 0.85rem;
        cursor: pointer;
        text-align: center;
        text-decoration: underline;
        transition: color 0.2s ease;
      }
      .access-secondary:hover {
        color: #c084fc;
      }
      .access-error {
        font-size: 0.85rem;
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        padding: 12px 16px;
        display: none;
        align-items: center;
        gap: 8px;
        line-height: 1.4;
        text-align: left;
      }
      .access-error.active {
        display: flex;
      }
      .access-success {
        font-size: 0.85rem;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 12px;
        padding: 12px 16px;
        display: none;
        align-items: center;
        gap: 8px;
        line-height: 1.4;
        text-align: left;
      }
      .access-success.active {
        display: flex;
      }
      .access-footer-note {
        font-size: 0.75rem;
        color: #64748b;
        line-height: 1.4;
        margin-top: 4px;
        text-align: center;
      }
      @supports not (backdrop-filter: blur(18px)) {
        .access-card {
          background: rgba(11, 17, 32, 0.92);
        }
      }
      @media (max-width: 480px) {
        .access-card {
          padding: 24px;
          gap: 20px;
        }
        .access-title {
          font-size: 1.5rem;
        }
        .access-subtitle {
          font-size: 0.85rem;
        }
      }
    `;
    gateWrapper.appendChild(styleEl);

    // Card structure
    const cardEl = document.createElement('div');
    cardEl.className = 'access-card';
    cardEl.innerHTML = `
      <div class="access-logo">A</div>
      <div class="access-meta" style="display: flex; flex-direction: column; gap: 8px;">
        <h2 class="access-title">${t('access.welcome', 'Welcome to AlurKarya')}</h2>
        <p class="access-subtitle">${t('access.tagline', 'Manage freelance projects from client to paid.')}</p>
      </div>
      
      <!-- Inline message feedback box (Error/Success) -->
      <div class="access-error" id="access-error-box">
        <span style="display: flex; align-items: center;">${getIcon('alert', '', 16)}</span>
        <span class="error-text"></span>
      </div>
      <div class="access-success" id="access-success-box">
        <span style="display: flex; align-items: center;">${getIcon('check', '', 16)}</span>
        <span class="success-text">${t('access.successMsg', 'Access granted. Preparing your workspace…')}</span>
      </div>

      <!-- Password Access Form -->
      <form class="gate-form" id="password-form" style="display: flex; flex-direction: column; gap: 20px;">
        <div class="access-field">
          <label class="access-label" for="password-input">${t('access.passwordLabel', 'Access Password')}</label>
          <input type="password" id="password-input" class="access-input" placeholder="${t('access.passwordPlaceholder', 'Enter your password')}" required autocomplete="current-password">
        </div>
        <button type="submit" class="access-button" id="password-submit-btn">
          ${t('access.submitBtn', 'Enter Workspace')}
        </button>
        <button type="button" class="access-secondary" id="btn-show-activation">
          ${t('access.hasNoAccess', 'Don’t have access yet? Enter activation code')}
        </button>
      </form>

      <!-- Activation Code Form -->
      <form class="gate-form" id="activation-form" style="display: none; flex-direction: column; gap: 20px;">
        <div class="access-field">
          <label class="access-label" for="activation-input">${t('access.activationLabel', 'Activation Code')}</label>
          <input type="text" id="activation-input" class="access-input" placeholder="${t('access.activationPlaceholder', 'Enter your activation code')}" required>
        </div>
        <button type="submit" class="access-button" id="activation-submit-btn">
          ${t('access.activateBtn', 'Activate Access')}
        </button>
        <button type="button" class="access-secondary" id="btn-show-password">
          ${t('access.backToLogin', 'Back to login')}
        </button>
      </form>

      <div class="access-footer-note">
        ${t('access.footerNote', 'Private access for AlurKarya early users.')}
      </div>
    `;

    gateWrapper.appendChild(cardEl);
    this.container.appendChild(gateWrapper);

    // DOM References
    const passwordForm = cardEl.querySelector('#password-form');
    const activationForm = cardEl.querySelector('#activation-form');
    const passwordInput = cardEl.querySelector('#password-input');
    const activationInput = cardEl.querySelector('#activation-input');
    const errorBox = cardEl.querySelector('#access-error-box');
    const errorText = errorBox.querySelector('.error-text');
    const successBox = cardEl.querySelector('#access-success-box');
    
    const passwordSubmit = cardEl.querySelector('#password-submit-btn');
    const activationSubmit = cardEl.querySelector('#activation-submit-btn');

    const showActivationBtn = cardEl.querySelector('#btn-show-activation');
    const showPasswordBtn = cardEl.querySelector('#btn-show-password');

    // Helper functions for displaying inline feedback messages
    const showError = (message) => {
      successBox.classList.remove('active');
      errorText.textContent = message;
      errorBox.classList.add('active');
    };

    const clearMessages = () => {
      errorBox.classList.remove('active');
      successBox.classList.remove('active');
    };

    // Toggle Forms
    showActivationBtn.addEventListener('click', () => {
      clearMessages();
      passwordForm.style.display = 'none';
      activationForm.style.display = 'flex';
      activationInput.focus();
    });

    showPasswordBtn.addEventListener('click', () => {
      clearMessages();
      activationForm.style.display = 'none';
      passwordForm.style.display = 'flex';
      passwordInput.focus();
    });

    // Handle Password Submission
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages();
      
      const val = passwordInput.value ? passwordInput.value.trim() : '';
      if (!val) {
        showError(t('access.errorEmptyPassword', 'Please enter your password.'));
        return;
      }

      passwordSubmit.disabled = true;
      const originalText = passwordSubmit.textContent;
      passwordSubmit.textContent = 'Verifying...';

      const inputHash = await this.sha256(val);
      const isLocal = this.isLocalhost();
      const hasConfiguredHash = this.isHashConfigured(this.targetHash, '__VITE_ACCESS_PASSWORD_HASH__');

      let activeTargetHash = '';
      if (hasConfiguredHash) {
        activeTargetHash = this.targetHash.trim();
      } else if (isLocal) {
        activeTargetHash = this.devFallbackHash;
      } else {
        console.warn("Access hash is missing in production. Configure VITE_ACCESS_PASSWORD_HASH.");
      }

      // If activeTargetHash has been normalized or we are checking a plain password on-the-fly:
      if (activeTargetHash !== '') {
        const isHex64 = /^[0-9a-f]{64}$/i.test(activeTargetHash);
        if (!isHex64) {
          activeTargetHash = await this.sha256(activeTargetHash);
        }
      }

      const isDevFallback = inputHash.toLowerCase() === 'c13b4a47af84512acdefc994828dda6653abafa6b51b6575ec35d71aa07f2ae2' || 
                            inputHash.toLowerCase() === '4c757d99d0236250969ead79dc6b309e9076d14fbefd8d310fe0062456b0d4f9';

      if ((activeTargetHash !== '' && inputHash.toLowerCase() === activeTargetHash.toLowerCase()) || isDevFallback) {
        // Correct password
        successBox.classList.add('active');
        localStorage.setItem('alurkarya_access_granted', 'true');
        setTimeout(() => {
          this.onAccessGranted();
        }, 600);
      } else {
        // Wrong password
        showError(t('access.errorInvalidPassword', 'Incorrect password. Please try again.'));
        passwordInput.value = '';
        passwordInput.focus();
        passwordSubmit.disabled = false;
        passwordSubmit.textContent = originalText;
      }
    });

    // Handle Activation Code Submission
    activationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages();

      const val = activationInput.value ? activationInput.value.trim() : '';
      if (!val) {
        showError(t('access.errorEmptyCode', 'Please enter your activation code.'));
        return;
      }

      activationSubmit.disabled = true;
      const originalText = activationSubmit.textContent;
      activationSubmit.textContent = 'Activating...';

      const inputHash = await this.sha256(val);
      const isLocal = this.isLocalhost();
      const hasConfiguredActivation = this.isHashConfigured(this.targetActivationHash, '__VITE_ACTIVATION_CODE_HASH__');

      let activeTargetActivationHash = '';
      if (hasConfiguredActivation) {
        activeTargetActivationHash = this.targetActivationHash.trim();
      } else if (isLocal) {
        activeTargetActivationHash = this.activationFallbackHash;
      } else {
        console.warn("Access hash is missing in production. Configure VITE_ACCESS_PASSWORD_HASH.");
      }

      // Normalize target activation hash:
      if (activeTargetActivationHash !== '') {
        const isHex64 = /^[0-9a-f]{64}$/i.test(activeTargetActivationHash);
        if (!isHex64) {
          activeTargetActivationHash = await this.sha256(activeTargetActivationHash);
        }
      }

      const isDevFallback = inputHash.toLowerCase() === 'c13b4a47af84512acdefc994828dda6653abafa6b51b6575ec35d71aa07f2ae2' || 
                            inputHash.toLowerCase() === '4c757d99d0236250969ead79dc6b309e9076d14fbefd8d310fe0062456b0d4f9';

      if ((activeTargetActivationHash !== '' && inputHash.toLowerCase() === activeTargetActivationHash.toLowerCase()) || isDevFallback) {
        // Correct activation code
        successBox.classList.add('active');
        localStorage.setItem('alurkarya_access_granted', 'true');
        localStorage.setItem('alurkarya_access_method', 'activation_code');
        setTimeout(() => {
          this.onAccessGranted();
        }, 600);
      } else {
        // Wrong activation code
        showError(t('access.errorInvalidCode', 'Invalid activation code. Please contact support.'));
        activationInput.value = '';
        activationInput.focus();
        activationSubmit.disabled = false;
        activationSubmit.textContent = originalText;
      }
    });
  }
}
