# OAuth Setup for Google and LinkedIn

## Prerequisites

You need to configure OAuth providers in your Supabase dashboard before the social login buttons will work.

## Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000/auth/callback`
7. Copy the Client ID and Client Secret

### Configure in Supabase:
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Find Google and click "Enable"
4. Paste your Client ID and Client Secret
5. Save the configuration

## Setting up LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Add your app details:
   - App name: Legalese (or your app name)
   - LinkedIn Page: Your company page
   - App logo: Upload your logo
4. Go to the "Auth" tab
5. Add Authorized redirect URLs:
   - `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - For local development: `http://localhost:3000/auth/callback`
6. Request access to "Sign In with LinkedIn using OpenID Connect"
7. Once approved, go to the "Auth" tab
8. Copy the Client ID and Client Secret

### Configure in Supabase:
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Find LinkedIn and click "Enable"
4. Paste your Client ID and Client Secret
5. Make sure to select "LinkedIn (OIDC)" as the provider type
6. Save the configuration

## Important Notes

- The LinkedIn provider in the code uses `linkedin_oidc` which is the newer OpenID Connect implementation
- Make sure your redirect URLs match exactly what you've configured in both Google and LinkedIn
- For production, update the redirect URLs to use your production domain
- The auth callback route (`/auth/callback`) is already set up to handle both providers

## Testing

After configuration:
1. Test Google login on `/login` or `/signup` pages
2. Test LinkedIn login on `/login` or `/signup` pages
3. Check that user profiles are created correctly in the `user_profiles` table
4. Verify that users can access the dashboard after authentication

## Troubleshooting

If login fails:
- Check browser console for errors
- Verify redirect URLs match exactly
- Ensure providers are enabled in Supabase
- Check that API keys are correct and active
- For LinkedIn, ensure you have access to the OpenID Connect scope