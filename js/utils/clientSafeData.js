/* ==========================================================================
   ALURKARYA - CLIENT SAFE DATA BUILDER (WHITELIST FILTER)
   ========================================================================== */

import { formatMoney, formatDate } from '../utils.js';
import { t, getLanguage } from '../i18n.js';

/**
 * Builds a strictly whitelisted client-safe data payload for the Client Dashboard.
 * Excludes all private internal notes, risk markers, payment reminder styles, etc.
 *
 * @param {object} project - The project object
 * @param {object} client - The client object
 * @param {object} freelancerProfile - The freelancer profile
 * @param {object} options - Options containing { language: 'en' | 'id' }
 * @returns {object} Whitelisted client-safe data
 */
export function buildClientDashboardData(project, client, freelancerProfile, options = {}) {
  const p = project || {};
  const c = client || {};
  const f = freelancerProfile || {};
  const lang = options.language || getLanguage() || 'en';

  // Helper to fallback gracefully to readable placeholders if data is missing
  const getVal = (val, placeholder) => {
    if (val === undefined || val === null || val === "" || Number.isNaN(val)) {
      return placeholder;
    }
    return val;
  };

  const isIndo = lang === 'id';

  // Wording/stage mappings
  const stageLabels = {
    new_lead: t('kanban.stages.new_lead', 'New Lead'),
    proposal_sent: t('kanban.stages.proposal_sent', 'Queue'),
    in_progress: t('kanban.stages.in_progress', 'In Progress'),
    client_review: t('kanban.stages.client_review', 'Client Review'),
    revision: t('kanban.stages.revision', 'Revision'),
    invoice_sent: t('kanban.stages.invoice_sent', 'Invoice Sent'),
    waiting_payment: t('kanban.stages.waiting_payment', 'Waiting Payment'),
    completed: t('kanban.stages.completed', 'Completed'),
    on_hold: t('kanban.stages.on_hold', 'On Hold')
  };

  // Determine current action owner & next step details
  let nextStepLabel = isIndo ? "Project Dimulai" : "Project Intake";
  let nextStepDesc = isIndo ? "Menunggu pementasan (setup) awal oleh freelancer." : "Waiting for project kickoff setup.";
  let actionOwner = "freelancer";

  if (p.stage === 'new_lead' || p.stage === 'proposal_sent') {
    nextStepLabel = isIndo ? "Penawaran & Kickoff" : "Proposal & Kickoff";
    nextStepDesc = isIndo ? "Menunggu persetujuan lingkup kerja dan pembayaran DP." : "Awaiting scope agreement and kickoff deposit.";
    actionOwner = "client";
  } else if (p.stage === 'in_progress') {
    nextStepLabel = isIndo ? "Pengembangan Proyek" : "Active Development";
    nextStepDesc = isIndo ? "Pekerjaan sedang aktif diproses oleh freelancer." : "Freelancer is actively working on your deliverables.";
    actionOwner = "freelancer";
  } else if (p.stage === 'client_review') {
    nextStepLabel = isIndo ? "Review Hasil Pekerjaan" : "Client Feedback Review";
    nextStepDesc = isIndo ? "Silakan periksa link pratinjau yang diserahkan dan berikan masukan." : "Please review the submitted preview links and provide feedback.";
    actionOwner = "client";
  } else if (p.stage === 'revision') {
    nextStepLabel = isIndo ? "Pengerjaan Revisi" : "Revision Process";
    nextStepDesc = isIndo ? "Freelancer sedang melakukan perbaikan sesuai revisi Anda." : "Freelancer is applying modifications based on your feedback.";
    actionOwner = "freelancer";
  } else if (p.stage === 'invoice_sent' || p.stage === 'waiting_payment') {
    nextStepLabel = isIndo ? "Pembayaran Invoice" : "Invoice Settlement";
    nextStepDesc = isIndo ? "Invoice telah dikirimkan. Menunggu konfirmasi pembayaran." : "Invoice has been sent. Awaiting transfer validation.";
    actionOwner = "client";
  } else if (p.stage === 'completed') {
    nextStepLabel = isIndo ? "Selesai & Serah Terima" : "Project Completed";
    nextStepDesc = isIndo ? "Semua pekerjaan selesai diserahkan dan invoice dilunasi." : "All deliverables submitted and payments settled.";
    actionOwner = "none";
  }

  // Currency amounts
  const pCurrency = p.projectCurrency || 'IDR';
  const iCurrency = p.invoiceCurrency || pCurrency;
  const payCurrency = p.paymentCurrency || iCurrency;

  const invoiceAmountLabel = p.invoiceAmount ? formatMoney(p.invoiceAmount, iCurrency) : (isIndo ? "Belum ada" : "No invoice");
  const amountPaidLabel = p.amountPaid ? formatMoney(p.amountPaid, payCurrency) : formatMoney(0, payCurrency);
  const amountDueLabel = p.amountDue ? formatMoney(p.amountDue, iCurrency) : formatMoney(0, iCurrency);

  // Client visible checklist items
  const clientVisibleChecklist = (p.deliveryChecklist || [])
    .filter(item => item.clientVisible === true)
    .map(item => ({
      label: item.label,
      completed: !!item.completed
    }));


  // Big Picture Overview logic
  let overallStatus = 'on_track';
  const deliveryStatus = p.deliveryStatus || p.deliveryChecklistStatus || '';
  const isDeliveryReady = ['Final Delivered', 'Handover Complete', 'Approved'].includes(deliveryStatus) || !!p.finalFileLink;
  const hasProjectBasics = !!p.title && !!p.stage;

  const invoiceSent = p.stage === 'invoice_sent' || p.stage === 'waiting_payment' || (p.invoiceStatus && p.invoiceStatus.toLowerCase() === 'sent');
  const paymentPending = p.paymentStatus === 'Unpaid' || p.paymentStatus === 'Pending' || (p.amountDue && Number(p.amountDue) > 0);

  if (paymentPending && invoiceSent) {
    overallStatus = 'waiting_payment';
  } else if (p.stage === 'waiting_payment') {
    overallStatus = 'waiting_payment';
  } else if (p.stage === 'invoice_sent') {
    overallStatus = 'invoice_sent';
  } else if (p.stage === 'completed') {
    overallStatus = 'completed';
  } else if (p.stage === 'client_review') {
    overallStatus = 'needs_client_review';
  } else if (p.stage === 'revision') {
    overallStatus = 'in_revision';
  } else if (isDeliveryReady && p.stage !== 'completed') {
    overallStatus = 'ready_for_delivery';
  } else if (!hasProjectBasics) {
    overallStatus = 'needs_setup';
  } else {
    overallStatus = 'on_track';
  }

  const overallStatusLabels = {
    on_track: isIndo ? "On Track" : "On Track",
    needs_client_review: isIndo ? "Butuh Review Client" : "Needs Client Review",
    in_revision: isIndo ? "Dalam Revisi" : "In Revision",
    ready_for_delivery: isIndo ? "Siap Delivery" : "Ready for Delivery",
    invoice_sent: isIndo ? "Invoice Terkirim" : "Invoice Sent",
    waiting_payment: isIndo ? "Menunggu Payment" : "Waiting Payment",
    completed: isIndo ? "Completed" : "Completed",
    needs_setup: isIndo ? "Perlu Setup" : "Needs Setup"
  };
  const overallStatusLabel = overallStatusLabels[overallStatus] || (isIndo ? "On Track" : "On Track");

  let overviewSummary = "";
  if (overallStatus === 'on_track') {
    overviewSummary = isIndo 
      ? "Project saat ini sedang dalam proses pengerjaan. Next step-nya adalah melanjutkan pekerjaan sesuai workflow dan menyiapkan update review atau delivery berikutnya."
      : "This project is currently in production. The next step is to continue the planned work and prepare the next review or delivery update.";
  } else if (overallStatus === 'needs_client_review') {
    overviewSummary = isIndo
      ? "Project saat ini sedang menunggu review dari client. Draft atau preview sudah siap dicek, dan feedback dibutuhkan agar project bisa lanjut ke tahap berikutnya."
      : "The project is currently waiting for client review. The draft or preview is ready to be checked, and feedback is needed before moving to the next stage.";
  } else if (overallStatus === 'in_revision') {
    overviewSummary = isIndo
      ? "Feedback sudah diterima dan revisi sedang diproses. Setelah revisi selesai, project bisa lanjut ke tahap final review atau delivery."
      : "Feedback has been received and revision is currently being processed. Once the revision is complete, the project can move toward final review or delivery.";
  } else if (overallStatus === 'ready_for_delivery') {
    overviewSummary = isIndo
      ? "Hasil pekerjaan akhir project sudah siap dikirimkan. Langkah berikutnya adalah melakukan serah terima file akhir kepada client."
      : "The final deliverables for this project are ready. The next step is to perform the formal handover of all files to the client.";
  } else if (overallStatus === 'invoice_sent') {
    overviewSummary = isIndo
      ? "Invoice tagihan project telah dikirimkan kepada client. Menunggu verifikasi pembayaran untuk melanjutkan atau menutup project."
      : "The project invoice has been sent to the client. Awaiting payment validation to proceed or close the project.";
  } else if (overallStatus === 'waiting_payment') {
    overviewSummary = isIndo
      ? "Project saat ini sedang menunggu penyelesaian payment. Setelah payment selesai, project bisa difinalisasi sesuai workflow yang sudah disepakati."
      : "The project is currently waiting for payment completion. Once payment is completed, the project can be finalized according to the agreed workflow.";
  } else if (overallStatus === 'completed') {
    overviewSummary = isIndo
      ? "Project ini sudah completed. Final delivery sudah disiapkan dan workflow project sudah ditutup."
      : "This project has been completed. Final delivery has been prepared and the workflow is now closed.";
  } else if (overallStatus === 'needs_setup') {
    overviewSummary = isIndo
      ? "Beberapa detail setup project masih kurang lengkap. Freelancer perlu melengkapi detail project terlebih dahulu."
      : "Some key project setup details are still missing. The freelancer needs to complete project metadata configuration.";
  }

  let currentFocus = "";
  if (overallStatus === 'on_track') {
    currentFocus = isIndo ? "Pengerjaan project aktif" : "Active project development";
  } else if (overallStatus === 'needs_client_review') {
    currentFocus = isIndo ? "Review draft oleh client" : "Client reviewing deliverables";
  } else if (overallStatus === 'in_revision') {
    currentFocus = isIndo ? "Pengerjaan revisi aktif" : "Active revision work";
  } else if (overallStatus === 'ready_for_delivery') {
    currentFocus = isIndo ? "Persiapan serah terima file" : "Preparing file handover";
  } else if (overallStatus === 'invoice_sent' || overallStatus === 'waiting_payment') {
    currentFocus = isIndo ? "Menunggu penyelesaian payment" : "Awaiting payment settlement";
  } else if (overallStatus === 'completed') {
    currentFocus = isIndo ? "Project selesai" : "Project completed";
  } else if (overallStatus === 'needs_setup') {
    currentFocus = isIndo ? "Setup awal project" : "Initial project setup";
  }

  let waitingFor = isIndo ? "Freelancer" : "Freelancer";
  let decisionNeeded = isIndo 
    ? "Tidak ada action dari client saat ini. Pekerjaan sedang berjalan sesuai timeline."
    : "No action from the client right now. Work is progressing according to the timeline.";

  if (overallStatus === 'needs_client_review') {
    waitingFor = isIndo ? "Review Client" : "Client Review";
    decisionNeeded = isIndo
      ? "Silakan periksa draft preview dan berikan review/masukan Anda."
      : "Please check the preview draft and provide your review/feedback.";
  } else if (overallStatus === 'in_revision') {
    waitingFor = isIndo ? "Freelancer (Revisi)" : "Freelancer (Revision)";
    decisionNeeded = isIndo
      ? "Tidak ada action yang diperlukan dari client saat ini. Freelancer sedang mengerjakan revisi."
      : "No action is required from the client at this stage. The freelancer is working on revisions.";
  } else if (overallStatus === 'ready_for_delivery') {
    waitingFor = isIndo ? "Freelancer (Delivery)" : "Freelancer (Delivery)";
    decisionNeeded = isIndo
      ? "Silakan konfirmasi penerimaan file akhir setelah diserahkan oleh freelancer."
      : "Please confirm receipt of the final files once handed over by the freelancer.";
  } else if (overallStatus === 'invoice_sent' || overallStatus === 'waiting_payment') {
    waitingFor = isIndo ? "Payment Client" : "Client Payment";
    decisionNeeded = isIndo
      ? "Silakan cek rincian tagihan dan selesaikan payment."
      : "Please check the billing details and complete the payment.";
  } else if (overallStatus === 'completed') {
    waitingFor = isIndo ? "Tidak ada" : "None";
    decisionNeeded = isIndo ? "Project selesai. Tidak ada action lanjutan." : "Project completed. No further action needed.";
  } else if (overallStatus === 'needs_setup') {
    waitingFor = isIndo ? "Freelancer (Setup)" : "Freelancer (Setup)";
    decisionNeeded = isIndo
      ? "Tidak ada action dari client saat ini. Menunggu setup awal oleh freelancer."
      : "No action from the client right now. Awaiting initial setup by the freelancer.";
  }

  let nextMilestone = isIndo ? "Review draft" : "Review draft";
  if (overallStatus === 'needs_setup') {
    nextMilestone = isIndo ? "Review draft" : "Review draft";
  } else if (overallStatus === 'on_track') {
    nextMilestone = isIndo ? "Review draft" : "Review draft";
  } else if (overallStatus === 'needs_client_review') {
    nextMilestone = isIndo ? "Proses revisi" : "Process revision";
  } else if (overallStatus === 'in_revision') {
    nextMilestone = isIndo ? "Final delivery" : "Final delivery";
  } else if (overallStatus === 'ready_for_delivery') {
    nextMilestone = isIndo ? "Kirim invoice" : "Send invoice";
  } else if (overallStatus === 'invoice_sent' || overallStatus === 'waiting_payment') {
    nextMilestone = isIndo ? "Selesaikan payment" : "Complete payment";
  } else if (overallStatus === 'completed') {
    nextMilestone = isIndo ? "Tutup project" : "Close project";
  }

  let whatIsDone = [];
  let whatIsNext = [];

  if (overallStatus === 'needs_setup') {
    whatIsDone = isIndo 
      ? ["Project telah terdaftar di AlurKarya."] 
      : ["Project has been registered in AlurKarya."];
    whatIsNext = isIndo 
      ? ["Lengkapi setup metadata project.", "Lakukan inisiasi (kickoff) project."] 
      : ["Complete project metadata configuration.", "Perform project kickoff."];
  } else if (overallStatus === 'on_track') {
    whatIsDone = isIndo
      ? ["Brief/setup project sudah tercatat.", "Project sudah aktif di workflow."]
      : ["Brief/project setup has been recorded.", "Project is already active in the workflow."];
    whatIsNext = isIndo
      ? ["Melanjutkan proses pengerjaan.", "Menyiapkan update review atau delivery berikutnya.", "Membagikan link review saat sudah siap."]
      : ["Continue production work.", "Prepare the next review or delivery update.", "Share review link when ready."];
  } else if (overallStatus === 'needs_client_review') {
    whatIsDone = isIndo
      ? ["Draft/preview sudah disiapkan.", "Link review sudah tersedia jika sudah ditambahkan."]
      : ["Draft/preview has been prepared.", "Review link is available if provided."];
    whatIsNext = isIndo
      ? ["Client review preview.", "Client mengirim feedback.", "Freelancer lanjut ke revisi atau final delivery."]
      : ["Client reviews the preview.", "Client sends feedback.", "Freelancer proceeds to revision or final delivery."];
  } else if (overallStatus === 'in_revision') {
    whatIsDone = isIndo
      ? ["Feedback sudah diterima dari client.", "Detail revisi telah dicatat di workflow."]
      : ["Feedback has been received from the client.", "Revision details have been logged in the workflow."];
    whatIsNext = isIndo
      ? ["Proses pengerjaan revisi sedang aktif.", "Menyiapkan draf revisi terbaru.", "Menyerahkan kembali draf untuk ditinjau."]
      : ["Revision work is actively in progress.", "Prepare the updated draft based on feedback.", "Resubmit draft for client review."];
  } else if (overallStatus === 'ready_for_delivery') {
    whatIsDone = isIndo
      ? ["Semua draf dan hasil pekerjaan telah disetujui client.", "Paket delivery final telah disiapkan."]
      : ["All drafts and items have been approved by the client.", "Final delivery package has been prepared."];
    whatIsNext = isIndo
      ? ["Melakukan serah terima file akhir kepada client.", "Mengirim invoice tagihan final project."]
      : ["Perform the formal handover of final files to the client.", "Send the final project invoice."];
  } else if (overallStatus === 'invoice_sent') {
    whatIsDone = isIndo
      ? ["Pekerjaan project telah selesai atau disetujui.", "Invoice tagihan project sudah terkirim."]
      : ["Project work has been completed or approved.", "Project invoice has been sent to the client."];
    whatIsNext = isIndo
      ? ["Client memverifikasi rincian tagihan.", "Selesaikan payment sesuai terms.", "Freelancer memvalidasi bukti transfer."]
      : ["Client reviews billing details.", "Settle payment based on terms.", "Freelancer validates transfer proof."];
  } else if (overallStatus === 'waiting_payment') {
    whatIsDone = isIndo
      ? ["Delivery atau invoice sudah disiapkan.", "Detail invoice tersedia jika sudah ditambahkan."]
      : ["Project delivery or invoice step has been prepared.", "Invoice details are available if attached."];
    whatIsNext = isIndo
      ? ["Client menyelesaikan payment.", "Freelancer mengonfirmasi payment.", "Project lanjut ke status completed."]
      : ["Client completes payment.", "Freelancer confirms payment.", "Project moves toward completed status."];
  } else if (overallStatus === 'completed') {
    whatIsDone = isIndo
      ? ["Project ini sudah completed.", "Final delivery sudah disiapkan dan diterima.", "Seluruh pembayaran invoice telah lunas."]
      : ["This project has been completed.", "Final delivery has been prepared and accepted.", "All invoices have been settled."];
    whatIsNext = isIndo
      ? ["Tidak ada action lanjutan yang dibutuhkan.", "Workflow project sudah ditutup."]
      : ["No further action is required.", "Project workflow is closed."];
  }

  return {
    freelancer: {
      name: getVal(f.freelancerName, "[Freelancer Name]"),
      role: getVal(f.freelancerRole, "[Freelancer Role]"),
      email: getVal(f.freelancerEmail || f.email, "[Email]"),
      portfolioLink: getVal(f.freelancerPortfolioLink || f.portfolioLink, ""),
      location: getVal(f.location || f.freelancerLocation, ""),
      avatar: getVal(f.freelancerAvatar || f.avatar, "")
    },
    client: {
      name: getVal(c.name || p.clientName, "[Client Name]")
    },
    project: {
      id: p.id || '',
      title: getVal(p.title, "[Project Name]"),
      category: getVal(p.category, "[Category]"),
      stageLabel: stageLabels[p.stage] || p.stage || '[Stage]',
      deadline: p.dueDate ? formatDate(p.dueDate) : (isIndo ? "Tanpa Tenggat" : "No Deadline"),
      nextAction: getVal(p.nextAction, isIndo ? "Belum diisi" : "Not set yet"),
      approvalStatus: getVal(p.approvalStatus, "Pending Review"),
      revisionCount: getVal(p.revisionRound || p.revisionCount, 0),
      maxRevision: getVal(p.maxRevisionRounds || p.maxRevision, 3),
      lastUpdated: p.updatedAt ? formatDate(p.updatedAt) : (p.createdAt ? formatDate(p.createdAt) : "[Date]")
    },
    progress: {
      currentStage: p.stage || 'in_progress',
      currentStageLabel: stageLabels[p.stage] || p.stage || 'In Progress',
      timelineItems: [
        { key: 'proposal_sent', label: t('kanban.stages.proposal_sent', 'Queue') },
        { key: 'in_progress', label: t('kanban.stages.in_progress', 'In Progress') },
        { key: 'client_review', label: t('kanban.stages.client_review', 'Client Review') },
        { key: 'revision', label: t('kanban.stages.revision', 'Revision') },
        { key: 'invoice_sent', label: t('kanban.stages.invoice_sent', 'Invoice Sent') },
        { key: 'completed', label: t('kanban.stages.completed', 'Completed') }
      ]
    },
    delivery: {
      deliveryStatus: getVal(p.deliveryStatus || p.deliveryChecklistStatus, "Pending"),
      previewLink: getVal(p.previewLink || p.previewUrl, ""),
      draftLink: getVal(p.draftLink || p.draftUrl, ""),
      reviewLink: getVal(p.reviewLink || p.reviewUrl, ""),
      finalFileLink: getVal(p.finalFileLink || p.finalFileUrl || p.rawFileDownloadLink, ""),
      clientVisibleNotes: getVal(p.clientVisibleNotes || (c.clientMemory ? c.clientMemory.clientVisibleNotes : ""), ""),
      clientVisibleChecklist
    },
    invoice: {
      invoiceNumber: getVal(p.invoiceNumber, "[Invoice Number]"),
      invoiceStatus: getVal(p.invoiceStatus, "Not Created"),
      paymentStatus: getVal(p.paymentStatus, "Not Started"),
      invoiceAmountLabel,
      amountPaidLabel,
      amountDueLabel,
      invoiceDueDate: p.invoiceDueDate ? formatDate(p.invoiceDueDate) : (isIndo ? "Tanpa Tanggal" : "No Due Date"),
      invoiceFileLink: getVal(p.invoiceFileLink, "")
    },
    nextStep: {
      label: nextStepLabel,
      description: nextStepDesc,
      actionOwner: actionOwner
    },
    bigPicture: {
      overallStatus,
      overallStatusLabel,
      overviewSummary,
      currentFocus,
      waitingFor,
      decisionNeeded,
      nextMilestone,
      whatIsDone,
      whatIsNext
    }
  };
}
