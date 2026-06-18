/* ==========================================================================
   FREELANCER PROJECT OS - WORKFLOW DIAGNOSE COMPONENT
   ========================================================================== */

import { getIcon } from '../icons.js';

export class WorkflowDiagnose {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.answers = {
      freelancerType: '',
      activeProjects: '',
      biggestProblem: '',
      currentTool: '',
      workType: ''
    };
  }

  open() {
    this.currentStep = 0;
    this.renderModal();
  }

  renderModal() {
    let overlay = document.getElementById('diagnose-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'diagnose-modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="modal-container" style="max-width: 540px; border-radius: var(--border-radius-lg); overflow: hidden;">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-subtle); padding: 16px 20px;">
          <h3 style="font-size: 1.1rem; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; gap: 8px;">
            🧠 Freelancer Workflow Diagnose
          </h3>
          <button class="modal-close-btn" id="close-diagnose-modal">&times;</button>
        </div>
        <div class="modal-body" style="padding: 24px 24px 20px 24px;" id="diagnose-modal-body-content">
          <!-- Multi-step question content will go here -->
        </div>
      </div>
    `;

    overlay.classList.add('active');

    overlay.querySelector('#close-diagnose-modal').addEventListener('click', () => this.close());
    this.renderStep();
  }

  close() {
    const overlay = document.getElementById('diagnose-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  }

  renderStep() {
    const bodyContent = document.getElementById('diagnose-modal-body-content');
    if (!bodyContent) return;

    if (this.currentStep < 5) {
      this.renderQuestionStep(bodyContent);
    } else {
      this.renderResultStep(bodyContent);
    }
  }

  renderQuestionStep(container) {
    const steps = [
      {
        question: "What type of freelancer are you?",
        key: "freelancerType",
        options: ["Designer", "Copywriter", "Video Editor", "Web Developer", "Social Media Manager", "AI Consultant", "General Freelancer", "Other"]
      },
      {
        question: "How many active projects do you manage right now?",
        key: "activeProjects",
        options: ["0–1", "2–3", "4–6", "7+"]
      },
      {
        question: "What is your biggest workflow problem?",
        key: "biggestProblem",
        options: [
          "Scattered client chats",
          "Missed deadlines",
          "Too many revisions",
          "Late invoices",
          "Unpaid projects",
          "Meeting notes are lost",
          "Final files are messy",
          "Hard to know what to work on next"
        ]
      },
      {
        question: "Where do you currently manage your projects?",
        key: "currentTool",
        options: ["WhatsApp", "Notes app", "Spreadsheet", "Trello / Notion", "Google Drive", "Memory only", "Mixed tools"]
      },
      {
        question: "What kind of work do you usually do?",
        key: "workType",
        options: ["One-time projects", "Monthly retainers", "Mixed work", "Consulting / strategy", "Production work"]
      }
    ];

    const currentQ = steps[this.currentStep];
    const progressPercent = Math.round((this.currentStep / 5) * 100);

    let optionsMarkup = currentQ.options.map(opt => {
      const isSelected = this.answers[currentQ.key] === opt;
      return `
        <button type="button" class="diagnose-option-btn ${isSelected ? 'active' : ''}" data-value="${opt}" style="width: 100%; text-align: left; padding: 12px 16px; margin-bottom: 8px; border: 1px solid var(--border-subtle); border-radius: var(--border-radius-md); background: rgba(255,255,255,0.01); color: var(--text-secondary); font-size: 0.88rem; cursor: pointer; transition: all var(--transition-fast);">
          ${opt}
        </button>
      `;
    }).join('');

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          <span>Step ${this.currentStep + 1} of 5</span>
          <span>${progressPercent}% Complete</span>
        </div>
        <div style="height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
          <div style="width: ${progressPercent}%; height: 100%; background: var(--color-primary); transition: width 0.3s ease;"></div>
        </div>
      </div>

      <h4 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; color: var(--text-primary); font-family: 'Plus Jakarta Sans', sans-serif;">
        ${currentQ.question}
      </h4>

      <div class="diagnose-options-container" style="max-height: 280px; overflow-y: auto; padding-right: 4px;">
        ${optionsMarkup}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
        <button type="button" class="btn btn-secondary" id="diagnose-btn-back" style="padding: 8px 16px; font-size: 0.82rem;" ${this.currentStep === 0 ? 'disabled' : ''}>
          Back
        </button>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary" id="diagnose-btn-skip" style="padding: 8px 16px; font-size: 0.82rem; color: var(--text-muted);">
            Skip
          </button>
          <button type="button" class="btn btn-primary" id="diagnose-btn-next" style="padding: 8px 20px; font-size: 0.82rem;" disabled>
            Next Step
          </button>
        </div>
      </div>
    `;

    // Event Listeners for options
    const optButtons = container.querySelectorAll('.diagnose-option-btn');
    const nextBtn = container.querySelector('#diagnose-btn-next');

    // Enable next if answer exists
    if (this.answers[currentQ.key]) {
      nextBtn.removeAttribute('disabled');
    }

    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        optButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.answers[currentQ.key] = btn.dataset.value;
        nextBtn.removeAttribute('disabled');
      });
    });

    container.querySelector('#diagnose-btn-back').addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.renderStep();
      }
    });

    container.querySelector('#diagnose-btn-skip').addEventListener('click', () => this.close());

    nextBtn.addEventListener('click', () => {
      this.currentStep++;
      this.renderStep();
    });
  }

  renderResultStep(container) {
    const analysis = this.calculateResult();

    // Store in localStorage
    localStorage.setItem('alurkarya_freelancer_type', this.answers.freelancerType);
    localStorage.setItem('alurkarya_workflow_diagnose_result', JSON.stringify({
      freelancerType: this.answers.freelancerType,
      activeProjects: this.answers.activeProjects,
      biggestProblem: this.answers.biggestProblem,
      currentTool: this.answers.currentTool,
      workType: this.answers.workType,
      bottleneck: analysis.bottleneck,
      recommendation: analysis.recommendation,
      template: analysis.template,
      nextAction: analysis.nextAction
    }));

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 10px;">⚡</span>
        <h4 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 6px;">
          Diagnose Completed!
        </h4>
        <p style="font-size: 0.82rem; color: var(--text-muted);">
          We analyzed your work patterns and identified the key area for workflow automation.
        </p>
      </div>

      <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 0.88rem;">
        <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
          <span style="margin-top: 2px;">⚠️</span>
          <div>
            <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Primary Bottleneck:</strong>
            <span style="color: var(--color-warning); font-weight: 600;">${analysis.bottleneck}</span>
          </div>
        </div>

        <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
          <span style="margin-top: 2px;">💡</span>
          <div>
            <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Recommended Strategy:</strong>
            <span style="color: var(--text-secondary); line-height: 1.4;">${analysis.recommendation}</span>
          </div>
        </div>

        <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
          <span style="margin-top: 2px;">🎯</span>
          <div>
            <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Suggested Next Action:</strong>
            <span style="color: var(--text-secondary); line-height: 1.4;">${analysis.nextAction}</span>
          </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 0;">
          <span style="margin-top: 2px;">📁</span>
          <div>
            <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Suggested Template:</strong>
            <span style="color: var(--color-secondary); font-weight: 600;">${analysis.template} Starter Pack</span>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 24px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
        <button type="button" class="btn btn-secondary" id="diagnose-btn-finish-close" style="flex: 1; justify-content: center; font-size: 0.88rem; padding: 10px;">
          Go to Dashboard
        </button>
        <button type="button" class="btn btn-primary" id="diagnose-btn-finish-template" style="flex: 12; justify-content: center; font-size: 0.88rem; padding: 10px; background: var(--color-primary); border-color: rgba(139, 92, 246, 0.25);">
          Load ${analysis.template} Template
        </button>
      </div>
    `;

    container.querySelector('#diagnose-btn-finish-close').addEventListener('click', () => {
      this.close();
      if (this.onComplete) this.onComplete(null);
    });

    container.querySelector('#diagnose-btn-finish-template').addEventListener('click', () => {
      this.close();
      if (this.onComplete) this.onComplete(analysis.template);
    });
  }

  calculateResult() {
    const prob = this.answers.biggestProblem;
    const type = this.answers.freelancerType;

    let bottleneck = "Scattered Workflow";
    let recommendation = "Use central board to track client hand-offs.";
    let template = "General Freelancer";
    let nextAction = "Start by creating a workspace project card.";

    // Map template based on role
    if (["Designer", "Copywriter", "Video Editor", "Web Developer", "Social Media Manager", "AI Consultant"].includes(type)) {
      template = type;
    }

    if (prob === "Scattered client chats") {
      bottleneck = "Scattered Client Interactions";
      recommendation = "Centralize your communications. Log client messaging, WhatsApp updates, and meeting details inside the Client Hub directory.";
      nextAction = "Create client profiles and log follow-up dates in Client Hub.";
    } else if (prob === "Missed deadlines" || prob === "Hard to know what to work on next") {
      bottleneck = "Task Scheduling & Priority Gaps";
      recommendation = "Establish a weekly scheduling focus block. Leverage the Planner Hub calendar view to map project milestones and track timeline buffers.";
      nextAction = "Plan your calendar milestones and set 3 high-priority focus tasks in Weekly Focus.";
    } else if (prob === "Too many revisions") {
      bottleneck = "Revision Scope Creep";
      recommendation = "Implement rigid revision quota parameters. Utilize the Revision & Review tracking section inside the Project details modal to enforce feedback round limits.";
      nextAction = "Use Revision rounds quota limit and update client approval status inside Project detail modal.";
    } else if (prob === "Late invoices" || prob === "Unpaid projects") {
      bottleneck = "Late Payments & Billing Leakage";
      recommendation = "Track invoicing stages dynamically. Use the integrated Waiting Payment and Invoice Sent kanban stages, and log billing records directly inside the Invoice Ledger.";
      nextAction = "Open Invoice & Billing section in Project detail modal, log invoice numbers, and track payment due dates.";
    } else if (prob === "Meeting notes are lost") {
      bottleneck = "Lost Meeting Context";
      recommendation = "Leverage dedicated client memory notebooks. Use the Meeting & Client Notes collapsible sections inside the Project modal to draft agendas and copy AI prompts.";
      nextAction = "Use Meeting & Client Notes collapsible panel inside the Project modal to draft agendas and copy AI meeting summary prompts.";
    } else if (prob === "Final files are messy") {
      bottleneck = "Messy Deliverables Delivery";
      recommendation = "Use checklists to align expectations. Register distinct file attachment items and save final raw design download links directly in the Project details modal.";
      nextAction = "Add deliverables to job checklist and save raw download links inside Project Detail modal.";
    }

    return { bottleneck, recommendation, template, nextAction };
  }
}
