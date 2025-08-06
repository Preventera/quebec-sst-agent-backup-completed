-- Add new SST crawling sources for the CNESST knowledge base
INSERT INTO public.sst_crawling_sources (name, url, source_type, is_active, description, crawl_frequency) VALUES
('CNESST - Normes citées réglementation', 'https://centredoc.cnesst.gouv.qc.ca/explorer-par-sujet/normes-citees-dans-la-reglementation', 'cnesst', true, 'Normes citées dans la réglementation SST', 'weekly'),
('CNESST - Trouver des normes', 'https://centredoc.cnesst.gouv.qc.ca/explorer-par-sujet/trouver-des-normes', 'cnesst', true, 'Recherche de normes SST', 'weekly'),
('CNESST - Normes Internet PDF', 'https://www.centredoc.cnesst.gouv.qc.ca/pdf/Biblioselect/NormesInternetMachine.pdf', 'publication', true, 'Document PDF des normes Internet', 'monthly'),
('CNESST - Actualités', 'https://www.centredoc.cnesst.gouv.qc.ca/suivre-lactualite/', 'cnesst', true, 'Actualités et nouvelles SST', 'daily'),
('CNESST - Explorer par sujet', 'https://www.centredoc.cnesst.gouv.qc.ca/explorer-par-sujet', 'cnesst', true, 'Navigation thématique SST', 'weekly'),
('CSST - Sélection secteur', 'https://www.csst.qc.ca/prevention/risques/Pages/selectionsecteur.aspx', 'legislation', true, 'Sélection par secteur d''activité', 'weekly'),
('CNESST - Ergonomie', 'https://www.centredoc.cnesst.gouv.qc.ca/explorer-par-sujet/ergonomie', 'cnesst', true, 'Ressources en ergonomie au travail', 'weekly'),
('CNESST - Recherche 1', 'https://www.centredoc.cnesst.gouv.qc.ca/search/87651604-e485-4e67-9a63-87ca83d50979/N-7b088371-325d-4ef0-bb4f-1c0aee9ebe2a', 'cnesst', true, 'Ressource de recherche spécialisée 1', 'monthly'),
('CNESST - Recherche 2', 'https://www.centredoc.cnesst.gouv.qc.ca/search/687f0daf-cddf-4477-af86-645d7699d932/N-a3e7fd94-eab8-4f88-b718-0e5698972035', 'cnesst', true, 'Ressource de recherche spécialisée 2', 'monthly'),
('CNESST - Recherche 3', 'https://www.centredoc.cnesst.gouv.qc.ca/search/b55607ef-e98f-4fc3-b82d-53becc81c77d/N-9fe3d8e5-45a6-4ee0-8614-a532497f7975', 'cnesst', true, 'Ressource de recherche spécialisée 3', 'monthly'),
('CNESST - Recherche 4', 'https://www.centredoc.cnesst.gouv.qc.ca/search/16f43f86-a22a-4469-8498-d787dac0a182/N-1acd4705-dc70-485c-bf6f-e6b960a322f0', 'cnesst', true, 'Ressource de recherche spécialisée 4', 'monthly'),
('CNESST - Recherche 5', 'https://www.centredoc.cnesst.gouv.qc.ca/search/ec0ac9ea-036a-4e23-8f86-c472c4122943/N-4c403cfc-ecc6-4b29-8efe-2a595a3a9fba', 'cnesst', true, 'Ressource de recherche spécialisée 5', 'monthly'),
('CNESST - Recherche 6', 'https://www.centredoc.cnesst.gouv.qc.ca/search/4b58f526-6b87-4b44-8f18-624f60d5b026/N-f905b966-26db-4e4b-a0b0-166d29992cfb', 'cnesst', true, 'Ressource de recherche spécialisée 6', 'monthly'),
('CNESST - Recherche 7', 'https://www.centredoc.cnesst.gouv.qc.ca/search/5ad7fe86-e342-4e65-acc8-7546aefa4da3/N-cf391d31-9140-4877-8e8b-f209398ab460', 'cnesst', true, 'Ressource de recherche spécialisée 7', 'monthly'),
('CNESST - Recherche 8', 'https://www.centredoc.cnesst.gouv.qc.ca/search/ee0962b9-16bc-4bb1-ac68-3a9718884ba0/N-6f0e9457-a579-4715-8377-5cbcb873b4cd', 'cnesst', true, 'Ressource de recherche spécialisée 8', 'monthly')
ON CONFLICT (url) DO NOTHING;