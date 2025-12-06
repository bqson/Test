-- Create storage buckets for images
-- Run this in Supabase SQL Editor

-- Create buckets (if not exists - handled by Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('destinations', 'destinations', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('groups', 'groups', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'images' bucket
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('images', 'destinations', 'groups', 'avatars'));

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('images', 'destinations', 'groups', 'avatars')
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('images', 'destinations', 'groups', 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('images', 'destinations', 'groups', 'avatars')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

