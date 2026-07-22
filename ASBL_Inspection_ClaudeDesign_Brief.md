# Claude Design brief — ASBL Handover Inspection App

> Paste this into a Claude Design session to kick off the prototype. It's self-contained; the full PRD backs it up if you need detail.

---

## What to design
A **mobile-first web app** for ASBL's handover *inspection* step. A third-party inspector, an in-house FM executive, or the customer uses it to walk a flat room-by-room, marking each checklist item **Verify / Raise Issue / Skip**, capturing issues with a photo + location, and generating an ASBL-format PDF at the end. Design for a phone held on-site in a bare concrete flat (one-handed, big tap targets, camera-first, tolerant of bad signal).

## Brand & visual style
- **Primary:** ASBL red-orange `#EA4E20` (buttons, active states, the flat "house" motif on the cover).
- **Headings:** near-black navy `#141B2D`, bold, slightly condensed geometric sans.
- **Labels / breadcrumbs:** muted slate-blue `#6B7A99` (e.g. "Flooring → Hollowness").
- **"RAISED" status pill:** orange text `#D9600A` on soft peach `#FDEBD9`, fully rounded.
- **Surfaces:** white cards, 16px radius, soft shadow, generous padding; light grey app background `#F5F6F8`.
- **Action colors:** Verify = green `#1FA971`, Raise Issue = amber/orange `#EA7A1E`, Skip = neutral grey `#8A94A6`.
- Rounded, friendly, clean — matches the ASBL "Handover Inspection Report" look. No clutter.

## Screens to produce (mobile frames)
1. **Entry / Login** — customer-number field + OTP; ASBL + SPECTRA lockup. Include a QR-scan entry variant and a "flat not ready → visit demo flat" state.
2. **Safety step** (customer QR path) — short helmet/vest acknowledgement before check-in.
3. **Unit confirmation card** — customer name, unit no (e.g. B-3805), project/product, config (3BHK), sqft; buttons **Start Inspection / Resume**.
4. **Sub-location hub** — overall progress bar + total issues; list of rooms (Living, Dining, Kitchen, MBR, MBR-Toilet, Utility, Balcony…) each with a room icon, "X/Y checked", and an issue-count chip. CTA **Continue** (next unfinished room) + **Review & Generate**.
5. **Room checklist** — sticky room header w/ mini-progress; items grouped by Category → Sub-category (collapsible); each row has a 3-way control **✓ Verify / ⚠ Raise Issue / → Skip** in the action colors above.
6. **Raise Issue bottom sheet** — camera-first (big capture button + photo thumbnails); auto-filled category/sub-category + checklist text + sub-location; editable heading + **Exact Location** free text; buttons **Save** and **Save & add another issue**.
7. **Review & summary** — sub-location → issue-count table; metadata form (inspector name/contact, inspection date, expected resolution date, sqft, FM/handover executive); scrollable editable issue list; **participant sign-off** (customer + inspector/FM signatures); CTA **Generate Report**.
8. **PDF preview & share** — rendered ASBL-format report preview (cover → summary → issue cards with photo + RAISED pill + breadcrumb + exact location); **Download / Share link / Done**. Include a clean **zero-issue** variant.

## Key interaction notes
- One checklist item can hold **multiple issues** ("Save & add another").
- Every raised issue **requires a photo + location** before it can be saved.
- Rooms are generated from the unit config — design the list to handle 2BHK vs 3BHK and varying room labels.
- Show an **offline banner** ("saved locally, will sync") state; never imply data loss.
- Empty/edge states to include: wrong/no unit, flat not ready, OTP failure, no photo attached, un-actioned items on submit, all-verified (zero issues).

## The output PDF (screen 8 should mirror this)
Cover (ASBL + product, "HANDOVER INSPECTION REPORT", customer/unit/email) → Summary (total issues, expected resolution day, inspected-by engineer, date, sqft, handover executive, and a Sub-Location → No. of Issues table) → Issues grouped by sub-location, each a card with **Category → Sub-category** breadcrumb, photo + **RAISED** pill, "Checklist" text, "Exact Location" text → Signatures.

## Tone
Professional but approachable — a construction-site tool that a customer could also use without training. Prioritize speed and clarity over decoration.
