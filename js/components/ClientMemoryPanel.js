/* ==========================================================================
   FREELANCER PROJECT OS - CLIENT MEMORY EDIT PANEL (OVERLAY MODAL)
   ========================================================================== */

import { getIcon } from '../icons.js';
import { promptTemplates, copyPromptToClipboard } from './AIPromptHelpers.js';
import { getLanguage } from '../i18n.js';

export class ClientMemoryPanel {
  /**
   * Opens the Client Memory editing panel overlay
   * @param {string} clientId - The ID of the client
   * @param {object} store - Unified data store reference
   * @param {function} onTriggerToast - Notify users
   * @param {function} onSaveCallback - Refresh parent views after save
   */
  static open(clientId, store, onTriggerToast, onSaveCallback = null) {
    const state = store.getState();
    const client = state.clients.find(c => c.id === clientId);
    if (!client) {
      if (onTriggerToast) onTriggerToast('Client not found.', 'text-danger');
      return;
    }

    // Ensure memory structure exists
    const memory = client.clientMemory || {
      communicationStyle: '',
      preferredChannel: '',
      preferredUpdateFrequency: '',
      decisionMaker: '',
      approvalStyle: '',
      revisionPattern: '',
      paymentBehavior: '',
      paymentReminderStyle: '',
      deliveryPreference: '',
      filePreference: '',
      tonePreference: '',
      importantNotes: '',
      clientRiskNotes: '',
      lastProjectSummary: '',
      lastMeetingSummary: '',
      relationshipStatus: '',
      clientVisibleNotes: '',
      shareDeliveryPref: false
    };

    // Inject Panel CSS styles dynamically if not already injected
    if (!document.getElementById('client-memory-panel-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'client-memory-panel-styles';
      styleEl.textContent = `
        .memory-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 10, 12, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 1100;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          padding: 16px;
        }
        .memory-modal-overlay.active {
          opacity: 1;
        }
        .memory-modal-container {
          background: rgba(25, 25, 30, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          width: 100%;
          max-width: 820px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: memoryModalSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes memoryModalSlide {
          from { transform: translateY(20px) scale(0.98); }
          to { transform: translateY(0) scale(1); }
        }
        .memory-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .memory-modal-header h3 {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .memory-modal-close {
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          font-size: 1.5rem; cursor: pointer;
          transition: color 0.15s ease;
        }
        .memory-modal-close:hover {
          color: #fff;
        }
        .memory-tabs-nav {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .memory-tabs-nav::-webkit-scrollbar {
          display: none;
        }
        .memory-tab-btn {
          background: none; border: none;
          padding: 12px 18px;
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem; font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .memory-tab-btn:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.01);
        }
        .memory-tab-btn.active {
          color: #a78bfa;
          border-bottom-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }
        .memory-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        .memory-tab-pane {
          display: none;
          flex-direction: column;
          gap: 16px;
        }
        .memory-tab-pane.active {
          display: flex;
        }
        .memory-section-card {
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 8px;
          padding: 16px;
        }
        .memory-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .memory-grid-2 {
            grid-template-columns: 1fr;
          }
        }
        .memory-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(15, 15, 18, 0.4);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .memory-actions-left {
          display: flex;
          gap: 8px;
        }
        .memory-actions-right {
          display: flex;
          gap: 8px;
        }
      `;
      document.head.appendChild(styleEl);
    }

    let overlay = document.createElement('div');
    overlay.className = 'memory-modal-overlay';
    overlay.id = 'client-memory-panel-modal';
    
    overlay.innerHTML = `
      <div class="memory-modal-container">
        <div class="memory-modal-header">
          <h3>🧠 Client Memory: ${client.name} ${client.businessName ? `(${client.businessName})` : ''}</h3>
          <button class="memory-modal-close" id="btn-close-memory-x">&times;</button>
        </div>
        
        <div class="memory-tabs-nav" id="memory-tabs-nav-bar">
          <button class="memory-tab-btn active" data-tab="comm">💬 Communication</button>
          <button class="memory-tab-btn" data-tab="revision">🔄 Review & Revision</button>
          <button class="memory-tab-btn" data-tab="payment">💳 Payment Behavior</button>
          <button class="memory-tab-btn" data-tab="delivery">📦 Delivery Preference</button>
          <button class="memory-tab-btn" data-tab="relationship">🤝 Relationship Notes</button>
          <button class="memory-tab-btn" data-tab="clientfacing">👁️ Client-Facing Notes</button>
        </div>
        
        <div class="memory-modal-body">
          <form id="client-memory-panel-form">
            
            <!-- SECTION 1: Communication -->
            <div class="memory-tab-pane active" id="pane-comm">
              <div class="memory-section-card">
                <div class="memory-grid-2">
                  <div class="form-group">
                    <label for="mem-pref-channel">Preferred Channel</label>
                    <select id="mem-pref-channel" class="form-control">
                      <option value="" ${memory.preferredChannel === '' ? 'selected' : ''}>-- Select --</option>
                      <option value="WhatsApp" ${memory.preferredChannel === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                      <option value="Email" ${memory.preferredChannel === 'Email' ? 'selected' : ''}>Email</option>
                      <option value="Slack" ${memory.preferredChannel === 'Slack' ? 'selected' : ''}>Slack</option>
                      <option value="Zoom" ${memory.preferredChannel === 'Zoom' ? 'selected' : ''}>Zoom</option>
                      <option value="Google Meet" ${memory.preferredChannel === 'Google Meet' ? 'selected' : ''}>Google Meet</option>
                      <option value="Call" ${memory.preferredChannel === 'Call' ? 'selected' : ''}>Direct Call</option>
                      <option value="Other" ${memory.preferredChannel === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="mem-pref-freq">Update Frequency</label>
                    <select id="mem-pref-freq" class="form-control">
                      <option value="" ${memory.preferredUpdateFrequency === '' ? 'selected' : ''}>-- Select --</option>
                      <option value="Daily" ${memory.preferredUpdateFrequency === 'Daily' ? 'selected' : ''}>Daily</option>
                      <option value="Weekly" ${memory.preferredUpdateFrequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                      <option value="Bi-weekly" ${memory.preferredUpdateFrequency === 'Bi-weekly' ? 'selected' : ''}>Bi-weekly</option>
                      <option value="Milestones" ${memory.preferredUpdateFrequency === 'Milestones' ? 'selected' : ''}>Milestones Only</option>
                      <option value="As needed" ${memory.preferredUpdateFrequency === 'As needed' ? 'selected' : ''}>As Needed</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-tone">Tone Preference</label>
                  <input type="text" id="mem-tone" class="form-control" value="${memory.tonePreference || ''}" placeholder="e.g. Formal, brief, casual updates, data-driven...">
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-maker">Decision Maker</label>
                  <input type="text" id="mem-maker" class="form-control" value="${memory.decisionMaker || ''}" placeholder="Name of primary approver / stakeholder...">
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-comm-style">Communication Notes</label>
                  <textarea id="mem-comm-style" class="form-control" style="min-height: 80px;" placeholder="Communication patterns, response times, best hour to ping...">${memory.communicationStyle || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 2: Review & Revision -->
            <div class="memory-tab-pane" id="pane-revision">
              <div class="memory-section-card">
                <div class="form-group">
                  <label for="mem-app-style">Approval Style</label>
                  <input type="text" id="mem-app-style" class="form-control" value="${memory.approvalStyle || ''}" placeholder="e.g. Explicit email OK, verbal signoff, needs PDF review form...">
                </div>
                
                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-rev-pattern">Revision Pattern</label>
                  <textarea id="mem-rev-pattern" class="form-control" style="min-height: 80px;" placeholder="Expected feedback style (e.g., detail-oriented, requests layout changes late, minimal edits needed)...">${memory.revisionPattern || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-feedback-notes">Common Feedback Notes</label>
                  <textarea id="mem-feedback-notes" class="form-control" style="min-height: 70px;" placeholder="Recurring feedback patterns or preferences (e.g. Dislikes pastel colors, always wants larger text)...">${memory.commonFeedbackNotes || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-rev-boundary">Revision Boundary Notes</label>
                  <textarea id="mem-rev-boundary" class="form-control" style="min-height: 70px;" placeholder="Notes on scope limits and how client responds to extra revision pricing...">${memory.revisionBoundaryNotes || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 3: Payment Behavior -->
            <div class="memory-tab-pane" id="pane-payment">
              <div class="memory-section-card">
                <div class="memory-grid-2">
                  <div class="form-group">
                    <label for="mem-pay-reminder">Payment Reminder Style</label>
                    <select id="mem-pay-reminder" class="form-control">
                      <option value="" ${memory.paymentReminderStyle === '' ? 'selected' : ''}>-- Select --</option>
                      <option value="Soft reminder" ${memory.paymentReminderStyle === 'Soft reminder' ? 'selected' : ''}>Soft Reminder</option>
                      <option value="Direct reminder" ${memory.paymentReminderStyle === 'Direct reminder' ? 'selected' : ''}>Direct / Standard</option>
                      <option value="Firm reminder" ${memory.paymentReminderStyle === 'Firm reminder' ? 'selected' : ''}>Firm / Legal Focus</option>
                      <option value="No reminders" ${memory.paymentReminderStyle === 'No reminders' ? 'selected' : ''}>Wait for Due Date</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label for="mem-pay-timing">Usual Payment Timing</label>
                    <input type="text" id="mem-pay-timing" class="form-control" value="${memory.usualPaymentTiming || ''}" placeholder="e.g. Net 15, same day, 1 week late...">
                  </div>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-pay-behavior">Payment Behavior Summary</label>
                  <textarea id="mem-pay-behavior" class="form-control" style="min-height: 80px;" placeholder="e.g. Requires follow-up, fast payer, ignores first invoice but pays on reminder...">${memory.paymentBehavior || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-pay-notes">Internal Payment Notes</label>
                  <textarea id="mem-pay-notes" class="form-control" style="min-height: 80px;" placeholder="Bank preferences, specific tax numbers, invoice processing delays context...">${memory.paymentNotes || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 4: Delivery Preference -->
            <div class="memory-tab-pane" id="pane-delivery">
              <div class="memory-section-card">
                <div class="memory-grid-2">
                  <div class="form-group">
                    <label for="mem-file-pref">File Format Preference</label>
                    <input type="text" id="mem-file-pref" class="form-control" value="${memory.filePreference || ''}" placeholder="e.g. Figma source, SVG, MP4, PDF print-ready...">
                  </div>
                  
                  <div class="form-group">
                    <label for="mem-folder-pref">Preferred Folder / Sharing Method</label>
                    <input type="text" id="mem-folder-pref" class="form-control" value="${memory.folderLinkMethod || ''}" placeholder="e.g. Google Drive link, GitHub PR, WeTransfer...">
                  </div>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-del-pref">Delivery Style Notes</label>
                  <textarea id="mem-del-pref" class="form-control" style="min-height: 80px;" placeholder="Detailed handover delivery preferences...">${memory.deliveryPreference || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-handover">Handover Notes / Preferences</label>
                  <textarea id="mem-handover" class="form-control" style="min-height: 80px;" placeholder="e.g. Needs walkthrough loom video, requires live server deploy...">${memory.handoverPreference || ''}</textarea>
                </div>

                <div style="margin-top: 16px; display: flex; align-items: center; gap: 8px; background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.1); border-radius: 6px; padding: 12px;">
                  <input type="checkbox" id="mem-share-delivery" style="cursor: pointer; width: 16px; height: 16px;" ${memory.shareDeliveryPref ? 'checked' : ''}>
                  <label for="mem-share-delivery" style="margin: 0; font-size: 0.76rem; color: var(--text-secondary); cursor: pointer; font-weight: 500;">
                    🔓 Expose delivery preferences in Client Workspace Portal (marked client-facing)
                  </label>
                </div>
              </div>
            </div>

            <!-- SECTION 5: Relationship Notes -->
            <div class="memory-tab-pane" id="pane-relationship">
              <div class="memory-section-card">
                <div class="form-group">
                  <label for="mem-rel-status">Relationship Status</label>
                  <select id="mem-rel-status" class="form-control">
                    <option value="" ${memory.relationshipStatus === '' ? 'selected' : ''}>-- Select --</option>
                    <option value="New Client" ${memory.relationshipStatus === 'New Client' ? 'selected' : ''}>New Client</option>
                    <option value="Active Client" ${memory.relationshipStatus === 'Active Client' ? 'selected' : ''}>Active Client</option>
                    <option value="Repeat Client" ${memory.relationshipStatus === 'Repeat Client' ? 'selected' : ''}>Repeat Client</option>
                    <option value="VIP Client" ${memory.relationshipStatus === 'VIP Client' ? 'selected' : ''}>VIP Client</option>
                    <option value="At Risk" ${memory.relationshipStatus === 'At Risk' ? 'selected' : ''}>At Risk</option>
                    <option value="Dormant" ${memory.relationshipStatus === 'Dormant' ? 'selected' : ''}>Dormant</option>
                  </select>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-risk-notes">Client Risk Notes</label>
                  <textarea id="mem-risk-notes" class="form-control" style="min-height: 70px;" placeholder="Scope creep pattern, delayed reviews, late replies...">${memory.clientRiskNotes || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-notes">Important Relationship Notes</label>
                  <textarea id="mem-notes" class="form-control" style="min-height: 80px;" placeholder="Personal context, how we met, references to check...">${memory.importantNotes || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-last-proj">Last Project Summary</label>
                  <textarea id="mem-last-proj" class="form-control" style="min-height: 60px;" placeholder="e.g. Standard website. Completed on time, budget expanded.">${memory.lastProjectSummary || ''}</textarea>
                </div>

                <div class="form-group" style="margin-top: 14px;">
                  <label for="mem-last-meet">Last Meeting Summary</label>
                  <textarea id="mem-last-meet" class="form-control" style="min-height: 60px;" placeholder="Notes from latest contact, follow-ups, calls...">${memory.lastMeetingSummary || ''}</textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 6: Client-Facing Notes -->
            <div class="memory-tab-pane" id="pane-clientfacing">
              <div class="memory-section-card" style="border: 1px solid rgba(59, 130, 246, 0.25); background: rgba(59, 130, 246, 0.03);">
                <div style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 0.72rem; line-height: 1.4; color: #60a5fa; font-weight: 500;">
                  <span style="font-size: 1.15rem; line-height: 1;">💡</span>
                  <span><strong>Only client-facing notes may appear in the Client Workspace Portal.</strong> All other sections and internal memory fields stay strictly private to you.</span>
                </div>
                
                <div class="form-group">
                  <label for="mem-client-visible">Client Visible Notes</label>
                  <textarea id="mem-client-visible" class="form-control" style="min-height: 180px;" placeholder="Add custom updates, helpful messages, onboarding steps, or notes that you WANT the client to see on their portal...">${memory.clientVisibleNotes || ''}</textarea>
                </div>
              </div>
            </div>

          </form>
        </div>
        
        <div class="memory-modal-footer">
          <div class="memory-actions-left" style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-memory-summary" style="display: inline-flex; align-items: center; gap: 4px;">
              ${getIcon('copy', '', 12)} Copy Summary
            </button>
            <button type="button" class="btn btn-secondary btn-sm text-danger" id="btn-clear-memory-unsaved" style="display: inline-flex; align-items: center; gap: 4px;">
              ${getIcon('trash', '', 12)} Clear Unsaved
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-memory-extract-prompt" style="display: inline-flex; align-items: center; gap: 4px;">
              🤖 Copy Client Memory Extraction Prompt
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-relationship-prompt" style="display: inline-flex; align-items: center; gap: 4px;">
              🤖 Copy Client Relationship Summary
            </button>
          </div>
          
          <div class="memory-actions-right">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-close-memory-panel">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-save-memory-panel" style="background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
              Save Client Memory
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Active state trigger
    setTimeout(() => overlay.classList.add('active'), 50);

    const closeOverlay = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 250);
    };

    // Tab Navigation Logic
    const tabButtons = overlay.querySelectorAll('.memory-tab-btn');
    const tabPanes = overlay.querySelectorAll('.memory-tab-pane');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === `pane-${targetTab}`) {
            pane.classList.add('active');
          }
        });
      });
    });

    // Event Wireups
    overlay.querySelector('#btn-close-memory-x').addEventListener('click', closeOverlay);
    overlay.querySelector('#btn-close-memory-panel').addEventListener('click', closeOverlay);

    // Form inputs recovery helper
    const getFormValues = () => {
      const getVal = (id, fallback = '') => {
        const el = overlay.querySelector(id);
        return el ? el.value.trim() : fallback;
      };
      const getCheck = (id) => {
        const el = overlay.querySelector(id);
        return el ? el.checked : false;
      };

      return {
        communicationStyle: getVal('#mem-comm-style'),
        preferredChannel: getVal('#mem-pref-channel'),
        preferredUpdateFrequency: getVal('#mem-pref-freq'),
        decisionMaker: getVal('#mem-maker'),
        approvalStyle: getFormValEx('#mem-app-style'),
        revisionPattern: getVal('#mem-rev-pattern'),
        paymentBehavior: getVal('#mem-pay-behavior'),
        paymentReminderStyle: getVal('#mem-pay-reminder'),
        deliveryPreference: getVal('#mem-del-pref'),
        filePreference: getVal('#mem-file-pref'),
        tonePreference: getVal('#mem-tone'),
        importantNotes: getVal('#mem-notes'),
        clientRiskNotes: getVal('#mem-risk-notes'),
        lastProjectSummary: getVal('#mem-last-proj'),
        lastMeetingSummary: getVal('#mem-last-meet'),
        relationshipStatus: getVal('#mem-rel-status'),
        clientVisibleNotes: getVal('#mem-client-visible'),
        shareDeliveryPref: getCheck('#mem-share-delivery'),
        
        // Expose other fields to avoid loss
        commonFeedbackNotes: getVal('#mem-feedback-notes'),
        revisionBoundaryNotes: getVal('#mem-rev-boundary'),
        usualPaymentTiming: getVal('#mem-pay-timing'),
        paymentNotes: getVal('#mem-pay-notes'),
        folderLinkMethod: getVal('#mem-folder-pref'),
        handoverPreference: getVal('#mem-handover')
      };
    };

    function getFormValEx(id) {
      const el = overlay.querySelector(id);
      return el ? el.value.trim() : '';
    }

    // Save Client Memory
    overlay.querySelector('#btn-save-memory-panel').addEventListener('click', () => {
      const memoryFields = getFormValues();
      
      store.updateClient(client.id, {
        clientMemory: memoryFields
      });

      if (onTriggerToast) {
        onTriggerToast('Client memory updated.', 'text-success');
      }

      if (onSaveCallback) {
        onSaveCallback();
      }

      closeOverlay();
    });

    // Clear Unsaved Changes
    overlay.querySelector('#btn-clear-memory-unsaved').addEventListener('click', () => {
      if (confirm('Revert all fields to last saved memory? All unsaved inputs will be lost.')) {
        // Reload values
        const setVal = (id, val) => {
          const el = overlay.querySelector(id);
          if (el) el.value = val || '';
        };
        const setCheck = (id, val) => {
          const el = overlay.querySelector(id);
          if (el) el.checked = !!val;
        };

        setVal('#mem-comm-style', memory.communicationStyle);
        setVal('#mem-pref-channel', memory.preferredChannel);
        setVal('#mem-pref-freq', memory.preferredUpdateFrequency);
        setVal('#mem-maker', memory.decisionMaker);
        setVal('#mem-app-style', memory.approvalStyle);
        setVal('#mem-rev-pattern', memory.revisionPattern);
        setVal('#mem-pay-behavior', memory.paymentBehavior);
        setVal('#mem-pay-reminder', memory.paymentReminderStyle);
        setVal('#mem-del-pref', memory.deliveryPreference);
        setVal('#mem-file-pref', memory.filePreference);
        setVal('#mem-tone', memory.tonePreference);
        setVal('#mem-notes', memory.importantNotes);
        setVal('#mem-risk-notes', memory.clientRiskNotes);
        setVal('#mem-last-proj', memory.lastProjectSummary);
        setVal('#mem-last-meet', memory.lastMeetingSummary);
        setVal('#mem-rel-status', memory.relationshipStatus);
        setVal('#mem-client-visible', memory.clientVisibleNotes);
        setCheck('#mem-share-delivery', memory.shareDeliveryPref);

        setVal('#mem-feedback-notes', memory.commonFeedbackNotes);
        setVal('#mem-rev-boundary', memory.revisionBoundaryNotes);
        setVal('#mem-pay-timing', memory.usualPaymentTiming);
        setVal('#mem-pay-notes', memory.paymentNotes);
        setVal('#mem-folder-pref', memory.folderLinkMethod);
        setVal('#mem-handover', memory.handoverPreference);
        
        if (onTriggerToast) onTriggerToast('Form fields reset.', 'text-muted');
      }
    });

    // Copy Client Summary
    overlay.querySelector('#btn-copy-memory-summary').addEventListener('click', () => {
      const fields = getFormValues();
      
      // Look up client projects to find relationship/next action notes
      const clientProjects = store.getState().projects.filter(p => p.clientId === client.id);
      const nextActions = clientProjects.map(p => p.nextAction).filter(Boolean);
      const nextActionStr = nextActions.length > 0 ? nextActions[0] : 'None';

      const summaryText = `Internal summary — not for client.
Client: ${client.name}
Preferred Channel: ${fields.preferredChannel || 'Not set'}
Communication Style: ${fields.communicationStyle || 'Not set'}
Revision Pattern: ${fields.revisionPattern || 'Not set'}
Payment Behavior: ${fields.paymentBehavior || 'Not set'}
Delivery Preference: ${fields.deliveryPreference || 'Not set'}
Important Notes: ${fields.importantNotes || 'None'}
Recommended Next Action: ${nextActionStr}`;

      navigator.clipboard.writeText(summaryText)
        .then(() => {
          if (onTriggerToast) onTriggerToast('Client memory prompt copied.', 'text-success');
        })
        .catch(err => {
          console.error('Failed to copy memory summary to clipboard', err);
          if (onTriggerToast) onTriggerToast('Failed to copy summary to clipboard.', 'text-danger');
        });
    });

    // Extract Client Memory Prompt from Notes
    const extractPromptBtn = overlay.querySelector('#btn-memory-extract-prompt');
    if (extractPromptBtn) {
      extractPromptBtn.addEventListener('click', () => {
        const state = store.getState();
        const clientProjects = state.projects.filter(p => p.clientId === client.id);
        const project = clientProjects.length > 0 ? clientProjects[0] : { clientName: client.name };
        const flProfile = state.freelancerProfile;
        const lang = getLanguage();
        
        const text = promptTemplates.clientMemoryExtraction.generate(project, client.clientMemory, 'Professional', flProfile, lang);
        copyPromptToClipboard(text, onTriggerToast, 'clientMemoryExtraction', project.id || 'none');
      });
    }

    // Relationship Prompt
    const relationshipPromptBtn = overlay.querySelector('#btn-relationship-prompt');
    if (relationshipPromptBtn) {
      relationshipPromptBtn.addEventListener('click', () => {
        const state = store.getState();
        const clientProjects = state.projects.filter(p => p.clientId === client.id);
        const project = clientProjects.length > 0 ? clientProjects[0] : { clientName: client.name };
        const flProfile = state.freelancerProfile;
        const lang = getLanguage();
        
        const text = promptTemplates.clientRelationshipSummary.generate(project, client.clientMemory, 'Professional', flProfile, lang);
        copyPromptToClipboard(text, onTriggerToast, 'clientRelationshipSummary', project.id || 'none');
      });
    }
  }
}
