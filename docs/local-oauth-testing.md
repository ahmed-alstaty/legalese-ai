# Testing OAuth Locally with LinkedIn

## The Problem

LinkedIn OAuth doesn't work with `localhost` URLs directly. When testing locally, the OAuth flow breaks because:
1. LinkedIn doesn't accept `localhost` as a valid redirect URL
2. The callback goes to Supabase, which then can't redirect back to localhost properly

## Solution 1: Use ngrok (Recommended)

### Step 1: Install ngrok
```bash
# On macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Start your local server
```bash
npm run dev
# Running on http://localhost:3000
```

### Step 3: Create a tunnel
```bash
ngrok http 3000
```

This will give you a public URL like:
```
https://abc123.ngrok.io -> http://localhost:3000
```

### Step 4: Update Supabase Site URL
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your ngrok URL to **Redirect URLs**:
   ```
   https://abc123.ngrok.io/auth/callback
   ```

### Step 5: Test OAuth
Access your app via the ngrok URL:
```
https://abc123.ngrok.io/login
```

## Solution 2: Local Testing Mode (Skip LinkedIn)

For development, you can temporarily bypass LinkedIn:

### Create a dev-only login:
```typescript
// In your login-form.tsx, add a dev-only button:
{process.env.NODE_ENV === 'development' && (
  <Button
    type="button"
    variant="ghost"
    onClick={async () => {
      // Use email/password for local testing
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword'
      });
    }}
  >
    Dev Login (Skip OAuth)
  </Button>
)}
```

## Solution 3: Use Email Login for Local Testing

Since email/password and magic links work locally, use those for development:
1. Test OAuth in staging/production only
2. Use email login for local development
3. This is what many teams do in practice

## Solution 4: Configure LinkedIn for Development

### If you MUST test LinkedIn OAuth locally:

1. **Create a separate LinkedIn app for development**
2. In LinkedIn Developers, create a new app called "Legalese Dev"
3. In this dev app, you might be able to add (try these):
   ```
   http://localhost:3000/auth/callback
   http://127.0.0.1:3000/auth/callback
   ```
   Note: LinkedIn may reject localhost URLs

4. **Update your local environment**:
   ```env
   # .env.local
   NEXT_PUBLIC_LINKEDIN_CLIENT_ID_DEV=your-dev-client-id
   NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET_DEV=your-dev-client-secret
   ```

## Solution 5: Host File Trick

### Map a domain to localhost:

1. Edit your hosts file:
   ```bash
   sudo nano /etc/hosts
   ```

2. Add:
   ```
   127.0.0.1 local.getlegalese.app
   ```

3. Access your app at:
   ```
   http://local.getlegalese.app:3000
   ```

4. Add to LinkedIn redirect URLs:
   ```
   http://local.getlegalese.app:3000/auth/callback
   ```
   (LinkedIn might still reject this)

## Why Google Works Better Locally

Google OAuth is more flexible and often allows localhost URLs in development, which is why it might work while LinkedIn doesn't.

## Recommended Approach

**For immediate testing:**
1. Use **ngrok** for OAuth testing locally
2. Use email/password for regular development
3. Test OAuth thoroughly in staging environment

**For production setup:**
1. Deploy to a staging environment (e.g., Vercel preview)
2. Test OAuth there with proper URLs
3. LinkedIn OAuth will work perfectly in production

## Quick Setup with ngrok

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Use the ngrok URL to test OAuth
# Example: https://abc123.ngrok.io/login
```

Remember to update the redirect URL in Supabase Dashboard to include your ngrok URL!