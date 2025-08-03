-- Migration DocuGen 2.0: Tables pour Safety Graph et données diagnostiques

-- Table pour les résultats diagnostiques
CREATE TABLE public.diagnostic_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'Général',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  recommendations TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  date_assessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'inventaire des risques
CREATE TABLE public.risk_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  hazard_type TEXT NOT NULL,
  location TEXT NOT NULL,
  severity INTEGER DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  probability INTEGER DEFAULT 1 CHECK (probability >= 1 AND probability <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (severity * probability) STORED,
  control_measures TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'controlled', 'mitigated', 'eliminated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les mesures préventives
CREATE TABLE public.preventive_measures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  description TEXT NOT NULL,
  target_risk TEXT,
  implementation TEXT NOT NULL DEFAULT 'short_term' CHECK (implementation IN ('immediate', 'short_term', 'medium_term', 'long_term')),
  responsible TEXT DEFAULT 'À déterminer',
  cost DECIMAL(10,2) DEFAULT 0,
  effectiveness INTEGER DEFAULT 1 CHECK (effectiveness >= 1 AND effectiveness <= 5),
  priority INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique de conformité
CREATE TABLE public.compliance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type TEXT NOT NULL DEFAULT 'Évaluation générale',
  status TEXT NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'partial')),
  notes TEXT,
  corrective_actions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les actions SCIAN
CREATE TABLE public.scian_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  scian_code TEXT NOT NULL,
  description TEXT NOT NULL,
  mandatory BOOLEAN DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE,
  implemented BOOLEAN DEFAULT false,
  evidence TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scian_actions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour diagnostic_results
CREATE POLICY "Users can view their company diagnostic results" 
ON public.diagnostic_results 
FOR SELECT 
USING (true); -- Pour l'instant, accès libre

CREATE POLICY "Users can insert diagnostic results" 
ON public.diagnostic_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update diagnostic results" 
ON public.diagnostic_results 
FOR UPDATE 
USING (true);

-- Politiques RLS pour risk_inventory
CREATE POLICY "Users can view risk inventory" 
ON public.risk_inventory 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert risk inventory" 
ON public.risk_inventory 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update risk inventory" 
ON public.risk_inventory 
FOR UPDATE 
USING (true);

-- Politiques RLS pour preventive_measures
CREATE POLICY "Users can view preventive measures" 
ON public.preventive_measures 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert preventive measures" 
ON public.preventive_measures 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update preventive measures" 
ON public.preventive_measures 
FOR UPDATE 
USING (true);

-- Politiques RLS pour compliance_history
CREATE POLICY "Users can view compliance history" 
ON public.compliance_history 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert compliance history" 
ON public.compliance_history 
FOR INSERT 
WITH CHECK (true);

-- Politiques RLS pour scian_actions
CREATE POLICY "Users can view SCIAN actions" 
ON public.scian_actions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert SCIAN actions" 
ON public.scian_actions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update SCIAN actions" 
ON public.scian_actions 
FOR UPDATE 
USING (true);

-- Triggers pour updated_at
CREATE TRIGGER update_diagnostic_results_updated_at
BEFORE UPDATE ON public.diagnostic_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_inventory_updated_at
BEFORE UPDATE ON public.risk_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preventive_measures_updated_at
BEFORE UPDATE ON public.preventive_measures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scian_actions_updated_at
BEFORE UPDATE ON public.scian_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_diagnostic_results_company_id ON public.diagnostic_results(company_id);
CREATE INDEX idx_diagnostic_results_risk_level ON public.diagnostic_results(risk_level);
CREATE INDEX idx_risk_inventory_company_id ON public.risk_inventory(company_id);
CREATE INDEX idx_risk_inventory_risk_score ON public.risk_inventory(risk_score);
CREATE INDEX idx_preventive_measures_company_id ON public.preventive_measures(company_id);
CREATE INDEX idx_preventive_measures_priority ON public.preventive_measures(priority);
CREATE INDEX idx_compliance_history_company_id ON public.compliance_history(company_id);
CREATE INDEX idx_scian_actions_company_id ON public.scian_actions(company_id);
CREATE INDEX idx_scian_actions_scian_code ON public.scian_actions(scian_code);