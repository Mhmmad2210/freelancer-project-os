import { WorkspaceStore } from './store.js';

// Setup workspace session from window.opener if missing in current tab
const currentActive = sessionStorage.getItem('alurkarya_active_workspace_id');
if (!currentActive) {
  // Check URL params first (safer fallback if opener is isolated)
  const urlParams = new URLSearchParams(window.location.search);
  const wsParam = urlParams.get('workspace_id');
  if (wsParam) {
    sessionStorage.setItem('alurkarya_active_workspace_id', wsParam);
    if (urlParams.get('session_unlocked') === 'true') {
      sessionStorage.setItem('alurkarya_session_unlocked', 'true');
    }
  } else if (window.opener && !window.opener.closed) {
    try {
      const openerActive = window.opener.sessionStorage.getItem('alurkarya_active_workspace_id');
      if (openerActive) {
        sessionStorage.setItem('alurkarya_active_workspace_id', openerActive);
        const openerUnlocked = window.opener.sessionStorage.getItem('alurkarya_session_unlocked');
        if (openerUnlocked) {
          sessionStorage.setItem('alurkarya_session_unlocked', openerUnlocked);
        }
      }
    } catch (e) {
      console.warn("Could not copy sessionStorage from opener:", e);
    }
  }
}

window.alurpanduUiVersion = 'alurpandu-i18n-v2';

// Instantiate storage store
const store = new WorkspaceStore();

// --- Mobile Sidebar Toggle ---
const sidebar = document.getElementById('app-sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
  });
  
  // Close sidebar if clicking outside of it on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && !sidebar.contains(e.target) && e.target !== toggleBtn) {
      sidebar.classList.remove('active');
    }
  });
}

// --- Active Sidebar Indicator via Scroll & IntersectionObserver ---
const sections = document.querySelectorAll('.section-anchor');
const menuItems = document.querySelectorAll('.menu-item');
const scrollContainer = document.getElementById('content-scrollable');

// Smooth Scroll Helper
function scrollToSection(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // On mobile, close sidebar after clicking
  if (window.innerWidth <= 1024 && sidebar) {
    sidebar.classList.remove('active');
  }
}

// Attach click events to sidebar buttons
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetSelector = item.getAttribute('data-target');
    scrollToSection(targetSelector);
  });
});

