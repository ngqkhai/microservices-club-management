# Vercel Deployment Guide for Club Management System

## Prerequisites
1. Your Kong API Gateway is already deployed on Render
2. You have a Vercel account
3. Your frontend code is ready for deployment

## Step-by-Step Deployment Process

### 1. Update Kong Gateway Configuration

**Important**: You need to update your `kong_deploy.yml` file with the correct CORS configuration. The file has been updated to include:

- Comprehensive CORS plugin with Vercel domain support
- All necessary routes from your working `kong.yml`
- Proper JWT and authentication configurations

### 2. Update Vercel Configuration

Update your `vercel.json` file with:
- Correct API gateway URL (replace `your-kong-gateway-url.onrender.com` with your actual Render URL)
- CORS headers for API routes
- Proper rewrites for API calls

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `frontend` folder as the root directory
4. Set build command: `npm run build`
5. Set output directory: `.next`
6. Deploy

### 4. Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-kong-gateway-url.onrender.com
```

Replace `your-kong-gateway-url.onrender.com` with your actual Kong gateway URL on Render.

### 5. Update Kong CORS Configuration

After deploying to Vercel, you'll get a URL like `https://your-app.vercel.app`. Update your `kong_deploy.yml` CORS configuration:

```yaml
plugins:
  - name: cors
    config:
      origins:
        - "http://localhost:3000"
        - "https://localhost:3000"
        - "https://*.vercel.app"
        - "https://your-actual-app.vercel.app"  # Replace with your actual Vercel URL
```

### 6. Redeploy Kong Gateway

After updating the CORS configuration, redeploy your Kong gateway on Render to apply the changes.

## Important Notes

### CORS Configuration
- The CORS plugin is now included in `kong_deploy.yml`
- Make sure to replace placeholder URLs with your actual Vercel domain
- The configuration allows both development (`localhost:3000`) and production (Vercel) domains

### API Gateway URL
- Replace `your-kong-gateway-url.onrender.com` in `vercel.json` with your actual Render Kong gateway URL
- This URL should be the one where your Kong gateway is accessible

### Security Considerations
- The current CORS configuration allows all Vercel apps (`*.vercel.app`) for flexibility
- For production, consider restricting to your specific domain
- JWT authentication is properly configured for protected routes

## Troubleshooting CORS Issues

If you still encounter CORS errors:

1. **Check Kong Gateway Logs**: Verify the CORS plugin is loaded
2. **Verify Vercel Domain**: Ensure your actual Vercel URL is in the CORS origins
3. **Test API Endpoints**: Use browser dev tools to check if CORS headers are present
4. **Kong Configuration**: Confirm your Kong gateway is using the updated `kong_deploy.yml`

## Testing the Deployment

1. **Local Testing**: Test with `http://localhost:3000` in CORS origins
2. **Production Testing**: Test with your actual Vercel URL
3. **API Calls**: Verify all API endpoints work without CORS errors
4. **Authentication**: Test login/logout functionality

## Common Issues and Solutions

### 1. CORS Error Still Occurring
- Verify the Kong gateway is redeployed with new configuration
- Check if the Vercel URL is correctly added to CORS origins
- Ensure the API base URL in Vercel environment variables is correct

### 2. Authentication Issues
- Verify JWT configuration in Kong matches the auth service
- Check if the public key is correctly configured
- Ensure protected routes have proper JWT validation

### 3. API Calls Failing
- Verify the API gateway URL is accessible
- Check if the rewrite rules in `vercel.json` are working
- Test API endpoints directly to ensure they're responding

Remember to replace all placeholder URLs with your actual deployment URLs!
