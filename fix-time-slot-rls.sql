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

-- Note: Public users still cannot INSERT or DELETE time slots (only admins can)

