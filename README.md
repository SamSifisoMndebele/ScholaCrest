<p align="center">
  <img src="public/scholacrest-horizontal.svg" alt="ScholaCrest Logo" width="460" />
</p>

<h1 align="center">ScholaCrest</h1>
<p align="center">
  <strong>Multi-Tenant School Management System (SaaS)</strong><br />
  <em>Engineered for Institutional Prestige, Rock-Bottom Operating Cost, and Zero-Trust Security</em>
</p>

<p align="center">
  <a href="https://scholacrest.com"><img src="https://img.shields.io/badge/Domain-scholacrest.com-blue?style=flat-square" alt="Domain" /></a>
  <img src="https://img.shields.io/badge/Security-Firebase%20App%20Check%20(reCAPTCHA%20Enterprise)-emerald?style=flat-square" alt="App Check" />
  <img src="https://img.shields.io/badge/Storage-Cloudflare%20R2%20($0%20Egress)-purple?style=flat-square" alt="R2 Storage" />
  <img src="https://img.shields.io/badge/Database-Cloudflare%20D1%20(5M%20Reads/day)-blue?style=flat-square" alt="D1 SQL" />
  <img src="https://img.shields.io/badge/License-Proprietary-slate?style=flat-square" alt="License" />
</p>

---

## 🌟 Executive Overview

**ScholaCrest** is a multi-tenant cloud School Management System designed to administer multiple academic institutions under a single master Super Admin console. 

It handles the entire school operational lifecycle:
1. **Multi-Tenancy:** Super Admin registers, activates, and monitors individual school tenants.
2. **Automated Admissions:** Prospective learners apply online; applications undergo instant automated rules evaluation before registrar verification.
3. **Official Letterhead Engine:** Generates official institutional letters (with school crest, EMIS code, digital stamp, and principal signature) on dynamic vector letterheads at **$0.00 storage cost**.
4. **Subject-Scoped Teacher Portal:** Teachers are strictly isolated to their assigned subjects, allowing them to upload homework and enter assessment marks.
5. **Academic Term Report Cards:** Aggregates marks, attendance, and principal remarks into a single downloadable, printable official report card.
6. **Zero-Waste / Rock-Bottom Cost Engineering:** Strategically pairs **Firebase** (Auth, RTDB, App Check) with **Cloudflare** (D1 SQL, R2 $0-egress storage) to maintain zero or near-zero operating costs.

---

## 🛡️ Granular Privileges Matrix

Access permissions are enforced through **Firebase Auth Custom Claims (`role`, `schoolId`, `subjects`)** and cryptographic tokens:

| Capability / Action | Super Admin (SaaS Owner) | Principal / School Admin | Registrar / Admissions | Teacher | Learner / Student |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manage Multiple Schools** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Configure Letterhead, Crest & Seal** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Set Cut-Off Marks & Age Rules** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Review & Validate Applications** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Issue Official Acceptance Letters** | ❌ | ✅ | ✅ | ❌ | ✅ *(Download own)* |
| **Post Homework & Learning Tasks** | ❌ | ❌ | ❌ | ✅ *(Assigned only)* | ❌ |
| **Record Assessment Marks** | ❌ | ❌ | ❌ | ✅ *(Assigned only)* | ❌ |
| **Access Enrolled Class Materials** | ❌ | ❌ | ❌ | ❌ | ✅ *(Enrolled only)* |
| **View & Print Official Term Report** | ❌ | ✅ | ❌ | ❌ | ✅ *(Own only)* |

---

## 🏗️ Strategic Tiered Dual-Cloud Architecture

Instead of relying on a single expensive service, **ScholaCrest** strategically routes every data asset to the service where it is cheapest and fastest:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SCHOLACREST CLIENT APPLICATION                      │
│             (React 19 + TypeScript + Tailwind CSS + Lucide)           │
└────────┬───────────────────────────┬──────────────────────────┬────────┘
         │ (App Check Token)         │ (Direct SDK)             │ (Presigned S3 URLs)
         ▼                           ▼                          ▼