// Observer setup for active menu state highlighting
const observerOptions = {
  root: scrollContainer,
  rootMargin: '-20px 0px -60% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      menuItems.forEach(item => {
        if (item.getAttribute('data-target') === `#${id}`) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// --- Interactive Audit Workflow ---
const auditStates = [null, null, null, null, null];

function selectAudit(cardIdx, choice) {
  const cards = document.querySelectorAll('.audit-grid .audit-card');
  const targetCard = cards[cardIdx];
  if (!targetCard) return;

  const buttons = targetCard.querySelectorAll('.audit-btn');
  
  // Reset active states
  buttons.forEach(btn => {
    btn.classList.remove('active-ya', 'active-tidak');
  });

  if (choice === 'ya') {
    buttons[0].classList.add('active-ya');
    auditStates[cardIdx] = true;
  } else {
    buttons[1].classList.add('active-tidak');
    auditStates[cardIdx] = false;
  }

  // Check if all questions are answered
  const answeredCount = auditStates.filter(s => s !== null).length;
  if (answeredCount === 5) {
    const diagnosisPanel = document.getElementById('diagnosis-result');
    if (diagnosisPanel) {
      diagnosisPanel.classList.add('visible');
    }
    updateDiagnosisOutcomeUI();
    
    // Auto scroll to diagnosis outcome if visible
    setTimeout(() => {
      const diagnosisPanel = document.getElementById('diagnosis-result');
      if (diagnosisPanel) {
        diagnosisPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
}

function updateDiagnosisOutcomeUI() {
  const answeredCount = auditStates.filter(s => s !== null).length;
  if (answeredCount === 5) {
    const diagnosisText = document.getElementById('diagnosis-text');
    if (!diagnosisText) return;

    const notReadyCount = auditStates.filter(s => s === false).length;
    if (notReadyCount > 0) {
      const tpl = t('diagnosis_result_unprepared');
      diagnosisText.textContent = tpl.replace('{count}', notReadyCount);
    } else {
      diagnosisText.textContent = t('diagnosis_result_prepared');
    }
  }
}

// --- Setup Checklist LocalStorage Persistence ---
const CHECKLIST_KEY = 'alurpandu_setup_checklist';
const checklistItems = document.querySelectorAll('.checklist-items-grid .checklist-item');
let checklistStates = Array(12).fill(false);

function loadChecklist() {
  try {
    const stored = localStorage.getItem(CHECKLIST_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      for (let i = 0; i < checklistStates.length; i++) {
        if (parsed[i] !== undefined) {
          checklistStates[i] = parsed[i];
        }
      }
    }
  } catch (e) {
    console.error("Failed to read localStorage checklist:", e);
  }
  
  // Auto-check based on active workspace data
  const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
  if (activeWorkspaceId) {
    // 1. Create / select Personal Workspace
    checklistStates[0] = true;
    
    // 2. Add optional Workspace PIN (check PIN hash)
    try {
      const workspaces = store.getWorkspaces() || [];
      const currentWs = workspaces.find(w => w.workspaceId === activeWorkspaceId);
      if (currentWs && currentWs.workspacePinHash) {
        checklistStates[1] = true;
      }
    } catch(e) {}

    // 3. Complete Freelancer Profile
    try {
      const profile = store.freelancerProfile;
      if (profile && profile.freelancerName && profile.freelancerName.trim()) {
        checklistStates[2] = true;
      }
    } catch(e) {}
    
    // 4. Create First Project & Add Client
    try {
      const stateProjects = store.projects || [];
      const stateClients = store.clients || [];
      
      if (stateProjects.length > 0) {
        checklistStates[3] = true;
      }
      if (stateClients.length > 0) {
        checklistStates[4] = true;
      }
      
      if (stateProjects.length > 0) {
        // 5. Set Project Stage
        if (stateProjects.some(p => p.stage && p.stage !== 'new_lead')) {
          checklistStates[5] = true;
        }
        // 6. Add Next Action
        if (stateProjects.some(p => p.nextAction && p.nextAction.trim())) {
          checklistStates[6] = true;
        }
        // 7. Add Deadline
        if (stateProjects.some(p => p.dueDate && p.dueDate.trim())) {
          checklistStates[7] = true;
        }
        // 8. Save Review / Delivery Links
        if (stateProjects.some(p => p.previewLink || p.reviewLink || p.finalFileLink || p.deliveryLink)) {
          checklistStates[8] = true;
        }
      }
    } catch(e) {}

    // 9. Export First Backup
    try {
      const workspaces = store.getWorkspaces() || [];
      const currentWs = workspaces.find(w => w.workspaceId === activeWorkspaceId);
      if ((currentWs && currentWs.lastBackupAt) || localStorage.getItem('alurkarya_backup_exported') === 'true') {
        checklistStates[9] = true;
      }
    } catch(e) {}

    // 10. Check Client Dashboard (Auto-checked if at least one project has links)
    try {
      const stateProjects = store.projects || [];
      if (stateProjects.some(p => p.previewLink || p.reviewLink || p.finalFileLink || p.deliveryLink || p.sourceFileLink || p.stagingLink || p.briefLink || p.fileFolderLink)) {
        checklistStates[10] = true;
      }
    } catch(e) {}

    // 11. Prepare First Client Update (Auto-checked if workspace safety is acknowledged)
    const safetyAck = localStorage.getItem('workspaceSafetyAcknowledged') === 'true' || 
                      localStorage.getItem('alurkarya_workspace_safety_acknowledged') === 'true';
    if (safetyAck) {
      checklistStates[11] = true;
    }
  }
  
  updateChecklistUI();
}

function toggleChecklist(index) {
  checklistStates[index] = !checklistStates[index];
  saveChecklist();
  updateChecklistUI();
}

function saveChecklist() {
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checklistStates));
  } catch (e) {
    console.error("Failed to save localStorage checklist:", e);
  }
}

function updateChecklistUI() {
  let checkedCount = 0;
  const items = document.querySelectorAll('.checklist-items-grid .checklist-item');
  items.forEach((item, idx) => {
    if (checklistStates[idx]) {
      item.classList.add('checked');
      checkedCount++;
    } else {
      item.classList.remove('checked');
    }
  });

  // Update counter and progress bar
  const counterText = document.getElementById('checklist-counter');
  const progressBar = document.getElementById('checklist-progress-bar');
  
  const lang = getLanguage();
  if (counterText) {
    if (lang === 'id') {
      counterText.textContent = `${checkedCount}/${checklistStates.length} langkah selesai`;
    } else {
      counterText.textContent = `${checkedCount}/${checklistStates.length} steps completed`;
    }
  }
  if (progressBar) {
    const pct = (checkedCount / checklistStates.length) * 100;
    progressBar.style.width = `${pct}%`;
  }
}

function resetChecklist() {
  checklistStates = Array(12).fill(false);
  saveChecklist();
  updateChecklistUI();
  
  const lang = getLanguage();
  const toastMsg = lang === 'id' ? "Progres checklist berhasil direset." : "Checklist progress has been reset.";
  showToast(toastMsg);
}

// --- Global Bilingual System (i18n) ---
const translations = {
  en: {
    app_title: "AlurKarya Onboarding Guide",
    nav_title: "AlurPandu Onboarding",
    sidebar_tagline: "A guided setup for managing freelance projects from client to paid.",
    crumb_workspace: "AlurKarya Workspace",
    crumb_start: "Start Here",
    header_badge: "Guided Start Ready",
    menu_start: "Start Here",
    menu_audit: "Workflow Audit",
    menu_safety: "Workspace & Files",
    menu_workspace_file: "Workspace & Files",
    menu_setup: "Workspace Setup",
    menu_flow: "Main Workflow",
    menu_template: "Choose Template",
    menu_client_portal: "Client Portal Guide",
    menu_portal: "Client Portal Guide",
    menu_delivery: "Delivery Checklist",
    menu_invoice: "Invoice Workflow",
    menu_scripts: "Client Scripts",
    menu_help: "Help",
    lang_label: "Language",
    
    welcome_title: "Welcome to AlurPandu",
    welcome_subtitle: "Your step-by-step assistant to set up a clean, structured freelance operation workspace in AlurKarya.",
    welcome_lead: "AlurPandu helps you organize projects, set clear client terms, automate delivery checklists, and track invoices in one clean dashboard. Follow this structured 15-minute setup to get started.",
    welcome_text: "Do not start from a blank dashboard. Use AlurPandu to set up AlurKarya step by step, from your active project to your first client update.",
    welcome_setup_btn: "Start Setup",
    welcome_audit_btn: "Check Workflow First",
    header_setup_btn: "Start Setup",
    
    start_title: "Start Here",
    start_headline: "Start from an active project, not an empty system.",
    start_desc: "Choose one active client project. Then fill in the client, stage, next action, deadline, review, invoice, and delivery details step by step. This helps you understand the AlurKarya workflow without feeling overwhelmed.",
    start_cta: "Create Project Now",
    
    template_title: "Choose Template",
    template_headline: "Choose a template that matches your workflow",
    template_desc: "Use recommended checklists and important links based on your freelance role.",
    
    audit_section_title: "Is your workflow clear?",
    audit_title: "Is your workflow clear?",
    audit_subtitle: "Answer these 5 quick questions to see whether your freelance workflow is clear or still scattered.",
    audit_headline: "Try answering without opening old chats",
    audit_desc: "Answer these 5 quick questions to see whether your freelance workflow is clear or still scattered.",
    audit_num_1: "Question 1",
    audit_q1: "Where do you track your projects?",
    audit_btn_ya_1: "Know for Sure",
    audit_btn_tidak_1: "Search Chat First",
    audit_num_2: "Question 2",
    audit_q2: "Which client is waiting for review?",
    audit_btn_ya_2: "Know by Heart",
    audit_btn_tidak_2: "Need to Check Notes",
    audit_num_3: "Question 3",
    audit_q3: "Which revision is still unfinished?",
    audit_btn_ya_3: "Already Logged",
    audit_btn_tidak_3: "Scroll WA Group",
    audit_num_4: "Question 4",
    audit_q4: "Which invoice has not been paid?",
    audit_btn_ya_4: "Have a Recap",
    audit_btn_tidak_4: "Check M-Banking",
    audit_num_5: "Question 5",
    audit_q5: "Which final file has not been delivered yet?",
    audit_btn_ya_5: "Drive Link Ready",
    audit_btn_tidak_5: "Forgot if Sent",
    diagnosis_title_text: "Workflow Audit Result",
    
    setup_title: "Workspace Setup",
    setup_reset_btn: "Reset Progress",
    setup_headline: "First setup in 15 minutes",
    setup_subtitle: "Complete the following basic steps to activate your AlurKarya workspace:",
    setup_progress_title: "Setup Progress",
    
    // New 12-item checklist keys
    setup_item_0: "Create / select Personal Workspace",
    setup_item_1: "Add optional Workspace PIN",
    setup_item_2: "Complete Freelancer Profile",
    setup_item_3: "Create First Project",
    setup_item_4: "Add Client",
    setup_item_5: "Set Project Stage",
    setup_item_6: "Add Next Action",
    setup_item_7: "Add Deadline",
    setup_item_8: "Save Review / Delivery Links",
    setup_item_9: "Export First Backup",
    setup_item_10: "Check Client Dashboard",
    setup_item_11: "Prepare First Client Update",
    
    // Workspace Safety Section
    menu_safety: "Workspace & Files",
    safety_title: "Workspace & File Safety",
    safety_headline: "Start with a Personal Workspace",
    safety_body: "You are not creating a cloud account yet. You are creating a Personal Workspace in this browser. This workspace stores your projects, clients, invoices, payments, and delivery links locally. It can have a PIN, be locked, switched, and backed up.",
    safety_note: "Your actual files stay in Google Drive, Figma, Canva, Dropbox, or your preferred platform. AlurKarya only stores links to help manage review, delivery, invoice, and payment flow. File security follows the permissions set on the original platform.",
    safety_step1_title: "Create Personal Workspace",
    safety_step1_body: "Use a separate workspace so your project and client data does not mix with other users on the same laptop.",
    safety_step1_cta: "Create / Select Workspace",
    safety_step2_title: "Add PIN & Lock Workspace",
    safety_step2_body: "A PIN helps protect casual access in this browser. When finished, use Lock Workspace.",
    safety_step2_cta: "Lock Workspace",
    safety_step3_title: "Export Backup Regularly",
    safety_step3_body: "Workspace data is stored in this browser. Use Export Backup so your data can be restored or moved to another device.",
    safety_step3_cta: "Export Backup",
    safety_step4_title: "Set Original File Permissions",
    safety_step4_body: "Keep actual files in Drive, Figma, Canva, or Dropbox. Make sure link permissions are correct: private, view only, comment, or edit.",
    safety_step4_cta: "View File Checklist",
    safety_checklist_title: "Project File Setup Checklist",
    safety_limitation_title: "MVP Security Limitation",
    safety_limitation_body: "Personal Workspace helps separate local data and reduce casual access risk in the same browser. It is not a replacement for cloud accounts, multi-device login, or file encryption. For actual file security, use permissions from Google Drive, Figma, Canva, Dropbox, or your storage platform.",
    safety_template_title: "Project Link Template",
    safety_cred_warning: "Save only file/folder links that you manage yourself. Do not enter passwords, tokens, API keys, or client credentials.",
    safety_ack_label: "I understand the limitations of local workspaces.",

    profile_card_title: "Complete Freelancer Profile in AlurKarya",
    profile_card_copy: "This profile appears in the sidebar, Client Dashboard, and project briefing. Fill in your name, role, portfolio, and bio from the Freelancer Profile menu in AlurKarya.",
    btn_open_profile: "Open Freelancer Profile",
    btn_continue_setup: "Continue Project Setup",
    profile_helper_copy: "Open AlurKarya → select the profile card in the sidebar → complete your profile.",
    profile_role_fallback: "Freelancer",
    
    flow_headline: "AlurKarya Main Workflow",
    flow_subtitle: "Each project should have a clear status so you know what needs to be done, who needs follow-up, and what is pending.",
    
    role_headline: "Choose template matching your workflow",
    role_subtitle: "Use recommended checklist configurations and important links based on your specific role:",
    role_links_title: "Important Links to Save",
    role_delivery_title: "Main Delivery Parameters",
    
    portal_headline: "Prepare a professional update for your client.",
    portal_subtitle: "Client Portal helps you share work progress transparently without sending files back and forth. This clean dashboard shows:",
    portal_f1_name: "Project Status",
    portal_f1_desc: "Clients can view real-time project status (e.g., In Progress, Review, Paid).",
    portal_f2_name: "Delivered Work",
    portal_f2_desc: "Displays the latest draft links accessible directly for quick review.",
    portal_f3_name: "Feedback & Revisions",
    portal_f3_desc: "Centralized feedback records to ensure no revision instruction is missed.",
    portal_f4_name: "Final Confirmation",
    portal_f4_desc: "An official approval button for clients to formally sign off deliverables.",
    portal_f5_name: "Invoice & Payments",
    portal_f5_desc: "Billing summaries, attached invoices, payment statuses, and transfer instructions.",
    portal_f6_name: "File Deliverables",
    portal_f6_desc: "A permanent download link for final files after administrative terms are met.",
    portal_privacy: "<strong>Privacy Note:</strong> Only safe client-facing progress is shared. Your internal notes and workspace profile lists remain strictly private.",
    
    delivery_headline: "Ensure project is fully ready for delivery.",
    delivery_subtitle: "Use this checklist to eliminate miscommunication and ensure smooth handovers:",
    delivery_item_0: "Preview link is set (latest visual/functional draft is updated)",
    delivery_item_1: "Client feedback is recorded (all previous feedback notes are resolved)",
    delivery_item_2: "Revisions are complete (free of major bugs, typos, or rendering errors)",
    delivery_item_3: "Final file link is ready (compressed and valid cloud download link)",
    delivery_item_4: "Source/raw files organized if included (layers named neatly and clean files)",
    delivery_item_5: "Handover notes prepared (short usage setup, assets explanation, or hosting guidelines)",
    delivery_item_6: "Client confirmation logged (written signoff confirming work matches expectations)",
    
    invoice_headline: "Do not stop at invoice sent.",
    invoice_subtitle: "Invoice sent doesn't mean payment is safe. Record invoice status, due date, next follow-up, and payment status regularly in your ledger.",
    invoice_c1_title: "1. Due Date",
    invoice_c1_desc: "Provide clear payment terms (e.g., Net 7, Net 14). Log due dates in the dashboard for automated tracking and reminders.",
    invoice_c2_title: "2. Next Follow-up Plan",
    invoice_c2_desc: "Schedule friendly follow-up notes 1 day before due date, on the due date, and 3 days post-due if unpaid.",
    invoice_c3_title: "3. Cash Reconciliation Status",
    invoice_c3_desc: "Once payment hits your bank account, immediately switch the status to Paid in AlurKarya and deliver final files formally.",
    
    scripts_headline: "Client Scripts",
    scripts_subtitle: "Use these ready-to-copy drafts to communicate professionally with clients throughout the project lifecycle:",
    btn_copy_script: "Copy Script",
    
    help_headline: "If you get stuck, start here",
    help_subtitle: "Some common operational questions and answers about using AlurKarya:",
    faq_q0: "Projects do not show up on dashboard",
    faq_a0: "Make sure the project is registered on the workspace board. New projects need at least one active task/checklist item to appear in weekly summaries.",
    faq_q1: "Checklist is not saved after refreshing page",
    faq_a1: "AlurPandu saves your progress in your browser's local database (localStorage). Make sure your browser's private browsing/incognito mode does not automatically clear cache when the tab is closed, or clear your browser storage space.",
    faq_q2: "Role templates don't match my workflow",
    faq_a2: "Role templates are general baselines. Inside AlurKarya, you can freely add custom sub-checklists, delete default tags, and reorder Kanban stages to match your specific workflow.",
    faq_q3: "Tautan/link is not clickable or errors out",
    faq_a3: "Ensure you enter absolute URL protocols when registering links in card inputs (e.g., use <code>https://figma.com/...</code> or <code>https://drive.google.com/...</code> instead of plain text).",
    faq_q4: "Client Portal doesn't show recent updates",
    faq_a4: "All progress changes in your workspace dashboard are synchronized instantly. Clients only need to refresh their portal link to see the updated statuses and files.",
    faq_q5: "How do I clear all progress in this checklist?",
    faq_a5: "You can click the 'Reset Progress' button on the top right of the 'Workspace Setup' section to clear all local checklist states.",
    
    diagnosis_result_unprepared: "You noted {count} out of 5 workflows that are still managed manually in WhatsApp, Drive, or notes. AlurKarya will help unify and centralize your freelance operations.",
    diagnosis_result_prepared: "Great! You already manage your manual workflows neatly. AlurKarya will automate the tracking so your productivity stays consistent.",
    
    // Project Creator keys
    project_card_title: "Create First Project",
    project_card_copy: "Start with one active client project. Add the basic details like client name, stage, next action, deadline, and estimated value. Once created, this project will appear directly on the AlurKarya Board.",
    btn_open_project_creator: "Create Project Now",
    
    modal_title: "Create First Project",
    label_project_name: "Project Name",
    label_client_name: "Client Name",
    label_project_category: "Project Type",
    label_current_stage: "Current Stage",
    label_next_action: "Next Action",
    label_deadline: "Deadline",
    label_estimated_value: "Estimated Project Value",
    label_currency: "Currency",
    label_review_link: "Review Link",
    label_delivery_link: "Delivery Link",
    label_notes: "Initial Notes",
    btn_cancel: "Cancel",
    btn_save_project: "Create Project",
    placeholder_next_action: "example: Send proposal, follow up brief, start first draft, wait for client feedback...",
    success_title: "Project Created Successfully",
    success_message: "Your first project has been created. You can now manage it on the AlurKarya Board.",
    btn_open_board: "Open Project Board"
  },
  id: {
    app_title: "Panduan Onboarding AlurKarya",
    nav_title: "Onboarding AlurPandu",
    sidebar_tagline: "Panduan setup AlurKarya untuk mulai mengelola project dari client sampai paid.",
    crumb_workspace: "AlurKarya Workspace",
    crumb_start: "Mulai di Sini",
    header_badge: "Guided Start Ready",
    menu_start: "Mulai di Sini",
    menu_audit: "Workflow Audit",
    menu_safety: "Workspace & File",
    menu_workspace_file: "Workspace & File",
    menu_setup: "Setup Workspace",
    menu_flow: "Main Workflow",
    menu_template: "Pilih Template",
    menu_client_portal: "Client Portal Guide",
    menu_portal: "Client Portal Guide",
    menu_delivery: "Delivery Checklist",
    menu_invoice: "Invoice Workflow",
    menu_scripts: "Client Scripts",
    menu_help: "Bantuan",
    lang_label: "Bahasa",
    
    welcome_title: "Selamat Datang di AlurPandu",
    welcome_subtitle: "Asisten langkah demi langkah Anda untuk setup workspace kerja freelance yang rapi dan terstruktur di AlurKarya.",
    welcome_lead: "AlurPandu membantu Anda mengelola project, menentukan termin client secara tertulis, mengotomatisasi serah terima berkas, dan menagih invoice dalam satu dashboard. Ikuti panduan setup 15 menit ini untuk memulai.",
    welcome_text: "Jangan mulai dari dashboard kosong. Gunakan AlurPandu untuk setup AlurKarya langkah demi langkah, dari project aktif pertamamu hingga update client pertama.",
    welcome_setup_btn: "Mulai Setup",
    welcome_audit_btn: "Cek Alur Kerja Dulu",
    header_setup_btn: "Mulai Setup",
    
    start_title: "Mulai di Sini",
    start_headline: "Mulai dari project aktif, bukan dari sistem kosong.",
    start_desc: "Pilih satu project client yang sedang aktif. Lalu isi detail client, stage, next action, deadline, review, invoice, dan delivery secara bertahap. Cara ini membantu Anda memahami alur kerja AlurKarya tanpa merasa kewalahan.",
    start_cta: "Buat Project Sekarang",
    
    template_title: "Pilih Template",
    template_headline: "Pilih template sesuai cara kerja Anda",
    template_desc: "Gunakan rekomendasi checklist dan link penting berdasarkan peran freelance Anda.",
    
    audit_section_title: "Apakah alur kerja Anda sudah rapi?",
    audit_title: "Apakah alur kerja Anda sudah rapi?",
    audit_subtitle: "Jawab 5 pertanyaan singkat ini untuk melihat apakah alur kerja freelance Anda sudah jelas atau masih mudah tercecer.",
    audit_headline: "Coba jawab tanpa membuka chat lama",
    audit_desc: "Jawab 5 pertanyaan singkat ini untuk melihat apakah alur kerja freelance Anda sudah jelas atau masih mudah tercecer.",
    audit_num_1: "Pertanyaan 1",
    audit_q1: "Di mana Anda mencatat project-project Anda?",
    audit_btn_ya_1: "Sudah Pasti",
    audit_btn_tidak_1: "Cari Chat Dulu",
    audit_num_2: "Pertanyaan 2",
    audit_q2: "Client mana yang sedang menunggu review?",
    audit_btn_ya_2: "Sudah Hafal",
    audit_btn_tidak_2: "Cek Catatan Dulu",
    audit_num_3: "Pertanyaan 3",
    audit_q3: "Revisi mana yang belum selesai?",
    audit_btn_ya_3: "Sudah Tercatat",
    audit_btn_tidak_3: "Scroll Grup WA",
    audit_num_4: "Pertanyaan 4",
    audit_q4: "Invoice mana yang belum dibayar?",
    audit_btn_ya_4: "Punya Rekapan",
    audit_btn_tidak_4: "Cek M-Banking",
    audit_num_5: "Pertanyaan 5",
    audit_q5: "File final mana yang belum benar-benar terkirim?",
    audit_btn_ya_5: "Link Drive Siap",
    audit_btn_tidak_5: "Lupa Apakah Sudah Dikirim",
    diagnosis_title_text: "Hasil Audit Workflow",
    
    setup_title: "Setup Workspace",
    setup_reset_btn: "Reset Progres",
    setup_headline: "Setup awal dalam 15 menit",
    setup_subtitle: "Selesaikan langkah-langkah dasar berikut untuk mengaktifkan workspace AlurKarya Anda:",
    setup_progress_title: "Progres Setup",
    
    // New 12-item checklist keys
    setup_item_0: "Buat / pilih Workspace Pribadi",
    setup_item_1: "Tambahkan PIN Workspace opsional",
    setup_item_2: "Lengkapi Profil Freelancer",
    setup_item_3: "Buat Project Pertama",
    setup_item_4: "Tambahkan Client",
    setup_item_5: "Set Stage Project",
    setup_item_6: "Tambahkan Next Action",
    setup_item_7: "Tambahkan Deadline",
    setup_item_8: "Simpan Link Review / Delivery",
    setup_item_9: "Ekspor Backup Pertama",
    setup_item_10: "Cek Client Dashboard",
    setup_item_11: "Siapkan Update Client Pertama",
    
    // Workspace Safety Section
    menu_safety: "Workspace & File",
    safety_title: "Workspace & Keamanan File",
    safety_headline: "Mulai dari Workspace Pribadi",
    safety_body: "Kamu tidak membuat akun cloud dulu. Kamu membuat Workspace Pribadi di browser ini. Workspace ini menyimpan data project, client, invoice, payment, dan link delivery secara lokal. Workspace bisa diberi PIN, dikunci, diganti, dan di-backup.",
    safety_note: "File asli tetap berada di Google Drive, Figma, Canva, Dropbox, atau platform pilihanmu. AlurKarya hanya menyimpan link untuk membantu mengatur review, delivery, invoice, dan payment. Keamanan file mengikuti permission di platform asal.",
    safety_step1_title: "Buat Workspace Pribadi",
    safety_step1_body: "Gunakan workspace terpisah agar data project and client tidak bercampur dengan pengguna lain di laptop yang sama.",
    safety_step1_cta: "Buat / Pilih Workspace",
    safety_step2_title: "Tambahkan PIN & Kunci Workspace",
    safety_step2_body: "PIN membantu melindungi akses kasual di browser ini. Setelah selesai bekerja, gunakan Kunci Workspace.",
    safety_step2_cta: "Kunci Workspace",
    safety_step3_title: "Ekspor Backup Berkala",
    safety_step3_body: "Data workspace disimpan di browser ini. Gunakan Ekspor Backup agar data bisa dipulihkan atau dipindahkan ke device lain.",
    safety_step3_cta: "Ekspor Backup",
    safety_step4_title: "Atur Permission File Asli",
    safety_step4_body: "Simpan file asli di Drive, Figma, Canva, atau Dropbox. Pastikan permission link sesuai: private, view only, comment, atau edit.",
    safety_step4_cta: "Lihat Checklist File",
    safety_checklist_title: "Checklist Setup File Project",
    safety_limitation_title: "Batasan Keamanan MVP",
    safety_limitation_body: "Workspace Pribadi membantu memisahkan data lokal dan mengurangi risiko akses kasual di browser yang sama. Ini belum menggantikan akun cloud, login multi-device, atau enkripsi file. Untuk keamanan file asli, gunakan permission dari Google Drive, Figma, Canva, Dropbox, atau platform penyimpanan yang kamu gunakan.",
    safety_template_title: "Template Link Project",
    safety_cred_warning: "Simpan hanya link file/folder yang kamu kelola sendiri. Jangan masukkan password, token, API key, atau credential client.",
    safety_ack_label: "Saya mengerti batasan workspace lokal.",

    profile_card_title: "Lengkapi Profil Freelancer di AlurKarya",
    profile_card_copy: "Profil ini akan tampil di sidebar, Client Dashboard, dan briefing project. Lengkapi nama, role, portfolio, dan bio dari menu Profil Freelancer di AlurKarya.",
    btn_open_profile: "Buka Profil Freelancer",
    btn_continue_setup: "Lanjut Setup Project",
    profile_helper_copy: "Buka AlurKarya → pilih kartu profil di sidebar → lengkapi profil.",
    profile_role_fallback: "Freelancer",
    
    flow_headline: "Alur Utama AlurKarya",
    flow_subtitle: "Setiap project sebaiknya punya status yang jelas agar Anda tahu apa yang harus dikerjakan, siapa yang harus ditindaklanjuti, dan apa yang belum selesai.",
    
    role_headline: "Pilih template sesuai cara kerja Anda",
    role_subtitle: "Gunakan rekomendasi konfigurasi checklist dan tautan penting berdasarkan peran spesifik Anda:",
    role_links_title: "Link Penting yang Disimpan",
    role_delivery_title: "Parameter Delivery Utama",
    
    portal_headline: "Siapkan update yang rapi untuk client.",
    portal_subtitle: "Client Portal membantu Anda berbagi transparansi progress kerja tanpa perlu mengirim file berulang kali. Halaman ringkas ini menampilkan:",
    portal_f1_name: "Status Project",
    portal_f1_desc: "Client dapat melihat status real-time project (misal: In Progress, Review, lunas).",
    portal_f2_name: "Pekerjaan Terkirim",
    portal_f2_desc: "Menampilkan tautan draf terkini yang dapat diakses langsung untuk proses tinjauan cepat.",
    portal_f3_name: "Feedback & Revisi",
    portal_f3_desc: "Catatan perbaikan yang dikirimkan tersentralisasi sehingga tidak ada instruksi yang terlewat.",
    portal_f4_name: "Persetujuan Akhir",
    portal_f4_desc: "Tombol konfirmasi bagi client untuk menyetujui hasil deliverable secara resmi.",
    portal_f5_name: "Invoice & Pembayaran",
    portal_f5_desc: "Rangkuman nominal tagihan, invoice terlampir, status pembayaran, dan instruksi transfer.",
    portal_f6_name: "Delivery Berkas",
    portal_f6_desc: "Tautan permanen penyerahan file akhir setelah kewajiban administrasi terpenuhi.",
    portal_privacy: "<strong>Catatan Privasi:</strong> Yang tampil ke client hanya informasi yang aman untuk dibagikan. Catatan internal Anda tetap rahasia.",
    
    delivery_headline: "Pastikan project benar-benar siap dikirim.",
    delivery_subtitle: "Gunakan checklist di bawah ini untuk meminimalkan miskomunikasi dan memastikan serah terima berkas berjalan lancar:",
    delivery_item_0: "Preview link sudah ada (berisi update draf visual atau fungsional terbaru)",
    delivery_item_1: "Feedback client sudah dicatat (seluruh masukan tertulis sebelumnya telah diakomodasi)",
    delivery_item_2: "Revisi sudah selesai (bebas bug mayor, typo, atau kesalahan rendering draf)",
    delivery_item_3: "Final file link tersedia (tautan download folder awan terkompresi/tidak rusak)",
    delivery_item_4: "Source/raw file jelas jika termasuk (file mentahan terorganisir dengan penamaan layer rapi)",
    delivery_item_5: "Handover notes siap (penjelasan singkat mengenai cara pakai, struktur aset, atau panduan hosting)",
    delivery_item_6: "Client confirmation tercatat (persetujuan tertulis bahwa deliverables sudah sesuai ekspektasi)",
    
    invoice_headline: "Jangan berhenti di invoice sent.",
    invoice_subtitle: "Invoice sent belum berarti payment aman. Catat invoice status, due date, next follow-up, dan payment status secara berkala di ledger Anda.",
    invoice_c1_title: "1. Tanggal Jatuh Tempo (Due Date)",
    invoice_c1_desc: "Berikan batas waktu pembayaran yang jelas (misalnya: Net 7, Net 14). Catat tanggal jatuh tempo ini di dashboard agar pengingat otomatis berjalan.",
    invoice_c2_title: "2. Rencana Follow-up Lanjutan",
    invoice_c2_desc: "Jadwalkan pesan tindak lanjut ramah 1 hari sebelum jatuh tempo, hari-H, dan 3 hari setelah jatuh tempo jika belum ada konfirmasi pembayaran.",
    invoice_c3_title: "3. Status Rekonsiliasi Kas",
    invoice_c3_desc: "Setelah dana terverifikasi masuk ke rekening Anda, segera ubah status di AlurKarya menjadi Paid dan serahkan file final secara resmi.",
    
    scripts_headline: "Client Scripts",
    scripts_subtitle: "Gunakan draf pesan siap pakai di bawah ini untuk berinteraksi secara profesional dengan client Anda:",
    btn_copy_script: "Salin Script",
    
    help_headline: "Kalau bingung, mulai dari sini",
    help_subtitle: "Beberapa pertanyaan teknis yang sering ditanyakan seputar pengoperasian AlurKarya:",
    faq_q0: "Project tidak muncul di dashboard",
    faq_a0: "Periksa apakah project sudah didaftarkan di workspace board. Project baru harus memiliki minimal satu task aktif agar muncul di tracker mingguan Anda.",
    faq_q1: "Checklist tidak tersimpan saat refresh halaman",
    faq_a1: "AlurPandu menyimpan progress di database browser lokal Anda (localStorage). Pastikan mode private browsing/incognito Anda tidak otomatis menghapus cache saat tab ditutup, atau coba bersihkan ruang penyimpanan browser Anda.",
    faq_q2: "Template peran (role) belum sesuai dengan kebiasaan kerja",
    faq_a2: "Template peran di atas adalah panduan umum. Di dalam AlurKarya, Anda bebas menambahkan sub-checklist kustom, menghapus tag bawaan, dan menyusun urutan kolom Kanban sesuai alur spesifik workflow mandiri Anda.",
    faq_q3: "Link tautan penting tidak dapat diklik atau error",
    faq_a3: "Pastikan Anda menginput format URL secara lengkap saat mendaftarkan tautan di database card (misalnya gunakan format lengkap <code>https://figma.com/...</code> atau <code>https://drive.google.com/...</code> bukan hanya teks biasa).",
    faq_q4: "Client Portal tidak menunjukkan pembaruan terbaru",
    faq_a4: "Semua pembaruan data di dashboard kerja Anda disinkronkan secara instan ke tautan portal luar. Client cukup me-refresh halaman web portal mereka untuk melihat pembaruan status dan berkas terbaru.",
    faq_q5: "Bagaimana cara menghapus seluruh data checklist ini?",
    faq_a5: "Anda dapat menggunakan tombol \"Reset Progress\" yang berada di bagian kanan atas modul \"Setup Workspace\" untuk membersihkan progress lokal Anda di browser ini.",
    
    diagnosis_result_unprepared: "Anda mendeteksi {count} dari 5 proses kerja yang masih harus dicari manual dari chat WhatsApp, notes, Drive, atau ingatan. Berarti AlurKarya akan sangat membantu menyatukan alur kerja freelancer Anda menjadi tersentralisasi.",
    diagnosis_result_prepared: "Hebat! Anda sudah menguasai alur kerja manual Anda dengan rapi. AlurKarya akan membantu mendokumentasikannya secara otomatis agar produktivitas Anda lebih stabil dan teratur.",
    
    // Project Creator keys
    project_card_title: "Buat Project Pertama",
    project_card_copy: "Mulai dari satu project client yang sedang aktif. Isi detail dasar seperti nama client, stage, next action, deadline, dan estimasi nilai project. Setelah dibuat, project ini akan langsung masuk ke Board AlurKarya.",
    btn_open_project_creator: "Buat Project Sekarang",
    
    modal_title: "Buat Project Pertama",
    label_project_name: "Nama Project",
    label_client_name: "Nama Client",
    label_project_category: "Jenis Project",
    label_current_stage: "Stage Saat Ini",
    label_next_action: "Next Action",
    label_deadline: "Deadline",
    label_estimated_value: "Estimasi Nilai Project",
    label_currency: "Currency",
    label_review_link: "Link Review",
    label_delivery_link: "Link Delivery",
    label_notes: "Catatan Awal",
    btn_cancel: "Batal",
    btn_save_project: "Buat Project",
    placeholder_next_action: "contoh: Kirim proposal, follow-up brief, mulai draft pertama, tunggu feedback client...",
    success_title: "Project Berhasil Dibuat",
    success_message: "Project pertama berhasil dibuat. Sekarang kamu bisa lanjut mengelola project ini di Board AlurKarya.",
    btn_open_board: "Buka Board Project"
  }
};

function getLanguage() {
  const lang = localStorage.getItem('alurkarya_language');
  return lang === 'id' ? 'id' : 'en';
}

function setLanguage(lang) {
  localStorage.setItem('alurkarya_language', lang);
  updateDocumentLanguage();
  renderLanguage();
  
  // Show toast
  const toastMsg = lang === 'id' ? "Bahasa berhasil diperbarui." : "Language updated.";
  showToast(toastMsg);
}

function updateDocumentLanguage() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.value = lang;
  }
}

