-- Création des tables pour le système de crawling SST
CREATE TABLE public.sst_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('LMRSST', 'RSST', 'CNESST_GUIDE', 'CNESST_BULLETIN', 'JURISPRUDENCE', 'PUBLICATION_QUEBEC')),
  crawl_frequency INTEGER NOT NULL DEFAULT 86400, -- en secondes, défaut: 24h
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour stocker le contenu crawlé
CREATE TABLE public.sst_crawled_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.sst_sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT NOT NULL,
  content_hash TEXT NOT NULL, -- Pour détecter les changements
  article_number TEXT, -- Numéro d'article de loi le cas échéant
  section TEXT, -- Section/chapitre
  tags TEXT[], -- Tags pour la recherche
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour tracker les changements détectés
CREATE TABLE public.sst_content_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.sst_crawled_content(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('NEW', 'UPDATED', 'DELETED')),
  previous_content TEXT,
  new_content TEXT,
  summary TEXT, -- Résumé automatique du changement
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN NOT NULL DEFAULT false
);

-- Activation RLS
ALTER TABLE public.sst_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sst_crawled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sst_content_changes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour accès public en lecture
CREATE POLICY "Sources SST viewable by everyone" 
ON public.sst_sources 
FOR SELECT 
USING (true);

CREATE POLICY "Contenu SST crawlé viewable by everyone" 
ON public.sst_crawled_content 
FOR SELECT 
USING (true);

CREATE POLICY "Changements SST viewable by everyone" 
ON public.sst_content_changes 
FOR SELECT 
USING (true);

-- Index pour les performances
CREATE INDEX idx_sst_sources_active ON public.sst_sources(is_active, last_crawled_at);
CREATE INDEX idx_sst_content_source ON public.sst_crawled_content(source_id);
CREATE INDEX idx_sst_content_hash ON public.sst_crawled_content(content_hash);
CREATE INDEX idx_sst_content_tags ON public.sst_crawled_content USING GIN(tags);
CREATE INDEX idx_sst_changes_detected ON public.sst_content_changes(detected_at);

-- Trigger pour updated_at
CREATE TRIGGER update_sst_sources_updated_at
BEFORE UPDATE ON public.sst_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer les sources principales à crawler
INSERT INTO public.sst_sources (name, url, source_type, crawl_frequency) VALUES
('LMRSST - Loi sur les mécanismes de règlement', 'https://www.legisquebec.gouv.qc.ca/fr/document/lc/M-1.01', 'LMRSST', 86400),
('RSST - Règlement sur la santé et la sécurité du travail', 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/S-2.1,%20r.%2013', 'RSST', 86400),
('CNESST - Guide de prévention', 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite', 'CNESST_GUIDE', 172800),
('CNESST - Bulletins d''interprétation', 'https://www.cnesst.gouv.qc.ca/fr/organisation/documentation/formulaires-publications/bulletins-interpretation', 'CNESST_BULLETIN', 604800),
('Publications Québec - SST', 'https://www.publicationsduquebec.gouv.qc.ca/recherche.php?domaine=sst', 'PUBLICATION_QUEBEC', 172800);