┌──────────────────┐       ┌────────────────────┐     ┌───────────────────┐
│ FIREBASE CORE    │       │ FIREBASE SERVICES  │     │ CLOUDFLARE EDGE   │
│ • Auth & Claims  │       │ • RTDB: Live       │     │ • Worker API (WAF)│
│ • App Check with │       │   Presence & Badges│     │ • D1: 5M SQL      │
│   reCAPTCHA Ent. │       │ • Storage: Small   │     │   Reads/Day Free  │
│ • Firestore:     │       │   Avatars & Crests │     │ • R2: $0 Egress   │
│   IndexedDB Cache│       └────────────────────┘     │   File Storage    │
└──────────────────┘                                  └───────────────────┘
```

### Why this design eliminates runaway bills:

| Asset / Operation | Storage / DB Destination | Financial & Architectural Benefit |
| :--- | :--- | :--- |
| **Scanned Birth Certs, IDs, Prior Reports** | **Cloudflare R2** | **$0.00 Egress Fees Forever.** Eliminates Firebase Storage bandwidth charges ($0.12/GB after 1GB/day). |
| **Homework Files & Submissions** | **Cloudflare R2** | Handles thousands of daily student downloads without bandwidth spikes. |
| **Profile Avatars & School Stamps** | **Firebase Storage** | Small files (<200KB), cached on CDN, direct client SDK security rule validation. |
| **Gradebooks, Marks & Student Rosters** | **Cloudflare D1** | **5,000,000 free reads/day** (100x more than Firestore's 50k limit). Relational SQLite schema prevents orphan records. |
| **Online Presence & Notification Badges** | **Firebase RTDB** | Persistent WebSockets with zero per-read/write billing fees. |
| **School Config & Admissions Criteria** | **Cloud Firestore** | Aggressively cached in browser IndexedDB via `persistentLocalCache`. Repeat visits cost 0 billable reads. |
| **Official Letters & Term Reports** | **Client-Side HTML5 / Vector Print** | Generated dynamically in the browser. Storing 100,000 generated PDF files costs **$0.00**. |

---

## 🔒 Security & Anti-Abuse (Firebase App Check)

1. **reCAPTCHA Enterprise Integration:**
   * Incoming requests carry the `X-Firebase-AppCheck` token.
   * Requests from postman, curl, scrapers, and botnets lacking a valid attestation token are rejected with **HTTP 403 Forbidden** at the edge before consuming database reads.
2. **Tenant Isolation:**
   * Every SQL query automatically injects `WHERE school_id = ?` based on the cryptographically signed JWT token. School A can never read or tamper with School B.
3. **Teacher Subject Isolation:**
   * When teachers insert marks or upload homework, the backend verifies `subject_id IN (claims.subjects)`.
4. **Student Privacy:**
   * Students can only query marks and reports matching their verified `student_id = claims.uid`.

---

## 📂 Repository File Structure

```
schola-crest/
├── public/
│   ├── scholacrest-logo.png         # Official brand crest emblem
│   └── favicon.svg                  # Vector browser icon
├── src/
│   ├── backend/
│   │   └── edgeWorker.ts            # Cloudflare Worker API (App Check + D1 SQL + R2 presigned URLs)
│   ├── components/
│   │   ├── OfficialLetterhead.tsx   # Zero-storage dynamic school letterhead generator
│   │   ├── OfficialReportCard.tsx   # Official academic term report card generator
│   │   ├── SuperAdminView.tsx       # Global multi-tenant institution onboarding
│   │   ├── SchoolAdminView.tsx      # Principal branding, stamp & cutoff rules console
│   │   ├── RegistrarView.tsx        # Admissions evaluation queue & letter issuance
│   │   ├── TeacherView.tsx          # Subject-scoped homework posting & marks entry
│   │   ├── StudentView.tsx          # Student dashboard & report card viewer
│   │   └── ApplicantView.tsx        # Public online application portal with WebP compressor
│   ├── services/
│   │   ├── appCheckService.ts       # Firebase App Check attestation service
│   │   ├── dbRouter.ts              # Multi-database router & demonstration seed data
│   │   ├── letterheadService.ts     # Dynamic official letter generation logic
│   │   └── storageRouter.ts         # Strategic storage router with in-browser WebP compression
│   ├── types/
│   │   └── index.ts                 # TypeScript types for all models and roles
│   ├── App.tsx                      # Root component with live role simulator & tenant switcher
│   ├── index.css                    # Clean global styles & print optimization
│   └── main.tsx                     # React 19 entry point
├── database.rules.json              # Firebase Realtime Database rules
├── firestore.rules                  # Production Firestore Security Rules with App Check
├── storage.rules                    # Firebase Storage rules with size & MIME limits
├── schema.sql                       # Cloudflare D1 Relational SQL schema
├── SCHOOL_MANAGEMENT_SYSTEM_PLAN.md # Comprehensive architectural specification
├── index.html                       # HTML5 template with Tailwind CSS & typography
├── package.json                     # Dependencies (React 19, Firebase, Lucide, Tailwind)
└── vite.config.ts                   # Vite 8 bundler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v20+ (tested on v24)
* **npm** v10+

