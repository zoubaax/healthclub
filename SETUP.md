# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd health
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details and wait for it to be created

## Step 3: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 4: Create Environment File

Create a `.env` file in the `health` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

## Step 5: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned"

## Step 6: Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under "Auth Providers", make sure **Email** is enabled
3. Go to **Authentication** → **Users**
4. Click "Add user" → "Create new user"
5. Enter an email and password (remember these for admin login)
6. Click "Create user"

## Step 7: Add Admin User to Database

1. Go back to **SQL Editor**
2. Run this query (replace with your admin email):

```sql
INSERT INTO admin_users (email) VALUES ('your-admin-email@example.com');
```

## Step 8: Set Up Storage for Doctor Images (Optional but Recommended)

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"**
3. Name it: `doctor-images`
4. Make it **Public** (or set up RLS policies)
5. Click **"Create bucket"**
6. Go to **SQL Editor** and run the SQL from `setup-storage.sql` to set up storage policies

**Note:** If you skip this step, you can still use image URLs instead of uploading files.

## Step 9: Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 10: Test the Application

### As Admin:
1. Go to `http://localhost:5173/admin/login`
2. Log in with the email and password you created
3. Add a doctor in the "Doctors" section
4. Add time slots for that doctor in the "Time Slots" section

### As User:
1. Go to `http://localhost:5173`
2. You should see the doctor you added
3. Click "Book Session"
4. Select a date and time
5. Fill in your information and book

## Troubleshooting

### "Invalid API key" error
- Make sure your `.env` file has the correct Supabase URL and anon key
- Restart the dev server after creating/updating `.env`

### "relation does not exist" error
- Make sure you ran the `supabase-schema.sql` script completely
- Check that all tables were created in the **Table Editor**

### Can't log in as admin / "Access denied. Admin privileges required"
1. **First, verify the RLS policy exists:**
   - Go to Supabase Dashboard → SQL Editor
   - Run the SQL from `fix-admin-access.sql` file
   - This adds the necessary policy to allow admin checks

2. **Verify your email is in admin_users table:**
   - Go to Supabase Dashboard → Table Editor → admin_users
   - Check that your email exists in the table
   - If not, add it:
     ```sql
     INSERT INTO admin_users (email) VALUES ('your-email@example.com');
     ```

3. **Verify you created the user in Authentication:**
   - Go to Authentication → Users
   - Make sure your email exists there
   - If not, create it with "Add user" → "Create new user"

4. **Make sure you're using the correct email and password**

### No doctors showing up
- Make sure you added at least one doctor in the admin panel
- Check the browser console for any errors

### Image upload not working / HTTP2 Protocol Error
1. **Verify storage bucket exists:**
   - Go to Supabase Dashboard → Storage
   - Check if `doctor-images` bucket exists
   - If not, create it (make it public)

2. **Check storage policies:**
   - Run the SQL from `setup-storage.sql`
   - Or manually set policies in Storage → Policies

3. **Verify you're logged in:**
   - Make sure you're logged in as admin
   - Check that your email is in `admin_users` table

4. **Check browser console:**
   - Open DevTools (F12) → Console tab
   - Look for specific error messages
   - See TROUBLESHOOTING.md for detailed solutions

5. **Common fixes:**
   - Restart dev server after creating bucket
   - Clear browser cache
   - Check Supabase status: https://status.supabase.com

## Next Steps

- Add more doctors and time slots
- Customize the styling if needed
- Set up Supabase Storage for image uploads (see README.md)
- Configure email notifications (requires additional Supabase setup)

