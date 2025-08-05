# Legalese Setup Guide

## Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- **OpenAI API key (REQUIRED for document analysis)**
  - Get one at [OpenAI Platform](https://platform.openai.com/api-keys)
  - You'll need credits in your OpenAI account
- Stripe account (optional, for payments)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example env file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key (required for analysis)
- Stripe keys (optional for payment features)

### 3. Set Up Supabase Database

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Run the following SQL files in order:
   - First: Copy and run the contents of `supabase/schema.sql`
   - Then: Copy and run the contents of `supabase/storage.sql`
   - Finally: Copy and run the contents of `supabase/fix-cascade-delete.sql` (fixes document deletion)

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Initialize and link to your project
supabase init
supabase link --project-ref your-project-ref

# Run migrations
supabase db push --file supabase/schema.sql
supabase db push --file supabase/storage.sql
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Document Upload & Analysis
1. **Sign up/Login** at `/signup` or `/login`
2. **Upload documents** from the dashboard
3. **Click "Analyze"** to trigger AI analysis
4. **View results** with TipTap editor integration

### Key Features Working
- ✅ User authentication (Supabase Auth)
- ✅ Document upload to Supabase Storage
- ✅ AI-powered document analysis (OpenAI)
- ✅ TipTap editor with highlights and annotations
- ✅ AI chat assistant for document Q&A
- ✅ Risk assessment visualization
- ✅ User annotations and comments
- ✅ Export to PDF functionality

### Document Analysis Flow
1. Upload a legal document (PDF, Word, or text)
2. Click "Analyze" to start AI processing
3. View analysis with:
   - Executive summary
   - Risk assessment scores
   - Highlighted sections with AI comments
   - Key obligations extraction
4. Use the chat widget to ask questions about the document
5. Add your own annotations by selecting text
6. Export the annotated document as PDF

## Troubleshooting

### "User profile not found" Error
Run the fix script to create profiles for existing users:
```sql
-- In Supabase SQL Editor, run:
-- supabase/fix-existing-users.sql
```
Or the app will automatically create a profile on first dashboard visit.

### "Bucket not found" Error
Make sure you've run the `storage.sql` script to create the documents bucket.

### 404 Error on Analysis
The analysis route has been fixed. Make sure to restart your dev server after making changes.

### "Analysis failed" Error
This usually means the OpenAI API key is missing or invalid:
1. Check that `OPENAI_API_KEY` is set in your `.env.local` file
2. Verify the API key is correct (starts with `sk-`)
3. Ensure your OpenAI account has credits available
4. Restart your Next.js dev server after adding the key

### OpenAI API Errors
- Verify your API key is correct
- Check your OpenAI account has credits at [OpenAI Usage](https://platform.openai.com/usage)
- Ensure the API key has the correct permissions
- The app uses `gpt-4o-mini` model by default for cost efficiency

### "Cannot delete document" Error
If you get a foreign key constraint error when deleting:
```sql
-- Run this in SQL Editor:
-- supabase/fix-cascade-delete.sql
```
This enables CASCADE delete for related analyses when deleting documents.

### Database Connection Issues
- Verify your Supabase URL and anon key
- Check that Row Level Security (RLS) policies are properly set up
- Ensure your user profile was created on signup

## Usage Limits
- Free tier: 2 analyses per month
- Basic: 25 analyses per month
- Pro: 100 analyses per month
- Enterprise: 1000 analyses per month

## Support
For issues or questions, check the documentation or create an issue in the repository.