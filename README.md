# 🛒 PremiumStore — Digital Services Marketplace

A full-stack e-commerce web application built with Next.js 14, Supabase, TypeScript, and Tailwind CSS.

---

## 📦 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript |
| Styling     | Tailwind CSS, Framer Motion         |
| Backend     | Supabase (Auth, DB, Storage, RT)    |
| Deployment  | Vercel + Supabase Cloud             |

---

## 🚀 Deployment Guide (Step by Step)

### STEP 1 — Create Supabase Project

1. Go to https://supabase.com and sign up / log in
2. Click **"New Project"**
3. Fill in:
   - **Name:** premiumstore (or any name)
   - **Database Password:** choose a strong password (save it!)
   - **Region:** choose closest to Nigeria (e.g. EU West / US East)
4. Wait ~2 minutes for project to be ready

### STEP 2 — Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the contents and paste into the SQL editor
5. Click **"Run"** (green button)
6. You should see: "Success. No rows returned"

### STEP 3 — Get Your Supabase Keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy these two values:
   - **Project URL** → looks like `https://xxxx.supabase.co`
   - **anon/public key** → long JWT string
3. Also copy the **service_role key** (keep this secret!)

### STEP 4 — Set Up Storage Bucket

1. In Supabase → **Storage** → click **"New bucket"**
2. Name: `payment-proofs`
3. Check **"Public bucket"**
4. Click Create
> Note: The schema.sql already includes the bucket creation SQL, but do this manually as a backup.

### STEP 5 — Enable Realtime

1. In Supabase → **Database** → **Replication**
2. Make sure the `orders` and `order_status_history` tables are enabled
> The schema.sql does this automatically, but verify here.

### STEP 6 — Create Admin User

After deploying, sign up with your email. Then in Supabase:
1. Go to **SQL Editor** → New Query
2. Run:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```
Replace with your actual email. You'll now see the Admin Panel in the sidebar.

### STEP 7 — Deploy to Vercel

#### Option A: GitHub (recommended)

1. Push this project to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/premiumstore.git
git push -u origin main
```

2. Go to https://vercel.com → **"New Project"**
3. Import your GitHub repository
4. In **Environment Variables**, add:
```
NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY    = eyJ...your-service-role-key...
NEXT_PUBLIC_APP_URL          = https://your-vercel-url.vercel.app
```
5. Click **Deploy**
6. Wait ~2 minutes — your app is live! 🎉

#### Option B: Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

### STEP 8 — Add Your Vercel URL to Supabase

1. In Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **"Redirect URLs"**:
   - `https://your-app.vercel.app/**`
3. Update **"Site URL"** to `https://your-app.vercel.app`

---

## 🖥️ Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local
# Fill in your Supabase keys in .env.local

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/              # Protected routes with sidebar
│   │   ├── shop/           # Product catalog (3 tabs)
│   │   ├── checkout/       # Purchase flow
│   │   ├── orders/         # Order tracking
│   │   ├── dashboard/      # User dashboard
│   │   ├── settings/       # Profile & theme settings
│   │   └── admin/          # Admin panel
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   └── api/
│       └── seed-products/  # Seed DB endpoint
├── components/
│   ├── ui/                 # ThemeToggle etc.
│   ├── shop/               # ProductCard
│   └── dashboard/          # OrderCard
├── context/
│   └── ThemeContext.tsx    # Dark/light mode
├── hooks/
│   ├── useAuth.ts          # Auth state hook
│   └── useOrders.ts        # Orders + realtime hook
├── lib/
│   ├── supabase/           # Client & server clients
│   └── utils.ts            # formatNaira, formatDate etc.
├── types/
│   └── index.ts            # All TypeScript types + static data
└── middleware.ts           # Auth route protection
supabase/
└── schema.sql              # Complete DB schema + seed data
```

---

## 💳 Payment Flow

1. Customer selects a product → clicks **Buy Now**
2. Checkout page shows **OPAY** payment details:
   - Bank: OPAY
   - Account: **8136634819**
3. Customer pays the exact amount
4. Customer fills the order form + uploads payment screenshot
5. Order status starts as **"Payment Made"**
6. Admin reviews proof → updates status through:
   - Payment Made → Processing → Payment Received → Delivered

---

## 🔧 Customization

### Change Payment Details
Edit `src/app/(app)/checkout/page.tsx`:
```typescript
const PAYMENT_ACCOUNT = "8136634819";  // ← your account number
const PAYMENT_BANK = "OPAY";           // ← your bank name
```

### Add Products
Either:
- Edit `supabase/schema.sql` seed section, re-run in Supabase
- Or add directly via Supabase Table Editor → `products` table

### Modify Prices
Edit `src/types/index.ts` — find the `PREMIUM_SERVICES`, `MOBILE_NUMBERS`, `DIGITAL_ACCESS` arrays.

---

## 🛡️ Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is **never** exposed to the browser
- Row Level Security (RLS) is enabled on all tables
- Users can only see their own orders
- Admin role is set via database, not client-side
- Passwords in orders are stored in DB (consider encryption for production)

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs: Dashboard → **Logs** → API logs
2. Check Vercel logs: Your project → **Functions** tab → logs
3. Ensure all env vars are set correctly in Vercel
