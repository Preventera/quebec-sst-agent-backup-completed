-- Add enhanced crawling columns to sst_sources
ALTER TABLE sst_sources ADD COLUMN IF NOT EXISTS crawling_depth INTEGER DEFAULT 2;
ALTER TABLE sst_sources ADD COLUMN IF NOT EXISTS supports_pdf BOOLEAN DEFAULT false;
ALTER TABLE sst_sources ADD COLUMN IF NOT EXISTS use_firecrawl BOOLEAN DEFAULT false;
ALTER TABLE sst_sources ADD COLUMN IF NOT EXISTS total_content_crawled INTEGER DEFAULT 0;

-- Add enhanced content columns to sst_crawled_content
ALTER TABLE sst_crawled_content ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE sst_crawled_content ADD COLUMN IF NOT EXISTS semantic_category TEXT;
ALTER TABLE sst_crawled_content ADD COLUMN IF NOT EXISTS importance INTEGER DEFAULT 1;
ALTER TABLE sst_crawled_content ADD COLUMN IF NOT EXISTS sector TEXT;

-- Create notifications table
CREATE TABLE IF NOT EXISTS sst_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('NEW', 'UPDATED', 'CRITICAL_CHANGE')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  importance INTEGER NOT NULL DEFAULT 1 CHECK (importance >= 1 AND importance <= 5),
  affected_sectors TEXT[],
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE sst_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view notifications" ON sst_notifications FOR SELECT USING (true);
CREATE POLICY "System can create notifications" ON sst_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update notification status" ON sst_notifications FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sst_crawled_content_keywords ON sst_crawled_content USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_sst_crawled_content_semantic_category ON sst_crawled_content(semantic_category);
CREATE INDEX IF NOT EXISTS idx_sst_crawled_content_importance ON sst_crawled_content(importance);
CREATE INDEX IF NOT EXISTS idx_sst_crawled_content_sector ON sst_crawled_content(sector);
CREATE INDEX IF NOT EXISTS idx_sst_notifications_type ON sst_notifications(type);
CREATE INDEX IF NOT EXISTS idx_sst_notifications_importance ON sst_notifications(importance);
CREATE INDEX IF NOT EXISTS idx_sst_notifications_created_at ON sst_notifications(created_at);

-- Update trigger for notifications
CREATE TRIGGER update_sst_notifications_updated_at
    BEFORE UPDATE ON sst_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing sources with enhanced settings
UPDATE sst_sources SET 
  supports_pdf = true,
  use_firecrawl = false,
  crawling_depth = CASE 
    WHEN source_type = 'legislation' THEN 3
    WHEN source_type = 'cnesst' THEN 2
    WHEN source_type = 'irsst' THEN 2
    ELSE 1
  END
WHERE id IS NOT NULL;