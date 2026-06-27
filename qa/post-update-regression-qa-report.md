# AlurKarya Post-Update Regression QA Report

**Date**: June 27, 2026  
**Build Tested**: Production Bundle (Compiled via `build.js`)  
**Live URL**: https://alurkarya.onrender.com/  
**Tester**: AI Coding Assistant (Antigravity)  

## Summary

* **Overall Status**: Passed (100% clean)
* **P0 Issues**: 0
* **P1 Issues**: 0
* **P2 Issues**: 0
* **Recommended Decision**: Go for controlled pre-launch testing.

---

## Test Areas

### 1. Live App Load
* **Status**: Passed
* **Details**: App loads cleanly at the target domain. Initial assets, scripts, and fonts load with zero broken paths or fallback blocks.

### 2. Role Selection Screen
* **Status**: Passed
* **Details**: Aligned with the approved SaaS design reference layout. Rendered as a full-viewport dark background (`#0b0f17`) with a centered large white inverse logo (`assets/brand/alurkarya-logo-secondary-white.svg`) and two centered pill-shaped buttons. Unwanted dropdown selectors, card containers, helper text, and loading dots are completely removed.

### 3. Access Gate
* **Status**: Passed
* **Details**: Access Gate triggers securely for Freelancer flow when access is not yet granted. Development fallback remains active for localhost, while production gate defaults closed if hashes are missing. Access Gate does not block access to standalone client-briefing snapshot links.

### 4. Freelancer Workspace Routing
* **Status**: Passed
* **Details**: Routes correctly. Once the Access Gate is successfully passed, the user enters the full freelancer workspace (board, client hub, planner, settings, etc.) without issues.

### 5. Client Entry / Client Briefing Empty State
* **Status**: Passed
* **Details**: When a user selects **As Client** from the home page, the app directs them to a client-safe view. Bypasses freelancer workspace/sidebar and renders a clean briefing empty state:
  * *English*: *"Paste or open the briefing link sent by your freelancer."*
  * *Bahasa Indonesia*: *"Buka link briefing yang dikirim oleh freelancer untuk melihat update project."*
  This ensures that internal projects stored in the local browser database are not exposed.

### 6. Client Dashboard
* **Status**: Passed
* **Details**: Loads correct project, client details, and whitelisted metrics in preview mode.

### 7. Big Picture Overview
* **Status**: Passed
* **Details**: Priority mapping logic updates overall project status badges correctly across all stages. What's Done/What's Next checklists, milestones, and blockages display clearly without using scary internal jargon.

### 8. Shareable Client Briefing Link
* **Status**: Passed
* **Details**: Generates a stateless UTF-8 safe Base64 URL hash snapshot:
  `https://alurkarya.onrender.com/client-briefing.html#snapshot=<encodedPayload>`
  Stateless loading verified in incognito windows and separate browsers without localStorage queries. Target URL uses the production domain strictly when hosted on Render. Direct navigation to `client-briefing.html` without payload displays a clean localized empty state instead of crashing.

### 9. Copy Briefing Message
* **Status**: Passed
* **Details**: Greeting templates formatted cleanly in English & Indonesian, omitting any private database properties.

### 10. Privacy / Data Leak
* **Status**: Passed
* **Details**: Passed automated privacy scan checks. Custom test private fields (such as `clientRiskNotes`, `paymentBehavior`, `relationshipStatus`, `internalNotes`, `projectNotes`) are completely hidden from all client-facing screens, payloads, and copy templates.

### 11. Client-safe Data Builder
* **Status**: Passed
* **Details**: Whitelist-based compiler works as expected, selecting only client-safe keys and formatting values.

### 12. Language EN/ID
* **Status**: Passed
* **Details**: Bilingual translations are preserved in snapshot links and work correctly for role selector buttons and empty states. No machine-translation anomalies observed.

### 13. Currency
* **Status**: Passed
* **Details**: Formats currency correctly using `formatMoney` across IDR, USD, SGD, AUD, and EUR. No NaNs or raw numbers without currency tags display. Mixed currencies are not combined.

### 14. Delivery Center
* **Status**: Passed
* **Details**: Links open safely in new tabs with `target="_blank"` and `rel="noopener noreferrer"`. Sanitized rendering prevents any raw HTML/script injection from snapshot parameters.

### 15. Invoice-to-Paid
* **Status**: Passed
* **Details**: Invoice details, balances, status, and due dates sync and update cleanly.

### 16. AI Prompt Helper
* **Status**: Passed
* **Details**: All prompt categories load, copy logic is functional, and client-safe mode works.

### 17. Client Memory
* **Status**: Passed
* **Details**: Successfully saves private memories and client-visible notes separately without leak risks.

### 18. Workspace Board
* **Status**: Passed
* **Details**: Horizontal scrollbar is visible and fully functional on both desktop and mobile viewports with a polished track/shell layout, allowing easy navigation to later Kanban columns. Next action tags, project cards editing, drag-and-drop, and Simple/Detailed toggles remain fully functional.

### 19. Project Modal
* **Status**: Passed
* **Details**: Standard workspace operations (open, edit, save, close, add project) are fully operational.

### 20. Client Hub
* **Status**: Passed
* **Details**: Client list loading and linking to projects operate normally.

### 21. Import / Export
* **Status**: Passed
* **Details**: Backup files export and restore without data corruption.

### 22. Mobile Responsiveness
* **Status**: Passed
* **Details**: Viewport scales correctly for 390px-430px mobile widths. Kanban columns, client briefings, and invoice cards wrap and stack without horizontal layout overflow.

### 23. Build & Console Errors
* **Status**: Passed
* **Details**: Bundle compiles successfully with zero warnings, and the browser console prints no fatal errors.

---

## Issues Found

* **No issues found**. All P0/P1 issues identified in previous QA reviews have been successfully hotfixed and verified.

---

## Final Verification

* **P0 fixed**: Yes (None remaining)
* **P1 fixed**: Yes (None remaining)
* **Build succeeds**: Yes
* **Live deployment works**: Yes (Verified at https://alurkarya.onrender.com/)
* **Privacy passed**: Yes (0 leaks detected)
* **Mobile passed**: Yes
* **Ready for controlled pre-launch testing**: Yes

**Final Recommendation**: **READY FOR CONTROLLED PRE-LAUNCH TESTING**
