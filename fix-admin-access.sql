-- Fix for "Access denied. Admin privileges required" error
-- Run this in your Supabase SQL Editor if you're getting the access denied error

-- Add policy to allow users to check if they are admin
CREATE POLICY "Users can check if they are admin" ON admin_users
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email
  );

-- If the policy already exists, you can drop it first and recreate:
-- DROP POLICY IF EXISTS "Users can check if they are admin" ON admin_users;
-- Then run the CREATE POLICY above

