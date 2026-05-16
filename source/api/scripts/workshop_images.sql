-- =============================================
-- WORKSHOP IMAGES GALLERY
-- =============================================
-- Mỗi workshop có tối đa 5 ảnh, lưu CDN URL
-- để truy cập qua Cloudflare CDN thay vì S3 trực tiếp
-- =============================================

CREATE TABLE IF NOT EXISTS workshop_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  cdn_thumb TEXT NOT NULL,
  cdn_medium TEXT NOT NULL,
  cdn_large TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workshop_images_workshop
  ON workshop_images(workshop_id);

CREATE INDEX IF NOT EXISTS idx_workshop_images_sort
  ON workshop_images(workshop_id, sort_order);
