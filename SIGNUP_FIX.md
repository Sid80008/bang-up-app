# Sign-Up Issue - Fix Guide

## Problem
New users cannot sign up - authentication fails or redirects incorrectly.

## Root Causes & Solutions

### 1. ✅ **Auth Component Fix (Applied)**
The Login.tsx has been updated to:
- Use proper SSR-safe redirect URL initialization
- Add proper subscription cleanup
- Add delay for session establishment
- Conditional rendering of Auth component

**Status:** ✅ Fixed in code

### 2. **Email Confirmation Setting (MUST FIX IN SUPABASE)**

Supabase has email confirmation **enabled by default**, which blocks new sign-ups.

**Steps to disable:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **bang-up-app**
3. Navigate to: **Authentication** → **Providers** → **Email**
4. Find the setting: **Confirm email**
5. **Disable** this toggle
6. Click **Save**

**Why?** Without this fix:
- New users complete sign-up but get "Check your email" message
- They must confirm email to complete registration
- If they skip, signup appears broken

---

### 3. **Verify Supabase Project URL (Already Set)**

Your Supabase configuration is correct:
- URL: `https://mmzkburlufghwefdilbp.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ✅

---

### 4. **Database Tables Required**

Make sure these tables exist in your Supabase:

```sql
-- Profiles table (core)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  age integer,
  gender text,
  sexual_orientation text,
  -- ... other fields
  created_at timestamp default now()
);

-- Enable RLS if needed
alter table profiles enable row level security;
```

**Status:** Check your Supabase SQL Editor to confirm

---

## Testing the Fix

1. **Disable email confirmation** in Supabase settings (see step 2 above)
2. Rebuild the app: `npm run build`
3. Deploy: `npm run vercel`
4. Visit: https://bang-up-app.vercel.app
5. Click "Sign up"
6. Enter email and password
7. Click "Sign up" button
8. **Should redirect to profile setup immediately**

---

## Troubleshooting

### Still not working after disabling email confirmation?

Check browser console for errors:
1. Open https://bang-up-app.vercel.app
2. Press `F12` (Developer Tools)
3. Go to **Console** tab
4. Look for red errors
5. Report those errors

### Possible errors:

**Error: "Invalid redirect URL"**
- Solution: Check Supabase Dashboard → Authentication → URL Configuration
- Add `https://bang-up-app.vercel.app` to allowed URLs

**Error: "Auth session not found"**
- Solution: Clear browser cache and cookies, try again

**Error: "PostgreSQL error"**
- Solution: Your `profiles` table might be missing
- Run the SQL schema from [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md#database-schema)

---

## Key Changes Made to Code

**File: `src/pages/Login.tsx`**
- ✅ Added `redirectUrl` state for SSR-safe initialization
- ✅ Use `redirectUrl` instead of `window.location.origin`
- ✅ Added 500ms delay for session establishment
- ✅ Improved subscription cleanup
- ✅ Added console logging for debugging

---

## Next Steps

1. **Immediate:** Go to Supabase Dashboard and disable email confirmation ⚠️
2. Rebuild and redeploy: `npm run build && vercel --prod`
3. Test new sign-ups
4. If still failing, check browser console errors (F12)

---

**Questions?** Check [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for complete Supabase setup.
