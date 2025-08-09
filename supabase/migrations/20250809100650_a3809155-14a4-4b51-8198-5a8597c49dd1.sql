-- Créer la table pour les données de lésions professionnelles du Québec
CREATE TABLE public.lesions_professionnelles (
  id TEXT PRIMARY KEY,
  annee INTEGER NOT NULL,
  secteur_activite TEXT NOT NULL,
  scian_code TEXT,
  type_lesion TEXT NOT NULL,
  partie_lesee TEXT,
  nature_lesion TEXT,
  genre_blessure TEXT,
  agent_causal TEXT,
  evenement_accident TEXT,
  nb_cas INTEGER DEFAULT 0,
  nb_jours_perdus INTEGER DEFAULT 0,
  cout_total DECIMAL(12,2) DEFAULT 0,
  gravite TEXT CHECK (gravite IN ('Légère', 'Modérée', 'Grave', 'Très grave')),
  province TEXT DEFAULT 'QC',
  source TEXT DEFAULT 'CNESST',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_lesions_secteur_annee ON public.lesions_professionnelles(secteur_activite, annee);
CREATE INDEX idx_lesions_scian_annee ON public.lesions_professionnelles(scian_code, annee);
CREATE INDEX idx_lesions_type_annee ON public.lesions_professionnelles(type_lesion, annee);
CREATE INDEX idx_lesions_gravite ON public.lesions_professionnelles(gravite);

-- Trigger pour mise à jour automatique du timestamp
CREATE TRIGGER update_lesions_updated_at
  BEFORE UPDATE ON public.lesions_professionnelles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS pour permettre la lecture publique (données statistiques)
ALTER TABLE public.lesions_professionnelles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Données de lésions accessibles en lecture" 
  ON public.lesions_professionnelles 
  FOR SELECT 
  USING (true);

-- Permettre l'insertion par les fonctions système (sync Git)
CREATE POLICY "Système peut insérer des données de lésions" 
  ON public.lesions_professionnelles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Système peut mettre à jour des données de lésions" 
  ON public.lesions_professionnelles 
  FOR UPDATE 
  USING (true);