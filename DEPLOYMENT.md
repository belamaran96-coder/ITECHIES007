# Vercel Deployment Guide

## Quick Fix for API Key Error

If you're getting API key errors after deploying to Vercel, follow these steps:

### Step 1: Get Your Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

### Step 2: Add Environment Variable in Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add a new variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Paste your Gemini API key
   - **Environments:** Check all three boxes (Production, Preview, Development)
6. Click **Save**

### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

**Option A: Via Dashboard**
1. Go to the **Deployments** tab
2. Click the three dots next to the latest deployment
3. Click **Redeploy**

**Option B: Via Git**
1. Make a small change to your code (or empty commit)
2. Push to your repository
3. Vercel will automatically redeploy

### Step 4: Verify

1. Wait for deployment to complete
2. Visit your site
3. Try generating an image or using any feature
4. If you still see errors, check the environment variable name is exactly: `GEMINI_API_KEY`

## Common Issues

### Issue: Still getting "API_KEY not configured" error
**Solution:** Make sure the environment variable is named exactly `GEMINI_API_KEY` (all caps, with underscore)

### Issue: Error about billing or quota
**Solution:** Check your Gemini API key is valid and has quota available at https://aistudio.google.com/app/apikey

### Issue: 500 Internal Server Error
**Solution:**
1. Check Vercel Function Logs (Project → Deployments → Click deployment → View Function Logs)
2. Verify the API key is correctly set
3. Make sure you saved and redeployed after adding the environment variable

## Testing Locally

Before deploying, test locally:

1. Create `.env.local` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

3. Test all features work

4. If local works but Vercel doesn't, it's definitely an environment variable issue

## Support

If you continue having issues:
1. Check Vercel Function Logs for specific error messages
2. Verify your Gemini API key at https://aistudio.google.com/app/apikey
3. Make sure you're using the correct environment variable name: `GEMINI_API_KEY`
