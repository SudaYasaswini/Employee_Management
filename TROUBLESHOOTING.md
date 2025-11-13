# 🔧 Troubleshooting: Login Works but No Data in Deployed Frontend

## Issue Description
- ✅ Login successful (API returns 200)
- ❌ User data not stored in localStorage
- ❌ User appears logged out after redirect
- ✅ Works fine in local development

## Root Cause
**The environment variable `VITE_API_BASE_URL` is not set during production build.**

When not set, the app defaults to `/api` which tries to call your frontend domain instead of the backend.

## Solution Steps

### Step 1: Verify the Issue
1. Open your deployed site
2. Open Browser DevTools Console (F12)
3. Look for this log message:
   ```
   🌐 API Configuration: {
     VITE_API_BASE_URL: undefined,    ← ❌ This should NOT be undefined!
     API_BASE_URL: '/api',
     mode: 'production',
     isProd: true
   }
   ```

If `VITE_API_BASE_URL` is `undefined`, that's the problem!

### Step 2: Set Environment Variable (Choose Your Platform)

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://tconsolutions-64307221061.asia-south1.run.app/api`
   - **Environment**: Production (and Preview if needed)
3. Click "Save"
4. Redeploy: Deployments → Click "..." → Redeploy

#### Netlify
1. Site Settings → Build & Deploy → Environment
2. Click "Edit variables"
3. Add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://tconsolutions-64307221061.asia-south1.run.app/api`
4. Trigger new deployment

#### GitHub Actions / CI/CD
Add to your workflow file (`.github/workflows/*.yml`):
```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_BASE_URL: https://tconsolutions-64307221061.asia-south1.run.app/api
```

#### Local Build for Static Hosting
Use the new build script:
```bash
npm run build:production
```

This will create a production build with the API URL embedded.

### Step 3: Verify the Fix
After redeploying:

1. **Clear browser cache** (Important!)
2. Open deployed site
3. Check console for:
   ```
   🌐 API Configuration: {
     VITE_API_BASE_URL: 'https://tconsolutions-64307221061.asia-south1.run.app/api',  ← ✅ Should have value!
     API_BASE_URL: 'https://tconsolutions-64307221061.asia-south1.run.app/api',
     mode: 'production',
     isProd: true
   }
   ```

4. Try logging in and check console:
   ```
   🔐 Attempting login with empId: EMP-XXXX
   🔗 API URL: https://tconsolutions-64307221061.asia-south1.run.app/api/auth/login
   📡 Login response status: 200 OK
   📦 Login response data: { id: ..., empId: ..., empRole: ... }
   ✅ User data created: { ... }
   ✅ User saved to localStorage
   ```

5. Check localStorage:
   - DevTools → Application → Storage → Local Storage
   - Should see `user` key with JSON value

## Alternative Solutions

### Option A: Use Build Script (No Platform Config Needed)
```bash
# Build with environment variable
npm run build:production

# Upload the dist/ folder to your hosting
```

### Option B: Hardcode for Quick Fix (Not Recommended)
Update `src/lib/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || (import.meta.env.PROD 
    ? 'https://tconsolutions-64307221061.asia-south1.run.app/api' 
    : '/api');
```

This bypasses the need for environment variables but is less flexible.

## Common Mistakes

### ❌ Setting variable AFTER build
```bash
# Wrong - variable set too late!
npm run build
export VITE_API_BASE_URL=https://...
```

### ✅ Setting variable BEFORE/DURING build
```bash
# Correct - variable available during build
export VITE_API_BASE_URL=https://...
npm run build

# Or in one line
VITE_API_BASE_URL=https://... npm run build
```

### ❌ Wrong variable name
```env
API_BASE_URL=https://...          ← ❌ Missing VITE_ prefix
REACT_APP_API_URL=https://...     ← ❌ Wrong prefix (React, not Vite)
```

### ✅ Correct variable name
```env
VITE_API_BASE_URL=https://...     ← ✅ Correct!
```

### ❌ Setting in .env.local (gitignored)
If you commit only `.env.local`, it won't be available in deployment!

### ✅ Set in deployment platform
Each hosting platform has its own environment variable interface.

## How Vite Environment Variables Work

1. **Build Time**: Vite reads `VITE_*` variables and embeds them in the JavaScript bundle
2. **Runtime**: The embedded value is used (cannot be changed without rebuild)

This means:
- Variables must be set BEFORE building
- Changing variables requires rebuilding and redeploying
- Different from traditional server-side environment variables

## Quick Diagnostic Command

Run this locally to test:
```bash
# Build with production API
npm run build:production

# Serve the built files locally
npm run preview

# Open http://localhost:4173 and test login
```

Check console logs to verify it's using the correct API URL.

## Still Not Working?

### Check 1: CORS Configuration
Your backend must allow requests from your frontend domain:
```
Access-Control-Allow-Origin: https://your-frontend-domain.com
```

### Check 2: Network Tab
1. DevTools → Network
2. Try to login
3. Find the `/auth/login` request
4. Check:
   - **Request URL**: Should be `https://tconsolutions-64307221061.asia-south1.run.app/api/auth/login`
   - **Status**: Should be `200`
   - **Response**: Should be JSON, not HTML

### Check 3: Response Structure
The backend must return:
```json
{
  "id": 123,
  "empId": "EMP-1001",
  "empRole": "Manager",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

Missing `id`, `empId`, or `empRole` will cause login to fail.

## Debug Checklist

- [ ] Environment variable `VITE_API_BASE_URL` is set in hosting platform
- [ ] Site has been redeployed after setting variable
- [ ] Browser cache cleared
- [ ] Console shows correct API_BASE_URL value
- [ ] Network tab shows requests going to correct URL
- [ ] API response is JSON, not HTML
- [ ] API response contains required fields
- [ ] No CORS errors in console
- [ ] localStorage is not blocked by browser settings

## Contact Support

If all else fails, share these from your deployed site:
1. Screenshot of console showing API Configuration log
2. Screenshot of Network tab showing login request/response
3. Screenshot of localStorage (Application tab)
4. Your hosting platform name

## Quick Reference

**Environment Variable Name**: `VITE_API_BASE_URL`
**Required Value**: `https://tconsolutions-64307221061.asia-south1.run.app/api`
**Must be set**: BEFORE building, in your CI/CD or hosting platform
**Check works**: Console should show the URL, not `undefined`
