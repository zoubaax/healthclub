# Troubleshooting Guide

## HTTP2 Protocol Error (ERR_HTTP2_PROTOCOL_ERROR)

This error typically occurs when there's an issue with the Supabase Storage connection. Here's how to fix it:

### Step 1: Verify Storage Bucket Exists

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Check if a bucket named `doctor-images` exists
4. If it doesn't exist:
   - Click **"New bucket"**
   - Name it: `doctor-images`
   - Make it **Public** (or configure RLS policies)
   - Click **"Create bucket"**

### Step 2: Check Storage Policies

1. Go to **Storage** → **Policies** (or run SQL from `setup-storage.sql`)
2. Make sure these policies exist:
   - Public can view doctor images (SELECT)
   - Admins can upload doctor images (INSERT)
   - Admins can update doctor images (UPDATE)
   - Admins can delete doctor images (DELETE)

### Step 3: Verify Supabase Configuration

1. Check your `.env` file has correct values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Restart your dev server after updating `.env`:
   ```bash
   npm run dev
   ```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for specific error messages
4. Common errors:
   - "Bucket not found" → Create the storage bucket
   - "new row violates row-level security" → Run storage policies SQL
   - "Network error" → Check internet connection and Supabase status

### Step 5: Test Storage Connection

1. In Supabase Dashboard → **Storage** → `doctor-images`
2. Try uploading a test file manually
3. If manual upload works, the issue is with the code
4. If manual upload fails, check bucket permissions

### Step 6: Alternative Solutions

**Option A: Make Bucket Public**
- Go to Storage → `doctor-images` → Settings
- Enable "Public bucket"
- This allows anyone to read files

**Option B: Check RLS Policies**
- Run the SQL from `setup-storage.sql`
- Verify policies are created correctly
- Check that your admin email is in `admin_users` table

**Option C: Network Issues**
- Try a different network
- Check if Supabase is accessible: https://status.supabase.com
- Clear browser cache and cookies

### Step 7: Verify Authentication**

Make sure you're logged in as admin:
1. Go to `/admin/login`
2. Log in with your admin credentials
3. Try uploading an image again

## Other Common Errors

### "Bucket not found"
- Create the `doctor-images` bucket in Supabase Storage
- Make sure the name is exactly `doctor-images` (case-sensitive)

### "Permission denied" / "Row-level security"
- Run the SQL from `setup-storage.sql`
- Verify you're logged in as admin
- Check that your email is in `admin_users` table

### "File too large"
- Reduce image size to under 5MB
- Compress the image before uploading

### Images not displaying
- Check that the bucket is public
- Verify the image URL is correct
- Check browser console for CORS errors

## Still Having Issues?

1. Check Supabase status: https://status.supabase.com
2. Review Supabase logs in Dashboard → Logs
3. Check browser Network tab for failed requests
4. Verify all setup steps in SETUP.md were completed

