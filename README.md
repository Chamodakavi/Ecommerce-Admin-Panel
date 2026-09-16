# Premier Auto Hub — Management Portal

A full-stack administrative operations and team management platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**. The platform features dual-role access control (Store Owner vs. Co-Workers), inventory tracking, order status workflows, invoicing, and an automated database keep-alive worker.

## Features

- **Role-Based Access Control (RBAC):**
  - **Owner:** Full access to all business analytics, financial revenue cards, co-worker credential management, system settings, and profile details.
  - **Co-Worker:** Streamlined operational access strictly limited to generating customer invoices, checking today's billed invoices, updating product inventory, and tracking dispatches/shipped orders.
- **Co-Worker Management:** Create, list, edit, and delete staff member records with individual account credentials, customizable profile images, job roles, and tax/address details.
- **Route Protection & Middleware:** Edge-level route protection using HTTP cookies, preventing unauthorized access, blocking history-back bypasses upon sign out, and auto-redirecting between `/signin` and `/dashboard`.
- **Automated Supabase Keep-Alive:** Headless Python worker integrated with GitHub Actions scheduled via cron to ping the database every 3 days, preventing project pauses on the Supabase free tier.
- **Image Hosting via Cloudinary:** Integrated direct Cloudinary image uploading for user profile avatars and staff cards.

## File Structure

```
admin-web/
├── .github/
│   └── workflows/
│       └── keep_supabase_alive.yml    # Scheduled workflow to ping Supabase
├── scripts/
│   └── ping_supabase.py              # Lightweight REST ping script
├── public/
│   └── images/
│       ├── logo/                     # Application light & dark logos
│       └── user/                     # Static fallback placeholders
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── signin/
│   │   │       └── page.tsx          # Sign-in portal
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Adaptive role-based dashboard
│   │   ├── coworkers/
│   │   │   └── page.tsx              # Staff management CRUD interface
│   │   ├── layout.tsx                # Base application shell
│   │   └── page.tsx                  # Root redirect entry point
│   ├── components/
│   │   ├── common/
│   │   │   ├── ImageUpload.tsx       # Cloudinary media uploader
│   │   │   └── ThemeToggleButton.tsx # Light/dark mode toggle
│   │   ├── form/
│   │   │   ├── input/InputField.tsx  # Extended HTML inputs
│   │   │   └── Label.tsx             # Form labels
│   │   ├── header/
│   │   │   ├── AppHeader.tsx         # Responsive application header
│   │   │   └── UserDropdown.tsx      # Profile menu & history-clearing signout
│   │   ├── sidebar/
│   │   │   └── AppSidebar.tsx        # Collapsible dynamic role navigation
│   │   └── ui/
│   │       ├── button/Button.tsx     # Custom buttons
│   │       └── modal/Modal.tsx       # Dialog modal container
│   ├── functions/
│   │   ├── auth.ts                   # Universal authentication logic
│   │   ├── coworkers.ts              # Co-worker table CRUD operations
│   │   └── profile.ts                # Owner profile & Cloudinary logic
│   ├── middleware.ts                 # Next.js edge route protection
│   └── utils/
│       └── supabase/
│           ├── client.ts             # Browser Supabase client
│           └── server.ts             # Server-side Supabase client
├── .env.local                        # Local secrets and API keys
├── next.config.ts                    # Next.js configuration & domain rules
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Tech Stack & Dependencies

| Category | Technology |
|---|---|
| Framework | Next.js 15+ (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL & PostgREST API) |
| Icons | Lucide React |
| Media Storage | Cloudinary |
| Automation | Python 3, GitHub Actions |

## Database Setup (Supabase SQL)

Run the following scripts in your Supabase SQL Editor:

```sql
-- 1. Create Co-workers Table
CREATE TABLE IF NOT EXISTS public.coworkers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_url TEXT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT 'ChangeMe123!',
    phone VARCHAR(50),
    job_title VARCHAR(100) DEFAULT 'Staff Member',
    status VARCHAR(50) DEFAULT 'Active',
    bio TEXT,
    country VARCHAR(100) DEFAULT 'Sri Lanka',
    city_state VARCHAR(150),
    postal_code VARCHAR(50),
    tax_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Owner Profile Table
CREATE TABLE IF NOT EXISTS public.owner_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avatar_url TEXT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Store Owner',
    phone VARCHAR(50),
    bio TEXT,
    country VARCHAR(100) DEFAULT 'Sri Lanka',
    city_state VARCHAR(150),
    postal_code VARCHAR(50),
    tax_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create base access policies
ALTER TABLE public.coworkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on coworkers" 
ON public.coworkers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on owner_profile" 
ON public.owner_profile FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Chamodakavi/admin-web.git
cd admin-web
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Unauthenticated visits automatically redirect to `/signin`.

## Keep-Alive Script Setup

To prevent the Supabase database from pausing due to inactivity:

1. Push this project to GitHub.
2. Navigate to **Settings → Secrets and variables → Actions** in your GitHub repository.
3. Under **Repository secrets**, click **New repository secret** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase public anon key.
4. The workflow in `.github/workflows/keep_supabase_alive.yml` will automatically execute every 3 days. You can also trigger it manually from the Actions tab.
