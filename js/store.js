/* ==========================================================================
   FREELANCER PROJECT OS - CENTRAL STORAGE & STORE COMPONENT
   ========================================================================== */

import { generateId, getBrowserTimezone, getInitials, normalizeProject } from './utils.js';
import { applyTemplateProjects } from './components/FreelancerTemplates.js';


/**
 * Seed data generator with 9 realistic freelance projects in Indonesian Rupiah (IDR).
 */
function getInitialSeedData() {
  const c1 = generateId();
  const c2 = generateId();
  const c3 = generateId();

  const clients = [
    {
      id: c1,
      name: 'Sarah Jenkins',
      businessName: 'Acme Corp',
      email: 'sjenkins@acmecorp.com',
      phone: '+62 812-3456-7890',
      status: 'Active',
      lastFollowUpDate: '2026-06-01',
      notes: 'Brand identity projects. Fast signer, invoice terms Net 15 transfer.',
      createdAt: '2026-05-01'
    },
    {
      id: c2,
      name: 'David Miller',
      businessName: 'Apex Software',
      email: 'dmiller@apexsoft.io',
      phone: '+62 821-9876-5432',
      status: 'Completed',
      lastFollowUpDate: '2026-05-25',
      notes: 'Tech client. High budget projects. Prefers WhatsApp check-ins.',
      createdAt: '2026-04-15'
    },
    {
      id: c3,
      name: 'Clara Oswald',
      businessName: 'Luna Creative',
      email: 'clara@lunacreative.co',
      phone: '+62 857-1122-3344',
      status: 'Lead',
      lastFollowUpDate: '2026-06-02',
      notes: 'Potential client for monthly video packages retainer.',
      createdAt: '2026-05-28'
    }
  ];

  const p1 = generateId();
  const p2 = generateId();
  const p3 = generateId();
  const p4 = generateId();
  const p5 = generateId();
  const p6 = generateId();

  const today = new Date();
  const formatDateOffset = (days) => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const projects = [
    {
      id: p1,
      title: 'Landing Page Copywriting',
      clientId: c3,
      clientName: 'Clara Oswald (Luna Creative)',
      budget: 2500000, // Rp2.500.000
      currency: 'IDR',
      stage: 'new_lead',
      description: 'Copywriting marketing headers and custom service descriptions for client landing pages.',
      dueDate: '2026-06-12',
      priority: 'Medium',
      briefLink: '',
      assetLink: '',
      tags: ['Copywriting'],
      revisionRound: 0,
      maxRevisionRounds: 2,
      revisionNotes: '',
      paymentStatus: 'Not invoiced',
      nextAction: 'Send discovery questions',
      internalNotes: 'Ensure copywriting matches standard SEO keywords.',
      portfolioShowcase: false,
      portfolioDescription: '',
      resultDescription: '',
      testimonial: '',
      showcaseStatus: 'Private',
      checklist: [
        { id: generateId(), text: 'Review client brand specifications', completed: true },
        { id: generateId(), text: 'Draft discovery questionnaire and questions', completed: false }
      ],
      deliverables: [],
      invoices: []
    },
    {
      id: p2,
      title: 'Shopify Retool Development',
      clientId: c2,
      clientName: 'David Miller (Apex Software)',
      budget: 10000000, // Rp10.000.000
      currency: 'IDR',
      stage: 'proposal_sent',
      description: 'Liquidity checkout theme customization and API backend panel integration.',
      dueDate: '2026-06-20',
      priority: 'Medium',
      briefLink: 'https://github.com/apex-software/retool-brief',
      assetLink: '',
      tags: ['Website Development'],
      revisionRound: 0,
      maxRevisionRounds: 3,
      revisionNotes: '',
      paymentStatus: 'Quotation sent',
      nextAction: 'Follow up quotation',
      internalNotes: 'David prefers quick sandbox prototypes.',
      portfolioShowcase: false,
      portfolioDescription: '',
      resultDescription: '',
      testimonial: '',
      showcaseStatus: 'Private',
      checklist: [
        { id: generateId(), text: 'Define client API requirements sheet', completed: true },
        { id: generateId(), text: 'Email project proposal details', completed: true }
      ],
      deliverables: [],
      invoices: []
    },
    {
      id: p3,
      title: 'Brand Identity Design',
      clientId: c1,
      clientName: 'Sarah Jenkins (Acme Corp)',
      budget: 4500000, // Rp4.500.000
      currency: 'IDR',
      stage: 'in_progress',
      description: 'Revamping visual brand elements, typography guidelines, and warning labels.',
      dueDate: '2026-06-07',
      priority: 'High',
      briefLink: 'https://acmecorp.com/branding-brief',
      assetLink: 'https://figma.com/file/acme-brand',
      tags: ['Design'],
      revisionRound: 1,
      maxRevisionRounds: 3,
      revisionNotes: 'Sarah requested typography updates on print guidelines templates.',
      paymentStatus: 'DP paid',
      nextAction: 'Finish logo system draft',
      internalNotes: 'Ensure Pantone standard palette matches guidelines.',
      portfolioShowcase: true,
      portfolioDescription: 'Created a refreshed brand identity system for consistent visual communication.',
      resultDescription: 'Delivered logo direction, color palette, typography system, and brand usage examples.',
      testimonial: '"The new identity made our brand look more consistent and professional."',
      showcaseStatus: 'Draft Case Study',
      checklist: [
        { id: generateId(), text: 'Collect logo assets & warning dimensions', completed: true },
        { id: generateId(), text: 'Revise visual identity draft designs', completed: false }
      ],
      deliverables: [
        { id: generateId(), title: 'Vector Pantone Draft', linkUrl: 'https://figma.com/file/acme-brand', version: 1, status: 'SentForReview' }
      ],
      invoices: []
    },
    {
      id: p4,
      title: 'Packaging Label Vector Suite',
      clientId: c1,
      clientName: 'Sarah Jenkins (Acme Corp)',
      budget: 1800000, // Rp1.800.000
      currency: 'IDR',
      stage: 'revision',
      description: 'Vector labels export suite for physical product packaging layouts.',
      dueDate: '2026-06-01',
      priority: 'High',
      briefLink: '',
      assetLink: 'https://canva.com/design/acme-pack',
      tags: ['Design'],
      revisionRound: 1,
      maxRevisionRounds: 2,
      revisionNotes: 'Awaiting client approval on Pantone revisions.',
      paymentStatus: 'Waiting final approval',
      nextAction: 'Complete revision round 2',
      internalNotes: 'Files sent. Awaiting review feedback.',
      portfolioShowcase: false,
      portfolioDescription: '',
      resultDescription: '',
      testimonial: '',
      showcaseStatus: 'Private',
      checklist: [
        { id: generateId(), text: 'Verify barcode specification templates', completed: true },
        { id: generateId(), text: 'Export high-res vector files package', completed: true }
      ],
      deliverables: [
        { id: generateId(), title: 'Canva Design Link', linkUrl: 'https://canva.com/design/acme-pack', version: 1, status: 'Approved' }
      ],
      invoices: []
    },
    {
      id: p5,
      title: 'React Custom Analytics Dashboard',
      clientId: c2,
      clientName: 'David Miller (Apex Software)',
      budget: 6000000, // Rp6.000.000
      currency: 'IDR',
      stage: 'waiting_payment',
      description: 'Coded multi-currency charts storefront metrics dashboard in React SPA.',
      dueDate: '2026-06-01',
      priority: 'High',
      briefLink: 'https://github.com/apex/shop-brief',
      assetLink: 'https://github.com/apex/shop-code',
      tags: ['Development'],
      revisionRound: 2,
      maxRevisionRounds: 4,
      revisionNotes: 'Dashboard layout finalized and approved.',
      paymentStatus: 'Invoice overdue',
      nextAction: 'Send payment reminder',
      internalNotes: 'Follow up closely on outstanding invoice.',
      portfolioShowcase: false,
      portfolioDescription: '',
      resultDescription: '',
      testimonial: '',
      showcaseStatus: 'Private',
      checklist: [
        { id: generateId(), text: 'Build charting modules and tables', completed: true },
        { id: generateId(), text: 'Deliver staging credentials to David', completed: true }
      ],
      deliverables: [
        { id: generateId(), title: 'Shopify Store Live URL', linkUrl: 'https://apex-software-store.myshopify.com', version: 2, status: 'Approved' }
      ],
      invoices: []
    },
    {
      id: p6,
      title: 'AI Workflow Setup',
      clientId: c2,
      clientName: 'David Miller (Apex Software)',
      budget: 6500000, // Rp6.500.000
      currency: 'IDR',
      stage: 'completed',
      description: 'Automating customer email onboarding and financial ledger runs via make.com scenarios.',
      dueDate: '2026-05-28',
      priority: 'Medium',
      briefLink: 'https://apex.com/ai-brief',
      assetLink: 'https://make.com/scenarios/12345',
      tags: ['Consulting'],
      revisionRound: 2,
      maxRevisionRounds: 2,
      revisionNotes: 'Integration completed successfully. Tested API links.',
      paymentStatus: 'Paid',
      nextAction: 'Request testimonial',
      internalNotes: 'Automate make scenarios. David is highly satisfied.',
      portfolioShowcase: true,
      portfolioDescription: 'Helped the client organize repetitive workflow tasks using AI-assisted systems.',
      resultDescription: 'Delivered workflow map, automation checklist, and implementation guide.',
      testimonial: '"The workflow is now clearer and easier for our team to manage."',
      showcaseStatus: 'Ready to Showcase',
      checklist: [
        { id: generateId(), text: 'Chart customer email onboarding logic', completed: true },
        { id: generateId(), text: 'Configure and test make.com webhook triggers', completed: true }
      ],
      deliverables: [
        { id: generateId(), title: 'Workflow Playbook PDF', linkUrl: 'https://apex.com/ai-playbook', version: 2, status: 'Approved' }
      ],
      invoices: []
    }
  ];

  // Link invoices to stage-appropriate projects
  const invoices = [
    {
      id: generateId(),
      projectId: p5,
      projectName: 'React Custom Analytics Dashboard',
      invoiceNumber: 'INV-2026-001',
      amount: 6000000, // Rp6.000.000
      currency: 'IDR',
      dueDate: '2026-06-01',
      status: 'Overdue',
      sentDate: formatDateOffset(-15)
    },
    {
      id: generateId(),
      projectId: p6,
      projectName: 'AI Workflow Setup',
      invoiceNumber: 'INV-2026-002',
      amount: 6500000, // Rp6.500.000
      currency: 'IDR',
      dueDate: '2026-05-28',
      status: 'Paid',
      sentDate: formatDateOffset(-15),
      paidDate: formatDateOffset(-4)
    }
  ];

  // Map invoices inside the project sub-arrays and populate default fields
  projects.forEach(p => {
    p.invoices = invoices.filter(inv => inv.projectId === p.id);
    
    // Ensure new fields have robust pre-seeds
    p.downPaymentPercent = 50;
    p.downPaymentAmount = Math.round(p.budget * 0.5);
    p.milestonePaymentAmount = 0;
    p.finalPaymentAmount = p.budget - p.downPaymentAmount;
    p.remainingBalance = p.budget - p.downPaymentAmount;
    p.paymentMethod = 'Bank Transfer';
    p.rawFileLink = '';
    p.draftFileLink = '';
    p.finalDeliveryLink = '';
    p.referenceFolderLink = '';
    p.meetingPlatform = 'Google Meet';
    p.meetingLink = '';
    p.meetingNotes = '';
    p.quotationId = '';
    p.quotationStatus = 'None';
  });

  // Seed Quotations
  const q1 = generateId();
  const q2 = generateId();
  const quotations = [
    {
      id: q1,
      quotationNumber: 'QT-2026-001',
      clientId: c3,
      clientName: 'Clara Oswald (Luna Creative)',
      projectTitle: 'Landing Page Copywriting',
      serviceItems: [
        { description: 'Landing page copy V1 headers & descriptions', qty: 1, price: 2500000, discount: 0 }
      ],
      totalValue: 2500000,
      paymentTerms: '50% Down Payment on initiation, 50% Final Payment on completion',
      notes: 'Deliverable turnaround is 4 days.',
      status: 'Accepted',
      createdAt: '2026-05-25'
    },
    {
      id: q2,
      quotationNumber: 'QT-2026-002',
      clientId: c2,
      clientName: 'David Miller (Apex Software)',
      projectTitle: 'Shopify Retool Development',
      serviceItems: [
        { description: 'Liquid template checkout optimization', qty: 1, price: 10000000, discount: 0 }
      ],
      totalValue: 10000000,
      paymentTerms: '100% upfront transfer payment',
      notes: 'Will integrate and test inside developer sandbox stage.',
      status: 'Sent',
      createdAt: '2026-06-01'
    }
  ];

  return { projects, clients, invoices, quotations };
}

