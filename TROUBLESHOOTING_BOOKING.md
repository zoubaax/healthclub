# Troubleshooting Booking Errors

If you're getting "Error booking appointment. Please try again." here are common causes and solutions:

## Common Issues

### 1. RLS (Row Level Security) Policy Issues

**Problem:** The database RLS policies might be blocking appointment creation or reading.

**Solution:** Verify your RLS policies in Supabase:

```sql
-- Check if the policy exists
SELECT * FROM pg_policies WHERE tablename = 'appointments';

-- If missing, create the policy:
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);
```

### 2. Time Slot Already Booked

**Problem:** Someone else booked the time slot between when you selected it and submitted the form.

**Solution:** The system now checks if the slot is still available before booking. If you see this error, simply select another available time slot.

### 3. Invalid Doctor or Time Slot ID

**Problem:** The doctor ID or time slot ID might be invalid or deleted.

**Solution:** 
- Refresh the page
- Make sure the doctor and time slots still exist in the database
- Try booking again

### 4. Missing Required Fields

**Problem:** Some required fields might be empty or invalid.

**Solution:** Make sure all required fields are filled:
- First Name
- Last Name
- Email (valid email format)
- Phone Number
- Date and Time selected

### 5. Database Connection Issues

**Problem:** Supabase connection might be down or credentials incorrect.

**Solution:**
- Check your `.env` file has correct Supabase credentials
- Verify Supabase project is active
- Check browser console for connection errors

### 6. Email Service Errors (Non-blocking)

**Note:** Email notification errors won't prevent booking. If emails aren't being sent:
- Check `EMAIL_SETUP.md` for EmailJS configuration
- Verify environment variables are set
- Check browser console for email service warnings

## Debugging Steps

1. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab
   - The error message will show the specific issue

2. **Check Supabase Dashboard**
   - Go to your Supabase project
   - Check the Logs section for database errors
   - Verify tables and RLS policies are set up correctly

3. **Verify Database Schema**
   - Run the SQL from `supabase-schema.sql` in Supabase SQL Editor
   - Make sure all tables and policies exist

4. **Test with Simple Data**
   - Try booking with minimal required fields
   - Use a simple email format
   - Select a time slot that's definitely available

## Quick Fix: Reset RLS Policies

If RLS is causing issues, you can temporarily disable it for testing (NOT recommended for production):

```sql
-- DISABLE RLS (FOR TESTING ONLY)
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

## Still Having Issues?

1. Check the browser console for the exact error message
2. Verify all environment variables are set correctly
3. Ensure Supabase project is active and accessible
4. Check that database schema matches `supabase-schema.sql`

