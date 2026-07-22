# ASBL Handover Inspection — MVP Implementation Plan

**Scope:** Build the Phase-03 inspection app from the PRD as a self-contained MVP.
**Stack:** Django REST Framework (backend) · React (frontend) · SQLite (local file) · deploy on Render.
**Reference:** `ASBL Handover Inspection.html` is the UI-complete prototype. We port its screens and data shapes 1:1 and swap its in-memory seed for real API calls. Nothing about the screens changes — only the data source (PRD §17).

## MVP guardrails (from the brief)

| Constraint | Decision |
|---|---|
| **No 3rd-party calls** | OTP is **mocked** (fixed dev code, no SMS). Photos stored as **local files on disk**, not S3. PDF generated **in-process** (WeasyPrint), no external render service. No CRM/Progress write-back. |
| **Backend** | Django + Django REST Framework. |
| **Frontend** | React (Vite). |
| **DB** | SQLite local file (`db.sqlite3`). |
| **Seed data** | Ship a fixture of a few flats + owner details + room layouts across 2–3 configs. Auth resolves a customer number → exactly one flat. |
| **Deploy** | Single Render **Web Service**: Django (gunicorn) serves both the REST API and the built React SPA. One service, one deploy. |

**Why one service, not two:** the MVP has no CDN/scale need. Django serving the React `dist/` as static files means one Render service, one URL, no CORS config, one deploy. Split later if it ever matters.

---

## Architecture at a glance

```
                    Render Web Service (gunicorn)
   ┌───────────────────────────────────────────────────────┐
   │  Django + DRF                                          │
   │   /api/...            → JSON API                       │
   │   /media/...          → uploaded inspection photos     │
   │   /  (everything else)→ React SPA (index.html + assets)│
   │                                                        │
   │   db.sqlite3   (flats, checklist, inspections, issues) │
   │   media/       (photo files)                           │
   └───────────────────────────────────────────────────────┘
```

Repo layout:

```
asbl-handover/
├── backend/
│   ├── config/            # Django project (settings, urls, wsgi)
│   ├── inspection/        # single app: models, serializers, views, fixtures
│   │   ├── fixtures/      # seed flats, owners, rooms, master checklist
│   │   └── report/        # PDF template + generator
│   ├── manage.py
│   └── requirements.txt
├── frontend/              # Vite + React (ported from the prototype)
│   ├── src/
│   └── package.json
├── build.sh               # Render build: frontend build → collectstatic → migrate → seed
├── render.yaml            # Render service definition
└── IMPLEMENTATION_PLAN.md
```

---

# Phase 0 — Base setup

Goal: an empty-but-running skeleton (backend serves a "hello" API, frontend builds, both wired) before any feature code.

1. **Repo + tooling**
   - `git init`; add `.gitignore` (`db.sqlite3`, `media/`, `node_modules/`, `__pycache__/`, `frontend/dist/`, `.venv/`).
   - Python 3.12 venv in `backend/`. Node 20 for `frontend/`.

2. **Backend skeleton**
   - `pip install django djangorestframework django-cors-headers gunicorn whitenoise weasyprint`
   - `django-admin startproject config backend/` → `python manage.py startapp inspection`
   - `requirements.txt` pinned. `settings.py`: add `rest_framework`, `inspection`, `whitenoise` middleware; `DEBUG` from env; `ALLOWED_HOSTS` from env; SQLite default.
   - One health endpoint `GET /api/health` returning `{"ok": true}`.

3. **Frontend skeleton**
   - `npm create vite@latest frontend -- --template react`
   - Add a dev proxy so `/api` and `/media` hit Django in dev (`vite.config.js` `server.proxy`).
   - Confirm `npm run build` emits `frontend/dist/`.

4. **Wire Django to serve the SPA**
   - WhiteNoise serves `frontend/dist/assets/`.
   - A catch-all Django view returns `frontend/dist/index.html` for any non-`/api`, non-`/media` path (SPA routing).

5. **Render skeleton** (`render.yaml` + `build.sh`) — commit early, deploy the empty skeleton once to prove the pipeline. See Phase 3.

