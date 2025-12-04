# Google OAuth Setup Instructions

To enable Google sign-in, you need to configure it in your Supabase project:

## 1. Enable Google Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it to **Enabled**

## 2. Configure Google OAuth Credentials

### Option A: Use Supabase's Google OAuth (Easiest)
Supabase provides pre-configured Google OAuth for development. Just enable it and you're done!

### Option B: Use Your Own Google OAuth App (Production)

1. **Create Google OAuth App**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**

2. **Configure OAuth Consent Screen**:
   - Add your app name
   - Add support email
   - Add authorized domains

3. **Set Authorized Redirect URIs**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your actual Supabase project reference.

4. **Copy Credentials to Supabase**:
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Paste them in Supabase Dashboard → Authentication → Providers → Google

## 3. Update Your Application URL

In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**: `http://localhost:3000/auth/callback`

For production, update these to your production domain.

## 4. Test the Integration

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected to `/home`

## Troubleshooting

**Error: "Invalid redirect URI"**
- Make sure the redirect URI in Google Console matches exactly: `https://<your-project-ref>.supabase.co/auth/v1/callback`

**Error: "OAuth provider not enabled"**
- Ensure Google provider is enabled in Supabase Dashboard

**Error: "Invalid client ID or secret"**
- Double-check your credentials in Supabase Dashboard

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for sensitive data in production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