function t(key, fallback = '') {
  const lang = getLanguage();
  // 1. selected language translation
  if (translations[lang] && translations[lang][key] !== undefined) {
    return translations[lang][key];
  }
  // 2. English translation
  if (translations['en'] && translations['en'][key] !== undefined) {
    return translations['en'][key];
  }
  // 3. provided fallback text
  if (fallback) {
    return fallback;
  }
  
  // Check if development environment
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.protocol === 'file:';
                
  if (isDev) {
    console.warn(`[i18n] Missing translation for key: "${key}"`);
    // 4. development-only human-readable fallback
    if (typeof key === 'string') {
      const cleanKey = key.replace(/^(menu|crumb|btn|header|label|start|welcome|audit)_/i, '');
      return cleanKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  }
  
  // 5. safe empty string for production if no fallback exists
  return '';
}

function renderLanguage() {
  const lang = getLanguage();

  // 1. Translate static text elements
  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    const translation = t(key);
    if (translation) {
      if (key === 'portal_privacy') {
        elem.innerHTML = translation;
      } else {
        elem.textContent = translation;
      }
    }
  });

  // 2. Translate placeholders
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation) {
      elem.setAttribute('placeholder', translation);
    }
  });

  // 3. Re-render dynamic blocks
  renderFlowStages();
  renderRoleTemplates();
  renderScripts();
  updateDiagnosisOutcomeUI();
  
  // 4. Update checklist UI
  updateChecklistUI();
  
  // 5. Update user profile values
  loadFreelancerProfile();

  // 6. Update workspace safety UI elements
  renderFileChecklist();
  initProjectTemplateSelector();
  updateWorkspaceStatusBadge();
}

