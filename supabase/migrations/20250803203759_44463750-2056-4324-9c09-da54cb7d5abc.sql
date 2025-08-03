-- Insertion des sources SST québécoises recommandées

-- 1. Réglementations et normes québécoises
INSERT INTO public.sst_sources (name, url, source_type, crawl_frequency) VALUES
('LSST - Loi sur la santé et la sécurité du travail', 'https://www.legisquebec.gouv.qc.ca/fr/ShowDoc/cs/S-2.1', 'legislation', 2592000), -- mensuel
('RSST - Règlement sur la SST', 'https://www.legisquebec.gouv.qc.ca/fr/showdoc/cr/S-2.1%2C%20r.%2013', 'legislation', 2592000), -- mensuel
('Code du bâtiment du Québec - Chapitre V', 'https://www.rbq.gouv.qc.ca/lois-reglements-et-codes/code-de-construction-et-code-de-securite/code-de-construction/', 'regulation', 2592000), -- mensuel
('Normes CSA en SST', 'https://www.csagroup.org/fr/normes/domaines-dintervention/securite-des-employes-et-du-public/', 'standard', 31536000), -- annuel

-- 2. Documentation technique - CNESST
('CNESST - Prévention par secteur d''activité', 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/informations-prevention/prevention-par-secteur-dactivite', 'cnesst', 7776000), -- trimestriel
('CNESST - Outil d''identification des risques', 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/organiser-prevention/faire-un-programme-prevention/outil-didentification-risques', 'cnesst', 7776000), -- trimestriel
('CNESST - Analyser les risques dans le milieu de travail', 'https://www.cnesst.gouv.qc.ca/fr/prevention-securite/organiser-prevention/faire-un-programme-prevention/analyser-risques-milieu-travail', 'cnesst', 7776000), -- trimestriel
('CNESST - Statistiques annuelles 2024', 'https://www.cnesst.gouv.qc.ca/fr/organisation/documentation/formulaires-publications/statistiques-annuelles', 'cnesst', 7776000), -- trimestriel
('CNESST - Orientations en imputation', 'https://www.cnesst.gouv.qc.ca/sites/default/files/publications/orientations-en-imputation.pdf', 'cnesst', 7776000), -- trimestriel
('CNESST - Imputation du coût des prestations', 'https://www.cnesst.gouv.qc.ca/fr/demarches-formulaires/employeurs/assurance-sante-securite-travail/tarification/imputation-cout-prestations-liees-aux-lesions', 'cnesst', 7776000), -- trimestriel

-- 3. Recherches et outils - IRSST
('IRSST - Publications et Outils', 'https://www.irsst.qc.ca/publications-et-outils/accueil', 'irsst', 7776000), -- trimestriel

-- 4. Documentation sectorielle - ASP
('ASP Construction - Procédures sécuritaires espaces clos', 'https://asp-construction.org/formations/nos-formations/formation/procedures-securitaires-pour-les-travaux-en-espace-clos', 'asp', 7776000), -- trimestriel

-- 5. Matrices de risques et données économiques
('SCIAN Canada 2017 - Classification industrielle', 'https://www23.statcan.gc.ca/imdb/p3VD_f.pl?Function=getVD&TVD=1181553', 'classification', 31536000); -- annuel

-- Mise à jour du crawler pour gérer les nouveaux types de sources
-- Ajout de métadonnées pour améliorer l'extraction
UPDATE public.sst_sources 
SET source_type = CASE 
  WHEN name LIKE '%LSST%' OR name LIKE '%RSST%' THEN 'legislation'
  WHEN name LIKE '%Code du bâtiment%' THEN 'regulation'
  WHEN name LIKE '%CSA%' THEN 'standard'
  WHEN name LIKE '%CNESST%' THEN 'cnesst'
  WHEN name LIKE '%IRSST%' THEN 'irsst'
  WHEN name LIKE '%ASP%' THEN 'asp'
  WHEN name LIKE '%SCIAN%' THEN 'classification'
  ELSE source_type
END;