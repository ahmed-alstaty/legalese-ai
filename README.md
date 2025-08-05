# Legalese AI

AI-powered legal document analysis platform that helps users understand contracts, leases, insurance policies, and other legal documents in plain English.

## Features

- 🤖 **AI-Powered Analysis** - Advanced AI reviews documents and identifies key clauses
- 🛡️ **Risk Assessment** - Get detailed risk scores and recommendations
- 👁️ **Plain English Summaries** - Complex legal language translated clearly
- 💬 **Interactive Q&A** - Ask questions about your documents
- 📊 **Document Comparison** - Compare different options side-by-side
- 🔒 **Secure & Private** - End-to-end encryption, documents not stored

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: OpenAI API
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase)
- **Payments**: Stripe (prepared for future)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/legalese-ai.git
cd legalese-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your keys:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
legalese-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── dashboard/        # Protected dashboard
│   └── ...               # Other pages
├── components/            # React components
├── lib/                  # Utility functions
├── supabase/            # Database migrations
├── public/              # Static assets
└── types/               # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript check

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

Quick deploy with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/legalese-ai)

## Environment Variables

### Required for Production

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `NEXT_PUBLIC_APP_URL` - Your production URL

### Optional (for full features)

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Contributing

We're not accepting contributions at this time as the project is in early development.

## License

This project is proprietary and confidential.

## Support

For support, email contact@getlegalese.app