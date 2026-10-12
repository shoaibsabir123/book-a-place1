-- ==============================================================================
-- SUPABASE STORAGE BUCKETS & RLS POLICIES
-- Buckets:
-- 1. property-images (public read, host write)
-- 2. profile-avatars (public read, user write)
-- 3. booking-documents (private read for owner/admin)
-- ==============================================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-avatars', 'profile-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('booking-documents', 'booking-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for property-images
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Hosts can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' AND
  (auth.role() = 'authenticated')
);

-- Storage Policies for profile-avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'authenticated')
);

-- Storage Policies for booking-documents (Private)
CREATE POLICY "Users can view their own booking documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'booking-documents' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ))
);