**Exit criteria:** `/api/health` returns JSON locally and on Render; the React default page loads from the same origin.

---

# Phase 1 — Backend

Build the data model, seed it, expose the API the prototype needs, and generate the PDF.

## 1.1 Data model

Mirrors PRD §9 and the prototype's `responses[room][item] = {response, skipReason, issues[]}` shape 1:1.

```python
# inspection/models.py  (sketch)

class Flat(models.Model):
    customer_number = models.CharField(max_length=15, unique=True)   # login key → one flat
    customer_name   = models.CharField(max_length=120)
    email           = models.EmailField(blank=True)
    project         = models.CharField(max_length=120)   # "ASBL Spectra"
    product         = models.CharField(max_length=60)    # "SPECTRA" → cover branding
    tower           = models.CharField(max_length=10)
    unit_no         = models.CharField(max_length=30)    # "B-3805"
    config          = models.CharField(max_length=20)    # "3BHK"
    sqft            = models.IntegerField()
    status          = models.CharField(max_length=20, default="handover_ready")
    #  handover_ready | not_ready | issues | clear   (transition written on submit)

class Room(models.Model):          # sub-location, generated per flat from config
    flat  = models.ForeignKey(Flat, related_name="rooms", on_delete=models.CASCADE)
    key   = models.CharField(max_length=40)     # "mbr"
    label = models.CharField(max_length=60)     # "Master Bedroom"
    type  = models.CharField(max_length=20)     # entrance|living|dining|kitchen|utility|bedroom|toilet|balcony
    order = models.IntegerField(default=0)

class ChecklistItem(models.Model):  # master checklist, versioned, admin-editable later
    item_id   = models.CharField(max_length=40, unique=True)  # "flooring.hollow"
    category  = models.CharField(max_length=60)
    subcategory = models.CharField(max_length=60)
    text      = models.TextField()
    applies_to = models.JSONField(default=list)   # ["ALL"] | ["WET","KITCHEN"]
    active    = models.BooleanField(default=True)
    version   = models.IntegerField(default=1)

class Inspection(models.Model):
    flat   = models.ForeignKey(Flat, on_delete=models.CASCADE)
    mode   = models.CharField(max_length=20, default="inspector")  # inspector|customer|fm
    status = models.CharField(max_length=20, default="in_progress") # in_progress|submitted
    inspector_name    = models.CharField(max_length=120, blank=True)
    inspector_contact = models.CharField(max_length=20, blank=True)
    company           = models.CharField(max_length=120, blank=True)
    fm_name           = models.CharField(max_length=120, blank=True)
    fm_contact        = models.CharField(max_length=20, blank=True)
    inspection_date   = models.DateField(null=True)
    expected_resolution_date = models.DateField(null=True)
    customer_signed   = models.BooleanField(default=False)
    inspector_signed  = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ItemResponse(models.Model):
    inspection = models.ForeignKey(Inspection, related_name="responses", on_delete=models.CASCADE)
    room_key   = models.CharField(max_length=40)
    item_id    = models.CharField(max_length=40)
    response   = models.CharField(max_length=10, null=True)  # VERIFIED|ISSUE|SKIPPED|null
    skip_reason = models.CharField(max_length=120, blank=True)
    class Meta:
        unique_together = ("inspection", "room_key", "item_id")

class Issue(models.Model):
    item_response  = models.ForeignKey(ItemResponse, related_name="issues", on_delete=models.CASCADE)
    heading        = models.CharField(max_length=160)
    exact_location = models.TextField()

class Photo(models.Model):
    issue = models.ForeignKey(Issue, related_name="photos", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="issues/")   # local disk, served at /media/
```

Applicability filtering (which items show in a room) matches the prototype's `tagsFor`/`itemsFor`:

```
tagsFor(type) = ["ALL"] + { entrance:["ENTRANCE","DRY"], living:["DRY"], dining:["DRY"],
    bedroom:["DRY"], toilet:["WET"], kitchen:["KITCHEN"], utility:["UTILITY"], balcony:["BALCONY"] }[type]
itemsFor(room) = MASTER where item.applies_to ∩ tagsFor(room.type) ≠ ∅
```
Keep this filter **on the frontend** (as in the prototype) — the API ships the full master list + the flat's rooms and the client filters. One less thing to keep in sync.

## 1.2 Seed data (fixtures)

Ship JSON fixtures loaded via `manage.py loaddata` (called in `build.sh`):

- **`checklist.json`** — the 22 master items from the prototype (`doors.stopper` … `balcony.ceiling`), with their `applies_to` tags. This is the authoritative list; extend toward the full §5 taxonomy as needed.
- **`flats.json`** — a few flats with owner details across configs:
  - `B-3805` — Ratna Kumar Mandava, ASBL Spectra / SPECTRA, 3BHK, 2210 sqft, `handover_ready` (the prototype's canonical unit).
  - One 2BHK flat, `handover_ready`.
  - One flat `not_ready` (to exercise the demo-flat gate).
- **`rooms.json`** — per-flat room layout. 3BHK gets the prototype's 12 rooms (entrance, living, dining, kitchen, utility, mbr + mbr_toilet, gbr + gbr_toilet, kbr, common_toilet, balcony). 2BHK gets a smaller set. `order` drives walk-through sequence.

Customer numbers are the login keys — document them in the fixture for testing (e.g. `8247883838` → B-3805).

## 1.3 API endpoints

MVP-simplified from PRD §17.2 (no S3, no real OTP). All under `/api/`.

| # | Endpoint | Purpose | MVP notes |
|---|---|---|---|
| 1 | `POST /api/auth/otp` `{customer_number}` | "Send" OTP | **Mock:** returns `{sent: true}`; the code is always `0000` (also returned in the response in DEBUG for convenience). No SMS. |
| 2 | `POST /api/auth/verify` `{customer_number, otp}` | Verify → session token | Checks `otp == "0000"`, resolves the **one** flat, returns a token (DRF token or a signed opaque string) scoped to that flat. Wrong number → 404 "unit not found". |
| 3 | `GET /api/unit` (auth) | Unit config + rooms + status | Returns flat fields + ordered rooms + `status`. Drives confirmation card, room generation, cover branding, and the not-ready gate. |
| 4 | `GET /api/checklist` | Master checklist + tags | Full active list; client filters per room. |
| 5 | `GET /api/inspection` (auth) | Existing draft (resume) or `null` (fresh) | Returns the flat's `in_progress` inspection with nested responses/issues, or `null` → client starts blank. |
| 6 | `POST /api/inspection` (auth) | Create/replace the draft | Idempotent per flat: one active draft. Accepts the full `responses` map + `meta`. |
| 7 | `PATCH /api/inspection/:id` (auth) | Persist draft continuously | Every response/issue change. Survives refresh. |
| 8 | `POST /api/media/upload` (auth) | Upload a photo | **Local disk** via `ImageField`; returns `{id, url}` under `/media/`. Replaces presigned S3. |
| 9 | `POST /api/inspection/:id/submit` (auth) | Finalize → set status, generate PDF | Idempotent. Writes flat `status = issues|clear`, marks inspection `submitted`, returns `{report_url}`. |
| 10 | `GET /api/inspection/:id/report.pdf` | ASBL A-905 PDF | Streams the generated PDF (deterministic layout, §8 / §1.4). |

**Auth for MVP:** DRF `TokenAuthentication` is enough. The verify step mints a token tied to the flat; the token's user (or an attached claim) scopes `/api/unit` and `/api/inspection` to that one flat. No user self-signup — flats/owners are seeded.

**Persistence contract:** the request/response body for the inspection uses the exact prototype shape — `responses[room_key][item_id] = {response, skip_reason, issues: [{heading, exact_location, photos: [url]}]}` plus a `meta` object (inspector/fm/date/resolution/sqft/signatures). Serializers flatten to/from the relational tables. This keeps the frontend port mechanical.

## 1.4 PDF generation (A-905 format)

**Approach: WeasyPrint renders an HTML+CSS template → PDF.** Reason: the prototype already defines the exact A-905 visual system (colors `#EA4E20`, RAISED pill `#D9600A`/`#FDEBD9`, breadcrumbs `#6B7A99`, card styling). We reuse that CSS in a Django template instead of hand-drawing a PDF with ReportLab primitives. Deterministic, matches the design, no external service.

- Template `inspection/report/report.html` renders: **Cover** (ASBL + product lockup, "HANDOVER INSPECTION REPORT", customer/unit/email) → **Summary** (total issues, expected resolution day, inspected-by + contact, date, sqft, handover executive, Sub-Location → No. of Issues table incl. zero-issue rooms) → **Issues** grouped by sub-location (breadcrumb, photo + RAISED pill, checklist text, exact location) → **Signatures** (customer / FM / inspector). Handle the **zero-issue** variant (clean report).
- `report/generate.py`: build the context from an `Inspection`, render template, `HTML(string=...).write_pdf()`.
- Photos embedded from local `media/` paths.

> **Render note:** WeasyPrint needs system libs (`pango`, `cairo`, `gdk-pixbuf`). Render's native Python env includes them; if not, add an `apt` step in `build.sh` or use a Docker deploy. Fallback if this fights us: render the same HTML client-side and use the browser's print-to-PDF — but server-side is the target so the PDF is reproducible from data alone.

**Exit criteria (Phase 1):** with the DB seeded, every endpoint returns correct JSON via `curl`/DRF browsable API; `POST .../submit` on a seeded inspection produces a downloadable PDF that visually matches the prototype's PDF preview screen.

---

# Phase 2 — Frontend

Port the prototype to React and wire it to the Phase-1 API. **Screens and interactions are already designed — do not redesign.** The prototype is one `Component` class; we restructure into React components but keep the same screen state machine.

## 2.1 Screen state machine (from the prototype)

```
login ──(verify)──> safety ──> confirm ──> hub ──┬──> room ──(issue sheet)──┐
   │                                             │        ▲                 │
   └──(not ready)──> notready ──(demo)──> safety  └────────┴─── review ──> pdf ──> flats (submitted)
```

Screens to build (all exist in the prototype — copy markup/styles):
1. **login** — customer-number + OTP (mock; any seeded number, code `0000`). "Flat not showing as ready? See options" link.
2. **notready** — flat-not-ready state + "Visit demo flat".
3. **safety** — helmet / vest / awareness acknowledgement; hard gate before `confirm`. Re-taken on every visit start (PRD §7.1).
4. **confirm** — unit confirmation card (name, unit no, project/product, config, sqft) → Start / Resume.
5. **hub** — overall progress bar + total issues; room list with icon, "X/Y checked", issue-count chip; Continue (next unfinished) + Review & Generate.
6. **room** — sticky header + mini-progress; items grouped Category → Sub-category (collapsible); 3-way control **✓ Verify / ⚠ Raise Issue / → Skip** in action colors.
7. **issue sheet** (bottom sheet) — camera-first capture, thumbnails, auto-filled category/sub-category/checklist/sub-location, editable heading + exact location. **Photo + location required** before save. Save / Save & add another.
8. **review** — Sub-location → issue-count table; metadata form; editable issue list; skipped-items list; participant sign-off (signatures); Generate Report.
9. **pdf** — rendered A-905 preview → Download / Share / Done.
10. **flats** — post-submit single-flat confirmation with status lozenge (`Issues raised · N` / `No issues`), summary, View report / Done.

## 2.2 What to replace vs. keep (PRD §17.1)

| Prototype (in-memory) | Replace with |
|---|---|
| `this.MASTER` (22 items) | `GET /api/checklist` |
| `this.rooms` + `this.unit` seed | `GET /api/unit` (rooms + config + status) |
| `this.seed()` / `freshSeed()` responses | `GET /api/inspection` → draft or `null` (blank) |
| `flatStatuses` client map | flat `status` from `GET /api/unit`; written by submit |
| placeholder colored photo tiles | real camera/gallery `<input type="file" capture>` → `POST /api/media/upload` |
| `finishReport` local state flip | `POST /api/inspection/:id/submit` → `report_url` |

Keep as-is: `tagsFor`/`itemsFor` filtering, `roomStat` progress math, the issue-draft validation, all styling and layout.

## 2.3 Data flow

- On login/verify → store token (localStorage) → `GET /unit` + `/checklist` + `/inspection` in parallel → decide blank vs resume.
- **Continuous persistence:** debounce a `PATCH /inspection/:id` on every response/issue change (the prototype mutates `state.responses`; hook the same mutations to a debounced save). This satisfies "survive refresh."
- **Offline tolerance (MVP-minimal):** the prototype's offline banner is cosmetic. MVP wiring: detect `navigator.onLine`, queue failed PATCHes in `localStorage`, flush on reconnect, show the banner. Full IndexedDB offline is a v1.1 nice-to-have (PRD §17.3) — **not** in this MVP.

**Native-first choices (avoid deps):** `<input type="file" accept="image/*" capture="environment">` for camera — no camera lib. Client-side compress via `<canvas>` before upload (a few lines) — no image lib. Signatures: a small `<canvas>` pointer-draw — no signature lib.

**Exit criteria (Phase 2):** full flow works against the local Django server — log in with a seeded number, walk rooms, raise issues with real photos, review, submit, see the confirmation screen and download the generated PDF.

---

# Phase 3 — Deploy on Render

Single Web Service. SQLite lives on a Render **persistent disk** (otherwise it resets on every deploy).

**`build.sh`** (Render build command):
```bash
set -o errexit
# 1. frontend
cd frontend && npm ci && npm run build && cd ..
# 2. backend
cd backend
pip install -r requirements.txt
python manage.py collectstatic --no-input     # WhiteNoise picks up React dist + Django static
python manage.py migrate
python manage.py loaddata inspection/fixtures/checklist.json \
                          inspection/fixtures/flats.json \
                          inspection/fixtures/rooms.json
```
> Make seed loading idempotent (fixtures use fixed PKs, or guard with a "already seeded" check) so re-deploys don't duplicate rows.

**`render.yaml`**:
```yaml
services:
  - type: web
    name: asbl-handover
    runtime: python
    buildCommand: ./build.sh
    startCommand: cd backend && gunicorn config.wsgi:application
    disk:
      name: data
      mountPath: /var/data          # db.sqlite3 + media/ live here
      sizeGB: 1
    envVars:
      - key: DEBUG
        value: "false"
      - key: SECRET_KEY
        generateValue: true
      - key: ALLOWED_HOSTS
        value: ".onrender.com"
      - key: DATABASE_PATH
        value: /var/data/db.sqlite3
      - key: MEDIA_ROOT
        value: /var/data/media
```

Settings read `DATABASE_PATH` and `MEDIA_ROOT` from env so DB + photos persist on the mounted disk. WhiteNoise serves the React build; Django serves `/media/` (or WhiteNoise with a media route) — fine at MVP scale.

**Exit criteria (Phase 3):** the Render URL serves the SPA; a full inspection round-trips end-to-end (login → submit → PDF) with data and photos persisting across a redeploy.

---

## Build order summary

1. **Phase 0** — skeleton: Django health endpoint + React build + Render pipeline proven.
2. **Phase 1** — models → fixtures → API → PDF (verify with browsable API + curl + one generated PDF).
3. **Phase 2** — port prototype screens to React, swap seed for API, wire photos/persistence/submit.
4. **Phase 3** — Render deploy with persistent disk for SQLite + media.

## Explicitly out of MVP scope (per brief / PRD non-goals)

Real SMS OTP · S3/presigned uploads · CRM/Progress API write-back · admin UI for vendor registry & checklist editor · severity + tile-grid picker · full IndexedDB offline sync · ASBL review/approval gate · re-inspection/delta reports. The data model above already accommodates all of these later without a schema rewrite.