// --- Dynamic Freelancer Profile ---
function getProfileFallbacks(lang) {
  if (lang === 'id') {
    return {
      name: "Nama Anda",
      role: "Freelancer",
      initials: "YK"
    };
  }
  return {
    name: "Your Name",
    role: "Freelancer",
    initials: "YK"
  };
}

function generateInitials(name) {
  if (!name || !name.trim()) return "YK";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const firstLetter = parts[0][0];
  const lastLetter = parts[parts.length - 1][0];
  return (firstLetter + lastLetter).toUpperCase();
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

function updateProfileUI(profile) {
  const sidebarProfileContainer = document.getElementById('sidebar-user-profile');
  if (!sidebarProfileContainer) return;

  const currentLang = getLanguage();
  const fallbacks = getProfileFallbacks(currentLang);

  const name = profile.freelancerName || fallbacks.name;
  const role = profile.freelancerRole || fallbacks.role;
  const initials = profile.freelancerInitials || generateInitials(profile.freelancerName);

  let avatarHTML = '';
  if (profile.freelancerAvatar && profile.freelancerAvatar.trim()) {
    avatarHTML = `<img class="sidebar-avatar-img" src="${escapeHTML(profile.freelancerAvatar)}" alt="${escapeHTML(name)}'s Avatar">`;
  } else {
    avatarHTML = initials;
  }

  const hasAvatar = profile.freelancerAvatar && profile.freelancerAvatar.trim();
  sidebarProfileContainer.innerHTML = `
    <div class="user-avatar" style="${hasAvatar ? 'background: none;' : ''}">
      ${avatarHTML}
    </div>
    <div class="user-info">
      <div class="user-name" title="${escapeHTML(name)}">${escapeHTML(name)}</div>
      <div class="user-role" title="${escapeHTML(role)}">${escapeHTML(role)}</div>
    </div>
  `;
}

function loadFreelancerProfile() {
  let profile = {
    freelancerName: "",
    freelancerRole: "",
    freelancerInitials: "",
    freelancerAvatar: "",
    freelancerEmail: "",
    freelancerBio: "",
    freelancerPortfolioLink: "",
    freelancerLocation: ""
  };

  try {
    const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
    const key = activeWorkspaceId ? `alurkarya_workspace_${activeWorkspaceId}_profile` : 'alurkarya_freelancer_profile';
    const stored = localStorage.getItem(key);
    if (stored) {
      profile = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load profile:", e);
  }

  updateProfileUI(profile);
}

function openParentProfile() {
  if (window.opener && !window.opener.closed) {
    try {
      if (window.opener.app && typeof window.opener.app.switchView === 'function') {
        window.opener.app.switchView('profile');
        window.opener.focus();
        showToast(getLanguage() === 'id' ? "Navigasi ke profil di AlurKarya berhasil." : "Navigated to profile in AlurKarya.");
        return;
      }
    } catch (e) {
      console.warn("Could not navigate opener directly:", e);
    }
  }
  showToast(getLanguage() === 'id' ? "Buka AlurKarya terlebih dahulu." : "Please open AlurKarya first.");
}

// --- Dynamic Flow Stages ---
const flowStages = [
  {
    key: "new_lead",
    label: { en: "New Lead", id: "Lead Baru" },
    badge: { en: "Leads", id: "Leads" },
    description: {
      en: "Initial stage when a new project lead comes in. Collect brief details, estimated budget, and timeline expectations before deal approval.",
      id: "Status awal saat prospek project baru masuk. Kumpulkan deskripsi brief singkat, anggaran perkiraan, dan estimasi waktu sebelum disetujui."
    }
  },
  {
    key: "queue",
    label: { en: "Queue", id: "Antrean" },
    badge: { en: "Wait", id: "Wait" },
    description: {
      en: "Projects agreed upon but queued for production. Helps manage work capacity to prevent overloading.",
      id: "Project yang sudah deal tetapi masuk dalam antrean pengerjaan. Membantu mengelola kapasitas kerja agar tidak overload."
    }
  },
  {
    key: "in_progress",
    label: { en: "In Progress", id: "Sedang Dikerjakan" },
    badge: { en: "Active", id: "Active" },
    description: {
      en: "Projects you are actively working on today. Ensure preview or progress links are updated for transparency.",
      id: "Project yang sedang aktif Anda kerjakan hari ini. Pastikan link progress/preview selalu terupdate untuk transparansi."
    }
  },
  {
    key: "client_review",
    label: { en: "Client Review", id: "Review Client" },
    badge: { en: "Review", id: "Review" },
    description: {
      en: "Deliverables sent and currently under client review. Critical window to monitor feedback duration.",
      id: "Hasil kerja sudah dikirimkan dan saat ini sedang ditinjau oleh client. Waktu yang kritis untuk memantau durasi feedback."
    }
  },
  {
    key: "revision",
    label: { en: "Revision", id: "Revisi" },
    badge: { en: "Fixes", id: "Fixes" },
    description: {
      en: "Updates and adjustments based on written client feedback. Limit revision counts based on initial quotation agreements.",
      id: "Proses perbaikan berdasarkan feedback tertulis client. Batasi jumlah revisi sesuai dengan kesepakatan awal di quotation."
    }
  },
  {
    key: "invoice_sent",
    label: { en: "Invoice Sent", id: "Invoice Terkirim" },
    badge: { en: "Billing", id: "Billing" },
    description: {
      en: "Work finished or payment milestone reached, and the official invoice has been issued and sent to the client.",
      id: "Pekerjaan selesai atau mencapai milestone pembayaran, dan tagihan resmi telah diterbitkan serta dikirimkan ke client."
    }
  },
  {
    key: "waiting_payment",
    label: { en: "Waiting Payment", id: "Menunggu Pembayaran" },
    badge: { en: "Pending", id: "Pending" },
    description: {
      en: "Invoice sent, work completed/paused, waiting for funds to hit your account. Follow up if past due date.",
      id: "Invoice sudah dikirim, pekerjaan ditahan/selesai, menunggu dana masuk ke rekening. Follow-up jika melewati jatuh tempo."
    }
  },
  {
    key: "completed",
    label: { en: "Completed", id: "Selesai" },
    badge: { en: "Paid", id: "Paid" },
    description: {
      en: "Project fully finalized, payments confirmed received, final files delivered, and ready to archive.",
      id: "Project telah selesai sepenuhnya, pembayaran lunas, file final diserahkan, dan siap diarsipkan ke portfolio."
    }
  }
];

let activeFlowStageIndex = 0;

function renderFlowStages() {
  const container = document.getElementById('flow-stages-container');
  if (!container) return;

  const lang = getLanguage();
  container.innerHTML = '';

  flowStages.forEach((stage, idx) => {
    const isActive = idx === activeFlowStageIndex;
    const node = document.createElement('div');
    node.className = `flow-stage-node ${isActive ? 'active-stage' : ''}`;
    node.setAttribute('onclick', `selectFlowStage(${idx})`);
    
    const labelText = escapeHTML(stage.label[lang] || stage.label['en']);
    const badgeText = escapeHTML(stage.badge[lang] || stage.badge['en']);
    
    node.innerHTML = `
      <span class="flow-stage-num">${idx + 1}</span>
      <span class="flow-stage-name">${labelText}</span>
      <span class="flow-node-badge badge-${stage.key.replace('_', '-')}">${badgeText}</span>
    `;
    container.appendChild(node);
  });

  updateFlowStageDetailUI();
}

function selectFlowStage(idx) {
  activeFlowStageIndex = idx;
  
  const nodes = document.querySelectorAll('.flow-stages-row .flow-stage-node');
  nodes.forEach((n, i) => {
    if (i === idx) {
      n.classList.add('active-stage');
    } else {
      n.classList.remove('active-stage');
    }
  });

  updateFlowStageDetailUI();
}

function updateFlowStageDetailUI() {
  const lang = getLanguage();
  const stage = flowStages[activeFlowStageIndex];
  if (!stage) return;

  const detailTitle = document.getElementById('flow-title');
  const detailDesc = document.getElementById('flow-desc');

  const labelText = stage.label[lang] || stage.label['en'];
  const descText = stage.description[lang] || stage.description['en'];

  if (detailTitle) {
    const detailPrefix = lang === 'id' ? 'Detail Tahap:' : 'Stage Details:';
    detailTitle.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="9" x2="12.01" y2="9"></line></svg>
      <span>${detailPrefix} ${escapeHTML(labelText)}</span>
    `;
  }
  if (detailDesc) {
    detailDesc.textContent = descText;
  }
}

// --- Dynamic Role Templates ---
const roleKeys = ['designer', 'video-editor', 'copywriter', 'web-developer', 'socmed-manager', 'ai-consultant', 'general'];
let activeRoleKey = 'designer';

const roleData = {
  designer: {
    en: {
      name: "Designer Template",
      target: "Fits: UI/UX Designer, Graphic Designer, Illustrator, Brand Designer",
      links: ["Figma Design File & Prototype link", "Moodboard & Asset folder link", "Shared Google Drive / Dropbox folder"],
      delivery: ["Asset export formats (.png, .svg, .pdf)", "Source file handover (.fig, .ai, .psd)", "Styleguide documentation"]
    },
    id: {
      name: "Designer Template",
      target: "Cocok untuk: UI/UX Designer, Graphic Designer, Illustrator, Brand Designer",
      links: ["Link Figma Design File & Prototype", "Folder Moodboard & Asset Link", "Shared Google Drive / Dropbox Folder"],
      delivery: ["Ekspor format aset (.png, .svg, .pdf)", "Penyerahan source file (.fig, .ai, .psd)", "Dokumentasi panduan gaya (Styleguide)"]
    }
  },
  'video-editor': {
    en: {
      name: "Video Editor Template",
      target: "Fits: Video Editor, Animator, Motion Designer, Content Creator",
      links: ["Project File link (Premiere / After Effects)", "Frame.io / Review link", "Raw Assets Cloud folder & Audio licenses"],
      delivery: ["Rendered final video (.mp4, .mov per specs)", "Organized project file handover", "Third-party asset lists / audio licenses"]
    },
    id: {
      name: "Video Editor Template",
      target: "Cocok untuk: Video Editor, Animator, Motion Designer, Content Creator",
      links: ["Link Project File (Premiere / After Effects)", "Link Frame.io / Review Link", "Folder Cloud Aset Mentah & Audio License"],
      delivery: ["Render video final (.mp4, .mov sesuai spek)", "Handover project file terorganisir", "Dokumen aset pihak ketiga / lisensi audio"]
    }
  },
  copywriter: {
    en: {
      name: "Copywriter Template",
      target: "Fits: Copywriter, Content Writer, SEO Writer, Scriptwriter",
      links: ["Google Docs / Notion draft link", "Research references & Brief folder", "Pitch Deck / Campaign file links"],
      delivery: ["Clean final text (Google Docs / PDF)", "SEO keyword research list (if applicable)", "Tone of Voice guidelines"]
    },
    id: {
      name: "Copywriter Template",
      target: "Cocok untuk: Copywriter, Content Writer, SEO Writer, Scriptwriter",
      links: ["Link Google Docs / Notion Draft", "Folder Referensi Riset & Brief", "Shared Tautan File Pitch Deck / Campaign"],
      delivery: ["Teks final bersih (Google Docs / PDF)", "Daftar riset kata kunci (jika SEO)", "Panduan intonasi suara (Tone of Voice)"]
    }
  },
  'web-developer': {
    en: {
      name: "Web Developer Template",
      target: "Fits: Front-end Dev, WordPress/No-Code Developer, Full-stack Dev",
      links: ["GitHub / GitLab Repository link", "Staging Hosting link (Vercel/Netlify)", "CMS / WordPress Admin Dashboard access"],
      delivery: ["Hosting & domain credentials transfer", "API documentation & Local setup guide", "Primary admin access to CMS / Service panel"]
    },
    id: {
      name: "Web Developer Template",
      target: "Cocok untuk: Front-end Dev, WordPress/No-Code Developer, Full-stack Dev",
      links: ["Link Repositori GitHub / GitLab", "Shared Tautan Hosting Staging (Vercel/Netlify)", "Shared Akses Dashboard CMS/WP Admin"],
      delivery: ["Serah terima berkas hosting & domain", "Dokumentasi API & Panduan Setup Lokal", "Akses admin utama ke CMS / Panel Layanan"]
    }
  },
  'socmed-manager': {
    en: {
      name: "Social Media Manager Template",
      target: "Fits: Social Media Specialist, Content Planner, Community Manager",
      links: ["Content Calendar link", "Graphic Assets & Brand Kit folder", "Weekly Analysis / Performance Report links"],
      delivery: ["One month scheduled Content Calendar", "Secure account credentials handover", "Performance report & strategic recommendations"]
    },
    id: {
      name: "Social Media Manager Template",
      target: "Cocok untuk: Social Media Specialist, Content Planner, Community Manager",
      links: ["Link Kalender Konten (Content Calendar)", "Folder Aset Grafis & Brand Kit", "Shared Tautan Analisis/Laporan Mingguan"],
      delivery: ["Kalender Konten terjadwal sebulan", "Handover akun & login credential aman", "Laporan performa & rekomendasi strategi"]
    }
  },
  'ai-consultant': {
    en: {
      name: "AI Consultant Template",
      target: "Fits: AI Prompt Engineer, AI Automation Builder, AI Coach",
      links: ["Prompt Library & Template links", "Automation Workflow diagrams (Make/Zapier)", "Consultation & Training session recordings"],
      delivery: ["Prompt guidelines & SOP document", "Make/Zapier workflow ownership transfer", "Recommended AI tools & Operational budget list"]
    },
    id: {
      name: "AI Consultant Template",
      target: "Cocok untuk: AI Prompt Engineer, AI Automation Builder, AI Coach",
      links: ["Link Prompt Library & Template", "Shared Diagram Alur Otomatisasi (Make/Zapier)", "Tautan Rekaman Sesi Konsultasi & Training"],
      delivery: ["Dokumen panduan Prompt & Instruksi Kerja", "Serah terima kepemilikan alur Zap/Make", "Daftar rekomendasi tools AI & Biaya Operasional"]
    }
  },
  general: {
    en: {
      name: "General Freelancer Template",
      target: "Fits: General Freelancer Template, Project Manager, Translator, etc.",
      links: ["Shared Google Drive / Dropbox link", "Work plan & Milestone calendar", "Meeting notes sheets"],
      delivery: ["Verified final work output files", "Timesheet summary report (if hourly)", "General handover documents & emergency contact info"]
    },
    id: {
      name: "General Freelancer Template",
      target: "Cocok untuk: Virtual Assistant, Project Manager, Penerjemah, dll.",
      links: ["Tautan Google Drive / Dropbox Bersama", "Kalender Rencana Kerja & Milestone", "Lembar Catatan Komunikasi Meeting"],
      delivery: ["Berkas hasil kerja akhir yang terverifikasi", "Laporan ringkasan jam kerja (jika billing hourly)", "Dokumen serah terima umum & kontak darurat"]
    }
  }
};

function renderRoleTemplates() {
  const tabsContainer = document.getElementById('role-tabs');
  if (!tabsContainer) return;

  const lang = getLanguage();
  tabsContainer.innerHTML = '';

  roleKeys.forEach(key => {
    const isActive = key === activeRoleKey;
    const btn = document.createElement('button');
    btn.className = `role-btn ${isActive ? 'active-role' : ''}`;
    btn.setAttribute('onclick', `window.selectRole('${key}')`);
    
    const tabText = roleData[key][lang].name.replace(" Template", "");
    btn.textContent = tabText;
    tabsContainer.appendChild(btn);
  });

  updateRoleDetailUI();
}

function selectRole(roleKey) {
  activeRoleKey = roleKey;
  renderRoleTemplates();
}

function updateRoleDetailUI() {
  const lang = getLanguage();
  const data = roleData[activeRoleKey][lang];
  if (!data) return;

  const roleNameEl = document.getElementById('role-name');
  const roleTargetEl = document.getElementById('role-target');
  const roleLinksUl = document.getElementById('role-links');
  const roleDeliveryUl = document.getElementById('role-delivery');

  if (roleNameEl) roleNameEl.textContent = data.name;
  if (roleTargetEl) roleTargetEl.textContent = data.target;

  if (roleLinksUl) {
    roleLinksUl.innerHTML = '';
    data.links.forEach(link => {
      const li = document.createElement('li');
      li.textContent = link;
      roleLinksUl.appendChild(li);
    });
  }

  if (roleDeliveryUl) {
    roleDeliveryUl.innerHTML = '';
    data.delivery.forEach(delItem => {
      const li = document.createElement('li');
      li.textContent = delItem;
      roleDeliveryUl.appendChild(li);
    });
  }
}

// --- Toggle Guide Checklists ---
function toggleGuideCheck(item) {
  item.classList.toggle('checked');
}

// --- Dynamic Client Scripts ---
const scriptKeys = ['update', 'feedback', 'revision', 'invoice', 'delivery'];
let activeScriptKey = 'update';

const scriptTabLabels = {
  update: { en: "Project Update", id: "Project Update" },
  feedback: { en: "Waiting Feedback", id: "Waiting Feedback" },
  revision: { en: "Revision Update", id: "Update Revisi" },
  invoice: { en: "Invoice Follow-up", id: "Follow-up Invoice" },
  delivery: { en: "Final Delivery", id: "Delivery Final" }
};

const scripts = {
  en: {
    update: `Hi [Client Name], I would like to share the latest update for [Project Name]. The project is currently in the [Work Stage] stage.

You can review the latest draft, track progress, and leave feedback through your Client Portal here: [Client Portal Link].

Please let me know if you have any questions. Thank you.`,
    feedback: `Hi [Client Name], I have uploaded the draft for the [Stage Name] stage of [Project Name] to your Client Portal: [Client Portal Link].

Please review the draft and leave your feedback or confirmation directly in the portal by [Due Date]. Thank you for your collaboration.`,
    revision: `Hi [Client Name], the revisions based on the feedback you provided yesterday for [Project Name] have been completed.

You can check the updated visuals or files directly in our Client Portal: [Client Portal Link]. Please let me know if everything looks good. Thank you.`,
    invoice: `Hi [Client Name], please find attached invoice [Invoice Number] for [Project Name] as we have entered the [Stage/Milestone] stage.

You can view invoice details, download the official PDF, and find payment/transfer instructions directly in your Client Portal: [Client Portal Link]. Please let me know once payment has been sent. Thank you very much.`,
    delivery: `Hi [Client Name], all deliverables for [Project Name] have been finalized and your invoice payment has been confirmed as paid in full. Thank you for your collaboration!

All final files, raw source files, and supporting documentation are now uploaded and available for download at any time through your Client Portal: [Client Portal Link]. Wishing you the best of success with your business.`
  },
  id: {
    update: `Halo [Nama Client], saya ingin memberikan update terbaru mengenai [Nama Project]. Saat ini project berada di tahap [Tahap Kerja].

Anda dapat meninjau draft terbaru, memantau progress, dan memberikan feedback melalui Client Portal di sini: [Tautan Client Portal].

Silakan kabari saya jika ada hal yang ingin ditanyakan. Terima kasih.`,
    feedback: `Halo [Nama Client], draf pengerjaan untuk tahap [Nama Tahap] pada project [Nama Project] telah saya unggah ke Client Portal: [Tautan Client Portal].

Mohon bantuannya untuk meninjau hasil draf tersebut dan menuliskan catatan feedback atau konfirmasi persetujuan langsung di portal sebelum tanggal [Jatuh Tempo]. Terima kasih atas kerjasamanya!`,
    revision: `Halo [Nama Client], revisi berdasarkan masukan yang Anda berikan kemarin untuk project [Nama Project] telah selesai saya kerjakan.

Anda dapat langsung mengecek pembaruan visual atau revisi filenya di Client Portal kita: [Tautan Client Portal]. Mohon dicheck kembali ya, terima kasih!`,
    invoice: `Halo [Nama Client], berikut terlampir invoice [Nomor Invoice] untuk pengerjaan project [Nama Project] yang telah memasuki termin/tahap [Tahap].

Anda dapat melihat detail tagihan, mengunduh file invoice resmi, dan melihat instruksi transfer pembayaran langsung di Client Portal: [Tautan Client Portal]. Silakan berkabar apabila pembayaran telah dilakukan. Terima kasih banyak!`,
    delivery: `Halo [Nama Client], seluruh pengerjaan project [Nama Project] telah diselesaikan dan pembayaran invoice terkonfirmasi lunas. Terima kasih atas kerjasamanya!

Seluruh berkas serah terima final, source file mentah, dan dokumentasi pendukung kini telah diunggah dan dapat Anda download kapan saja melalui Client Portal pribadi Anda: [Tautan Client Portal]. Semoga sukses selalu untuk bisnis Anda!`
  }
};

function renderScripts() {
  const tabsContainer = document.getElementById('script-tabs');
  if (!tabsContainer) return;

  const lang = getLanguage();
  tabsContainer.innerHTML = '';

  scriptKeys.forEach(key => {
    const isActive = key === activeScriptKey;
    const btn = document.createElement('button');
    btn.className = `script-tab-btn ${isActive ? 'active-tab' : ''}`;
    btn.setAttribute('onclick', `window.selectScript('${key}')`);
    
    const labelText = scriptTabLabels[key][lang] || scriptTabLabels[key]['en'];
    btn.textContent = labelText;
    tabsContainer.appendChild(btn);
  });

  const contentBox = document.getElementById('script-content');
  if (contentBox) {
    contentBox.textContent = scripts[lang][activeScriptKey] || scripts['en'][activeScriptKey];
  }
}

function selectScript(scriptKey) {
  activeScriptKey = scriptKey;
  renderScripts();
}

function copyScriptText() {
  const lang = getLanguage();
  const text = scripts[lang][activeScriptKey] || scripts['en'][activeScriptKey];
  
  navigator.clipboard.writeText(text).then(() => {
    const successMsg = lang === 'id' ? "Script berhasil disalin." : "Script copied.";
    showToast(successMsg);
  }).catch(err => {
    console.error("Failed to copy script:", err);
  });
}

// --- Toast Notifications Manager ---
function showToast(message) {
  const holder = document.getElementById('toast-holder');
  if (!holder) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
    <span>${message}</span>
  `;
  holder.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// --- FAQ Accordion Logic ---
function toggleFaq(item) {
  const isActive = item.classList.contains('active');
  const allItems = document.querySelectorAll('.faq-container .faq-item');
  allItems.forEach(i => i.classList.remove('active'));

  if (!isActive) {
    item.classList.add('active');
  }
}

// --- Project Creator Modal & Flow Actions ---
function getActiveWorkspaceCurrency() {
  const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
  if (activeWorkspaceId) {
    const settingsStr = localStorage.getItem(`alurkarya_workspace_${activeWorkspaceId}_settings`);
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings.defaultCurrency) return settings.defaultCurrency;
      } catch(e) {}
    }
  }
  return localStorage.getItem('alurkarya_default_currency') || 'IDR';
}

function openProjectCreatorModal() {
  const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
  if (!activeWorkspaceId) {
    const isIndo = getLanguage() === 'id';
    alert(isIndo 
      ? "Pilih atau buat workspace terlebih dahulu sebelum membuat project." 
      : "Select or create a workspace before creating a project.");
    return;
  }

  // Pre-fill default currency from settings
  const defaultCurrency = getActiveWorkspaceCurrency();
  
  const overlay = document.createElement('div');
  overlay.className = 'pandu-modal-overlay';
  overlay.id = 'project-creator-modal';
  
  overlay.innerHTML = `
    <div class="pandu-modal-content">
      <div class="pandu-modal-header">
        <h3 class="pandu-modal-title" data-i18n="modal_title">Buat Project Pertama</h3>
        <button class="pandu-modal-close" onclick="window.closeProjectCreatorModal()">&times;</button>
      </div>
      
      <div class="pandu-form-group">
        <label class="pandu-label" data-i18n="label_project_name">Nama Project</label>
        <input type="text" class="pandu-input" id="pandu-project-title" required />
      </div>

      <div class="pandu-form-group">
        <label class="pandu-label" data-i18n="label_client_name">Nama Client</label>
        <input type="text" class="pandu-input" id="pandu-client-name" required />
      </div>

      <div class="pandu-grid-2">
        <div class="pandu-form-group">
          <label class="pandu-label" data-i18n="label_project_category">Jenis Project</label>
          <select class="pandu-select" id="pandu-category">
            <option value="Design">Design</option>
            <option value="Writing">Writing / Copywriting</option>
            <option value="Video">Video / Motion</option>
            <option value="Development">Development</option>
            <option value="Marketing">Marketing / Social Media</option>
            <option value="Consulting">Consulting / AI</option>
            <option value="General">General / Other</option>
          </select>
        </div>

        <div class="pandu-form-group">
          <label class="pandu-label" data-i18n="label_current_stage">Stage Saat Ini</label>
          <select class="pandu-select" id="pandu-stage">
            <option value="new_lead" selected>New Lead</option>
            <option value="queue">Queue</option>
            <option value="in_progress">In Progress</option>
            <option value="client_review">Client Review</option>
            <option value="revision">Revision</option>
            <option value="invoice_sent">Invoice Sent</option>
            <option value="waiting_payment">Waiting Payment</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div class="pandu-form-group">
        <label class="pandu-label" data-i18n="label_next_action">Next Action</label>
        <input type="text" class="pandu-input" id="pandu-next-action" data-i18n-placeholder="placeholder_next_action" required />
      </div>

      <div class="pandu-grid-2">
        <div class="pandu-form-group">
          <label class="pandu-label" data-i18n="label_deadline">Deadline</label>
          <input type="date" class="pandu-input" id="pandu-due-date" required />
        </div>

        <div class="pandu-grid-2">
          <div class="pandu-form-group">
            <label class="pandu-label" data-i18n="label_estimated_value">Nilai Project</label>
            <input type="number" class="pandu-input" id="pandu-budget" value="0" />
          </div>
          <div class="pandu-form-group">
            <label class="pandu-label" data-i18n="label_currency">Currency</label>
            <select class="pandu-select" id="pandu-currency">
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SGD">SGD</option>
            </select>
          </div>
        </div>
      </div>

      <div class="pandu-grid-2">
        <div class="pandu-form-group">
          <label class="pandu-label" data-i18n="label_review_link">Review Link</label>
          <input type="url" class="pandu-input" id="pandu-review-link" placeholder="https://..." />
        </div>

        <div class="pandu-form-group">
          <label class="pandu-label" data-i18n="label_delivery_link">Delivery Link</label>
          <input type="url" class="pandu-input" id="pandu-delivery-link" placeholder="https://..." />
        </div>
      </div>

      <div class="pandu-form-group">
        <label class="pandu-label" data-i18n="label_notes">Catatan Awal</label>
        <textarea class="pandu-textarea" id="pandu-notes" rows="2"></textarea>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
        <button class="btn btn-secondary" onclick="window.closeProjectCreatorModal()" data-i18n="btn_cancel" style="padding: 8px 16px;">Batal</button>
        <button class="btn btn-primary" onclick="window.saveFirstProject()" data-i18n="btn_save_project" style="padding: 8px 16px; background: #10b981; border-color: rgba(16, 185, 129, 0.25);">Buat Project</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Set default currency selection value
  const currencySelect = document.getElementById('pandu-currency');
  if (currencySelect) {
    currencySelect.value = defaultCurrency;
  }
  
  // Set default date to today + 7 days
  const dateInput = document.getElementById('pandu-due-date');
  if (dateInput) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    dateInput.value = futureDate.toISOString().split('T')[0];
  }

  // Set default next action value
  const nextActionInput = document.getElementById('pandu-next-action');
  if (nextActionInput) {
    const isIndo = getLanguage() === 'id';
    nextActionInput.value = isIndo ? 'Kirim proposal ke client' : 'Send proposal to client';
  }

  // Trigger data-i18n translation pass for modal contents
  renderLanguage();
}

function closeProjectCreatorModal() {
  const overlay = document.getElementById('project-creator-modal');
  if (overlay) overlay.remove();
}

function saveFirstProject() {
  const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
  if (!activeWorkspaceId) {
    const isIndo = getLanguage() === 'id';
    alert(isIndo 
      ? "Pilih atau buat workspace terlebih dahulu sebelum membuat project." 
      : "Select or create a workspace before creating a project.");
    return;
  }

  const titleInput = document.getElementById('pandu-project-title');
  const clientNameInput = document.getElementById('pandu-client-name');
  const nextActionInput = document.getElementById('pandu-next-action');
  const dueDateInput = document.getElementById('pandu-due-date');

  if (!titleInput || !titleInput.value.trim() ||
      !clientNameInput || !clientNameInput.value.trim() ||
      !nextActionInput || !nextActionInput.value.trim() ||
      !dueDateInput || !dueDateInput.value.trim()) {
    const isIndo = getLanguage() === 'id';
    alert(isIndo ? "Mohon lengkapi semua field wajib." : "Please fill in all required fields.");
    return;
  }

  try {
    const projectInput = {
      title: titleInput.value.trim(),
      clientName: clientNameInput.value.trim(),
      category: document.getElementById('pandu-category').value,
      stage: document.getElementById('pandu-stage').value,
      nextAction: nextActionInput.value.trim(),
      dueDate: dueDateInput.value.trim(),
      budget: Number(document.getElementById('pandu-budget').value) || 0,
      currency: document.getElementById('pandu-currency').value,
      reviewLink: document.getElementById('pandu-review-link').value.trim(),
      deliveryLink: document.getElementById('pandu-delivery-link').value.trim(),
      notes: document.getElementById('pandu-notes').value.trim()
    };

    // Save project using store helper
    const newProject = store.createProjectInActiveWorkspace(projectInput);
    
    // Dispatch refresh event to parent app if opened via window.open
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.dispatchEvent(new CustomEvent('alurkarya:workspace-state-updated', {
          detail: { source: 'project-created', projectId: newProject.id }
        }));
      } catch (err) {
        console.warn("Could not dispatch event to opener:", err);
      }
    }

    // Close form
    closeProjectCreatorModal();

    // Show Success Panel inside the modal overlay wrapper
    showSuccessOverlay(newProject.id);
    
    // Update checklist in AlurPandu
    loadChecklist();
    
  } catch(e) {
    console.error("Failed to save project:", e);
    alert("Error: " + e.message);
  }
}

function showSuccessOverlay(projectId) {
  const overlay = document.createElement('div');
  overlay.className = 'pandu-modal-overlay';
  overlay.id = 'project-success-modal';
  
  overlay.innerHTML = `
    <div class="pandu-modal-content" style="text-align: center; padding: 36px 24px; gap: 20px;">
      <div style="font-size: 3.5rem; color: #10b981; filter: drop-shadow(0 2px 10px rgba(16,185,129,0.3));">🎉</div>
      <div>
        <h3 class="pandu-modal-title" data-i18n="success_title" style="font-size: 1.3rem; margin-bottom: 8px;">Project Berhasil Dibuat</h3>
        <p data-i18n="success_message" style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; max-width: 400px; margin: 0 auto;">
          Project pertama berhasil dibuat. Sekarang kamu bisa lanjut mengelola project ini di Board AlurKarya.
        </p>
      </div>
      
      <div style="display: flex; justify-content: center; margin-top: 8px;">
        <button class="btn btn-primary" onclick="window.navigateToParentBoard('${projectId}')" data-i18n="btn_open_board" style="padding: 10px 24px; background: #10b981; border-color: rgba(16, 185, 129, 0.25); font-weight: 600;">Buka Board Project</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  renderLanguage();
}

function navigateToParentBoard(projectId) {
  // Close success overlay
  const successModal = document.getElementById('project-success-modal');
  if (successModal) successModal.remove();

  if (window.opener && !window.opener.closed) {
    try {
      if (window.opener.app && typeof window.opener.app.switchView === 'function') {
        // Switch view to Kanban board
        window.opener.app.switchView('kanban');
        
        // Reload parent store state to see the new project
        if (window.opener.store && typeof window.opener.store.loadState === 'function') {
          window.opener.store.loadState();
          if (typeof window.opener.store.notifyListeners === 'function') {
            window.opener.store.notifyListeners();
          }
        }
        
        // Trigger parent view update/re-render
        if (typeof window.opener.app.reRenderApp === 'function') {
          window.opener.app.reRenderApp();
        }
        
        // Focus opener window
        window.opener.focus();
        
        // Attempt to open the project modal for the new card after a small delay
        if (projectId && window.opener.app.projectModal && typeof window.opener.app.projectModal.open === 'function') {
          setTimeout(() => {
            const projects = window.opener.store.getState().projects || [];
            const targetProj = projects.find(p => p.id === projectId);
            if (targetProj) {
              window.opener.app.projectModal.open(targetProj);
            }
          }, 350);
        }
        
        showToast(getLanguage() === 'id' ? "Pindah ke Board AlurKarya berhasil." : "Switched to AlurKarya Board.");
        return;
      }
    } catch(e) {
      console.warn("Could not control parent window directly:", e);
    }
  }
  
  // Fallback if no window opener
  const isIndo = getLanguage() === 'id';
  showToast(isIndo 
    ? "Project tersimpan. Buka AlurKarya di tab utama untuk melihat project ini." 
    : "Project saved. Open the main AlurKarya tab to view this project.");
}

// --- Initialize Page Settings & Dynamic UI Elements ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Language selector event listener setup
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // 2. Set up document attributes
  updateDocumentLanguage();

  // 3. Load database variables
  loadChecklist();
  loadFreelancerProfile();
  loadSafetyAcknowledgementState();

  // 4. Render all UI elements with appropriate translations
  renderLanguage();
});

