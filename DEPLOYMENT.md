# Legalese - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- Accounts on required services (Supabase, OpenAI, Stripe, Vercel/hosting platform)

## 1. Supabase Setup

### Create Supabase Project
1. Go to https://supabase.com and create a new project
2. Note your project URL and API keys

### Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy and execute the schema from `supabase/schema.sql`
3. Verify all tables and RLS policies are created

### Configure Storage
1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `documents`
3. Set the bucket to private (only authenticated users can access)

## 2. OpenAI Setup

1. Go to https://platform.openai.com/api-keys
2. Create a new API key with GPT-4 access
3. Note the API key for environment configuration

## 3. Stripe Setup

### Create Products and Prices
1. Go to https://dashboard.stripe.com
2. Create products:
   - **Starter Plan** ($29/month)
   - **Professional Plan** ($99/month)
3. Note the Price IDs for each plan

### Configure Webhook
1. Go to Webhooks in Stripe Dashboard
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Note the webhook signing secret

## 4. Environment Variables

Update your production environment with real values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_STARTER_PRICE_ID=price_your-starter-price-id
STRIPE_PROFESSIONAL_PRICE_ID=price_your-professional-price-id

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 5. Deployment Options

### Option A: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configure environment variables in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.production`

4. Configure custom domain (optional):
   - Go to Project Settings > Domains
   - Add your custom domain

### Option B: Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Initialize and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway Dashboard

### Option C: Self-Hosted (VPS/Docker)

1. Build the application:
```bash
npm run build
```

2. Create Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./.next
COPY public ./public
COPY next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
```

3. Build and run Docker image:
```bash
docker build -t legalese .
docker run -p 3000:3000 --env-file .env.production legalese
```

## 6. Post-Deployment

### Test Critical Paths
1. Sign up for a new account
2. Upload a test document
3. Run document analysis
4. Test subscription upgrade
5. Verify webhook processing

### Monitor and Scale
1. Set up error tracking (e.g., Sentry)
2. Configure analytics (e.g., PostHog, Mixpanel)
3. Monitor Supabase usage and limits
4. Track OpenAI API usage

### Security Checklist
- [ ] All API keys are in environment variables (not in code)
- [ ] Supabase RLS policies are enabled
- [ ] Stripe webhook signature is validated
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] SSL/TLS is enabled

## 7. Maintenance

### Regular Updates
- Keep dependencies updated: `npm update`
- Monitor security advisories: `npm audit`
- Review Supabase and OpenAI usage monthly
- Update AI prompts based on user feedback

### Backup Strategy
- Enable Supabase point-in-time recovery
- Export user data regularly
- Keep document backups in separate storage

## Support

For issues or questions:
- Check application logs in your hosting platform
- Review Supabase logs for database issues
- Monitor Stripe webhook events for payment issues
- Check OpenAI API status for AI service issues