/**
 * State store class managing local react-like notifications on triggers.
 */
export class WorkspaceStore {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  /**
   * Loads workspace from LocalStorage or generates rich seeds.
   */
  loadState() {
    try {
      // 1. Run storage migration first
      const migrationDone = localStorage.getItem('alurkarya_workspace_migration_v1_done') === 'true';
      const indexStr = localStorage.getItem('alurkarya_workspace_index');
      const index = indexStr ? JSON.parse(indexStr) : [];
      
      const oldState = localStorage.getItem('freelancer_os_workspace');
      const oldProfile = localStorage.getItem('alurkarya_freelancer_profile');
      
      if (!migrationDone && (oldState || oldProfile) && index.length === 0) {
        const lang = localStorage.getItem('alurkarya_language') || 'en';
        const wsName = lang === 'id' ? 'Workspace Saya' : 'My Workspace';
        const wsId = 'wk_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
        
        const defaultWorkspace = {
          workspaceId: wsId,
          workspaceName: wsName,
          createdAt: new Date().toISOString(),
          lastOpenedAt: new Date().toISOString(),
          workspacePinHash: null
        };
        localStorage.setItem('alurkarya_workspace_index', JSON.stringify([defaultWorkspace]));
        
        if (oldState) {
          localStorage.setItem(`alurkarya_workspace_${wsId}_state`, oldState);
        }
        if (oldProfile) {
          localStorage.setItem(`alurkarya_workspace_${wsId}_profile`, oldProfile);
        }
        const oldCurrency = localStorage.getItem('alurkarya_default_currency');
        if (oldCurrency) {
          localStorage.setItem(`alurkarya_workspace_${wsId}_settings`, JSON.stringify({ defaultCurrency: oldCurrency }));
        }
        localStorage.setItem('alurkarya_workspace_migration_v1_done', 'true');
      }

      // 2. Check if a workspace is active
      const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
      if (!activeWorkspaceId) {
        // Return a blank state if no workspace is active
        this.projects = [];
        this.clients = [];
        this.invoices = [];
        this.quotations = [];
        this.weeklyReflections = '';
        this.availability = { timezone: 'Asia/Jakarta', slots: [] };
        this.freelancerProfile = { freelancerName: '', freelancerRole: '' };
        return;
      }

      const stateKey = `alurkarya_workspace_${activeWorkspaceId}_state`;
      const profileKey = `alurkarya_workspace_${activeWorkspaceId}_profile`;

      const stored = localStorage.getItem(stateKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.projects = (parsed.projects || []).map(p => normalizeProject(p));
        this.clients = parsed.clients || [];
        this.invoices = parsed.invoices || [];
        this.quotations = parsed.quotations || [];
        this.weeklyReflections = parsed.weeklyReflections || this.getDefaultReflections();
        this.availability = parsed.availability || this.getDefaultAvailability();
        
        const storedProfile = localStorage.getItem(profileKey);
        this.freelancerProfile = storedProfile ? JSON.parse(storedProfile) : (parsed.freelancerProfile || this.getDefaultFreelancerProfile());

        let migrated = false;

        if (parsed.availability) {
          if (!parsed.availability.timezone) {
            this.availability.timezone = getBrowserTimezone();
            migrated = true;
          }
        } else {
          migrated = true;
        }

        if (!parsed.quotations) {
          const seed = getInitialSeedData();
          this.quotations = seed.quotations;
          migrated = true;
        }

        // AUTOMATIC MIGRATION: Force reload new 6-project stable seeds if old title list loaded
        const hasOldSeeds = this.projects.some(p => 
          p.title === 'TikTok Retainer Monthly Retouch' || 
          p.title === 'TikTok Video Editing Package' || 
          p.title === 'Brand Identity & Guidelines Redesign' || 
          p.title === 'AI Workflow Integration Consulting'
        );
        if (hasOldSeeds) {
          const seed = getInitialSeedData();
          this.projects = seed.projects;
          this.clients = seed.clients;
          this.invoices = seed.invoices;
          this.quotations = seed.quotations;
          this.weeklyReflections = this.getDefaultReflections();
          this.availability = this.getDefaultAvailability();
          migrated = true;
        }

        // STANDARD DATA MODEL FILLER
        this.projects = this.projects.map(p => {
          p = normalizeProject(p);
          if (p.budget < 1000000) {
            p.budget = p.budget * 1000;
            migrated = true;
          }
          if (!p.currency) {
            p.currency = 'IDR';
            migrated = true;
          }
          const defaultCurrency = window.getDefaultCurrency ? window.getDefaultCurrency() : 'IDR';
          if (!p.projectCurrency) {
            p.projectCurrency = defaultCurrency;
            migrated = true;
          }
          if (!p.invoiceCurrency) {
            p.invoiceCurrency = p.projectCurrency || defaultCurrency;
            migrated = true;
          }
          if (!p.paymentCurrency) {
            p.paymentCurrency = p.invoiceCurrency || p.projectCurrency || defaultCurrency;
            migrated = true;
          }
          if (p.downPaymentPercent === undefined) {
            p.downPaymentPercent = 50;
            p.downPaymentAmount = Math.round(p.budget * 0.5);
            p.milestonePaymentAmount = 0;
            p.finalPaymentAmount = p.budget - p.downPaymentAmount;
            p.remainingBalance = p.budget - p.downPaymentAmount;
            p.paymentMethod = 'Bank Transfer';
            p.rawFileLink = '';
            p.draftFileLink = '';
            p.finalDeliveryLink = '';
            p.referenceFolderLink = '';
            p.meetingPlatform = 'Google Meet';
            p.meetingLink = '';
            p.meetingNotes = '';
            p.quotationId = '';
            p.quotationStatus = 'None';
            migrated = true;
          }
          if (p.clientType === undefined) { p.clientType = 'General'; migrated = true; }
          if (p.customClientName === undefined) { p.customClientName = ''; migrated = true; }
          if (p.customCategory === undefined) { p.customCategory = ''; migrated = true; }
          if (p.createdAt === undefined) { p.createdAt = new Date().toISOString(); migrated = true; }
          if (p.revisionCount === undefined) { p.revisionCount = p.revisionRound !== undefined ? p.revisionRound : 0; migrated = true; }
          if (p.maxRevision === undefined) { p.maxRevision = p.maxRevisionRounds !== undefined ? p.maxRevisionRounds : 3; migrated = true; }
          if (p.clientApprovalStatus === undefined) { p.clientApprovalStatus = 'Pending Review'; migrated = true; }
          if (p.invoiceNumber === undefined) { p.invoiceNumber = ''; migrated = true; }
          if (p.invoiceDate === undefined) { p.invoiceDate = ''; migrated = true; }
          if (p.invoiceDueDate === undefined) { p.invoiceDueDate = ''; migrated = true; }
          if (p.invoiceAmount === undefined) { p.invoiceAmount = 0; migrated = true; }
          if (p.invoiceFileLink === undefined) { p.invoiceFileLink = ''; migrated = true; }
          if (p.paymentTerms === undefined) { p.paymentTerms = ''; migrated = true; }
          if (p.paymentDueDate === undefined) { p.paymentDueDate = ''; migrated = true; }
          if (p.paymentReceiptLink === undefined) { p.paymentReceiptLink = ''; migrated = true; }
          if (p.lastFollowUpDate === undefined) { p.lastFollowUpDate = ''; migrated = true; }
          if (p.nextFollowUpDate === undefined) { p.nextFollowUpDate = ''; migrated = true; }
          if (p.rawFileDownloadLink === undefined) { p.rawFileDownloadLink = ''; migrated = true; }
          if (p.isCompletedLocked === undefined) { p.isCompletedLocked = false; migrated = true; }
          if (p.holdReason === undefined) { p.holdReason = ''; migrated = true; }
          if (p.holdDate === undefined) { p.holdDate = ''; migrated = true; }
          if (p.holdFollowUpDate === undefined) { p.holdFollowUpDate = ''; migrated = true; }
          if (p.meetingDate === undefined) { p.meetingDate = ''; migrated = true; }
          if (p.meetingTime === undefined) { p.meetingTime = ''; migrated = true; }
          if (p.meetingType === undefined) { p.meetingType = 'Google Meet'; migrated = true; }
          if (p.meetingTimezone === undefined) { p.meetingTimezone = 'Asia/Jakarta'; migrated = true; }
          if (p.clientRequest === undefined) { p.clientRequest = ''; migrated = true; }
          if (p.keyDiscussionPoints === undefined) { p.keyDiscussionPoints = ''; migrated = true; }
          if (p.decisionMade === undefined) { p.decisionMade = ''; migrated = true; }
          if (p.actionItems === undefined) { p.actionItems = ''; migrated = true; }
          if (p.clientConcern === undefined) { p.clientConcern = ''; migrated = true; }
          if (p.clientExpectation === undefined) { p.clientExpectation = ''; migrated = true; }
          if (p.clientReviewDate === undefined) { p.clientReviewDate = ''; migrated = true; }
          if (p.finalDeliveryDate === undefined) { p.finalDeliveryDate = ''; migrated = true; }
          if (p.clientVisibleNotes === undefined) { p.clientVisibleNotes = ''; migrated = true; }
          if (p.previewLink === undefined) { p.previewLink = ''; migrated = true; }
          if (p.draftLink === undefined) { p.draftLink = ''; migrated = true; }
          if (p.reviewLink === undefined) { p.reviewLink = ''; migrated = true; }
          if (p.fileFolderLink === undefined) { p.fileFolderLink = ''; migrated = true; }
          if (p.stagingLink === undefined) { p.stagingLink = ''; migrated = true; }
          if (p.finalFileLink === undefined) { p.finalFileLink = ''; migrated = true; }
          if (p.deliveryDate === undefined) { p.deliveryDate = ''; migrated = true; }
          if (p.handoverNotes === undefined) { p.handoverNotes = ''; migrated = true; }
          if (p.approvalStatus === undefined) { p.approvalStatus = 'Pending Review'; migrated = true; }
          if (p.approvedAt === undefined) { p.approvedAt = ''; migrated = true; }
          if (p.clientFeedbackSummary === undefined) { p.clientFeedbackSummary = ''; migrated = true; }
          if (p.invoiceStatus === undefined) { p.invoiceStatus = 'Not Created'; migrated = true; }
          if (p.paymentStatus === undefined) { p.paymentStatus = 'Not Started'; migrated = true; }
          if (p.amountPaid === undefined) { p.amountPaid = 0; migrated = true; }
          if (p.amountDue === undefined) { p.amountDue = 0; migrated = true; }
          if (p.paymentMethod === undefined) { p.paymentMethod = ''; migrated = true; }
          if (p.paymentNotes === undefined) { p.paymentNotes = ''; migrated = true; }
          if (p.receiptLink === undefined) { p.receiptLink = p.paymentReceiptLink || ''; migrated = true; }
          if (p.invoiceFileLink === undefined) { p.invoiceFileLink = ''; migrated = true; }
          if (p.deliveryStatus === undefined) { p.deliveryStatus = 'Not Submitted'; migrated = true; }
          if (p.clientConfirmedDelivery === undefined) { p.clientConfirmedDelivery = false; migrated = true; }
          if (p.firstCutLink === undefined) { p.firstCutLink = ''; migrated = true; }
          if (p.designPreviewLink === undefined) { p.designPreviewLink = ''; migrated = true; }
          if (p.sourceFileLink === undefined) { p.sourceFileLink = ''; migrated = true; }
          if (!p.deliveryChecklist || !Array.isArray(p.deliveryChecklist)) {
            const generalChecklist = ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"];
            let defaultLabels = generalChecklist;
            if (p.templateRole) {
              const roleChecklists = {
                designer: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
                video_editor: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
                copywriter: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
                web_developer: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
                social_media_manager: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
                ai_consultant: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"]
              };
              if (roleChecklists[p.templateRole]) {
                defaultLabels = roleChecklists[p.templateRole];
              }
            }
            p.deliveryChecklist = defaultLabels.map(label => ({
              id: 'del_' + Math.random().toString(36).substring(2, 9),
              label,
              completed: false,
              clientVisible: true
            }));
            migrated = true;
          }
          return p;
        });

        this.invoices = this.invoices.map(inv => {
          if (inv.amount < 1000000) {
            inv.amount = inv.amount * 1000;
            migrated = true;
          }
          if (!inv.currency) {
            inv.currency = 'IDR';
            migrated = true;
          }
          return inv;
        });

        if (this.migrateClients()) {
          migrated = true;
        }

        if (migrated) {
          this.saveState();
        }

      } else {
        // Initialize default clean state for this workspace
        this.projects = [];
        this.clients = [];
        this.invoices = [];
        this.quotations = [];
        this.weeklyReflections = this.getDefaultReflections();
        this.availability = this.getDefaultAvailability();
        this.freelancerProfile = this.getDefaultFreelancerProfile();
        this.saveState();
      }
    } catch (e) {
      console.error('Failed to parse localStorage state. Seeding emergency fallback.', e);
      const seed = getInitialSeedData();
      this.projects = seed.projects;
      this.clients = seed.clients;
      this.invoices = seed.invoices;
      this.quotations = seed.quotations;
      this.weeklyReflections = this.getDefaultReflections();
      this.availability = this.getDefaultAvailability();
      this.freelancerProfile = this.getDefaultFreelancerProfile();
    }
  }

