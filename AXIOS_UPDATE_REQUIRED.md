# Critical Update Required - Axios Files

## Files Still Using Old Axios Pattern

The following files need to be updated to use the new `apiClient` from `src/lib/apiClient.js`:

### HR Pages
1. `src/pages/HR/OnboardingPage.jsx`
2. `src/pages/HR/EmployeeDirectoryPage.jsx`
3. `src/pages/HR/AttendanceManagementPage.jsx`

### Manager Pages
4. `src/pages/Manager/AttendanceSalaryPage.jsx`
5. `src/pages/Manager/EmployeesPage.jsx`

## Update Pattern

### Before:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

// API calls
api.get(`/api/employees`).then(r => r.data)
```

### After:
```javascript
import apiClient from '../../lib/apiClient';

const api = apiClient;

// API calls - REMOVE /api/ prefix!
api.get(`/employees`).then(r => r.data)
```

## Important Notes

1. **Remove `/api/` prefix** from all axios calls (e.g., `/api/employees` → `/employees`)
2. The `apiClient` already includes the base URL from environment variable
3. API calls will automatically use `VITE_API_BASE_URL`

## Files Already Updated
✅ `src/pages/Manager/AllTasksPage.jsx`
✅ `src/pages/Manager/TaskHistoryPage.jsx`
✅ `src/pages/Manager/AssignTaskPage.jsx`

## Quick Fix Commands

To find all remaining `/api/` prefixes in axios calls:

```bash
# Search for axios get calls
grep -r "api.get(\`/api/" src/pages/

# Search for axios post calls  
grep -r "api.post('/api/" src/pages/

# Search for axios put calls
grep -r "api.put('/api/" src/pages/

# Search for axios delete calls
grep -r "api.delete('/api/" src/pages/
```

## Why This Is Important

Without these updates, the HR and some Manager pages will:
- ❌ Not use the environment variable `VITE_API_BASE_URL`
- ❌ Try to call `/api/employees` on your frontend domain
- ❌ Fail in production deployment
- ❌ Return HTML error pages instead of JSON

## Build Status

⚠️ **Do not deploy until all axios files are updated!**

Run this after updates:
```bash
npm run build:production
```
