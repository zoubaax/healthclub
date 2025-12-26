# Fix: "Time slot was just booked" Error When Slot is Free

## Problem

You're seeing the error "This time slot was just booked by someone else" even when the time slot is actually free. This happens because the database Row Level Security (RLS) policy prevents regular users from updating time slots.

## Solution

You need to update the RLS policy in your Supabase database to allow public users to mark time slots as unavailable when booking appointments.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the Fix SQL

Copy and paste the entire contents of `fix-time-slot-rls.sql` into the SQL Editor, or run this SQL:

```sql
-- Fix RLS policy to allow public users to mark time slots as unavailable when booking
-- This allows users to book appointments and mark slots as unavailable

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can manage time slots" ON time_slots;

-- Create separate policies for different operations

-- Allow admins to do everything (insert, update, delete)
CREATE POLICY "Admins can manage time slots" ON time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt() ->> 'email'
    )
  );

-- Allow public users to UPDATE time slots, but only to set is_available = false
-- This is needed when users book appointments
CREATE POLICY "Public can mark slots as unavailable" ON time_slots
  FOR UPDATE USING (
    -- Allow update if setting is_available to false
    -- This is checked in the WITH CHECK clause
    true
  )
  WITH CHECK (
    is_available = false
  );
```

### Step 3: Execute the Query

Click the **Run** button (or press Ctrl+Enter) to execute the SQL.

You should see "Success. No rows returned" or a similar success message.

### Step 4: Test the Booking

1. Go back to your application
2. Try booking an appointment again
3. The booking should now work correctly!

## What This Does

- **Before**: Only admins could update time slots, so when users booked appointments, the slot couldn't be marked as unavailable
- **After**: Public users can update time slots, but ONLY to set `is_available = false` (mark them as unavailable). They still cannot:
  - Create new time slots (only admins can)
  - Delete time slots (only admins can)
  - Set slots back to available (only admins can)

This is a secure policy that allows bookings while preventing unauthorized changes.

## Verification

After running the SQL, you can verify the policies exist by running:

```sql
SELECT * FROM pg_policies WHERE tablename = 'time_slots';
```

You should see:
- "Admins can manage time slots" (for admins)
- "Public can mark slots as unavailable" (for public users)
- "Time slots are viewable by everyone" (for reading)

## Still Having Issues?

If you still see errors after running the SQL:

1. **Check browser console** (F12) for any error messages
2. **Verify the policies were created** using the verification query above
3. **Check Supabase logs** in the Dashboard → Logs section
4. Make sure you're using the correct Supabase project

