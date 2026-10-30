# Vance Practice Assistant — Clinic Management Platform

A medical-grade, calm, and responsive clinic management assistant tailored for a solo practitioner (**Dr. Elena Vance**, Senior Consultant Physician) and her clinic team.

The application serves four primary personas: **Patients**, **Attending Doctors**, **Reception Staff**, and the **Clinic Owner/Practice Manager**, enforcing a single canonical appointment lifecycle and real-time state synchronization.

---

## 🌟 Product Principles & Personas

Every screen is designed around answering one fundamental question:

* **Patient:** *"How do I book, check my appointment status, or know my turn?"*
* **Doctor:** *"Who is next, what is my workload, and how is my clinic performing?"*
* **Reception:** *"Who is waiting, who is done, and what needs action?"*
* **Clinic Owner:** *"How many patients came and how much income was generated?"*

---

## 🏥 Portals & Features

### 1. Public Doctor Website (`/`)
* Professional physician profile, specialties, qualifications (MD, FACP), and MCI registration details.
* Clinic hours (Morning & Evening sessions) and clinic address in Indiranagar, Bengaluru.
* Direct call-to-action to book appointments or check live queue status.
* Embedded role switcher for exploring internal portals.

### 2. Patient Portal (`/patient`)
* **Live Turn Tracker:** Displays token number, real-time wait estimation (e.g., *"1 patient ahead of you"* or *"In consultation"*), and clinic status.
* **Mobile-First Booking Flow (`/patient/book`):** Simple 3-step slot reservation with chief complaint capture and validation.
* **Self-Service Actions:** Cancel or reschedule appointments directly with instant feedback.
* **Patient Profile (`/patient/profile`):** Emergency contact, known drug allergies, blood group, and past consultation history.

### 3. Doctor Portal (`/doctor`)
* Strict operational hierarchy (prioritizing critical actions above analytics):
  1. **Clinical Workload:** Live counts of waiting, in consultation, completed, and upcoming patients.
  2. **Current Waiting Queue:** Live ordered tokens with arrival timestamps.
  3. **Next Patient Hero Card:** One-click *"Call Patient & Start Consultation"* with chief complaints and vitals.
  4. **Daytime Schedule:** Overview of booked slots for the day.
  5. **Operational Alerts:** Delays and uncollected payments.
  6. **Practice Performance & Income:** Today's collections, pending checkout balances, and completion rates.
* **Consultation Room (`/doctor/queue`):** Dedicated focused workspace for diagnosing, adding clinical notes/prescriptions, and completing visits.
* **Practice Insights (`/doctor/insights`):** End-of-day financial reconciliation and monthly analytics tracking patient retention and revenue.

### 4. Reception Desk (`/reception`)
* **Live Waiting Lounge Roster:** Real-time visibility into all waiting patients and token positions.
* **Add Walk-In Patient:** Instant modal to issue the next token number (`A-0x`) and enqueue walk-in arrivals immediately.
* **1-Click Check-In:** Transition confirmed bookings into the waiting lounge upon arrival.
* **Billing Toggles:** Track and update consultation payments (₹800 standard fee: *Paid* / *Pending*).
* **Master Registry (`/reception/appointments`):** Searchable, filterable multi-date appointment ledger with CSV report export.

---

## 🔄 Canonical Appointment Status Model

The application enforces 7 canonical statuses across all portals with synchronized, role-tailored terminology:

| Underlying Canonical Status | Patient Sees | Doctor Sees | Reception Sees | UI Styling |
|---|---|---|---|---|
| `booked` | Confirmed | Booked | Booked | Blue outline (`sky`) |
| `checked_in` | Checked in | Checked in | Checked in | Teal accent (`teal`) |
| `waiting` | You are waiting | Waiting | Waiting | Amber pulse (`amber`) |
| `in_consultation` | In consultation | In consultation | In consultation | Purple active (`purple`) |
| `completed` | Visit completed | Completed | Completed | Emerald soft (`emerald`) |
| `cancelled` | Cancelled | Cancelled | Cancelled | Slate muted (`slate`) |
| `no_show` | Missed appointment | No-show | No-show | Rose warning (`rose`) |

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router, React 19)
* **Language:** TypeScript (Strict mode)
* **Styling:** Tailwind CSS (Custom medical teal color tokens)
* **Icons:** Lucide React
* **State Management:** Reactive browser-persisted store with cross-tab/cross-portal event dispatching
* **Validation:** Zod

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18.18+ or 20+
* npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/clinic-mgmt.git
   cd clinic-mgmt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Testing

Check TypeScript types:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

---

## ☁️ Deploying to Vercel

This project is optimized for zero-configuration deployment on [Vercel](https://vercel.com):

1. Push your repository to **GitHub** / **GitLab** / **Bitbucket**.
2. Go to the [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"**.
3. Import your repository.
4. Framework preset will automatically detect **Next.js**.
5. No build command override or environment variables are required for the prototype to function out of the box.
6. Click **Deploy**.

---

## ♿ Accessibility & Design Standards

* **Color Contrast:** WCAG 2.1 AA compliant text contrast across all badges, cards, and interactive controls.
* **Touch Targets:** All buttons, date pickers, and token actions maintain at least a 44px min-height touch area.
* **Focus States:** High-visibility teal keyboard focus indicators (`focus-visible:ring-2 focus-visible:ring-clinic-500`).
* **Responsive Layouts:** Tested across mobile (320px–390px), tablets (768px), and desktop/laptops (1024px–1440px).
* **Reset Feature:** A **"Reset Mock Data"** button in the header allows evaluators to reset the clinic schedule, tokens, and billing metrics back to default demo state at any time.

---

## 📄 License

MIT License. Designed and built as a clean, medical-grade practice assistant.