// --- Workspace Safety Section Helper Functions ---
function renderFileChecklist() {
  const list = document.getElementById('file-setup-checklist-list');
  if (!list) return;
  
  list.innerHTML = '';
  const lang = getLanguage();
  
  const items = lang === 'id' ? [
    "Buat folder utama project di Drive/Dropbox.",
    "Pisahkan folder Brief, Asset, Review, Final Delivery, dan Source File jika diperlukan.",
    "Atur permission file sesuai kebutuhan client.",
    "Copy link review atau preview ke Delivery Center.",
    "Copy link final delivery setelah project selesai.",
    "Jangan masukkan file sensitif ke link public.",
    "Cek ulang apakah client hanya melihat file yang memang boleh dilihat."
  ] : [
    "Create a main project folder in Drive/Dropbox.",
    "Separate Brief, Assets, Review, Final Delivery, and Source File folders if needed.",
    "Set file permissions based on client access needs.",
    "Copy review or preview links into Delivery Center.",
    "Copy final delivery links after the project is complete.",
    "Do not put sensitive files inside public links.",
    "Double-check that clients only see files they are allowed to see."
  ];
  
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
}

function updateWorkspaceStatusBadge() {
  const badge = document.getElementById('safety-ws-status-badge');
  if (!badge) return;
  
  const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
  if (activeWorkspaceId) {
    let wsName = "Active";
    try {
      const workspaces = store.getWorkspaces() || [];
      const currentWs = workspaces.find(w => w.workspaceId === activeWorkspaceId);
      if (currentWs) {
        wsName = currentWs.workspaceName;
      }
    } catch(e) {}
    
    const isIndo = getLanguage() === 'id';
    badge.textContent = `${isIndo ? 'Workspace Aktif:' : 'Active Workspace:'} ${wsName}`;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function handleWorkspaceAction() {
  const parent = window.opener;
  const isIndo = getLanguage() === 'id';
  if (!parent || parent.closed || !parent.AlurKaryaActions || typeof parent.AlurKaryaActions.openWorkspaceSwitcher !== 'function') {
    showToast(isIndo ? "Buka AlurKarya terlebih dahulu." : "Please open AlurKarya first.");
    return;
  }
  try {
    parent.AlurKaryaActions.openWorkspaceSwitcher();
    parent.focus();
    showToast(isIndo ? "Pindah ke halaman pemilihan workspace." : "Navigated to Workspace Selection.");
  } catch (error) {
    showToast(isIndo ? "Aksi belum bisa dijalankan. Gunakan dashboard AlurKarya utama." : "Action cannot be run yet. Use the main AlurKarya dashboard.");
  }
}

function handleLockWorkspace() {
  const parent = window.opener;
  const isIndo = getLanguage() === 'id';
  if (!parent || parent.closed || !parent.AlurKaryaActions || typeof parent.AlurKaryaActions.lockWorkspace !== 'function') {
    showToast(isIndo ? "Gunakan fitur ini dari dashboard AlurKarya utama Anda." : "Use this feature from your main AlurKarya dashboard.");
    return;
  }
  try {
    parent.AlurKaryaActions.lockWorkspace();
    parent.focus();
    showToast(isIndo ? "Workspace berhasil dikunci." : "Workspace locked successfully.");
  } catch (error) {
    showToast(isIndo ? "Aksi belum bisa dijalankan. Gunakan dashboard AlurKarya utama." : "Action cannot be run yet. Use the main AlurKarya dashboard.");
  }
}

function handleExportBackup() {
  const parent = window.opener;
  const isIndo = getLanguage() === 'id';
  if (!parent || parent.closed || !parent.AlurKaryaActions || typeof parent.AlurKaryaActions.exportBackup !== 'function') {
    showToast(isIndo ? "Gunakan fitur ini dari dashboard AlurKarya utama Anda." : "Use this feature from your main AlurKarya dashboard.");
    return;
  }
  try {
    parent.AlurKaryaActions.exportBackup();
    localStorage.setItem('alurkarya_backup_exported', 'true');
    loadChecklist();
    showToast(isIndo ? "File backup berhasil diekspor." : "Backup file exported.");
  } catch (error) {
    showToast(isIndo ? "Aksi belum bisa dijalankan. Gunakan dashboard AlurKarya utama." : "Action cannot be run yet. Use the main AlurKarya dashboard.");
  }
}

function initProjectTemplateSelector() {
  const select = document.getElementById('link-template-project-select');
  const btn = document.getElementById('btn-save-template-links');
  const warnArea = document.getElementById('link-template-warning-area');
  
  if (!select || !btn) return;
  
  select.innerHTML = '';
  const stateProjects = store.projects || [];
  const lang = getLanguage();
  const inputs = ['link-template-brief', 'link-template-review', 'link-template-delivery', 'link-template-source', 'link-template-staging'];
  
  if (stateProjects.length === 0) {
    // 0 projects flow
    select.disabled = true;
    btn.disabled = true;
    
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });

    const msg = lang === 'id'
      ? "Buat project terlebih dahulu sebelum menyimpan link ke Delivery Center."
      : "Create a project first before saving links to Delivery Center.";
    
    if (warnArea) {
      warnArea.textContent = msg;
      warnArea.style.color = '#ef4444'; // Red error warning color
      warnArea.style.display = 'block';
    }
  } else if (stateProjects.length === 1) {
    // 1 project flow - auto-select and show name before saving
    select.disabled = false;
    btn.disabled = false;
    
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });

    const singleProj = stateProjects[0];
    const opt = document.createElement('option');
    opt.value = singleProj.id;
    opt.textContent = singleProj.title || 'Untitled Project';
    select.appendChild(opt);
    select.value = singleProj.id;

    const msg = lang === 'id'
      ? `Project tujuan otomatis: ${singleProj.title}`
      : `Automated target project: ${singleProj.title}`;
    
    if (warnArea) {
      warnArea.textContent = msg;
      warnArea.style.color = '#38bdf8'; // Sky blue info color
      warnArea.style.display = 'block';
    }

    // Auto-load values
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === 'link-template-brief') el.value = singleProj.briefLink || '';
        if (id === 'link-template-review') el.value = singleProj.previewLink || singleProj.reviewLink || '';
        if (id === 'link-template-delivery') el.value = singleProj.finalFileLink || '';
        if (id === 'link-template-source') el.value = singleProj.sourceFileLink || '';
        if (id === 'link-template-staging') el.value = singleProj.stagingLink || '';
      }
    });
  } else {
    // Multiple projects flow
    select.disabled = false;
    btn.disabled = false;
    
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });

    if (warnArea) {
      warnArea.style.display = 'none';
    }

    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = lang === 'id' ? '-- Pilih Project --' : '-- Select Project --';
    select.appendChild(placeholderOpt);

    stateProjects.forEach(proj => {
      const opt = document.createElement('option');
      opt.value = proj.id;
      opt.textContent = proj.title || 'Untitled Project';
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      const projId = select.value;
      if (!projId) {
        inputs.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        return;
      }
      
      const targetProj = stateProjects.find(p => p.id === projId);
      if (targetProj) {
        document.getElementById('link-template-brief').value = targetProj.briefLink || '';
        document.getElementById('link-template-review').value = targetProj.previewLink || targetProj.reviewLink || '';
        document.getElementById('link-template-delivery').value = targetProj.finalFileLink || '';
        document.getElementById('link-template-source').value = targetProj.sourceFileLink || '';
        document.getElementById('link-template-staging').value = targetProj.stagingLink || '';
      }
    });
  }
}

