-- Setup Supabase Storage for Doctor Images
-- Run this in your Supabase SQL Editor after creating the storage bucket

-- Note: You need to create the storage bucket first through the Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it "doctor-images"
-- 4. Make it public (or set up proper RLS policies)
-- 5. Then run the policies below

-- Storage policies for doctor-images bucket
-- These allow admins to upload and manage images

-- Allow public read access (so images can be displayed)
CREATE POLICY "Public can view doctor images"
ON storage.objects FOR SELECT
USING (bucket_id = 'doctor-images');

-- Allow authenticated admins to upload images
CREATE POLICY "Admins can upload doctor images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'doctor-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

-- Allow authenticated admins to update images
CREATE POLICY "Admins can update doctor images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'doctor-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

-- Allow authenticated admins to delete images
CREATE POLICY "Admins can delete doctor images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'doctor-images' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);

