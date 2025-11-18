# Setting Up Friendly Application Name for OAuth

## Change the Display Name in Supabase

1. **Go to Supabase Dashboard**:
   - Navigate to [app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Configure Auth Settings**:
   - Go to **Authentication** → **URL Configuration**
   - Look for **Site URL** and **Redirect URLs**

3. **Set up Custom Domain (Recommended for Production)**:
   - Go to **Settings** → **Custom Domains**
   - Add your custom domain (e.g., `auth.getlegalese.app`)
   - This will make OAuth prompts show your domain instead of Supabase

4. **Configure Auth Branding**:
   - Go to **Authentication** → **Email Templates**
   - Update the **Site Name** field to "Legalese" or your preferred name
   - This affects email communications

## For OAuth Providers

### Google OAuth
1. In [Google Cloud Console](https://console.cloud.google.com/):
   - Go to **OAuth consent screen**
   - Set **Application name** to "Legalese"
   - Add your logo
   - Configure authorized domains
   - This makes Google show "Sign in to Legalese" instead of your project URL

### LinkedIn OAuth
1. In [LinkedIn Developers](https://www.linkedin.com/developers/):
   - Go to your app settings
   - Update **App name** to "Legalese"
   - Upload your app logo
   - This makes LinkedIn show your app name during authorization

## Alternative: Custom OAuth Flow

If you need more control over the OAuth experience, you can implement a custom OAuth flow:

1. **Create a custom auth page** that initiates OAuth
2. **Use your own domain** for the redirect URL
3. **Handle the callback** on your domain, then redirect to Supabase

Example implementation:
- Initial OAuth request goes through your domain
- Your domain redirects to the provider
- Provider redirects back to your domain
- Your domain exchanges the code with Supabase
- User sees your domain throughout the process

## Quick Fix Without Custom Domain

While waiting for custom domain setup, update your OAuth provider settings:

1. **Google**: Update OAuth consent screen with your app name and branding
2. **LinkedIn**: Update app name and logo in app settings

These changes will at least show "Legalese" in the provider's consent screen, even if the redirect URL still shows the Supabase domain.

## Production Recommendation

For the best user experience in production:
1. Set up a custom domain for your Supabase project
2. Configure proper branding in both Supabase and OAuth providers
3. Consider implementing a custom OAuth flow if you need complete control over the experience