-- Add video_url column to education table
ALTER TABLE public.education ADD COLUMN video_url text;

-- Create storage bucket for education videos
INSERT INTO storage.buckets (id, name, public) VALUES ('education-videos', 'education-videos', true);

-- Storage policies for education videos
CREATE POLICY "Education videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'education-videos');

CREATE POLICY "Admins can upload education videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'education-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete education videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'education-videos' AND public.has_role(auth.uid(), 'admin'));