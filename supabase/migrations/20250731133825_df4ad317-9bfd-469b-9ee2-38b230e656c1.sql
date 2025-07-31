-- Fix the remaining function security warning
-- Update the update_learning_metrics function to have secure search_path

CREATE OR REPLACE FUNCTION public.update_learning_metrics()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
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
$$;