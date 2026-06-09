import { getIcon } from '../icons.js';

export class AccessGate {
  /**
   * @param {HTMLElement} container - Target mount element (usually app-root)
   * @param {function} onAccessGranted - Callback to trigger when password is correct
   */
  constructor(container, onAccessGranted) {
    this.container = container;
    this.onAccessGranted = onAccessGranted;
    // This placeholder is replaced by build.js during npm run build
    this.targetHash = '__VITE_ACCESS_PASSWORD_HASH__';
    // Fallback hash for local development (SHA-256 of 'alurkarya')
    this.devFallbackHash = 'af5af5b958efc7eafacd2eecb10938116e66c9b0f4558ba70b03fd52125483cf';
  }

  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  render() {
    this.container.innerHTML = '';
    
    // Create gate wrapper
    const gateWrapper = document.createElement('div');
    gateWrapper.className = 'access-gate-wrapper';
    
    // Add custom embedded styles for the gate to guarantee premium visual styling
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .access-gate-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at center, hsl(222, 47%, 10%) 0%, hsl(224, 71%, 4%) 100%);
        color: var(--text-primary);
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        padding: 20px;
        box-sizing: border-box;
      }
      .gate-card {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        backdrop-filter: var(--glass-backdrop);
        box-shadow: var(--shadow-premium), 0 0 40px rgba(139, 92, 246, 0.05);
        border-radius: 16px;
        padding: 40px 32px;
        width: 100%;
        max-width: 440px;
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 24px;
        position: relative;
        overflow: hidden;
      }
      .gate-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      }
      .gate-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 0 auto;
      }
      .gate-logo svg {
        color: var(--color-primary);
        filter: drop-shadow(0 0 8px var(--color-primary-glow));
      }
      .gate-brand {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.8rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, #ffffff 40%, var(--text-secondary) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .gate-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .gate-subtitle {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-secondary);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        line-height: 1.4;
      }
      .gate-text {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      .gate-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        text-align: left;
      }
      .gate-form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .gate-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
      }
      .gate-input-wrapper {
        position: relative;
      }
      .gate-input {
        width: 100%;
        background: rgba(2, 6, 17, 0.6);
        border: 1px solid var(--border-subtle);
        border-radius: 8px;
        padding: 14px 16px 14px 44px;
        color: var(--text-primary);
        font-size: 0.95rem;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }
      .gate-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 12px var(--color-primary-glow);
        background: rgba(2, 6, 17, 0.8);
      }
      .gate-input-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        display: flex;
        align-items: center;
      }
      .gate-btn {
        width: 100%;
        background: linear-gradient(135deg, var(--color-primary) 0%, hsl(263, 85%, 55%) 100%);
        border: none;
        border-radius: 8px;
        padding: 14px;
        color: #ffffff;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 20px var(--color-primary-glow);
      }
      .gate-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(139, 92, 246, 0.4);
        filter: brightness(1.1);
      }
      .gate-btn:active {
        transform: translateY(1px);
      }
      .gate-error {
        font-size: 0.8rem;
        color: var(--color-danger);
        background: var(--color-danger-bg);
        border: 1px solid rgba(239, 68, 68, 0.15);
        border-radius: 8px;
        padding: 12px 14px;
        display: none;
        align-items: flex-start;
        gap: 8px;
        line-height: 1.4;
      }
      .gate-error.active {
        display: flex;
      }
      .gate-footer-note {
        font-size: 0.7rem;
        color: var(--text-muted);
        line-height: 1.4;
        margin-top: 10px;
      }
    `;
    gateWrapper.appendChild(styleEl);

    // Card structure
    const cardEl = document.createElement('div');
    cardEl.className = 'gate-card';
    cardEl.innerHTML = `
      <div class="gate-logo">
        ${getIcon('briefcase', '', 28)}
        <span class="gate-brand">AlurKarya</span>
      </div>
      <div class="gate-meta">
        <span class="gate-subtitle">Client-to-Paid Operating System untuk Freelancer Digital Indonesia</span>
        <span class="gate-text">Masukkan password akses yang Anda terima setelah pembelian.</span>
      </div>
      <div class="gate-error" id="gate-error-message">
        <span style="margin-top: 2px;">${getIcon('alert', '', 14)}</span>
        <span>Password akses belum sesuai. Silakan cek kembali email pembelian Anda.</span>
      </div>
      <form class="gate-form" id="gate-access-form">
        <div class="gate-form-group">
          <label class="gate-label" for="gate-password-input">Password Akses</label>
          <div class="gate-input-wrapper">
            <span class="gate-input-icon">${getIcon('lock', '', 16)}</span>
            <input type="password" id="gate-password-input" class="gate-input" placeholder="••••••••" required autocomplete="current-password">
          </div>
        </div>
        <button type="submit" class="gate-btn" id="gate-submit-btn">
          Masuk ke AlurKarya
        </button>
      </form>
      <div class="gate-footer-note">
        Soft Buyer Access Gate. Konfigurasi password tersimpan aman secara terenkripsi.
      </div>
    `;

    gateWrapper.appendChild(cardEl);
    this.container.appendChild(gateWrapper);

    // Event binding
    const form = cardEl.querySelector('#gate-access-form');
    const input = cardEl.querySelector('#gate-password-input');
    const errorBox = cardEl.querySelector('#gate-error-message');
    const submitBtn = cardEl.querySelector('#gate-submit-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.classList.remove('active');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memverifikasi...';

      const passwordVal = input.value ? input.value.trim() : '';
      const inputHash = await this.sha256(passwordVal);

      // Determine active target hash and normalize it
      let activeTargetHash = this.targetHash ? this.targetHash.trim() : '';
      if (activeTargetHash === '__VITE_ACCESS_PASSWORD_HASH__' || activeTargetHash === '') {
        // Fallback for raw local development without build
        activeTargetHash = this.devFallbackHash;
      }

      // Check if target hash is a valid 64-character hexadecimal SHA-256 string.
      // If it isn't (e.g. the user entered a plain-text password in Render's env variable by mistake),
      // we hash it on the fly so it matches the browser-side input hash!
      const isHex64 = /^[0-9a-f]{64}$/i.test(activeTargetHash);
      if (!isHex64 && activeTargetHash !== '') {
        activeTargetHash = await this.sha256(activeTargetHash);
      }

      // Final comparison (case-insensitive comparison for safety)
      if (inputHash.toLowerCase() === activeTargetHash.toLowerCase()) {
        // Correct password
        localStorage.setItem('alurkarya_access_granted', 'true');
        this.onAccessGranted();
      } else {
        // Wrong password
        errorBox.classList.add('active');
        input.value = '';
        input.focus();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Masuk ke AlurKarya';
      }
    });
  }
}
