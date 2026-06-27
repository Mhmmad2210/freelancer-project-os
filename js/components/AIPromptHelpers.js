/* ==========================================================================
   FREELANCER PROJECT OS - AI PROMPT HELPER PACK (UPGRADED)
   ========================================================================== */

import { buildPromptContext } from '../utils/promptContext.js';
import { buildClientDashboardData } from '../utils/clientSafeData.js';
import { t, getLanguage } from '../i18n.js';
import { formatMoney } from '../utils.js';

function getRoleTerminology(role, lang = 'en') {
  const termsEn = {
    designer: {
      preview: "design preview",
      final: "final design files",
      source: "editable source files (PSD/Figma/AI)",
      extra: "brand guidelines, export assets",
      raw: "editable source files"
    },
    video_editor: {
      preview: "first cut preview",
      final: "final export video (MP4/MOV)",
      source: "raw video files and project files",
      extra: "timestamped feedback, video thumbnails",
      raw: "raw footage & project files"
    },
    copywriter: {
      preview: "draft copy for review",
      final: "final copy deck",
      source: "raw copy docs / editable manuscripts",
      extra: "messaging angles, offer optimization",
      raw: "editable draft files"
    },
    web_developer: {
      preview: "staging/development link",
      final: "live website launch URL",
      source: "editable source code / repository files",
      extra: "deployment setup, technical handover notes",
      raw: "source code repository"
    },
    social_media_manager: {
      preview: "content calendar preview",
      final: "approved caption batch",
      source: "monthly analytics and source media links",
      extra: "monthly reports, campaign assets",
      raw: "analytics data & graphics"
    },
    ai_consultant: {
      preview: "workflow architecture map",
      final: "prompt documentation and demo videos",
      source: "custom prompt files and system scripts",
      extra: "training guides, deployment notes",
      raw: "workflow configuration scripts"
    }
  };

  const termsId = {
    designer: {
      preview: "pratinjau desain",
      final: "file desain akhir",
      source: "file mentah yang dapat diedit (PSD/Figma/AI)",
      extra: "panduan brand, aset ekspor",
      raw: "file mentah yang dapat diedit"
    },
    video_editor: {
      preview: "pratinjau potongan pertama",
      final: "ekspor video akhir (MP4/MOV)",
      source: "file video mentah dan file proyek",
      extra: "masukan berbasis stempel waktu, kelumit (thumbnail) video",
      raw: "rekaman mentah & file proyek"
    },
    copywriter: {
      preview: "draf salinan untuk ditinjau",
      final: "kumpulan salinan akhir",
      source: "dokumen salinan mentah / manuskrip yang dapat diedit",
      extra: "sudut pandang pesan, optimasi penawaran",
      raw: "file draf yang dapat diedit"
    },
    web_developer: {
      preview: "tautan pementasan/pengembangan (staging/dev link)",
      final: "URL peluncuran situs web langsung",
      source: "kode sumber yang dapat diedit / file repositori",
      extra: "pengaturan penyebaran (deployment), catatan serah terima teknis",
      raw: "repositori kode sumber"
    },
    social_media_manager: {
      preview: "pratinjau kalender konten",
      final: "kumpulan teks (caption) yang disetujui",
      source: "analitik bulanan dan tautan media mentah",
      extra: "laporan bulanan, aset kampanye",
      raw: "data analitik & grafis"
    },
    ai_consultant: {
      preview: "peta arsitektur alur kerja",
      final: "dokumentasi prompt dan video demonstrasi",
      source: "file prompt kustom dan skrip sistem",
      extra: "panduan pelatihan, catatan penyebaran",
      raw: "skrip konfigurasi alur kerja"
    }
  };

  const selectedTerms = lang === 'id' ? termsId : termsEn;

  return selectedTerms[role] || (lang === 'id' ? {
    preview: "pratinjau proyek",
    final: "hasil akhir",
    source: "file mentah/sumber",
    extra: "catatan serah terima proyek",
    raw: "file mentah"
  } : {
    preview: "project preview",
    final: "final deliverables",
    source: "source/raw files",
    extra: "project hand-off notes",
    raw: "source files"
  });
}

