# Vercel Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Create a Vercel account at https://vercel.com

## Deployment Steps

### Option 1: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/dashboard
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`: Your backend API URL
6. Deploy automatically

### Option 2: CLI Deployment
1. In the newfrontend directory, run:
   ```bash
   vercel
   ```
2. Follow the prompts
3. Set environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_API_BASE_URL
   ```

## Environment Variables
Set these in Vercel dashboard or CLI:
- `NEXT_PUBLIC_API_BASE_URL`: Your Kong gateway URL (e.g., https://api.yourdomain.com)

## Custom Domain
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Benefits
- Automatic deployments on git push
- Global CDN
- Serverless functions
- Built-in analytics
- Perfect Next.js integration
