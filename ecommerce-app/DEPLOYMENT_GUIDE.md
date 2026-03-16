# 🚀 PremiumStore — Full Deployment Guide

## Overview
This guide walks you step-by-step from zero to a live production app.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## STEP 1 — Set Up Supabase

### 1.1 Create a Supabase Project
1. Go to **https://supabase.com** and sign in (or create account)
2. Click **"New Project"**
3. Choose your organization, give it a name (e.g. `premiumstore`), set a strong DB password, and pick the **closest region to Nigeria** (e.g. `eu-west-2` or `us-east-1`)
4. Click **"Create new project"** and wait ~2 minutes for provisioning

### 1.2 Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Paste the entire contents and click **"Run"**
5. You should see: "Success. No rows returned"

### 1.3 Set Up Storage
The SQL schema already creates the storage bucket. Verify:
1. Go to **Storage** in the left sidebar
2. You should see a bucket called `payment-proofs`
3. If not, click "New bucket", name it `payment-proofs`, and check **"Public bucket"**

### 1.4 Get Your API Keys
1. Go to **Settings → API** in your Supabase dashboard
2. Copy these values — you'll need them shortly:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long JWT string)
   - **service_role** key (keep this SECRET — never expose in frontend)

### 1.5 Make Yourself Admin
After you create your first account in the app, run this in the SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## STEP 2 — Set Up the Project Locally

### 2.1 Install Dependencies
```bash
cd premiumstore
npm install
```

### 2.2 Create Environment Variables
Copy the example file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.3 Run Locally
```bash
npm run dev
```
Visit **http://localhost:3000** — you should see the login page.

### 2.4 Seed Products (Optional)
After creating your account, call the seed API to populate products from Supabase:
```bash
curl -X POST http://localhost:3000/api/seed-products
```
Or visit it in your browser (use a tool like Postman for POST requests).

---

## STEP 3 — Deploy to Vercel

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: PremiumStore app"
```
Create a new repo on **https://github.com/new**, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/premiumstore.git
git branch -M main
git push -u origin main
```

### 3.2 Import to Vercel
1. Go to **https://vercel.com** and sign in
2. Click **"Add New… → Project"**
3. Click **"Import"** next to your GitHub repo
4. Vercel auto-detects Next.js — leave all settings as default
5. **Before deploying**, click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. `https://premiumstore.vercel.app`) |

6. Click **"Deploy"**
7. Wait ~2 minutes for the build to complete

### 3.3 Update Supabase Auth Settings
1. In Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
3. Under **Redirect URLs**, add: `https://your-app.vercel.app/**`
4. Click **Save**

---

## STEP 4 — Post-Deployment Checklist

- [ ] Visit your live URL and sign up for an account
- [ ] Run the SQL to make yourself admin: `UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';`
- [ ] Call the seed endpoint to populate products: `POST https://your-app.vercel.app/api/seed-products`
- [ ] Test the full order flow: Browse → Checkout → Upload proof
- [ ] Verify admin panel shows orders at `/admin`
- [ ] Test dark/light mode toggle

---

## STEP 5 — Custom Domain (Optional)
1. In Vercel → your project → **Settings → Domains**
2. Click **"Add"** and enter your domain
3. Follow the DNS instructions to point your domain to Vercel
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your custom domain
5. Update Supabase Auth redirect URLs to include your custom domain

---

## Troubleshooting

### "Invalid API key" error
→ Double-check your `.env.local` values match exactly what's in Supabase Settings → API

### Orders not saving
→ Make sure you ran the full `schema.sql` in Supabase. Check the `orders` table exists.

### File upload failing
→ Verify the `payment-proofs` storage bucket exists and has the correct RLS policies

### Admin panel not accessible
→ Run the SQL to set your role to 'admin' in the Supabase SQL Editor

### Realtime not working
→ Check that the `supabase_realtime` publication includes the `orders` table (already in schema.sql)

---

## Project Structure
```
src/
├── app/
│   ├── (app)/              ← Protected app routes
│   │   ├── layout.tsx      ← Sidebar + header shell
│   │   ├── shop/           ← Product catalog
│   │   ├── checkout/       ← Checkout + payment form
│   │   ├── orders/         ← User order history
│   │   ├── dashboard/      ← User dashboard
│   │   ├── settings/       ← Theme + profile settings
│   │   └── admin/          ← Admin order management
│   ├── auth/               ← Login + signup pages
│   └── api/                ← API routes
├── components/             ← Reusable UI components
├── context/                ← ThemeContext
├── hooks/                  ← useAuth, useOrders
├── lib/supabase/           ← Supabase client/server
└── types/                  ← TypeScript types + static data
```
