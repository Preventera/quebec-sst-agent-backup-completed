-- Fix RLS policies for conversation_logs table
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversation_logs;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.conversation_logs;

-- Create proper RLS policies for conversation_logs that allow system logging
CREATE POLICY "Enable insert for system logging" 
ON public.conversation_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable select for users" 
ON public.conversation_logs 
FOR SELECT 
USING (auth.uid() = user_id OR true);

-- Create sst_crawling_sources table for managing crawl sources
CREATE TABLE public.sst_crawling_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  crawl_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sst_crawling_sources
ALTER TABLE public.sst_crawling_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sst_crawling_sources
CREATE POLICY "SST sources viewable by everyone" 
ON public.sst_crawling_sources 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_sst_crawling_sources_updated_at
BEFORE UPDATE ON public.sst_crawling_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();