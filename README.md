<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ITechies - AI Design Suite

A comprehensive AI-powered platform for generating web assets, editing images, creating videos, and converting designs into frontend code.

View your app in AI Studio: https://ai.studio/apps/drive/12Vh25mZqIoxCzpN3BaLnz_5E_V--JF1T

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   Get your API key from: https://aistudio.google.com/app/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to [Vercel Dashboard](https://vercel.com/new) and import your repository

3. **IMPORTANT: Add Environment Variable:**
   - Go to Project Settings → Environment Variables
   - Add variable:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** Your Gemini API key from https://aistudio.google.com/app/apikey
   - Apply to: **Production, Preview, and Development**

4. Deploy!

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variable:
   ```bash
   vercel env add GEMINI_API_KEY production
   ```
   Then paste your Gemini API key when prompted

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

## Environment Variables

Required environment variables:

- `GEMINI_API_KEY` - Your Google Gemini API key from https://aistudio.google.com/app/apikey

## Features

- **Asset Generator**: Generate web assets and images from text prompts
- **Image Editor**: Modify images using natural language instructions
- **Video Creator**: Generate videos using Veo model (requires billing)
- **Code Generator**: Convert design mockups to React/Vue/HTML code
- **AI Chat Assistant**: Get help with design ideas and frontend questions