function saveTemplateLinks() {
  const select = document.getElementById('link-template-project-select');
  const projId = select ? select.value : '';
  const lang = getLanguage();
  
  if (!projId) {
    const warningText = lang === 'id' ? "Pilih project tujuan terlebih dahulu." : "Select a target project first.";
    showToast(warningText);
    return;
  }
  
  const briefVal = document.getElementById('link-template-brief').value.trim();
  const reviewVal = document.getElementById('link-template-review').value.trim();
  const deliveryVal = document.getElementById('link-template-delivery').value.trim();
  const sourceVal = document.getElementById('link-template-source').value.trim();
  const stagingVal = document.getElementById('link-template-staging').value.trim();
  
  const linkUpdates = {
    briefLink: briefVal,
    previewLink: reviewVal,
    reviewLink: reviewVal,
    finalFileLink: deliveryVal,
    sourceFileLink: sourceVal,
    stagingLink: stagingVal
  };

  const parent = window.opener;
  if (!parent || parent.closed || !parent.AlurKaryaActions || typeof parent.AlurKaryaActions.saveProjectLinks !== 'function') {
    // Local fallback save
    store.updateProject(projId, linkUpdates);
    store.saveState();
    loadChecklist();
    showToast(lang === 'id' ? "Gunakan fitur ini dari dashboard AlurKarya utama Anda." : "Use this feature from your main AlurKarya dashboard.");
    return;
  }

  try {
    parent.AlurKaryaActions.saveProjectLinks(projId, linkUpdates);
    
    // Update local guide store instance
    store.updateProject(projId, linkUpdates);
    store.saveState();
    
    loadChecklist();
    const successMsg = lang === 'id' ? "Link berhasil disimpan ke project." : "Links successfully saved to project.";
    showToast(successMsg);
  } catch (error) {
    showToast(lang === 'id' ? "Aksi belum bisa dijalankan. Gunakan dashboard AlurKarya utama." : "Action cannot be run yet. Use the main AlurKarya dashboard.");
  }
}

