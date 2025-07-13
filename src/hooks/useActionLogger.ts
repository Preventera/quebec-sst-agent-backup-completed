import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActionLog {
  action_type: string;
  component: string;
  details?: any;
  user_id?: string;
  timestamp: string;
  compliance_reference?: string;
}

export const useActionLogger = () => {
  const { toast } = useToast();

  const logAction = useCallback(async (actionLog: Omit<ActionLog, 'timestamp' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        ...actionLog,
        user_id: user?.id || 'anonymous',
        timestamp: new Date().toISOString(),
      };

      // Log to console for development
      console.log('[ACTION LOG]', logEntry);

      // Store in conversation_logs with special context for audit trail
      await supabase.from('conversation_logs').insert({
        user_id: logEntry.user_id,
        agent_name: 'AUDIT_SYSTEM',
        user_message: `Action: ${actionLog.action_type}`,
        agent_response: `Component: ${actionLog.component}`,
        context_data: {
          type: 'action_log',
          ...logEntry
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to log action:', error);
      return false;
    }
  }, []);

  const logComplianceAction = useCallback(async (
    action: string, 
    component: string, 
    article: string,
    details?: any
  ) => {
    await logAction({
      action_type: action,
      component,
      compliance_reference: article,
      details
    });
  }, [logAction]);

  const logAccessibilityEvent = useCallback(async (
    element: string,
    event: string,
    assistiveTech?: string
  ) => {
    await logAction({
      action_type: 'accessibility_event',
      component: element,
      details: {
        event,
        assistive_technology: assistiveTech,
        accessibility_compliant: true
      }
    });
  }, [logAction]);

  return {
    logAction,
    logComplianceAction,
    logAccessibilityEvent
  };
};