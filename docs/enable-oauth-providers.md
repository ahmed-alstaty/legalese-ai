# Enable OAuth Providers in Supabase

## Error: "Unsupported provider: provider is not enabled"

This error occurs when the OAuth provider is not enabled in your Supabase project.

## Solution: Enable Providers in Supabase Dashboard

### Step 1: Access Supabase Authentication Settings

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (eepojaeewjroymplxgaq)
3. Navigate to **Authentication** (icon looks like a shield)
4. Click on **Providers** tab

### Step 2: Enable Google Provider

1. Find **Google** in the list of providers
2. Click on it to expand settings
3. Toggle **Enable Google provider** to ON
4. Add your Google OAuth credentials:
   - **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
   - **Client Secret**: Get from Google Cloud Console
5. **Authorized Client IDs** (optional): Leave empty for now
6. Click **Save**

### Step 3: Enable LinkedIn Provider

1. Find **LinkedIn** in the list of providers (NOT LinkedIn OIDC)
2. Click on it to expand settings
3. Toggle **Enable LinkedIn provider** to ON
4. Add your LinkedIn OAuth credentials:
   - **Client ID**: Get from [LinkedIn Developers](https://www.linkedin.com/developers/)
   - **Client Secret**: Get from LinkedIn Developers
5. Click **Save**

### Step 4: Verify Redirect URLs

After enabling, Supabase will show you the callback URL for each provider.
It should be: `https://eepojaeewjroymplxgaq.supabase.co/auth/v1/callback`

Make sure this EXACT URL is added to:
- Google Cloud Console → OAuth 2.0 → Authorized redirect URIs
- LinkedIn Developers → Auth → Authorized redirect URLs

## Quick Checklist

For the providers to work, ensure:

### Google:
✅ Provider is ENABLED in Supabase
✅ Client ID is entered correctly
✅ Client Secret is entered correctly
✅ Redirect URL in Google Console: `https://eepojaeewjroymplxgaq.supabase.co/auth/v1/callback`

### LinkedIn:
✅ Provider is ENABLED in Supabase (use "LinkedIn", not "LinkedIn OIDC")
✅ Client ID is entered correctly
✅ Client Secret is entered correctly
✅ Redirect URL in LinkedIn: `https://eepojaeewjroymplxgaq.supabase.co/auth/v1/callback`
✅ "Sign In with LinkedIn" product is added and approved in LinkedIn app

## Common Issues

1. **Provider shows as disabled**: Make sure to click Save after enabling
2. **Wrong credentials**: Double-check Client ID and Secret are copied correctly
3. **Redirect URL mismatch**: Must be EXACTLY the same, including https:// and no trailing slash
4. **Using wrong provider**: For LinkedIn, use "LinkedIn" not "LinkedIn OIDC"

## Test After Setup

1. Go to http://localhost:3000/login
2. Try Google login button
3. Try LinkedIn login button
4. Both should redirect to the respective OAuth providers

## Still Getting Errors?

If you still see "provider is not enabled" after following these steps:

1. Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Clear cookies for localhost:3000
3. Check Supabase Auth Logs: Dashboard → Logs → Auth
4. Make sure you clicked "Save" after enabling each provider
5. Wait 1-2 minutes for changes to propagate

## Alternative Check

You can verify which providers are enabled by checking the Supabase Auth settings endpoint:
```bash
curl https://eepojaeewjroymplxgaq.supabase.co/auth/v1/settings
```

Look for the `external` section to see which providers are configured.