  getDefaultReflections() {
    return `What went well this week?\n- Deployed production code for David on the custom E-commerce Website storefront.\n- Delivered catalog background photography retouches for Sarah, acing our milestone target.\n\nWhat can be improved?\n- Make sure Clara approves Storyboard wireframes before beginning development edits.\n- Track follow-up cycles closer for our Active proposal sent leads.\n\nWins & Achievements:\n- Received 5-star recommendations and lifetime earnings increases from Apex Software's checkouts launch!`;
  }

  /**
   * Synchronizes data layers to browser localStorage.
   */
  saveState() {
    try {
      const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
      if (!activeWorkspaceId) return;

      const stateKey = `alurkarya_workspace_${activeWorkspaceId}_state`;
      const profileKey = `alurkarya_workspace_${activeWorkspaceId}_profile`;

      const bundle = {
        projects: this.projects,
        clients: this.clients,
        invoices: this.invoices,
        quotations: this.quotations,
        weeklyReflections: this.weeklyReflections,
        availability: this.availability,
        freelancerProfile: this.freelancerProfile
      };
      
      localStorage.setItem(stateKey, JSON.stringify(bundle));
      
      if (this.freelancerProfile) {
        localStorage.setItem(profileKey, JSON.stringify(this.freelancerProfile));
      }
      
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to write to localStorage.', e);
    }
  }

