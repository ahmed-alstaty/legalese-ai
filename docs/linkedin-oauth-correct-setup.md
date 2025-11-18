# LinkedIn OAuth Setup - Correct Configuration

## Important: Use LinkedIn OAuth 2.0 (not OIDC)

The `linkedin_oidc` provider may not be available in all Supabase instances. Use the standard `linkedin` provider instead.

## Step 1: LinkedIn App Configuration

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create or select your app
3. Go to the **Products** tab
4. Request access to **Sign In with LinkedIn** (not the OpenID Connect version)
5. Wait for approval (usually instant for development)

## Step 2: Get OAuth 2.0 Credentials

1. Go to the **Auth** tab in your LinkedIn app
2. Find **OAuth 2.0 settings**
3. Copy your:
   - **Client ID**
   - **Client Secret**

## Step 3: Set Redirect URLs in LinkedIn

Add this EXACT URL to **Authorized redirect URLs**:
```
https://eepojaeewjroymplxgaq.supabase.co/auth/v1/callback
```

**Note:** Do NOT add localhost URLs. Supabase handles local development redirects automatically.

## Step 4: Configure in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Providers**
3. Find **LinkedIn** (not LinkedIn OIDC)
4. Enable it and add:
   - **Client ID** from LinkedIn
   - **Client Secret** from LinkedIn
5. Save

## Step 5: Verify Scopes

The code is already configured with the correct scopes:
- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address

## Troubleshooting

### If you get "oauth_provider_not_supported" error:
1. Make sure you're using `linkedin` not `linkedin_oidc` in your code (already fixed)
2. Ensure LinkedIn provider is enabled in Supabase
3. Check that credentials are correctly entered

### If you get "Unable to exchange external code" error:
1. Verify redirect URL matches exactly
2. Make sure your LinkedIn app is approved for "Sign In with LinkedIn"
3. Check that credentials are from OAuth 2.0 settings (not OAuth 1.0)

### If login works but profile data is missing:
The app will extract:
- Full name from LinkedIn profile
- Email address
- These will be stored in user_metadata

## Testing

1. Clear browser cache/cookies
2. Go to http://localhost:3000/login
3. Click "LinkedIn" button
4. You should be redirected to LinkedIn
5. After authorization, you'll be redirected back to /dashboard

## Important Notes

- LinkedIn OAuth 2.0 tokens expire after 60 days
- Users will need to re-authenticate after token expiry
- LinkedIn has rate limits on API calls
- Development apps have a limit of authenticated users