# AlurKarya Pre-Launch QA Report

Date: 2026-06-26
Build tested: 0.1.0 (production bundle)

## Summary

* Overall status: READY FOR PRE-LAUNCH TESTING
* P0 issues: 0 (2 found and fixed)
* P1 issues: 0 (1 found and fixed)
* P2 issues: 0
* Recommended launch decision: READY. The app is fully stabilized, multi-currency display is consistent, and no blockers remain.

## Test Areas

1. **App Load & Access Gate**: Pass. Access gate loads correctly, supports localhost dev fallback, and fails closed in production when password hashes are missing.
2. **Navigation & Sidebar**: Pass. Left sidebar navigation is responsive.
3. **Language System**: Pass. The Bahasa Indonesia translation mapping is consistent and uses correct digital freelancer-friendly terminology.
4. **Freelancer Profile**: Pass. Profile settings save to store and persist correctly.
5. **Workspace Board**: Pass. Move triggers, sort options, and stage labels are correct.
6. **Project Modal**: Pass. Modals open, save, and close correctly without overwriting other projects.
7. **Client Hub / Client Directory**: Pass. Links clients and displays list.
8. **Client Memory**: Pass. Client-visible and private memory fields are separated.
9. **Delivery Center**: Pass. Saves preview/final links and checklist state.
10. **Invoice-to-Paid**: Pass. Calculate outstanding balance correctly.
11. **Multi-Currency**: Pass. Checked multi-currency grouping on board column totals and invoice ledger widgets.
12. **Client Portal Privacy**: Pass. Private client memory remains strictly hidden from the Client Portal.
13. **AI Prompt Helper**: Pass. All 22 prompt templates work correctly, output tone and language switch properly, and private data is shielded.
14. **Planner Hub**: Pass. Events save and load correctly.
15. **Weekly Focus**: Pass. Aggregates data and copy button works.
16. **Quotations**: Pass. Renders list and totals.
17. **Invoice Ledger**: Pass. invoice list renders with respective currency formatting.
18. **Portfolio Sandbox**: Pass. Loads and saves portfolio details.
19. **Import / Export / Backup**: Pass. Data backups/restores correctly.
20. **Mobile Responsiveness**: Pass. Layout is readable and usable.
21. **Build & Console Errors**: Pass. `node build.js` succeeds.

---

## Issues Found

### [P0] Mixed Currency Totals Falsely Combined in Invoice Ledger

* **Area**: Invoice Ledger (`InvoicesView.js`)
* **Steps to reproduce**:
  1. Create an invoice with USD currency.
  2. Create another invoice with IDR currency.
  3. Go to the Invoice Ledger page.
* **Expected**: Total paid/pending earnings should be grouped by currency (e.g. `Rp10.000.000 + $250.00`) instead of being summed together raw.
* **Actual**: Sums amount fields directly using `.reduce((s, i) => s + i.amount, 0)` across different currencies, resulting in a single combined number formatted with the default currency.
* **Risk**: High. Renders incorrect financial statistics to the user.
* **Fix status**: Fixed. Implemented a grouping helper `groupInvoiceVal` which maps totals by currency (e.g., `Rp10.000.000 + $250.00`).
* **Files affected**: `js/components/InvoicesView.js`

---

### [P0] Mixed Currency Totals Falsely Combined in Client Hub Projects Total

* **Area**: Client Hub (`ClientsView.js`)
* **Steps to reproduce**:
  1. Add a client.
  2. Create one project with USD currency.
  3. Create another project with IDR currency under the same client.
  4. Go to Client Hub and look at the client's total project value column.
* **Expected**: Budget sums should be grouped and separated by currency (e.g., `Rp10.000.000 + $250.00`).
* **Actual**: Sums budget values directly using `.reduce((sum, p) => sum + p.budget, 0)` and formats the raw total with the default currency.
* **Risk**: High. Incorrect total contract value is displayed.
* **Fix status**: Fixed. Refactored budget summing to group by currency (`clientBudgetGroups`), formatted as a combined string.
* **Files affected**: `js/components/ClientsView.js`

---

### [P1] Default Currency Preference Settings Ignored in General formatCurrency Calls

* **Area**: General Utilities (`js/utils.js`)
* **Steps to reproduce**:
  1. Go to Freelancer Profile and select USD as the Default Currency.
  2. View project cards on the board or invoice lists.
* **Expected**: All calls to `formatCurrency` that don't specify a currency should fall back to the default currency set by the user (`localStorage.getItem('alurkarya_default_currency')`).
* **Actual**: Defaults to hardcoded `'IDR'` in the function parameter `formatCurrency(value, currency = 'IDR')`, ignoring user preferences.
* **Risk**: Medium. Currency symbols do not match the user's selected preference.
* **Fix status**: Fixed. Updated `formatCurrency` to load the default preferred currency setting from `localStorage`.
* **Files affected**: `js/utils.js`

---

## Final Verification

* P0 fixed: Yes
* P1 fixed: Yes
* Build succeeds: Yes
* Console errors: No
* Client Portal privacy passed: Yes
* Data persistence passed: Yes
* Ready for pre-launch testing: Yes