  /**
   * Resets local context back to default clean values.
   */
  resetToDefaults() {
    this.projects = [];
    this.clients = [];
    this.invoices = [];
    this.quotations = [];
    this.weeklyReflections = this.getDefaultReflections();
    this.availability = this.getDefaultAvailability();
    this.freelancerProfile = this.getDefaultFreelancerProfile();
    this.saveState();
  }

  getWorkspaces() {
    const str = localStorage.getItem('alurkarya_workspace_index');
    return str ? JSON.parse(str) : [];
  }

  saveWorkspaces(index) {
    localStorage.setItem('alurkarya_workspace_index', JSON.stringify(index));
  }

  createWorkspace(name, pinHash = null) {
    const index = this.getWorkspaces();
    const wsId = 'wk_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);

    const newWs = {
      workspaceId: wsId,
      workspaceName: name.trim(),
      createdAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      workspacePinHash: pinHash
    };

    index.push(newWs);
    this.saveWorkspaces(index);

    // Initialize default state for this workspace
    const bundle = {
      projects: [],
      clients: [],
      invoices: [],
      quotations: [],
      weeklyReflections: this.getDefaultReflections(),
      availability: this.getDefaultAvailability(),
      freelancerProfile: this.getDefaultFreelancerProfile()
    };
    localStorage.setItem(`alurkarya_workspace_${wsId}_state`, JSON.stringify(bundle));
    localStorage.setItem(`alurkarya_workspace_${wsId}_profile`, JSON.stringify(bundle.freelancerProfile));
    localStorage.setItem(`alurkarya_workspace_${wsId}_settings`, JSON.stringify({ defaultCurrency: 'IDR' }));

    return newWs;
  }

  deleteWorkspace(id) {
    let index = this.getWorkspaces();
    index = index.filter(w => w.workspaceId !== id);
    this.saveWorkspaces(index);

    localStorage.removeItem(`alurkarya_workspace_${id}_state`);
    localStorage.removeItem(`alurkarya_workspace_${id}_profile`);
    localStorage.removeItem(`alurkarya_workspace_${id}_settings`);
  }

  deleteAllLocalData() {
    const index = this.getWorkspaces();
    index.forEach(w => {
      localStorage.removeItem(`alurkarya_workspace_${w.workspaceId}_state`);
      localStorage.removeItem(`alurkarya_workspace_${w.workspaceId}_profile`);
      localStorage.removeItem(`alurkarya_workspace_${w.workspaceId}_settings`);
    });
    localStorage.removeItem('alurkarya_workspace_index');
    localStorage.removeItem('alurkarya_workspace_migration_v1_done');
    localStorage.removeItem('freelancer_os_workspace');
    localStorage.removeItem('alurkarya_freelancer_profile');
    localStorage.removeItem('alurkarya_default_currency');
    
    sessionStorage.clear();
  }

  addDemoProjectsNonDestructively() {
    const seed = getInitialSeedData();

    // 1. Add clients if they don't exist in the current store
    seed.clients.forEach(c => {
      const exists = this.clients.some(existing => existing.name === c.name || (c.email && existing.email === c.email));
      if (!exists) {
        this.clients.push({ ...c });
      }
    });

    // 2. Add projects (with regenerated IDs to avoid conflicts)
    seed.projects.forEach(p => {
      const exists = this.projects.some(existing => existing.title === p.title && existing.clientName === p.clientName);
      if (!exists) {
        const newProjId = 'proj_' + Math.random().toString(36).substring(2, 9);
        const newProj = { ...p, id: newProjId, invoices: [] };

        // Duplicate and map related invoices
        if (p.invoices && p.invoices.length > 0) {
          newProj.invoices = p.invoices.map(inv => {
            const newInvId = 'inv_' + Math.random().toString(36).substring(2, 9);
            const newInv = { ...inv, id: newInvId, projectId: newProjId };
            
            // Push to global store invoices if invoice number is unique
            const globalExists = this.invoices.some(existing => existing.invoiceNumber === inv.invoiceNumber);
            if (!globalExists) {
              this.invoices.push(newInv);
            }
            return newInv;
          });
        }

        this.projects.push(newProj);
      }
    });

    // 3. Save state and update UI listeners
    this.saveState();
    this.notifyListeners();
  }

  /* --- Listeners (Observer Pattern) --- */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  getState() {
    return {
      projects: this.projects,
      clients: this.clients,
      invoices: this.invoices,
      quotations: this.quotations,
      weeklyReflections: this.weeklyReflections,
      availability: this.availability
    };
  }

