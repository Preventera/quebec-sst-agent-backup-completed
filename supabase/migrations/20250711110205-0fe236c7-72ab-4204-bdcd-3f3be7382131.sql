-- Créer les tables pour le système d'apprentissage des agents

-- Table des logs de conversations
CREATE TABLE public.conversation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  user_message TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des annotations de réponses
CREATE TABLE public.response_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_log_id UUID NOT NULL REFERENCES public.conversation_logs(id) ON DELETE CASCADE,
  is_compliant BOOLEAN NOT NULL,
  annotation_notes TEXT,
  annotated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des métriques d'apprentissage
CREATE TABLE public.learning_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  total_annotations INTEGER NOT NULL DEFAULT 0,
  compliant_responses INTEGER NOT NULL DEFAULT 0,
  accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_metrics ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour conversation_logs
CREATE POLICY "Users can view their own conversation logs"
ON public.conversation_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation logs"
ON public.conversation_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation logs"
ON public.conversation_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Politiques RLS pour response_annotations
CREATE POLICY "Users can view annotations for their logs"
ON public.response_annotations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_logs 
    WHERE id = conversation_log_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create annotations for their logs"
ON public.response_annotations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_logs 
    WHERE id = conversation_log_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update annotations for their logs"
ON public.response_annotations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_logs 
    WHERE id = conversation_log_id AND user_id = auth.uid()
  )
);

-- Politiques RLS pour learning_metrics (lecture publique pour les stats globales)
CREATE POLICY "Anyone can view learning metrics"
ON public.learning_metrics
FOR SELECT
USING (true);

CREATE POLICY "Admins can update learning metrics"
ON public.learning_metrics
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Fonction pour mettre à jour les métriques d'apprentissage
CREATE OR REPLACE FUNCTION public.update_learning_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer ou mettre à jour les métriques pour l'agent concerné
  INSERT INTO public.learning_metrics (agent_name, total_annotations, compliant_responses, accuracy_percentage, last_updated)
  SELECT 
    cl.agent_name,
    COUNT(ra.id) as total_annotations,
    SUM(CASE WHEN ra.is_compliant THEN 1 ELSE 0 END) as compliant_responses,
    CASE 
      WHEN COUNT(ra.id) > 0 THEN 
        ROUND((SUM(CASE WHEN ra.is_compliant THEN 1 ELSE 0 END)::DECIMAL / COUNT(ra.id)) * 100, 2)
      ELSE 0 
    END as accuracy_percentage,
    now() as last_updated
  FROM public.conversation_logs cl
  JOIN public.response_annotations ra ON cl.id = ra.conversation_log_id
  WHERE cl.agent_name = (
    SELECT agent_name FROM public.conversation_logs WHERE id = COALESCE(NEW.conversation_log_id, OLD.conversation_log_id)
  )
  GROUP BY cl.agent_name
  ON CONFLICT (agent_name) 
  DO UPDATE SET
    total_annotations = EXCLUDED.total_annotations,
    compliant_responses = EXCLUDED.compliant_responses,
    accuracy_percentage = EXCLUDED.accuracy_percentage,
    last_updated = EXCLUDED.last_updated;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour les métriques automatiquement
CREATE TRIGGER update_learning_metrics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.response_annotations
  FOR EACH ROW EXECUTE FUNCTION public.update_learning_metrics();

-- Fonction pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les timestamps
CREATE TRIGGER update_conversation_logs_updated_at
  BEFORE UPDATE ON public.conversation_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_response_annotations_updated_at
  BEFORE UPDATE ON public.response_annotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer des agents par défaut dans learning_metrics
INSERT INTO public.learning_metrics (agent_name) VALUES
  ('Hugo'),
  ('DiagSST'),
  ('LexiNorm'),
  ('Prioris'),
  ('Sentinelle'),
  ('DocuGen'),
  ('CoSS'),
  ('ALSS')
ON CONFLICT (agent_name) DO NOTHING;