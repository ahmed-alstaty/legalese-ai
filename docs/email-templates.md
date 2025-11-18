# Supabase Email Templates for Legalese

Copy these templates into your Supabase Dashboard → Authentication → Email Templates

## 1. Confirm Signup (Email Confirmation)

**Subject:** Welcome to Legalese - Confirm Your Email

**Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Welcome to Legalese!</h1>
    <p style="color: #64748b; margin-top: 10px;">Your AI-powered legal document assistant</p>
  </div>

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; color: white; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 20px 0; font-size: 24px;">You're one click away from clarity</h2>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Confirm Email Address</a>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
    <h3 style="color: #1e293b; margin-top: 0;">What happens next?</h3>
    <ul style="color: #475569; line-height: 1.8;">
      <li>✅ Instant access to AI-powered document analysis</li>
      <li>📄 Upload and understand any legal document in seconds</li>
      <li>💡 Get plain English explanations of complex legal terms</li>
      <li>⚡ Start with 3 free document analyses every month</li>
    </ul>
  </div>

  <div style="text-align: center; color: #64748b; font-size: 14px;">
    <p>This link will expire in 24 hours for security reasons.</p>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Legalese | Making legal documents human-readable</p>
    <p>
      <a href="https://getlegalese.app/privacy" style="color: #64748b; text-decoration: none;">Privacy Policy</a> • 
      <a href="https://getlegalese.app/terms" style="color: #64748b; text-decoration: none;">Terms of Service</a>
    </p>
  </div>
</div>
```

## 2. Magic Link (Passwordless Login)

**Subject:** Your Legalese Login Link

**Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Sign in to Legalese</h1>
  </div>

  <div style="background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
    <p style="color: #1e293b; font-size: 16px; margin-bottom: 20px;">Click the button below to instantly sign in to your account:</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Sign In to Legalese</a>
    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">This secure link expires in 1 hour</p>
  </div>

  <div style="background: #fefce8; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
    <p style="color: #92400e; font-size: 14px; margin: 0;">
      <strong>Security tip:</strong> This login link is unique to you. Don't forward this email or share this link with anyone.
    </p>
  </div>

  <div style="text-align: center; color: #64748b; font-size: 14px;">
    <p>If you didn't request this login link, you can safely ignore this email.</p>
    <p>Need help? Contact us at support@getlegalese.app</p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Legalese | Your legal document companion</p>
  </div>
</div>
```

## 3. Change Email Address

**Subject:** Confirm Your New Email Address - Legalese

**Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Confirm Email Change</h1>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
    <p style="color: #1e293b; font-size: 16px;">Hi there,</p>
    <p style="color: #475569;">You've requested to change your email address for your Legalese account. Please confirm this change by clicking the button below:</p>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Confirm New Email</a>
  </div>

  <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
    <p style="color: #991b1b; font-size: 14px; margin: 0;">
      <strong>Important:</strong> If you didn't request this change, please secure your account immediately by changing your password.
    </p>
  </div>

  <div style="text-align: center; color: #64748b; font-size: 14px;">
    <p>This link expires in 24 hours.</p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Legalese | Secure & Confidential</p>
  </div>
</div>
```

## 4. Reset Password

**Subject:** Reset Your Legalese Password

**Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Password Reset Request</h1>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
    <p style="color: #1e293b; font-size: 16px;">Hi there,</p>
    <p style="color: #475569;">We received a request to reset your Legalese account password. Click the button below to create a new password:</p>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
    <p style="color: #64748b; font-size: 14px; margin-top: 15px;">This link expires in 1 hour</p>
  </div>

  <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px;">
    <p style="color: #1e293b; font-size: 14px; margin: 0;">
      <strong>Didn't request this?</strong><br>
      If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
    </p>
  </div>

  <div style="text-align: center; color: #64748b; font-size: 14px;">
    <p>For security reasons, this link will expire in 1 hour.</p>
    <p>Need additional help? Contact support@getlegalese.app</p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Legalese | Your data is safe with us</p>
  </div>
</div>
```

## 5. Invite User (Team Invitations)

**Subject:** You're Invited to Join Legalese

**Body:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1e40af; font-size: 28px; margin: 0;">You're Invited to Legalese!</h1>
  </div>

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; color: white; text-align: center; margin-bottom: 30px;">
    <p style="font-size: 18px; margin-bottom: 20px;">{{ .InviterEmail }} has invited you to collaborate on Legalese</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: white; color: #667eea; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Accept Invitation</a>
  </div>

  <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
    <h3 style="color: #1e293b; margin-top: 0;">Why Legalese?</h3>
    <ul style="color: #475569; line-height: 1.8;">
      <li>🤖 AI-powered document analysis in seconds</li>
      <li>💬 Plain English explanations of legal jargon</li>
      <li>🔍 Identify risks and important clauses instantly</li>
      <li>👥 Collaborate with your team on document reviews</li>
      <li>🔒 Bank-level security for your sensitive documents</li>
    </ul>
  </div>

  <div style="text-align: center; color: #64748b; font-size: 14px;">
    <p>This invitation expires in 7 days.</p>
    <p>Questions? Reach out to {{ .InviterEmail }} or our support team.</p>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>© 2024 Legalese | Join thousands who trust us with their legal documents</p>
  </div>
</div>
```

## How to Implement in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. For each template type:
   - Enable "Customize email template"
   - Copy the HTML from above
   - Update the Subject line
   - Save changes

## Important Variables

Supabase provides these variables you can use:
- `{{ .ConfirmationURL }}` - The action URL (confirm email, reset password, etc.)
- `{{ .Email }}` - User's email address
- `{{ .InviterEmail }}` - Email of person who sent invite (for team invites)
- `{{ .SiteURL }}` - Your site URL

## Testing

After setting up:
1. Test each email flow (signup, password reset, etc.)
2. Check emails render correctly in different clients
3. Verify all links work properly
4. Test on mobile devices

## Brand Consistency Tips

- Use your brand colors (#1e40af for Legalese blue)
- Keep tone professional yet friendly
- Focus on value propositions
- Include security reassurances
- Add clear CTAs (Call-to-Actions)