  /* --- Projects Modifiers --- */
  addProject(projectData) {
    const budget = Number(projectData.budget) || 0;
    const dpPercent = projectData.downPaymentPercent !== undefined ? Number(projectData.downPaymentPercent) : 50;
    const dpAmount = projectData.downPaymentAmount !== undefined ? Number(projectData.downPaymentAmount) : Math.round(budget * (dpPercent / 100));
    const finalAmount = projectData.finalPaymentAmount !== undefined ? Number(projectData.finalPaymentAmount) : budget - dpAmount;
    const remBalance = projectData.remainingBalance !== undefined ? Number(projectData.remainingBalance) : budget - dpAmount;

    const maxRevisionVal = projectData.maxRevisionRounds !== undefined ? Number(projectData.maxRevisionRounds) : 3;

    const newProject = {
      id: generateId(),
      title: projectData.title || 'Untitled Project',
      clientId: projectData.clientId || '',
      clientName: projectData.clientName || '',
      clientType: projectData.clientType || 'General',
      customClientName: projectData.customClientName || '',
      customCategory: projectData.customCategory || '',
      createdAt: new Date().toISOString(),
      budget: budget,
      currency: projectData.currency || 'IDR', // Currency field default ready
      projectCurrency: projectData.projectCurrency || localStorage.getItem('alurkarya_default_currency') || 'IDR',
      invoiceCurrency: projectData.invoiceCurrency || projectData.projectCurrency || localStorage.getItem('alurkarya_default_currency') || 'IDR',
      paymentCurrency: projectData.paymentCurrency || projectData.invoiceCurrency || projectData.projectCurrency || localStorage.getItem('alurkarya_default_currency') || 'IDR',
      stage: projectData.stage || 'new_lead',
      description: projectData.description || '',
      dueDate: projectData.dueDate || new Date().toISOString().split('T')[0],
      priority: projectData.priority || 'Medium',
      briefLink: projectData.briefLink || '',
      assetLink: projectData.assetLink || '',
      tags: projectData.tags || ['Design'],
      revisionRound: 0,
      maxRevisionRounds: maxRevisionVal,
      revisionNotes: '',
      paymentStatus: projectData.paymentStatus || 'None',
      nextAction: projectData.nextAction || 'Email client proposal draft',
      internalNotes: projectData.internalNotes || '',
      portfolioShowcase: false,
      portfolioDescription: '',
      resultDescription: '',
      testimonial: '',
      showcaseStatus: 'Private',
      checklist: [],
      deliverables: [],
      invoices: [],

      // Extended payment terms fields:
      downPaymentPercent: dpPercent,
      downPaymentAmount: dpAmount,
      milestonePaymentAmount: Number(projectData.milestonePaymentAmount) || 0,
      finalPaymentAmount: finalAmount,
      remainingBalance: remBalance,
      paymentMethod: projectData.paymentMethod || 'Bank Transfer',

      // File Delivery Link fields:
      rawFileLink: projectData.rawFileLink || '',
      draftFileLink: projectData.draftFileLink || '',
      finalDeliveryLink: projectData.finalDeliveryLink || '',
      referenceFolderLink: projectData.referenceFolderLink || '',

      // Meeting Link fields:
      meetingPlatform: projectData.meetingPlatform || 'Google Meet',
      meetingLink: projectData.meetingLink || '',
      meetingNotes: projectData.meetingNotes || '',

      // Quotation link properties:
      quotationId: projectData.quotationId || '',
      quotationStatus: projectData.quotationStatus || 'None',

      // Revision limits:
      revisionCount: 0,
      maxRevision: maxRevisionVal,

      // Stage / Status Trackers:
      clientApprovalStatus: 'Pending Review',
      invoiceNumber: '',
      invoiceDate: '',
      invoiceDueDate: '',
      invoiceAmount: 0,
      invoiceFileLink: '',
      paymentTerms: '',
      paymentDueDate: '',
      paymentReceiptLink: '',
      lastFollowUpDate: '',
      nextFollowUpDate: '',
      rawFileDownloadLink: '',
      isCompletedLocked: false,
      holdReason: projectData.holdReason || '',
      holdDate: projectData.holdDate || '',
      holdFollowUpDate: projectData.holdFollowUpDate || '',

      // Client portal upgrade fields
      clientVisibleNotes: projectData.clientVisibleNotes || '',
      previewLink: projectData.previewLink || '',
      draftLink: projectData.draftLink || '',
      reviewLink: projectData.reviewLink || '',
      fileFolderLink: projectData.fileFolderLink || '',
      stagingLink: projectData.stagingLink || '',
      finalFileLink: projectData.finalFileLink || '',
      deliveryDate: projectData.deliveryDate || '',
      handoverNotes: projectData.handoverNotes || '',
      approvalStatus: projectData.approvalStatus || 'Pending Review',
      approvedAt: projectData.approvedAt || '',
      clientFeedbackSummary: projectData.clientFeedbackSummary || '',
      invoiceStatus: projectData.invoiceStatus || 'Not Created',
      paymentStatus: projectData.paymentStatus || 'Not Started',
      amountPaid: Number(projectData.amountPaid) || 0,
      amountDue: Number(projectData.amountDue) || 0,
      paymentMethod: projectData.paymentMethod || '',
      paymentNotes: projectData.paymentNotes || '',
      receiptLink: projectData.receiptLink || projectData.paymentReceiptLink || '',
      invoiceFileLink: projectData.invoiceFileLink || '',
      deliveryStatus: projectData.deliveryStatus || 'Not Submitted',
      clientConfirmedDelivery: projectData.clientConfirmedDelivery !== undefined ? Boolean(projectData.clientConfirmedDelivery) : false,
      firstCutLink: projectData.firstCutLink || '',
      designPreviewLink: projectData.designPreviewLink || '',
      sourceFileLink: projectData.sourceFileLink || '',
      deliveryChecklist: (() => {
        if (projectData.deliveryChecklist && Array.isArray(projectData.deliveryChecklist)) {
          return projectData.deliveryChecklist;
        }
        const generalChecklist = ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"];
        let defaultLabels = generalChecklist;
        if (projectData.templateRole) {
          const roleChecklists = {
            designer: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
            video_editor: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
            copywriter: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
            web_developer: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
            social_media_manager: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
            ai_consultant: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"]
          };
          if (roleChecklists[projectData.templateRole]) {
            defaultLabels = roleChecklists[projectData.templateRole];
          }
        }
        return defaultLabels.map(label => ({
          id: 'del_' + Math.random().toString(36).substring(2, 9),
          label,
          completed: false,
          clientVisible: true
        }));
      })()
    };
    const normalized = normalizeProject(newProject);
    this.projects.push(normalized);
    this.saveState();
    return normalized;
  }

