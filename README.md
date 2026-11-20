# Neha & Chinmay – Royal Maharashtrian Engagement Invitation

A luxury digital engagement invitation website designed and built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **Supabase**.

Featuring artistic 3D miniature Maharashtrian bride and groom figurines, mandatory guest identification, anonymous browser visit tracking, Asian/Kolkata countdown, complete bilingual (English / Marathi) support, and a private Bride & Groom analytics dashboard.

---

## 👑 Features & Architecture

1. **Opening Envelope Experience**: Full-screen royal maroon envelope with gold wax seal, floating petals, and smooth interactive opening animation.
2. **Mandatory Guest Identification**: Guests enter their **First Name** and **Surname** with validation (supports Devanagari & Latin letters, rejects whitespace, 2–50 char limits).
3. **Browser UUID & Inactivity Tracking**:
   - Each browser receives a unique local UUID.
   - Returning visits are recognized automatically without re-prompting.
   - 30-minute inactivity window logic to count genuine new visits (refreshes inside an active session do not inflate counts).
   - "Change Guest" feature allows multiple family members to use the same browser.
4. **Main Hero Section**: Centerpiece miniature couple figurine viewed from behind in traditional Maharashtrian emerald Nauvari, flower-adorned bun (ambada with gajra), mundavalya, cream kurta, and royal maroon pheta.
5. **Traditional Invitation Card**: Elegant ivory card with antique gold borders, shlokas, and formal bilingual invitation.
6. **Our Story**: Artistic 3-stage milestone journey with miniature imagery.
7. **Live Countdown**: Animated golden cards counting down to 18 December 2026 in `Asia/Kolkata` (IST) with a clear disclaimer that ceremony time will be announced.
8. **Event Details**: Configurable event cards with date, time, and venue placeholders.
9. **Miniature Celebration Gallery**: 8-item responsive gallery featuring traditional mandap, gold rings, brass diyas, torans, jewellery, and celebration stage with interactive lightbox.
10. **Guest Blessings**: Optional guest message form with rate limiting, character validation, and admin moderation.
11. **Footer & Sharing**: WhatsApp share with pre-filled message, copy link, and dynamic QR Code pointing to the deployed URL.
12. **Music System**: Floating toggle with audio wave animation, HTML5 MP3 support, and a built-in graceful Web Audio API ambient chime harmonic fallback.
13. **Complete English / मराठी Language Switcher**: Persistent language toggle affecting all headings, shlokas, buttons, and validation.
14. **Private Bride & Groom Analytics Portal (`/admin`)**:
    - Restricted to Neha and Chinmay via Supabase Auth.
    - Statistics: Total Visits, Unique Guests, Repeat Visitors, Today's Visits.
    - Interactive 14-day daily visit line chart and monthly bar chart (Recharts).
    - Visitor table with search by guest name, date sorting, and CSV export.
    - Blessings moderation panel.

---

## 🛠️ Project Structure

```
engagement-invitation/
│
├── public/
│   ├── images/
│   │   ├── couple-miniature-hero.svg
│   │   ├── wax-seal.svg
│   │   ├── mandap-miniature.svg
│   │   ├── rings-miniature.svg
│   │   ├── diyas-miniature.svg
│   │   ├── toran-miniature.svg
│   │   ├── jewellery-miniature.svg
│   │   ├── paithani-motif.svg
│   │   └── stage-miniature.svg
│   ├── music/
│   │   └── README.md
│   └── favicon.svg
│
├── src/
│   ├── components/
│   │   ├── OpeningEnvelope.jsx
│   │   ├── GuestWelcome.jsx
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Invitation.jsx
│   │   ├── OurStory.jsx
│   │   ├── Countdown.jsx
│   │   ├── EventDetails.jsx
│   │   ├── MiniatureGallery.jsx
│   │   ├── Blessings.jsx
│   │   ├── MusicPlayer.jsx
│   │   └── Footer.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Visitors.jsx
│   │   └── Settings.jsx
│   │
│   ├── hooks/
│   │   ├── useVisitorTracking.js
│   │   └── useLanguage.jsx
│   │
│   ├── lib/
│   │   └── supabase.js
│   │
│   ├── data/
│   │   ├── invitationConfig.js
│   │   └── translations.js
│   │
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
│
├── supabase/
│   ├── functions/
│   │   └── track-visitor/
│   │       └── index.ts
│   └── migrations/
│       └── 20261103000000_create_engagement_tables.sql
│
├── .env.example
├── vercel.json
├── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
cd D:\EngagementInvitation
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Supabase Project URL and Public Anon Key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_ADMIN_EMAILS=neha@patil.com,chinmay@kulkarni.com
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Setup Guide

### 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com/) and click **New Project**.
2. Name the project `neha-chinmay-engagement`.
3. Choose a nearby region (e.g., `ap-south-1` Mumbai) and create a strong database password.

### 2. Retrieve API Keys
1. In the Supabase Dashboard, go to **Project Settings** > **API**.
2. Copy the **Project URL** and paste it into `VITE_SUPABASE_URL` in `.env`.
3. Copy the **Project API Key (`anon` `public`)** and paste it into `VITE_SUPABASE_ANON_KEY` in `.env`.

### 3. Deploy Database Migrations
1. In Supabase Dashboard, open **SQL Editor**.
2. Click **New Query**, paste the contents of `supabase/migrations/20261103000000_create_engagement_tables.sql`, and click **Run**.
3. This creates:
   - `visitors` table with unique `browser_id`
   - `visitor_sessions` table with session timeout tracking
   - `blessings` table with moderation statuses
   - `admin_profiles` table for authorized accounts
   - Row Level Security (RLS) policies protecting visitor privacy
   - `record_guest_visit` atomic stored procedure

### 4. Create Authorized Accounts for Neha & Chinmay
1. In Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Create Neha's account (e.g. `neha@patil.com` + password).
4. Create Chinmay's account (e.g. `chinmay@kulkarni.com` + password).
5. In SQL Editor, add both to `admin_profiles`:
```sql
INSERT INTO public.admin_profiles (auth_user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email IN ('neha@patil.com', 'chinmay@kulkarni.com');
```

### 5. Deploy Edge Function (Optional)
If you use the Supabase CLI:
```bash
supabase functions deploy track-visitor
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub or GitLab.
2. In [vercel.com](https://vercel.com/), click **Add New** > **Project** and import the repository.
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAILS`
5. Click **Deploy**.
6. The `vercel.json` file automatically handles SPA rewrites for `/admin`.

---

## 🎵 Background Music

Place any licensed romantic instrumental MP3 at `public/music/romantic_instrumental.mp3`.
If absent, the website gracefully falls back to the embedded Web Audio API ambient chime harmonic synthesizer without throwing errors.
