# Deployment Configuration Guide

## Environment Variables for Production

When deploying your frontend, you MUST set the `VITE_API_BASE_URL` environment variable in your hosting platform.

## Common Hosting Platforms

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   Name: VITE_API_BASE_URL
   Value: https://tconsolutions-64307221061.asia-south1.run.app/api
   ```
4. Redeploy your application

### Netlify
1. Go to Site settings → Build & deploy → Environment
2. Add environment variable:
   ```
   Key: VITE_API_BASE_URL
   Value: https://tconsolutions-64307221061.asia-south1.run.app/api
   ```
3. Trigger a new deployment

### Firebase Hosting
Create `.firebaserc` and add to your build command:
```bash
VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api npm run build
```

### GitHub Pages / Static Hosting
For static hosting without environment variable support, you need to:

1. Update your build script in `package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "build:production": "VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api vite build"
  }
}
```

2. For Windows PowerShell:
```json
{
  "scripts": {
    "build:production": "set VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api && vite build"
  }
}
```

3. Or use cross-env package:
```bash
npm install --save-dev cross-env
```

```json
{
  "scripts": {
    "build:production": "cross-env VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api vite build"
  }
}
```

### Docker
In your Dockerfile, use build arguments:
```dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build
```

Build with:
```bash
docker build --build-arg VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api .
```

## Troubleshooting Deployment Issues

### Issue: Login successful but no data in localStorage

**Symptoms:**
- Login API call succeeds (status 200)
- No error messages
- User data not saved to localStorage
- User redirected but appears logged out

**Likely Causes:**
1. `VITE_API_BASE_URL` not set in production
2. API returning different response structure
3. CORS issues blocking the response

**Solutions:**

#### 1. Check Environment Variable
Open browser console on deployed site and look for:
```
🌐 API Configuration: { VITE_API_BASE_URL: undefined, API_BASE_URL: '/api', ... }
```

If `VITE_API_BASE_URL` is `undefined`, the environment variable is not set!

**Fix:** Set the environment variable in your hosting platform and redeploy.

#### 2. Check API Response
Look in the browser console for:
```
📦 Login response data: { ... }
```

Verify the response has these fields:
- `id`
- `empId`
- `empRole`
- `email` (optional)
- `firstName` (optional)
- `lastName` (optional)

If any required fields are missing, the login will fail with:
```
❌ Invalid login response structure
```

#### 3. Check Network Tab
1. Open DevTools → Network tab
2. Look for the login request
3. Check the Request URL - should be:
   ```
   https://tconsolutions-64307221061.asia-south1.run.app/api/auth/login
   ```
   
   NOT:
   ```
   https://your-frontend-domain.com/api/auth/login
   ```

#### 4. Check CORS
If you see CORS errors in console:
- Ensure your backend allows requests from your frontend domain
- Check backend CORS configuration includes your deployed frontend URL

## Build-Time vs Runtime Variables

⚠️ **IMPORTANT**: Vite environment variables are embedded at BUILD time, not runtime!

This means:
- The environment variable must be available when running `npm run build`
- Changing environment variables after build has no effect
- You must rebuild and redeploy after changing environment variables

## Quick Fix for Immediate Deployment

If you can't set environment variables in your hosting platform, you can temporarily hardcode the API URL:

**Option 1: Update `.env` and commit it** (Not recommended for security)
```env
VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api
```

**Option 2: Create production config file**

Create `src/config/production.js`:
```javascript
export const PRODUCTION_API_URL = 'https://tconsolutions-64307221061.asia-south1.run.app/api';
```

Update `src/lib/api.js`:
```javascript
import { PRODUCTION_API_URL } from '../config/production';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (import.meta.env.PROD ? PRODUCTION_API_URL : '/api');
```

## Verification Steps After Deployment

1. Open deployed site in browser
2. Open DevTools Console
3. Look for initialization logs:
   ```
   🌐 API Configuration: { ... }
   ```

4. Try to login and check for:
   ```
   🔐 Attempting login with empId: ...
   🔗 API URL: https://...
   📡 Login response status: 200 OK
   📦 Login response data: { ... }
   ✅ User data created: { ... }
   ✅ User saved to localStorage
   ```

5. Check localStorage in DevTools → Application → Local Storage
   - Should see `user` key with JSON data

## Environment-Specific Configuration

You can create multiple environment files:

- `.env` - Default for all environments
- `.env.local` - Local overrides (gitignored)
- `.env.development` - Development-specific
- `.env.production` - Production-specific

Example `.env.production`:
```env
VITE_API_BASE_URL=https://tconsolutions-64307221061.asia-south1.run.app/api
```

## Contact Backend Team

If issues persist, verify with backend team:
1. CORS configuration includes your frontend domain
2. Login endpoint returns correct structure
3. API is accessible from your hosting location
4. SSL/TLS certificates are valid

## Debug Mode

To enable maximum debugging, temporarily add to `src/lib/api.js`:
```javascript
export const apiFetch = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  console.log('🚀 API Request:', {
    url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    console.log('📥 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    return response;
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
  }
};
```

Remember to remove excessive logging in production for performance!
