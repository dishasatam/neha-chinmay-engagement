# 💍 Neha & Chinmay — Royal Maharashtrian Engagement Invitation
### साखरपुडा निमंत्रण पत्रिका | शनिवार, १९ डिसेंबर २०२६

A luxury digital engagement invitation website designed and built with **React 19**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **Supabase Real-Time Cloud Database**.

Featuring a royal Peshwai aesthetic in deep velvet maroon and antique gold, artistic Maharashtrian couple figurines, interactive wax seal envelope reveal, real-time cross-device guest tracking, bilingual (English & मराठी) switch, and a private **Bride & Groom Admin Analytics Portal**.

---

## 🌸 Ceremony Details

| Detail | Information (English) | माहिती (मराठी) |
| :--- | :--- | :--- |
| **Bride (वधू)** | **Neha Prabhakar Kadam** *(D/o Smt. & Shri Prabhakar Kadam)* | **चि. सौ. कां. नेहा प्रभाकर कदम** *(सुपुत्री: सौ. व श्री. प्रभाकर कदम)* |
| **Groom (वर)** | **Chinmay Devidas Pawar** *(S/o Smt. & Shri Devidas Pawar)* | **चि. चिन्मय देविदास पवार** *(सुपुत्र: सौ. व श्री. देविदास पवार)* |
| **Date (दिनांक)** | **Saturday, 19 December 2026** | **शनिवार, १९ डिसेंबर २०२६** |
| **Muhurat (शुभ मुहूर्त)** | **10:30 AM (Auspicious Muhurat)** | **सकाळी १०:३० वा. (शुभ मुहूर्त)** |
| **Venue (स्थळ)** | **Supreme Banquets Hall**, Manpada, Thane (West) | **सुप्रीम बँक्वेट्स हॉल**, मानपाडा जंक्शन, ठाणे (पश्चिम) |
| **Location Map** | [Google Maps Navigation](https://maps.google.com/?q=Supreme+Banquets+Hall,+Manpada,+Thane+West,+Thane+400610) | [गुगल मॅप्स नकाशा](https://maps.google.com/?q=Supreme+Banquets+Hall,+Manpada,+Thane+West,+Thane+400610) |

---

## ✨ Key Features & User Experience

1. **👑 Royal Opening Envelope**: Full-screen royal maroon velvet envelope with Lord Ganesha crest, gold wax seal, floating marigold/rose petals, and a smooth unsealing animation.
2. **✍️ Guest Identification**: Guests enter their **First Name** and **Surname** with validation (supports Devanagari & Latin letters) before entering the grand celebration.
3. **📊 Real-Time Cross-Device Visitor Logging (Supabase)**:
   - Automatic cloud database synchronization when guests open the invitation on WhatsApp from anywhere in the world.
   - Tracks unique visitors, total visits, last activity timestamp, and device type (Mobile / Desktop).
   - Inactivity window logic prevents page refreshes from artificially inflating visit counts.
4. **⏳ Auspicious Muhurat Countdown**: Live animated countdown ticking down to **19 December 2026 at 10:30 AM IST** (`Asia/Kolkata`).
5. **📍 Interactive Venue Card**: Complete venue address, landmark details, and 1-click Google Maps directions to Supreme Banquets Hall, Thane.
6. **🖼️ Miniature Cultural Gallery**: Curated photo gallery featuring traditional mandap, gold rings, brass diyas, torans, and jewellery with high-res lightbox inspection.
7. **📖 Our Story**: 3-stage romantic journey celebrating how Neha & Chinmay met, fell in love, and decided on forever.
8. **💌 Guest Blessings & Wishes**: Heartfelt guestbook allowing family and friends to send blessings directly stored in the cloud database.
9. **🌐 100% Bilingual (मराठी / English)**: Instant one-click toggle across all shlokas, headings, cards, dates, and buttons.
10. **📲 WhatsApp Sharing & QR Code**: Custom pre-filled bilingual WhatsApp message and dynamic scannable QR code.
11. **🎵 Royal Ambient Instrumental**: Background traditional shehnai/sitar instrumental with audio wave visualizer and sound toggle.
12. **🔐 Private Bride & Groom Dashboard (`/admin`)**:
    - Private analytics dashboard for Neha & Chinmay to monitor guest visits in real time.
    - Searchable and sortable guest list.
    - Blessings moderation panel.
    - **1-Click Export to CSV / Excel** for wedding planning and seating charts.

---

## 🔐 Bride & Groom Dashboard Access

The private analytics portal is accessible by adding `/admin` or `#admin` to the website URL.

* **URL:** `https://your-domain.com/admin`
* **Default Username:** `admin` *(or `neha` / `chinmay`)*
* **Default Password:** `admin123`
* **Key Capabilities:**
  - View live guests connecting from WhatsApp across mobile devices.
  - Read, approve, or delete guest blessings.
  - Download all guest data in CSV/Excel spreadsheet format.
  - Change dashboard login password anytime from Settings.

---

## 🛠️ Tech Stack & Architecture

* **Frontend Framework:** React 19 + Vite
* **Styling & Theme:** Tailwind CSS (Custom Royal Maroon `#310912` & Antique Gold `#D4AF37` palette)
* **Animations:** Framer Motion (Envelope unsealing, petal physics, cards reveal)
* **Database & Auth:** Supabase (PostgreSQL tables: `visitors`, `visitor_sessions`, `blessings`)
* **Icons:** Lucide React
* **Confetti & Effects:** Canvas Confetti

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dishasatam/neha-chinmay-engagement.git
cd neha-chinmay-engagement
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase Cloud credentials (optional, as active cloud fallbacks are pre-wired):
```env
VITE_SUPABASE_URL=https://vipdwboiormqkhkzlwpq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TJmYc4p1iEIUaSbHt3bghQ_Cg8NhHBC
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Setup (Supabase)

The complete SQL schema is provided in [`supabase_schema.sql`](./supabase_schema.sql).

To deploy or inspect tables:
1. Open your project at [Supabase](https://supabase.com/).
2. Navigate to **SQL Editor** &rarr; paste [`supabase_schema.sql`](./supabase_schema.sql) &rarr; click **Run**.
3. Tables created:
   - `public.visitors` (Unique guest profiles, visit counts, timestamps, devices)
   - `public.visitor_sessions` (Detailed session duration logs)
   - `public.blessings` (Guestbook messages and approval status)
4. Row Level Security (RLS) is enabled with public guest insert and read policies.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import `dishasatam/neha-chinmay-engagement`.
3. Framework Preset: **Vite** (auto-detected).
4. Click **Deploy**. Vercel will build and serve the live site in ~25 seconds with full Single-Page App (SPA) routing powered by [`vercel.json`](./vercel.json).

### Deploy to GitHub Pages
1. Go to **Repository Settings** &rarr; **Pages**.
2. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
3. The `.github/workflows/deploy.yml` workflow automatically builds and publishes the production site.

---

## 📜 License & Copyright

Crafted with love and blessings for **Neha & Chinmay**'s auspicious Sakharpuda ceremony.  
All graphics, miniature figurines, paithani motifs, and invitation designs &copy; 2026.