### 2. Installation
```bash
# Clone or navigate to the repository
cd schola-crest

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"

# Firebase App Check (reCAPTCHA Enterprise)
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY="your-recaptcha-enterprise-site-key"

# Cloudflare Edge Worker API URL
VITE_CLOUDFLARE_WORKER_URL="https://api.scholacrest.com"
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

Use the **Role View** switcher in the top navigation bar to test each role's interface:
* **Super Admin**: Oversee all schools, activate/suspend tenants.
* **Principal**: Customize school crest, motto, digital stamp, signature, and cutoff rules.
* **Registrar**: Review pre-evaluated applicant dossiers and issue official admission letters.
* **Teacher**: Post homework and enter marks for assigned subjects.
* **Learner**: Access homework, view grades, and download official term report cards.
* **Apply Online**: Test public applicant submission with automated pre-screening and instant acknowledgement letters.

### 5. Production Build Verification
```bash
npm run build
```

---

## 📜 Cloud Deployments

### Deploying Database Rules & Schema:
1. **Firestore Rules:** Paste `firestore.rules` into Firebase Console $\rightarrow$ Firestore $\rightarrow$ Rules.
2. **Storage Rules:** Paste `storage.rules` into Firebase Console $\rightarrow$ Storage $\rightarrow$ Rules.
3. **RTDB Rules:** Paste `database.rules.json` into Firebase Console $\rightarrow$ Realtime Database $\rightarrow$ Rules.
4. **Cloudflare D1 Schema:** In Cloudflare Dashboard $\rightarrow$ Workers & Pages $\rightarrow$ D1 SQL Database $\rightarrow$ Console tab, execute `schema.sql`.

---

## 🎨 ScholaCrest Official Vector SVG Suite

The official heraldic crest is converted into 100% resolution-independent, razor-sharp vector SVG. Multiple variants are provided in the `/public` folder and as a typed React component:

| Variant | File | Optimal Usage | Description |
| :--- | :--- | :--- | :--- |
| **Icon Only** | `public/scholacrest-icon.svg` | Favicons, Avatars, 16px–64px icons | Tightly cropped shield vector emblem (no borders, no text). |
| **Icon Badge** | `public/scholacrest-badge.svg` | App Store Icons, Web Manifest | Shield emblem framed on a rounded squircle badge container. |
| **Horizontal Lockup** | `public/scholacrest-horizontal.svg` | SaaS Navigation Bar, Documents | Shield emblem on left + bold `SCHOLACREST` and subtitle on right. |
| **Vertical / Stacked** | `public/scholacrest-vertical.svg` | Splash Screens, Official Seal, Covers | Centered shield emblem stacked above `SCHOLACREST` and subtitle. |

### React Component Usage:
```tsx
import { ScholaCrestLogo } from './components/ScholaCrestLogo';

// 1. Text on Right (Default for modern SaaS headers)
<ScholaCrestLogo variant="text-right" size={42} />

// 2. Pure Shield Emblem (Icon only)
<ScholaCrestLogo variant="icon-only" size={32} />

// 3. Squircle App Badge
<ScholaCrestLogo variant="icon-badge" size={48} />

// 4. Centered Vertical Stack
<ScholaCrestLogo variant="vertical" size={64} />
```

---

## 📄 License & Trademark
Copyright © 2026 **ScholaCrest** (`scholacrest.com`). All rights reserved.
