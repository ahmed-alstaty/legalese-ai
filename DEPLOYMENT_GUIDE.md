# Production Deployment Guide for Legalese AI

## Overview
This guide covers the complete process of deploying Legalese AI to production using Vercel, setting up a custom domain, configuring environment variables, and establishing CI/CD.

## Prerequisites
- GitHub account
- Vercel account (free tier works)
- Domain registrar account (for purchasing domain)
- Supabase account
- Stripe account (for future payment processing)

## Step 1: Prepare GitHub Repository

### 1.1 Create a new GitHub repository
1. Go to [github.com/new](https://github.com/new)
2. Name: `legalese-ai` (or your preferred name)
3. Make it private initially
4. Don't initialize with README (we already have one)

### 1.2 Push your code
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/legalese-ai.git
git push -u origin main
```

## Step 2: Set Up Production Supabase

### 2.1 Create a new Supabase project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name: `legalese-ai-prod`
4. Database Password: Generate a strong password and save it
5. Region: Choose closest to your users
6. Pricing Plan: Free tier to start

### 2.2 Run database migrations
Once project is created:
1. Go to SQL Editor in Supabase dashboard
2. Run the following migrations in order:

**Migration 1: Create waitlist table**
```sql
-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  source VARCHAR(50) DEFAULT 'landing_page',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add indexes
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous waitlist signups" ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view waitlist" ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (true);
```

### 2.3 Get production keys
1. Go to Settings → API
2. Copy and save:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (click reveal first)

## Step 3: Purchase and Configure Domain

### 3.1 Domain purchased
Domain: `getlegalese.app`

### 3.2 Purchase domain
Popular registrars:
1. **Namecheap** - Good prices, free WHOIS protection
2. **Google Domains** - Simple integration
3. **Cloudflare** - Best for technical users, at-cost pricing

### 3.3 Domain purchase steps (Namecheap example)
1. Go to [namecheap.com](https://namecheap.com)
2. Search for your domain
3. Add to cart and purchase
4. Enable WHOIS protection (usually free)

## Step 4: Deploy to Vercel

### 4.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Framework Preset: Next.js (auto-detected)
6. Root Directory: `./` (leave as is)

### 4.2 Configure environment variables
In Vercel project settings → Environment Variables, add:

```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=https://getlegalese.app
NODE_ENV=production

# Stripe (for future use)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. You'll get a `.vercel.app` URL

## Step 5: Connect Custom Domain

### 5.1 In Vercel
1. Go to your project → Settings → Domains
2. Add your domain (e.g., `getlegalese.app`)
3. Add www version too: `www.getlegalese.app`

### 5.2 Configure DNS
Vercel will show you records to add. In your domain registrar:

**For apex domain (getlegalese.app):**
- Type: A
- Name: @
- Value: 76.76.21.21

**For www subdomain:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

### 5.3 Wait for propagation
- Can take 5 minutes to 48 hours
- Check status in Vercel domains tab

## Step 6: Set Up CI/CD

### 6.1 Basic GitHub Actions workflow
Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript check
        run: npm run typecheck
      
      - name: Run build
        run: npm run build
```

### 6.2 Add scripts to package.json
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix"
  }
}
```

## Step 7: Production Checklist

### 7.1 Environment variables verification
- [ ] All production env vars set in Vercel
- [ ] NEXT_PUBLIC_APP_URL updated to production domain
- [ ] Service role key is NOT prefixed with NEXT_PUBLIC

### 7.2 Security checklist
- [ ] All sensitive keys in Vercel env vars only
- [ ] .env.local not committed to git
- [ ] RLS policies enabled on all Supabase tables
- [ ] CORS configured if needed

### 7.3 Update email addresses
All emails now use: `contact@getlegalese.app`

### 7.4 Create email forwards
In your domain registrar, set up email forwarding:
- `contact@getlegalese.app` → your personal email

## Step 8: Post-Deployment

### 8.1 Test production
1. Visit your domain
2. Test waitlist signup
3. Check Supabase dashboard for new entries
4. Test all page links

### 8.2 Monitor
- Vercel Analytics (free tier available)
- Supabase dashboard for database
- Set up error tracking (Sentry - optional)

### 8.3 SSL Certificate
- Vercel handles this automatically
- Should show padlock in browser

## Environment Variables Summary

### Local Development (.env.local)
```
# Your existing dev values
```

### Production (Vercel Dashboard)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...production-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...production-service-role-key
OPENAI_API_KEY=sk-...your-api-key
NEXT_PUBLIC_APP_URL=https://getlegalese.app
NODE_ENV=production
```

## Deployment Commands

### Initial deployment
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Future updates
Vercel auto-deploys on push to main branch

## Troubleshooting

### Domain not working
- Check DNS propagation: [dnschecker.org](https://dnschecker.org)
- Ensure nameservers are correct
- Wait up to 48 hours

### Build failing
- Check build logs in Vercel
- Ensure all env vars are set
- Run `npm run build` locally first

### Waitlist not working
- Check Supabase RLS policies
- Verify service role key is correct
- Check API route logs in Vercel Functions tab

## Next Steps
1. Set up monitoring and analytics
2. Implement error tracking
3. Set up staging environment
4. Configure automated testing
5. Set up database backups