export const promptTemplates = {
  // --- CLIENT COMMUNICATION ---
  clientUpdate: {
    name: "Client Update Message",
    description: "Generate a weekly progress update message that highlights wins and next steps.",
    category: "client_communication",
    outputMode: "client_message",
    requiredContext: ["projectTitle", "clientName", "stage"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const safeData = buildClientDashboardData(project, {}, freelancerProfile, { language: targetLang });
      const bigPicture = safeData.bigPicture;
      
      const isIndo = targetLang === 'id';
      const clientName = safeData.client.name || (isIndo ? "[Nama Client]" : "[Client Name]");
      const projectTitle = safeData.project.title || (isIndo ? "[Nama Project]" : "[Project Name]");
      
      const reviewLink = safeData.delivery.reviewLink || safeData.delivery.previewLink || safeData.delivery.draftLink || "";
      const finalFileLink = safeData.delivery.finalFileLink || "";
      
      const isPaymentStage = ['invoice_sent', 'waiting_payment', 'completed'].includes(bigPicture.overallStatus);
      let billingNote = "";
      if (isPaymentStage) {
        billingNote = isIndo
          ? `Invoice & Pembayaran: ${safeData.invoice.paymentStatus} (Sisa Tagihan: ${safeData.invoice.amountDueLabel})`
          : `Invoice & Payment: ${safeData.invoice.paymentStatus} (Amount Due: ${safeData.invoice.amountDueLabel})`;
      }

      if (isIndo) {
        let msg = `Halo ${clientName},\n\n`;
        msg += `Berikut adalah update perkembangan untuk project ${projectTitle}:\n\n`;
        msg += `Status: ${bigPicture.overallStatusLabel}\n`;
        msg += `Ringkasan: ${bigPicture.overviewSummary}\n\n`;
        msg += `Action yang Dibutuhkan: ${bigPicture.decisionNeeded}\n`;
        if (reviewLink) {
          msg += `Link Review: ${reviewLink}\n`;
        }
        if (finalFileLink) {
          msg += `Link Delivery: ${finalFileLink}\n`;
        }
        if (billingNote) {
          msg += `${billingNote}\n`;
        }
        msg += `\nTerima kasih atas kerja samanya!`;
        return msg;
      } else {
        let msg = `Hi ${clientName},\n\n`;
        msg += `Here is a quick update for ${projectTitle}:\n\n`;
        msg += `Status: ${bigPicture.overallStatusLabel}\n`;
        msg += `Summary: ${bigPicture.overviewSummary}\n\n`;
        msg += `Action Needed: ${bigPicture.decisionNeeded}\n`;
        if (reviewLink) {
          msg += `Review Link: ${reviewLink}\n`;
        }
        if (finalFileLink) {
          msg += `Delivery Link: ${finalFileLink}\n`;
        }
        if (billingNote) {
          msg += `${billingNote}\n`;
        }
        msg += `\nThank you for your collaboration!`;
        return msg;
      }
    }
  },

  revisionBoundary: {
    name: "Revision Boundary Message",
    description: "Politely inform the client that they have reached the revision limit and explain fees.",
    category: "client_communication",
    outputMode: "client_message",
    requiredContext: ["revisionCount", "maxRevision", "revisionRule"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nSaya ingin menginformasikan mengenai putaran revisi untuk proyek '${ctx.projectTitle}'. Kita telah menyelesaikan ${ctx.revisionCount} dari ${ctx.maxRevision} revisi yang tercakup dalam kesepakatan awal kita.\n\nBerdasarkan aturan revisi kita: "${ctx.revisionRule}", setiap putaran perubahan berikutnya di luar batas ini akan dikenakan biaya sebagai pekerjaan di luar lingkup kerja awal (out-of-scope).\n\nSilakan beri tahu saya apakah versi saat ini sudah disetujui atau jika Anda ingin melanjutkan dengan penawaran tambahan untuk perubahan lebih lanjut.\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, kita telah mencapai ${ctx.revisionCount}/${ctx.maxRevision} revisi untuk '${ctx.projectTitle}'. Perubahan lebih lanjut akan berada di luar lingkup kerja awal dan ditagihkan secara terpisah. Harap konfirmasi jika disetujui. Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Semoga hari Anda menyenangkan. Hanya ingin mengabarkan tentang '${ctx.projectTitle}'. Kita telah menyelesaikan ${ctx.revisionCount} dari ${ctx.maxRevision} putaran revisi yang disepakati. Sesuai kesepakatan kita, ini menyelesaikan pekerjaan revisi yang sudah termasuk di awal. Beri tahu saya jika Anda ingin saya menyiapkan penawaran cepat untuk perubahan tambahan! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nHarap dicatat bahwa proyek '${ctx.projectTitle}' telah mencapai batas ${ctx.maxRevision} putaran revisi. Pembaruan tambahan akan dikenakan biaya di luar lingkup kerja awal. Silakan kirimkan persetujuan akhir Anda untuk versi saat ini. Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nHanya ingin mengabarkan bahwa kita telah mencapai ${ctx.revisionCount}/${ctx.maxRevision} putaran revisi untuk '${ctx.projectTitle}'. Revisi lebih lanjut akan berada di luar lingkup kerja kesepakatan awal kita. Beri tahu saya jika Anda sudah puas dengan pekerjaan saat ini atau ingin penawaran untuk revisi tambahan! Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nI wanted to check in on the revision rounds for the '${ctx.projectTitle}' project. We've completed ${ctx.revisionCount} out of the ${ctx.maxRevision} revisions included in our original agreement.\n\nUnder our revision rule: "${ctx.revisionRule}", any subsequent rounds of changes beyond the limit will be billed as out-of-scope work.\n\nPlease let me know if the current version is approved or if you want to proceed with a supplemental quote for further changes.\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, we have reached ${ctx.revisionCount}/${ctx.maxRevision} revisions for '${ctx.projectTitle}'. Further changes will be out-of-scope and invoiced separately. Please confirm if approved. Best, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 Hope you're having a lovely day. Just checking in on '${ctx.projectTitle}'. We have finished ${ctx.revisionCount} of the ${ctx.maxRevision} revision rounds. As per our agreement, this wraps up the included revision work. Let me know if you would like me to prepare a quick quote for any additional additions! Warmly, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nPlease note that '${ctx.projectTitle}' has reached the limit of ${ctx.maxRevision} revision rounds. Additional updates will be billed under out-of-scope rates. Please submit your final approval for the current version. Best regards, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nJust a quick heads-up that we've reached ${ctx.revisionCount}/${ctx.maxRevision} revision rounds for '${ctx.projectTitle}'. Further revisions will fall outside the original scope. Let me know if you're happy with the current work or would like a quote for more revisions! Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  scopeChange: {
    name: "Scope Change / Extra Revision Message",
    description: "Politely inform the client that their request is outside the original project scope.",
    category: "client_communication",
    outputMode: "client_message",
    requiredContext: ["projectTitle", "clientRequest"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      const requestText = ctx.clientRequest && ctx.clientRequest !== "[Client Request]" ? ctx.clientRequest : "your new request";
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nTerima kasih atas pembaruannya. Mengenai permintaan Anda: "${requestText}", hal ini sedikit di luar lingkup kerja awal proyek kita untuk '${ctx.projectTitle}'.\n\nTentu saya dapat membantu Anda dengan ini! Saya akan menyiapkan penawaran/invoice tambahan terpisah yang merinci biaya dan jangka waktu untuk perubahan ini sehingga linimasa proyek utama tetap berjalan sesuai rencana.\n\nBeri tahu saya jika hal tersebut dapat disetujui!\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, permintaan: "${requestText}" berada di luar lingkup kerja awal kita untuk '${ctx.projectTitle}'. Saya akan segera mengirimkan proposal/penawaran terpisah jika Anda ingin melanjutkannya. Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Terima kasih telah menghubungi saya dengan ide-ide baru ini! Mengenai permintaan: "${requestText}", ini sedikit di luar apa yang kita gariskan di lingkup kerja awal untuk '${ctx.projectTitle}'. Saya akan sangat senang untuk menambahkannya! Saya akan membuat draf penawaran tambahan singkat agar kita bisa mewujudkannya. Beri tahu saya pendapat Anda! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nPermintaan Anda: "${requestText}" berada di luar lingkup pekerjaan yang disepakati untuk '${ctx.projectTitle}'. Saya akan menagih hal ini secara terpisah. Harap konfirmasi apakah Anda ingin saya menghentikan pencapaian (milestone) saat ini untuk menyiapkan penawaran, atau melanjutkan dengan lingkup kerja yang disepakati. Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nItu terdengar seperti pembaruan yang menarik! Hanya ingin mengingatkan bahwa "${requestText}" berada di luar lingkup kerja awal proyek '${ctx.projectTitle}'. Saya akan mengirimkan penawaran singkat untuk tambahan ekstra ini agar kita dapat menjadwalkannya. Beri tahu saya jika itu terdengar baik! Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nThank you for the update. Regarding your request: "${requestText}", this is slightly outside our original project scope for '${ctx.projectTitle}'.\n\nI can certainly help you with this! I will prepare a separate quote/supplemental invoice detailing the cost and timeframe for these changes so we can keep the main project timeline on track.\n\nLet me know if that works for you!\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, the request: "${requestText}" is outside our original scope for '${ctx.projectTitle}'. I will send a separate proposal/quote shortly if you'd like to proceed. Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 Thanks for reaching out with these new ideas! Regarding the request: "${requestText}", it is a bit beyond what we outlined in our initial scope for '${ctx.projectTitle}'. I'd be absolutely thrilled to add this in! I will draft a quick addendum quote so we can make this happen. Let me know what you think! Best, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nYour request: "${requestText}" is outside the agreed scope of work for '${ctx.projectTitle}'. I will invoice this separately. Please confirm if you would like me to halt the current milestone to prepare a quote, or proceed with the agreed scope. Sincerely, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nThat sounds like a cool update! Just a heads-up that "${requestText}" is outside the original scope for '${ctx.projectTitle}'. I'll send over a quick quote for this extra addition so we can get it scheduled. Let me know if that sounds good! Cheers, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  testimonialRequest: {
    name: "Testimonial Request",
    description: "Politely request a testimonial or review from the client after completion.",
    category: ["portfolio_review", "client_communication"],
    outputMode: "client_message",
    requiredContext: ["clientName", "projectTitle"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nTerima kasih sekali lagi atas kolaborasi yang luar biasa dalam proyek '${ctx.projectTitle}'! Kerja sama kita untuk mewujudkan proyek ini sungguh menyenangkan.\n\nKarena proyek ini telah selesai, saya akan sangat berterima kasih jika Anda dapat membagikan testimoni atau ulasan singkat tentang pengalaman Anda. Masukan Anda membantu saya untuk berkembang dan berfungsi sebagai referensi bagi client di masa mendatang.\n\nTerima kasih banyak atas waktu Anda!\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, terima kasih atas kolaborasi yang luar biasa dalam proyek '${ctx.projectTitle}'. Jika Anda puas, bisakah Anda menulis ulasan singkat tentang pengalaman Anda? Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Saya ingin mengucapkan terima kasih yang sebesar-besarnya atas proyek yang luar biasa ini! Jika Anda memiliki waktu luang, bersediakah Anda membagikan testimoni singkat tentang kerja sama kita? Ulasan Anda akan sangat berarti bagi saya! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nSaat kita menyelesaikan detail proyek, silakan kirimkan testimoni umpan balik singkat mengenai pengiriman proyek '${ctx.projectTitle}'. Kami menghargai bisnis Anda. Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nSangat menyenangkan bekerja sama dalam proyek '${ctx.projectTitle}'! Jika Anda punya waktu, saya akan sangat senang jika Anda bisa menulis satu atau dua kalimat singkat tentang kolaborasi kita. Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nThank you again for a wonderful collaboration on '${ctx.projectTitle}'! It was an absolute pleasure working together to bring this to life.\n\nSince the project is now completed, I would be incredibly grateful if you could share a brief testimonial or review about your experience. Your feedback helps me improve and serves as a reference for future clients.\n\nThank you so much for your time!\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, thank you for a great collaboration on '${ctx.projectTitle}'. If you are satisfied, could you write a brief review about your experience? Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 I wanted to say a massive thank you for such an awesome project! If you had a spare minute, would you mind sharing a quick testimonial about our work together? It would mean the absolute world to me! Warmest wishes, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nAs we finalize project details, please submit a brief client feedback testimonial regarding the delivery of '${ctx.projectTitle}'. We appreciate your business. Regards, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nIt was super fun working together on '${ctx.projectTitle}'! If you have a moment, I'd love it if you could write a brief sentence or two about our collaboration. Cheers, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  proposalDraft: {
    name: "Proposal Draft Prompt",
    description: "Create a formal, structured freelance proposal to pitch to a lead.",
    category: "client_communication",
    outputMode: "ai_prompt",
    requiredContext: ["projectTitle", "clientName", "budget"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const budgetStr = (ctx.invoiceAmount || ctx.budget) ? formatMoney(ctx.invoiceAmount || ctx.budget, ctx.invoiceCurrency || ctx.projectCurrency || 'IDR') : 'TBD';
      
      if (targetLang === 'id') {
        return `Hasilkan proposal proyek freelance yang profesional.

Nama Proyek: ${ctx.projectTitle}
Nama Client: ${ctx.clientName}
Lingkup Kerja / Deskripsi: ${project.description || 'Deskripsi tidak tersedia.'}
Anggaran: ${budgetStr}

Harap rancang draf proposal yang mencakup:
1. Pendahuluan & Pemahaman tentang Kebutuhan Client
2. Solusi & Arsitektur yang Diusulkan
3. Pencapaian Utama (Milestones) & Estimasi Jadwal (Target: ${ctx.deadline})
4. Rincian Investasi (Anggaran: ${budgetStr} dan ketentuan pembayaran)
5. Ketentuan Revisi (Maksimal revisi yang diizinkan: ${ctx.maxRevision} putaran)
6. Langkah Berikutnya untuk memulai proyek

Pertahankan nada bicara yang percaya diri, premium, dan profesional yang sesuai untuk seorang freelancer digital.`;
      } else {
        return `Generate a professional freelance project proposal.

Project Name: ${ctx.projectTitle}
Client Name: ${ctx.clientName}
Scope / Description: ${project.description || 'No description available.'}
Budget: ${budgetStr}

Please draft a proposal including:
1. Introduction & Understanding of Client Needs
2. Proposed Solution & Architecture
3. Key Milestones & Estimated Schedule (Target: ${ctx.deadline})
4. Investment Details (Budget: ${budgetStr} and payment terms)
5. Revision Terms (Max revisions allowed: ${ctx.maxRevision} rounds)
6. Next Steps to kick off project

Maintain a confident, premium, and professional tone suitable for a digital freelancer.`;
      }
    }
  },

  scopeChecker: {
    name: "Scope Checker Prompt",
    description: "Check a client request against your original scope to flag potential scope creep.",
    category: "client_communication",
    outputMode: "ai_prompt",
    requiredContext: ["projectTitle", "clientRequest"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const stageName = targetLang === 'id' ? t('kanban.stages.' + ctx.stage, ctx.stage) : ctx.stage;

      if (targetLang === 'id') {
        return `Evaluasi permintaan client ini untuk potensi terjadinya penambahan lingkup kerja secara halus (scope creep) berdasarkan lingkup kerja proyek kita.

Detail Proyek:
- Judul: ${ctx.projectTitle}
- Lingkup Kerja / Deskripsi: ${project.description || 'Tidak ada deskripsi.'}
- Target Tenggat Waktu: ${ctx.deadline}
- Tahap Saat Ini: ${stageName}

Permintaan Baru Client:
${ctx.clientRequest}

Harap analisis:
1. Apakah permintaan ini berada di dalam lingkup kerja asli proyek?
2. Jika di luar lingkup kerja, mengapa? (Tandai area spesifik seperti mendesain halaman tambahan, revisi tambahan)
3. Estimasi kompleksitas/jam tambahan.
4. Draf tanggapan yang sopan dan profesional kepada client yang menjelaskan bahwa ini adalah tambahan di luar lingkup kerja.`;
      } else {
        return `Evaluate this client request for potential scope creep based on our project scope.

Project Details:
- Title: ${ctx.projectTitle}
- Scope / Description: ${project.description || 'No description.'}
- Target Deadline: ${ctx.deadline}
- Current Stage: ${ctx.stage}

New Client Request:
${ctx.clientRequest}

Please analyze:
1. Is this request within the original project scope?
2. If outside scope, why? (Flag specific areas like coding extra pages, extra revisions)
3. Estimate of additional complexity/hours.
4. Draft a polite, professional reply to the client explaining that this is an out-of-scope addition.`;
      }
    }
  },

  // --- MEETING & MEMORY ---
  meetingSummary: {
    name: "Meeting Summary Prompt",
    description: "Generate structured notes, deliverables, and action items from raw meeting notes.",
    category: "meeting_memory",
    outputMode: "ai_prompt",
    requiredContext: ["keyDiscussionPoints"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      
      if (targetLang === 'id') {
        return `Ringkas catatan rapat berikut menjadi: poin-poin utama, keputusan, item tindakan, kekhawatiran client, tindak lanjut berikutnya, dan usulan pesan pembaruan untuk client.

Proyek: ${ctx.projectTitle}
Client: ${ctx.clientName}
Catatan Rapat / Poin Diskusi:
${ctx.keyDiscussionPoints}

Harap hasilkan:
1. Ringkasan Rapat
2. Kebutuhan Client & Fokus Utama
3. Keputusan Penting yang Diambil
4. Item Tindakan untuk Saya (Freelancer)
5. Item Tindakan untuk Client
6. Peringatan Potensi Penambahan Lingkup Kerja (Scope Creep)
7. Usulan Langkah Berikutnya
8. Draf pesan tindak lanjut untuk client`;
      } else {
        return `Summarize the following meeting notes into: key points, decisions, action items, client concerns, next follow-up, and suggested client update message.

Project: ${ctx.projectTitle}
Client: ${ctx.clientName}
Meeting Notes / Discussion Points:
${ctx.keyDiscussionPoints}

Please generate:
1. Meeting Summary
2. Client Needs & Main Focus
3. Key Decisions Made
4. Action Items for Me (Freelancer)
5. Action Items for the Client
6. Potential Scope Creep Warnings
7. Suggested Next Action
8. Draft follow-up message to client`;
      }
    }
  },

  clientMemoryExtraction: {
    name: "Client Memory Extraction Prompt",
    description: "Generate a prompt to extract client preferences and communication style from notes.",
    category: "meeting_memory",
    outputMode: "ai_prompt",
    requiredContext: ["keyDiscussionPoints"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      
      if (targetLang === 'id') {
        return `Ekstrak memori client dari catatan ini. Kembalikan gaya komunikasi, saluran pilihan, pengambil keputusan, gaya persetujuan, pola revisi, preferensi pengiriman, petunjuk pembayaran/tindak lanjut, catatan penting, dan usulan langkah berikutnya.

Client: ${ctx.clientName}
Catatan untuk diekstrak:
${ctx.keyDiscussionPoints}

Harap susun memori yang diekstrak ke dalam format JSON:
{
  "communicationStyle": "",
  "preferredChannel": "",
  "preferredUpdateFrequency": "",
  "decisionMaker": "",
  "approvalStyle": "",
  "revisionPattern": "",
  "paymentBehavior": "",
  "paymentReminderStyle": "",
  "deliveryPreference": "",
  "filePreference": "",
  "tonePreference": "",
  "importantNotes": "",
  "clientRiskNotes": "",
  "relationshipStatus": "",
  "nextAction": ""
}`;
      } else {
        return `Extract client memory from these notes. Return communication style, preferred channel, decision maker, approval style, revision pattern, delivery preference, payment/follow-up clues, important notes, and recommended next action.

Client: ${ctx.clientName}
Notes to extract from:
${ctx.keyDiscussionPoints}

Please structure the extracted memory into JSON format:
{
  "communicationStyle": "",
  "preferredChannel": "",
  "preferredUpdateFrequency": "",
  "decisionMaker": "",
  "approvalStyle": "",
  "revisionPattern": "",
  "paymentBehavior": "",
  "paymentReminderStyle": "",
  "deliveryPreference": "",
  "filePreference": "",
  "tonePreference": "",
  "importantNotes": "",
  "clientRiskNotes": "",
  "relationshipStatus": "",
  "nextAction": ""
}`;
      }
    }
  },

  clientRelationshipSummary: {
    name: "Client Relationship Summary",
    description: "Generate a strategic relationship review and recommended next action for the client.",
    category: "meeting_memory",
    outputMode: "internal_summary",
    requiredContext: ["clientName"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const cm = ctx.clientMemory || {};
      
      if (targetLang === 'id') {
        const relStatus = cm.relationshipStatus ? t('status.relationship.' + cm.relationshipStatus, cm.relationshipStatus) : 'N/A';
        const tonePref = cm.tonePreference ? t('tone.' + cm.tonePreference.toLowerCase(), cm.tonePreference) : 'Profesional';

        return `Ringkasan internal — bukan untuk client.
Tinjauan Hubungan untuk Client: ${ctx.clientName}
Proyek: ${ctx.projectTitle}

Status Hubungan: ${relStatus}
Gaya Komunikasi: ${cm.communicationStyle || 'N/A'} (Saluran Pilihan: ${cm.preferredChannel || 'N/A'})
Pola Revisi: ${cm.revisionPattern || 'N/A'}
Perilaku Pembayaran: ${cm.paymentBehavior || 'N/A'} (Gaya Pengingat: ${cm.paymentReminderStyle || 'N/A'})
Catatan Penting: ${cm.importantNotes || 'N/A'}
Penilaian Risiko: ${cm.clientRiskNotes || 'Tidak ada catatan.'}

Rekomendasi:
- Komunikasi: Sesuaikan nada bicara ke "${tonePref}".
- Strategi: Waspadai "${cm.revisionPattern || 'revisi'}".
- Rekomendasi Langkah Berikutnya: Lakukan tindak lanjut melalui ${cm.preferredChannel || 'email'} pada pencapaian proyek berikutnya.`;
      } else {
        return `Internal summary — not for client.
Relationship Review for Client: ${ctx.clientName}
Project: ${ctx.projectTitle}

Relationship Status: ${cm.relationshipStatus || 'N/A'}
Communication Style: ${cm.communicationStyle || 'N/A'} (Preferred Channel: ${cm.preferredChannel || 'N/A'})
Revision Pattern: ${cm.revisionPattern || 'N/A'}
Payment Behavior: ${cm.paymentBehavior || 'N/A'} (Reminder Style: ${cm.paymentReminderStyle || 'N/A'})
Important Notes: ${cm.importantNotes || 'N/A'}
Risk Assessment: ${cm.clientRiskNotes || 'None logged.'}

Recommendations:
- Communication: Adjust tone to "${cm.tonePreference || 'Professional'}".
- Strategy: Watch out for "${cm.revisionPattern || 'revisions'}".
- Next Action Recommendation: Follow up via ${cm.preferredChannel || 'email'} on next project milestones.`;
      }
    }
  },

  // --- DELIVERY ---
  deliveryMessage: {
    name: "Delivery Message",
    description: "Generate a polished delivery email or WhatsApp message for drafts or final files.",
    category: "delivery",
    outputMode: "client_message",
    requiredContext: ["deliveryStatus", "previewLink", "finalFileLink"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      const terms = getRoleTerminology(ctx.templateRole, targetLang);
      const delStatus = targetLang === 'id' ? t('status.delivery.' + ctx.deliveryStatus, ctx.deliveryStatus) : ctx.deliveryStatus;

      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nDengan senang hati saya mengirimkan hasil pekerjaan untuk '${ctx.projectTitle}'! Status saat ini adalah '${delStatus}'.\n\n- Link Pratinjau (${terms.preview}): ${ctx.previewLink}\n- Link File Akhir (${terms.final}): ${ctx.finalFileLink}\n\nCatatan Serah Terima:\n${ctx.handoverNotes && ctx.handoverNotes !== "[Handover Notes]" ? ctx.handoverNotes : "Tidak ada catatan."}\n\nSilakan tinjau hasil pekerjaan tersebut jika Anda memiliki waktu luang dan beri tahu saya persetujuan Anda atau jika Anda memiliki pertanyaan.\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, mengirimkan hasil pekerjaan untuk '${ctx.projectTitle}'. Tinjau pratinjau di ${ctx.previewLink || 'N/A'} and unduh file di ${ctx.finalFileLink || 'N/A'}. Beri tahu saya jika sudah disetujui. Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Sangat senang bisa membagikan hasil pekerjaan untuk '${ctx.projectTitle}' dengan Anda! Ini pratinjaunya: ${ctx.previewLink} dan ini file akhirnya: ${ctx.finalFileLink}. Beri tahu saya jika Anda menyukainya! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nBerikut adalah hasil pekerjaan untuk '${ctx.projectTitle}':\n- Pratinjau: ${ctx.previewLink}\n- File akhir: ${ctx.finalFileLink}\n\nHarap kirimkan persetujuan formal Anda secepatnya agar kami dapat menandai proyek ini telah selesai. Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nIni hasil pekerjaan yang telah selesai untuk '${ctx.projectTitle}'! Cek pratinjaunya di sini: ${ctx.previewLink} dan unduh file akhirnya: ${ctx.finalFileLink}. Beri tahu saya pendapat Anda! Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nI am excited to deliver the work for '${ctx.projectTitle}'! The status is currently '${ctx.deliveryStatus}'.\n\n- Preview Link (${terms.preview}): ${ctx.previewLink}\n- Final Files Link (${terms.final}): ${ctx.finalFileLink}\n\nHandover Notes:\n${ctx.handoverNotes && ctx.handoverNotes !== "[Handover Notes]" ? ctx.handoverNotes : "None provided."}\n\nPlease review the deliverables when you have a moment and let me know of your approval or if you have any questions.\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, delivering deliverables for '${ctx.projectTitle}'. Review preview at ${ctx.previewLink || 'N/A'} and download files at ${ctx.finalFileLink || 'N/A'}. Let me know once approved. Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 So excited to share the results for '${ctx.projectTitle}' with you! Here's the preview: ${ctx.previewLink} and here are the final files: ${ctx.finalFileLink}. Let me know if you love it! Warmly, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nPlease find the deliverables for '${ctx.projectTitle}' attached below:\n- Preview: ${ctx.previewLink}\n- Final files: ${ctx.finalFileLink}\n\nPlease submit your formal approval at your earliest convenience so we can mark this project complete. Sincerely, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nHere is the completed work for '${ctx.projectTitle}'! Check out the preview here: ${ctx.previewLink} and download files: ${ctx.finalFileLink}. Let me know what you think! Cheers, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  handoverNotes: {
    name: "Handover Notes Prompt",
    description: "Generate an AI prompt to turn project details into clear technical handover notes.",
    category: "delivery",
    outputMode: "ai_prompt",
    requiredContext: ["projectTitle", "finalFileLink", "sourceFileLink"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const terms = getRoleTerminology(ctx.templateRole, targetLang);
      const roleName = targetLang === 'id' ? t('templates.' + ctx.templateRole, ctx.templateRole) : ctx.templateRole;

      if (targetLang === 'id') {
        return `Hasilkan catatan serah terima (handover) terperinci dan instruksi pengaturan untuk client berdasarkan proyek ini.

Nama Proyek: ${ctx.projectTitle}
Peran / Lingkup Template: ${roleName}
Link Hasil Akhir (${terms.final}): ${ctx.finalFileLink}
Kode Sumber / File Desain (${terms.source}): ${ctx.sourceFileLink}

Harap tulis dokumen serah terima langkah demi langkah:
1. Ikhtisar hasil pekerjaan yang disertakan.
2. Organisasi & format file (sebutkan ${terms.source}).
3. Instruksi penyiapan teknis, hosting, atau implementasi.
4. Rekomendasi pemeliharaan di masa mendatang.

Gunakan terminologi yang jelas dan profesional yang sesuai untuk seorang ${roleName || 'Freelancer'}.`;
      } else {
        return `Generate detailed handover notes and setup instructions for the client based on this project.

Project Name: ${ctx.projectTitle}
Template Role / Scope: ${ctx.templateRole}
Final Deliverable Link (${terms.final}): ${ctx.finalFileLink}
Source Code / Design Files (${terms.source}): ${ctx.sourceFileLink}

Please write a step-by-step handover document:
1. Overview of deliverables included.
2. File organization & formats (mention ${terms.source}).
3. Technical setup, hosting, or implementation instructions.
4. Future maintenance recommendations.

Use clear, professional terminology appropriate for a ${ctx.templateRole || 'Freelancer'}.`;
      }
    }
  },

  revisionSummary: {
    name: "Revision Summary",
    description: "Summarize client feedback into a structured list of adjustments.",
    category: "delivery",
    outputMode: "internal_summary",
    requiredContext: ["clientFeedbackSummary"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      
      if (targetLang === 'id') {
        return `Ringkasan internal — bukan untuk client.
Daftar Periksa Revisi: '${ctx.projectTitle}'
- Ringkasan Umpan Balik Client: ${ctx.clientFeedbackSummary}
- Putaran Revisi: ${ctx.revisionCount} / ${ctx.maxRevision}

Rencana Tindakan:
1. Urai kekhawatiran client: "${ctx.clientFeedbackSummary}"
2. Tugas: Terapkan perubahan yang sesuai dengan pedoman desain.
3. Pemeriksaan berikutnya: verifikasi apakah putaran ini menyelesaikan batas revisi maksimum ${ctx.maxRevision}.`;
      } else {
        return `Internal summary — not for client.
Revision Checklist: '${ctx.projectTitle}'
- Client Feedback Summary: ${ctx.clientFeedbackSummary}
- Revision Round: ${ctx.revisionCount} / ${ctx.maxRevision}

Action Plan:
1. Parse client concerns: "${ctx.clientFeedbackSummary}"
2. Tasks: Apply edits matching design guidelines.
3. Next check: verify if this round completes max revision boundary of ${ctx.maxRevision}.`;
      }
    }
  },

  deliveryChecklistGen: {
    name: "Final Delivery Checklist Prompt",
    description: "Generate an AI prompt that checks whether the project is ready for delivery.",
    category: "delivery",
    outputMode: "ai_prompt",
    requiredContext: ["projectTitle"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const terms = getRoleTerminology(ctx.templateRole, targetLang);
      const roleName = targetLang === 'id' ? t('templates.' + ctx.templateRole, ctx.templateRole) : ctx.templateRole;

      if (targetLang === 'id') {
        return `Hasilkan daftar periksa jaminan kualitas (quality assurance) pra-pengiriman yang komprehensif untuk proyek freelance saya.

Judul Proyek: ${ctx.projectTitle}
Spesialisasi Peran: ${roleName}

Harap buat daftar pemeriksaan kontrol kualitas untuk:
1. Kelengkapan hasil pekerjaan (memeriksa link akhir: ${terms.final} dan sumber: ${terms.source}).
2. Verifikasi format aset, ukuran, atau lingkungan pementasan (staging).
3. Koreksi teks konten (proofreading) dan pemeriksaan konsistensi visual.
4. Pemeriksaan dokumentasi serah terima client.`;
      } else {
        return `Generate a comprehensive pre-delivery quality assurance checklist for my freelance project.

Project Title: ${ctx.projectTitle}
Role Specialty: ${ctx.templateRole}

Please list quality control checks for:
1. Deliverable completeness (checking final link: ${terms.final} and source: ${terms.source}).
2. Asset formatting, sizing, or staging verification.
3. Content proofreading and visual consistency checks.
4. Client handover documentation checks.`;
      }
    }
  },

  // --- INVOICE & PAYMENT ---
  invoiceFollowUp: {
    name: "Invoice Follow-up Prompt",
    description: "Draft a polite reminder to a client regarding an unpaid invoice.",
    category: "invoice_payment",
    outputMode: "client_message",
    requiredContext: ["invoiceNumber", "invoiceAmount", "invoiceDueDate"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      const amountStr = ctx.invoiceAmount ? formatMoney(ctx.invoiceAmount, ctx.invoiceCurrency) : 'TBD';
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nSemoga minggu Anda menyenangkan! Ini adalah pengingat santun mengenai Invoice #${ctx.invoiceNumber} (${amountStr}) untuk proyek '${ctx.projectTitle}', yang jatuh tempo pada tanggal ${ctx.invoiceDueDate}.\n\nSilakan beri tahu saya jika Anda memerlukan penyesuaian atau memiliki pertanyaan. Terima kasih atas dukungan Anda!\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, Invoice #${ctx.invoiceNumber} (${amountStr}) jatuh tempo pada ${ctx.invoiceDueDate}. Harap beri tahu saya setelah diproses. Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Semoga Anda dalam keadaan baik. Hanya catatan singkat bahwa Invoice #${ctx.invoiceNumber} untuk '${ctx.projectTitle}' mendekati jatuh tempo pada ${ctx.invoiceDueDate}. Totalnya adalah ${amountStr}. Terima kasih banyak telah bekerja sama dengan saya! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nTerlampir adalah pengingat untuk Invoice #${ctx.invoiceNumber} (${amountStr}) yang jatuh tempo pada ${ctx.invoiceDueDate}. Silakan selesaikan pembayaran secepatnya untuk menghindari penghentian pekerjaan. Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nHanya ingin menanyakan kabar mengenai Invoice #${ctx.invoiceNumber} (${amountStr}) yang jatuh tempo pada ${ctx.invoiceDueDate}. Hubungi saya jika ada hal lain yang Anda butuhkan dari saya! Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nI hope you're having a great week! This is a gentle reminder regarding Invoice #${ctx.invoiceNumber} (${amountStr}) for the '${ctx.projectTitle}' project, which is due on ${ctx.invoiceDueDate}.\n\nPlease let me know if you need any adjustments or if you have any questions. Thank you for your support!\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, Invoice #${ctx.invoiceNumber} (${amountStr}) is due on ${ctx.invoiceDueDate}. Please let me know once processed. Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 Hope you're doing well. Just a quick note that Invoice #${ctx.invoiceNumber} for '${ctx.projectTitle}' is coming up on ${ctx.invoiceDueDate}. The total is ${amountStr}. Thanks so much for working with me! Warmly, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nPlease find attached a reminder for Invoice #${ctx.invoiceNumber} (${amountStr}) due on ${ctx.invoiceDueDate}. Please settle payment at your earliest convenience to avoid work stoppage. Best regards, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nJust a quick check-in on Invoice #${ctx.invoiceNumber} (${amountStr}) due on ${ctx.invoiceDueDate}. Let me know if you need anything else from me! Cheers, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  overduePayment: {
    name: "Overdue Payment Reminder",
    description: "Draft a calm notice reminding the client that the invoice due date has passed.",
    category: "invoice_payment",
    outputMode: "client_message",
    requiredContext: ["invoiceNumber", "amountDue", "invoiceDueDate"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      const dueStr = ctx.amountDue ? formatMoney(ctx.amountDue, ctx.invoiceCurrency) : 'TBD';
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nSemoga Anda dalam keadaan baik. Hanya ingin menindaklanjuti Invoice #${ctx.invoiceNumber} (${dueStr}) untuk proyek '${ctx.projectTitle}', yang telah jatuh tempo pada tanggal ${ctx.invoiceDueDate} dan kini telah melewati batas waktu.\n\nHarap luangkan waktu sejenak untuk meninjau detailnya. Beri tahu saya jika Anda memiliki pertanyaan atau kapan saya bisa mengharapkan transfer ini selesai.\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, Invoice #${ctx.invoiceNumber} (${dueStr}) jatuh tempo pada ${ctx.invoiceDueDate} dan kini terlambat. Harap selesaikan transfer ini sesegera mungkin. Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Semoga minggu Anda menyenangkan. Hanya catatan santun bahwa Invoice #${ctx.invoiceNumber} (${dueStr}) telah melewati tanggal jatuh temponya yaitu ${ctx.invoiceDueDate}. Tolong kirimkan bukti transfer jika ada kesempatan agar saya dapat memperbarui catatan saya. Terima kasih! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nMenurut catatan kami, Invoice #${ctx.invoiceNumber} untuk proyek '${ctx.projectTitle}' belum diselesaikan. Saldo sebesar ${dueStr} jatuh tempo pada tanggal ${ctx.invoiceDueDate}. Harap kirimkan transfer pembayaran segera. Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nHanya tindak lanjut singkat untuk Invoice #${ctx.invoiceNumber} (${dueStr}) yang jatuh tempo pada ${ctx.invoiceDueDate}. Beri tahu saya jika Anda membutuhkan informasi untuk menyelesaikan ini! Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nI hope you are well. Just following up on Invoice #${ctx.invoiceNumber} (${dueStr}) for '${ctx.projectTitle}', which was due on ${ctx.invoiceDueDate} and is now overdue.\n\nPlease take a moment to look over the details. Let me know if you have any questions or when I can expect the transfer to be completed.\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, Invoice #${ctx.invoiceNumber} (${dueStr}) was due on ${ctx.invoiceDueDate} and is now overdue. Please settle this transfer as soon as possible. Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 Hope you're having a good week. Just a gentle note that Invoice #${ctx.invoiceNumber} (${dueStr}) is a little past its due date of ${ctx.invoiceDueDate}. Please send over the receipt when you get a chance so I can update my records. Thank you! Best, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nAccording to our records, Invoice #${ctx.invoiceNumber} for '${ctx.projectTitle}' remains outstanding. The balance of ${dueStr} was due on ${ctx.invoiceDueDate}. Please submit the transfer immediately. Sincerely, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nJust a quick follow-up on Invoice #${ctx.invoiceNumber} (${dueStr}) due on ${ctx.invoiceDueDate}. Let me know if you need any info to get this resolved! Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  paymentConfirmation: {
    name: "Payment Confirmation Message",
    description: "Draft a message confirming that their payment has been received and thank them.",
    category: "invoice_payment",
    outputMode: "client_message",
    requiredContext: ["invoiceNumber", "amountPaid"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      const paidStr = ctx.amountPaid ? formatMoney(ctx.amountPaid, ctx.paymentCurrency) : 'TBD';
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nSaya menulis pesan ini untuk mengonfirmasi bahwa pembayaran Anda sebesar ${paidStr} untuk Invoice #${ctx.invoiceNumber} (${ctx.projectTitle}) telah berhasil kami terima.\n\nTerima kasih banyak atas pembayarannya dan untuk kolaborasi yang luar biasa! Saya berharap dapat bekerja sama lagi di lain waktu.\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, pembayaran ${paidStr} untuk Invoice #${ctx.invoiceNumber} telah diterima. Terima kasih! Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Saya ingin mengucapkan terima kasih yang hangat! Pembayaran Anda sebesar ${paidStr} untuk Invoice #${ctx.invoiceNumber} telah aman kami terima. Bekerja sama dengan Anda sungguh luar biasa! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nKami mengonfirmasi penerimaan pembayaran sebesar ${paidStr} sebagai pelunasan penuh Invoice #${ctx.invoiceNumber} untuk proyek '${ctx.projectTitle}'. Akun Anda sekarang telah bersih dari tunggakan. Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nKabar baik—pembayaran ${paidStr} untuk Invoice #${ctx.invoiceNumber} telah diterima! Terima kasih banyak. Sampai bicara lagi! Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nI am writing to confirm that your payment of ${paidStr} for Invoice #${ctx.invoiceNumber} (${ctx.projectTitle}) has been received successfully.\n\nThank you very much for the payment and for a great collaboration! I look forward to working together again.\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, payment of ${paidStr} for Invoice #${ctx.invoiceNumber} received. Thank you! Best, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 I just wanted to send a warm thank you! Your payment of ${paidStr} for Invoice #${ctx.invoiceNumber} is safely received. Working together has been absolute bliss! Warmest regards, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nWe acknowledge receipt of payment of ${paidStr} representing full settlement of Invoice #${ctx.invoiceNumber} for '${ctx.projectTitle}'. Your account is now clear. Thank you, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nAwesome news—payment of ${paidStr} for Invoice #${ctx.invoiceNumber} is received! Thanks so much. Speak soon! Cheers, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  receiptRequest: {
    name: "Receipt Request Message",
    description: "Politely request the client to send the transfer receipt for verification.",
    category: "invoice_payment",
    outputMode: "client_message",
    requiredContext: ["invoiceNumber", "invoiceAmount"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'client-facing' });
      const amountStr = ctx.invoiceAmount ? formatMoney(ctx.invoiceAmount, ctx.invoiceCurrency) : 'TBD';
      
      if (targetLang === 'id') {
        let baseMsg = `Halo ${ctx.clientName},\n\nHanya ingin menanyakan tentang transfer untuk Invoice #${ctx.invoiceNumber} (${amountStr}). Jika pembayaran sudah dikirim, bisakah Anda membagikan tangkapan layar atau bukti transfer?\n\nIni akan membantu saya memverifikasinya ke bank dan segera memperbarui status proyek kami. Terima kasih!\n\nSalam hangat,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Halo ${ctx.clientName}, tolong kirimkan bukti transfer untuk Invoice #${ctx.invoiceNumber} (${amountStr}) agar kami dapat mengonfirmasinya. Terima kasih, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Halo ${ctx.clientName}! 😊 Semoga hari Anda menyenangkan. Hanya ingin menanyakan apakah Anda sempat memproses Invoice #${ctx.invoiceNumber} (${amountStr}). Jika demikian, bersediakah Anda mengirimkan tangkapan layar cepat dari bukti transfer? Terima kasih banyak! Salam hangat, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Kepada ${ctx.clientName},\n\nKami meminta Anda untuk memberikan bukti transfer untuk Invoice #${ctx.invoiceNumber} (${amountStr}) untuk melepaskan hasil pekerjaan (deliverables). Hormat kami, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Halo ${ctx.clientName}!\n\nHanya ingin mengingatkan: jika Anda sudah mengirimkan pembayaran untuk Invoice #${ctx.invoiceNumber} (${amountStr}), silakan bagikan salinan bukti transfer agar kami dapat menandai semuanya telah lunas! Salam, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      } else {
        let baseMsg = `Hi ${ctx.clientName},\n\nJust checking in on the transfer for Invoice #${ctx.invoiceNumber} (${amountStr}). If payment has already been sent, could you please share a screenshot or transfer receipt?\n\nThis will help me verify it with the bank and update our project status immediately. Thanks!\n\nBest,\n${ctx.freelancerName || 'Freelancer'}`;
        
        if (tone === 'Concise') {
          return `Hi ${ctx.clientName}, please upload/send the transfer receipt for Invoice #${ctx.invoiceNumber} (${amountStr}) so we can confirm receipt. Thanks, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Warm') {
          baseMsg = `Hi ${ctx.clientName}! 😊 Hope you're having a lovely day. Just checking if you had a chance to process Invoice #${ctx.invoiceNumber} (${amountStr}). If so, would you mind sending a quick screenshot of the transfer receipt? Thank you so much! Best, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Firm') {
          baseMsg = `Dear ${ctx.clientName},\n\nWe request that you provide proof of transfer for Invoice #${ctx.invoiceNumber} (${amountStr}) in order to release deliverables. Best regards, ${ctx.freelancerName || 'Freelancer'}`;
        }
        if (tone === 'Friendly') {
          baseMsg = `Hi ${ctx.clientName}!\n\nJust a quick heads-up: if you've already sent payment for Invoice #${ctx.invoiceNumber} (${amountStr}), please share a copy of the receipt so we can get everything marked off! Cheers, ${ctx.freelancerName || 'Freelancer'}`;
        }
        return baseMsg;
      }
    }
  },

  paymentSummary: {
    name: "Payment Summary Prompt",
    description: "Generate a summary of invoices, payments received, and outstanding balance.",
    category: "invoice_payment",
    outputMode: "internal_summary",
    requiredContext: ["invoiceNumber", "invoiceAmount", "amountPaid", "amountDue"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const totalStr = ctx.invoiceAmount ? formatMoney(ctx.invoiceAmount, ctx.invoiceCurrency) : 'TBD';
      const paidStr = ctx.amountPaid ? formatMoney(ctx.amountPaid, ctx.paymentCurrency) : '0';
      const dueStr = ctx.amountDue ? formatMoney(ctx.amountDue, ctx.invoiceCurrency) : '0';
      const pNotes = ctx.paymentNotes && ctx.paymentNotes !== "[Internal Payment Notes]" ? ctx.paymentNotes : (targetLang === 'id' ? "Tidak ada" : "None");
      const payStatus = targetLang === 'id' ? t('status.payment.' + ctx.paymentStatus, ctx.paymentStatus) : ctx.paymentStatus;

      if (targetLang === 'id') {
        return `Ringkasan internal — bukan untuk client.
Ringkasan Pembayaran: '${ctx.projectTitle}' (Client: ${ctx.clientName})
- Nomor Invoice: ${ctx.invoiceNumber}
- Total Invoice: ${totalStr}
- Jumlah Dibayar: ${paidStr}
- Sisa Tagihan: ${dueStr}
- Status Pembayaran: ${payStatus}
- Metode: ${ctx.paymentMethod || 'Transfer Bank'}
- Catatan Pembayaran: ${pNotes}`;
      } else {
        return `Internal summary — not for client.
Payment Summary: '${ctx.projectTitle}' (Client: ${ctx.clientName})
- Invoice Number: ${ctx.invoiceNumber}
- Invoice Total: ${totalStr}
- Amount Paid: ${paidStr}
- Amount Due: ${dueStr}
- Payment Status: ${ctx.paymentStatus}
- Method: ${ctx.paymentMethod || 'Bank Transfer'}
- Payment Notes: ${pNotes}`;
      }
    }
  },

  // --- PORTFOLIO & REVIEW ---
  portfolioCaseStudy: {
    name: "Portfolio Case Study",
    description: "Draft a high-impact case study outline for your portfolio.",
    category: "portfolio_review",
    outputMode: "ai_prompt",
    requiredContext: ["projectTitle", "category"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const roleName = targetLang === 'id' ? t('templates.' + ctx.templateRole, ctx.templateRole) : ctx.templateRole;

      if (targetLang === 'id') {
        return `Hasilkan garis besar studi kasus portofolio bernilai tinggi berdasarkan proyek yang diselesaikan ini.

Nama Proyek: ${ctx.projectTitle}
Kategori: ${ctx.category}
Peran: ${roleName || 'Freelancer'}
Output Akhir: ${ctx.finalFileLink}

Format kerangka yang diperlukan:
1. Judul Pikat (Result-oriented outcome statement)
2. Konteks Proyek & Tantangan Client
3. Solusi & Proses Kami (Langkah-langkah yang diambil sebagai seorang ${roleName || 'freelancer'})
4. Tampilan Hasil Pekerjaan (Sebutkan file akhir: ${ctx.finalFileLink})
5. Hasil yang Terukur & Dampak Kreatif
6. Teks Unggahan (Caption) Media Sosial (dengan tagar)`;
      } else {
        return `Generate a high-value portfolio case study outline based on this completed project.

Project Name: ${ctx.projectTitle}
Category: ${ctx.category}
Role: ${ctx.templateRole || 'Freelancer'}
Final Output: ${ctx.finalFileLink}

Outline format required:
1. Hook Title (Result-oriented outcome statement)
2. Project Context & Client Challenge
3. Our Solution & Process (Steps taken as a ${ctx.templateRole || 'freelancer'})
4. Deliverables Showcase (Mention final files: ${ctx.finalFileLink})
5. Measurable Outcomes & Creative Impact
6. Social Media Showcase Caption (with hashtags)`;
      }
    }
  },

  projectCompletion: {
    name: "Project Completion Summary",
    description: "Generate an internal review of deliverables, payment status, and next follow-up.",
    category: "portfolio_review",
    outputMode: "internal_summary",
    requiredContext: ["projectTitle", "paymentStatus", "finalFileLink"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const delStatus = targetLang === 'id' ? t('status.delivery.' + ctx.deliveryStatus, ctx.deliveryStatus) : ctx.deliveryStatus;
      const invStatus = targetLang === 'id' ? t('status.invoice.' + ctx.invoiceStatus, ctx.invoiceStatus) : ctx.invoiceStatus;
      const payStatus = targetLang === 'id' ? t('status.payment.' + ctx.paymentStatus, ctx.paymentStatus) : ctx.paymentStatus;
      const yesNo = targetLang === 'id' ? (project.clientConfirmedDelivery ? 'Ya' : 'Tidak') : (project.clientConfirmedDelivery ? 'Yes' : 'No');

      if (targetLang === 'id') {
        return `Ringkasan internal — bukan untuk client.
Tinjauan Penyelesaian Proyek: '${ctx.projectTitle}'
- Nama Client: ${ctx.clientName}
- Status Pengiriman: ${delStatus} (Dikonfirmasi: ${yesNo})
- Status Invoice: ${invStatus} (Status Pembayaran: ${payStatus})
- Output Akhir: ${ctx.finalFileLink}
- File Mentah: ${ctx.sourceFileLink}
- Rekomendasi:
  * Hubungi untuk meminta testimoni umpan balik.
  * Perbarui portofolio sandbox dengan detail studi kasus.
  * Rencanakan penawaran retainer tindak lanjut dalam 30 hari.`;
      } else {
        return `Internal summary — not for client.
Project Completion Review: '${ctx.projectTitle}'
- Client Name: ${ctx.clientName}
- Delivery Status: ${ctx.deliveryStatus} (Confirmed: ${project.clientConfirmedDelivery ? 'Yes' : 'No'})
- Invoice Status: ${ctx.invoiceStatus} (Payment Status: ${ctx.paymentStatus})
- Final Output: ${ctx.finalFileLink}
- Source Files: ${ctx.sourceFileLink}
- Recommendations:
  * Reach out for feedback testimonial.
  * Update portfolio sandbox with case study details.
  * Plan follow-up retainer pitches in 30 days.`;
      }
    }
  },

  // --- PLANNING ---
  nextActionRecommendation: {
    name: "Next Action Recommendation",
    description: "Generate internal prompt to decide next action based on stage, deadline, and memory.",
    category: "planning",
    outputMode: "internal_summary",
    requiredContext: ["projectTitle", "stage", "deadline"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const stageName = targetLang === 'id' ? t('kanban.stages.' + ctx.stage, ctx.stage) : ctx.stage;
      const invStatus = targetLang === 'id' ? t('status.invoice.' + ctx.invoiceStatus, ctx.invoiceStatus) : ctx.invoiceStatus;
      const payStatus = targetLang === 'id' ? t('status.payment.' + ctx.paymentStatus, ctx.paymentStatus) : ctx.paymentStatus;
      const prefChannel = ctx.clientMemory?.preferredChannel || (targetLang === 'id' ? 'saluran pilihan' : 'preferred channel');

      if (targetLang === 'id') {
        let recAction = "";
        if (project.stage === 'in_progress') {
          recAction = "1. Fokus pada penyelesaian tugas milestone sebelum tenggat waktu.";
        } else if (project.stage === 'client_review') {
          recAction = "1. Kirim pesan pembaruan yang sopan untuk mendorong client memberikan persetujuan.";
        } else if (project.stage === 'waiting_payment') {
          recAction = "1. Tindak lanjuti Invoice #" + ctx.invoiceNumber + " yang jatuh tempo pada " + ctx.invoiceDueDate + ".";
        } else if (project.stage === 'completed') {
          recAction = "1. Minta testimoni dan arsipkan file kode sumber mentah.";
        } else {
          recAction = "1. Tinjau langkah berikutnya: " + ctx.nextAction;
        }

        return `Ringkasan internal — bukan untuk client.
Langkah Strategis Berikutnya untuk '${ctx.projectTitle}':
- Tahap Proyek Saat Ini: ${stageName}
- Langkah Berikutnya yang Dinyatakan: ${ctx.nextAction}
- Target Tenggat Waktu: ${ctx.deadline}
- Status Invoice: ${invStatus} (Pembayaran: ${payStatus})

Tindakan yang Direkomendasikan:
${recAction}
2. Tetap terhubung melalui ${prefChannel}.`;
      } else {
        return `Internal summary — not for client.
Strategic Next Steps for '${ctx.projectTitle}':
- Current Project Stage: ${ctx.stage}
- Next Action Stated: ${ctx.nextAction}
- Target Deadline: ${ctx.deadline}
- Invoice Status: ${ctx.invoiceStatus} (Payment: ${ctx.paymentStatus})

Recommended Action:
${ctx.stage === 'in_progress' ? '1. Focus on completing milestone tasks before deadline.' : ''}
${ctx.stage === 'client_review' ? '1. Send a polite update message to nudge the client for approval.' : ''}
${ctx.stage === 'waiting_payment' ? '1. Follow up on Invoice #' + ctx.invoiceNumber + ' due on ' + ctx.invoiceDueDate + '.' : ''}
${ctx.stage === 'completed' ? '1. Request a testimonial and archive raw source files.' : ''}
2. Keep in touch via ${ctx.clientMemory?.preferredChannel || 'preferred channel'}.`;
      }
    }
  },

  weeklyFocusSummary: {
    name: "Weekly Focus Summary",
    description: "Generate internal summary from due soon, overdue, and pending review projects.",
    category: "planning",
    outputMode: "internal_summary",
    requiredContext: ["projectTitle"],
    generate: (project, clientMemory, tone = 'Professional', freelancerProfile = null, targetLang = 'en') => {
      if (project && project.isWorkspace) {
        const dlList = project.deadlinesThisWeek || [];
        const invList = project.invoicesToSend || [];
        const payList = project.paymentTasks || [];
        const stList = project.stuckProjects || [];

        if (targetLang === 'id') {
          const dlText = dlList.map(p => `- ${p.title} (Tenggat: ${p.dueDate || 'N/A'})`).join('\n') || 'Tidak ada';
          const invText = invList.map(p => `- ${p.title}`).join('\n') || 'Tidak ada';
          const payText = payList.map(t => `- ${t.projectName} (${t.label === 'Payment overdue' ? 'Terlambat' : 'Segera jatuh tempo'}: ${t.dateText})`).join('\n') || 'Tidak ada';
          const stText = stList.map(p => `- ${p.title}`).join('\n') || 'Tidak ada';

          return `Ringkasan internal — bukan untuk client.
Ikhtisar Fokus Mingguan:
- Deadline Minggu Ini:
${dlText}

- Invoice yang Perlu Dikirim:
${invText}

- Follow-up Pembayaran:
${payText}

- Project Tertahan:
${stText}

Rekomendasi Fokus Berikutnya:
1. Prioritaskan tenggat waktu yang terlambat.
2. Kirim invoice yang tertunda.
3. Tindak lanjuti pembayaran yang belum diselesaikan.`;
        } else {
          const dlText = dlList.map(p => `- ${p.title} (Due: ${p.dueDate || 'N/A'})`).join('\n') || 'None';
          const invText = invList.map(p => `- ${p.title}`).join('\n') || 'None';
          const payText = payList.map(t => `- ${t.projectName} (${t.label}: ${t.dateText})`).join('\n') || 'None';
          const stText = stList.map(p => `- ${p.title}`).join('\n') || 'None';

          return `Internal summary — not for client.
Weekly Focus Overview:
- Deadlines This Week:
${dlText}

- Invoices to Send:
${invText}

- Payment Follow-ups:
${payText}

- Stuck Projects:
${stText}

Next Recommended Focus:
1. Prioritize overdue deadlines.
2. Send pending invoices.
3. Follow up on outstanding payments.`;
        }
      }

      const ctx = buildPromptContext(project, { clientMemory }, freelancerProfile, { mode: 'internal' });
      const priorityName = targetLang === 'id' ? t('priority.' + ctx.priority.toLowerCase(), ctx.priority) : ctx.priority;
      const stageName = targetLang === 'id' ? t('kanban.stages.' + ctx.stage, ctx.stage) : ctx.stage;
      const payStatus = targetLang === 'id' ? t('status.payment.' + ctx.paymentStatus, ctx.paymentStatus) : ctx.paymentStatus;
      const visibleNotes = ctx.clientVisibleNotes || (targetLang === 'id' ? 'Tidak ada' : 'None');

      if (targetLang === 'id') {
        return `Ringkasan internal — bukan untuk client.
Audit Fokus Mingguan untuk Proyek '${ctx.projectTitle}':
- Prioritas Urgensi: ${priorityName}
- Tahap: ${stageName}
- Tenggat Waktu: ${ctx.deadline}
- Status Pembayaran: ${payStatus}
- Catatan terlihat oleh client: ${visibleNotes}

Tujuan minggu ini: Selesaikan tugas milestone, periksa jumlah revisi (saat ini: ${ctx.revisionCount}/${ctx.maxRevision}), dan pastikan pembaruan pengiriman tepat waktu.

Ringkasan level workspace belum tersedia di tampilan ini.`;
      } else {
        return `Internal summary — not for client.
Weekly Focus Audit for Project '${ctx.projectTitle}':
- Urgency Priority: ${ctx.priority}
- Stage: ${ctx.stage}
- Deadline: ${ctx.deadline}
- Payment Status: ${ctx.paymentStatus}
- Client visible notes: ${ctx.clientVisibleNotes || 'None'}

Goal for the week: Settle milestone tasks, check revision counts (currently: ${ctx.revisionCount}/${ctx.maxRevision}), and ensure prompt delivery updates.

Workspace-level summary is not available in this view.`;
      }
    }
  }
};

// Map additional property keys for strict compliance with prompt type structure
Object.entries(promptTemplates).forEach(([id, t]) => {
  t.id = id;
  t.label = t.name;
  t.generator = t.generate;
});

/**
 * Copies prompt content to clipboard and triggers a toast notification,
 * while saving the item to alurkarya_prompt_history.
 * @param {string} text - The generated prompt text
 * @param {function} toastCallback - The app global toast trigger
 * @param {string} promptType - Type key of the prompt
 * @param {string} projectId - Current project ID
 */
export function copyPromptToClipboard(text, toastCallback, promptType = 'unknown', projectId = 'unknown') {
  navigator.clipboard.writeText(text)
    .then(() => {
      // Save to alurkarya_prompt_history
      try {
        const historyStr = localStorage.getItem('alurkarya_prompt_history') || '[]';
        const history = JSON.parse(historyStr);
        history.unshift({
          promptType,
          projectId,
          generatedAt: new Date().toISOString(),
          copiedTextPreview: text.substring(0, 60) + (text.length > 60 ? '...' : '')
        });
        if (history.length > 20) {
          history.splice(20);
        }
        localStorage.setItem('alurkarya_prompt_history', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to write prompt history", e);
      }

      if (toastCallback) {
        const template = promptTemplates[promptType];
        let toastKey = 'promptCopied';
        if (template) {
          if (template.outputMode === 'client_message') {
            toastKey = 'messageCopied';
          } else if (template.outputMode === 'internal_summary') {
            toastKey = 'summaryCopied';
          }
        }
        toastCallback(t(`toast.${toastKey}`), "text-success");
      }
    })
    .catch(err => {
      console.error("Clipboard copy failed", err);
      if (toastCallback) {
        toastCallback(t('toast.copyFailed', "Failed to copy text to clipboard."), "text-danger");
      }
    });
}
