import { buildClientDashboardData } from '../../../Downloads/freelancer-project-os/js/utils/clientSafeData.js';
import { promptTemplates } from '../../../Downloads/freelancer-project-os/js/components/AIPromptHelpers.js';

// Setup Mock Data with obvious private keys
const mockProject = {
  id: "proj_123",
  title: "Approved Website Development Project",
  category: "Web Development",
  stage: "client_review",
  dueDate: "2026-07-15",
  nextAction: "Review design drafts and approve staging site",
  approvalStatus: "Pending Review",
  revisionCount: 1,
  maxRevision: 3,
  updatedAt: "2026-06-27",
  budget: 5000000,
  projectCurrency: "IDR",
  
  // Fake private fields on project
  internalNotes: "PRIVATE_INTERNAL_NOTES_DO_NOT_SHOW",
  paymentNotes: "PRIVATE_PAYMENT_NOTES_DO_NOT_SHOW"
};

const mockClient = {
  id: "client_999",
  name: "Wayne Enterprises",
  businessName: "Wayne Corp",
  email: "bruce@waynecorp.com",
  phone: "+628123456789",
  status: "Active",
  
  // Fake private fields on client/clientMemory
  clientRiskNotes: "PRIVATE_RISK_TEST_DO_NOT_SHOW",
  paymentBehavior: "PRIVATE_PAYMENT_BEHAVIOR_DO_NOT_SHOW",
  paymentReminderStyle: "PRIVATE_REMINDER_STYLE_DO_NOT_SHOW",
  relationshipStatus: "PRIVATE_RELATIONSHIP_DO_NOT_SHOW",
  clientMemory: {
    clientRiskNotes: "PRIVATE_RISK_TEST_DO_NOT_SHOW",
    paymentBehavior: "PRIVATE_PAYMENT_BEHAVIOR_DO_NOT_SHOW",
    paymentReminderStyle: "PRIVATE_REMINDER_STYLE_DO_NOT_SHOW",
    relationshipStatus: "PRIVATE_RELATIONSHIP_DO_NOT_SHOW",
    importantNotes: "PRIVATE_INTERNAL_NOTES_DO_NOT_SHOW"
  }
};

const mockFreelancerProfile = {
  freelancerName: "Lucius Fox",
  freelancerRole: "Tech Consultant",
  freelancerEmail: "lucius@waynecorp.com",
  freelancerPortfolioLink: "https://waynecorp.com/lucius"
};

// Forbidden strings list
const forbiddenStrings = [
  "PRIVATE_RISK_TEST_DO_NOT_SHOW",
  "PRIVATE_PAYMENT_BEHAVIOR_DO_NOT_SHOW",
  "PRIVATE_REMINDER_STYLE_DO_NOT_SHOW",
  "PRIVATE_RELATIONSHIP_DO_NOT_SHOW",
  "PRIVATE_INTERNAL_NOTES_DO_NOT_SHOW",
  "PRIVATE_PAYMENT_NOTES_DO_NOT_SHOW"
];

// Helper to check object recursively
function scanObject(obj) {
  const leaks = [];
  
  function scan(val, path) {
    if (typeof val === 'string') {
      forbiddenStrings.forEach(fStr => {
        if (val.includes(fStr)) {
          leaks.push({ path, value: val, forbidden: fStr });
        }
      });
    } else if (val && typeof val === 'object') {
      for (const key in val) {
        scan(val[key], path ? `${path}.${key}` : key);
      }
    }
  }
  
  scan(obj, "");
  return leaks;
}

console.log("==========================================");
console.log("RUNNING AUTOMATED PRIVACY LEAK QA TEST...");
console.log("==========================================");

// 1. Test buildClientDashboardData (English)
const safeDataEn = buildClientDashboardData(mockProject, mockClient, mockFreelancerProfile, { language: 'en' });
const leaksEn = scanObject(safeDataEn);

// 2. Test buildClientDashboardData (Indonesian)
const safeDataId = buildClientDashboardData(mockProject, mockClient, mockFreelancerProfile, { language: 'id' });
const leaksId = scanObject(safeDataId);

// 3. Test promptTemplates.clientUpdate.generate (English)
const msgEn = promptTemplates.clientUpdate.generate(mockProject, mockClient.clientMemory, 'Professional', mockFreelancerProfile, 'en');
const msgLeaksEn = [];
forbiddenStrings.forEach(fStr => {
  if (msgEn.includes(fStr)) {
    msgLeaksEn.push(fStr);
  }
});

// 4. Test promptTemplates.clientUpdate.generate (Indonesian)
const msgId = promptTemplates.clientUpdate.generate(mockProject, mockClient.clientMemory, 'Professional', mockFreelancerProfile, 'id');
const msgLeaksId = [];
forbiddenStrings.forEach(fStr => {
  if (msgId.includes(fStr)) {
    msgLeaksId.push(fStr);
  }
});

let failed = false;

if (leaksEn.length > 0) {
  console.error("❌ LEAK FOUND in safeDataEn:", leaksEn);
  failed = true;
} else {
  console.log("✅ safeDataEn is 100% clean of private info.");
}

if (leaksId.length > 0) {
  console.error("❌ LEAK FOUND in safeDataId:", leaksId);
  failed = true;
} else {
  console.log("✅ safeDataId is 100% clean of private info.");
}

if (msgLeaksEn.length > 0) {
  console.error("❌ LEAK FOUND in msgEn:", msgLeaksEn);
  failed = true;
} else {
  console.log("✅ Generated English update message is 100% clean.");
}

if (msgLeaksId.length > 0) {
  console.error("❌ LEAK FOUND in msgId:", msgLeaksId);
  failed = true;
} else {
  console.log("✅ Generated Indonesian update message is 100% clean.");
}

if (failed) {
  console.error("❌ PRIVACY TEST FAILED!");
  process.exit(1);
} else {
  console.log("🎉 ALL PRIVACY QA CHECKS PASSED!");
  process.exit(0);
}
