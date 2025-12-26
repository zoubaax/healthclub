# Verify Storage Setup

If you're getting "bucket not found" errors even after creating the bucket, follow these steps:

## Step 1: Verify Bucket Exists

1. Go to Supabase Dashboard
2. Click **Storage** in the left sidebar
3. You should see a list of buckets
4. Look for `doctor-images` (exact name, case-sensitive)
5. If you don't see it, create it:
   - Click **"New bucket"**
   - Name: `doctor-images` (exactly this, no spaces, lowercase with hyphen)
   - Make it **Public** (toggle the "Public bucket" switch)
   - Click **"Create bucket"**

## Step 2: Check Bucket Settings

1. Click on the `doctor-images` bucket
2. Go to **Settings** tab
3. Verify:
   - **Public bucket**: Should be enabled (ON)
   - **File size limit**: Should be at least 5MB
   - **Allowed MIME types**: Should allow images (or leave empty for all)

## Step 3: Test Manual Upload

1. In the `doctor-images` bucket, click **"Upload file"**
2. Try uploading a small test image
3. If this works, the bucket is set up correctly
4. If this fails, check the error message

## Step 4: Check Storage Policies

1. Go to **Storage** → **Policies** (or run SQL)
2. Run the SQL from `setup-storage.sql`
3. Or manually check that policies exist for `doctor-images` bucket

## Step 5: Verify Authentication

1. Make sure you're logged in as admin in the app
2. Go to `/admin/login` and log in
3. Check browser console (F12) for any auth errors

## Step 6: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try uploading an image
4. Look for error messages
5. The new code will show available buckets if listing works

## Common Issues

### Bucket name mismatch
- Must be exactly: `doctor-images`
- No spaces, no capital letters (except as shown)
- Check for typos

### Bucket not public
- Go to bucket Settings
- Enable "Public bucket"
- This allows the app to read images

### Permissions issue
- Run the SQL from `setup-storage.sql`
- Make sure you're logged in as admin
- Check that your email is in `admin_users` table

### Still not working?
1. Delete the bucket and recreate it
2. Make sure it's public from the start
3. Run the storage policies SQL again
4. Clear browser cache and try again

