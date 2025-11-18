# Supabase OAuth Provider Troubleshooting

## Issue: Providers Not Showing as Enabled

Even after enabling providers in the Supabase Dashboard, they're not available via the API.

## Solution Options

### Option 1: Double-Check Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. For each provider (Google and LinkedIn):
   - Make sure the toggle is **ON** (green)
   - Make sure you've entered BOTH Client ID and Client Secret
   - Click **Save** button at the bottom
   - Wait for "Provider updated" confirmation message

### Option 2: Check Project Status

1. Go to **Settings** → **General**
2. Check if your project is paused or inactive
3. If paused, unpause it and wait a few minutes

### Option 3: Use Environment Variables (Alternative Setup)

If the dashboard isn't working, you might need to set up OAuth through environment variables:

1. In your `.env.local` file, add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eepojaeewjroymplxgaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# OAuth providers (these might be needed)
SUPABASE_AUTH_EXTERNAL_GOOGLE_ENABLED=true
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=[your-google-client-id]
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=[your-google-secret]

SUPABASE_AUTH_EXTERNAL_LINKEDIN_ENABLED=true
SUPABASE_AUTH_EXTERNAL_LINKEDIN_CLIENT_ID=[your-linkedin-client-id]
SUPABASE_AUTH_EXTERNAL_LINKEDIN_SECRET=[your-linkedin-secret]
```

### Option 4: Direct Supabase CLI Configuration

If you have Supabase CLI access:

```bash
supabase db reset
supabase auth providers list
supabase auth providers enable google --client-id [ID] --secret [SECRET]
supabase auth providers enable linkedin --client-id [ID] --secret [SECRET]
```

### Option 5: Manual Provider Configuration Check

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query to check auth configuration:
```sql
SELECT * FROM auth.providers;
```

This should show which providers are configured.

## Verification Steps

After trying any of the above:

1. Wait 2-3 minutes for changes to propagate
2. Test the endpoint again:
```bash
curl https://eepojaeewjroymplxgaq.supabase.co/auth/v1/settings
```

3. Look for the `external` object - it should contain your providers:
```json
{
  "external": {
    "google": true,
    "linkedin": true
  }
}
```

## If Still Not Working

### Check Supabase Service Status
1. Go to [status.supabase.com](https://status.supabase.com)
2. Check if there are any ongoing issues

### Contact Supabase Support
If providers are enabled in dashboard but not working:
1. Take screenshots of your provider configuration
2. Contact Supabase support with:
   - Project reference: eepojaeewjroymplxgaq
   - Issue: OAuth providers enabled but not accessible via API
   - Error: "Unsupported provider: provider is not enabled"

### Temporary Workaround

While troubleshooting OAuth, you can still use:
- Email/password authentication
- Magic link authentication

Both of these are working in your current setup.

## Important Notes

- Supabase Free tier supports OAuth providers
- Changes might take up to 5 minutes to propagate
- Make sure you're not hitting any rate limits
- Check that your project isn't paused (free tier pauses after inactivity)