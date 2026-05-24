# FitAI — Personal Fitness & Nutrition Companion

A modern, AI-powered fitness and nutrition tracking web app built with React + Vite, Supabase, and Claude AI.

## Features (MVP)
- 🔐 Authentication (Supabase Auth)
- 📋 Multi-step onboarding with automatic TDEE/macro calculation
- 📊 Dashboard with calorie ring, macro bars, water tracker, streak counter
- 🍽️ Food tracker with 35+ foods database + custom food entry
- 🤖 AI Nutrition Coach (Claude API) — context-aware, knows your real-time macros
- 📈 Progress tracking — weight logs + 14-day calorie charts

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Database & Auth | Supabase |
| AI | Anthropic Claude API |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Setup Instructions

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com) and open your project
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. In **Project Settings → API**, copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 2. Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key → `VITE_ANTHROPIC_API_KEY`

### 3. Local Development
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your keys in .env

# Run dev server
npm run dev
```

### 4. Deploy to Vercel (Free)
1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add Environment Variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`
4. Click **Deploy** — done! 🚀

> **Note:** The `vercel.json` file handles SPA routing automatically.

---

## Supabase Auth Configuration
In your Supabase project:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel deployment URL (e.g. `https://fitai.vercel.app`)
3. Add the same URL to **Redirect URLs**

For email confirmation, go to **Authentication → Email Templates** and customize as needed. For development, you can disable email confirmation in **Authentication → Providers → Email**.

---

## Project Structure
```
src/
├── context/
│   └── AuthContext.jsx     # Auth state & Supabase auth methods
├── hooks/
│   └── useFoodLog.js       # Food log data hook + streak calculator
├── lib/
│   └── supabase.js         # Supabase client
├── pages/
│   ├── Landing.jsx         # Public landing page
│   ├── Auth.jsx            # Sign in / sign up
│   ├── Onboarding.jsx      # 5-step profile setup
│   ├── Dashboard.jsx       # Main dashboard
│   ├── FoodTracker.jsx     # Food search & meal logging
│   ├── NutritionAI.jsx     # AI chat coach
│   └── Progress.jsx        # Weight & calorie charts
├── components/
│   └── AppLayout.jsx       # Sidebar + layout wrapper
├── App.jsx                 # Routes
├── main.jsx
└── index.css               # Design system & global styles
```

---

## Roadmap (Next Features)
- [ ] Workout tracker & exercise library
- [ ] AI workout plan generator
- [ ] Food image scanning
- [ ] Mobile PWA
- [ ] Push notifications
- [ ] Social / sharing progress
- [ ] Barcode scanner
