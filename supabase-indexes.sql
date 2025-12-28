-- ============================================
-- Supabase Database Indexes for Performance
-- ============================================
-- 
-- Run these SQL commands in your Supabase SQL Editor
-- to optimize query performance for the doctors table
--
-- Instructions:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste these commands
-- 4. Execute them one by one or all at once
-- ============================================

-- Index for ordering by created_at (used in DoctorListing)
-- This speeds up the ORDER BY created_at DESC query
CREATE INDEX IF NOT EXISTS idx_doctors_created_at_desc 
ON doctors(created_at DESC);

-- Index for filtering by specialty (if you add filtering later)
-- This speeds up WHERE specialty = 'X' queries
CREATE INDEX IF NOT EXISTS idx_doctors_specialty 
ON doctors(specialty) 
WHERE specialty IS NOT NULL;

-- Composite index for common query patterns
-- Useful if you filter by specialty AND order by created_at
CREATE INDEX IF NOT EXISTS idx_doctors_specialty_created_at 
ON doctors(specialty, created_at DESC) 
WHERE specialty IS NOT NULL;

-- Index for full-text search on name fields (if you add search)
-- This enables fast text search on doctor names
CREATE INDEX IF NOT EXISTS idx_doctors_name_search 
ON doctors USING gin(to_tsvector('english', 
  coalesce(first_name, '') || ' ' || coalesce(last_name, '')
));

-- Index for active/available doctors (if you add status field)
-- Uncomment if you add a status or is_active column:
-- CREATE INDEX IF NOT EXISTS idx_doctors_active 
-- ON doctors(is_active) 
-- WHERE is_active = true;

-- Index for profile picture URL (helps with image loading queries)
-- This can help if you query by profile_picture_url
CREATE INDEX IF NOT EXISTS idx_doctors_profile_picture 
ON doctors(profile_picture_url) 
WHERE profile_picture_url IS NOT NULL;

-- ============================================
-- Performance Tips:
-- ============================================
-- 1. Monitor query performance in Supabase Dashboard > Database > Query Performance
-- 2. Use EXPLAIN ANALYZE to see which indexes are being used
-- 3. Don't over-index - each index adds write overhead
-- 4. Consider partial indexes (with WHERE clauses) for filtered queries
-- 5. Rebuild indexes periodically if you have heavy write operations:
--    REINDEX INDEX idx_doctors_created_at_desc;
-- ============================================

-- ============================================
-- Verify Indexes:
-- ============================================
-- Run this query to see all indexes on the doctors table:
-- 
-- SELECT 
--   indexname, 
--   indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'doctors';
-- ============================================

