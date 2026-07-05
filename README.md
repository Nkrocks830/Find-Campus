# 🎓 FindIt Campus — Smart Campus Lost & Found System

> A production-ready, hackathon-winning web app that uses AI to intelligently match lost & found items on campus.

![FindIt Campus](https://img.shields.io/badge/Built%20with-React%20%2B%20Supabase%20%2B%20HuggingFace-6366f1)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo
**[https://findit-campus.vercel.app](https://findit-campus.vercel.app)**

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Match Scoring** | Text embeddings via `all-MiniLM-L6-v2` compute cosine similarity between lost & found reports. Shows % match score. |
| 🛡️ **Claim Verification** | Challenge Q&A system — finder sets a question only the true owner knows. Prevents false claims without admin. |
| 📱 **QR Handover Proof** | Verified claims generate a unique QR code as audit trail — digital proof of item return. |
| 🗺️ **Campus Heatmap** | Leaflet.js map showing where items are most frequently lost — sized circles by frequency. |
| ⏰ **Auto-Expiry Nudges** | Items auto-archived after 20 days with dashboard warnings. |
| 🏷️ **Category Auto-Tag** | AI zero-shot classification suggests item category from description. |

---

## 🛠️ Tech Stack (All Free)

- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **Animations**: Framer Motion
- **Backend/DB/Auth**: Supabase (Postgres + Auth + Storage)
- **AI**: Hugging Face Inference API (free tier)
  - Text: `sentence-transformers/all-MiniLM-L6-v2`
  - Category: `facebook/bart-large-mnli`
- **Maps**: Leaflet.js + OpenStreetMap
- **QR Codes**: `qrcode.react` (client-side, no API)
- **Icons**: Lucide React
- **Hosting**: Vercel (free tier)

---

## 📦 Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/findit-campus.git
cd findit-campus
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HF_API_TOKEN=hf_your_token_here
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Run `supabase/schema.sql` (creates all tables + RLS policies + storage bucket)
3. Optionally run `supabase/seed.sql` for demo data (update the `user_id` placeholder first)

> **Important**: The schema requires the `pgvector` extension. It's enabled automatically by the first line of `schema.sql`.

### 4. Get a Hugging Face Token
1. Create a free account at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens → New Token
3. Add it to your `.env` as `VITE_HF_API_TOKEN`

### 5. Run Locally
```bash
npm run dev
```
Open `http://localhost:5173`

---

## 🗄️ Database Schema

```
profiles     → auth.users extended (name, avatar)
items        → lost/found reports with embeddings
matches      → AI similarity scores between items
claims       → claim flow with challenge Q&A + QR tokens
```

### Row Level Security
- Public read on `items` (status=active)
- Users can only edit/delete their own items
- Claims visible only to the item owner and claimant

---

## 🤖 AI Matching Architecture

```
New Item Posted
     │
     ▼
getTextEmbedding()          ← HF API: all-MiniLM-L6-v2
     │
     ▼
Fetch all opposite-type items (lost↔found)
     │
     ▼
For each candidate:
  cosineSimilarity(embA, embB)  → textScore (70%)
  categoryMatch                  → catScore  (20%)
  locationProximity              → locScore  (10%)
                                   ─────────────────
                                   totalScore (0-1)
     │
     ▼
Store in matches table (if score > 0.15)
Show on ItemDetail as ranked list with % badge
```

**Fallback**: If HF API is rate-limited, keyword overlap is used as a fallback scoring method.

---

## 📱 Pages

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing | No |
| `/auth` | Email OTP Login | No |
| `/browse` | Browse & Filter Items | No |
| `/item/:id` | Item Detail + AI Matches | No |
| `/report` | Report Lost/Found Item | ✅ Yes |
| `/claim/:itemId` | Claim Verification Flow | ✅ Yes |
| `/dashboard` | My Reports + Claims | ✅ Yes |
| `/heatmap` | Campus Map Heatmap | No |

---

## 🚀 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_HF_API_TOKEN`

The `vercel.json` file handles SPA routing rewrites automatically.

---

## 📂 Project Structure

```
findit-campus/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Responsive nav with auth state
│   │   ├── ItemCard.jsx         # Card with match score overlay
│   │   ├── MatchScoreReveal.jsx # Animated SVG match % ring
│   │   ├── QRModal.jsx          # QR code + download modal
│   │   ├── CategoryAutoTag.jsx  # AI category suggestion
│   │   ├── LocationPicker.jsx   # Leaflet map pin picker
│   │   ├── EmptyState.jsx       # Designed empty states
│   │   └── LoadingSpinner.jsx   # Loading indicator
│   ├── pages/
│   │   ├── Landing.jsx          # Hero + stats + features
│   │   ├── Auth.jsx             # Email OTP flow
│   │   ├── ReportItem.jsx       # 3-step report form
│   │   ├── Browse.jsx           # Filtered grid + search
│   │   ├── ItemDetail.jsx       # Full item + AI matches
│   │   ├── ClaimFlow.jsx        # Challenge Q&A + QR reveal
│   │   ├── Dashboard.jsx        # My reports + claims
│   │   └── Heatmap.jsx          # Campus location heatmap
│   ├── lib/
│   │   ├── supabase.js          # Supabase client + helpers
│   │   ├── huggingface.js       # HF embeddings + category AI
│   │   └── matching.js          # Match orchestration + QR tokens
│   ├── stores/
│   │   └── authStore.js         # Zustand auth state
│   ├── App.jsx                  # Routes
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global design system
├── supabase/
│   ├── schema.sql               # Full DB schema + RLS
│   └── seed.sql                 # Demo data (15 items)
├── .env.example
├── vercel.json
└── README.md
```

---

## 🏆 Hackathon Highlights

- **Problem**: Campus lost & found is usually a WhatsApp group or notice board — inefficient, slow
- **Solution**: AI similarity matching reduces search time from hours to seconds
- **Differentiators**:
  1. Ranked AI match scores (not just a list)
  2. Tamper-proof claim verification without admin overhead
  3. QR handover creates a lightweight audit trail
  4. Heatmap gives actionable insight to campus security

---

## 📄 License
MIT © 2025 FindIt Campus