  createProjectInActiveWorkspace(projectInput) {
    const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
    if (!activeWorkspaceId) {
      throw new Error("No active workspace");
    }

    const clientName = (projectInput.clientName || '').trim();
    if (!clientName) {
      throw new Error("Client name is required");
    }
    let client = this.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    if (!client) {
      client = {
        id: generateId(),
        name: clientName,
        businessName: '',
        email: '',
        phone: '',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.clients.push(client);
    }

    const projectData = {
      title: projectInput.title || 'Untitled Project',
      clientId: client.id,
      clientName: client.name,
      currency: projectInput.currency || 'IDR',
      projectCurrency: projectInput.currency || 'IDR',
      budget: Number(projectInput.budget) || 0,
      stage: projectInput.stage || 'new_lead',
      nextAction: projectInput.nextAction || 'Email client proposal draft',
      dueDate: projectInput.dueDate || new Date().toISOString().split('T')[0],
      description: projectInput.notes || '',
      internalNotes: projectInput.notes || '',
      reviewLink: projectInput.reviewLink || '',
      finalFileLink: projectInput.deliveryLink || '',
      customCategory: projectInput.category || ''
    };

    const newProject = this.addProject(projectData);
    return newProject;
  }

  updateProject(id, updates) {
    this.projects = this.projects.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        if (updates.title) {
          this.invoices = this.invoices.map(inv => 
            inv.projectId === id ? { ...inv, projectName: updates.title } : inv
          );
        }
        return updated;
      }
      return p;
    });
    this.saveState();
  }

  deleteProject(id) {
    this.projects = this.projects.filter(p => p.id !== id);
    this.invoices = this.invoices.filter(inv => inv.projectId !== id);
    this.saveState();
  }

  /* --- Quotation Modifiers --- */
  addQuotation(qData) {
    const serviceItems = qData.serviceItems || [];
    const totalValue = serviceItems.reduce((sum, item) => {
      const qty = Number(item.qty) || 1;
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      return sum + (qty * price - discount);
    }, 0);

    const newQuotation = {
      id: generateId(),
      quotationNumber: qData.quotationNumber || `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: qData.clientId || '',
      clientName: qData.clientName || 'Independent Contract',
      projectTitle: qData.projectTitle || 'Untitled Project Services',
      serviceItems: serviceItems,
      totalValue: totalValue,
      paymentTerms: qData.paymentTerms || '',
      notes: qData.notes || '',
      status: qData.status || 'Draft',
      createdAt: qData.createdAt || new Date().toISOString().split('T')[0]
    };
    this.quotations.push(newQuotation);
    this.saveState();
    return newQuotation;
  }

  updateQuotation(id, updates) {
    this.quotations = this.quotations.map(q => {
      if (q.id === id) {
        const merged = { ...q, ...updates };
        if (updates.serviceItems) {
          merged.totalValue = merged.serviceItems.reduce((sum, item) => {
            const qty = Number(item.qty) || 1;
            const price = Number(item.price) || 0;
            const discount = Number(item.discount) || 0;
            return sum + (qty * price - discount);
          }, 0);
        }
        return merged;
      }
      return q;
    });
    this.saveState();
  }

  deleteQuotation(id) {
    this.quotations = this.quotations.filter(q => q.id !== id);
    this.saveState();
  }

  convertQuotationToProject(id) {
    const q = this.quotations.find(x => x.id === id);
    if (!q) return null;

    q.status = 'Accepted';

    const budget = q.totalValue;
    const dpPercent = 50;
    const dpAmount = Math.round(budget * (dpPercent / 100));
    const finalAmount = budget - dpAmount;

    const projData = {
      title: q.projectTitle,
      clientId: q.clientId,
      clientName: q.clientName,
      budget: budget,
      currency: 'IDR',
      stage: 'new_lead',
      description: q.notes || '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days offset
      priority: 'Medium',
      tags: ['Design'],
      maxRevisionRounds: 3,
      nextAction: 'Confirm kickoff meeting with client',
      internalNotes: `Converted from Quotation ${q.quotationNumber}.\nPayment Terms: ${q.paymentTerms}`,
      downPaymentPercent: dpPercent,
      downPaymentAmount: dpAmount,
      milestonePaymentAmount: 0,
      finalPaymentAmount: finalAmount,
      remainingBalance: finalAmount,
      paymentMethod: 'Bank Transfer',
      quotationId: q.id,
      quotationStatus: 'Accepted'
    };

    const newProject = this.addProject(projData);
    this.saveState();
    return newProject;
  }

  addClient(clientData) {
    const memoryInput = clientData.clientMemory || {};
    const newClient = {
      id: generateId(),
      name: clientData.name || 'New Client',
      businessName: clientData.businessName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      status: clientData.status || 'Lead',
      lastFollowUpDate: clientData.lastFollowUpDate || new Date().toISOString().split('T')[0],
      notes: clientData.notes || '',
      // root levels for old compatibility
      clientPreference: clientData.clientPreference || memoryInput.clientPreference || '',
      communicationStyle: clientData.communicationStyle || memoryInput.communicationStyle || '',
      paymentBehavior: clientData.paymentBehavior || memoryInput.paymentBehavior || '',
      revisionPattern: clientData.revisionPattern || memoryInput.revisionPattern || '',
      deliveryPreference: clientData.deliveryPreference || memoryInput.deliveryPreference || '',
      lastProjectSummary: clientData.lastProjectSummary || memoryInput.lastProjectSummary || '',
      lastMeetingSummary: clientData.lastMeetingSummary || memoryInput.lastMeetingSummary || '',
      importantNotes: clientData.importantNotes || memoryInput.importantNotes || '',
      clientRiskNotes: clientData.clientRiskNotes || memoryInput.clientRiskNotes || '',
      // nested clientMemory structure
      clientMemory: {
        communicationStyle: clientData.communicationStyle || memoryInput.communicationStyle || '',
        preferredChannel: clientData.preferredChannel || memoryInput.preferredChannel || '',
        preferredUpdateFrequency: clientData.preferredUpdateFrequency || memoryInput.preferredUpdateFrequency || '',
        decisionMaker: clientData.decisionMaker || memoryInput.decisionMaker || '',
        approvalStyle: clientData.approvalStyle || memoryInput.approvalStyle || '',
        revisionPattern: clientData.revisionPattern || memoryInput.revisionPattern || '',
        paymentBehavior: clientData.paymentBehavior || memoryInput.paymentBehavior || '',
        paymentReminderStyle: clientData.paymentReminderStyle || memoryInput.paymentReminderStyle || '',
        deliveryPreference: clientData.deliveryPreference || memoryInput.deliveryPreference || '',
        filePreference: clientData.filePreference || memoryInput.filePreference || '',
        tonePreference: clientData.tonePreference || memoryInput.tonePreference || '',
        importantNotes: clientData.importantNotes || memoryInput.importantNotes || '',
        clientRiskNotes: clientData.clientRiskNotes || memoryInput.clientRiskNotes || '',
        lastProjectSummary: clientData.lastProjectSummary || memoryInput.lastProjectSummary || '',
        lastMeetingSummary: clientData.lastMeetingSummary || memoryInput.lastMeetingSummary || '',
        relationshipStatus: clientData.relationshipStatus || memoryInput.relationshipStatus || '',
        clientVisibleNotes: clientData.clientVisibleNotes || memoryInput.clientVisibleNotes || '',
        shareDeliveryPref: clientData.shareDeliveryPref || memoryInput.shareDeliveryPref || false
      },
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.clients.push(newClient);
    this.saveState();
    return newClient;
  }

  updateClient(id, updates) {
    this.clients = this.clients.map(c => {
      if (c.id === id) {
        const clientMemory = c.clientMemory ? { ...c.clientMemory } : {};
        if (updates.clientMemory) {
          Object.assign(clientMemory, updates.clientMemory);
        }
        
        const memoryKeys = [
          'communicationStyle', 'preferredChannel', 'preferredUpdateFrequency', 'decisionMaker',
          'approvalStyle', 'revisionPattern', 'paymentBehavior', 'paymentReminderStyle',
          'deliveryPreference', 'filePreference', 'tonePreference', 'importantNotes',
          'clientRiskNotes', 'lastProjectSummary', 'lastMeetingSummary', 'relationshipStatus',
          'clientVisibleNotes', 'shareDeliveryPref'
        ];
        
        memoryKeys.forEach(k => {
          if (updates[k] !== undefined) {
            clientMemory[k] = updates[k];
          }
        });

        const nextClient = {
          ...c,
          ...updates,
          clientMemory
        };
        
        // sync root fields for old compatibility
        nextClient.communicationStyle = clientMemory.communicationStyle;
        nextClient.paymentBehavior = clientMemory.paymentBehavior;
        nextClient.revisionPattern = clientMemory.revisionPattern;
        nextClient.deliveryPreference = clientMemory.deliveryPreference;
        nextClient.clientRiskNotes = clientMemory.clientRiskNotes;
        nextClient.importantNotes = clientMemory.importantNotes;
        nextClient.lastProjectSummary = clientMemory.lastProjectSummary;
        nextClient.lastMeetingSummary = clientMemory.lastMeetingSummary;

        return nextClient;
      }
      return c;
    });
    
    if (updates.name || updates.businessName) {
      this.projects = this.projects.map(p => {
        if (p.clientId === id) {
          const clientName = updates.name + (updates.businessName ? ` (${updates.businessName})` : '');
          return { ...p, clientName };
        }
        return p;
      });
    }
    this.saveState();
  }

  migrateClients() {
    let migrated = false;
    this.clients = this.clients.map(c => {
      if (c.clientPreference === undefined) { c.clientPreference = ''; migrated = true; }
      if (c.communicationStyle === undefined) { c.communicationStyle = ''; migrated = true; }
      if (c.paymentBehavior === undefined) { c.paymentBehavior = ''; migrated = true; }
      if (c.revisionPattern === undefined) { c.revisionPattern = ''; migrated = true; }
      if (c.deliveryPreference === undefined) { c.deliveryPreference = ''; migrated = true; }
      if (c.lastProjectSummary === undefined) { c.lastProjectSummary = ''; migrated = true; }
      if (c.lastMeetingSummary === undefined) { c.lastMeetingSummary = ''; migrated = true; }
      if (c.importantNotes === undefined) { c.importantNotes = ''; migrated = true; }
      if (c.clientRiskNotes === undefined) { c.clientRiskNotes = ''; migrated = true; }

      if (!c.clientMemory) {
        c.clientMemory = {
          communicationStyle: c.communicationStyle || '',
          preferredChannel: '',
          preferredUpdateFrequency: '',
          decisionMaker: '',
          approvalStyle: '',
          revisionPattern: c.revisionPattern || '',
          paymentBehavior: c.paymentBehavior || '',
          paymentReminderStyle: '',
          deliveryPreference: c.deliveryPreference || '',
          filePreference: '',
          tonePreference: '',
          importantNotes: c.importantNotes || '',
          clientRiskNotes: c.clientRiskNotes || '',
          lastProjectSummary: c.lastProjectSummary || '',
          lastMeetingSummary: c.lastMeetingSummary || '',
          relationshipStatus: '',
          clientVisibleNotes: '',
          shareDeliveryPref: false
        };
        migrated = true;
      } else {
        const defaults = {
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
        let updatedMemory = false;
        for (const key in defaults) {
          if (c.clientMemory[key] === undefined) {
            c.clientMemory[key] = c[key] !== undefined ? c[key] : defaults[key];
            updatedMemory = true;
          }
        }
        if (updatedMemory) {
          migrated = true;
        }
      }
      return c;
    });
    return migrated;
  }

  /* --- Invoices Modifiers --- */
  addInvoice(invoiceData) {
    const proj = this.projects.find(p => p.id === invoiceData.projectId);
    const newInvoice = {
      id: generateId(),
      projectId: invoiceData.projectId,
      projectName: proj ? proj.title : 'External Project',
      invoiceNumber: invoiceData.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      amount: Number(invoiceData.amount) || 0,
      currency: invoiceData.currency || 'IDR', // Currency field default ready
      dueDate: invoiceData.dueDate || new Date().toISOString().split('T')[0],
      status: invoiceData.status || 'Draft',
      sentDate: invoiceData.status === 'Sent' || invoiceData.status === 'Overdue' ? new Date().toISOString().split('T')[0] : undefined,
      paidDate: invoiceData.status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
    };
    
    this.invoices.push(newInvoice);
    
    this.projects = this.projects.map(p => {
      if (p.id === invoiceData.projectId) {
        return { ...p, invoices: [...(p.invoices || []), newInvoice] };
      }
      return p;
    });

    this.saveState();
    return newInvoice;
  }

  updateInvoice(id, updates) {
    this.invoices = this.invoices.map(inv => {
      if (inv.id === id) {
        const updated = { ...inv, ...updates };
        if (updates.status === 'Paid' && !inv.paidDate) {
          updated.paidDate = new Date().toISOString().split('T')[0];
        }
        if (updates.status === 'Sent' && !inv.sentDate) {
          updated.sentDate = new Date().toISOString().split('T')[0];
        }
        return updated;
      }
      return inv;
    });

    this.projects = this.projects.map(p => {
      const syncedInvoices = this.invoices.filter(inv => inv.projectId === p.id);
      return { ...p, invoices: syncedInvoices };
    });

    this.saveState();
  }

  deleteInvoice(id) {
    this.invoices = this.invoices.filter(inv => inv.id !== id);
    this.projects = this.projects.map(p => {
      return { ...p, invoices: p.invoices.filter(inv => inv.id !== id) };
    });
    this.saveState();
  }

  /* --- Backup IO Actions --- */
  exportBackup() {
    const activeWorkspaceId = sessionStorage.getItem('alurkarya_active_workspace_id');
    let defaultCurrency = 'IDR';
    if (activeWorkspaceId) {
      const settingsStr = localStorage.getItem(`alurkarya_workspace_${activeWorkspaceId}_settings`);
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          if (settings.defaultCurrency) defaultCurrency = settings.defaultCurrency;
        } catch(e) {}
      }
    } else {
      defaultCurrency = window.getDefaultCurrency ? window.getDefaultCurrency() : 'IDR';
    }

    const bundle = {
      projects: this.projects,
      clients: this.clients,
      invoices: this.invoices,
      quotations: this.quotations,
      weeklyReflections: this.weeklyReflections,
      availability: this.availability,
      freelancerProfile: this.freelancerProfile,
      defaultCurrency: defaultCurrency
    };
    return JSON.stringify(bundle, null, 2);
  }

  importBackup(jsonString, targetWorkspaceId = null) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.projects && parsed.clients && parsed.invoices) {
        let wsId = targetWorkspaceId === 'NEW_WORKSPACE' ? null : (targetWorkspaceId || sessionStorage.getItem('alurkarya_active_workspace_id'));
        
        // If we don't have an active workspace or we want to create a new one:
        if (!wsId) {
          const lang = localStorage.getItem('alurkarya_language') || 'en';
          const defaultWsName = lang === 'id' ? 'Workspace Impor' : 'Imported Workspace';
          const wsName = prompt(
            lang === 'id' ? 'Masukkan nama workspace baru:' : 'Enter new workspace name:',
            defaultWsName
          ) || defaultWsName;
          
          const index = this.getWorkspaces();
          wsId = 'wk_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
          
          const newWs = {
            workspaceId: wsId,
            workspaceName: wsName.trim(),
            createdAt: new Date().toISOString(),
            lastOpenedAt: new Date().toISOString(),
            workspacePinHash: null
          };
          index.push(newWs);
          this.saveWorkspaces(index);
          
          sessionStorage.setItem('alurkarya_active_workspace_id', wsId);
          sessionStorage.setItem('alurkarya_session_unlocked', 'true');
        }

        const currency = parsed.defaultCurrency || 'IDR';
        localStorage.setItem(`alurkarya_workspace_${wsId}_settings`, JSON.stringify({ defaultCurrency: currency }));
        
        this.projects = parsed.projects;
        this.clients = parsed.clients;
        this.invoices = parsed.invoices;
        this.quotations = parsed.quotations || [];
        this.weeklyReflections = parsed.weeklyReflections || this.getDefaultReflections();
        this.availability = parsed.availability || this.getDefaultAvailability();
        this.freelancerProfile = parsed.freelancerProfile || this.getDefaultFreelancerProfile();

        this.projects = this.projects.map(p => {
          if (p.budget < 1000000) p.budget *= 1000;
          if (!p.currency) p.currency = 'IDR';
          if (!p.projectCurrency) p.projectCurrency = currency;
          if (!p.invoiceCurrency) p.invoiceCurrency = p.projectCurrency || currency;
          if (!p.paymentCurrency) p.paymentCurrency = p.invoiceCurrency || p.projectCurrency || currency;
          
          if (p.downPaymentPercent === undefined) {
            p.downPaymentPercent = 50;
            p.downPaymentAmount = Math.round(p.budget * 0.5);
            p.milestonePaymentAmount = 0;
            p.finalPaymentAmount = p.budget - p.downPaymentAmount;
            p.remainingBalance = p.budget - p.downPaymentAmount;
            p.paymentMethod = 'Bank Transfer';
            p.rawFileLink = '';
            p.draftFileLink = '';
            p.finalDeliveryLink = '';
            p.referenceFolderLink = '';
            p.meetingPlatform = 'Google Meet';
            p.meetingLink = '';
            p.meetingNotes = '';
            p.quotationId = '';
            p.quotationStatus = 'None';
          }
          if (p.clientType === undefined) p.clientType = 'General';
          if (p.customClientName === undefined) p.customClientName = '';
          if (p.customCategory === undefined) p.customCategory = '';
          if (p.createdAt === undefined) p.createdAt = new Date().toISOString();
          if (p.revisionCount === undefined) p.revisionCount = p.revisionRound !== undefined ? p.revisionRound : 0;
          if (p.maxRevision === undefined) p.maxRevision = p.maxRevisionRounds !== undefined ? p.maxRevisionRounds : 3;
          if (p.clientApprovalStatus === undefined) p.clientApprovalStatus = 'Pending Review';
          if (p.invoiceNumber === undefined) p.invoiceNumber = '';
          if (p.invoiceDate === undefined) p.invoiceDate = '';
          if (p.invoiceDueDate === undefined) p.invoiceDueDate = '';
          if (p.invoiceAmount === undefined) p.invoiceAmount = 0;
          if (p.invoiceFileLink === undefined) p.invoiceFileLink = '';
          if (p.paymentTerms === undefined) p.paymentTerms = '';
          if (p.paymentDueDate === undefined) p.paymentDueDate = '';
          if (p.paymentReceiptLink === undefined) p.paymentReceiptLink = '';
          if (p.lastFollowUpDate === undefined) p.lastFollowUpDate = '';
          if (p.nextFollowUpDate === undefined) p.nextFollowUpDate = '';
          if (p.rawFileDownloadLink === undefined) p.rawFileDownloadLink = '';
          if (p.isCompletedLocked === undefined) p.isCompletedLocked = false;
          if (p.holdReason === undefined) p.holdReason = '';
          if (p.holdDate === undefined) p.holdDate = '';
          if (p.holdFollowUpDate === undefined) p.holdFollowUpDate = '';
          if (p.meetingDate === undefined) p.meetingDate = '';
          if (p.meetingTime === undefined) p.meetingTime = '';
          if (p.meetingType === undefined) p.meetingType = 'Google Meet';
          if (p.meetingTimezone === undefined) p.meetingTimezone = 'Asia/Jakarta';
          if (p.clientRequest === undefined) p.clientRequest = '';
          if (p.keyDiscussionPoints === undefined) p.keyDiscussionPoints = '';
          if (p.decisionMade === undefined) p.decisionMade = '';
          if (p.actionItems === undefined) p.actionItems = '';
          if (p.clientConcern === undefined) p.clientConcern = '';
          if (p.clientExpectation === undefined) p.clientExpectation = '';
          if (p.clientReviewDate === undefined) p.clientReviewDate = '';
          if (p.finalDeliveryDate === undefined) p.finalDeliveryDate = '';
          if (p.clientVisibleNotes === undefined) p.clientVisibleNotes = '';
          if (p.previewLink === undefined) p.previewLink = '';
          if (p.draftLink === undefined) p.draftLink = '';
          if (p.reviewLink === undefined) p.reviewLink = '';
          if (p.fileFolderLink === undefined) p.fileFolderLink = '';
          if (p.stagingLink === undefined) p.stagingLink = '';
          if (p.finalFileLink === undefined) p.finalFileLink = '';
          if (p.deliveryDate === undefined) p.deliveryDate = '';
          if (p.handoverNotes === undefined) p.handoverNotes = '';
          if (p.approvalStatus === undefined) p.approvalStatus = 'Pending Review';
          if (p.approvedAt === undefined) p.approvedAt = '';
          if (p.clientFeedbackSummary === undefined) p.clientFeedbackSummary = '';
          if (p.invoiceStatus === undefined) p.invoiceStatus = 'Not Created';
          if (p.paymentStatus === undefined) p.paymentStatus = 'Not Started';
          if (p.amountPaid === undefined) p.amountPaid = 0;
          if (p.amountDue === undefined) p.amountDue = 0;
          if (p.paymentMethod === undefined) p.paymentMethod = '';
          if (p.paymentNotes === undefined) p.paymentNotes = '';
          if (p.receiptLink === undefined) p.receiptLink = p.paymentReceiptLink || '';
          if (p.invoiceFileLink === undefined) p.invoiceFileLink = '';
          if (p.deliveryStatus === undefined) p.deliveryStatus = 'Not Submitted';
          if (p.clientConfirmedDelivery === undefined) p.clientConfirmedDelivery = false;
          if (p.firstCutLink === undefined) p.firstCutLink = '';
          if (p.designPreviewLink === undefined) p.designPreviewLink = '';
          if (p.sourceFileLink === undefined) p.sourceFileLink = '';
          
          if (!p.deliveryChecklist || !Array.isArray(p.deliveryChecklist)) {
            const generalChecklist = ["Brief", "Draft", "Review", "Revision", "Invoice", "Payment", "Final delivery"];
            let defaultLabels = generalChecklist;
            if (p.templateRole) {
              const roleChecklists = {
                designer: ["Preview file link", "Final PNG/JPG/PDF", "Editable source file", "Brand guideline document", "Raw/source file link", "Client approval"],
                video_editor: ["Raw footage received", "First cut link", "Revision notes", "Final export link", "Thumbnail file", "Source project file if included", "Client approval"],
                copywriter: ["Brief confirmed", "Draft link", "Revision notes", "Final copy document", "Approved version", "Usage notes"],
                web_developer: ["Content received", "Asset folder", "Staging link", "Client approval", "Final URL", "Backup file", "Handover notes"],
                social_media_manager: ["Content calendar", "Caption document", "Design folder", "Posting schedule", "Monthly report", "Approval notes"],
                ai_consultant: ["Discovery notes", "Workflow map", "Prompt documentation", "Demo video", "Training notes", "Final handover file"]
              };
              if (roleChecklists[p.templateRole]) {
                defaultLabels = roleChecklists[p.templateRole];
              }
            }
            p.deliveryChecklist = defaultLabels.map(label => ({
              id: 'del_' + Math.random().toString(36).substring(2, 9),
              label,
              completed: false,
              clientVisible: true
            }));
          }
          return p;
        });
        this.invoices = this.invoices.map(inv => {
          if (inv.amount < 1000000) inv.amount *= 1000;
          if (!inv.currency) inv.currency = 'IDR';
          return inv;
        });

        this.migrateClients();
        this.saveState();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import backup structural analysis failed.', e);
      return false;
    }
  }

  updateWeeklyReflections(text) {
    this.weeklyReflections = text;
    this.saveState();
  }

  getBrowserTimezone() {
    return getBrowserTimezone();
  }

  getDefaultAvailability() {
    return {
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      timezone: getBrowserTimezone(),
      unavailableDates: []
    };
  }

  updateAvailability(updates) {
    this.availability = { ...this.availability, ...updates };
    this.saveState();
    this.notifyListeners();
  }

  loadTemplateProjects(roleName) {
    return applyTemplateProjects(this, roleName);
  }

  getDefaultFreelancerProfile() {
    return {
      freelancerName: 'Your Name',
      freelancerRole: 'Freelancer',
      freelancerInitials: 'YN',
      freelancerAvatar: '',
      freelancerEmail: '',
      freelancerBio: '',
      freelancerPortfolioLink: '',
      freelancerLocation: ''
    };
  }

  getFreelancerProfile() {
    if (!this.freelancerProfile) {
      this.freelancerProfile = this.getDefaultFreelancerProfile();
    }
    return this.freelancerProfile;
  }

  updateFreelancerProfile(updates) {
    this.freelancerProfile = { ...this.getFreelancerProfile(), ...updates };
    
    if (this.freelancerProfile.freelancerName && !this.freelancerProfile.freelancerInitials) {
      this.freelancerProfile.freelancerInitials = getInitials(this.freelancerProfile.freelancerName);
    }
    
    this.saveState();
    this.notifyListeners();
  }

  getInitials(name) {
    return getInitials(name);
  }
}
export const store = new WorkspaceStore();
