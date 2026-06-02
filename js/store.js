/* ==========================================================================
   FREELANCER PROJECT OS - CENTRAL STORAGE & STORE COMPONENT
   ========================================================================== */

import { generateId } from './utils.js';

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
      const stored = localStorage.getItem('freelancer_os_workspace');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.projects = parsed.projects || [];
        this.clients = parsed.clients || [];
        this.invoices = parsed.invoices || [];
        this.quotations = parsed.quotations || [];
        this.weeklyReflections = parsed.weeklyReflections || this.getDefaultReflections();

        let migrated = false;

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
        if (hasOldSeeds || this.projects.length === 0) {
          const seed = getInitialSeedData();
          this.projects = seed.projects;
          this.clients = seed.clients;
          this.invoices = seed.invoices;
          this.quotations = seed.quotations;
          this.weeklyReflections = this.getDefaultReflections();
          migrated = true;
        }

        // STANDARD DATA MODEL FILLER
        this.projects = this.projects.map(p => {
          if (p.budget < 1000000) {
            p.budget = p.budget * 1000;
            migrated = true;
          }
          if (!p.currency) {
            p.currency = 'IDR';
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

        if (migrated) {
          this.saveState();
        }

      } else {
        const seed = getInitialSeedData();
        this.projects = seed.projects;
        this.clients = seed.clients;
        this.invoices = seed.invoices;
        this.quotations = seed.quotations;
        this.weeklyReflections = this.getDefaultReflections();
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
      const bundle = {
        projects: this.projects,
        clients: this.clients,
        invoices: this.invoices,
        quotations: this.quotations,
        weeklyReflections: this.weeklyReflections
      };
      localStorage.setItem('freelancer_os_workspace', JSON.stringify(bundle));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to write to localStorage.', e);
    }
  }

  /**
   * Resets local context back to default clean values.
   */
  resetToDefaults() {
    const seed = getInitialSeedData();
    this.projects = seed.projects;
    this.clients = seed.clients;
    this.invoices = seed.invoices;
    this.quotations = seed.quotations;
    this.weeklyReflections = this.getDefaultReflections();
    this.saveState();
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
      weeklyReflections: this.weeklyReflections
    };
  }

  /* --- Projects Modifiers --- */
  addProject(projectData) {
    const budget = Number(projectData.budget) || 0;
    const dpPercent = projectData.downPaymentPercent !== undefined ? Number(projectData.downPaymentPercent) : 50;
    const dpAmount = projectData.downPaymentAmount !== undefined ? Number(projectData.downPaymentAmount) : Math.round(budget * (dpPercent / 100));
    const finalAmount = projectData.finalPaymentAmount !== undefined ? Number(projectData.finalPaymentAmount) : budget - dpAmount;
    const remBalance = projectData.remainingBalance !== undefined ? Number(projectData.remainingBalance) : budget - dpAmount;

    const newProject = {
      id: generateId(),
      title: projectData.title || 'Untitled Project',
      clientId: projectData.clientId,
      clientName: projectData.clientName || 'Independent Contract',
      budget: budget,
      currency: projectData.currency || 'IDR', // Currency field default ready
      stage: projectData.stage || 'new_lead',
      description: projectData.description || '',
      dueDate: projectData.dueDate || new Date().toISOString().split('T')[0],
      priority: projectData.priority || 'Medium',
      briefLink: projectData.briefLink || '',
      assetLink: projectData.assetLink || '',
      tags: projectData.tags || ['Design'],
      revisionRound: 0,
      maxRevisionRounds: Number(projectData.maxRevisionRounds) || 3,
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
      quotationStatus: projectData.quotationStatus || 'None'
    };
    this.projects.push(newProject);
    this.saveState();
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

  /* --- Clients Modifiers --- */
  addClient(clientData) {
    const newClient = {
      id: generateId(),
      name: clientData.name || 'New Client',
      businessName: clientData.businessName || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      status: clientData.status || 'Lead',
      lastFollowUpDate: clientData.lastFollowUpDate || new Date().toISOString().split('T')[0],
      notes: clientData.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.clients.push(newClient);
    this.saveState();
    return newClient;
  }

  updateClient(id, updates) {
    this.clients = this.clients.map(c => (c.id === id ? { ...c, ...updates } : c));
    
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
    const bundle = {
      projects: this.projects,
      clients: this.clients,
      invoices: this.invoices,
      quotations: this.quotations,
      weeklyReflections: this.weeklyReflections
    };
    return JSON.stringify(bundle, null, 2);
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.projects && parsed.clients && parsed.invoices) {
        this.projects = parsed.projects;
        this.clients = parsed.clients;
        this.invoices = parsed.invoices;
        this.quotations = parsed.quotations || [];
        this.weeklyReflections = parsed.weeklyReflections || this.getDefaultReflections();
        
        this.projects = this.projects.map(p => {
          if (p.budget < 1000000) p.budget *= 1000;
          if (!p.currency) p.currency = 'IDR';
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
          return p;
        });
        this.invoices = this.invoices.map(inv => {
          if (inv.amount < 1000000) inv.amount *= 1000;
          if (!inv.currency) inv.currency = 'IDR';
          return inv;
        });

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
}
export const store = new WorkspaceStore();