function loadSafetyAcknowledgementState() {
  const checkbox = document.getElementById('safety-acknowledge-checkbox');
  if (checkbox) {
    const acknowledged = localStorage.getItem('workspaceSafetyAcknowledged') === 'true' || 
                         localStorage.getItem('alurkarya_workspace_safety_acknowledged') === 'true';
    checkbox.checked = acknowledged;
  }
}

function toggleSafetyAcknowledgement() {
  const checkbox = document.getElementById('safety-acknowledge-checkbox');
  if (checkbox) {
    const acknowledged = checkbox.checked;
    localStorage.setItem('alurkarya_workspace_safety_acknowledged', acknowledged ? 'true' : 'false');
    localStorage.setItem('workspaceSafetyAcknowledged', acknowledged ? 'true' : 'false');
    loadChecklist();
  }
}

// Bind methods globally so inline HTML onclick attributes function in ES Module type
window.scrollToSection = scrollToSection;
window.selectAudit = selectAudit;
window.toggleChecklist = toggleChecklist;
window.resetChecklist = resetChecklist;
window.openParentProfile = openParentProfile;
window.selectRole = selectRole;
window.toggleGuideCheck = toggleGuideCheck;
window.selectScript = selectScript;
window.copyScriptText = copyScriptText;
window.toggleFaq = toggleFaq;
window.openProjectCreatorModal = openProjectCreatorModal;
window.closeProjectCreatorModal = closeProjectCreatorModal;
window.saveFirstProject = saveFirstProject;
window.navigateToParentBoard = navigateToParentBoard;
window.handleWorkspaceAction = handleWorkspaceAction;
window.handleLockWorkspace = handleLockWorkspace;
window.handleExportBackup = handleExportBackup;
window.saveTemplateLinks = saveTemplateLinks;
window.toggleSafetyAcknowledgement = toggleSafetyAcknowledgement;
window.loadSafetyAcknowledgementState = loadSafetyAcknowledgementState;
