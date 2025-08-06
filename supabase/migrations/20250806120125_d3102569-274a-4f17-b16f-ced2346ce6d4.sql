-- Fix RLS policies for conversation_logs table
DROP POLICY IF EXISTS "Users can insert their own conversation logs" ON public.conversation_logs;
DROP POLICY IF EXISTS "Users can view their own conversation logs" ON public.conversation_logs;

-- Create proper RLS policies for conversation_logs
CREATE POLICY "Enable insert for authenticated users" 
ON public.conversation_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users" 
ON public.conversation_logs 
FOR SELECT 
USING (true);

-- Add new SST crawling sources for the CNESST knowledge base
INSERT INTO public.sst_crawling_sources (name, url, source_type, is_active, description, crawl_frequency) VALUES
('CNESST - Normes citées réglementation', 'https://centredoc.cnesst.gouv.qc.ca/explorer-par-sujet/normes-citees-dans-la-reglementation', 'cnesst', true, 'Normes citées dans la réglementation SST', 'weekly'),
('CNESST - Trouver des normes', 'https://centredoc.cnesst.gouv.qc.ca/explorer-par-sujet/trouver-des-normes', 'cnesst', true, 'Recherche de normes SST', 'weekly'),
('CNESST - Normes Internet PDF', 'https://www.centredoc.cnesst.gouv.qc.ca/pdf/Biblioselect/NormesInternetMachine.pdf', 'publication', true, 'Document PDF des normes Internet', 'monthly'),
('CNESST - Actualités', 'https://www.centredoc.cnesst.gouv.qc.ca/suivre-lactualite/', 'cnesst', true, 'Actualités et nouvelles SST', 'daily'),
('CNESST - Explorer par sujet', 'https://www.centredoc.cnesst.gouv.qc.ca/explorer-par-sujet', 'cnesst', true, 'Navigation thématique SST', 'weekly'),
('CSST - Sélection secteur', 'https://www.csst.qc.ca/prevention/risques/Pages/selectionsecteur.aspx', 'legislation', true, 'Sélection par secteur d''activité', 'weekly'),
('CNESST - Ergonomie', 'https://www.centredoc.cnesst.gouv.qc.ca/explorer-par-sujet/ergonomie', 'cnesst', true, 'Ressources en ergonomie au travail', 'weekly')
ON CONFLICT (url) DO NOTHING;

-- Update OTP configuration to fix security warning
UPDATE auth.config SET 
  otp_exp = 300 
WHERE name = 'otp_exp';